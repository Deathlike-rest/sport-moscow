export const SPORT_TYPES = [
  'PADEL', 'TENNIS', 'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL',
  'BADMINTON', 'SQUASH', 'TABLE_TENNIS', 'HOCKEY', 'SWIMMING',
  'FITNESS', 'BOXING', 'OTHER',
] as const

export type SportType = (typeof SPORT_TYPES)[number]

export const SPORT_LABELS: Record<SportType, string> = {
  PADEL: 'Падел',
  TENNIS: 'Теннис',
  FOOTBALL: 'Футбол',
  BASKETBALL: 'Баскетбол',
  VOLLEYBALL: 'Волейбол',
  BADMINTON: 'Бадминтон',
  SQUASH: 'Сквош',
  TABLE_TENNIS: 'Настольный теннис',
  HOCKEY: 'Хоккей',
  SWIMMING: 'Плавание',
  FITNESS: 'Фитнес',
  BOXING: 'Бокс',
  OTHER: 'Другое',
}

export const SPORT_ICONS: Record<SportType, string> = {
  PADEL: '🎾',
  TENNIS: '🎾',
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  VOLLEYBALL: '🏐',
  BADMINTON: '🏸',
  SQUASH: '🎯',
  TABLE_TENNIS: '🏓',
  HOCKEY: '🏒',
  SWIMMING: '🏊',
  FITNESS: '💪',
  BOXING: '🥊',
  OTHER: '🏅',
}

export interface VenueSport {
  sport: SportType
  courtCount: number
  pricePerHourCents: number | null
  hasTrainer: boolean
}

export interface WorkingHours {
  dayOfWeek: number // 0=Вс, 1=Пн, ..., 6=Сб
  openTime: string // "08:00"
  closeTime: string // "23:00"
  isClosed: boolean
}

export interface VenueImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
}

export interface Trainer {
  id: string
  name: string
  bio: string | null
  photoUrl: string | null
  sports: SportType[]
  pricePerHourCents: number | null
}

export interface Venue {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  district: string | null
  metro: string | null
  latitude: number
  longitude: number
  phone: string | null
  website: string | null
  email: string | null
  hasParking: boolean
  hasShowers: boolean
  hasLockers: boolean
  hasCafe: boolean
  avgRating: number | null
  reviewCount: number
  isActive: boolean
  createdAt: string
  sports: VenueSport[]
  images: VenueImage[]
  workingHours: WorkingHours[]
  trainers: Trainer[]
}

export type VenueListItem = Pick<
  Venue,
  | 'id'
  | 'name'
  | 'slug'
  | 'address'
  | 'district'
  | 'metro'
  | 'latitude'
  | 'longitude'
  | 'hasParking'
  | 'avgRating'
  | 'reviewCount'
> & {
  sports: VenueSport[]
  primaryImage: VenueImage | null
  distanceMeters: number | null
}
