# Nerd Logistics — Shipment Tracking Dashboard

A responsive logistics web app with two experiences: a public page where anyone can track a shipment, and a staff dashboard for managing shipments and customer enquiries.

```
Customer → Track Shipment → Understand Status → View Journey → Submit Enquiry
Staff    → Login → Dashboard → Manage Shipments → Manage Enquiries → Analytics
```

![Customer tracking page](public/readme/customer-home.png)

---

## 1. Overview

The customer side answers one question as fast as possible — *where is my parcel?* — without requiring an account: enter a tracking number, get a clear status, a journey timeline, and a way to raise an enquiry if something's wrong.

The staff side is an internal operations tool: sign in, see what needs attention at a glance, find and manage shipments, keep the tracking history honest, and clear the enquiry queue.

## 2. Frontend Architecture

```
src/
├── app/
│   ├── page.tsx                      # Customer tracking (public)
│   ├── not-found.tsx
│   └── staff/                        # Protected — behind StaffAuthProvider
│       ├── page.tsx                  # Login
│       ├── dashboard/
│       ├── shipments/                # list · [trackingNumber] · new
│       ├── enquiries/
│       └── analytics/
├── components/
│   ├── customer/                     # Tracking search, result, enquiry form
│   ├── shipments/                    # Status stepper + timeline (shared by both experiences)
│   ├── staff/                        # Sidebar, CRUD panels, delivery-performance chart
│   └── ui/                           # Button, Logo, StatusBadge, Pagination, InfoField
├── providers/                        # QueryProvider (TanStack Query), StaffAuthProvider (session)
├── api/                              # Axios client, per-resource API functions, query keys, transport types
├── hooks/                            # One TanStack Query hook per operation — the only thing components call
├── lib/                              # Formatting, status-tone mapping, CSV export, tracking-number format check
└── types/                            # Shared TypeScript domain models
```

No component calls `axios` or `fetch` directly, and none reach into raw data — every read and write goes through a **hook** in `hooks/`, which owns a TanStack Query query/mutation and calls into `api/` for the actual HTTP request. That boundary is what let the whole app move from in-memory mock data to the real backend without any component's *interface* changing — see [§6](#6-api-integration) for the full map.

## 3. Customer Experience

A single search box is the whole entry point. Submitting an empty field or an obviously malformed tracking number is caught before anything is looked up; a valid one shows a loading state and then either the shipment or an explicit "not found" message — never a raw error.

A found shipment shows its status in plain language with a distinct icon and colour (never colour alone), origin/destination, current location, ETA — including a struck-through previous ETA when it's changed — and key details (service, packages, reference). Below that, a chronological timeline shows every event with a timestamp, location and message, the latest one clearly marked, with a proper empty state if the shipment has no events yet.

| State | Treatment |
|---|---|
| In transit | Progress stepper, current location, ETA |
| Delivered | Confirms completion and shows the delivered event/date |
| Delayed | Visible delay flag, explanatory note, updated ETA |
| Exception | Distinct warning colour + plain-language explanation |

A collapsible enquiry form (tracking number, category, message) lets a customer flag a problem without leaving the page. Every screen is responsive down to a single mobile column, with no horizontal scrolling anywhere, including the timeline.

## 4. Staff Experience

| Area | What it does |
|---|---|
| Authentication | Sign in with seeded credentials; explicit identity + sign-out in the sidebar; expired/missing sessions redirect to login with a clear reason |
| Dashboard | Status counts, a delivery-performance chart, and the full order list in one view |
| Shipment list | Search by tracking number, filter by status, responsive table/card view |
| Create shipment | Full intake form with required-field validation and duplicate-tracking-number protection |
| Edit shipment | Update route/ETA/service details without ever touching tracking history |
| Status updates | Move a shipment to a new status — it's recorded as a tracking event, so the badge and the timeline can never disagree |
| Tracking events | Append a custom, customer-visible update to the history (append-only, never overwritten) |
| Internal notes | Staff-only notes, visually distinct from the public timeline so the two are never confused |
| Enquiries | Review, resolve and reopen customer enquiries, linked back to their shipment |
| Analytics | Delivery-performance trend with a real date picker, plus a fleet-wide status breakdown |

The sidebar (Dashboard / Orders / Enquiries / Analytics) is fixed to the viewport and never scrolls on its own, on any screen size — the page content scrolls past it.

![Staff dashboard](public/readme/staff-dashboard.png)

## 5. UX & Design

- A calm, customer-first tracking experience; a denser, operations-focused staff interface — deliberately different registers for two different audiences.
- One consistent colour system: the brand indigo for the customer site, a dedicated navy for every staff action, and a distinct colour per shipment status (no two ever share a colour, and none relies on colour alone — every status also has its own icon and label).
- Loading, empty, error and success states are treated as first-class UI, not an afterthought — search, forms, and every staff action all have one.
- Semantic HTML, labelled form controls, visible focus states and keyboard-operable controls throughout.
- Consistent spacing, typography and iconography (Lucide) across both experiences.
- Motion is restrained and functional — entrance transitions, a collapsible panel, a calendar popover — never decorative for its own sake.

## 6. API Integration

```
Component
 ↓
Hook            (hooks/useXxx.ts)     — TanStack Query: loading/error/caching/refetch/invalidation
 ↓
API function    (api/shipments.ts, ...) — Axios call, normalizes failures into ApiError
 ↓
apiClient       (api/client.ts)       — axios instance, withCredentials: true, baseURL "/api"
 ↓  same-origin HTTP
Next.js rewrite (next.config.ts)      — proxies /api/:path* to the Express API
 ↓
Backend         (server/)
```

The frontend runs entirely on the real backend — there is no runtime mock data left. Every screen's read/write goes through a TanStack Query hook (customer: `useTrackingLookup`, `useSubmitEnquiry`; staff: `useSession`/`useLogin`/`useLogout`, `useStaffShipments`, `useStaffShipmentDetail`, `useCreateShipment`, `useUpdateShipment`, `useChangeShipmentStatus`, `useAddTrackingEvent`, `useAddInternalNote`, `useStaffEnquiries`, `useUpdateEnquiryStatus`, `useDashboard`, `useDeliveryPerformance`), which owns that operation's caching, invalidation and error normalization.

The staff session is an httpOnly cookie set by the backend (`ns_session`) — the frontend never stores a token itself, just sends the cookie automatically via `withCredentials: true`.

**Environment variables (`web/.env.local`, all optional locally):**

| Variable | Default | Purpose |
|---|---|---|
| `API_ORIGIN` | `http://127.0.0.1:4000` | Server-side only — where the Next.js rewrite (`next.config.ts`) proxies `/api/:path*` to. Set this in production to the deployed API's internal address. |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | Overrides the Axios client's base URL directly, bypassing the rewrite. Only needed if the API is ever called from a different origin than the one serving the frontend. |

Running the app against real data locally needs both workspaces up — see the root [`README.md`](../README.md) Quick start (`npm run dev` runs web on `:3000` and the API on `:4000` together via the rewrite).

The full operation ↔ endpoint ↔ hook ↔ consumer map — including cache-invalidation behaviour and the couple of deliberate scope decisions (e.g. the delivery-performance chart fetching one default window) — is written out in [`../requirement/api-integration.md`](../requirement/api-integration.md), kept as a separate document so this README stays a frontend README. The backend's own route/payload/validation contract is documented in [`server/README.md`](../server/README.md).

## 7. Testing

Automated tests use **Vitest** + **React Testing Library**. The API layer itself is never hit over the network in tests — every test mocks at the `api/*.ts` function boundary (`vi.mock("@/api", ...)`), so hooks and components are exercised against the real TanStack Query lifecycle (loading → success/error, cache writes, invalidation) without needing a running backend or a network-mocking library.

| Test | Covers |
|---|---|
| `hooks/__tests__/useGetTrackingDetail.test.ts` | Disabled until a tracking number is given; success; a 404 surfaces as `ApiError.isNotFound` |
| `hooks/__tests__/useTrackingLookup.test.ts` | Full idle → loading → found/not-found/error state machine, and `reset()` |
| `hooks/__tests__/useSubmitEnquiry.test.ts` | Mutation success and backend-rejection states |
| `hooks/__tests__/useStaffShipments.test.ts` | Paginated list query, and re-querying when params (e.g. page) change |
| `hooks/__tests__/useChangeShipmentStatus.test.ts` | Mutation writes its response straight into the shipment-detail cache |
| `components/customer/__tests__/EnquiryPanel.test.tsx` | Validation error, success message, and a backend-failure message — full component + mutation integration |
| `components/staff/__tests__/UpdateStatusPanel.test.tsx` | Rejects a no-op status change client-side; submits and shows success; shows an inline error on backend failure |
| `providers/__tests__/StaffAuthProvider.test.tsx` | Login rejects incorrect credentials; distinguishes an expired session from a missing one (`SESSION_EXPIRED` vs `UNAUTHENTICATED`); logout clears the session |
| `components/customer/__tests__/TrackingSearch.test.tsx` | Empty/invalid submissions are blocked with an inline error; a valid tracking number calls through; the loading state disables the control |

```bash
npm test          # run once
npm run test:watch  # watch mode while developing
```

## 8. Key Decisions

| Decision | Reason |
|---|---|
| Architecture | Components never call Axios/fetch directly — every operation is a TanStack Query hook in `hooks/`, backed by a typed function in `api/`, so the data layer, cache and error handling live in one predictable place per operation |
| Auth | The real staff session is an httpOnly cookie the backend controls; `StaffAuthProvider` wraps it behind the exact interface the old mock exposed, so nothing downstream (`RouteGuard`, `StaffSidebar`, the login page) needed to change |
| UI approach | Two distinct visual registers (calm/customer vs. dense/operations) sharing one design-token system, so they stay consistent without looking identical |
| Status system | Every shipment status has its own colour *and* icon *and* label — never colour alone |
| Responsive strategy | Desktop tables become mobile cards; the staff sidebar collapses into a top bar + menu below `lg` |
| Testing | Mocks at the `api/` boundary rather than the network layer, so hooks are tested against the real TanStack Query lifecycle (loading/error/cache/invalidation) without a running backend |

## 9. Key Packages

| Package | Purpose |
|---|---|
| Next.js | App Router, routing, build/deploy, image and font optimisation |
| React | UI runtime |
| TanStack Query | The full API lifecycle — loading, error, caching, refetching, invalidation, mutations |
| Axios | HTTP client for every call to the backend |
| Tailwind CSS v4 | Utility-first styling and the design-token system |
| Motion | Page/element transitions, the calendar popover, the expand-chart modal |
| Lucide React | Icon set used throughout both experiences |

## 10. Trade-offs

| Trade-off | Why |
|---|---|
| Status change *is* a tracking event, not a separate concept | Keeps the badge and the timeline provably impossible to disagree, at the cost of a slightly less "obvious" data model |
| One shared `Button`/`CollapsiblePanel` with a tone override, instead of separate staff/customer components | Avoids duplicating every interactive primitive, at the cost of a small tone prop threaded through |
| Delivery-performance chart fetches one default window and doesn't refetch on calendar month navigation | The calendar only lets you pick among dates the backend's default window actually returned; a real "any month" picker would need the query params to follow the calendar, which wasn't required to move the chart off mock data |
| Dashboard/shipments lists are server-paginated instead of holding every shipment in memory | The backend caps list responses at 100 rows; a "load everything client-side" model stops working the moment the seed dataset grows past a demo size |

## 11. Additional Features

- **Analytics page** — a dedicated view beyond the dashboard's glance, with its own status breakdown and the same delivery-performance panel.
- **Delivery performance** — a real month calendar (past dates with data are selectable, others are visibly disabled rather than hidden) and an expandable chart view.
- **CSV export** — download the currently filtered shipment list straight from the dashboard.
- **Live status badges** — an open-enquiry count and an exceptions-needing-attention card update automatically as data changes.
- **Sortable, filterable order list** — on both the dashboard and the full shipments page.

## 12. Demo

| | |
|---|---|
| Customer (public) | https://nerd-project-web.vercel.app |
| Staff | https://nerd-project-web.vercel.app/staff |
| Staff login | `staff@shiptrack.com` / `demo1234` |
| Demo tracking numbers | `TRK-DEMO-001` (in transit) · `TRK-DEMO-002` (delivered) · `TRK-DEMO-003` (delayed) · `TRK-DEMO-004` (exception) · `TRK-DEMO-005` (collected) · `TRK-DEMO-006` (just created, no events yet) |

## 13. Task Alignment

```
Customer Tracking
        +
Staff Operations
        +
Responsive UX
        +
API Integration
        +
Testing
```
