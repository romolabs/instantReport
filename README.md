# InstantReport

Internal help desk MVP for technical support ticketing.


## Current Scope

- Backend-first scaffold using NestJS
- Prisma data model for users, categories, tickets, comments, status history, attachments, and password resets
- Git-first repository initialized on `main`

## Stack

- NestJS
- Prisma
- PostgreSQL
- TypeScript

## Setup

1. Copy `.env.example` to `.env`.
2. Set a real `DATABASE_URL` and `JWT_SECRET`.
3. Install dependencies with `npm install`.
4. Generate Prisma client with `npm run prisma:generate`.
5. Run your first migration with `npm run prisma:migrate`.
6. Seed categories and an initial admin with `npm run db:seed`.
7. Build the API with `npm run build`.

## Current API Modules

- `auth`
- `users`
- `categories`
- `tickets`

## Current State

- Prisma-backed CRUD is implemented for users, categories, and tickets.
- Auth has a first working pass for login and password reset flows.
- JWT auth guards and current-user request context are wired.
- Requesters only see their own tickets; internal notes stay hidden from them.
- Ticket attachments can be uploaded to local disk storage under `uploads/tickets`.

## Next Build Steps

- Add database migration history and deployment docs
- Add seed refinement for production bootstrap
- Decide whether attachment storage should stay local or move to object storage later
- Add tests

## Attachment Uploads

- Endpoint: `POST /api/tickets/:ticketId/attachments`
- Auth: bearer token required
- Form field: `file`
- Allowed types: `png`, `jpg`, `jpeg`, `heic`, `heif`, `pdf`
- Max size: `10 MiB`
- Storage: local disk in `uploads/tickets`
