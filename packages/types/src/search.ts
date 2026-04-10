import type { SportType } from './venue.js'

export interface SearchParams {
  sport?: SportType
  lat?: number
  lng?: number
  radius?: number // metres, default 15000
  district?: string
  metro?: string
  hasTrainer?: boolean
  maxPrice?: number // cents per hour
  openNow?: boolean
  sortBy?: 'distance' | 'rating' | 'price'
  page?: number
  limit?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SearchResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}
