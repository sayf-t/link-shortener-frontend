# Link Shortener Frontend

A simple React + TypeScript frontend for the Link Shortener API. Create short links and view their statistics.

## Features

- **Create Short Links**: Enter a long URL and get a shortened version
- **View Statistics**: Check click counts, country breakdowns, and date-based analytics for any short link
- **Copy to Clipboard**: Easily copy short URLs with one click

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- The Link Shortener API running (default: http://localhost:3000)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file (or copy `.env.example`) to configure the API URL:

```bash
VITE_API_URL=http://localhost:3000
```

If not set, it defaults to `http://localhost:3000`.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Create a Short Link**: Enter a URL in the "Create Short Link" section and click "Shorten"
2. **View Stats**: Enter a short code in the "View Stats" section and click "Get Stats"

## API Endpoints Used

- `POST /api/v1/links` - Create a new short link
- `GET /api/v1/links/:short_code/stats` - Get statistics for a short link

See the [API README](../link-shortener-api/README.md) for more details.

---

# link-shortener-frontend
