# decentralized-rpc-hubb
# Decentralized RPC Hubb

> A community-driven registry and dashboard for discovering, submitting, and monitoring decentralised blockchain RPC endpoints — built for Web3 developers who need reliable, censorship-resistant node access without vendor lock-in with love from Samuel Olaide.
Visit: https://decentralizedrpcdash.netlify.app/

[![TypeScript](https://img.shields.io/badge/TypeScript-97%25-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tested-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [The Problem It Solves](#the-problem-it-solves)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Licence](#licence)

---

## Overview

**Decentralized RPC Hubb** is a full-stack web application that serves as an open registry for blockchain RPC providers. Users can browse available RPC endpoints across multiple networks, submit new providers to the directory, and view provider metadata — all without relying on a centralised gatekeeper like Infura or Alchemy.

The backend is powered by [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions), giving the project a serverless, scalable data layer with Row-Level Security (RLS) policies for safe, permissioned data access.

---

## The Problem It Solves

Developers building decentralised applications (dApps) typically depend on centralised RPC providers such as Infura, Alchemy, or QuickNode. These services introduce single points of failure, can enforce rate limits, and may be subject to geographic restrictions or policy-driven shutdowns.

Decentralized RPC Hubb addresses this by:

- Providing a **publicly curated directory** of community-verified RPC endpoints
- Enabling developers to **discover fallback providers** across multiple chains
- Removing the need to sign up for a proprietary API key just to connect to a blockchain node

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Frontend Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend & Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Testing | Vitest |
| Linting | ESLint |

---

## Architecture

```
┌─────────────────────────────────────────┐
│            React Frontend               │
│   (Vite · TypeScript · Tailwind CSS)    │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Provider │  │ Network  │  │ Auth  │ │
│  │ Registry │  │ Selector │  │ Flow  │ │
│  └────┬─────┘  └────┬─────┘  └───┬───┘ │
└───────┼──────────────┼────────────┼─────┘
        │              │            │
        ▼              ▼            ▼
┌─────────────────────────────────────────┐
│              Supabase                   │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ PostgREST│  │   Auth   │  │ Edge  │ │
│  │   API    │  │ (JWT)    │  │  Fns  │ │
│  └────┬─────┘  └──────────┘  └───────┘ │
│       │                                 │
│  ┌────▼──────────────────────────────┐  │
│  │         PostgreSQL Database       │  │
│  │  rpc_providers · networks · users │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

The frontend communicates exclusively with Supabase's auto-generated REST API and Realtime subscriptions. No custom server or API layer is required — Supabase handles authentication, database queries, and RLS enforcement.

---

## Prerequisites

Ensure the following are installed before proceeding:

- [Node.js ≥ 18](https://nodejs.org/en/download)
- [npm ≥ 9](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [Bun](https://bun.sh/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) — required for local Supabase development
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — required by the Supabase local stack

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cercuit-ola/decentralized-rpc-hubb.git
cd decentralized-rpc-hubb
```

### 2. Install Dependencies

```bash
npm install
```

---

## Environment Configuration

A `.env` file is required at the project root. Copy the example template and populate it with your Supabase project credentials:

```bash
cp .env.example .env
```

Edit `.env` with the following variables:

```env
# Supabase Project URL (found in: Supabase Dashboard → Settings → API)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co

# Supabase Anon/Public Key (safe to expose in client-side code)
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

> **Security note:** Never use the `service_role` key in the frontend. The `anon` key is intentionally public and is protected by Supabase Row-Level Security (RLS) policies.

---

## Running the App

Start the local development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` with hot module replacement (HMR) enabled.

### Build for Production

```bash
npm run build
```

The compiled output is written to the `dist/` folder and is ready for deployment to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

Preview the production build locally before deploying:

```bash
npm run preview
```

---

## Running Tests

This project uses [Vitest](https://vitest.dev/) as the test runner, configured via `vitest.config.ts`.

Run the full test suite:

```bash
npm run test
```

Run tests in watch mode during development:

```bash
npm run test -- --watch
```

Generate a coverage report:

```bash
npm run test -- --coverage
```

---

## Project Structure

```
decentralized-rpc-hubb/
│
├── public/                     # Static assets (favicon, OG images)
│
├── src/
│   ├── components/             # Reusable UI components (shadcn/ui + custom)
│   ├── pages/                  # Route-level page components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Supabase client initialisation, utilities
│   ├── types/                  # Shared TypeScript type definitions
│   └── main.tsx                # App entry point
│
├── supabase/
│   ├── migrations/             # Versioned SQL migration files
│   ├── functions/              # Supabase Edge Functions (Deno)
│   └── config.toml             # Local Supabase stack configuration
│
├── .env                        # Local environment variables (not committed)
├── .env.example                # Environment variable template
├── components.json             # shadcn/ui component configuration
├── eslint.config.js            # ESLint rules
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test runner configuration
└── index.html                  # HTML entry point
```

---

## Contributing

Contributions are welcome — especially additions of new verified RPC endpoints, bug reports, and UI improvements.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/).
4. Open a Pull Request against the `main` branch with a clear summary of your changes.

Please ensure all existing tests pass and add coverage for new functionality before submitting a PR.

---

## Licence

[MIT](./LICENSE) — open to use, fork, and build upon.