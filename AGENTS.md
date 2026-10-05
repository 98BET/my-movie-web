<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The environment install script installs PostgreSQL when `psql` is missing, then runs `npm ci` (which runs `prisma generate`). The start script brings up the local cluster with `sudo pg_ctlcluster` — `service postgresql start` does not run here because `policy-rc.d` blocks it — creates database `mymovie`, runs `npx prisma db push`, seeds `prisma/seed.js` only when the `Movie` table is empty, and leaves `npm run dev` on port 3000.
- Export `DATABASE_URL=postgresql://mymovie:mymovie@127.0.0.1:5432/mymovie` before `npm run build` or any Prisma command. `lib/prisma.ts` opens a TLS connection as soon as it is imported and throws when `DATABASE_URL` is unset. The local Postgres cluster already has SSL turned on, which that client requires.
- Admin login uses `ADMIN_PASSWORD` when set, and `admin1234` otherwise. Browsing and search work from the seeded catalog without `TMDB_API_KEY`.
- Checks: `npm run lint` (existing unescaped-quote errors in `app/search/page.tsx`), `npx tsc --noEmit`, and `npm run build` with `DATABASE_URL` set. There is no automated test script.
- Dev server command: `npm run dev -- --hostname 0.0.0.0 --port 3000`.
