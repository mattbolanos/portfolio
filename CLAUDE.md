# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `bun dev`
- **Build:** `bun run build`
- **Lint:** `bun run lint` (uses Biome)
- **Format:** `bun run format` (Biome format with `--write`)
- **Package manager:** bun (see `bun.lock`)

No test framework is configured.

## Architecture

Personal portfolio site built with **Next.js 16** (App Router) using React 19, Tailwind CSS v4, and TypeScript.

### Single-page app

Everything renders on the home page (`src/app/page.tsx`). There are no other routes. The page is a server component that uses `Suspense` boundaries around async data-fetching wrappers for Strava activities and Last.fm tracks.

### External API integrations

- **Strava** (`src/lib/api/strava.ts`): Fetches running activities for the past year via OAuth refresh token flow. Produces a heatmap (daily run aggregation) and recent runs list. Uses `"use cache"` directive and custom retry/timeout logic. Env vars: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`.
- **Last.fm** (`src/lib/api/last-fm.ts`): Fetches recent music tracks. Uses `next.revalidate` for caching. Env var: `LASTFM_API_KEY`.
- **Zod v4** schemas live in `src/lib/api/schemas/` for API response validation.

### Heatmap logic

`src/lib/strava/heatmap.ts` contains pure functions for building the GitHub-style activity heatmap (grid layout, color levels, month labels). This is computation-only with no React dependencies.

### UI layer

- **shadcn/ui** components in `src/components/ui/` (base-maia style, Hugeicons icon library)
- **Theme:** next-themes with system/light/dark via `src/components/theme/`
- **Styling:** Tailwind CSS v4 via PostCSS, with `tw-animate-css` for animations
- **React Compiler** is enabled (`reactCompiler: true` in next.config.ts)
- **React Scan** loads in development mode only (script in layout.tsx head)

### Biome config

Strict linting: no unused imports/variables/params (errors), no console (warn), organized imports and sorted attributes/keys enforced via assist actions.
