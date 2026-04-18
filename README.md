# SIGNAL — AI-Powered Trading Intelligence Platform

> Real-time AI signals, generative market insights, and personalized analytics for traders across equities, crypto, forex, and commodities.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Database Schema](#database-schema)
- [Subscription Plans](#subscription-plans)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**SIGNAL** delivers institutional-grade market intelligence to retail and professional traders through:

- **AI-generated trading signals** processed in real time across multiple asset classes
- **Generative insights** powered by Google Gemini — natural language summaries of market conditions
- **Personalized dashboards** curated per user strategy and risk profile
- **Multi-tier subscriptions** (Free / Pro / Enterprise) with per-user usage tracking
- **Secure authentication** via Clerk with webhook-driven user lifecycle management
- **Stripe-integrated billing** for subscription and payment management

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                         Client                          │
│              Next.js 16 · React 19 · Tailwind 4         │
│          Clerk Auth · Redux Toolkit · React Query       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (port 3002)
┌──────────────────────────▼──────────────────────────────┐
│                        Backend                          │
│            Express 5 · TypeScript · Prisma 7            │
│          Clerk Webhooks · Zod · Pino · Helmet           │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│     PostgreSQL       │    │           Redis             │
│   (Primary Store)    │    │       (Cache / Queue)       │
└──────────────────────┘    └─────────────────────────────┘
```

| Service  | Port | Description             |
| -------- | ---- | ----------------------- |
| Frontend | 3002 | Next.js web application |
| Backend  | 3001 | Express REST API        |
| Redis    | 6379 | Cache & session store   |

---

## Tech Stack

### Backend

| Category       | Technology                             |
| -------------- | -------------------------------------- |
| Runtime        | Node.js 24 (Alpine)                    |
| Language       | TypeScript 5.9                         |
| Framework      | Express 5                              |
| ORM            | Prisma 7                               |
| Database       | PostgreSQL (via `@prisma/adapter-pg`)  |
| Cache          | Redis (ioredis)                        |
| Authentication | Clerk + Svix webhooks                  |
| AI             | Google Generative AI (`@google/genai`) |
| File Storage   | Cloudinary + Multer                    |
| Payments       | Stripe                                 |
| Validation     | Zod 4                                  |
| Logging        | Pino + pino-pretty                     |
| Security       | Helmet, CORS, express-rate-limit       |

### Frontend

| Category       | Technology                     |
| -------------- | ------------------------------ |
| Framework      | Next.js 16 (App Router)        |
| Language       | TypeScript 5                   |
| UI             | React 19 (with React Compiler) |
| Styling        | Tailwind CSS 4                 |
| Authentication | Clerk                          |
| Server State   | TanStack React Query 5         |
| Client State   | Redux Toolkit + React-Redux    |
| Forms          | React Hook Form + Zod 4        |
| HTTP Client    | Axios                          |
| Icons          | Lucide React                   |
| Theming        | next-themes                    |
| Notifications  | Sonner                         |

---

## Project Structure

```
SIGNAL/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── index.ts             # Server entry point
│   │   ├── routes.ts            # Root router
│   │   ├── api/
│   │   │   ├── auth/            # Auth controller, routes, validation
│   │   │   └── chat/            # Chat/conversation controller, routes
│   │   ├── config/
│   │   │   ├── db.ts            # Prisma client
│   │   │   └── redis.ts         # Redis client
│   │   ├── helpers/             # Cloudinary, pagination utilities
│   │   ├── middleware/          # Request validation middleware
│   │   └── services/            # External service wrappers
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Migration history
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                  # Next.js App Router pages
    │   │   ├── (auth)/           # Authentication routes (Clerk)
    │   │   └── (landing)/        # Public marketing pages
    │   ├── components/           # Shared UI components
    │   ├── features/             # Feature-based modules
    │   │   ├── auth/             # Auth components, hooks, types
    │   │   └── landing/          # Landing page components
    │   ├── store/                # Redux store + slices
    │   ├── hooks/                # Shared custom hooks
    │   ├── lib/                  # Axios, React Query, utilities
    │   └── providers/            # App-level providers
    └── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) and Docker Compose (for containerized setup)
- [PostgreSQL](https://www.postgresql.org/) >= 15 (if running locally without Docker)
- [Redis](https://redis.io/) >= 7 (if running locally without Docker)

---

## Getting Started

### Environment Variables

Create environment files before running either setup.

**`backend/.env`**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/signal"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
PORT=3001
NODE_ENV=development
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

---

### Running with Docker

The recommended way to run all services together:

```bash
# Clone the repository
git clone https://github.com/your-org/signal.git
cd signal

# Create both .env files (see Environment Variables above)

# Build and start all services
docker compose up --build

# Run in the background
docker compose up --build -d
```

Services will be available at:

- Frontend: http://localhost:3002
- Backend API: http://localhost:3001
- Redis: localhost:6379

---

### Running Locally

#### Backend

```bash
cd backend

# Install dependencies
pnpm install

# Run database migrations
pnpm prisma:migrate

# Generate Prisma client
pnpm prisma:generate

# Start development server (with hot reload)
pnpm dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend runs at http://localhost:3002 and the backend at http://localhost:3001.

---

## API Overview

Base URL: `http://localhost:3001/api`

| Module | Prefix      | Description                             |
| ------ | ----------- | --------------------------------------- |
| Auth   | `/api/auth` | User registration, webhooks, profile    |
| Chat   | `/api/chat` | Conversations, messages, AI completions |

Refer to [`backend/README.md`](backend/README.md) for the full API reference including request/response schemas.

---

## Database Schema

Key models and relationships:

```
User
 ├── UserProfile       (1:1)
 ├── Session[]         (1:N)
 ├── Conversations[]   (1:N)
 │    └── Messages[]   (1:N)
 │         ├── MessageMetadata[]  (1:N)
 │         └── Attachment[]       (1:N)
 ├── Subscription[]    (1:N)
 ├── Payment[]         (1:N)
 ├── ApiUsage[]        (1:N)
 └── Usage[]           (1:N)
```

Run `pnpm prisma:studio` inside `backend/` to open Prisma Studio and browse data visually.

---

## Subscription Plans

| Feature            | Free     | Pro       | Enterprise |
| ------------------ | -------- | --------- | ---------- |
| Signals per day    | 5        | Unlimited | Unlimited  |
| Asset classes      | 1        | All       | All        |
| Data latency       | Delayed  | Real-time | Real-time  |
| AI advisor         | —        | ✓         | ✓          |
| Priority alerts    | —        | ✓         | ✓          |
| API access         | —        | ✓         | ✓          |
| White-label        | —        | —         | ✓          |
| Dedicated AI model | —        | —         | ✓          |
| Price              | $0/month | $49/month | Custom     |

---

## Scripts

### Backend (`cd backend`)

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `pnpm dev`             | Start dev server with hot reload |
| `pnpm build`           | Compile TypeScript to `dist/`    |
| `pnpm start`           | Run compiled production server   |
| `pnpm prisma:generate` | Generate Prisma client           |
| `pnpm prisma:migrate`  | Run pending database migrations  |
| `pnpm prisma:studio`   | Open Prisma Studio GUI           |

### Frontend (`cd frontend`)

| Command      | Description                   |
| ------------ | ----------------------------- |
| `pnpm dev`   | Start dev server on port 3002 |
| `pnpm build` | Build production bundle       |
| `pnpm start` | Start production server       |
| `pnpm lint`  | Run ESLint                    |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 SIGNAL

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
