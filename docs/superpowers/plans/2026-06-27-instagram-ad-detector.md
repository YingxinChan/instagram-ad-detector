# Instagram Ad Detector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Next.js app where a user pastes Instagram embed code, clicks Analyze, and sees an ad/not-ad flag with a confidence percentage returned from an external REST API.

**Architecture:** The page (`src/app/page.tsx`) is a client component that POSTs to a local Next.js API route (`/api/analyze`). The API route proxies the request to an external model API whose URL is stored in `ANALYZE_API_URL` env var — keeping the URL server-side and avoiding CORS issues.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Jest 30 + Testing Library

## Global Constraints

- All components that use state or event handlers must have `'use client'` at the top of the file
- Route handlers live in `src/app/api/<name>/route.ts` and export named HTTP method functions
- The external API response shape is assumed to be `{ isAd: boolean, confidence: number }` where `confidence` is 0–1; adjust if the friend's API differs
- `ANALYZE_API_URL` must be set in `.env.local` for the app to function; the route returns HTTP 500 if it is missing
- Run `npm test` to execute the test suite

---

### Task 1: API proxy route

**Files:**
- Create: `src/app/api/analyze/route.ts`
- Create: `src/app/api/analyze/__tests__/route.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks
- Produces: `POST /api/analyze` — accepts `{ embedCode: string }`, forwards to `process.env.ANALYZE_API_URL`, returns the external API's JSON response with its original status code

- [ ] **Step 1: Write the failing tests**

Create `src/app/api/analyze/__tests__/route.test.ts`:

```ts
import { POST } from '../route'
import { NextRequest } from 'next/server'

const FAKE_URL = 'http://fake-api.test/analyze'

beforeEach(() => {
  process.env.ANALYZE_API_URL = FAKE_URL
})

afterEach(() => {
  delete process.env.ANALYZE_API_URL
  jest.restoreAllMocks()
})

test('forwards embedCode to ANALYZE_API_URL and returns response', async () => {
  const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ isAd: true, confidence: 0.94 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )

  const request = new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ embedCode: '<blockquote>test</blockquote>' }),
    headers: { 'Content-Type': 'application/json' },
  })

  const response = await POST(request)
  const data = await response.json()

  expect(mockFetch).toHaveBeenCalledWith(
    FAKE_URL,
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ embedCode: '<blockquote>test</blockquote>' }),
    })
  )
  expect(data).toEqual({ isAd: true, confidence: 0.94 })
  expect(response.status).toBe(200)
})

test('returns 500 when ANALYZE_API_URL is not set', async () => {
  delete process.env.ANALYZE_API_URL

  const request = new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ embedCode: 'test' }),
    headers: { 'Content-Type': 'application/json' },
  })

  const response = await POST(request)
  expect(response.status).toBe(500)
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- src/app/api/analyze/__tests__/route.test.ts
```

Expected: FAIL — "Cannot find module '../route'"

- [ ] **Step 3: Implement the route**

Create `src/app/api/analyze/route.ts`:

```ts
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const apiUrl = process.env.ANALYZE_API_URL
  if (!apiUrl) {
    return Response.json({ error: 'API URL not configured' }, { status: 500 })
  }

  const body = await request.json()

  const upstream = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()
  return Response.json(data, { status: upstream.status })
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- src/app/api/analyze/__tests__/route.test.ts
```

Expected: PASS — 2 tests

- [ ] **Step 5: Add env var placeholder**

Create `.env.local` in the project root:

```
ANALYZE_API_URL=http://localhost:8000/analyze
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/analyze/route.ts src/app/api/analyze/__tests__/route.test.ts .env.local
git commit -m "feat: add /api/analyze proxy route"
```

---

### Task 2: Home page UI

**Files:**
- Modify: `src/app/page.tsx` (replace default boilerplate entirely)
- Create: `src/app/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `POST /api/analyze` — sends `{ embedCode: string }`, receives `{ isAd: boolean, confidence: number }`
- Produces: nothing (terminal UI component)

- [ ] **Step 1: Write the failing tests**

Create `src/app/__tests__/page.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../page'

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ isAd: false, confidence: 0.87 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('renders textarea and disabled analyze button', () => {
  render(<Home />)
  expect(
    screen.getByPlaceholderText('Paste Instagram embed code here…')
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeDisabled()
})

test('enables analyze button when textarea has content', () => {
  render(<Home />)
  fireEvent.change(
    screen.getByPlaceholderText('Paste Instagram embed code here…'),
    { target: { value: '<blockquote>test</blockquote>' } }
  )
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled()
})

test('shows result badge and confidence after successful analysis', async () => {
  render(<Home />)
  fireEvent.change(
    screen.getByPlaceholderText('Paste Instagram embed code here…'),
    { target: { value: '<blockquote>test</blockquote>' } }
  )
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(screen.getByText('Not an Ad')).toBeInTheDocument()
    expect(screen.getByText('87% confidence')).toBeInTheDocument()
  })
})

test('shows error message on API failure', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
  render(<Home />)
  fireEvent.change(
    screen.getByPlaceholderText('Paste Instagram embed code here…'),
    { target: { value: '<blockquote>test</blockquote>' } }
  )
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(
      screen.getByText('Analysis failed. Please try again.')
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- src/app/__tests__/page.test.tsx
```

Expected: FAIL — tests will fail because the page still shows the default Next.js boilerplate

- [ ] **Step 3: Implement the page**

Replace the entire contents of `src/app/page.tsx`:

```tsx
'use client'

import { useState } from 'react'

type AnalysisResult = {
  isAd: boolean
  confidence: number
}

export default function Home() {
  const [embedCode, setEmbedCode] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedCode }),
      })

      if (!response.ok) {
        throw new Error('Non-2xx response')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-2xl px-6 py-16 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Instagram Ad Detector
        </h1>

        <textarea
          className="w-full h-48 p-3 border border-zinc-300 rounded-lg font-mono text-sm resize-none dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          placeholder="Paste Instagram embed code here…"
          value={embedCode}
          onChange={(e) => setEmbedCode(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={!embedCode.trim() || loading}
          className="self-start px-6 py-2 rounded-full bg-zinc-900 text-white font-medium disabled:opacity-40 hover:bg-zinc-700 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}

        {result && (
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                result.isAd
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}
            >
              {result.isAd ? 'Ad' : 'Not an Ad'}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 text-sm">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- src/app/__tests__/page.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: PASS — all tests across both test files

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/__tests__/page.test.tsx
git commit -m "feat: add home page UI with textarea, analyze button, and result display"
```
