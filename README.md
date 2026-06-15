# Base62 — URL Shortener

<p align="center">
  <img src="https://img.shields.io/badge/node-22%2B-339933?logo=node.js" alt="Node 22+"/>
  <img src="https://img.shields.io/badge/next.js-16-000000?logo=nextdotjs" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/typescript-6-3178C6?logo=typescript" alt="TypeScript 6"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"/>
  <br/>
  <img src="https://img.shields.io/badge/tests-108%20passing-brightgreen" alt="108 tests passing"/>
  <img src="https://img.shields.io/badge/status-production%20ready-228B22" alt="Production Ready"/>
</p>

Production-grade URL shortener built with Next.js 16, Drizzle ORM, Redis, and Postgres. Gold/black luxury aesthetic with real-time analytics, custom slugs, rate limiting, and batched event processing.

---

## Features

- ⚡ **Fast redirects** — Redis-cached, sub-millisecond hot path
- 🔗 **Custom slugs** — Pick your own alias (6+ chars, reserved-word filtered)
- 📊 **Real-time analytics** — Clicks, scans, interactive charts with configurable time ranges
- 🖼️ **QR codes** — Stylable, downloadable QR for every shortened URL
- 🚦 **Rate limiting** — Per-IP Redis sliding window with informative headers
- 📦 **Batched analytics** — QStash-backed queue removes write load from redirect path
- 🌙 **Dark mode** — Gold/black luxury palette, theme-aware
- ✅ **108 tests** — Pure functions, mocked services, and integration tests

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 |
| Database | PostgreSQL + Drizzle ORM |
| Cache | Redis (Upstash) |
| Queue | Upstash QStash (batched analytics) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| Charts | ApexCharts (dynamic import, SSR off) |
| QR | qr-code-styling |
| Toasts | Sonner (Framer Motion powered) |
| Validation | Zod |
| Testing | Vitest + happy-dom |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── v1/               ← versioned public API
│   │   │   ├── shorten/       POST  — create short URL
│   │   │   ├── urls/[code]/   GET   — URL info
│   │   │   ├── analytics/     GET   — click/scan stats
│   │   │   │   ├── [code]/
│   │   │   │   ├── consume/
│   │   │   │   └── flush/
│   │   │   └── health/        GET   — health check
│   │   └── internal/          ← not for external consumers
│   │       └── qstash/setup/
│   ├── r/[code]/              ← redirect handler
│   ├── layout.tsx
│   └── page.tsx               ← landing (shorten form + list)
├── components/
│   ├── layout/               header, footer, theme-toggle, loader
│   ├── features/
│   │   ├── url-shortener/    input form, URL list
│   │   ├── analytics/        modal, chart, stats-cards, time-range
│   │   └── qr-code/          QR modal
│   └── ui/                   button, input, card primitives
├── hooks/                    use-url-shortener, use-analytics, use-copy-to-clipboard
├── lib/
│   ├── api/                  errors (AppError), response helpers, rate-limit
│   ├── cache/                Redis client, cache key patterns
│   ├── config/               Zod-validated env config (singleton)
│   ├── counter/              distributed counter (ID generation)
│   ├── db/                   Drizzle client + schema (urls, analytics, counters)
│   ├── encoding/             base62 encode/decode, ID obfuscation
│   ├── queue/                analytics buffer + QStash publisher
│   ├── utils/                URL validation, time formatting
│   └── validation/           Zod schemas for URL, slug, analytics events
├── constants/                app config, analytics ranges, rate limits, reserved slugs
├── types/                    shared TypeScript types
├── instrumentation.ts        startup validation
└── middleware.ts             security headers

tests/
├── unit/                    pure function tests (encoding, validation, api, cache, etc.)
├── integration/             endpoint tests (health)
├── setup.ts                 env vars + console mocks
└── vitest.config.mts
```

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL (local or [Supabase](https://supabase.com))
- Redis (local or [Upstash](https://upstash.com))

### Local Setup

```bash
git clone <repo-url>
cd base62

npm install

cp .env.example .env.local
# Edit .env.local with your credentials — see env vars table below

npm run db:push
npm run dev
```

Dev server starts at [http://localhost:3000](http://localhost:3000). `.env.local` is auto-loaded by Next.js.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_URL` | Yes | — | Public base URL (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SERVER_ID` | Yes | — | Obfuscation salt (unique per server instance) |
| `COUNTER_START` | Yes | — | Starting ID for distributed counter |
| `COUNTER_END` | Yes | — | Max ID for distributed counter |
| `REDIS_URL` | No | — | Redis connection string (cache + rate-limiting) |
| `QSTASH_TOKEN` | No | — | Upstash QStash token (prod analytics queue) |
| `QSTASH_URL` | No | — | QStash endpoint override |
| `QSTASH_CURRENT_SIGNING_KEY` | No | — | QStash signature verification (current) |
| `QSTASH_NEXT_SIGNING_KEY` | No | — | QStash signature verification (next rotation) |

> Redis and QStash are optional for development — the app degrades gracefully (direct DB writes, no caching).

## Deploy to Production

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Set production environment variables (use a separate `.env` for secrets)
4. Deploy

```bash
# Build with production env
dotenv -e production.env -- next build

# Or on Vercel, env vars are configured in the dashboard
```

### Docker

```bash
docker build -t base62 .
docker run -p 3000:3000 --env-file production.env base62
```

### Production Checklist

- [ ] PostgreSQL database provisioned and migrated
- [ ] Redis instance configured with TLS
- [ ] `NEXT_PUBLIC_URL` set to your real domain
- [ ] Unique `SERVER_ID` per server instance
- [ ] QStash endpoints configured with public-facing URLs (not localhost)
- [ ] Environment-specific `.env` files gitignored

## API

### `POST /api/v1/shorten`

Create a short URL. Rate-limited (10 req/min per IP).

```json
{ "longUrl": "https://example.com/very/long/url" }
// → { "code": "aB3xYz", "shortUrl": "http://localhost:3000/r/aB3xYz" }
```

With custom slug:

```json
{ "longUrl": "https://example.com", "slug": "my-custom-link" }
// → { "code": "my-custom-link", "shortUrl": "http://localhost:3000/r/my-custom-link", "slug": "my-custom-link" }
```

Slug rules:
- 6–32 characters
- Letters, numbers, and hyphens only
- Cannot start or end with a hyphen
- Reserved words blocked (api, admin, login, etc.)

### `GET /r/[code]`

Redirect to original URL. Supports both legacy obfuscated IDs and custom slugs. Tracks click/scan analytics.

| Query param | Value | Effect |
|-------------|-------|--------|
| `source=qr` | `qr` | Tracks as a scan instead of a click |

### `GET /api/v1/health`

```json
{ "status": "ok", "timestamp": "2025-06-15T10:00:00.000Z", "uptime": 1234 }
```

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /api/v1/shorten` | 10 req/min per IP |
| `GET /api/v1/analytics/*` | 30 req/min per IP |

Responses include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers. System fails open (allows traffic) if Redis is unavailable.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (requires DATABASE_URL) |
| `npm run start` | Start production server |
| `npm run test` | Run all tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Launch Drizzle Studio (DB GUI) |
| `npm run lint` | ESLint |

## Testing

```bash
npm test
```

18 test files, 108 tests covering:

- **Encoding** — base62 roundtrip, obfuscation within MOD range
- **Validation** — URL formats, slug rules (length, charset, reserved), analytics events
- **API** — error classes, response helpers, rate limiter (mocked Redis)
- **Config** — env schema parsing with Zod
- **Queue** — analytics buffer (push/peek/clear), publisher (DB insert + counter update)
- **Integration** — health endpoint shape and field types
- **Constants** — analytics ranges, reserved slugs, rate limit config

## Architecture

### URL Shortening Flow

```
POST /api/v1/shorten
  → Rate limit check (Redis)
  → Zod validation (URL format + optional slug)
  → If slug: check uniqueness (DB), use as code
  → If no slug: getNextID → obfuscate → encodeBase62
  → Insert into Postgres
  → Return { code, shortUrl }
```

### Redirect Flow

```
GET /r/:code
  → Try slug lookup (DB → Redis cache)
  → If not slug: decodeBase62 → deobfuscate → query by ID
  → Fire analytics event (QStash or direct DB)
  → Cache result in Redis
  → 301 redirect to long URL
```

### Analytics Pipeline

```
Click → bufferEvent(lPush to Redis list)
  → Endpoint flushes buffer (peek → batch insert → clear)
  → Updates url counters (totalClicks / totalScans)
```

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| QStash returns "invalid destination URL" | QStash can't reach localhost | Use ngrok or deploy to a public URL |
| `curl -X POST` fails on Windows | PowerShell aliases `curl` to `Invoke-WebRequest` | Use `curl.exe` instead of `curl` |
| FK constraint on URL delete | Analytics rows reference the URL | Deletes cascade automatically |
| Sonner toast invisible | CSS override conflict | Remove custom toast CSS, use `style` prop |
| Redis connection refused | `REDIS_URL` not set or wrong | App falls back gracefully — check logs |
| `db:push` fails | DATABASE_URL not set in env file | Ensure `production.env` has valid connection string |

## Roadmap

- [ ] Authentication (OAuth + session management)
- [ ] Analytics dashboard page (dedicated route, geo/referrer breakdown)
- [ ] Link expiration (auto-delete after TTL)
- [ ] Bulk URL import (CSV upload)
- [ ] QR download as SVG/PDF
- [ ] Swagger API docs at `/api/docs`
- [ ] Docker Compose dev environment

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit with conventional commits (`feat:`, `fix:`, `chore:`, etc.)
4. Run tests (`npm test`) — ensure all pass
5. Push and open a PR

## License

MIT
