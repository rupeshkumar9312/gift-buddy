# @giftbuddy/api

NestJS backend for GiftBuddy. See [docs/backend-admin-analysis.md](../../docs/backend-admin-analysis.md)
for the full schema, API contract, and roadmap this app implements.

## Local development

1. From the repo root: `cp .env.example .env && docker compose up -d` (MySQL, Redis, Mailhog).
2. `cp apps/api/.env.example apps/api/.env` and adjust if needed.
3. `npm run dev:api` from the repo root (or `npm run start:dev -w @giftbuddy/api`).
4. `GET http://localhost:3001/` → API info. `GET http://localhost:3001/health` → DB connectivity check.

## Migrations

- `npm run migration:generate -w @giftbuddy/api -- src/database/migrations/<Name>` — diff entities against the DB and write a migration.
- `npm run migration:run -w @giftbuddy/api` — apply pending migrations.
- `npm run migration:revert -w @giftbuddy/api` — roll back the last migration.

Schema is only ever changed through migrations — `synchronize` is off in every environment.
