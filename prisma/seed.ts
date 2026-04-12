import { PrismaClient, SportType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6]
const DEFAULT_HOURS = { openTime: '08:00', closeTime: '23:00', isClosed: false }
const WEEKEND_HOURS = { openTime: '09:00', closeTime: '22:00', isClosed: false }

function makeHours() {
  return WEEK_DAYS.map((day) => ({
    dayOfWeek: day,
    ...(day === 0 || day === 6 ? WEEKEND_HOURS : DEFAULT_HOURS),
  }))
}

// Unsplash photos per sport type
const SPORT_IMAGES: Record<string, string[]> = {
  PADEL: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612296727716-d9f2e450e21d?w=800&auto=format&fit=crop&q=80',
  ],
  TENNIS: [
    'https://images.unsplash.com/photo-1542144612-1b2d9afe81b6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80',
  ],
  FOOTBALL: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1520674316560-b714f12b8e6f?w=800&auto=format&fit=crop&q=80',
  ],
  BASKETBALL: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&auto=format&fit=crop&q=80',
  ],
  VOLLEYBALL: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?w=800&auto=format&fit=crop&q=80',
  ],
  BADMINTON: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=800&auto=format&fit=crop&q=80',
  ],
  SQUASH: [
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80',
  ],
  TABLE_TENNIS: [
    'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&auto=format&fit=crop&q=80',
  ],
  HOCKEY: [
    'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&auto=format&fit=crop&q=80',
  ],
  SWIMMING: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=800&auto=format&fit=crop&q=80',
  ],
  BOXING: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&auto=format&fit=crop&q=80',
  ],
  FITNESS: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&auto=format&fit=crop&q=80',
  ],
}

const venues = [
  // ——— ПАДЕЛ ———
  {
    name: 'Padel Moscow',
    slug: 'padel-moscow',
    description: 'Первый специализированный падел-клуб Москвы. 6 профессиональных кортов с панорамными стёклами.',
    address: 'ул. Верхняя Масловка, 20, Москва',
    district: 'Савёловский',
    metro: 'Динамо',
    latitude: 55.8015,
    longitude: 37.5642,
    phone: '+7 (495) 123-45-67',
    website: 'https://padelmoscow.ru',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'PADEL' as SportType, courtCount: 6, pricePerHourCents: 350000, hasTrainer: true }],
    trainers: [
      { name: 'Алексей Кузнецов', bio: 'Профессиональный тренер по падлу, 8 лет опыта', pricePerHourCents: 300000, sports: ['PADEL' as SportType] },
    ],
    primarySport: 'PADEL',
    reviews: [
      { rating: 5, comment: 'Отличные корты, приятная атмосфера. Тренер Алексей — профи!' },
      { rating: 4, comment: 'Хорошее место, немного дорого, но качество на уровне.' },
      { rating: 5, comment: 'Лучший падел-клуб Москвы, приезжаем сюда каждую неделю.' },
    ],
  },
  {
    name: 'Padel One',
    slug: 'padel-one',
    description: 'Современный падел-клуб с крытыми и открытыми кортами. Прокат ракеток.',
    address: 'Ленинградский пр-т, 39с79, Москва',
    district: 'Аэропорт',
    metro: 'Аэропорт',
    latitude: 55.8098,
    longitude: 37.5217,
    phone: '+7 (495) 234-56-78',
    hasParking: true,
    hasShowers: true,
    hasLockers: false,
    hasCafe: false,
    sports: [{ sport: 'PADEL' as SportType, courtCount: 4, pricePerHourCents: 280000, hasTrainer: true }],
    trainers: [
      { name: 'Мария Соколова', bio: 'Чемпионка России по падлу 2022', pricePerHourCents: 350000, sports: ['PADEL' as SportType] },
    ],
    primarySport: 'PADEL',
    reviews: [
      { rating: 5, comment: 'Мария — потрясающий тренер, за 3 месяца освоила падел с нуля.' },
      { rating: 4, comment: 'Корты хорошие, жаль нет кафе.' },
    ],
  },
  {
    name: 'City Padel',
    slug: 'city-padel',
    description: 'Падел-клуб в центре города. Прокат ракеток, тренировки для новичков.',
    address: 'ул. Сущёвский вал, 49, Москва',
    district: 'Марьина Роща',
    metro: 'Марьина Роща',
    latitude: 55.7908,
    longitude: 37.5990,
    phone: '+7 (495) 345-67-89',
    hasParking: false,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'PADEL' as SportType, courtCount: 3, pricePerHourCents: 240000, hasTrainer: true }],
    trainers: [],
    primarySport: 'PADEL',
    reviews: [
      { rating: 4, comment: 'Удобное расположение, цены адекватные.' },
      { rating: 3, comment: 'Корты неплохие, но раздевалки маловаты.' },
    ],
  },

  // ——— ТЕННИС ———
  {
    name: 'Tennis Park Лужники',
    slug: 'tennis-park-luzhniki',
    description: 'Крупнейший теннисный комплекс Москвы. 12 грунтовых и 8 хардовых кортов.',
    address: 'Лужнецкая наб., 24, Москва',
    district: 'Хамовники',
    metro: 'Спортивная',
    latitude: 55.7151,
    longitude: 37.5533,
    phone: '+7 (495) 637-01-02',
    website: 'https://tennis-luzhniki.ru',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'TENNIS' as SportType, courtCount: 20, pricePerHourCents: 280000, hasTrainer: true }],
    trainers: [
      { name: 'Дмитрий Волков', bio: 'Мастер спорта по теннису, тренер сборной', pricePerHourCents: 400000, sports: ['TENNIS' as SportType] },
      { name: 'Елена Громова', bio: '15 лет тренерского опыта', pricePerHourCents: 320000, sports: ['TENNIS' as SportType] },
    ],
    primarySport: 'TENNIS',
    reviews: [
      { rating: 5, comment: 'Лучшие корты в Москве, идеальное покрытие.' },
      { rating: 5, comment: 'Тренируюсь у Дмитрия уже 2 года, прогресс отличный!' },
      { rating: 4, comment: 'Всё хорошо, но парковка иногда переполнена.' },
      { rating: 5, comment: 'Профессиональный подход, отличная атмосфера.' },
    ],
  },
  {
    name: 'Олимпийский теннисный клуб',
    slug: 'olympic-tennis-club',
    description: 'Профессиональный теннисный клуб с залом ОФП.',
    address: 'Олимпийский пр-т, 16, Москва',
    district: 'Мещанский',
    metro: 'Проспект Мира',
    latitude: 55.7786,
    longitude: 37.6231,
    phone: '+7 (495) 681-07-08',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [{ sport: 'TENNIS' as SportType, courtCount: 8, pricePerHourCents: 250000, hasTrainer: true }],
    trainers: [
      { name: 'Игорь Степанов', bio: 'Тренер 1 категории', pricePerHourCents: 280000, sports: ['TENNIS' as SportType] },
    ],
    primarySport: 'TENNIS',
    reviews: [
      { rating: 4, comment: 'Хороший клуб, удобная локация.' },
      { rating: 5, comment: 'Игорь отличный тренер, занимаемся с сыном уже год.' },
    ],
  },

  // ——— ФУТБОЛ ———
  {
    name: 'Спорткомплекс Олимп',
    slug: 'sportcomplex-olimp',
    description: 'Мини-футбольные поля с искусственным покрытием. Аренда с тренером или без.',
    address: 'ул. Братиславская, 28, Москва',
    district: 'Люблино',
    metro: 'Братиславская',
    latitude: 55.6717,
    longitude: 37.7484,
    phone: '+7 (495) 456-78-90',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [{ sport: 'FOOTBALL' as SportType, courtCount: 4, pricePerHourCents: 600000, hasTrainer: true }],
    trainers: [
      { name: 'Сергей Павлов', bio: 'Бывший игрок ЦСКА, тренер детских команд', pricePerHourCents: 500000, sports: ['FOOTBALL' as SportType] },
    ],
    primarySport: 'FOOTBALL',
    reviews: [
      { rating: 4, comment: 'Хорошее поле, раздевалки чистые.' },
      { rating: 5, comment: 'Лучшее место для любительского футбола в Люблино!' },
      { rating: 4, comment: 'Сергей отличный тренер для детей.' },
    ],
  },
  {
    name: 'Арена Медведково',
    slug: 'arena-medvedkovo',
    description: 'Крытый футбольный манеж. Аренда на часы, турниры.',
    address: 'Заревый пр-д, 12, Москва',
    district: 'Медведково',
    metro: 'Медведково',
    latitude: 55.8677,
    longitude: 37.6459,
    phone: '+7 (495) 567-89-01',
    hasParking: true,
    hasShowers: true,
    hasLockers: false,
    hasCafe: true,
    sports: [{ sport: 'FOOTBALL' as SportType, courtCount: 2, pricePerHourCents: 800000, hasTrainer: false }],
    trainers: [],
    primarySport: 'FOOTBALL',
    reviews: [
      { rating: 5, comment: 'Отличный манеж, играем здесь корпоративно каждую пятницу.' },
      { rating: 4, comment: 'Поле хорошее, но цены немного высоковаты.' },
    ],
  },
  {
    name: 'Спортивный парк Сокол',
    slug: 'sport-park-sokol',
    description: 'Открытые и крытые поля для мини-футбола и футзала.',
    address: 'Балтийская ул., 4, Москва',
    district: 'Сокол',
    metro: 'Сокол',
    latitude: 55.8053,
    longitude: 37.5117,
    phone: '+7 (495) 159-26-37',
    hasParking: false,
    hasShowers: true,
    hasLockers: false,
    hasCafe: false,
    sports: [
      { sport: 'FOOTBALL' as SportType, courtCount: 3, pricePerHourCents: 550000, hasTrainer: true },
      { sport: 'VOLLEYBALL' as SportType, courtCount: 1, pricePerHourCents: 300000, hasTrainer: false },
    ],
    trainers: [],
    primarySport: 'FOOTBALL',
    reviews: [
      { rating: 4, comment: 'Удобное расположение, доступные цены.' },
    ],
  },

  // ——— БАСКЕТБОЛ ———
  {
    name: 'Basketball Lab',
    slug: 'basketball-lab',
    description: 'Профессиональный баскетбольный зал. Тренировки 3x3 и 5x5.',
    address: 'Варшавское ш., 87, Москва',
    district: 'Чертаново',
    metro: 'Чертановская',
    latitude: 55.6411,
    longitude: 37.6059,
    phone: '+7 (495) 678-90-12',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [{ sport: 'BASKETBALL' as SportType, courtCount: 2, pricePerHourCents: 400000, hasTrainer: true }],
    trainers: [
      { name: 'Никита Орлов', bio: 'Мастер спорта, тренер сборной Москвы', pricePerHourCents: 450000, sports: ['BASKETBALL' as SportType] },
    ],
    primarySport: 'BASKETBALL',
    reviews: [
      { rating: 5, comment: 'Отличный зал, паркет идеальный.' },
      { rating: 5, comment: 'Никита — один из лучших тренеров по баскетболу в Москве!' },
      { rating: 4, comment: 'Хорошее место, приходим регулярно.' },
    ],
  },
  {
    name: 'Баскет Холл Митино',
    slug: 'basket-hall-mitino',
    description: 'Современный баскетбольный зал на северо-западе Москвы.',
    address: 'Пятницкое ш., 6к1, Москва',
    district: 'Митино',
    metro: 'Митино',
    latitude: 55.8398,
    longitude: 37.3553,
    phone: '+7 (495) 789-01-23',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'BASKETBALL' as SportType, courtCount: 3, pricePerHourCents: 350000, hasTrainer: true }],
    trainers: [],
    primarySport: 'BASKETBALL',
    reviews: [
      { rating: 4, comment: 'Хороший зал, удобная парковка, кафе приятное.' },
      { rating: 5, comment: 'Лучший зал в СЗАО, рекомендую!' },
    ],
  },

  // ——— БАДМИНТОН ———
  {
    name: 'Смэш Бадминтон Клуб',
    slug: 'smash-badminton',
    description: '8 профессиональных кортов для бадминтона. Прокат ракеток.',
    address: 'Шарикоподшипниковская ул., 13, Москва',
    district: 'Пролетарский',
    metro: 'Дубровка',
    latitude: 55.7201,
    longitude: 37.6687,
    phone: '+7 (495) 890-12-34',
    hasParking: false,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [{ sport: 'BADMINTON' as SportType, courtCount: 8, pricePerHourCents: 180000, hasTrainer: true }],
    trainers: [
      { name: 'Анна Белова', bio: 'КМС по бадминтону, тренирует с 2015 года', pricePerHourCents: 250000, sports: ['BADMINTON' as SportType] },
    ],
    primarySport: 'BADMINTON',
    reviews: [
      { rating: 5, comment: 'Отличные корты, Анна прекрасный тренер!' },
      { rating: 4, comment: 'Хорошее место, жаль нет парковки.' },
    ],
  },
  {
    name: 'Бадминтон Центр Ясенево',
    slug: 'badminton-yasenevo',
    description: 'Клуб бадминтона на юге Москвы. Группы для взрослых и детей.',
    address: 'ул. Паустовского, 5, Москва',
    district: 'Ясенево',
    metro: 'Ясенево',
    latitude: 55.6048,
    longitude: 37.5432,
    phone: '+7 (495) 901-23-45',
    hasParking: true,
    hasShowers: true,
    hasLockers: false,
    hasCafe: false,
    sports: [{ sport: 'BADMINTON' as SportType, courtCount: 6, pricePerHourCents: 160000, hasTrainer: true }],
    trainers: [],
    primarySport: 'BADMINTON',
    reviews: [
      { rating: 4, comment: 'Доступные цены, детские группы отличные.' },
    ],
  },

  // ——— СКВОШ ———
  {
    name: 'Squash Moscow City',
    slug: 'squash-moscow-city',
    description: 'Сквош в центре Москвы. 5 стеклянных кортов с трибунами.',
    address: 'Пресненская наб., 10, Москва',
    district: 'Пресненский',
    metro: 'Деловой центр',
    latitude: 55.7481,
    longitude: 37.5398,
    phone: '+7 (495) 012-34-56',
    website: 'https://squashmoscow.ru',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'SQUASH' as SportType, courtCount: 5, pricePerHourCents: 320000, hasTrainer: true }],
    trainers: [
      { name: 'Роман Тихонов', bio: 'Чемпион России по сквошу', pricePerHourCents: 400000, sports: ['SQUASH' as SportType] },
    ],
    primarySport: 'SQUASH',
    reviews: [
      { rating: 5, comment: 'Лучший сквош-клуб Москвы, стеклянные корты — топ!' },
      { rating: 5, comment: 'Роман — мастер своего дела, за полгода вырос до третьего разряда.' },
      { rating: 4, comment: 'Отличное место, немного дорого, но того стоит.' },
    ],
  },

  // ——— ВОЛЕЙБОЛ ———
  {
    name: 'Волейбольный центр Марьино',
    slug: 'volleyball-marino',
    description: 'Профессиональные волейбольные площадки. Сборные игры каждый вечер.',
    address: 'ул. Люблинская, 37, Москва',
    district: 'Марьино',
    metro: 'Марьино',
    latitude: 55.6594,
    longitude: 37.7456,
    phone: '+7 (495) 111-22-33',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [{ sport: 'VOLLEYBALL' as SportType, courtCount: 4, pricePerHourCents: 250000, hasTrainer: true }],
    trainers: [],
    primarySport: 'VOLLEYBALL',
    reviews: [
      { rating: 4, comment: 'Хорошие площадки, сборные игры по вечерам — отличная идея.' },
      { rating: 5, comment: 'Лучшее место для волейбола в Марьино!' },
    ],
  },
  {
    name: 'Beach Club Серебряный бор',
    slug: 'beach-club-serebryaniy-bor',
    description: 'Пляжный волейбол и бадминтон у Серебряного бора.',
    address: 'Таманская ул., 1, Москва',
    district: 'Хорошёво-Мнёвники',
    metro: 'Октябрьское поле',
    latitude: 55.7779,
    longitude: 37.4208,
    phone: '+7 (495) 444-55-66',
    hasParking: true,
    hasShowers: true,
    hasLockers: false,
    hasCafe: true,
    sports: [
      { sport: 'VOLLEYBALL' as SportType, courtCount: 6, pricePerHourCents: 200000, hasTrainer: false },
      { sport: 'BADMINTON' as SportType, courtCount: 4, pricePerHourCents: 150000, hasTrainer: false },
    ],
    trainers: [],
    primarySport: 'VOLLEYBALL',
    reviews: [
      { rating: 5, comment: 'Летом здесь просто рай! Пляжный волейбол, свежий воздух.' },
      { rating: 5, comment: 'Потрясающее место, приезжаем каждые выходные.' },
      { rating: 4, comment: 'Отличные площадки, хорошее кафе рядом.' },
    ],
  },

  // ——— НАСТОЛЬНЫЙ ТЕННИС ———
  {
    name: 'Пинг-понг Арбат',
    slug: 'pingpong-arbat',
    description: '20 профессиональных столов. Рейтинговые турниры каждые выходные.',
    address: 'ул. Арбат, 35, Москва',
    district: 'Арбат',
    metro: 'Арбатская',
    latitude: 55.7498,
    longitude: 37.5945,
    phone: '+7 (495) 777-88-99',
    hasParking: false,
    hasShowers: false,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'TABLE_TENNIS' as SportType, courtCount: 20, pricePerHourCents: 120000, hasTrainer: true }],
    trainers: [
      { name: 'Владимир Козлов', bio: 'МСМК по настольному теннису', pricePerHourCents: 300000, sports: ['TABLE_TENNIS' as SportType] },
    ],
    primarySport: 'TABLE_TENNIS',
    reviews: [
      { rating: 5, comment: 'Отличный клуб, турниры по выходным — огонь!' },
      { rating: 4, comment: 'Столы профессиональные, атмосфера приятная.' },
      { rating: 5, comment: 'Владимир — гениальный тренер, советую всем!' },
    ],
  },

  // ——— ПЛАВАНИЕ ———
  {
    name: 'Бассейн Чайка',
    slug: 'pool-chaika',
    description: 'Олимпийский 50-метровый бассейн в центре Москвы.',
    address: 'Чайковского ул., 1/5, Москва',
    district: 'Хамовники',
    metro: 'Парк культуры',
    latitude: 55.7341,
    longitude: 37.5887,
    phone: '+7 (499) 246-10-55',
    hasParking: false,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [{ sport: 'SWIMMING' as SportType, courtCount: 8, pricePerHourCents: 80000, hasTrainer: true }],
    trainers: [
      { name: 'Наталья Смирнова', bio: 'КМС по плаванию, тренер сборной СДЮШОР', pricePerHourCents: 350000, sports: ['SWIMMING' as SportType] },
    ],
    primarySport: 'SWIMMING',
    reviews: [
      { rating: 5, comment: 'Легендарный бассейн, всегда чистая вода.' },
      { rating: 4, comment: 'Хорошее место, удобное расположение.' },
      { rating: 5, comment: 'Наталья — замечательный тренер для детей.' },
    ],
  },
  {
    name: 'Олимпийский бассейн',
    slug: 'pool-olympic',
    description: 'Спортивный комплекс Олимпийский. 50м бассейн, аквааэробика.',
    address: 'Олимпийский пр-т, 16с1, Москва',
    district: 'Мещанский',
    metro: 'Проспект Мира',
    latitude: 55.7801,
    longitude: 37.6195,
    phone: '+7 (495) 681-51-33',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'SWIMMING' as SportType, courtCount: 10, pricePerHourCents: 90000, hasTrainer: true }],
    trainers: [],
    primarySport: 'SWIMMING',
    reviews: [
      { rating: 4, comment: 'Большой бассейн, всегда есть свободные дорожки.' },
      { rating: 5, comment: 'Лучший бассейн в центре Москвы!' },
    ],
  },

  // ——— БОКС ———
  {
    name: 'Fight Club Moscow',
    slug: 'fight-club-moscow',
    description: 'Бокс, кикбоксинг, MMA. Профессиональный ринг, грушевый зал.',
    address: 'ул. Ленинская слобода, 19, Москва',
    district: 'Даниловский',
    metro: 'Автозаводская',
    latitude: 55.7076,
    longitude: 37.6602,
    phone: '+7 (495) 258-36-99',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [
      { sport: 'BOXING' as SportType, courtCount: 3, pricePerHourCents: 200000, hasTrainer: true },
      { sport: 'FITNESS' as SportType, courtCount: 1, pricePerHourCents: 150000, hasTrainer: true },
    ],
    trainers: [
      { name: 'Максим Рублёв', bio: 'Мастер спорта по боксу, 10 лет тренерского стажа', pricePerHourCents: 400000, sports: ['BOXING' as SportType] },
    ],
    primarySport: 'BOXING',
    reviews: [
      { rating: 5, comment: 'Реальный боевой клуб, атмосфера потрясающая.' },
      { rating: 5, comment: 'Максим Рублёв — тренер от Бога, за 4 месяца я неузнаваем.' },
      { rating: 4, comment: 'Отличный зал, хорошее оборудование.' },
    ],
  },

  // ——— ХОККЕЙ ———
  {
    name: 'Ледовый каток Медведково',
    slug: 'ice-medvedkovo',
    description: 'Ледовая арена. Хоккей, фигурное катание, массовое катание.',
    address: 'ул. Полярная, 37, Москва',
    district: 'Медведково',
    metro: 'Медведково',
    latitude: 55.8743,
    longitude: 37.6563,
    phone: '+7 (495) 474-30-40',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'HOCKEY' as SportType, courtCount: 1, pricePerHourCents: 1200000, hasTrainer: true }],
    trainers: [
      { name: 'Андрей Захаров', bio: 'Бывший игрок КХЛ, тренер детских команд', pricePerHourCents: 500000, sports: ['HOCKEY' as SportType] },
    ],
    primarySport: 'HOCKEY',
    reviews: [
      { rating: 5, comment: 'Отличный лёд, дети в восторге!' },
      { rating: 5, comment: 'Андрей — прекрасный тренер, сын прогрессирует очень быстро.' },
      { rating: 4, comment: 'Хорошая арена, есть кафе, удобная парковка.' },
    ],
  },

  // ——— МУЛЬТИСПОРТ ———
  {
    name: 'SportLife Химки',
    slug: 'sportlife-khimki',
    description: 'Большой спортивный центр — теннис, бадминтон, сквош, фитнес.',
    address: 'Ленинградское ш., 71Г, Москва',
    district: 'Левобережный',
    metro: 'Речной вокзал',
    latitude: 55.8511,
    longitude: 37.4413,
    phone: '+7 (495) 626-13-14',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [
      { sport: 'TENNIS' as SportType, courtCount: 4, pricePerHourCents: 260000, hasTrainer: true },
      { sport: 'BADMINTON' as SportType, courtCount: 6, pricePerHourCents: 170000, hasTrainer: true },
      { sport: 'SQUASH' as SportType, courtCount: 2, pricePerHourCents: 280000, hasTrainer: false },
      { sport: 'FITNESS' as SportType, courtCount: 1, pricePerHourCents: 130000, hasTrainer: true },
    ],
    trainers: [
      { name: 'Ольга Фёдорова', bio: 'Сертифицированный тренер по теннису и бадминтону', pricePerHourCents: 300000, sports: ['TENNIS' as SportType, 'BADMINTON' as SportType] },
    ],
    primarySport: 'TENNIS',
    reviews: [
      { rating: 4, comment: 'Большой выбор видов спорта под одной крышей — удобно.' },
      { rating: 5, comment: 'Ольга — универсальный тренер, занимаемся и теннисом и бадминтоном.' },
    ],
  },
  {
    name: 'ФСК Олимп Тушино',
    slug: 'fsk-olimp-tushino',
    description: 'Физкультурно-спортивный комплекс. Теннис, волейбол, баскетбол.',
    address: 'Туристская ул., 17, Москва',
    district: 'Тушино',
    metro: 'Тушинская',
    latitude: 55.8247,
    longitude: 37.4058,
    phone: '+7 (495) 491-01-02',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [
      { sport: 'TENNIS' as SportType, courtCount: 3, pricePerHourCents: 220000, hasTrainer: true },
      { sport: 'VOLLEYBALL' as SportType, courtCount: 2, pricePerHourCents: 200000, hasTrainer: false },
      { sport: 'BASKETBALL' as SportType, courtCount: 1, pricePerHourCents: 300000, hasTrainer: false },
    ],
    trainers: [],
    primarySport: 'TENNIS',
    reviews: [
      { rating: 4, comment: 'Доступные цены, хороший выбор видов спорта.' },
    ],
  },
  {
    name: 'Академия спорта Сокольники',
    slug: 'academy-sokolniki',
    description: 'Многофункциональный спортивный центр в парке Сокольники.',
    address: 'Сокольнический вал, 1, Москва',
    district: 'Сокольники',
    metro: 'Сокольники',
    latitude: 55.7887,
    longitude: 37.6773,
    phone: '+7 (495) 268-45-67',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [
      { sport: 'TENNIS' as SportType, courtCount: 6, pricePerHourCents: 240000, hasTrainer: true },
      { sport: 'PADEL' as SportType, courtCount: 2, pricePerHourCents: 300000, hasTrainer: true },
      { sport: 'BADMINTON' as SportType, courtCount: 4, pricePerHourCents: 160000, hasTrainer: false },
    ],
    trainers: [
      { name: 'Пётр Иванов', bio: 'Тренер высшей категории, 20 лет опыта', pricePerHourCents: 350000, sports: ['TENNIS' as SportType, 'PADEL' as SportType] },
    ],
    primarySport: 'TENNIS',
    reviews: [
      { rating: 5, comment: 'Прекрасное место в парке, отличная инфраструктура.' },
      { rating: 5, comment: 'Пётр Иванов — лучший тренер, у которого я занимался.' },
      { rating: 4, comment: 'Отличный комплекс, удобная парковка.' },
    ],
  },
  {
    name: 'Центр спорта Лефортово',
    slug: 'sport-center-lefortovo',
    description: 'Просторный спорткомплекс на востоке Москвы.',
    address: 'ул. Энергетическая, 11, Москва',
    district: 'Лефортово',
    metro: 'Авиамоторная',
    latitude: 55.7567,
    longitude: 37.7145,
    phone: '+7 (495) 361-00-00',
    hasParking: true,
    hasShowers: true,
    hasLockers: false,
    hasCafe: true,
    sports: [
      { sport: 'FOOTBALL' as SportType, courtCount: 2, pricePerHourCents: 500000, hasTrainer: true },
      { sport: 'BASKETBALL' as SportType, courtCount: 2, pricePerHourCents: 280000, hasTrainer: false },
      { sport: 'VOLLEYBALL' as SportType, courtCount: 2, pricePerHourCents: 220000, hasTrainer: false },
    ],
    trainers: [],
    primarySport: 'FOOTBALL',
    reviews: [
      { rating: 4, comment: 'Хороший комплекс, всё необходимое есть.' },
    ],
  },
  {
    name: 'Арена Коломенское',
    slug: 'arena-kolomenskoye',
    description: 'Спортивный комплекс рядом с парком Коломенское.',
    address: 'Каширское ш., 32, Москва',
    district: 'Нагатино-Садовники',
    metro: 'Коломенская',
    latitude: 55.6687,
    longitude: 37.6743,
    phone: '+7 (495) 115-22-33',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: false,
    sports: [
      { sport: 'PADEL' as SportType, courtCount: 2, pricePerHourCents: 260000, hasTrainer: false },
      { sport: 'TENNIS' as SportType, courtCount: 4, pricePerHourCents: 230000, hasTrainer: true },
    ],
    trainers: [],
    primarySport: 'PADEL',
    reviews: [
      { rating: 4, comment: 'Хорошие корты, приятное место рядом с парком.' },
      { rating: 5, comment: 'Лучшее сочетание цены и качества в этом районе!' },
    ],
  },
  {
    name: 'Club Racket Коньково',
    slug: 'club-racket-konkovo',
    description: 'Ракеточный клуб — теннис, сквош, бадминтон, падел.',
    address: 'ул. Профсоюзная, 128, Москва',
    district: 'Коньково',
    metro: 'Коньково',
    latitude: 55.6253,
    longitude: 37.5281,
    phone: '+7 (495) 426-55-77',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [
      { sport: 'PADEL' as SportType, courtCount: 2, pricePerHourCents: 290000, hasTrainer: true },
      { sport: 'TENNIS' as SportType, courtCount: 4, pricePerHourCents: 260000, hasTrainer: true },
      { sport: 'SQUASH' as SportType, courtCount: 3, pricePerHourCents: 300000, hasTrainer: true },
      { sport: 'BADMINTON' as SportType, courtCount: 4, pricePerHourCents: 160000, hasTrainer: false },
    ],
    trainers: [
      { name: 'Юлия Кравцова', bio: 'Тренер по теннису и падлу', pricePerHourCents: 320000, sports: ['TENNIS' as SportType, 'PADEL' as SportType] },
    ],
    primarySport: 'TENNIS',
    reviews: [
      { rating: 5, comment: 'Лучший ракеточный клуб в Москве! 4 вида спорта под одной крышей.' },
      { rating: 4, comment: 'Юлия — отличный тренер, занимаемся уже год.' },
      { rating: 5, comment: 'Замечательное место, всегда чисто и уютно.' },
    ],
  },
  {
    name: 'SportZona Бутово',
    slug: 'sportzona-butovo',
    description: 'Спортивный центр на юге Москвы. Доступные цены.',
    address: 'ул. Скобелевская, 24, Москва',
    district: 'Бутово',
    metro: 'Бульвар Дмитрия Донского',
    latitude: 55.5724,
    longitude: 37.5701,
    phone: '+7 (495) 712-33-44',
    hasParking: true,
    hasShowers: true,
    hasLockers: false,
    hasCafe: false,
    sports: [
      { sport: 'FOOTBALL' as SportType, courtCount: 3, pricePerHourCents: 450000, hasTrainer: false },
      { sport: 'BASKETBALL' as SportType, courtCount: 2, pricePerHourCents: 250000, hasTrainer: false },
      { sport: 'VOLLEYBALL' as SportType, courtCount: 2, pricePerHourCents: 200000, hasTrainer: false },
      { sport: 'BADMINTON' as SportType, courtCount: 4, pricePerHourCents: 140000, hasTrainer: false },
    ],
    trainers: [],
    primarySport: 'FOOTBALL',
    reviews: [
      { rating: 4, comment: 'Самые доступные цены в ЮАО, всё необходимое есть.' },
      { rating: 3, comment: 'Неплохо для своей цены, раздевалки простенькие.' },
    ],
  },
  {
    name: 'Чистые пруды Сквош',
    slug: 'chistye-prudy-squash',
    description: 'Элитный сквош-клуб в историческом центре Москвы.',
    address: 'Чистопрудный бул., 12, Москва',
    district: 'Красносельский',
    metro: 'Чистые пруды',
    latitude: 55.7654,
    longitude: 37.6415,
    phone: '+7 (495) 624-11-22',
    hasParking: false,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [{ sport: 'SQUASH' as SportType, courtCount: 4, pricePerHourCents: 380000, hasTrainer: true }],
    trainers: [
      { name: 'Константин Лебедев', bio: 'Чемпион Европы по сквошу 2019', pricePerHourCents: 500000, sports: ['SQUASH' as SportType] },
    ],
    primarySport: 'SQUASH',
    reviews: [
      { rating: 5, comment: 'Элитный уровень, Константин — чемпион и настоящий профессионал!' },
      { rating: 5, comment: 'Лучший сквош в центре Москвы, атмосфера премиальная.' },
      { rating: 4, comment: 'Дорого, но всё на высшем уровне.' },
    ],
  },
  {
    name: 'Фитнес Арена Москва Сити',
    slug: 'fitness-arena-moscow-city',
    description: 'Премиальный фитнес-клуб в Москва-Сити. Бассейн, тренажёрный зал, единоборства.',
    address: 'Пресненская наб., 12, Москва',
    district: 'Пресненский',
    metro: 'Деловой центр',
    latitude: 55.7486,
    longitude: 37.5412,
    phone: '+7 (495) 777-00-11',
    hasParking: true,
    hasShowers: true,
    hasLockers: true,
    hasCafe: true,
    sports: [
      { sport: 'SWIMMING' as SportType, courtCount: 4, pricePerHourCents: 120000, hasTrainer: true },
      { sport: 'FITNESS' as SportType, courtCount: 1, pricePerHourCents: 100000, hasTrainer: true },
      { sport: 'BOXING' as SportType, courtCount: 2, pricePerHourCents: 180000, hasTrainer: true },
    ],
    trainers: [
      { name: 'Виктория Нова', bio: 'Тренер по фитнесу и плаванию, КМС', pricePerHourCents: 380000, sports: ['FITNESS' as SportType, 'SWIMMING' as SportType] },
    ],
    primarySport: 'FITNESS',
    reviews: [
      { rating: 5, comment: 'Премиальный уровень, вид на Москву-Сити из бассейна — бесценно!' },
      { rating: 5, comment: 'Виктория — лучший тренер по фитнесу, которого я встречал.' },
      { rating: 4, comment: 'Дорого, но инфраструктура мирового класса.' },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sport.ru' },
    update: {},
    create: {
      email: 'admin@sport.ru',
      passwordHash: await bcrypt.hash('admin123', 10),
      displayName: 'Администратор',
      role: 'ADMIN',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'user@sport.ru' },
    update: {},
    create: {
      email: 'user@sport.ru',
      passwordHash: await bcrypt.hash('user123', 10),
      displayName: 'Тестовый пользователь',
      role: 'USER',
    },
  })

  const reviewAuthors = [adminUser, testUser]

  for (const v of venues) {
    const { sports, trainers, reviews, primarySport, ...venueData } = v

    const venue = await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: {},
      create: {
        ...venueData,
        sports: { create: sports },
        workingHours: { create: makeHours() },
        trainers: { create: trainers },
      },
    })

    // Add images if not yet added
    const existingImageCount = await prisma.venueImage.count({ where: { venueId: venue.id } })
    if (existingImageCount === 0) {
      const sportImages = SPORT_IMAGES[primarySport] ?? SPORT_IMAGES['FITNESS']!
      await prisma.venueImage.createMany({
        data: sportImages.map((url, i) => ({
          venueId: venue.id,
          url,
          altText: venue.name,
          isPrimary: i === 0,
          order: i,
        })),
      })
    }

    // Add reviews if not yet added
    const existingReviewCount = await prisma.review.count({ where: { venueId: venue.id } })
    if (existingReviewCount === 0 && reviews.length > 0) {
      let totalRating = 0
      let count = 0
      for (const [i, rev] of reviews.entries()) {
        const author = reviewAuthors[i % reviewAuthors.length]!
        try {
          await prisma.review.create({
            data: {
              venueId: venue.id,
              userId: author.id,
              rating: rev.rating,
              comment: rev.comment,
            },
          })
          totalRating += rev.rating
          count++
        } catch {
          // skip duplicate (same user reviewed same venue)
        }
      }
      if (count > 0) {
        await prisma.venue.update({
          where: { id: venue.id },
          data: {
            avgRating: Math.round((totalRating / count) * 10) / 10,
            reviewCount: count,
          },
        })
      }
    }

    console.log(`  ✓ ${venue.name}`)
  }

  console.log(`\n✅ Done! Seeded ${venues.length} venues with photos and reviews.`)
  console.log('📧 Test accounts:')
  console.log('   admin@sport.ru / admin123')
  console.log('   user@sport.ru  / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
