# Next.js

Includes everything in `nodejs.md`, plus:

## Look at

- `next.config.*` — experimental flags, redirects, env, output mode, image domains.
- Router: `app/` (App Router) or `pages/` (Pages Router). If both exist, note which routes live where.
- `middleware.ts` at root — auth gating, redirects.
- `app/layout.*`, `app/globals.css` (or equivalent) — root shell.
- `next-env.d.ts`, `instrumentation.ts`.

## Conventions

- Route map: list every `app/**/page.tsx` + `app/**/route.ts`. Note dynamic segments.
- Server vs client: `'use client'` directives, `'use server'` actions.
- Data layer: `app/api/*`, `lib/`, `db/`, or a `drizzle`/`prisma` dir.

## Deploy + env

- `vercel.json` if present.
- `.env.local`, `.env.production` — but never read `.env*` secrets, just note their existence.

## Archive folders

- `_archive/`, `_legacy/`, `_old/` under routes — past attempts kept around.
