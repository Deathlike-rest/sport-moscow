import type { SearchResponse, VenueListItem, Venue, Review, SearchParams, AuthResponse, User } from '@sport/types'

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(res.status, (body as { message?: string }).message ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// ——— Venues ———

export function buildSearchUrl(params: SearchParams): string {
  const q = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.set(key, String(val))
    }
  }
  return `/venues/search?${q.toString()}`
}

export async function searchVenues(params: SearchParams): Promise<SearchResponse<VenueListItem>> {
  const res = await request<{ data: VenueListItem[]; meta: SearchResponse<VenueListItem>['meta'] }>(
    buildSearchUrl(params)
  )
  return res
}

export async function getVenue(id: string): Promise<Venue> {
  const res = await request<{ data: Venue }>(`/venues/${id}`)
  return res.data
}

export async function getSports(): Promise<string[]> {
  const res = await request<{ data: string[] }>('/venues/sports')
  return res.data
}

// ——— Auth ———

export async function register(data: {
  email: string
  password: string
  displayName?: string
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ——— Reviews ———

export async function getReviews(
  venueId: string,
  page = 1
): Promise<SearchResponse<Review>> {
  return request<SearchResponse<Review>>(`/venues/${venueId}/reviews?page=${page}`)
}

export async function addReview(
  venueId: string,
  data: { rating: number; comment?: string },
  token: string
): Promise<void> {
  await request(`/venues/${venueId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function deleteReview(venueId: string, reviewId: string, token: string): Promise<void> {
  await request(`/venues/${venueId}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ——— Bookmarks ———

export async function getBookmarks(token: string): Promise<VenueListItem[]> {
  const res = await request<{ data: { id: string; venueId: string; venue: VenueListItem }[] }>(
    '/bookmarks',
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data.map((b) => b.venue)
}

export async function addBookmark(venueId: string, token: string): Promise<void> {
  await request('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ venueId }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function removeBookmark(venueId: string, token: string): Promise<void> {
  await request(`/bookmarks/${venueId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export { ApiError }
