## Living IPL Scorecard

A professional, “living” IPL scorecard with:
- Auto-detection of the currently live IPL match
- Real-time refresh (every 15 seconds)
- Win probability trend (best-effort, heuristic)
- Batter/bowler tables (when available from API)
- Ball-by-ball feed (best-effort; depends on your RapidAPI plan/endpoint)

## Getting Started

### 1) Configure RapidAPI

1. Create a RapidAPI key for Cricbuzz: https://rapidapi.com/cricketapilive/api/cricbuzz-cricket
2. Copy the example env file and fill your key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and set:

- `RAPIDAPI_KEY=...`

### 2) Run the dev server

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Notes / Customization

### Match selection
Right now the site auto-selects the first IPL match found in the `/matches/v1/live` response (prefers “In Progress”). If you want a match picker UI, we can add it.

### Commentary endpoint
Some RapidAPI plans expose a separate commentary endpoint; if you know yours, set:

```bash
CRICBUZZ_COMMENTARY_PATH_TEMPLATE=/mcenter/v1/{matchId}/YOUR_ENDPOINT
```

## Deploy
Deploy as a standard Next.js app (Vercel, Netlify, etc.) and set the same env vars in your hosting provider.
