# Contributing to SIGNAL

Thank you for your interest in contributing to SIGNAL. This document outlines the process and standards for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
  - [General](#general)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Project Structure Conventions](#project-structure-conventions)
- [Database Changes](#database-changes)
- [Environment & Secrets](#environment--secrets)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

All contributors are expected to:

- Be respectful and constructive in all communications
- Assume good intent and ask for clarification before escalating concerns
- Keep discussions focused on technical merit
- Not commit secrets, credentials, or personally identifiable information

---

## Getting Started

1. **Fork** the repository and clone your fork locally
2. Set up your development environment following the [README](README.md#getting-started)
3. Create a new branch from `main` for your work (see [Branch Strategy](#branch-strategy))
4. Make your changes and validate them locally
5. Open a Pull Request targeting `main`

---

## Development Workflow

```bash
# 1. Sync with upstream before starting new work
git checkout main
git pull upstream main

# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make changes, then stage and commit atomically
git add .
git commit -m "feat(chat): add streaming response support"

# 4. Push and open a PR
git push origin feat/your-feature-name
```

---

## Branch Strategy

| Branch pattern     | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `main`             | Stable, production-ready code               |
| `feat/<scope>`     | New features                                |
| `fix/<scope>`      | Bug fixes                                   |
| `chore/<scope>`    | Tooling, dependencies, non-code changes     |
| `refactor/<scope>` | Code restructuring without behavior changes |
| `docs/<scope>`     | Documentation-only changes                  |

Branch names must be lowercase and hyphen-separated. Example: `feat/stripe-webhook-handler`.

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type       | When to use                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | A new feature                                     |
| `fix`      | A bug fix                                         |
| `chore`    | Build scripts, dependency updates, config         |
| `refactor` | Code change that neither fixes nor adds a feature |
| `docs`     | Documentation only                                |
| `style`    | Formatting, missing semicolons (no logic change)  |
| `test`     | Adding or updating tests                          |
| `perf`     | Performance improvement                           |
| `ci`       | CI/CD configuration changes                       |

### Scopes (examples)

`auth`, `chat`, `db`, `redis`, `ui`, `api`, `payments`, `config`, `docker`

### Examples

```
feat(chat): add streaming AI response support
fix(auth): handle expired Clerk session tokens correctly
chore(deps): upgrade Prisma to v7.6.0
refactor(middleware): extract validation logic into shared helper
docs(readme): update environment variable reference
```

---

## Pull Request Process

1. **Keep PRs focused** — one logical change per PR. Avoid bundling unrelated fixes.
2. **Fill out the PR template** completely, including context and testing steps.
3. **Reference the issue** your PR addresses using `Closes #<issue-number>`.
4. **Self-review your diff** before requesting review — check for debug logs, commented-out code, and accidental file inclusions.
5. **All checks must pass** before a PR can be merged (lint, type-check, build).
6. **Squash commits** when merging unless the individual commits are meaningful to the history.

### PR Title Format

PR titles must follow the same convention as commits:

```
feat(scope): brief description of the change
```

---

## Coding Standards

### General

- **TypeScript strict mode** is enforced in both `backend/` and `frontend/`. Do not use `any` unless absolutely unavoidable and justified in a comment.
- All user-facing inputs must be **validated with Zod** at the API boundary.
- Do not hardcode credentials, URLs, or environment-specific values — use environment variables.
- Remove all `console.log` statements before committing. Use Pino loggers in the backend.
- Keep functions small and single-purpose. Prefer composition over complexity.

### Backend

- **Route handler signatures** follow the pattern: `controller → service → helper/repository`.
- All routes must go through the `validate` middleware before reaching the controller.
- Use Prisma transactions for operations that touch multiple tables.
- Rate limiting and authentication checks belong in middleware, not controllers.
- Return consistent JSON shapes:
  ```json
  { "success": true, "data": {} }
  { "success": false, "error": "Human-readable message" }
  ```
- Never expose raw Prisma errors or stack traces to API consumers.

**File naming:** `<name>.<type>.ts` — e.g., `chat.controller.ts`, `auth.routes.ts`, `chat.validation.ts`

### Frontend

- Follow the **feature-based module structure**: all code for a feature lives under `src/features/<feature>/`.
- **Server state** (API data) → TanStack React Query. **Client/UI state** → Redux Toolkit.
- Forms must use **React Hook Form** with Zod resolvers (`@hookform/resolvers/zod`).
- Use `cn()` from `lib/utils.ts` for conditional Tailwind class merging.
- Prefer **Server Components** for data fetching where possible; use `"use client"` only when interactivity is required.
- API calls must go through the configured Axios instance from `lib/axios.ts`, never via `fetch` directly.
- Component files use **PascalCase** (`HeroSection.tsx`). All other files use **camelCase** (`useSignals.ts`, `authSlice.ts`).

---

## Project Structure Conventions

### Adding a new backend API module

```
src/api/<module>/
├── <module>.controller.ts   # Route handlers
├── <module>.routes.ts       # Express Router definition
├── <module>.validation.ts   # Zod request schemas
└── <module>.helper.ts       # Business logic / DB queries
```

Register the new router in `src/routes.ts`:

```typescript
import moduleRoutes from './api/<module>/<module>.routes';
router.use('/<module>', moduleRoutes);
```

### Adding a new frontend feature

```
src/features/<feature>/
├── components/    # Feature-specific React components
├── hooks/         # Custom hooks (e.g., useFeatureData.ts)
├── types/         # TypeScript types and interfaces
└── constants/     # Feature-scoped constants
```

---

## Database Changes

All schema changes must be made through Prisma migrations — never modify the database directly.

```bash
# 1. Edit backend/prisma/schema.prisma

# 2. Generate and apply the migration
cd backend
pnpm prisma:migrate

# 3. Regenerate the Prisma client
pnpm prisma:generate
```

**Guidelines:**

- Migration names must be descriptive: `added_signals_table`, `change_user_plan_enum`
- Never edit or delete existing migration files — they are an auditable history
- Include both the schema change and the migration file in the same commit
- For breaking schema changes (dropping columns, renaming tables), discuss in an issue first

---

## Environment & Secrets

- **Never commit `.env` files** or any file containing real credentials
- `.env` files are listed in `.gitignore` — do not override this
- If you need to document a new environment variable, add it to the `.env` example block in [README.md](README.md#environment-variables)
- Rotate any credentials that are accidentally committed immediately

---

## Reporting Issues

When opening an issue, include:

1. **Title**: A clear, concise description of the problem
2. **Environment**: OS, Node.js version, browser (if frontend)
3. **Steps to reproduce**: Numbered, minimal reproduction steps
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens, including error messages and logs
6. **Additional context**: Screenshots, network logs, Prisma query logs if relevant

Use the appropriate label: `bug`, `enhancement`, `question`, `documentation`.
