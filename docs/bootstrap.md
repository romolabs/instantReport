# Bootstrap And Migrations

This project now keeps Prisma migration history in `prisma/migrations`, so a new environment can be brought up from the repo instead of from the current live schema alone.

## Local Bootstrap

1. Copy `.env.example` to `.env`.
2. Point `DATABASE_URL` at a PostgreSQL database.
3. Install dependencies with `npm install`.
4. Generate the Prisma client with `npm run prisma:generate`.
5. Apply migrations with `npm run prisma:migrate:deploy`.
6. Seed bootstrap data with `npm run db:seed`.
7. Build the API with `npm run build`.

If you want one command for steps 5 and 6 in local development, run `npm run db:bootstrap`.
For staging or production, keep the steps separate and only run `npm run db:seed` when `SEED_ALLOW_NON_LOCAL_DATABASE=true` is set intentionally.

## Migration Workflow

- Use `npm run prisma:migrate -- --name your_change_name` during development when the schema changes.
- Use `npm run prisma:migrate:status` to confirm a target database matches the repo migration history.
- Use `npm run prisma:migrate:deploy` in shared, staging, and production environments.

## Seed Safety

The seed script is intentionally conservative now:

- It refuses to run against non-local databases unless `SEED_ALLOW_NON_LOCAL_DATABASE=true`.
- Default categories are created if missing, but existing categories are left alone unless `SEED_SYNC_DEFAULT_CATEGORIES=true`.
- The admin user is created if missing.
- Existing admin records are left unchanged unless `SEED_UPDATE_EXISTING_ADMIN=true`.
- Existing admin passwords are not reset unless `SEED_RESET_ADMIN_PASSWORD=true`.

This keeps production bootstrap idempotent without unexpectedly rewriting live admin credentials or category definitions.
