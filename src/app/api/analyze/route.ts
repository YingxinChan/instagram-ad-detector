import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const apiUrl = process.env.ANALYZE_API_URL
  if (!apiUrl) {
    return Response.json({ error: 'API URL not configured' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()
    return Response.json(data, { status: upstream.status })
  } catch {
    return Response.json({ error: 'Analysis failed' }, { status: 502 })
  }
}
