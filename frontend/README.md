# SIGNAL -- Frontend

Web client for the SIGNAL AI trading platform. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Clerk authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Authentication](#authentication)
- [Styling](#styling)
- [Docker](#docker)
- [Scripts](#scripts)

---

## Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | Next.js 16 (App Router)            |
| Language        | TypeScript 5                       |
| UI Library      | React 19 (with React Compiler)     |
| Styling         | Tailwind CSS 4                     |
| Auth            | Clerk (`@clerk/nextjs`)            |
| State (Client)  | Redux Toolkit + React-Redux        |
| State (Server)  | TanStack React Query 5             |
| Forms           | React Hook Form + Zod 4 validation |
| HTTP Client     | Axios                              |
| Icons           | Lucide React                       |
| Theming         | next-themes                        |
| Notifications   | Sonner                             |
| Package Manager | pnpm 10                            |

---

## Architecture

The application uses Next.js App Router with a feature-based module structure:

- **App Router** -- Route groups organize pages by concern: `(landing)` for public pages, `(auth)` for sign-in/sign-up flows.
- **Providers** -- A root `Providers` component wraps the app with Redux store, React Query client, theme provider, and toast notifications.
- **Feature modules** -- Each feature (e.g. `landing`, `auth`) lives under `src/features/<feature>/` with its own components, constants, hooks, and types.
- **Shared utilities** -- `src/lib/` contains the Axios instance, React Query client, and helper functions like `cn()` for class merging.
- **Clerk middleware** -- `src/proxy.ts` (middleware) protects all routes except public ones (`/`, `/sign-in`, `/sign-up`) using Clerk's `auth.protect()`.
- **Redux store** -- Global client state is managed via Redux Toolkit slices under `src/store/slices/`.

---

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- Clerk account (for authentication)
- Running backend API instance

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Configure environment variables** (see [Environment Variables](#environment-variables))

4. **Start the development server**

   ```bash
   pnpm dev
   ```

   The app starts on `http://localhost:3000` by default.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable                            | Description                         | Required |
| ----------------------------------- | ----------------------------------- | -------- |
| `NEXT_PUBLIC_API_URL`               | Backend API base URL                | Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key               | Yes      |
| `CLERK_SECRET_KEY`                  | Clerk secret key                    | Yes      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Sign-in page path (e.g. `/sign-in`) | No       |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Sign-up page path (e.g. `/sign-up`) | No       |

---

## Project Structure

```
frontend/
  public/                          -- Static assets
  src/
    proxy.ts                       -- Clerk auth middleware
    app/
      layout.tsx                   -- Root layout (fonts, Clerk, providers)
      globals.css                  -- Tailwind config and design tokens
      (auth)/
        sign-in/[[...sign-in]]/    -- Clerk sign-in page
      (landing)/
        page.tsx                   -- Landing page
    components/
      common/                     -- Shared reusable components
      layout/                     -- Layout components
      ui/                         -- Base UI primitives
    constants/                    -- App-wide constants
    features/
      auth/                       -- Auth feature module
        components/
        constants/
        hooks/
        types/
      landing/                    -- Landing page feature module
        components/               -- Navbar, HeroSection, PricingSection, etc.
        constants/
        hooks/
        types/
    hooks/                        -- Shared custom hooks
    lib/
      axios.ts                    -- Configured Axios instance
      queryClient.ts              -- React Query client setup
      utils.ts                    -- Utility functions (cn)
    providers/
      Providers.tsx               -- Combined app providers
    store/
      index.ts                    -- Redux store configuration
      hooks.ts                    -- Typed Redux hooks
      slices/
        authSlice.ts              -- Auth state slice
    types/                        -- Shared TypeScript types
  Dockerfile
  next.config.ts
  tsconfig.json
  eslint.config.mjs
  postcss.config.mjs
  package.json
```

---

## State Management

The app uses a dual-state approach:

- **Client state** -- Redux Toolkit manages synchronous UI state such as authentication status. Slices are defined in `src/store/slices/` and the store is configured in `src/store/index.ts`. Typed hooks (`useAppDispatch`, `useAppSelector`) are exported from `src/store/hooks.ts`.

- **Server state** -- TanStack React Query handles all asynchronous data fetching with a default stale time of 1 minute. The client is configured in `src/lib/queryClient.ts` with devtools available in development.

---

## Authentication

Authentication is handled by Clerk:

- **Client-side** -- `ClerkProvider` wraps the entire app in the root layout. The `@clerk/nextjs` package provides pre-built sign-in/sign-up components and hooks.
- **Middleware** -- The middleware in `src/proxy.ts` uses `clerkMiddleware` to protect all routes by default. Public routes (`/`, `/sign-in`, `/sign-up`) are explicitly allowlisted via `createRouteMatcher`.
- **Backend sync** -- User creation is synced to the backend via Clerk webhooks (handled by the backend API).

---

## Styling

- **Tailwind CSS 4** with a custom design system defined via CSS custom properties in `globals.css`.
- **Design tokens** include color scales for brand, UI surfaces, status indicators, and trading-specific colors (growth, loss, chart line).
- **Dark theme by default** -- The color palette uses a deep navy background (`#060e20`) with blue accent tones.
- **Fonts** -- Geist Sans, Geist Mono, and Manrope are loaded via `next/font/google`.
- **Utility** -- The `cn()` helper in `src/lib/utils.ts` merges Tailwind classes using `clsx` and `tailwind-merge`.

---

## Docker

Build and run the container:

```bash
docker build -t signal-frontend .
docker run -p 5123:5123 --env-file .env.local signal-frontend
```

The Dockerfile uses `node:24-alpine`, installs dependencies with pnpm, builds the Next.js production bundle, and exposes port `5123`.

---

## Scripts

| Script  | Command      | Description                              |
| ------- | ------------ | ---------------------------------------- |
| `dev`   | `pnpm dev`   | Start Next.js dev server with hot reload |
| `build` | `pnpm build` | Create optimized production build        |
| `start` | `pnpm start` | Serve the production build               |
| `lint`  | `pnpm lint`  | Run ESLint checks                        |

---

## License

ISC
