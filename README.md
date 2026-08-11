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
end of **Phase 0** of that roadmap: the three apps exist, talk to each other, and share CI —
`apps/admin` and `apps/api`'s actual features start in Phase 1.

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
cp apps/admin/.env.example apps/admin/.env.local

# 4. Run whichever app(s) you're working on, each in its own terminal
npm run dev:web     # http://localhost:3000
npm run dev:api     # http://localhost:3001  (GET /health checks the DB connection)
npm run dev:admin   # http://localhost:3002  (shows live API connection status)
```

Mailhog's web UI (catches transactional email in dev, once the API sends any) is at
`http://localhost:8025`.

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
