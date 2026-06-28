import { NextRequest } from 'next/server'

const PERMALINK_RE = /data-instgrm-permalink="([^"?]+)/i

async function fetchCaptionFromOEmbed(permalink: string, token: string): Promise<string> {
  const url = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(permalink)}&fields=title,author_name&access_token=${encodeURIComponent(token)}`
  const res = await fetch(url)
  if (!res.ok) return ''
  const data = await res.json()
  return data.title ?? ''
}

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

  let upstream_body: Record<string, string>

  if (body.embedCode) {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN
    let caption = ''

    if (token) {
      const match = body.embedCode.match(PERMALINK_RE)
      if (match) {
        const permalink = match[1].replace(/&amp;/g, '&')
        caption = await fetchCaptionFromOEmbed(permalink, token)
      }
    }

    upstream_body = caption
      ? { caption, embed: body.embedCode }
      : { embed: body.embedCode }
  } else {
    upstream_body = { caption: body.caption ?? '' }
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
