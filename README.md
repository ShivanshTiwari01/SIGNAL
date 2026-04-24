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

**SIGNAL** is an AI-powered trading intelligence platform focused on the Indian stock market (NIFTY50):

- **AI trading assistant** powered by Google Gemini — analyses live NIFTY50 data and answers market questions conversationally
- **Real-time stock data** for top NIFTY50 companies, cached in Redis and injected into every AI prompt
- **Multi-turn conversations** with message history, image attachment support, and pagination
- **Profile onboarding** flow after sign-up via Clerk webhook
- **Multi-tier subscriptions** (Explorer / Trader / Pro Trader) powered by Razorpay with webhook-verified payments
- **Secure authentication** via Clerk with Svix-verified webhook-driven user lifecycle management
- **Usage tracking** per user with token counts, API cost, and request metrics

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                         Client                          │
│              Next.js 16 · React 19 · Tailwind 4         │
│          Clerk Auth · Redux Toolkit · React Query       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS → api.signal.neuralenginez.in
┌──────────────────────────▼──────────────────────────────┐
│                        Backend                          │
│            Express 5 · TypeScript · Prisma 7            │
│      Clerk Webhooks · Razorpay Webhooks · Zod · Pino    │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────┐
│     PostgreSQL       │    │           Redis             │
│   (Primary Store)    │    │    (NIFTY50 stock cache)    │
└──────────────────────┘    └─────────────────────────────┘
```

| Service  | Port | Description                      |
| -------- | ---- | -------------------------------- |
| Frontend | 3002 | Next.js web application          |
| Backend  | 3001 | Express REST API (`/api` prefix) |
| Redis    | 6379 | NIFTY50 stock data cache         |

---

## Tech Stack

### Backend

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Runtime        | Node.js 24 (Alpine)                 |
| Language       | TypeScript 5.9                      |
| Framework      | Express 5                           |
| ORM            | Prisma 7 (`@prisma/adapter-pg`)     |
| Database       | PostgreSQL 16                       |
| Cache          | Redis 7 (ioredis)                   |
| Authentication | Clerk (`@clerk/express`) + Svix     |
| AI             | Google Gemini (`@google/genai`)     |
| File Storage   | Cloudinary + Multer                 |
| Payments       | Razorpay (subscriptions + webhooks) |
| Validation     | Zod 4                               |
| Logging        | Pino + pino-pretty                  |
| Security       | Helmet, CORS, express-rate-limit    |

### Frontend

| Category       | Technology                     |
| -------------- | ------------------------------ |
| Framework      | Next.js 16 (App Router)        |
| Language       | TypeScript 5                   |
| UI             | React 19 (with React Compiler) |
| Styling        | Tailwind CSS 4                 |
| Authentication | Clerk (`@clerk/nextjs`)        |
| Server State   | TanStack React Query 5         |
| Client State   | Redux Toolkit + React-Redux    |
| Forms          | React Hook Form + Zod 4        |
| HTTP Client    | Axios (configured instance)    |
| Icons          | Lucide React                   |
| Theming        | next-themes                    |
| Notifications  | Sonner                         |

---

## Project Structure

```
SIGNAL/
├── docker-compose.yml
├── .env                          # Root env: Postgres credentials + Docker build ARGs
├── backend/
│   ├── src/
│   │   ├── app.ts                # Express app setup (CORS, Helmet, rate limiting)
│   │   ├── index.ts              # Server entry point
│   │   ├── routes.ts             # Root router (/auth, /chat, /subs)
│   │   ├── api/
│   │   │   ├── auth/             # Clerk webhook handler, complete-profile
│   │   │   ├── chat/             # AI conversation controller, routes, validation
│   │   │   └── subscription/     # Razorpay plan, subscription, payment, webhook
│   │   ├── config/
│   │   │   ├── db.ts             # Prisma client
│   │   │   ├── redis.ts          # Redis client
│   │   │   └── razorpay.ts       # Razorpay client
│   │   ├── constants/
│   │   │   ├── nifty.ts          # Top NIFTY50 company symbols
│   │   │   └── subscriptionPlans.ts  # Plan definitions (Explorer/Trader/ProTrader)
│   │   ├── helpers/              # Cloudinary upload, pagination utilities
│   │   ├── middleware/           # Zod request validation middleware
│   │   └── services/             # External service wrappers
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Migration history
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                   # Next.js App Router pages
    │   │   ├── (auth)/            # Sign-in / Sign-up (Clerk)
    │   │   ├── (chat)/            # Protected chat UI with sidebar
    │   │   ├── (landing)/         # Public marketing page
    │   │   └── (onboarding)/      # Complete-profile onboarding flow
    │   ├── components/
    │   │   ├── common/            # Shared primitive components
    │   │   └── ui/                # UI component library
    │   ├── features/
    │   │   ├── auth/              # Auth components, hooks, types
    │   │   ├── chat/              # Chat window, sidebar, message bubbles, input
    │   │   └── landing/           # Landing page sections
    │   ├── store/                 # Redux store + authSlice
    │   ├── hooks/                 # Shared custom hooks (useAuthToken)
    │   ├── lib/                   # Axios instance, React Query client, utils
    │   ├── providers/             # App-level providers (React Query, Redux, Clerk)
    │   └── types/                 # Shared TypeScript types
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

# Razorpay
RAZORPAY_KEY_ID="rzp_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# CORS — set to your frontend origin
FRONTEND_URL="http://localhost:3002"

# App
PORT=3001
NODE_ENV=development
```

**`frontend/.env.local`** (local development)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

> **Note:** `NEXT_PUBLIC_*` variables are baked into the Next.js bundle at **build time**. For Docker, they are passed as build arguments (see root `.env` below) — updating them after the image is built has no effect without a rebuild.

---

### Running with Docker

The recommended way to run all services together:

```bash
# Clone the repository
git clone https://github.com/ShivanshTiwari01/signal.git
cd signal

# 1. Create backend/.env (see Environment Variables above)
# 2. Create frontend/.env (for runtime Clerk config)
# 3. Create a root .env for Docker build args and Postgres credentials:
```

**Root `.env`** (next to `docker-compose.yml`)

```env
# Postgres (used by docker-compose to provision the database)
POSTGRES_USER=signal
POSTGRES_PASSWORD=secret
POSTGRES_DB=signal

# Passed as build-time ARGs to the Next.js frontend image
NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
```

```bash
# Build and start all services
docker compose up --build

# Run in the background
docker compose up --build -d
```

Services will be available at:

- Frontend: http://localhost:3002
- Backend API: http://localhost:3001/api
- Redis: localhost:6379

> **Production:** Set `FRONTEND_URL` in `backend/.env` to your production frontend origin (e.g. `https://signal.yourdomain.com`) to allow CORS. Rebuild the frontend image whenever `NEXT_PUBLIC_*` values change.

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

### Auth (`/api/auth`)

| Method | Endpoint                 | Auth     | Description                                    |
| ------ | ------------------------ | -------- | ---------------------------------------------- |
| POST   | `/auth/signup`           | Webhook  | Clerk `user.created` webhook — creates DB user |
| PATCH  | `/auth/complete-profile` | Required | Update user profile after onboarding           |

### Chat (`/api/chat`)

| Method | Endpoint                             | Auth     | Description                                       |
| ------ | ------------------------------------ | -------- | ------------------------------------------------- |
| POST   | `/chat/conversation`                 | Required | Send message + optional image; get AI reply       |
| GET    | `/chat/conversations`                | Required | List all conversations for the authenticated user |
| GET    | `/chat/conversation/:conversationId` | Required | Fetch paginated messages for a conversation       |

> The `POST /chat/conversation` endpoint fetches live NIFTY50 stock data (cached in Redis), builds a Gemini prompt with market context and conversation history, and returns the AI response.

### Subscriptions (`/api/subs`)

| Method | Endpoint                     | Auth     | Description                                   |
| ------ | ---------------------------- | -------- | --------------------------------------------- |
| POST   | `/subs/create-plan`          | Public   | Create a Razorpay plan (admin utility)        |
| POST   | `/subs/subscription-create`  | Required | Create a Razorpay subscription for a user     |
| POST   | `/subs/verify-payment`       | Public   | Verify Razorpay payment signature             |
| POST   | `/subs/subscription-webhook` | Webhook  | Razorpay webhook — update subscription status |

---

## Database Schema

Key models and relationships:

```
User
 ├── UserProfile        (1:1)  — firstName, lastName, bio, avatar, dob
 ├── Conversations[]    (1:N)  — title, model, systemPrompt
 │    ├── Messages[]    (1:N)  — role (user|ai), content, tokenCount
 │    │    ├── MessageMetadata[]  (1:N) — latencyMs, modelUsed, tokens
 │    │    └── Attachment[]       (1:N) — fileName, fileType, fileUrl
 │    └── ApiUsage[]    (1:N)  — model, tokensUsed, cost
 ├── Subscription[]     (1:N)  — razorpay subscriptionId, status, period
 ├── Payment[]          (1:N)  — razorpay_payment_id, amount, currency, status
 └── Usage[]            (1:N)  — date, requestsCount, tokensUsed, cost
```

**Enums:**

- `Plan`: `FREE` | `TRADER` | `PROTRADER`
- `Status`: `Active` | `Inactive` | `Canceled` | `PastDue`
- `PaymentStatus`: `Pending` | `Succeeded` | `Failed` | `Canceled`

Run `pnpm prisma:studio` inside `backend/` to open Prisma Studio and browse data visually.

---

## Subscription Plans

Plans are managed via Razorpay. The `Plan` enum on the `User` model is updated after payment verification.

| Feature              | Explorer (Free) | Trader    | Pro Trader |
| -------------------- | --------------- | --------- | ---------- |
| AI conversations     | Limited         | Unlimited | Unlimited  |
| NIFTY50 market data  | ✓               | ✓         | ✓          |
| Image attachments    | ✓               | ✓         | ✓          |
| Conversation history | ✓               | ✓         | ✓          |
| Priority support     | —               | ✓         | ✓          |
| Advanced analytics   | —               | ✓         | ✓          |
| Price (INR/month)    | ₹0              | ₹1,999    | ₹19,999    |

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
