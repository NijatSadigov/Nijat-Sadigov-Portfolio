# Nijat Sadigov — Portfolio

A dynamic, self-editable portfolio. Content (projects, certs, skills, etc.) is
managed through an admin login — no code changes needed to add or update work.

Three public **profiles** share one site: **Game Development**, **Software
Development**, and **Academic Research**. Visitors switch between them with a
full-screen colour sweep; each profile re-themes the page (accent, heading font,
radius, texture), highlights its own work, and surfaces its own résumé.

## Stack

| Layer    | Tech                                                            |
| -------- | -------------------------------------------------------------- |
| Backend  | Go (chi router, pgx) + JWT admin auth                          |
| Database | PostgreSQL (embedded SQL migrations)                           |
| Frontend | React + TypeScript + Vite + Tailwind CSS + Framer Motion       |
| Deploy   | Docker Compose on a single VPS, Caddy reverse proxy + auto-HTTPS |

```
backend/             Go API + migrations
frontend/            React/TS SPA
docker-compose.yml   full stack (db + api + caddy)
Caddyfile            reverse proxy / HTTPS / demo subdomains
DEPLOY.md            step-by-step production deployment guide
```

## Quick start

### 1. Configure

```bash
cp .env.example .env
# edit .env: set JWT_SECRET, POSTGRES_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
```

### 2a. Run with Docker (closest to production)

Requires Docker. Builds the SPA, builds the Go binary, runs Postgres, and starts
Caddy (which serves the site with automatic HTTPS). Set `DOMAIN=localhost` in
`.env` for a local test.

```bash
docker compose up -d --build
```

Then open `https://localhost`. The admin account is created automatically from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` on first boot — log in at `/admin/login`.

> **Production deployment** (VPS, DNS, HTTPS, and demo subdomains) is documented
> in **[DEPLOY.md](DEPLOY.md)**.

### 2b. Run natively (fast dev loop)

You need a running PostgreSQL. Point `DATABASE_URL` in `.env` at it, then:

```bash
# terminal 1 — API on :8090 (runs migrations + seeds categories on boot)
cd backend
go run ./cmd/server

# terminal 2 — Vite dev server on :5173 (proxies /api → :8090)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Admin: `http://localhost:5173/admin/login`.

## How content maps to the site

- **Categories** (`game`, `software`, `research`) are seeded; each has a `theme`
  and `accentColor` that drive the per-profile look.
- **Projects / skills / certifications / achievements** are tagged with one or
  more categories (many-to-many). The **ALL** view shows everything; a category
  view floats its items to the top and dims the rest, and switches the theme.
- **Education** and **work experience** are global (shown on every profile).
- **Résumés**: 0 or 1 per category, plus one flagged `is_main` for the ALL view.
- **Images**: each project/cert can have many; one is flagged `is_cover` for the
  card. Uploads are stored on disk (`UPLOAD_DIR`) and served from `/uploads/...`.

## API surface

```
GET  /api/health
GET  /api/profile            GET  /api/categories
GET  /api/projects           GET  /api/projects/{slug}
POST /api/projects/{slug}/view
POST /api/auth/login

# admin (Bearer token)
GET    /api/admin/me         POST   /api/admin/uploads
PUT    /api/admin/profile    PUT    /api/admin/social-links
GET    /api/admin/projects   POST   /api/admin/projects
PUT    /api/admin/projects/{id}      DELETE /api/admin/projects/{id}
POST   /api/admin/projects/{id}/images
PUT    /api/admin/projects/{id}/cover/{imageId}
DELETE /api/admin/project-images/{id}
```

## Using the admin

1. Open the site and click **⚙ Admin** (top-right) or go to `/admin/login`.
2. Sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Manage everything from the tabs — no code required:
   - **Projects** – create/edit, Markdown description, tech, demo links, categories,
     publish/draft, featured, and a per-project image gallery (set the cover image).
   - **Certifications** – cover image + extra images, issuer, dates, categories.
   - **Skills / Achievements** – tagged by profile so they highlight per category.
   - **Education / Experience** – global (shown on every profile).
   - **Résumés** – upload a PDF per profile, plus one “Main” for the ALL view.
   - **Profile** – your photo, bio, contact info, and social links.
   - **Messages** – submissions from the contact form.

Anything marked **Draft** stays hidden on the public site until you publish it.

## Features

- All content types (projects, certifications, skills, achievements, education,
  experience, résumés, contact) have public display and full admin CRUD.
- Homepage with hero, ALL/Game/Software/Research switching via a colour sweep,
  per-profile theming (pixel-art for game dev), and category highlighting.
- Projects without a cover image get a generated one, themed by discipline and
  seeded from the slug, so every card looks intentional.
