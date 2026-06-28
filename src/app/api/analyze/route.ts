import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const apiUrl = process.env.ANALYZE_API_URL
  if (!apiUrl) {
    return Response.json({ error: 'API URL not configured' }, { status: 500 })
  }

  let body: { embedCode?: string; caption?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const upstream_body = {
    caption: body.caption ?? '',
    ...(body.embedCode ? { embed: body.embedCode } : {}),
  }

  try {
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(upstream_body),
    })

    const data = await upstream.json()
    return Response.json({
      isAd: data.ml?.is_sponsored ?? false,
      confidence: data.ml?.prob_sponsored ?? 0,
      verdict: data.verdict,
      reasons: data.rules?.reasons ?? [],
    }, { status: upstream.status })
  } catch {
    return Response.json({ error: 'Analysis failed' }, { status: 502 })
  }
}
