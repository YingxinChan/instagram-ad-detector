import '@testing-library/jest-dom'
import { runInThisContext } from 'vm'

// jsdom doesn't expose Web Platform APIs (fetch, Response, etc.) as own
// properties of global. Pin them from Node's real context so jest.spyOn
// and `new Response()` work in both jsdom and node test environments.
for (const name of ['fetch', 'Response', 'Request', 'Headers'] as const) {
  if (!Object.prototype.hasOwnProperty.call(global, name)) {
    const value: unknown = runInThisContext(name)
    if (value !== undefined) {
      Object.defineProperty(global, name, {
        value,
        writable: true,
        configurable: true,
      })
    }
  }
}
