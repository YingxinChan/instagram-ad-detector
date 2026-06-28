'use client'

import { useState } from 'react'

type AnalysisResult = {
  isAd: boolean
  confidence: number
  verdict: string
  reasons: string[]
}

export default function Home() {
  const [embedCode, setEmbedCode] = useState('')
  const [caption, setCaption] = useState('')
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
        body: JSON.stringify({ embedCode: embedCode || undefined, caption }),
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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Embed Code <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            className="w-full h-28 p-3 border border-zinc-300 rounded-lg font-mono text-sm resize-none dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="Paste Instagram embed code here…"
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Caption <span className="normal-case font-normal text-red-500">*</span>
          </label>
          <textarea
            className="w-full h-40 p-3 border border-zinc-300 rounded-lg text-sm resize-none dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="Paste the post caption and hashtags here…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!caption.trim() || loading}
          className="self-start px-6 py-2 rounded-full bg-zinc-900 text-white font-medium disabled:opacity-40 hover:bg-zinc-700 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        )}

        {result && (
          <div className="flex flex-col gap-3">
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
                {Math.round(result.confidence * 100)}% chance this is a paid ad
              </span>
            </div>
            {result.verdict && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.verdict}</p>
            )}
            {result.reasons.length > 0 && (
              <ul className="flex flex-col gap-1">
                {result.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-zinc-500 dark:text-zinc-400">{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
