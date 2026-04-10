import { PrismaClient, SportType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6]
const DEFAULT_HOURS = { openTime: '08:00', closeTime: '23:00', isClosed: false }
const WEEKEND_HOURS = { openTime: '09:00', closeTime: '22:00', isClosed: false }

function makeHours(venueId?: string) {
  return WEEK_DAYS.map((day) => ({
    dayOfWeek: day,
    ...(day === 0 || day === 6 ? WEEKEND_HOURS : DEFAULT_HOURS),
  }))
}

const venues = [
  // ——— ПАДЕЛ ———
  {
    name: 'Padel Moscow',
    slug: 'padel-moscow',
    description: 'Первый специализированный падел-клуб Москвы. 6 профессиональных кортов.',
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
  },
  {
    name: 'Padel One',
    slug: 'padel-one',
    description: 'Современный падел-клуб с крытыми и открытыми кортами.',
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
  },

  // ——— СКВОШ ———
  {
    name: 'Squash Moscow City',
    slug: 'squash-moscow-city',
    description: 'Сквош в центре Москвы. 5 стеклянных кортов.',
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
  },

  // ——— ФИТНЕС / БОКС ———
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
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Создаём тестового пользователя-администратора
  await prisma.user.upsert({
    where: { email: 'admin@sport.ru' },
    update: {},
    create: {
      email: 'admin@sport.ru',
      passwordHash: await bcrypt.hash('admin123', 10),
      displayName: 'Администратор',
      role: 'ADMIN',
    },
  })

  // Создаём обычного тестового пользователя
  await prisma.user.upsert({
    where: { email: 'user@sport.ru' },
    update: {},
    create: {
      email: 'user@sport.ru',
      passwordHash: await bcrypt.hash('user123', 10),
      displayName: 'Тестовый пользователь',
      role: 'USER',
    },
  })

  for (const v of venues) {
    const { sports, trainers, ...venueData } = v

    const venue = await prisma.venue.upsert({
      where: { slug: venueData.slug },
      update: {},
      create: {
        ...venueData,
        sports: {
          create: sports,
        },
        workingHours: {
          create: makeHours(),
        },
        trainers: {
          create: trainers,
        },
      },
    })

    console.log(`  ✓ ${venue.name}`)
  }

  console.log(`\n✅ Done! Created ${venues.length} venues.`)
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
