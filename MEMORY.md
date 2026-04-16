# Project Memory

This file is the cross-session handoff for `instantReport`.

## Product Idea

Build a low-cost internal help desk / ticket system for the company.

Purpose:

- Employees create tickets when they have technical issues.
- IT reviews, works, documents the resolution, and closes tickets.
- The system should support ISO 9001-friendly traceability and records.
- Mobile is strategic, so the backend must support both web and future Flutter clients.

## Working Mode

- The user and Codex take decisions together.
- Codex is expected to build the code.
- Lead mode is the default for project work unless the user requests otherwise.

## Locked Decisions

- Web app first, but backend must be mobile-ready.
- Flutter is a planned future client, not just a possibility.
- Use a real backend API from day one.
- Authentication uses company email/password managed by the app.
- No public signup.
- Users are created and managed internally.
- Categories are required on ticket creation.
- Attachments are part of the MVP.
- Internal notes are hidden from requesters.
- Resolution summaries are visible to requesters.
- Auditability is a first-class requirement.

## Chosen Stack

- Backend: NestJS
- Database: PostgreSQL
- ORM / DB access: Prisma
- Runtime DB adapter: `@prisma/adapter-pg`
- Language: TypeScript
- Mobile later: Flutter

## Current Architecture

```text
Web App
   \
    -> Backend API (NestJS) -> Prisma -> PostgreSQL
   /
Flutter App (future)
```

## Repo Structure

- Backend remains at the repo root for now:
  - `src/`
  - `prisma/`
  - `docs/`
- Web client lives in `apps/web`
- Mobile client lives in `apps/mobile`

This is intentional for speed. We did not refactor the backend into `apps/api` yet because it would slow delivery without adding immediate value.

## Current Data Model

Defined in `prisma/schema.prisma`.

Main entities:

- `User`
- `Category`
- `Ticket`
- `TicketComment`
- `TicketStatusHistory`
- `Attachment`
- `PasswordResetToken`

Important workflow statuses:

- `OPEN`
- `ASSIGNED`
- `IN_PROGRESS`
- `PENDING_USER`
- `RESOLVED`
- `CLOSED`

## What Has Been Done

- Initialized a Git repository on `main`.
- Created the backend project scaffold.
- Installed NestJS, Prisma, TypeScript, and validation dependencies.
- Added TypeScript build configuration.
- Added `.gitignore` and `.env.example`.
- Added Prisma 7 config in `prisma.config.ts`.
- Created the first Prisma schema.
- Generated Prisma client successfully.
- Added the official PostgreSQL Prisma adapter package and `pg`.
- Added NestJS entrypoint and app module.
- Added initial modules:
  - `auth`
  - `users`
  - `categories`
  - `tickets`
- Replaced placeholder auth logic with a first real pass:
  - login verifies password with Argon2
  - JWT access tokens are issued
  - forgot-password creates hashed reset tokens
  - reset-password updates the stored password hash
- Replaced placeholder users logic with Prisma-backed CRUD.
- Replaced placeholder categories logic with Prisma-backed CRUD.
- Replaced placeholder tickets logic with Prisma-backed CRUD.
- Added JWT auth request plumbing:
  - JWT strategy
  - `JwtAuthGuard`
  - `RolesGuard`
  - `Roles` decorator
  - `CurrentUser` decorator
  - protected `GET /auth/me`
- Added ticket business rules in the tickets service:
  - category must exist and be active
  - assigned user must be technician/admin
  - closed tickets require a resolution summary
  - status changes create `TicketStatusHistory`
  - `firstResponseAt`, `resolvedAt`, and `closedAt` are managed automatically
- Replaced the temporary `x-user-id` actor header usage with authenticated request context.
- Added role-aware ticket visibility:
  - requesters only see their own tickets
  - internal notes are hidden from requesters
- Added attachment upload support:
  - multipart upload endpoint on tickets
  - local disk storage under `uploads/tickets`
  - Prisma `Attachment` metadata persistence
  - allowed types: `png`, `jpg`, `jpeg`, `heic`, `heif`, `pdf`
  - max size: `10 MiB`
- Added a seed script for default categories and an initial admin user.
- Added the first web client scaffold in `apps/web`:
  - Next.js app router
  - branded login screen
  - authenticated shell layout
  - placeholder screens for tickets, create ticket, detail, and admin tickets
- Wired the first real web-client integration:
  - login goes through a Next route handler proxy
  - backend token is stored in an HTTP-only session cookie
  - app shell requires authentication
  - the web ticket list loads real data from `/tickets`
  - the web create-ticket flow creates real tickets through a Next route handler
  - the web create-ticket flow uploads attachments after ticket creation
  - the web ticket-detail route loads real ticket data, attachments, comments, and status history
  - requesters can add public comments from ticket detail
- Expanded the web staff flows:
  - `/admin/tickets` now renders a real live queue for technicians/admins
  - ticket detail includes staff assignment, workflow, and close-out controls
  - assignment now preserves a handoff note in `TicketStatusHistory`
  - staff can add internal notes and resolution notes from the web UI
  - ticket detail now includes a web attachment uploader for adding more evidence after creation
- Updated the backend ticket lookup so detail and related actions can resolve either by UUID or by `ticketNumber`.
- Updated the backend to serve uploaded attachment binaries from `/uploads`.
- Fixed the ticket-detail API payload to include `_count` so the staff console can render safely at runtime.
- Fixed Prisma runtime initialization by wiring the backend and seed flow through `@prisma/adapter-pg`.
- Fixed root TypeScript config for the seed path by adding Node types.
- Added the first Flutter client scaffold in `apps/mobile`:
  - branded login screen
  - bottom-nav shell
  - placeholder screens for my tickets, ticket detail, and create ticket
- Added a README with setup instructions.
- Added initial Prisma migration history under `prisma/migrations`.
- Added migration/bootstrap scripts for deploy-safe Prisma workflows.
- Refined the seed script so production bootstrap does not overwrite existing admin credentials or category definitions unless explicitly allowed.
- Added bootstrap and migration documentation in `docs/bootstrap.md`.

## What Has Been Verified

- `npm run prisma:generate` passed.
- `npm run build` passed.
- `cd apps/web && npm run build` passed after wiring the requester flow and again after adding the admin/staff flows.
- Local PostgreSQL 16 cluster was initialized successfully in `.local-pgdata`.
- Prisma schema was applied to the local database and seed completed successfully.
- Backend booted successfully on port `4000`.
- The existing local PostgreSQL database was baselined with the initial Prisma migration via `migrate resolve`.
- Web requester flow was exercised live through browser automation:
  - login with seeded admin account
  - empty ticket list
  - create ticket
  - redirect to ticket detail by `ticketNumber`
  - add public comment
- Web admin/staff flow was exercised live through browser automation:
  - open the admin queue
  - open ticket detail from the queue
  - assign the ticket with a handoff note
  - post an internal note
  - move the ticket to `IN_PROGRESS`
  - resolve the ticket with a resolution summary
  - confirm the status history and resolution summary render correctly
  - confirm the new detail-page attachment uploader renders in the live page
- Additional web runtime verification is now complete:
  - detail-page attachment upload succeeded with a real sample file
  - `RESOLVED -> IN_PROGRESS` reopen succeeded with a reopen reason
  - `CLOSED -> RESOLVED` now correctly requires a reopen reason in the UI and succeeds once provided
- Admin operations UI is now live in the web app:
  - `/admin/users` can create and update users
  - `/admin/categories` can create and update categories
- The authenticated web dashboard at `/` now shows live role-aware reporting metrics
- A repo-native API smoke test now exists at `npm run test:api:smoke`
  - verifies login, ticket creation, attachment upload, assignment, reopen, and close against the local API

## Current Reality

The core requester-facing and admin/staff web flows are build-verified and runtime-verified locally.
The core requester-facing and admin/staff web flows are build-verified and runtime-verified locally, including the detail-page uploader and reopen flows.

What is still placeholder-only:

- mobile-to-API integration
- deeper browser-level test coverage

## Temporary Implementation Notes

- `forgot-password` currently returns the raw reset token in the response because email delivery is not wired yet.
- Once email delivery exists, that token should be sent out-of-band and removed from the API response.
- The API smoke harness requires the local backend to be running, and defaults to `http://127.0.0.1:4000/api`.
- It uses the seeded admin credentials by default unless `SMOKE_ADMIN_EMAIL` and `SMOKE_ADMIN_PASSWORD` are set.

## Recommended Next Steps

Build in this order:

1. Decide whether attachments remain on local disk or move to object storage.
2. Wire the Flutter client to the backend auth and ticket endpoints.
3. Add browser-level web tests for the detail-page attachment and reopen flows.
4. Expand automated coverage for auth, tickets, and status transitions.
5. Add richer reporting only if the current dashboard needs deeper analytics.

## Immediate Next Coding Target

If a new thread picks this up, the best next move is:

Either:

- begin wiring Flutter auth and ticket-list flows against the now-proven API contract, or
- add browser-level tests for the detail-page attachment and reopen flows, or
- make the attachment storage strategy explicit before deployment planning goes further.

## Files To Read First In A New Session

- `MEMORY.md`
- `README.md`
- `docs/mvp-schema.md`
- `prisma/schema.prisma`
- `src/app.module.ts`
- `src/auth/auth.service.ts`
- `src/auth/strategies/jwt.strategy.ts`
- `src/tickets/tickets.service.ts`
- `src/tickets/attachment-upload.ts`
- `prisma/seed.ts`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/login/login-form.tsx`
- `apps/web/app/(app)/tickets/page.tsx`
- `apps/web/app/(app)/tickets/new/page.tsx`
- `apps/web/app/(app)/tickets/new/create-ticket-form.tsx`
- `apps/web/app/(app)/tickets/[ticketId]/page.tsx`
- `apps/web/app/(app)/tickets/[ticketId]/ticket-detail-view.tsx`
- `apps/web/app/(app)/tickets/[ticketId]/ticket-staff-actions.tsx`
- `apps/web/app/(app)/tickets/[ticketId]/ticket-attachment-form.tsx`
- `apps/web/app/(app)/tickets/[ticketId]/ticket-comment-form.tsx`
- `apps/web/app/(app)/admin/tickets/page.tsx`
- `apps/web/app/(app)/admin/tickets/admin-ticket-queue-view.tsx`
- `apps/web/lib/backend.ts`
- `apps/web/lib/auth.ts`
- `apps/web/lib/categories.ts`
- `apps/web/lib/tickets.ts`
- `apps/mobile/lib/src/instant_report_app.dart`
- `apps/mobile/lib/src/auth/login_page.dart`

## Notes

- Prisma 7 no longer uses `url = env("DATABASE_URL")` inside `schema.prisma`, so connection config lives in `prisma.config.ts`.
- Prisma runtime in this repo currently uses `@prisma/adapter-pg` plus `pg`.
- `dist/` exists locally from a successful build and is ignored by Git.
- `tsconfig.build.tsbuildinfo` exists locally and is ignored by Git.
- Uploaded attachment binaries live under `uploads/`, which is ignored by Git.
- For local dev with the Next.js web app, the backend should run on port `4000`.
- Local verification in this session used:
  - `.env` with `DATABASE_URL=postgresql://postgres@localhost:5433/instantreport?schema=public`
  - a local PostgreSQL 16 cluster in `.local-pgdata`
