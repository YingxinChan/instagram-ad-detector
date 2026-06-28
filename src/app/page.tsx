'use client'

import { useState } from 'react'

type AnalysisResult = {
  isAd: boolean
  confidence: number
  verdict?: string
  reasons?: string[]
  analysis?: string | null
  analysisSource?: 'llm' | 'fallback' | null
}

export default function Home() {
  const [embedCode, setEmbedCode] = useState('')
  const [caption, setCaption] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canAnalyze = (embedCode.trim() || caption.trim()) && !loading

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedCode, caption }),
      })

      if (!response.ok) {
        throw new Error('Non-2xx response')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch {
      setError('Something went wrong reading that post. Check your input and try again.')
    } finally {
      setLoading(false)
    }
  }

  const pct = result ? Math.round(result.confidence * 100) : 0
  const flagged = result?.isAd ?? false

  return (
    <div className="flex flex-col flex-1 items-center bg-background">
      <main className="w-full max-w-3xl px-6 py-14 sm:py-20 flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            UK ASA / CAP Code · Sponsorship check
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
            AdLens
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-600 max-w-xl">
            Paste an Instagram post and see whether it&apos;s likely a paid
            partnership — and the signals behind the call. Making influencer
            promotions transparent.
          </p>
        </header>

        {/* Input */}
        <section className="flex flex-col gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Paste an embed code, the caption, or both
          </span>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="embed" className="text-sm font-medium text-zinc-700">
                Instagram embed code
              </label>
              <textarea
                id="embed"
                className="w-full h-44 p-4 rounded-xl border border-[var(--rule)] bg-white font-mono text-sm leading-relaxed resize-none text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-400 transition"
                placeholder='<blockquote class="instagram-media" ...>'
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="caption" className="text-sm font-medium text-zinc-700">
                Caption text
              </label>
              <textarea
                id="caption"
                className="w-full h-44 p-4 rounded-xl border border-[var(--rule)] bg-white text-sm leading-relaxed resize-none text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-400 transition"
                placeholder="Paste the post caption here…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          {/* How-to */}
          <details className="group rounded-xl border border-[var(--rule)] bg-zinc-50/60 overflow-hidden">
            <summary className="cursor-pointer list-none select-none px-4 py-3 flex items-center justify-between text-sm font-medium text-zinc-700 hover:bg-black/[0.02]">
              How do I get the embed code?
              <span className="font-mono text-zinc-400 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <ol className="px-5 pb-4 pt-1 flex flex-col gap-2 text-sm text-zinc-600">
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">1</span>
                Open the post on Instagram in a desktop browser (instagram.com).
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">2</span>
                Click the <span className="font-mono">•••</span> menu at the
                top-right of the post.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">3</span>
                Choose <span className="font-medium text-zinc-700">Embed</span>.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">4</span>
                Click <span className="font-medium text-zinc-700">Copy embed code</span>.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">5</span>
                Paste it in the box above and hit Analyze.
              </li>
              <li className="pt-1 text-[13px] text-zinc-400">
                Embed is only offered on the desktop web and won&apos;t appear
                for some private accounts — in that case, paste the caption
                instead.
              </li>
            </ol>
          </details>

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="self-start px-7 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 active:scale-[0.98] transition"
          >
            {loading ? 'Reading the post…' : 'Analyze'}
          </button>

          {error && <p className="text-sm text-amber-700">{error}</p>}
        </section>

        {/* Result — styled like a disclosure label */}
        {result && (
          <section className="rise-in rounded-2xl border border-[var(--rule)] bg-white overflow-hidden max-w-xl">
            <div className="border-b border-dashed border-[var(--rule)] px-5 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Disclosure check
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                  flagged
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {flagged ? 'Likely sponsored' : 'No clear signals'}
              </span>
            </div>

            <div className="px-5 py-5 flex flex-col gap-5">
              {/* Confidence meter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-zinc-600">
                    {result.verdict ?? 'Sponsorship likelihood'}
                  </span>
                  <span className="font-mono text-lg font-semibold text-zinc-900">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className={`meter-fill h-full rounded-full ${
                      flagged ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Plain-English analysis (LLM, with rule-based fallback) */}
              {result.analysis && (
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    In plain English
                  </span>
                  <p className="rounded-xl bg-zinc-50 border border-[var(--rule)] px-4 py-3 text-sm leading-relaxed text-zinc-700">
                    {result.analysis}
                  </p>
                </div>
              )}

              {/* Transparency signals */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Signals we found
                </span>
                {result.reasons && result.reasons.length > 0 ? (
                  <ul className="flex flex-col divide-y divide-dashed divide-[var(--rule)]">
                    {result.reasons.map((reason, i) => (
                      <li
                        key={i}
                        className="flex gap-3 py-2 text-sm text-zinc-700"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">
                    No specific disclosure signals surfaced in this post.
                  </p>
                )}
              </div>

              <p className="text-[13px] leading-relaxed text-zinc-400">
                This is an assessment, not a verdict — it highlights signals so
                you can judge for yourself.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
