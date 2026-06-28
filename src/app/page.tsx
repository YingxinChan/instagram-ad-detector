'use client'

import { useState } from 'react'

type AnalysisResult = {
  isAd: boolean
  confidence: number
  verdict?: string
  reasons?: string[]
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
      setError('Something went wrong reading that post. Check the embed code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const pct = result ? Math.round(result.confidence * 100) : 0
  const flagged = result?.isAd ?? false

  return (
    <div className="flex flex-col flex-1 items-center bg-background">
      <main className="w-full max-w-xl px-6 py-14 sm:py-20 flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            UK ASA / CAP Code · Sponsorship check
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            The Fine Print
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            Paste an Instagram post and see whether it&apos;s likely a paid
            partnership — and the signals behind the call. Making influencer
            promotions as transparent as online payments.
          </p>
        </header>

        {/* Input */}
        <section className="flex flex-col gap-4">
          <label
            htmlFor="embed"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
          >
            Instagram embed code
          </label>
          <textarea
            id="embed"
            className="w-full h-44 p-4 rounded-xl border border-[var(--rule)] bg-white/70 dark:bg-zinc-900/60 font-mono text-sm leading-relaxed resize-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 focus:border-zinc-400 transition"
            placeholder='<blockquote class="instagram-media" ...>'
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
          />

          {/* How-to */}
          <details className="group rounded-xl border border-[var(--rule)] bg-white/40 dark:bg-zinc-900/40 overflow-hidden">
            <summary className="cursor-pointer list-none select-none px-4 py-3 flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
              How do I get the embed code?
              <span className="font-mono text-zinc-400 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <ol className="px-5 pb-4 pt-1 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                Choose <span className="font-medium text-zinc-700 dark:text-zinc-300">Embed</span>.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">4</span>
                Click <span className="font-medium text-zinc-700 dark:text-zinc-300">Copy embed code</span>.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-zinc-400">5</span>
                Paste it in the box above and hit Analyze.
              </li>
              <li className="pt-1 text-[13px] text-zinc-400 dark:text-zinc-500">
                Embed is only offered on the desktop web and won&apos;t appear
                for some private accounts.
              </li>
            </ol>
          </details>

          <button
            onClick={handleAnalyze}
            disabled={!embedCode.trim() || loading}
            className="self-start px-7 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 active:scale-[0.98] transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Reading the post…' : 'Analyze'}
          </button>

          {error && (
            <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
          )}
        </section>

        {/* Result — styled like a disclosure label */}
        {result && (
          <section className="rise-in rounded-2xl border border-[var(--rule)] bg-white/70 dark:bg-zinc-900/60 overflow-hidden">
            <div className="border-b border-dashed border-[var(--rule)] px-5 py-3 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Disclosure check
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                  flagged
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {flagged ? 'Likely sponsored' : 'No clear signals'}
              </span>
            </div>

            <div className="px-5 py-5 flex flex-col gap-5">
              {/* Confidence meter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {result.verdict ?? 'Sponsorship likelihood'}
                  </span>
                  <span className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`meter-fill h-full rounded-full ${
                      flagged ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Transparency signals */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Signals we found
                </span>
                {result.reasons && result.reasons.length > 0 ? (
                  <ul className="flex flex-col divide-y divide-dashed divide-[var(--rule)]">
                    {result.reasons.map((reason, i) => (
                      <li
                        key={i}
                        className="flex gap-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No specific disclosure signals surfaced in this post.
                  </p>
                )}
              </div>

              <p className="text-[13px] leading-relaxed text-zinc-400 dark:text-zinc-500">
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