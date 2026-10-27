export type BookCategory =
  | 'Philosophy'
  | 'Habits'
  | 'Mindfulness'
  | 'Fiction'
  | 'Sci-Fi'
  | 'Psychology'
  | 'History'
  | 'Biography'
  | 'Business'
  | 'Science'
  | 'Technology'
  | 'Art'
  | 'Poetry'
  | 'Mystery';

export interface CuratedBook {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  categoryLabel: string;
  coverImageUrl?: string;
  firstPublishYear: number;
  readTimeMinutes: number; // For AI summary
  fullReadHours: number;
  hasSummary: boolean;
  tagline: string;
  description: string;
  ratingAverage: number;
  readersCount: number;
  workKey?: string;
  telegramMessageId?: number | string;
}

export const CURATED_CATEGORIES = [
  'All',
  'Philosophy',
  'Technology',
  'Science & Nature',
  'Psychology',
  'Habits & Focus',
  'Business & Strategy',
  'Masterpiece Fiction',
  'Sci-Fi & Fantasy',
  'History & Society',
  'Biography & Memoir',
  'Art & Creativity',
  'Poetry',
  'Mystery & Thriller',
] as const;

export type CuratedCategory = typeof CURATED_CATEGORIES[number];

export interface CategoryConfig {
  id: string;
  name: CuratedCategory;
  subjectSlug: string;
  shelfTitle: string;
  tagline: string;
  iconName: 'Compass' | 'Brain' | 'TrendingUp' | 'BookOpen' | 'Flame' | 'Landmark' | 'User' | 'Briefcase' | 'Atom' | 'Palette' | 'Feather' | 'ShieldAlert';
  badgeLabel: string;
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'philosophy',
    name: 'Philosophy',
    subjectSlug: 'philosophy',
    shelfTitle: 'Philosophy & Stoic Wisdom',
    tagline: 'Stoicism, existential ethics, ancient dialogues, and timeless questions on the good life.',
    iconName: 'Compass',
    badgeLabel: 'Deep Thought',
  },
  {
    id: 'psychology',
    name: 'Psychology',
    subjectSlug: 'psychology',
    shelfTitle: 'Psychology & Cognitive Science',
    tagline: 'Mental models, behavioral economics, subconscious impulses, and emotional clarity.',
    iconName: 'Brain',
    badgeLabel: 'Mind & Behavior',
  },
  {
    id: 'habits',
    name: 'Habits & Focus',
    subjectSlug: 'self-help',
    shelfTitle: 'Habits, Focus & High Performance',
    tagline: 'Deliberate practice, atomic compounding, deep work rituals, and creative flow.',
    iconName: 'TrendingUp',
    badgeLabel: 'Productivity',
  },
  {
    id: 'fiction',
    name: 'Masterpiece Fiction',
    subjectSlug: 'fiction',
    shelfTitle: 'Masterpiece Fiction',
    tagline: 'Enduring literary monuments, human pathos, sublime storytelling, and classic prose.',
    iconName: 'BookOpen',
    badgeLabel: 'Literary Art',
  },
  {
    id: 'scifi',
    name: 'Sci-Fi & Fantasy',
    subjectSlug: 'science_fiction',
    shelfTitle: 'Sci-Fi & Speculative Futures',
    tagline: 'Far-flung galaxies, artificial intelligences, metaphysical epics, and mythic sagas.',
    iconName: 'Flame',
    badgeLabel: 'Speculative',
  },
  {
    id: 'history',
    name: 'History & Society',
    subjectSlug: 'history',
    shelfTitle: 'History & Civilizations',
    tagline: 'Epochal revolutions, ancient empires, societal origins, and lessons of the past.',
    iconName: 'Landmark',
    badgeLabel: 'World Chronicles',
  },
  {
    id: 'biography',
    name: 'Biography & Memoir',
    subjectSlug: 'biography',
    shelfTitle: 'Biography & Visionary Lives',
    tagline: 'Intimate portraits of world-shaping inventors, philosophers, leaders, and artists.',
    iconName: 'User',
    badgeLabel: 'Remarkable Lives',
  },
  {
    id: 'business',
    name: 'Business & Strategy',
    subjectSlug: 'business',
    shelfTitle: 'Business, Strategy & Economics',
    tagline: 'Zero to one innovation, market dynamics, asymmetric upside, and timeless strategy.',
    iconName: 'Briefcase',
    badgeLabel: 'Enterprise',
  },
  {
    id: 'science',
    name: 'Science & Nature',
    subjectSlug: 'science',
    shelfTitle: 'Science & The Living Universe',
    tagline: 'Astrophysics, quantum foundations, evolutionary biology, and empirical wonder.',
    iconName: 'Atom',
    badgeLabel: 'Cosmos & Discovery',
  },
  {
    id: 'art',
    name: 'Art & Creativity',
    subjectSlug: 'art',
    shelfTitle: 'Art, Design & Visual Culture',
    tagline: 'The creative act, aesthetic philosophy, architecture, and seeing the world afresh.',
    iconName: 'Palette',
    badgeLabel: 'Aesthetics',
  },
  {
    id: 'poetry',
    name: 'Poetry',
    subjectSlug: 'poetry',
    shelfTitle: 'Poetry & Lyric Resonance',
    tagline: 'Distilled verse, rhythmic cadence, vulnerability, and beauty between the lines.',
    iconName: 'Feather',
    badgeLabel: 'Verse',
  },
  {
    id: 'mystery',
    name: 'Mystery & Thriller',
    subjectSlug: 'mystery',
    shelfTitle: 'Mystery, Noir & Suspense',
    tagline: 'Twisting psychological puzzles, chilling investigations, and detective classics.',
    iconName: 'ShieldAlert',
    badgeLabel: 'Intrigue',
  },
];


