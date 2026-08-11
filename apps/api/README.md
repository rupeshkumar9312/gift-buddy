# @giftbuddy/api

NestJS backend for GiftBuddy. See [docs/backend-admin-analysis.md](../../docs/backend-admin-analysis.md)
for the full schema, API contract, and roadmap this app implements.

## Local development

1. From the repo root: `cp .env.example .env && docker compose up -d` (MySQL, Redis, Mailhog).
2. `cp apps/api/.env.example apps/api/.env` and adjust if needed.
3. `npm run migration:run -w @giftbuddy/api` — creates all tables.
4. `npm run seed -w @giftbuddy/api` — loads the storefront's original mock catalog as real rows (6 categories, 12 products).
5. `npm run dev:api` from the repo root (or `npm run start:dev -w @giftbuddy/api`).
6. `GET http://localhost:3001/` → API info. `GET http://localhost:3001/health` → DB connectivity check.

## Migrations

- `npm run migration:generate -w @giftbuddy/api -- src/database/migrations/<Name>` — diff entities against the DB and write a migration.
- `npm run migration:run -w @giftbuddy/api` — apply pending migrations.
- `npm run migration:revert -w @giftbuddy/api` — roll back the last migration.

Schema is only ever changed through migrations — `synchronize` is off in every environment.

## What's implemented (Phase 1: identity & catalog)

- **Auth** — `POST /auth/{register,login,refresh,logout}`, `GET /me`. Argon2 password hashing,
  short-lived JWT access tokens, a rotating refresh token (hash stored on the user row) delivered
  as an `httpOnly` cookie scoped to `/api/v1/auth`.
- **Catalog** — `GET /categories`, `GET /products` (filter by `category`/`minRating`/`maxPrice`,
  sort, paginate), `GET /products/:slug`, `GET /products/:slug/related`, `GET /products/featured`.
  A product's `badge` (`sale`/`new`/`hot`) is computed from `salePrice`/`isFeatured`/`createdAt`,
  never stored — see `products.entity.ts`.

Not yet built: addresses, cart, orders, payments, reviews, admin auth — later phases.
