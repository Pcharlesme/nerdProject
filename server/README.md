# NerdShipping — API (Backend)

The Express/Prisma/PostgreSQL API behind NerdShipping's shipment tracking dashboard: one public read-only tracking endpoint, a public enquiry endpoint, and a bearer-token-protected `/staff/*` surface for everything staff do. [web/](../web) is the only client; this document covers the API on its own — product overview and demo links live in the [root README](../README.md).

## 1. Architecture

```
src/
├── index.ts              bootstrap: connect Prisma, start Express, graceful shutdown on SIGTERM/SIGINT
├── app.ts                middleware stack + router mounting (exported separately so tests build the app without listening on a port)
├── config/env.ts         Joi-validated environment — throws at startup on bad config, never at request time
├── middleware/
│   ├── validate.ts         runs a Joi schema against params/query/body before the controller sees the request
│   ├── requireStaff.ts      verifies the bearer access token, rejects with 401 if missing/invalid/expired
│   ├── rateLimiters.ts       per-route request caps (§6)
│   └── errorHandler.ts      turns any thrown error into a safe, consistent JSON response
├── lib/
│   ├── AppError.ts          typed application errors (404/409/422/401/…) with a stable `code`
│   ├── prisma.ts            the Prisma client singleton
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

Every module follows the same shape: **routes** wire an HTTP verb + path to a controller (`validate()` and, for staff routes, `requireStaff` already applied at the router level in `app.ts`); **controllers** read the validated request and call a **service**; **services** are the only code that talks to Prisma. Public and staff shipment responses are built by two separate functions in `shipment.serializers.ts` — `toPublicShipment` is a hand-written **allow-list**, not a filter over the full record, so a new field on the model is private by default until someone deliberately exposes it.

## 2. Data model

PostgreSQL via Prisma (`prisma/schema.prisma`), five tables:

| Model | Purpose | Notable fields |
|---|---|---|
| `StaffUser` | one authenticated role, per the brief | `passwordHash` (bcrypt, never serialised) |
| `Shipment` | the core record | `trackingNumber` (unique), 7-value `status` enum, origin/destination city+region, `estimatedDeliveryAt` + `previousEstimatedDeliveryAt` + `etaNote`, sender/receiver contact fields |
| `TrackingEvent` | append-only history | `occurredAt`, `location`, `message`, optional `status` — only present when the event also changed the shipment's status |
| `InternalNote` | staff-only | linked to its author (`StaffUser`), never reachable from a public route |
| `Enquiry` | customer-submitted | 5-value `category` enum, `OPEN`/`RESOLVED` `status` |

Schema changes go through a real migration (`prisma/migrations/`), never `db push` — `npm run db:migrate:dev` creates one locally, `npm run db:migrate` (`prisma migrate deploy`) applies pending ones in production.

## 3. API reference

All responses are JSON. Success: `{ "data": … }` (list endpoints add `"meta": { total, page, limit, totalPages }`). Errors: `{ "error": { "code", "message", "details"?: [{ "field", "message" }] } }`.

| Code | When |
|---|---|
| `VALIDATION_ERROR` (422) | Missing/invalid field — `details[]` names each one |
| `NOT_FOUND` (404) | Unknown tracking number or enquiry id |
| `CONFLICT` (409) | Tracking number already in use |
| `UNAUTHENTICATED` / `SESSION_EXPIRED` / `INVALID_CREDENTIALS` (401) | No/invalid token, expired token, or bad login |
| `RATE_LIMITED` (429) | Too many requests from one client (§5) |
| `INTERNAL_ERROR` / `SERVICE_UNAVAILABLE` (500 / 503) | Unexpected failure or database unreachable — never a stack trace |

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | – | Pings the database; used as the deploy health check |
| GET | `/api/shipments/:trackingNumber` | – | Public view — no sender/receiver/internal notes/database id |
| POST | `/api/enquiries` | – | `{ trackingNumber, category, message, contactEmail? }`; rate limited |
| POST | `/api/auth/login` | – | `{ email, password }` → `{ accessToken, staff }`; failures are rate limited |
| POST | `/api/auth/logout` | – | Stateless — 204, no server-side session to clear |
| GET | `/api/auth/me` | staff | Current staff member |
| GET | `/api/staff/dashboard` | staff | Shipment counts by status, 5 most recent, open-enquiry count/preview |
| GET | `/api/staff/analytics/delivery-performance?from=&to=` | staff | Daily on-time rate (delivered ≤ ETA); defaults to the last 14 days, max 92 |
| GET | `/api/staff/shipments?search=&status=&order=&page=&limit=` | staff | `search` matches tracking number **or** reference code |
| POST | `/api/staff/shipments` | staff | 201; tracking number optional (generated if omitted) |
| GET | `/api/staff/shipments/:trackingNumber` | staff | Full record incl. contacts, events, internal notes |
| PATCH | `/api/staff/shipments/:trackingNumber` | staff | Partial update — never touches `events` |
| PATCH | `/api/staff/shipments/:trackingNumber/status` | staff | `{ status, message?, location? }` — writes a timeline event |
| POST | `/api/staff/shipments/:trackingNumber/events` | staff | `{ occurredAt, location, message, status? }` — `occurredAt` must not be in the future |
| POST | `/api/staff/shipments/:trackingNumber/notes` | staff | `{ message }` — author taken from the token, never the request body |
| GET | `/api/staff/enquiries?status=&page=&limit=` | staff | Newest first |
| PATCH | `/api/staff/enquiries/:id` | staff | `{ status: "OPEN" \| "RESOLVED" }` |

Staff mutations return the updated shipment/enquiry, so the caller never needs a second round trip.

### Staff account creation (Postman only)

`POST /api/staff/accounts` — staff-only, same `requireStaff` gate as everything else above. Not called by the frontend (no UI for it); it exists so a second staff account can be created without re-running the seed script, which replaces the existing account rather than adding to it.

```
POST /api/staff/accounts
Authorization: Bearer <token>          ← from POST /api/auth/login first
Content-Type: application/json

{ "email": "staff@example.com", "password": "password123", "name": "Staff User" }
```

`201` → `{ data: { id, email, name } }` — never a password hash, never a token for the new account. `409 CONFLICT` on a duplicate email; `422 VALIDATION_ERROR` on a password under 8 characters. Verified end-to-end: rejected without a token, created with one, duplicate/weak-password rejected, and the new account can log in on its own.

## 4. Authentication & security

- **Passwords:** bcrypt, 12 rounds, never returned by any endpoint. A login against an unknown email still runs a bcrypt compare against a fixed placeholder hash, so a wrong-email and a wrong-password response take the same time — one generic `INVALID_CREDENTIALS` either way.
- **Sessions:** a stateless JWT (`HS256`), returned as `accessToken` in the login response body, sent back as `Authorization: Bearer <token>` — no cookie, no server-side session store. An expired token is reported as `SESSION_EXPIRED`, distinct from `UNAUTHENTICATED` (missing/forged/malformed), so the frontend can tell "your session ran out" from "you were never signed in."
- **Why a bearer token, not a cookie:** the frontend and API are deployed as two separate services on two different domains (§7) — a cookie would need cross-site `SameSite=None` handling that modern browsers increasingly block by default. A token in an `Authorization` header has no such restriction and isn't subject to CSRF the way an ambient cookie is, since nothing sends it automatically.
- **The one rule that matters most:** every `/api/staff/*` route is mounted behind `requireStaff` in `app.ts`, at the router level — not inside individual controllers, where it would be easy to forget on a new route. A hidden frontend page is not a security boundary; this is.
- **Public responses are allow-listed**, not filtered. `toPublicShipment()` only includes the fields explicitly listed in it — a new column on `Shipment` is invisible to the public API until someone deliberately adds it to the serializer.
- **Secrets:** `server/.env` is gitignored; `.env.example` ships placeholders only, with an inline command (`openssl rand -base64 48`) for generating a real `JWT_SECRET`.

## 5. Validation & rate limiting

Every route with user input runs a Joi schema (`validate.ts`) against `params`/`query`/`body` before its controller executes — the same rule applies whether the request came from the real frontend or `curl`.

| Limiter | Window | Limit | Protects against |
|---|---|---|---|
| `apiLimiter` (all of `/api`) | 15 min | 300 req/IP | General flooding |
| `loginLimiter` (`/auth/login`) | 15 min | 10 **failed** attempts/IP | Password guessing — successful logins don't count |
| `enquiryLimiter` (`/enquiries`) | 60 min | 10 req/IP | Spam on the one public write endpoint that needs no login |

All three return a `RATE_LIMITED` (429) body instead of a silent drop.

## 6. Testing

Vitest + Supertest against a real Postgres (`embedded-postgres`, matching Neon's Postgres 17), with `prisma migrate deploy` actually applied — not a mocked database.

| File | Covers |
|---|---|
| `public-tracking.test.ts` | Chronological ordering, no leakage of contacts/notes/ids, not-found, malformed input |
| `auth.test.ts` | Hashing, generic invalid-credential error, bearer token issued on login, every staff route 401s without one, expired vs. forged tokens, logout |
| `shipments.test.ts` | Create (incl. duplicate → 409), edit (history untouched, ETA history kept), status/events (back-filled events don't rewind status, future dates rejected, invalid status rejected), internal notes, list/search/filter/sort/paginate |
| `enquiries.test.ts` | Submit → visible to staff → resolve, unknown tracking number rejected, field validation |
| `analytics.test.ts` | On-time-rate calculation, date-range validation, staff-only |
| `rate-limit.test.ts` | Repeated failed logins get `RATE_LIMITED` |
| `error-handling.test.ts` | Unexpected failures never leak internals; malformed JSON is a clean 422, not a crash |

```bash
npm test --workspace=server   # from the repo root
npm test                      # from server/
```

Set `TEST_DATABASE_URL` to point at an existing Postgres instead of spinning up an embedded one — **its tables are truncated on every run**, so never point it at real data.

## 7. Local setup & deployment

Prerequisites: Node 22+, npm 10+, and a [Neon](https://neon.tech) Postgres project (no local database needed — dev runs against Neon too).

```bash
npm install                                # from the repo root (npm workspaces)
cp server/.env.example server/.env         # paste Neon URLs, set JWT_SECRET

npm run dev --workspace=server             # API on :4000
```

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | yes | — | Neon's **pooled** connection string (`-pooler` host) — runtime queries |
| `DIRECT_URL` | yes | — | Neon's **direct** connection string — used only by `prisma migrate` |
| `JWT_SECRET` | yes | — | ≥ 32 characters, signs the access token |
| `JWT_EXPIRES_IN_MINUTES` | no | `480` | Token lifetime |
| `PORT` / `HOST` | no | `4000` / all interfaces | Where the API listens |
| `CORS_ORIGIN` | no | `http://localhost:3000` | Origins allowed to call the API (comma-separated — the deployed frontend's origin, in production) |
| `TRUST_PROXY` | no | `0` | Proxy hops to trust for the client's real IP, so rate limits are per-client |
| `API_RATE_LIMIT_MAX` / `LOGIN_RATE_LIMIT_MAX` / `ENQUIRY_RATE_LIMIT_MAX` | no | `300` / `10` / `10` | See §5 |
| `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD` | no | demo values, §8 | Account created by `db:seed` |

**Deployment:** the API is deployed to [Render](https://render.com) as a standalone Node service (build: `npm ci && npm run build && npm run db:migrate`, start: `npm start`); the frontend is deployed separately to [Vercel](https://vercel.com). Neon hosts Postgres. Because the two services live on different domains, the frontend calls the API cross-origin — which is exactly why auth is a bearer token rather than a cookie (§4). `render.yaml` pins the region to `us-east-2` (Ohio), matching Neon's project region, so the database round trip doesn't cross the country on every query.

## 8. Demo data

Staff login: `staff@shiptrack.com` / `demo1234` (or whatever `SEED_STAFF_EMAIL`/`SEED_STAFF_PASSWORD` were set to). Tracking numbers: see the [root README](../README.md#demo-data).

`npm run db:seed --workspace=server` resets the database to the demo dataset at any time — it truncates every table first, so it's deterministic and safe to re-run.

## 9. Key decisions

| Decision | Reason |
|---|---|
| A status change *is* a tracking event, on one shared code path | The badge and the timeline are structurally incapable of disagreeing — there's only one place either of them is written |
| Only the *newest* event moves current status/location | A staff member back-filling an older event (e.g. logging a collection time after the fact) can't accidentally rewind what the customer currently sees |
| Public serializer is an allow-list, not a filter | A newly added column is private by default; leaking it requires a deliberate code change, not a forgotten one |
| Validation errors return 422 with field-level `details[]`, not a flat 400 string | Matches what the frontend renders next to each input |
| Bearer token instead of a cookie | The frontend and API are on different domains in production — a cookie is unreliable there regardless of `SameSite`/`Secure` configuration |
| Rate limiting is in-memory, not Redis-backed | Correct and sufficient for a single API instance; would need a shared store if scaled horizontally |

