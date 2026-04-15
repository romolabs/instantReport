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
- Added a README with setup instructions.

## What Has Been Verified

- `npm run prisma:generate` passed.
- `npm run build` passed.

## Current Reality

The project is scaffolded but not functional yet.

What is still placeholder-only:

- tests

## Temporary Implementation Notes

- `forgot-password` currently returns the raw reset token in the response because email delivery is not wired yet.
- Once email delivery exists, that token should be sent out-of-band and removed from the API response.

## Recommended Next Steps

Build in this order:

1. Add migration history and bootstrap docs for deployment.
2. Refine seeds for production bootstrap and environment safety.
3. Decide whether attachments remain on local disk or move to object storage.
4. Start the web client now that backend auth and core CRUD are stable.
5. Add tests for auth, tickets, and status transitions.

## Immediate Next Coding Target

If a new thread picks this up, the best next move is:

Start the web client or add backend tests, depending on whether UI work or API hardening is the priority.

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

## Notes

- Prisma 7 no longer uses `url = env("DATABASE_URL")` inside `schema.prisma`, so connection config lives in `prisma.config.ts`.
- `dist/` exists locally from a successful build and is ignored by Git.
- `tsconfig.build.tsbuildinfo` exists locally and is ignored by Git.
- Uploaded attachment binaries live under `uploads/`, which is ignored by Git.
