# TRAIC — Robotics & Innovation Platform

Production-grade website and CMS for **TRAIC (The Robotics & Innovation Club)**.

The public site is a 3D-first engineering laboratory. Content (projects, members, events, workshops, achievements, applications, messages, media) is stored in PostgreSQL and managed from an authenticated admin dashboard.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Three.js** via React Three Fiber / Drei for the robotics lab scenes
- **Framer Motion** + **GSAP** for UI and scroll motion
- **Tailwind CSS 4** design system
- **PostgreSQL** + **Prisma**
- **Auth.js (NextAuth v5)** credentials + JWT, RBAC (`ADMIN` / `EDITOR` / `VIEWER`)
- **Zod** validation, rate limiting, local object-storage abstraction

## Architecture

```text
src/
  app/            public pages, admin CMS, route handlers
  components/     UI, 3D engine, sections, admin CRUD
  server/         content + admin services
  lib/            auth, db, validation, storage, logging
  config/         site identity + CMS field maps
prisma/           schema + demo seed
```

Public pages never hardcode catalog data. Seed content is marked `[DEMO]` and a banner appears while `demo_mode=true`.

## Setup

```bash
cp .env.example .env
# set DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# PostgreSQL (local or Docker)
docker compose up -d
# or: brew services start postgresql / systemd postgresql

npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: `/admin/login` using `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Security

- Secrets stay in environment variables (never shipped to the client)
- Server-side Zod validation + sanitization
- Rate limits on contact, applications, and uploads
- RBAC on admin APIs (`VIEWER` read, `EDITOR` write, `ADMIN` delete)
- Secure headers via `next.config.ts`
- Upload MIME/size checks
- Auth gate in `src/proxy.ts` plus per-page `auth()` checks

## Performance

- Dynamic imports for all WebGL scenes
- Reduced particle counts and lights on mobile
- `prefers-reduced-motion` short-circuits loader, 3D loops, and canvas sims
- Image formats AVIF/WebP; 3D models can be swapped in as Draco `.glb`

Replace procedural models later by setting `modelUrl` on a project (`.glb` / `.gltf`).
