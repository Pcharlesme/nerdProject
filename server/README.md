# NerdShipping — API (Backend)

The Express/Prisma/PostgreSQL API behind NerdShipping's shipment tracking dashboard. It serves one public read-only tracking endpoint, a public enquiry endpoint, and a session-protected `/staff/*` surface for everything staff do — create/edit shipments, change status, append tracking events and internal notes, and work enquiries. The [web/](../web) app is the only client; this document covers the API on its own. Product overview and demo links live in the [root README](../README.md).

## 1. Overview

```
Customer → GET /api/shipments/:trackingNumber → public, read-only shipment view
Customer → POST /api/enquiries                → public, no shipment auth required
Staff    → POST /api/auth/login               → session cookie
Staff    → /api/staff/*                        → shipments, enquiries, dashboard, analytics — all require the session
```

Everything under `/api/staff` is guarded on the server, not the browser — a request without a valid session is rejected with `401` before it reaches any business logic, regardless of what the frontend does or doesn't show.

## 2. Architecture

```
src/
├── index.ts              bootstrap: connect Prisma, start Express, graceful shutdown on SIGTERM/SIGINT
├── app.ts                middleware stack + router mounting (exported separately so tests build the app without listening on a port)
├── config/env.ts         Joi-validated environment — throws at startup on bad/missing config, never at request time
├── middleware/
│   ├── validate.ts         runs a Joi schema against params/query/body before the controller ever sees the request
│   ├── requireStaff.ts      reads the session cookie (or a bearer token), rejects with 401 if missing/invalid
│   ├── rateLimiters.ts       per-route request caps (see §6)
│   └── errorHandler.ts      turns any thrown error into a safe, consistent JSON response
├── lib/
│   ├── AppError.ts          typed application errors (404/409/422/401/…) with a stable `code`
│   ├── prisma.ts            the Prisma client singleton
│   ├── domain.ts            shared enums/constants (status list, auto-generated status messages)
│   └── validated.ts         typed accessors for a request already sanitised by `validate()`
├── modules/<feature>/     routes → controller → service, one folder per resource
│   ├── auth/                login, logout, "who am I"
│   ├── shipments/            public + staff shipment CRUD, events, notes
│   ├── enquiries/            public submit + staff triage
│   ├── dashboard/            aggregate counts for the staff dashboard
│   └── analytics/            delivery-performance time series
├── seed/                  deterministic demo data + the script that loads it
└── types/express.d.ts     extends Express's `Request` with `req.staff`
```

Every module follows the same shape: **routes** wire an HTTP verb + path to a controller (with `validate()` and, for staff routes, `requireStaff` already applied at the router level in `app.ts`); **controllers** read the validated request and call a **service**; **services** are the only code that talks to Prisma. Public/staff shipment responses are built by two separate functions in `shipment.serializers.ts` — `toPublicShipment` is a hand-written **allow-list**, not a filter over the full record, so a new field added to the database is private by default until someone deliberately exposes it.

## 3. Data model

PostgreSQL via Prisma (`prisma/schema.prisma`), five tables:

| Model | Purpose | Notable fields |
|---|---|---|
| `StaffUser` | one authenticated role, per the brief | `passwordHash` (bcrypt, never serialised) |
| `Shipment` | the core record | `trackingNumber` (unique), 7-value `status` enum, origin/destination city+region, `estimatedDeliveryAt` + `previousEstimatedDeliveryAt` + `etaNote`, sender/receiver contact fields |
| `TrackingEvent` | append-only history | `occurredAt`, `location`, `message`, optional `status` — only present when the event also changed the shipment's status |
| `InternalNote` | staff-only | linked to its author (`StaffUser`), never reachable from a public route |
| `Enquiry` | customer-submitted | 5-value `category` enum, `OPEN`/`RESOLVED` `status` |

Schema changes go through a real migration (`prisma/migrations/`), not `db push` — `npm run db:migrate:dev` creates one locally, `npm run db:migrate` (`prisma migrate deploy`) applies pending ones in production.

## 4. API reference

All responses are JSON. Success: `{ "data": … }` (list endpoints add `"meta": { total, page, limit, totalPages }`). Errors: `{ "error": { "code", "message", "details"?: [{ "field", "message" }] } }`.

| Code | When |
|---|---|
| `VALIDATION_ERROR` (422) | Missing/invalid field — `details[]` names each one |
| `NOT_FOUND` (404) | Unknown tracking number or enquiry id |
| `CONFLICT` (409) | Tracking number already in use |
| `UNAUTHENTICATED` / `SESSION_EXPIRED` / `INVALID_CREDENTIALS` (401) | No session, expired session, or bad login |
| `RATE_LIMITED` (429) | Too many requests from one client (see §6) |
| `INTERNAL_ERROR` / `SERVICE_UNAVAILABLE` (500 / 503) | Unexpected failure or database unreachable — never includes a stack trace |

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | – | Pings the database; used as Render's health check |
| GET | `/api/shipments/:trackingNumber` | – | Public view — no sender/receiver/internal notes/database id |
| POST | `/api/enquiries` | – | `{ trackingNumber, category, message, contactEmail? }`; rate limited |
| POST | `/api/auth/login` | – | `{ email, password }` → sets the `ns_session` cookie; failures are rate limited |
| POST | `/api/auth/logout` | – | Clears the cookie, 204 |
| GET | `/api/auth/me` | staff | Current staff member |
| GET | `/api/staff/dashboard` | staff | Shipment counts by status, 5 most recent, open-enquiry count/preview |
| GET | `/api/staff/analytics/delivery-performance?from=&to=` | staff | Daily on-time rate (delivered ≤ ETA); defaults to the last 14 days, max 92 |
| GET | `/api/staff/shipments?search=&status=&order=&page=&limit=` | staff | `search` matches tracking number **or** reference code |
| POST | `/api/staff/shipments` | staff | 201; tracking number optional (generated if omitted) |
| GET | `/api/staff/shipments/:trackingNumber` | staff | Full record incl. contacts, events, internal notes |
| PATCH | `/api/staff/shipments/:trackingNumber` | staff | Partial update — never touches `events` |
| PATCH | `/api/staff/shipments/:trackingNumber/status` | staff | `{ status, message?, location? }` — writes a timeline event |
| POST | `/api/staff/shipments/:trackingNumber/events` | staff | `{ occurredAt, location, message, status? }` — `occurredAt` must not be in the future |
| POST | `/api/staff/shipments/:trackingNumber/notes` | staff | `{ message }` — author taken from the session, never from the request body |
| GET | `/api/staff/enquiries?status=&page=&limit=` | staff | Newest first |
| PATCH | `/api/staff/enquiries/:id` | staff | `{ status: "OPEN" \| "RESOLVED" }` |

Staff mutations return the updated shipment/enquiry so the caller never needs a second round trip.

## 5. Authentication & security

- **Passwords:** bcrypt, 12 rounds, never returned by any endpoint. A login against an unknown email still runs a bcrypt compare against a fixed placeholder hash, so a wrong-email and a wrong-password response take the same time — one generic `INVALID_CREDENTIALS` either way.
- **Sessions:** a JWT (`HS256`) in an `httpOnly`, `SameSite=Lax`, `Secure`-in-production cookie. The cookie's own expiry deliberately outlives the token's, so an expired token is reported as `SESSION_EXPIRED` (session existed, timed out) rather than indistinguishable from "never logged in."
- **The one rule that matters most:** every `/api/staff/*` route is mounted behind `requireStaff` in `app.ts`, at the router level — not inside individual controllers, where it would be easy to forget on a new route. A hidden frontend page is not a security boundary; this is.
- **Public responses are allow-listed**, not filtered. `toPublicShipment()` only includes the fields explicitly listed in it — a new column on `Shipment` is invisible to the public API until someone deliberately adds it to the serializer, which is a safer default than trying to remember to strip new sensitive fields later.
- **Secrets:** `server/.env` is gitignored; `.env.example` ships placeholders only, with an inline command (`openssl rand -base64 48`) for generating a real `JWT_SECRET`.

## 6. Validation & rate limiting

Every route with user input runs a Joi schema (`validate.ts`) against `params`/`query`/`body` before its controller executes, stripping unknown keys and converting types — the same rule applies whether the request came from the real frontend or `curl`.

Rate limiting (`express-rate-limit`) exists specifically to stop abuse, not just bad input:

| Limiter | Window | Limit | Protects against |
|---|---|---|---|
| `apiLimiter` (all of `/api`) | 15 min | 300 req/IP | General flooding / a basic denial-of-service attempt |
| `loginLimiter` (`/auth/login`) | 15 min | 10 **failed** attempts/IP | Password guessing — successful logins don't count against the limit |
| `enquiryLimiter` (`/enquiries`) | 60 min | 10 req/IP | Spam on the one public write endpoint that needs no login |

All three return a `RATE_LIMITED` (429) body instead of a silent drop, so a legitimate client gets an explainable error rather than a mystery timeout.

## 7. Testing

Vitest + Supertest against a real Postgres (`embedded-postgres`, matching Neon's Postgres 17), with the actual `prisma migrate deploy` applied — not a mocked database.

| File | Covers |
|---|---|
| `public-tracking.test.ts` | Chronological ordering, no leakage of contacts/notes/ids, not-found, malformed input |
| `auth.test.ts` | Hashing, generic invalid-credential error, httpOnly cookie, every staff route 401s without a session, expired vs. forged tokens, logout |
| `shipments.test.ts` | Create (incl. duplicate → 409), edit (history untouched, ETA history kept), status/events (back-filled events don't rewind status, future dates rejected, invalid status rejected), internal notes, list/search/filter/sort/paginate |
| `enquiries.test.ts` | Submit → visible to staff → resolve, unknown tracking number rejected, field validation |
| `analytics.test.ts` | On-time-rate calculation, date-range validation, staff-only |
| `rate-limit.test.ts` | Repeated failed logins get `RATE_LIMITED` |
| `error-handling.test.ts` | Unexpected failures never leak internals; malformed JSON is a clean 422, not a crash |

```bash
npm test --workspace=server        # from the repo root
npm test                           # from server/
```

Set `TEST_DATABASE_URL` to point at an existing Postgres instead of spinning up an embedded one — **its tables are truncated on every run**, so never point it at real data.

## 8. Local setup

Prerequisites: Node 22+, npm 10+, and a [Neon](https://neon.tech) Postgres project (there's no local database — development runs against Neon too).

```bash
npm install                                # from the repo root (npm workspaces)
cp server/.env.example server/.env         # paste Neon URLs, set JWT_SECRET
npm run db:setup --workspace=server        # prisma migrate deploy + seed
npm run dev --workspace=server             # API on :4000
```

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | — | Neon's **pooled** connection string (`-pooler` host) — used at runtime |
| `DIRECT_URL` | yes | — | Neon's **direct** connection string — used only by `prisma migrate` |
| `JWT_SECRET` | yes | — | ≥ 32 characters, signs the session token |
| `JWT_EXPIRES_IN_MINUTES` | no | `480` | Session lifetime |
| `PORT` / `HOST` | no | `4000` / all interfaces | Where the API listens |
| `CORS_ORIGIN` | no | `http://localhost:3000` | Origins allowed to call the API directly (comma-separated) |
| `TRUST_PROXY` | no | `0` | Proxy hops to trust for the client's real IP, so rate limits are per-client, not per-load-balancer |
| `API_RATE_LIMIT_MAX` / `LOGIN_RATE_LIMIT_MAX` / `ENQUIRY_RATE_LIMIT_MAX` | no | `300` / `10` / `10` | See §6 |
| `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD` | no | demo values below | Account created by `db:seed` |

`npm run db:seed --workspace=server` resets the database to the demo dataset at any time (it truncates every table first — deterministic, safe to re-run).

## 9. Deployment: Render + Neon (+ why "AWS" shows up)

```
git push  ──▶  Render (build + deploy, auto on every push)  ──▶  one Node service
                                                                    ├─ next start        (public $PORT)
                                                                    └─ node dist/index.js (127.0.0.1:4000, private)
                                                                          │
                                                                          ▼
                                                                    Neon Postgres (managed)
```

- **Neon manages the database.** It's a hosted, serverless Postgres — connection pooling, branching, and automatic suspend/resume of the compute are Neon's job, not this codebase's. The app just holds two connection strings: `DATABASE_URL` (pooled, for normal queries) and `DIRECT_URL` (direct, because `prisma migrate` needs a non-pooled connection).
- **Prisma is the only thing that touches the database schema.** `prisma/schema.prisma` is the source of truth; every schema change ships as a versioned migration file under `prisma/migrations/`, applied with `prisma migrate deploy` — never an ad-hoc `ALTER TABLE`.
- **"CI/CD" here means Render's own build-and-deploy pipeline**, not a separate GitHub Actions workflow (there isn't one in this repo). `render.yaml` defines it: on every push to the connected branch, Render runs `npm ci --include=dev && npm run build && npm run db:migrate --workspace=server`, then restarts the service — so a schema migration ships automatically with the code that needs it, in the same deploy. This is continuous **deployment**; it is not gated by the test suite (`npm test` is not part of the Render build), so tests still need to be run and green locally/manually before pushing.
- **Where AWS fits in:** neither this app nor Render is configured to call any AWS service directly. Both of the platforms it depends on happen to run their own infrastructure on AWS — Neon's connection hostnames are literally `*.aws.neon.tech`, and `render.yaml` pins the Render service to the `ohio` region specifically because that's the same AWS region (`us-east-2`) Neon's project lives in, keeping the database round-trip inside one data center instead of crossing the country on every query.
- **One service, two processes.** `npm start` at the repo root runs both `next start` (bound to Render's public `$PORT`) and the Express API (bound to `127.0.0.1:4000`, unreachable from outside) via `concurrently --kill-others`; Next rewrites `/api/*` to the local Express process, so the browser only ever talks to one origin and the session cookie stays first-party.

| Setting | Value |
|---|---|
| Build | `npm ci --include=dev && npm run build && npm run db:migrate --workspace=server` |
| Start | `npm start` |
| Health check | `/api/health` (routes through Next to the API, then pings Neon) |
| Region | Ohio (`us-east-2`) — colocated with the Neon project |

**Status:** `render.yaml` is complete and the build/start/health-check settings above have been exercised locally in production mode, but there is currently no confirmed live URL in this repo — the root README still lists the deployment as pending. That's the one item in this document that can't be verified by reading code; see `requirement/backendChecklist.md` item #39.

## 10. Key decisions

| Decision | Reason |
|---|---|
| A status change *is* a tracking event, on one shared code path | The badge and the timeline are structurally incapable of disagreeing — there's only one place either of them is written |
| Only the *newest* event moves current status/location | A staff member back-filling an older event (e.g. logging a collection time after the fact) can't accidentally rewind what the customer currently sees |
| Public serializer is an allow-list, not a filter | A newly added column is private by default; leaking it requires a deliberate code change, not a forgotten one |
| Validation errors return 422 with field-level `details[]`, not a flat 400 string | Matches what the frontend renders next to each input; documented as an intentional refinement over the brief's illustrative shape in `requirement/backend-integration-notes.md` |
| JWT in an httpOnly cookie, cookie outlives the token | Lets the server distinguish "your session expired" from "you were never signed in," which the login screen surfaces differently |
| Rate limiting is in-memory, not Redis-backed | Correct and sufficient for the single Render instance this runs on; would need a shared store if scaled to multiple instances |

## 11. Known limitations

- **Not confirmed live yet** — see §9. Everything else in this README describes what the code does today; only the deployment step is outside the repository's control.
- No automated CI gate — Render's build step migrates and deploys but does not run `npm test`; a red test suite would still deploy today.
- JWTs can't be revoked before they expire (no session store or token version) — a compromised token is valid until its natural expiry.
- CSRF protection relies on `SameSite=Lax` cookies + JSON-only request bodies, not a dedicated CSRF token.
- Rate limiting is per-process/in-memory; horizontal scaling would need a shared store.
- No audit trail of which staff member changed which shipment field (notes do record their author) — listed as an optional stretch idea in the brief, not a defect.

## 12. Demo data

Staff login: `staff@shiptrack.com` / `demo1234` (or whatever `SEED_STAFF_EMAIL`/`SEED_STAFF_PASSWORD` were set to).

| Tracking number | Status | Demonstrates |
|---|---|---|
| `TRK-DEMO-001` | In transit | Several timeline events, live progress |
| `TRK-DEMO-002` | Delivered | Final delivered event with date |
| `TRK-DEMO-003` | Delayed | Updated ETA (previous one kept), explanatory event + internal note |
| `TRK-DEMO-004` | Exception | Distinct issue explanation, internal note |
| `TRK-DEMO-005` | Collected | Only two events — a "just started" shipment |
| `TRK-DEMO-006` | Out for delivery | One stage before delivered |
| `TRK-DEMO-007` | Created | Zero events — the empty-timeline state |

Plus ~45 historical `TRK-HIST-*` deliveries (seeded deterministically) powering the delivery-performance analytics, and 5 fictional enquiries spanning all 5 categories and both `OPEN`/`RESOLVED` states.
