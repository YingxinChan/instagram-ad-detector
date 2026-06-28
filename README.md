# AdLens

**Making influencer promotions transparent.**

AdLens checks whether an Instagram post is likely a paid partnership and
shows the signals behind the call — so people can judge sponsored content for
themselves. Built at the Wise × HuddleHive Women in Tech Hackathon.

## Why it matters

Sponsorship disclosure on social media is inconsistent. Per the UK advertising
regulator, only 57% of influencer ads met disclosure rules, 9% used unclear
wording, and 34% had no disclosure at all. AdLens surfaces those gaps
the way Wise surfaces hidden fees: by making the hidden visible.

## How it works

1. **Frontend** (`src/app/page.tsx`) — a Next.js page where you paste an
   Instagram embed code, the caption text, or both.
2. **API route** (`src/app/api/analyze/route.ts`) — forwards the post to the
   analysis service set in `ANALYZE_API_URL` and normalises the response into a
   verdict, a confidence score, and a list of signals.
3. **Result** — shown as a disclosure label: a verdict chip, a confidence meter,
   and the transparency signals that drove the assessment.

## Getting the embed code

1. Open the post on Instagram in a desktop browser (instagram.com).
2. Click the `•••` menu at the top-right of the post.
3. Choose **Embed**.
4. Click **Copy embed code**.
5. Paste it into the app and hit Analyze.

> Embed is only offered on the desktop web and won't appear for some private
> accounts.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set the analysis backend before running:

```bash
# .env.local
ANALYZE_API_URL=https://your-analysis-endpoint
```

## Test

```bash
npm test
```

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Jest + Testing Library
