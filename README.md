# NerdLogistics — Shipment Tracking Dashboard

A logistics web app with two experiences: a public page where anyone can track a shipment, and a staff dashboard for managing shipments and customer enquiries. Built as a one-week take-home task — see [`requirement/Software Developer Task.pdf`](requirement/Software%20Developer%20Task.pdf) for the brief.

```
Customer → Track Shipment → Understand Status → View Journey → Submit Enquiry
Staff    → Login → Dashboard → Manage Shipments → Manage Enquiries → Analytics
```

## Live deployment

| | |
|---|---|
| Customer (public) | _pending — not yet deployed, see [server/README.md §9](server/README.md#9-deployment-render--neon--why-aws-shows-up)_ |
| Staff | _pending_ |
| Demo staff login | `staff@shiptrack.com` / `demo1234` |
| Demo tracking numbers | `TRK-DEMO-001`–`007` — see [server/README.md §12](server/README.md#12-demo-data) for what each one demonstrates |

## Repository structure

```
├── web/          Next.js frontend — customer tracking page + staff dashboard
├── server/       Express + Prisma + PostgreSQL API
└── requirement/  The task brief, and this project's own review checklists
```

This is an npm workspace monorepo (`web`, `server`). Each workspace has its own detailed README:

- **[`web/README.md`](web/README.md)** — architecture, customer/staff UX, testing (Vitest + Testing Library), key decisions.
- **[`server/README.md`](server/README.md)** — API reference, data model, authentication/security, testing (Vitest + Supertest against a real Postgres), deployment.

## Quick start

```bash
npm install                                # installs both workspaces
cp server/.env.example server/.env         # fill in a Neon Postgres URL + JWT_SECRET
npm run db:setup --workspace=server        # migrate + seed demo data
npm run dev                                # web on :3000, API on :4000
```

Full prerequisites and environment variables are in `server/README.md` §8.

## Testing

```bash
npm test          # runs both workspaces' test suites
npm run test:web
npm run test:server
```

## Assumptions & known limitations

The two workspace READMEs each document their own decisions and trade-offs in detail (`web/README.md` §8/§10, `server/README.md` §10/§11). At the project level:

- The frontend currently runs on an in-memory mock data layer shaped to match the backend's real API contract one-for-one (documented in [`requirement/backend-integration-notes.md`](requirement/backend-integration-notes.md)) — wiring the frontend to actually call the now-working backend is the next step, not yet done.
- The backend itself is fully built, tested (45 automated tests against a real Postgres instance), and has been run and smoke-tested end-to-end locally, including in production mode (`npm start`) — but has not yet been deployed to a public URL.
- This project's own review checklists — [`requirement/customerChecklist.md`](requirement/customerChecklist.md), [`requirement/staffChecklist.md`](requirement/staffChecklist.md), [`requirement/backendChecklist.md`](requirement/backendChecklist.md) — track exactly what's been verified against the task brief, and what remains, rather than just asserting completeness.

## Submission

- Repository: this repo.
- Live app URL: pending (see above).
- Demo credentials: see above.
- Walkthrough: pending.
