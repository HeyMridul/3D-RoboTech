# TRAIC — Robotics & Innovation Club

A full-stack site and content platform for TRAIC: a 3D-first public experience
backed by a PostgreSQL CMS so the club can manage its own content without
touching code.

**Build. Experiment. Innovate. Deploy.**

---

## Stack

| Layer      | Choice                                          |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack), React 19    |
| Language   | TypeScript                                      |
| 3D         | three.js, React Three Fiber, drei               |
| Styling    | Tailwind CSS v4 (`@theme` tokens in globals.css)|
| Motion     | Framer Motion                                   |
| Database   | PostgreSQL via Prisma                           |
| Auth       | Auth.js (credentials, JWT sessions, RBAC)       |
| Validation | Zod, on every write                             |

Next.js is doing real work here rather than acting as a static shell: server
components keep the database queries on the server, route handlers are the API,
and dynamic imports keep three.js out of the bundle for pages that do not
render a scene.

---

## Getting started

Requires Node 20.9+ and a PostgreSQL 14+ server.

```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate            # create the schema
npm run db:seed               # demo content + the first admin user
npm run dev
```

The site runs at `http://localhost:3000`, the CMS at `/admin`. Seed credentials
come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

### Scripts

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Development server                         |
| `npm run build`      | Production build                           |
| `npm start`          | Serve the production build                 |
| `npm run lint`       | ESLint                                     |
| `npm run typecheck`  | `tsc --noEmit`                             |
| `npm run db:migrate` | Apply migrations in development            |
| `npm run db:deploy`  | Apply migrations in production             |
| `npm run db:seed`    | Load demo content                          |
| `npm run db:studio`  | Prisma Studio                              |
| `npm run db:reset`   | Drop, re-migrate and re-seed               |

---

## Architecture

```
src/
  app/
    (public routes)         home, projects, members, events, workshops,
                            achievements, gallery, blog, lab, join, contact
    admin/                  the CMS
      [resource]/           one set of screens serving all nine content types
      _components/          form controls, resource table, media library
      _config/resource-ui   which fields each resource exposes
    api/
      admin/[resource]/     generic CRUD endpoints
      admin/upload/         validated file uploads
      applications, contact public form intake
  components/
    three/                  scenes, shared materials, model viewer
    sections/               homepage sections
    ui/                     buttons, navbar, footer, command palette
  server/
    admin/resources.ts      what each resource allows: schema, roles, relations
    services/content.ts     read queries for the public site
  lib/                      auth, db, storage, validation, api helpers
  proxy.ts                  edge gate for /admin
prisma/                     schema, migrations, seed
```

### The resource registry

Nine content types (projects, members, events, workshops, achievements, blog,
gallery, technologies, categories) share one CRUD implementation. Two files
describe them:

- `src/server/admin/resources.ts` — what is *allowed*: the Zod schema, which
  roles may read, write and delete, whether deletion is soft, how slugs are
  derived, and how relations are replaced.
- `src/app/admin/_config/resource-ui.ts` — how it is *edited*: the field list,
  input types and table columns.

Adding a field is a one-line change in each. Adding a whole resource is one
entry per file, with no new routes or components.

---

## Content model

Fourteen Prisma models cover users, members, projects and their contributor and
technology joins, events, workshops, achievements, applications, contact
messages, blog posts, gallery items, media and site settings. Content models
carry `createdAt` / `updatedAt`, a `createdBy` relation and a `deletedAt`
column, so removing something from the CMS is reversible.

Nothing on the public site is hardcoded. Copy that is not editorial (section
headings, the ecosystem map, learning tracks) lives in `src/config/site.ts`;
everything else comes from the database.

### Demo content

The seed loads 8 projects, 12 members, 5 events, 6 workshops, 8 achievements,
10 technologies and 8 categories. **It is fictional.** Bios, events and
achievements are prefixed `[DEMO]` and a `demo_mode` site setting is switched
on, so placeholder material is never mistaken for TRAIC's actual record.
Replace it before going live and turn `demo_mode` off in Settings.

`public/models/demo-rover.glb` is likewise placeholder geometry, generated by
`scripts/make-demo-model.mjs`, so the component viewer can be exercised before
real CAD exports exist.

---

## 3D

The hero is a procedural quadcopter holding station over its charging pad —
hex airframe, four ducted rotors, a gimbal camera that tracks the cursor, and a
pad that pulses a scan ring. No external asset is required, though the scene is
structured so a `.glb` can replace the craft without touching the lighting.

Project pages render an interactive component viewer when the project has a
model: orbit, zoom, exploded view, and per-component highlighting. The
component list is read from the mesh names in the file, so it always describes
what was actually uploaded rather than an assumed parts list.

Performance and degradation:

- Scenes load through `next/dynamic` with `ssr: false`, so three.js is absent
  from pages that do not use it.
- Device pixel ratio is capped, and mobile drops particle counts, antialiasing
  and geometry segments, and reframes the camera rather than shrinking the
  desktop composition.
- Lighting uses local `Lightformer`s instead of a `preset` environment, which
  would fetch an HDR from a CDN at runtime.
- `prefers-reduced-motion` freezes rotors and drift and switches the canvas to
  render on demand.
- Genuine WebGL context loss is detected and reported instead of leaving a
  white rectangle.

> In `next dev`, React Strict Mode mounts effects twice and R3F disposes the
> first renderer with `forceContextLoss()`. A canvas whose context was
> force-lost cannot obtain a new one, so the model viewer can report a lost
> context in development. Verify 3D against `npm run build && npm start`.

---

## Security

- Every write is parsed with Zod before it reaches the database; `PATCH`
  validates only the fields sent.
- Role-based access control: `ADMIN` and `EDITOR` may edit content, `VIEWER` is
  read-only, and destructive or configuration actions are admin-only.
  Applications and messages hold personal data, so deleting them is admin-only.
- Passwords are bcrypt-hashed. Sign-in is throttled per account, with a much
  looser per-address cap so a campus behind one NAT address cannot be locked
  out wholesale, and unknown accounts are compared against a dummy hash so
  response time does not disclose which addresses exist.
- Uploads are checked against an extension allow-list, the declared MIME type
  and the file's magic bytes, capped at 8MB, and stored under a generated UUID
  so a caller cannot choose the path or suffix.
- CSP, `nosniff`, `frame-ancestors 'none'`, referrer and permissions policies
  on every response. `/admin` and `/api` are `no-store` and `noindex`.
- `src/proxy.ts` keeps anonymous traffic off `/admin`. It is an optimistic
  cookie check, not the authorization boundary — pages call `auth()` and route
  handlers call `requireAuth()`, which verify session and role against the
  database.
- Prisma errors are mapped to status codes (409 on unique violations, 404 on
  missing rows, 400 on bad references); anything unexpected returns a generic
  500 so internals never reach the client.

Secrets stay server-side. `DATABASE_URL` and `AUTH_SECRET` are never referenced
from client components.

---

## Accessibility

Semantic landmarks, a skip link, visible focus rings, labelled forms with inline
error messages, `aria-current` on active navigation, and a command palette that
behaves as a modal dialog (Escape to close, focus trapped and restored).
Decorative elements — the boot overlay, the 3D canvases, the `//` readout
separator — are hidden from assistive technology. `prefers-reduced-motion`
collapses transitions rather than removing feedback entirely.

`scripts/a11y-smoke.mjs` sweeps 14 public routes with axe-core against
wcag2a/2aa/21a/21aa and is currently clean.

---

## Verification

The checks under `scripts/` run against a live server. Start the production
build first (`npm run build && PORT=3100 npm start`), since Strict Mode
interferes with the 3D checks in development.

```bash
BASE_URL=http://localhost:3100 node scripts/api-smoke.mjs    # API: authz, validation, CRUD
BASE_URL=http://localhost:3100 node scripts/cms-smoke.mjs    # CMS: every screen, create/edit/delete
node scripts/model-smoke.mjs                                 # 3D component viewer
node scripts/a11y-smoke.mjs                                  # axe-core sweep
node scripts/ux-smoke.mjs                                    # reduced motion, keyboard, forms
```

They are development tools rather than a CI suite: each drives a real browser
or a real HTTP client against real data, and `cms-smoke` writes and then
removes a workshop.

---

## Deployment

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set `AUTH_SECRET` (`openssl rand -base64 32`) and `AUTH_URL`.
3. `npm run db:deploy` to apply migrations.
4. `npm run build && npm start`.

Auth.js sets `trustHost`, so the Host header must be set by your reverse proxy
rather than passed through from the client; set `AUTH_URL` to pin the origin if
that is not guaranteed.

Uploads default to `public/uploads`, which does not survive an immutable
deploy. For anything beyond a single persistent host, implement
`StorageProvider` in `src/lib/storage/index.ts` and point `STORAGE_PROVIDER` at
it. The in-memory rate limiter is likewise per-instance; back it with Redis if
you run more than one.
