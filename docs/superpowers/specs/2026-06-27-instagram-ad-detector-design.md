# Instagram Ad Detector — Design Spec

**Date:** 2026-06-27

## Overview

A Next.js web app where a user pastes Instagram embed code and receives a classification: whether the post is an ad, along with a confidence score. The classification is performed by an external REST API (being built separately) that the app proxies through a Next.js API route.

## Architecture

Three files constitute the core of the app:

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Client component — textarea, submit button, result display |
| `src/app/api/analyze/route.ts` | API route — proxies POST to the external model API |
| `.env.local` | `ANALYZE_API_URL` — the external model API endpoint |

## Data Flow

1. User pastes Instagram embed code into the textarea and clicks **Analyze**.
2. Browser POSTs `{ embedCode: string }` to `/api/analyze`.
3. The API route reads `process.env.ANALYZE_API_URL` and forwards the payload.
4. External API responds with `{ isAd: boolean, confidence: number }` (shape may adjust when the API is finalized).
5. Page displays the result: ad/not-ad badge + confidence percentage.

## UI

Single page, vertical layout:

1. **Header** — "Instagram Ad Detector" title
2. **Textarea** — large input, placeholder: "Paste Instagram embed code here…"
3. **Analyze button** — disabled when textarea is empty or request is in-flight; shows loading spinner during request
4. **Result area** (appears after submission):
   - Red badge "Ad" or green badge "Not an Ad"
   - Confidence as a percentage (e.g., "94% confidence")
   - Inline error message on failure: "Analysis failed. Please try again."

No navigation, no history, no sidebar — single focused flow.

## Error Handling

- **Empty input:** Analyze button is disabled; no request is sent.
- **API failure (non-2xx or network error):** Display inline error message. No retries.

## Testing

- **API route unit test:** Mock `fetch`, verify the route forwards the payload to `ANALYZE_API_URL` and returns the response correctly.
- **Page component test:** Render the page, fill the textarea, submit, assert the result badge appears.

## Out of Scope

- Model training (handled externally)
- Rendering the Instagram embed post
- Batch analysis
- Session history
- Authentication
