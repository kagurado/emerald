# CLAUDE.md

## Project Overview

**emerald** is a time-based billing calculator web app for "神楽堂" (Kagurado). It calculates set charges and extensions based on entry/exit times and the number of male/female customers. The app is statically exported and deployed to GitHub Pages.

## Tech Stack

- **Framework**: Next.js 14 (App Router, static export via `output: "export"`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives) + MUI (TimePicker, CircularProgress)
- **Validation**: Zod
- **Date handling**: dayjs
- **Package manager**: pnpm (managed via mise)
- **Node version**: 20.17.0
- **Deployment**: GitHub Pages via GitHub Actions (push to `main` triggers deploy)

## Project Structure

```
src/
  app/              # Next.js App Router (layout, page, globals.css, fonts)
  components/ui/    # shadcn/ui components (button, input, label, progress, select)
  features/         # Feature modules
    calculator/
      TimeCalculator/
        index.tsx   # Provider wrapper (LocalizationProvider)
        form.tsx    # Main form UI component
        action.ts   # Calculation logic (pure function)
        schema.ts   # Zod validation schema
  lib/
    utils.ts        # cn() utility (clsx + tailwind-merge)
```

## Common Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (static export to ./out)
pnpm lint         # Run ESLint
pnpm start        # Start production server (not used for static export)
```

## Key Conventions

- Path alias: `@/*` maps to `./src/*`
- UI components: shadcn/ui style in `src/components/ui/` (do not modify generated components unless necessary)
- Feature code: organized under `src/features/<domain>/<FeatureName>/`
- Client components: use `"use client"` directive (required for stateful/interactive components)
- Language: UI text is in Japanese; code (variable names, comments in code) uses English where possible
- ESLint config extends `eslint:recommended`, `next/core-web-vitals`, `next/typescript`, and `plugin:import/recommended`

## Business Logic Notes

- The calculator computes set charges for a bar/establishment
- First hour is base charge; extensions are counted in 30-minute increments
- First 9 minutes past the hour are not counted as extension (NO_EXTENSION_MINUTES = 9)
- Male and female customers have separate charge categories
- Time input is restricted: start time 18:00-04:00, end time 19:00-06:00
- If end time < start time, it's treated as crossing midnight
