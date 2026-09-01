# TRAIC — Robotics & Innovation Platform

Full-stack digital command center for the TRAIC Robotics & Innovation Club.
It combines an adaptive React Three Fiber laboratory experience with
CMS-driven projects, learning, events, achievements, members, applications,
articles, media, and an authenticated administration surface.

## Local setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Seed records are explicitly labeled as demo content. Production seeding
requires `ADMIN_PASSWORD`; never deploy the development credential.

## Architecture

- Next.js 16 App Router, React 19, and TypeScript
- React Three Fiber, Drei, Three.js, Framer Motion, and Tailwind CSS 4
- typed Route Handlers with Zod validation
- PostgreSQL, Prisma, indexed relations, migrations, and soft deletion
- Auth.js credentials sessions, bcrypt, RBAC, route protection, and secure headers
- replaceable storage adapter with validated 5 MB image/GLB uploads

Heavy 3D code is dynamically loaded on the client. Device pixel ratio,
particles, antialiasing, and frame loops adapt for mobile and reduced-motion
users.

Public queries only return published, non-deleted records. Admins and editors
can manage projects, members, events, workshops, achievements, blog posts,
gallery entries, media, applications, messages, and settings. Admin user
management is restricted to the `ADMIN` role.

The included in-memory public-form limiter is suitable for one application
process. Multi-instance deployments should replace it with a shared
Redis-backed implementation.
