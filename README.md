# MyFamily

Private family app (engineering thesis project): chat, family tree,
family finances, media gallery.

## Stack

- Monorepo: pnpm workspaces (`apps/*`, `packages/*`)
- `apps/web` — Next.js (App Router), route handlers as backend
- `apps/mobile` — empty, reserved for the future
- `packages/db` — Prisma + PostgreSQL
- `packages/shared` — shared Zod schemas
- Auth: next-auth v4 (credentials + bcryptjs)
- Media: S3-compatible storage (MinIO via Docker locally)
- Email: Resend

## Requirements

- Node.js 20+
- pnpm 10.x
- Docker + Docker Compose

## Setup

```bash
pnpm install
docker compose up -d
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
```

Fill in `apps/web/.env.local`: `NEXTAUTH_SECRET` and `RESEND_API_KEY`
(see below).

Create the bucket in MinIO: console at <http://localhost:9001>, login from
`docker-compose.yml` (`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`), bucket name
matching `S3_BUCKET_NAME` (default `myfamily-media`).

```bash
pnpm --filter @myfamily/db exec prisma migrate dev
pnpm --filter @myfamily/db seed
pnpm dev
```

App: <http://localhost:3000>. After seeding: `john@test.com` / `Test123!`.

## Environment variables

Examples in [`apps/web/.env.example`](apps/web/.env.example) and
[`packages/db/.env.example`](packages/db/.env.example).

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | web, db | Postgres connection string, must match in both places |
| `NEXTAUTH_SECRET` | web | `npx auth secret` or `openssl rand -base64 32` |
| `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` | web | MinIO/S3 credentials |
| `S3_BUCKET_NAME` | web | name of the bucket created manually in MinIO |
| `RESEND_API_KEY` | web | key from [resend.com](https://resend.com), free plan is enough |
| `APP_URL` | web | base URL, used in the verification link in the email |

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
```

In `packages/db`:

```bash
pnpm studio
pnpm seed
pnpm exec prisma migrate dev
pnpm exec prisma migrate deploy
```

## Structure

```
apps/web/        Next.js — frontend + API route handlers
apps/mobile/      empty, reserved for the future
packages/db/      Prisma: schema, migrations, seed
packages/shared/  Zod schemas
docker-compose.yml   Postgres + MinIO
```
