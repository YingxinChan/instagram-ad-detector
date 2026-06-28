import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../page'

const mockFetch = jest.fn()

beforeAll(() => {
  Object.defineProperty(global, 'fetch', {
    value: mockFetch,
    writable: true,
    configurable: true,
  })
})

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify({ isAd: false, confidence: 0.87 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )
})

const PLACEHOLDER = '<blockquote class="instagram-media" ...>'

test('renders textarea and disabled analyze button', () => {
  render(<Home />)
  expect(screen.getByPlaceholderText(PLACEHOLDER)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeDisabled()
})

test('enables analyze button when textarea has content', () => {
  render(<Home />)
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), {
    target: { value: '<blockquote>test</blockquote>' },
  })
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled()
})

test('shows result badge and confidence after successful analysis', async () => {
  render(<Home />)
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), {
    target: { value: '<blockquote>test</blockquote>' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(screen.getByText('No clear signals')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
  })
})

test('renders transparency signals when reasons are returned', async () => {
  mockFetch.mockResolvedValue(
    new Response(
      JSON.stringify({
        isAd: true,
        confidence: 0.92,
        reasons: ['Caption contains "gifted"', 'No #ad disclosure found'],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  )
  render(<Home />)
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), {
    target: { value: '<blockquote>test</blockquote>' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(screen.getByText('Likely sponsored')).toBeInTheDocument()
    expect(screen.getByText('Caption contains "gifted"')).toBeInTheDocument()
    expect(screen.getByText('No #ad disclosure found')).toBeInTheDocument()
  })
})

test('shows error message on API failure', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'))
  render(<Home />)
  fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), {
    target: { value: '<blockquote>test</blockquote>' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(
      screen.getByText(
        'Something went wrong reading that post. Check your input and try again.'
      )
    ).toBeInTheDocument()
  })
})
