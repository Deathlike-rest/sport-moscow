export interface Review {
  id: string
  venueId: string
  userId: string
  userDisplayName: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export interface ReviewInput {
  rating: number
  comment?: string
}
