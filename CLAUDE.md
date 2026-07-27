# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — a platform for playing games online and competing for the highest score. Currently an unmodified `create-next-app` scaffold; `app/layout.tsx` and `app/page.tsx` have no custom logic yet.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test suite is configured yet.

## Architecture

- Next.js 16 App Router (`app/`), React 19, TypeScript (strict mode), Tailwind CSS v4 via `@tailwindcss/postcss`.
- Path alias `@/*` maps to the project root (`tsconfig.json`).
- Next.js 16 has breaking API/convention changes from earlier versions — see `AGENTS.md`'s instruction to consult `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) before writing code, rather than relying on prior Next.js knowledge.

## Workflow

This project follows Spec Driven Design using the `Klerith/fernando-skills` skill pack (`/spec` and `/spec-impl` commands): https://github.com/Klerith/fernando-skills. Install with `npx skills@latest add Klerith/fernando-skills` if not already available.
