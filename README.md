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
end of **Phase 4** of that roadmap: reviews, wishlists, coupons, and content (blog/FAQ/contact/
newsletter) are live on both the storefront and the admin console.

- **Phase 0** — monorepo, infra, CI scaffolding.
- **Phase 1** — real auth (register/login/refresh) and a real catalog; the storefront reads from
  MySQL instead of `lib/data.ts`.
- **Phase 2** — server-backed cart (guest + signed-in, merged on login), checkout, Stripe
  PaymentIntents with a built-in dev payment simulator so the whole flow works without a Stripe
  account, an idempotent webhook that confirms payment and decrements stock, order confirmation
  email via Mailhog, and order history / guest order tracking.
- **Phase 3** — `apps/admin` goes live: its own auth (separate JWT signing secret + audience claim
  from the storefront's), four seeded roles with a permission matrix enforced by a
  `PermissionsGuard`, a dashboard (revenue, AOV, low-stock, recent orders), full product &
  category CRUD, and an order queue with status updates (fulfilled/completed/cancelled/refunded —
  cancelling or refunding restocks the items).
- **Phase 4** — engagement & content: product reviews (submit → pending moderation → approved,
  with featured reviews surfacing as storefront testimonials and denormalized product ratings
  recalculated on approval), a server-backed wishlist for signed-in customers, coupon codes
  (percent/fixed, re-validated on every cart read and again at checkout) applied on the cart and
  carried through to the order total, and a content layer — blog, grouped FAQs, a contact inbox,
  and newsletter signup — all editable from `apps/admin`.

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

# 4. Create tables and load the sample catalog, shipping method, admin roles/users,
#    sample reviews/coupons/blog posts/FAQs, and three seeded customer logins
npm run migration:run -w @giftbuddy/api
npm run seed -w @giftbuddy/api

# 5. Run whichever app(s) you're working on, each in its own terminal
npm run dev:web     # http://localhost:3000
npm run dev:api     # http://localhost:3001  (GET /health checks the DB connection)
npm run dev:admin   # http://localhost:3002  — sign in with the seeded Super Admin below
```

Mailhog's web UI (catches transactional email in dev — order confirmations, order status updates,
once you check out) is at `http://localhost:8025`.

The seed script creates one Super Admin login for `apps/admin`, dev-only:
`admin@giftbuddy.test` / `admin12345` (see `apps/api/src/database/admin-seed-data.ts`). It also
creates three seeded customer logins (`hannah@giftbuddy.test`, `marcus@giftbuddy.test`,
`priya@giftbuddy.test`, all `customer12345`) that own the sample product reviews (see
`apps/api/src/database/engagement-seed-data.ts`), and two coupon codes to try at checkout:
`WELCOME10` (10% off) and `FREESHIP` ($8 off orders over $50).

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
