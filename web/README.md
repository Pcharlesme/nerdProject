# NerdLogistics — Frontend

The Next.js app behind NerdLogistics: a public shipment-tracking page and a staff dashboard, both against the real API in [server/](../server). Product overview, demo links and setup live in the [root README](../README.md) — this document is the frontend's own architecture, UX and testing reference.

![Customer tracking page](public/readme/customer-home.png)

## 1. Frontend architecture

```
src/
├── app/
│   ├── page.tsx                      # Customer tracking (public)
│   └── staff/                        # Protected — behind StaffAuthProvider
│       ├── page.tsx                  # Login
│       ├── dashboard/  shipments/  enquiries/  analytics/
├── components/
│   ├── customer/                     # Tracking search, result, enquiry form
│   ├── shipments/                    # Status stepper + timeline (shared by both experiences)
│   ├── staff/                        # Sidebar, client panels, delivery-performance chart
│   └── ui/                           # Button, Logo, StatusBadge, Pagination, InfoField
├── providers/                        # QueryProvider (TanStack Query), StaffAuthProvider (session)
├── api/                              # Axios client + interceptors, one module per domain, token store
├── hooks/                            # TanStack Query hooks, one file per domain (auth, shipments, enquiries, dashboard)
├── lib/                              # Formatting, status-tone mapping, CSV export, tracking-number format check
└── types/                            # Shared TypeScript domain models
```

No component calls `axios` or `fetch` directly. Every read and write goes through a **hook** in `hooks/`, which owns a TanStack Query query/mutation and calls into `api/` for the actual HTTP request — that boundary is what let this app move from mock data to the real backend without any component's interface changing.

## 2. Customer experience

A single search box is the entry point. An empty or malformed tracking number is caught before anything is looked up; a valid one shows a loading state, then either the shipment or an explicit "not found" message — never a raw error.

A found shipment shows status in plain language with a distinct icon *and* colour (never colour alone), origin/destination, current location, ETA — with a struck-through previous ETA when it's changed — and key details (service, packages, reference). Below that, a chronological timeline shows every event with a timestamp, location and message, latest one marked, with a proper empty state if there are none yet.

| State | Treatment |
|---|---|
| In transit | Progress stepper, current location, ETA |
| Delivered | Confirms completion, shows the delivered event/date |
| Delayed | Visible delay flag, explanatory note, updated ETA |
| Exception | Distinct warning colour + plain-language explanation |

A collapsible enquiry form (tracking number, category, message) lets a customer flag a problem without leaving the page. Every screen is responsive down to a single mobile column, no horizontal scrolling anywhere — including the timeline.

## 3. Staff experience

| Area | What it does |
|---|---|
| Authentication | Sign in with seeded credentials; identity + sign-out in the sidebar; expired/missing sessions redirect to login with a reason |
| Dashboard | Status counts, a delivery-performance chart, and the order list in one view |
| Shipment list | Search by tracking number, filter by status, responsive table/card view |
| Create shipment | Full intake form, required-field validation, duplicate-tracking-number protection |
| Edit shipment | Update route/ETA/service details without touching tracking history |
| Status updates | Move a shipment to a new status — recorded as a tracking event, so the badge and the timeline can't disagree |
| Tracking events | Append a customer-visible update to the history (append-only) |
| Internal notes | Staff-only, visually distinct from the public timeline |
| Enquiries | Review, resolve and reopen customer enquiries, linked to their shipment |
| Analytics | Delivery-performance trend with a real date picker, plus a fleet-wide status breakdown |

![Staff dashboard](public/readme/staff-dashboard.png)

## 4. UX & accessibility

- Two deliberately different registers — calm/customer vs. dense/operations — sharing one design-token colour system (`--color-primary`/`--color-cta`).
- Every shipment status has its own colour *and* icon *and* label, never colour alone.
- Loading, empty, error and success states are first-class UI on every screen, not an afterthought.
- Semantic HTML, labelled form controls, visible focus states, keyboard-operable controls throughout.
- Motion is restrained and functional (entrance transitions, a calendar popover) — never decorative for its own sake.

## 5. API integration

```
Component → Hook (hooks/) → API function (api/) → apiClient (axios) → Express API
```

Every screen's read/write goes through a hook — customer: `useTrackingLookup`, `useSubmitEnquiry`; staff: `useSession`/`useLogin`/`useLogout` (`hooks/useAuth.ts`), `useStaffShipments`/`useStaffShipmentDetail`/`useCreateShipment`/`useUpdateShipment`/`useChangeShipmentStatus`/`useAddTrackingEvent`/`useAddInternalNote` (`hooks/useShipments.ts`), `useStaffEnquiries`/`useUpdateEnquiryStatus` (`hooks/useEnquiries.ts`), `useDashboard`/`useDeliveryPerformance` (`hooks/useDashboard.ts`) — each owning that operation's caching, invalidation and error normalisation.

**Auth:** `POST /auth/login` returns a bearer access token in the response body. `api/tokenStore.ts` holds it in memory, mirrored to `sessionStorage` (never `localStorage`) so a same-tab refresh doesn't force a re-login. An axios request interceptor in `api/client.ts` attaches `Authorization: Bearer <token>` to every outgoing request; a response interceptor clears the token and redirects to `/staff` on a 401 for a request that actually carried one — distinguishing "your session died" from an anonymous check. `GET /auth/me` stays the frontend's source of truth for "is there a valid session right now."

**Environment variables** (`web/.env.local`, both optional — see [`web/.env.example`](.env.example)):

| Variable | Purpose |
|---|---|
| `API_ORIGIN` | Server-side only — where the Next.js rewrite (`next.config.ts`) proxies `/api/:path*` in local dev. |
| `NEXT_PUBLIC_API_BASE_URL` | Overrides the Axios client's base URL directly. In production this points at the deployed API's own origin, since the frontend and API are separate deployments. |

## 6. Performance

The customer landing page ships as close to zero unnecessary work as practical:

- **Server-rendered hero.** `app/page.tsx` has no `"use client"` at all — the entire hero is in the first HTML response, nothing to hydrate before it's visible. The only client components are `GridBackground` (a decorative cursor-following texture, driven by a ref + `requestAnimationFrame`, never React state) and `TrackingLanding` (the search box + results).
- **No entrance animations on load** — the previous version faded in text and ran a looping animated gradient; both were permanent main-thread work for a decorative effect, both removed.
- **Fixed a 1MB favicon** — re-encoded with `sharp` to 3.5KB, pixel-identical; Lighthouse's throttling model weighted that download heavily against perceived load time.
- **Stopped prefetching `/staff`** from the landing page's nav link — a background fetch for a route almost no visitor on `/` follows.

**Before → after** (Lighthouse, mobile emulation, production build):

| Metric | Before | After |
|---|---|---|
| Performance score | 70 | 100 |
| First Contentful Paint | 1.4 s | 0.8 s |
| Largest Contentful Paint | 4.4 s | 1.6 s |
| Total Blocking Time | — | 30 ms |
| Cumulative Layout Shift | — | 0 |

Desktop preset scores 100 (LCP 0.6s) on the same build.

## 7. Testing

Vitest + React Testing Library. The API layer is never hit over the network — tests mock at the `api/*.ts` function boundary, so hooks and components run against the real TanStack Query lifecycle (loading → success/error, cache writes, invalidation) without a running backend.

| Test | Covers |
|---|---|
| `hooks/__tests__/useGetTrackingDetail.test.ts` | Disabled until a tracking number is given; success; a 404 surfaces as `ApiError.isNotFound` |
| `hooks/__tests__/useTrackingLookup.test.ts` | Full idle → loading → found/not-found/error state machine, and `reset()` |
| `hooks/__tests__/useSubmitEnquiry.test.ts` | Mutation success and backend-rejection states |
| `hooks/__tests__/useStaffShipments.test.ts` | Paginated list query, re-querying when params change |
| `hooks/__tests__/useChangeShipmentStatus.test.ts` | Mutation writes its response straight into the shipment-detail cache |
| `api/__tests__/tokenStore.test.ts` | Token kept in memory + `sessionStorage`, never `localStorage` |
| `api/__tests__/client.test.ts` | `Authorization` header attached only when a token exists; a 401 on a token-bearing request clears it and redirects; an anonymous 401 does neither |
| `components/customer/__tests__/EnquiryPanel.test.tsx` | Validation error, success message, backend-failure message |
| `components/staff/__tests__/UpdateStatusPanel.test.tsx` | Rejects a no-op status change client-side; submits and shows success; shows an inline error on backend failure |
| `providers/__tests__/StaffAuthProvider.test.tsx` | Login rejects incorrect credentials; distinguishes an expired session from a missing one; logout clears it |
| `components/customer/__tests__/TrackingSearch.test.tsx` | Empty/invalid submissions blocked inline; a valid number calls through; loading disables the control |

```bash
npm test            # run once
npm run test:watch  # watch mode
```

## 8. Key decisions

| Decision | Reason |
|---|---|
| Components never call Axios/fetch directly | Every operation is a TanStack Query hook backed by a typed `api/` function, so data-layer, cache and error handling live in one predictable place per operation |
| Domain-oriented hook/API files (`useShipments.ts`, `useEnquiries.ts`, …) | Easier to navigate than one file per HTTP call, without losing the one-hook-per-operation contract each still exports |
| Bearer token in memory + `sessionStorage`, never `localStorage` | Survives a same-tab refresh without the larger XSS exposure window a persistent store would carry |
| Two visual registers, one design-token system | Calm/customer vs. dense/operations stay consistent without looking identical |
| Status = colour + icon + label, never colour alone | Accessibility requirement in the brief |
| Server-paginated lists, not held entirely in memory | The backend caps list responses; this stops working the moment the seed dataset outgrows a demo size |
| Tests mock at the `api/` boundary, not the network layer | Hooks are exercised against the real TanStack Query lifecycle without a running backend or a network-mocking library |

## 9. Key packages

| Package | Purpose |
|---|---|
| Next.js | App Router, routing, build/deploy, image optimisation |
| React | UI runtime |
| TanStack Query | Loading, error, caching, refetching, invalidation, mutations |
| Axios | HTTP client + interceptors |
| Tailwind CSS v4 | Utility-first styling and the design-token system |
| Motion | Page/element transitions, the calendar popover |
| Lucide React | Icon set |

## 10. Trade-offs

| Trade-off | Why |
|---|---|
| Status change *is* a tracking event, not a separate concept | Keeps the badge and the timeline provably impossible to disagree, at the cost of a slightly less "obvious" data model |
| Delivery-performance chart fetches one default window, doesn't refetch on calendar navigation | The calendar only lets you pick among dates the backend's default window returned; a real "any month" picker wasn't required to move the chart off mock data |
| Dashboard/shipments lists are server-paginated | Correct trade-off once the seed dataset (~55 shipments) is past a trivial size |

## 11. Additional features (beyond the brief's minimum)

- A dedicated analytics page beyond the dashboard's glance.
- A real month calendar on the delivery-performance chart (dates without data are visibly disabled, not hidden).
- CSV export of the filtered shipment list from the dashboard.
- Live badges (open-enquiry count, exceptions-needing-attention) that update as data changes.
- In App notification for Customer Enquries
