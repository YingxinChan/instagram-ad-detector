import '@testing-library/jest-dom'

// Polyfill Response for jsdom environment
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    status: number
    headers: Record<string, string>
    body: string
    ok: boolean

    constructor(
      body: string | null,
      init?: { status?: number; headers?: Record<string, string> }
    ) {
      this.body = body || ''
      this.status = init?.status ?? 200
      this.headers = init?.headers ?? {}
      this.ok = this.status >= 200 && this.status < 300
    }

    async json() {
      return JSON.parse(this.body)
    }
  } as any
}

// Polyfill fetch for jsdom environment
if (typeof global.fetch === 'undefined') {
  global.fetch = (() => {
    throw new Error('fetch not mocked')
  }) as any
}
