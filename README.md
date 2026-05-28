# THIS IS BALI — Booking Platform

A migration of the THIS IS BALI WordPress site to a faster, cleaner React + Node.js
stack: a marketing landing page, an end-to-end booking flow, and an admin area for
viewing submitted bookings.

- **Landing** — `/`
- **Booking flow** — `/booking`
- **Admin dashboard** — `/admin`

---

## Tech Stack

| Layer        | Technology                        | Why |
|--------------|-----------------------------------|-----|
| Frontend     | React 18 + Vite + Tailwind CSS    | Instant HMR, tiny production build, utility-first styling for a fully custom UI |
| Routing      | React Router v6                   | Client-side routing across the three pages |
| Backend      | Node.js + Express                 | REST API in a layered (MVC-style) architecture |
| Validation   | Zod                               | Declarative, type-safe request validation |
| Security     | Helmet + express-rate-limit       | Hardened headers; abuse protection on the public endpoint |
| Database     | PostgreSQL (`pg`)                 | Relational store; parameterized queries only |
| Public URL   | Cloudflare Tunnel (`cloudflared`) | HTTPS access to the backend without opening VPS ports — also a clean deploy story |

---

## Repository Structure

```
thisbali-booking/
├── README.md                 # this file
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js         # entry: HTTP listen + graceful shutdown
│       ├── app.js            # express assembly: middleware + routes
│       ├── config/           # env validation (zod) + pg pool
│       ├── routes/           # endpoint definitions -> controllers
│       ├── controllers/      # thin HTTP layer (req -> service -> res)
│       ├── services/         # business logic + domain rules
│       ├── repositories/     # the only place with SQL
│       ├── models/           # domain shape + serialization
│       ├── validators/       # zod request schemas
│       ├── middleware/       # auth, validate, rate-limit, logging, errors
│       ├── utils/            # logger, ApiError, asyncHandler
│       └── db/               # schema.sql + migrate.js
└── frontend/
    ├── index.html            # loads Fraunces + Hanken Grotesk
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    ├── .env.example
    ├── public/favicon.svg
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx           # routes
        ├── LandingPage.jsx
        ├── BookingFlow.jsx   # 3-step form -> POST /api/bookings
        └── AdminDashboard.jsx# table <- GET /api/admin/bookings
```

---

## API

| Method | Route                 | Auth          | Purpose |
|--------|-----------------------|---------------|---------|
| POST   | `/api/bookings`       | public        | Create a booking |
| GET    | `/api/admin/bookings` | `x-admin-key` | List all bookings (newest first) |
| GET    | `/api/health`         | public        | Health / DB readiness probe |

**Booking payload**

```json
{
  "name": "Jane Traveller",
  "email": "jane@email.com",
  "phone": "+62...",          // optional
  "booking_date": "2026-07-12",
  "booking_time": "14:00",     // optional
  "guests": 2,
  "message": "..."             // optional
}
```

---

## Run Locally

### 1. Database

```bash
createdb bookings_db
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # set ADMIN_KEY and DATABASE_URL
npm install
npm run migrate               # applies src/db/schema.sql (idempotent)
npm run dev                   # http://localhost:4000
```

### 3. Expose the backend (trial / quick demo)

```bash
cloudflared tunnel --url http://localhost:4000
# copy the printed https://<name>.trycloudflare.com URL
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local    # set VITE_API_URL to the tunnel URL
npm install
npm run dev                   # http://localhost:5173
```

Admin: open `/admin` and enter the same `ADMIN_KEY` you set in the backend `.env`.

---

## Deploy (no VPS — Cloudflare Pages + Cloudflare Tunnel)

This is a fully **free** setup. The backend + Postgres run on your local machine and
are exposed over HTTPS by `cloudflared`; the frontend is hosted on Cloudflare Pages.

```
Cloudflare Pages (static React)  ──►  Cloudflare Tunnel  ──►  localhost:4000 (Express)  ──►  Postgres
   https://<project>.pages.dev          https://<...>.trycloudflare.com
```

### 1. Run backend + tunnel locally

```bash
cd backend
cp .env.example .env          # set ADMIN_KEY, DATABASE_URL
npm install
npm run migrate               # one-time: apply schema
npm start                     # http://localhost:4000

# in a second terminal — get a public HTTPS URL:
cloudflared tunnel --url http://localhost:4000
# -> copy the printed https://<name>.trycloudflare.com URL  (this is your API URL)
```

Keep both processes running the whole time the reviewer might test the site.
To stop them dying when you close the terminal, run them under PM2:

```bash
npm i -g pm2
pm2 start "npm start" --name thisbali-api --cwd ./backend
pm2 start "cloudflared tunnel --url http://localhost:4000" --name thisbali-tunnel
pm2 save
```

### 2. Deploy frontend to Cloudflare Pages

Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → connect your
GitHub repo, then set:

| Setting               | Value          |
|-----------------------|----------------|
| Root directory        | `frontend`     |
| Framework preset      | `Vite`         |
| Build command         | `npm run build`|
| Build output directory| `dist`         |

Add an **environment variable** (Settings → Variables, for *Production*):

```
VITE_API_URL = https://<your-name>.trycloudflare.com
```

Deploy. Your site is live at `https://<project>.pages.dev`.

> Prefer the CLI? `cd frontend && npm i -D wrangler && npm run build`
> then `npx wrangler pages deploy dist`.

### 3. Lock CORS to the Pages URL

In `backend/.env`, set:

```
CORS_ORIGINS=https://<project>.pages.dev
```

Restart the backend (`pm2 restart thisbali-api`).

### Important: the free tunnel URL changes on restart

`cloudflared tunnel --url ...` (a *quick tunnel*) hands out a **new random
`trycloudflare.com` URL every time it starts**. `VITE_API_URL` is baked into the
build by Vite, so whenever the tunnel URL changes you must:

1. update `VITE_API_URL` in the Pages project settings, and
2. trigger a redeploy (Pages → Deployments → *Retry/Redeploy*, or push a commit).

For the trial: start the tunnel once, paste that URL into Pages, deploy, and **leave
the tunnel running**. If you later want a permanent URL that survives restarts, a
*named* tunnel does that — but it needs a domain on Cloudflare (a small yearly cost).

The two SPA-routing pieces are already in the repo: `frontend/public/_redirects`
(`/* /index.html 200`) so deep links like `/booking` and `/admin` resolve, and
`frontend/.nvmrc` to pin the build's Node version.

---

## Implementation Decisions

- **Layered architecture (MVC-style).** Requests flow Route → Controller →
  Service → Repository → DB, with each layer owning one responsibility:
  controllers only handle HTTP, services hold business rules, repositories hold
  the only SQL, and models own serialization. This keeps the code testable and
  easy to extend (a new endpoint rarely touches more than its own slice).
- **Fail-fast config.** All environment variables are validated with Zod at boot
  (`config/env.js`); a missing `ADMIN_KEY` stops the process with a clear message
  rather than failing at request time.
- **Declarative validation.** Request bodies are validated and normalized by Zod
  schemas via a reusable `validate(schema)` middleware — trimming, lowercasing
  email, and coercing types in one place.
- **Centralized errors.** A typed `ApiError` plus one error-handling middleware
  produce a consistent `{ error, details }` response everywhere; unexpected errors
  are logged with a stack and masked in production.
- **Production hardening.** Helmet for security headers, `express-rate-limit`
  (stricter on the public booking route), graceful shutdown, a `/api/health`
  readiness probe, and an idempotent migration script (`npm run migrate`).
- **Parameterized SQL everywhere** — no string concatenation, so the endpoints are
  injection-safe.
- **Admin route is guarded** with a shared `x-admin-key` header rather than left
  open. The dashboard prompts for the key and keeps it in `sessionStorage`, so it is
  never baked into the JS bundle.
- **One cohesive design language** ("organic luxury": deep jungle green, warm
  sand/cream, terracotta + gold; Fraunces over Hanken Grotesk) applied across all
  three pages so the product feels intentional rather than templated.
- **Client validation mirrors the server** (required fields, email format, positive
  guest count) for instant feedback, with the server staying the source of truth.
- **Multi-step booking flow** with a progress stepper and a review screen — modelled
  on the observed list.thisbali.com journey: pick stay → enter details → confirm.
- **Real UI states** — loading skeletons, error messages, empty states, and a success
  confirmation with a booking reference — instead of happy-path-only screens.

## What I'd Improve With More Time

- Replace the shared admin key with real auth (server session or JWT) and add login.
- Add booking status management (`PATCH /api/admin/bookings/:id` for confirm/cancel)
  and email confirmations to guests.
- Pixel-match the landing page to the live site with the client's real photography
  and copy (current imagery is licensed-free placeholder pending brand assets).
- Pagination / sorting / CSV export on the admin table; date-range and status filters.
- Automated tests (Vitest + React Testing Library on the front end, Supertest on the
  API) and a CI workflow.
- Rate limiting and a captcha on the public booking endpoint to deter spam.
- A proper mobile nav drawer on the landing page (links currently collapse on small
  screens).

---

## Notes

- Hero/gallery images are Unsplash placeholders, flagged in an `IMG` constants block
  at the top of each component — swap for the client's photography in one place.
- Admin credential for the reviewer: the value of `ADMIN_KEY` from the backend `.env`
  (share it alongside the deployed URL in the submission).
