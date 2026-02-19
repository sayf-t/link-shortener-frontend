# Link Shortener Frontend

A simple React + TypeScript app for creating short links and viewing click stats.

## Getting Started

```bash
git clone <your-repo-url>
cd link-shortener-frontend
bun install
```

## Environment

Create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:3000
# optional (for easter egg GIFs)
VITE_GIPHY_API_KEY=your_giphy_key
```

If `VITE_API_URL` is not set, it defaults to `http://localhost:3000`.

## Running Locally

```bash
bun run dev
```

Open `http://localhost:5173`.

## Scripts

- `bun run dev` - start local dev server
- `bun run build` - type-check and build production bundle
- `bun run preview` - preview production build locally
- `bun run lint` - run ESLint
- `bun run format` - format files with Prettier
- `bun run format:check` - check Prettier formatting

## Features

- Create short links from long URLs
- View per-link analytics (total clicks, countries, dates, visits)
- Copy short URLs and short codes quickly
- Local history of recently shortened links
- Optional dad-joke + GIF easter egg

## Architecture

- **Ports + adapters:** feature UI depends on interfaces (`src/ports/`), while infra lives in adapters (`src/adapters/`).  
  This makes backend/storage changes low-risk and easy to test with injected mocks.
- **Feature-first components:** UI/state stays in `src/components/`, transport details stay out of component logic.
- **CSS Modules:** styles are locally scoped (`*.module.css`) to avoid global leakage and keep refactors safe.
- **A11y by default (striving):** semantic tabs, explicit form labels, live error regions, and visible keyboard focus states.

## Interaction Details

- **Debounced actions:** submit and lookup interactions use `useDebouncedCallback` to avoid rapid repeated requests while users click quickly.
- **Why:** this reduces accidental duplicate calls, smooths UI feedback, and lowers backend load without changing user flow.

## API

This frontend uses:

- `POST /api/v1/links`
- `GET /api/v1/links/:short_code/stats`

Backend docs: [link-shortener-api/README.md](../link-shortener-api/README.md)
