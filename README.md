# InstantReport

Internal help desk MVP for technical support ticketing.

## Session Handoff

Read `MEMORY.md` first when resuming work in a new thread.

## Current Scope

- Backend-first scaffold using NestJS
- Prisma data model for users, categories, tickets, comments, status history, attachments, and password resets
- Initial web and mobile client scaffolds
- Git-first repository initialized on `main`

## Stack

- NestJS
- Next.js
- Flutter
- Prisma
- PostgreSQL
- TypeScript

## Repo Layout

- `src/`, `prisma/`, `docs/`: backend API and project docs
- `apps/web`: Next.js web client scaffold
- `apps/mobile`: Flutter mobile client scaffold

## Setup

1. Copy `.env.example` to `.env`.
2. Set a real `DATABASE_URL` and `JWT_SECRET`.
3. Install dependencies with `npm install`.
4. Generate Prisma client with `npm run prisma:generate`.
5. Apply the checked-in migrations with `npm run prisma:migrate:deploy`.
6. Seed categories and an initial admin with `npm run db:seed`.
7. Build the API with `npm run build`.
8. For web: `cd apps/web && npm install && npm run build`
9. For mobile: `cd apps/mobile && flutter test`

For a fresh local database bootstrap, `npm run db:bootstrap` will apply migrations and then seed bootstrap data.
For staging or production, run `npm run prisma:migrate:deploy` first and only run `npm run db:seed` when you intentionally allow it with `SEED_ALLOW_NON_LOCAL_DATABASE=true`.

For local web + API development, run the backend on port `4000` so the Next.js app can stay on its default port.

## Docker Testing Deployment

The repo now includes a Docker-based testing stack for `postgres`, `api`, `web`, and persistent ticket uploads.

1. Copy `.env.docker.example` to `.env.docker`.
2. Set strong values for:
   - `POSTGRES_PASSWORD`
   - `POSTGRES_PASSWORD_URLENCODED`
   - `JWT_SECRET`
   - `INSTANTREPORT_PUBLIC_BACKEND_ORIGIN`
3. For HTTP-only testing on a private homelab, keep `INSTANTREPORT_SECURE_COOKIES=false`.
4. Start the stack:
   - `docker compose --env-file .env.docker up -d --build`
5. Run first-time bootstrap data explicitly:
   - `docker compose --env-file .env.docker --profile bootstrap run --rm bootstrap`

Default published ports:
- web: `3000`
- api: `4000`

Important deployment notes:
- `POSTGRES_PASSWORD_URLENCODED` must match `POSTGRES_PASSWORD`, but URL-encoded for use inside `DATABASE_URL`. If you keep the password alphanumeric, both values can be identical.
- The web container talks to the API over Docker networking with `INSTANTREPORT_API_BASE_URL=http://api:${APP_PORT:-4000}/api`.
- Browser-visible attachment links use `INSTANTREPORT_PUBLIC_BACKEND_ORIGIN`, so set it to the real host/IP users will open in the browser, for example `http://your-homelab-ip:4000`.
- Uploaded ticket evidence is persisted in the Docker volume `instantreport_uploads`.
- PostgreSQL data is persisted in the Docker volume `instantreport_postgres`.

## Current API Modules

- `auth`
- `users`
- `categories`
- `tickets`

## Current State

- Prisma-backed CRUD is implemented for users, categories, and tickets.
- Prisma runtime now uses the official PostgreSQL adapter package for local and app execution.
- Auth has a first working pass for login and password reset flows.
- JWT auth guards and current-user request context are wired.
- Requesters only see their own tickets; internal notes stay hidden from them.
- Ticket attachments can be uploaded to local disk storage under `uploads/tickets`.
- Uploaded ticket evidence is now served back from the backend under `/uploads`.
- `apps/web` now has real requester, admin, and technician flows:
  - login posts to the backend through a Next route handler
  - session token is stored in an HTTP-only cookie
  - app routes require authentication
  - `/tickets` loads real data from the API
  - `/tickets/new` creates real tickets and uploads attachments
  - `/` now renders a live dashboard with role-aware queue and reporting metrics
  - `/admin/tickets` shows a live triage queue for staff users
  - `/admin/tickets` now has real client-side queue filters for search, status, urgency, response gaps, and attachments
  - `/admin/users` manages real users
  - `/admin/categories` manages real categories
  - `/forgot-password` and `/reset-password` expose the existing recovery backend flows through the web app
  - `/tickets/[ticketId]` loads real ticket detail, attachments, comments, and status history
  - staff can assign tickets with a handoff note
  - staff can post internal and resolution notes
  - staff can move tickets through workflow states and resolve them with a resolution summary
  - ticket detail now includes an attachment uploader for additional evidence
  - ticket creation now recovers more safely from attachment upload failures after the ticket already exists
  - ticket detail lookup now works by ticket number as well as UUID
  - authenticated and auth route groups now have branded loading and error fallbacks instead of generic Next.js failures
  - the web app has been verified live against a local PostgreSQL-backed API for:
    - requester login, ticket list, ticket creation, ticket detail redirect, and public comments
    - admin queue access
    - ticket assignment with audit note
    - internal note posting
    - status changes into active work
    - resolution close-out with summary
- `apps/mobile` now has a first real vertical slice:
  - login calls the live backend API
  - JWT auth is stored in memory for the active session
  - `My Tickets` loads real ticket data
  - create-ticket and full detail actions are still the next mobile steps
- `npm run test:api:smoke` now runs a real backend smoke test for login, ticket creation, attachment upload, assignment, reopen, and close flows against a running local API.
- `cd apps/web && npm run test:e2e` now runs committed Playwright coverage for detail-page reopen and attachment flows.

## Next Build Steps

- Add seed refinement for production bootstrap
- Decide whether attachment storage should stay local or move to object storage later
- Wire the Flutter client to the backend API
- Extend the Flutter client from login + ticket list into detail and ticket creation
- Expand automated coverage beyond the API smoke harness
- Expand web browser coverage beyond the detail-page regression slice

## Migrations And Bootstrap

- Prisma migration history now lives in `prisma/migrations`
- Deployment-safe migration command: `npm run prisma:migrate:deploy`
- Migration status check: `npm run prisma:migrate:status`
- Bootstrap notes and seed safety flags: `docs/bootstrap.md`

## Attachment Uploads

- Endpoint: `POST /api/tickets/:ticketId/attachments`
- Auth: bearer token required
- Form field: `file`
- Allowed types: `png`, `jpg`, `jpeg`, `heic`, `heif`, `pdf`
- Max size: `10 MiB`
- Storage: local disk in `uploads/tickets`
- Files are served back from the backend at `/uploads/...`
