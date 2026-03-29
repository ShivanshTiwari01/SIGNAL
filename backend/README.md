# FLUX AI -- Backend

REST API server for the FLUX AI platform. Built with Express 5, TypeScript, Prisma ORM, PostgreSQL, and Redis.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Docker](#docker)
- [Scripts](#scripts)

---

## Tech Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| Runtime         | Node.js 24 (Alpine)                      |
| Language        | TypeScript 5.9                           |
| Framework       | Express 5                                |
| ORM             | Prisma 7 (with `@prisma/adapter-pg`)     |
| Database        | PostgreSQL                               |
| Cache           | Redis (via ioredis)                      |
| Auth            | Clerk (`@clerk/express`) + Svix webhooks |
| Validation      | Zod 4                                    |
| Logging         | Pino + pino-pretty                       |
| Security        | Helmet, CORS, express-rate-limit         |
| Package Manager | pnpm 10                                  |

---

## Architecture

The server follows a modular, feature-based structure:

- **Entry point** -- `src/index.ts` bootstraps database and Redis connections, then starts the HTTP server.
- **App setup** -- `src/app.ts` configures middleware (Helmet, CORS, compression, rate limiting, Clerk auth, request logging).
- **Routing** -- `src/routes.ts` aggregates feature routers and mounts them under `/api`.
- **Feature modules** -- Each feature (e.g. `auth`, `chat`) lives under `src/api/<feature>/` with its own controller, routes, validation, and helpers.
- **Database** -- Prisma Client is initialized with the `@prisma/adapter-pg` driver adapter in `src/config/db.ts`.
- **Caching** -- Redis client is configured in `src/config/redis.ts`.

---

## Prerequisites

- Node.js >= 24
- pnpm >= 10
- PostgreSQL instance
- Redis instance
- Clerk account (for authentication)

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables** (see [Environment Variables](#environment-variables))

4. **Generate Prisma client**

   ```bash
   pnpm prisma:generate
   ```

5. **Run database migrations**

   ```bash
   pnpm prisma:migrate
   ```

6. **Start the development server**

   ```bash
   pnpm dev
   ```

   The server starts on `http://localhost:3000` by default.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable               | Description                            | Required |
| ---------------------- | -------------------------------------- | -------- |
| `DATABASE_URL`         | PostgreSQL connection string           | Yes      |
| `PORT`                 | Server port (default: `3000`)          | No       |
| `REDIS_HOST`           | Redis host (default: `localhost`)      | No       |
| `REDIS_PORT`           | Redis port (default: `6379`)           | No       |
| `REDIS_PASSWORD`       | Redis password                         | No       |
| `CLERK_WEBHOOK_SECRET` | Svix webhook signing secret from Clerk | Yes      |

---

## Database

### Schema Overview

The Prisma schema defines the following models:

| Model             | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `User`            | Core user record linked to Clerk, plan, and Stripe |
| `UserProfile`     | Extended profile (name, bio, avatar, DOB)          |
| `Session`         | Active sessions with device/location metadata      |
| `Subscription`    | Stripe subscription tracking with status           |
| `Payment`         | Payment intent records with status tracking        |
| `Usage`           | Daily usage metrics (requests, tokens, cost)       |
| `Conversations`   | Chat conversation containers                       |
| `Messages`        | Individual messages within conversations           |
| `MessageMetadata` | Metadata for messages (tokens, model, latency)     |
| `Attachment`      | File attachments on messages                       |
| `ApiUsage`        | Per-model API usage tracking                       |

### Common Commands

```bash
# Generate Prisma client after schema changes
pnpm prisma:generate

# Create and apply a new migration
pnpm prisma:migrate

# Open Prisma Studio (visual database browser)
pnpm prisma:studio
```

---

## API Reference

Base URL: `/api`

### Authentication

| Method | Endpoint           | Description                             |
| ------ | ------------------ | --------------------------------------- |
| POST   | `/api/auth/signup` | Clerk webhook handler for user creation |

The signup endpoint verifies incoming Clerk webhooks via Svix signature validation, then creates a corresponding user record in the database on `user.created` events.

Additional API modules (e.g. `chat`) are under development.

---

## Project Structure

```
backend/
  prisma/
    schema.prisma          -- Database schema
    migrations/            -- Migration history
  src/
    index.ts               -- Server entry point
    app.ts                 -- Express app configuration
    routes.ts              -- Root router
    api/
      auth/                -- Authentication module
        auth.controller.ts
        auth.helper.ts
        auth.routes.ts
        auth.validation.ts
      chat/                -- Chat module (WIP)
    config/
      db.ts                -- Prisma client setup
      redis.ts             -- Redis client setup
    generated/
      prisma/              -- Generated Prisma client
    middleware/             -- Custom middleware
  Dockerfile
  prisma.config.ts         -- Prisma configuration
  tsconfig.json
  package.json
```

---

## Docker

Build and run the container:

```bash
docker build -t flux-ai-backend .
docker run -p 3120:3120 --env-file .env flux-ai-backend
```

The Dockerfile uses `node:24-alpine`, installs dependencies with pnpm, compiles TypeScript, and exposes port `3120`.

---

## Scripts

| Script            | Command                | Description                      |
| ----------------- | ---------------------- | -------------------------------- |
| `dev`             | `pnpm dev`             | Start dev server with hot reload |
| `build`           | `pnpm build`           | Compile TypeScript to `dist/`    |
| `start`           | `pnpm start`           | Run compiled output from `dist/` |
| `prisma:generate` | `pnpm prisma:generate` | Generate Prisma client           |
| `prisma:migrate`  | `pnpm prisma:migrate`  | Run database migrations          |
| `prisma:studio`   | `pnpm prisma:studio`   | Open Prisma Studio               |

---

## Rate Limiting

The API enforces rate limiting at 100 requests per 15-minute window per IP address. Exceeding this limit returns a `429 Too Many Requests` response.

---

## License

ISC
