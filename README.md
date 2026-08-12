# GiftBuddy

A gift-shop storefront, admin console, and API, built as an npm-workspaces monorepo.

| App | What it is | Port |
|---|---|---|
| [`apps/web`](apps/web) | Customer-facing storefront — Next.js | `3000` |
| [`apps/admin`](apps/admin) | Operator console — Next.js | `3002` |
| [`apps/api`](apps/api) | Backend API — NestJS + TypeORM + MySQL | `3001` |

The full plan — schema, API contract, auth model, admin feature spec, integrations, and the
phased delivery roadmap this repo is being built against — lives in
[`docs/backend-admin-analysis.md`](docs/backend-admin-analysis.md). This repo is currently at the
end of **Phase 2** of that roadmap: identity, catalog, cart, checkout, and orders are all real —
`apps/admin`'s features start in Phase 3.

- **Phase 0** — monorepo, infra, CI scaffolding.
- **Phase 1** — real auth (register/login/refresh) and a real catalog; the storefront reads from
  MySQL instead of `lib/data.ts`.
- **Phase 2** — server-backed cart (guest + signed-in, merged on login), checkout, Stripe
  PaymentIntents with a built-in dev payment simulator so the whole flow works without a Stripe
  account, an idempotent webhook that confirms payment and decrements stock, order confirmation
  email via Mailhog, and order history / guest order tracking.

## Local development

**Prerequisites:** Node 20, npm, Docker.

```bash
# 1. Install dependencies for every workspace
npm install

# 2. Start local infra (MySQL, Redis, Mailhog)
cp .env.example .env
docker compose up -d

# 3. Configure each app
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# 4. Create tables and load the sample catalog + shipping method
npm run migration:run -w @giftbuddy/api
npm run seed -w @giftbuddy/api

# 5. Run whichever app(s) you're working on, each in its own terminal
npm run dev:web     # http://localhost:3000
npm run dev:api     # http://localhost:3001  (GET /health checks the DB connection)
npm run dev:admin   # http://localhost:3002  (shows live API connection status)
```

Mailhog's web UI (catches transactional email in dev — order confirmations, once you check out)
is at `http://localhost:8025`.

Checkout works out of the box with no Stripe account: `apps/api`'s `STRIPE_SECRET_KEY` defaults to
blank, which switches `PaymentsService` to a local PaymentIntent simulator, and the checkout page
shows a "Simulate Payment" button instead of Stripe Elements. Drop real Stripe test-mode keys into
`apps/api/.env` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) and `apps/web/.env.local`
(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) to exercise the real Stripe API and Elements UI instead.

## Workspace-wide commands

Run from the repo root — each fans out to every app that defines the script:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

## Repo layout

```
apps/
  web/      Storefront — see apps/web/README.md
  admin/    Admin console — see apps/admin/README.md
  api/      NestJS API — see apps/api/README.md
docs/
  backend-admin-analysis.md   The spec this repo implements
docker-compose.yml            Local MySQL + Redis + Mailhog
.github/workflows/ci.yml      Lint/typecheck/build + API migration & test job
```
