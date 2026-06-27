/**
 * @jest-environment node
 */
import { POST } from '../route'
import { NextRequest } from 'next/server'

const FAKE_URL = 'http://fake-api.test/analyze'
const mockFetch = jest.fn()

beforeAll(() => {
  Object.defineProperty(global, 'fetch', {
    value: mockFetch,
    writable: true,
    configurable: true,
  })
})

beforeEach(() => {
  process.env.ANALYZE_API_URL = FAKE_URL
  mockFetch.mockReset()
})

afterEach(() => {
  delete process.env.ANALYZE_API_URL
})

test('forwards embedCode to ANALYZE_API_URL and returns response', async () => {
  mockFetch.mockResolvedValue(
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

test('returns 502 when upstream fetch fails', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'))

  const request = new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ embedCode: 'test' }),
    headers: { 'Content-Type': 'application/json' },
  })

  const response = await POST(request)
  expect(response.status).toBe(502)
})

test('returns 400 when request body is not valid JSON', async () => {
  const request = new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: 'not-json',
    headers: { 'Content-Type': 'application/json' },
  })

  const response = await POST(request)
  expect(response.status).toBe(400)
})
