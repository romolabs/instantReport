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
  - `/admin/tickets` shows a live triage queue for staff users
  - `/tickets/[ticketId]` loads real ticket detail, attachments, comments, and status history
  - staff can assign tickets with a handoff note
  - staff can post internal and resolution notes
  - staff can move tickets through workflow states and resolve them with a resolution summary
  - ticket detail now includes an attachment uploader for additional evidence
  - ticket detail lookup now works by ticket number as well as UUID
  - the web app has been verified live against a local PostgreSQL-backed API for:
    - requester login, ticket list, ticket creation, ticket detail redirect, and public comments
    - admin queue access
    - ticket assignment with audit note
    - internal note posting
    - status changes into active work
    - resolution close-out with summary
- `apps/mobile` contains a Flutter scaffold with login, shell navigation, and placeholder ticket screens.

## Next Build Steps

- Add seed refinement for production bootstrap
- Decide whether attachment storage should stay local or move to object storage later
- Add user/category management UI and reporting screens
- Verify the new detail-page attachment uploader with a live file upload pass
- Add reopen flow polish and tighter workflow guardrails in the web client
- Wire the Flutter client to the backend API
- Add tests

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
