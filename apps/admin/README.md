# @giftbuddy/admin

Operator console for the GiftBuddy store — Next.js, sharing design tokens with `apps/web`
but built for dashboard use (data-dense, keyboard-friendly) rather than browsing.

Currently a Phase 0 scaffold: it boots, shares the storefront's design tokens, and checks
connectivity to `apps/api`. Real screens (catalog, orders, customers, settings, roles) land in
Phase 3 — see [docs/backend-admin-analysis.md](../../docs/backend-admin-analysis.md) §07.

## Local development

1. `cp apps/admin/.env.example apps/admin/.env.local`
2. Make sure `apps/api` is running (see its README) so the connection check on the home page
   goes green.
3. `npm run dev:admin` from the repo root (or `npm run dev -w @giftbuddy/admin`) — serves on
   `http://localhost:3002`.
