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

test('renders textarea and disabled analyze button', () => {
  render(<Home />)
  expect(
    screen.getByPlaceholderText('Paste Instagram embed code here…')
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeDisabled()
})

test('enables analyze button when textarea has content', () => {
  render(<Home />)
  fireEvent.change(
    screen.getByPlaceholderText('Paste Instagram embed code here…'),
    { target: { value: '<blockquote>test</blockquote>' } }
  )
  expect(screen.getByRole('button', { name: 'Analyze' })).toBeEnabled()
})

test('shows result badge and confidence after successful analysis', async () => {
  render(<Home />)
  fireEvent.change(
    screen.getByPlaceholderText('Paste Instagram embed code here…'),
    { target: { value: '<blockquote>test</blockquote>' } }
  )
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(screen.getByText('Not an Ad')).toBeInTheDocument()
    expect(screen.getByText('87% confidence')).toBeInTheDocument()
  })
})

test('shows error message on API failure', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'))
  render(<Home />)
  fireEvent.change(
    screen.getByPlaceholderText('Paste Instagram embed code here…'),
    { target: { value: '<blockquote>test</blockquote>' } }
  )
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }))
  await waitFor(() => {
    expect(
      screen.getByText('Analysis failed. Please try again.')
    ).toBeInTheDocument()
  })
})
