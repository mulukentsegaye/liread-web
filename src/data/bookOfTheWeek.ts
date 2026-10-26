export interface BookOfTheWeek {
  id: string;
  title: string;
  author: string;
  category: string;
  categoryLabel: string;
  coverImageUrl: string;
  firstPublishYear: number;
  readTimeMinutes: number;
  tagline: string;
  description: string;
  workKey?: string;
}

/**
 * Fixed UTC epoch anchor: Monday, January 1, 2024 at 00:00:00 UTC.
 * Every calendar week begins strictly on Monday 00:00:00 UTC worldwide
 * and runs continuously until Sunday 23:59:59 UTC.
 */
const EPOCH_MONDAY_UTC = Date.UTC(2024, 0, 1, 0, 0, 0);
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const WEEKLY_BOOK_ROSTER: BookOfTheWeek[] = [
  {
    id: 'the-creative-act',
    title: 'The Creative Act: A Way of Being',
    author: 'Rick Rubin',
    category: 'Art',
    categoryLabel: 'Art & Creativity',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780593652886-L.jpg',
    firstPublishYear: 2023,
    readTimeMinutes: 6,
    tagline: 'A luminous, meditative course on human presence, deep listening, and reconnecting with childlike wonder.',
    description: 'Legendary music producer Rick Rubin distills decades of artistic guidance into a profound, aphoristic philosophical treatise. The Creative Act is an intimate meditation on human presence, generosity of perception, and opening oneself up to receive ideas from the world.',
    workKey: '/works/OL27955361W',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Habits',
    categoryLabel: 'Habits & Focus',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    firstPublishYear: 2018,
    readTimeMinutes: 7,
    tagline: 'An operating manual for compounding 1% daily improvements through identity-based systems.',
    description: 'James Clear presents a comprehensive framework for daily behavioral transformation based on cognitive biology and psychology. By focusing on systems rather than goals and leveraging the Four Laws of Behavior Change, readers discover how minute daily choices compound into life-defining outcomes.',
    workKey: '/works/OL17930368W',
  },
  {
    id: 'meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    categoryLabel: 'Philosophy & Stoic Wisdom',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg',
    firstPublishYear: 180,
    readTimeMinutes: 8,
    tagline: 'The private spiritual notebook of the Roman Emperor on inner serenity, duty, and the transience of all things.',
    description: 'Written on military campaign along the Danube frontier, Meditations contains the private reflections and spiritual exercises of Roman Emperor Marcus Aurelius. A timeless masterpiece of Stoic philosophy emphasizing the dichotomy of control, virtue, social duty, and mastering our inner judgments.',
    workKey: '/works/OL30687578W',
  },
  {
    id: 'deep-work',
    title: 'Deep Work: Rules for Focused Success',
    author: 'Cal Newport',
    category: 'Habits',
    categoryLabel: 'Habits & Focus',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
    firstPublishYear: 2016,
    readTimeMinutes: 7,
    tagline: 'Why distraction-free concentration is the superpower of the modern intellectual economy.',
    description: 'Computer science professor Cal Newport argues that the ability to concentrate intensely without distraction is becoming increasingly rare and valuable. Newport details actionable strategies to eliminate cognitive fragmentation, cultivate rigorous mental discipline, and drain shallow work from daily routines.',
    workKey: '/works/OL17351607W',
  },
  {
    id: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    category: 'Sci-Fi',
    categoryLabel: 'Sci-Fi & Speculative Futures',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
    firstPublishYear: 1965,
    readTimeMinutes: 9,
    tagline: 'An epic monumental triumph exploring ecology, religion, power, and human consciousness across Arrakis.',
    description: 'Frank Herbert’s science fiction tour-de-force follows young Paul Atreides on the harsh desert planet Arrakis, the sole source of melange (the spice). Dune explores the collision of planetary ecology, messianic religious fanaticism, imperial politics, and the uncharted frontiers of human consciousness.',
    workKey: '/works/OL893415W',
  },
  {
    id: 'thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    categoryLabel: 'Psychology & Cognitive Science',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780374275631-L.jpg',
    firstPublishYear: 2011,
    readTimeMinutes: 8,
    tagline: 'Nobel laureate Daniel Kahneman unveils the two cognitive systems that drive human choices and biases.',
    description: 'Nobel Memorial Prize winner Daniel Kahneman summarizes decades of behavioral economics research, unveiling the two distinct modes of thought: System 1 (fast, intuitive, emotional) and System 2 (slow, deliberative, logical). Kahneman illuminates cognitive illusions, heuristics, and the architecture of choice.',
    workKey: '/works/OL15992072W',
  },
  {
    id: 'steve-jobs',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    category: 'Biography',
    categoryLabel: 'Biography & Visionary Lives',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg',
    firstPublishYear: 2011,
    readTimeMinutes: 9,
    tagline: 'The definitive chronicle of the creative genius whose passion for perfection revolutionized six industries.',
    description: 'Based on more than forty interviews with Steve Jobs conducted over two years, Walter Isaacson crafts an unvarnished portrait of the roller-coaster life and searingly intense personality of a creative entrepreneur whose passion for perfection revolutionized computers, animated movies, music, phones, and digital publishing.',
    workKey: '/works/OL16013627W',
  },
  {
    id: '1984',
    title: '1984',
    author: 'George Orwell',
    category: 'Fiction',
    categoryLabel: 'Masterpiece Fiction',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    firstPublishYear: 1949,
    readTimeMinutes: 8,
    tagline: 'The definitive chilling prophecy of surveillance, totalitarian language, and erased truth.',
    description: 'George Orwell’s terrifying dystopian masterpiece depicts Winston Smith’s rebellion against the all-seeing totalitarian surveillance of Big Brother and the Party. 1984 remains the paramount literary warning against bureaucratic propaganda, the destruction of historical truth, Doublethink, and the suppression of individual freedom.',
    workKey: '/works/OL1168083W',
  },
  {
    id: 'sapiens',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    categoryLabel: 'History & Civilizations',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    firstPublishYear: 2014,
    readTimeMinutes: 9,
    tagline: 'How an insignificant ape became the master of planet Earth through the power of collective fiction.',
    description: 'Historian Yuval Noah Harari traces the journey of Homo sapiens from minor East African foragers to planetary rulers. Spanning the Cognitive, Agricultural, and Scientific Revolutions, Harari examines how shared myths—money, nationhood, religion, and human rights—enabled large-scale human cooperation.',
    workKey: '/works/OL17075811W',
  },
  {
    id: 'the-art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    category: 'Business',
    categoryLabel: 'Business, Strategy & Economics',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781590302255-L.jpg',
    firstPublishYear: -500,
    readTimeMinutes: 5,
    tagline: 'Ancient Chinese military treatise on knowing oneself and the enemy to win without battle.',
    description: 'Composed in ancient China during the Spring and Autumn period, The Art of War is the definitive military strategy text. Its principles of adaptability, deception, knowing when to strike, and preserving harmony have transcended warfare into modern business, politics, and daily negotiation.',
    workKey: '/works/OL14860262W',
  },
  {
    id: 'mans-search-for-meaning',
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    category: 'Psychology',
    categoryLabel: 'Psychology & Cognitive Science',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780807014295-L.jpg',
    firstPublishYear: 1946,
    readTimeMinutes: 6,
    tagline: 'Psychiatrist Viktor Frankl’s immortal testament to finding transcendent purpose even in the darkest abyss.',
    description: 'Austrian psychiatrist Viktor Frankl recounts his survival in Auschwitz and Dachau during World War II, elucidating the psychological principles of Logotherapy. Frankl argues that even in conditions of unimaginable suffering, human beings possess the ultimate freedom to choose their attitude and uncover profound purpose.',
    workKey: '/works/OL1268413W',
  },
  {
    id: 'crime-and-punishment',
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    category: 'Fiction',
    categoryLabel: 'Masterpiece Fiction',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg',
    firstPublishYear: 1866,
    readTimeMinutes: 9,
    tagline: 'The agonizing moral descent and spiritual redemption of Rodion Raskolnikov in St. Petersburg.',
    description: 'Dostoevsky’s monumental psychological novel dissects the mental turmoil and moral dilemmas of an impoverished former student who formulates a theory of extraordinary beings above the law, then commits a murder that tests his conscience to its breaking point.',
    workKey: '/works/OL102749W',
  },
  {
    id: 'brief-history-of-time',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    categoryLabel: 'Science & The Living Universe',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg',
    firstPublishYear: 1988,
    readTimeMinutes: 8,
    tagline: 'Stephen Hawking guides readers through black holes, the Big Bang, and the quest for a theory of everything.',
    description: 'Theoretical physicist Stephen Hawking explores the fundamental questions of our universe: Where did it come from? How and why did it begin? Will it come to an end, and if so, how? Written in non-technical terms, Hawking unpacks spacetime, relativity, and quantum mechanics.',
    workKey: '/works/OL262758W',
  },
  {
    id: 'walden',
    title: 'Walden: Life in the Woods',
    author: 'Henry David Thoreau',
    category: 'Philosophy',
    categoryLabel: 'Philosophy & Stoic Wisdom',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780140390445-L.jpg',
    firstPublishYear: 1854,
    readTimeMinutes: 7,
    tagline: 'An experiment in living deliberately, stripping away all non-essentials to confront life as it is.',
    description: 'Henry David Thoreau chronicles two years, two months, and two days spent in a self-built cabin by the shores of Walden Pond in Massachusetts. A foundational work of transcendentalist literature exploring simplicity, voluntary solitude, self-reliance, and deep spiritual communion with the natural cosmos.',
    workKey: '/works/OL55649W',
  },
  {
    id: 'before-the-coffee-gets-cold',
    title: 'Before the Coffee Gets Cold',
    author: 'Toshikazu Kawaguchi',
    category: 'Fiction',
    categoryLabel: 'Masterpiece Fiction',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781335430991-L.jpg',
    firstPublishYear: 2015,
    readTimeMinutes: 5,
    tagline: 'In a quiet Tokyo alleyway café, a mysterious chair offers customers the chance to travel back in time.',
    description: 'In a cozy subterranean café in Tokyo, customers are given the opportunity to travel back in time—with strict rules: they must remain in a specific chair, the present cannot be altered, and they must return before their coffee gets cold. A tender Japanese novel exploring grief, regret, and reconciliation.',
    workKey: '/works/OL20875224W',
  },
  {
    id: 'beyond-good-and-evil',
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    category: 'Philosophy',
    categoryLabel: 'Philosophy & Stoic Wisdom',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780140449235-L.jpg',
    firstPublishYear: 1886,
    readTimeMinutes: 8,
    tagline: 'A bold, trenchant critique of traditional dogmas, exposing the psychological roots of morality and truth.',
    description: 'Nietzsche takes aim at past philosophers for their uncritical acceptance of moral prejudices. Through sharp aphorisms, he explores the will to power, master and slave morality, and the challenge for free spirits to define values beyond inherited dogmas.',
    workKey: '/works/OL98174W',
  },
  {
    id: 'to-the-lighthouse',
    title: 'To the Lighthouse',
    author: 'Virginia Woolf',
    category: 'Fiction',
    categoryLabel: 'Masterpiece Fiction',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780156907392-L.jpg',
    firstPublishYear: 1927,
    readTimeMinutes: 6,
    tagline: 'A luminous stream-of-consciousness exploration of memory, loss, time passing, and aesthetic creation.',
    description: 'Virginia Woolf’s landmark modernist novel centers on the Ramsay family’s seasonal visits to the Isle of Skye in Scotland. Through intricate stream-of-consciousness narrative and shifting psychological perspectives, Woolf explores the relentless passage of time, artistic struggle, childhood memory, and mourning.',
    workKey: '/works/OL21115814W',
  },
  {
    id: 'fahrenheit-451',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    category: 'Sci-Fi',
    categoryLabel: 'Sci-Fi & Speculative Futures',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg',
    firstPublishYear: 1953,
    readTimeMinutes: 6,
    tagline: 'In a society where television rules and literature is outlawed, firemen burn books instead of stopping fires.',
    description: 'In a dystopian American future where independent thought is outlawed and hedonistic entertainment numbs the public, fireman Guy Montag is tasked with destroying contraband books and the residences that house them. When a free-spirited neighbor questions his reality, Montag awakens to the transformative danger and beauty of literature.',
    workKey: '/works/OL103123W',
  },
  {
    id: 'the-prophet',
    title: 'The Prophet',
    author: 'Kahlil Gibran',
    category: 'Poetry',
    categoryLabel: 'Poetry & Lyric Resonance',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780394404288-L.jpg',
    firstPublishYear: 1923,
    readTimeMinutes: 5,
    tagline: '26 poetic fables on love, marriage, children, work, sorrow, and spiritual freedom.',
    description: 'The Prophet Almustafa, having lived in the city of Orphalese for twelve years, is about to board a ship which will carry him home. Before he departs, the townspeople ask him to speak on the eternal conditions of human existence: love, freedom, joy, sorrow, and death.',
    workKey: '/works/OL85144W',
  },
  {
    id: 'the-time-machine',
    title: 'The Time Machine',
    author: 'H. G. Wells',
    category: 'Sci-Fi',
    categoryLabel: 'Sci-Fi & Speculative Futures',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780141439976-L.jpg',
    firstPublishYear: 1895,
    readTimeMinutes: 6,
    tagline: 'The Victorian inventor journeys to the year 802,701 AD to discover humanity divided into the Eloi and Morlocks.',
    description: 'H. G. Wells\'s pioneering science fiction masterpiece popularized the concept of time travel via an intentional vehicle. Journeying forward into the distant future of 802,701 AD, the Time Traveller discovers an apparent terrestrial paradise of peaceful Eloi, only to uncover the horrifying subterranean world of the predatory Morlocks.',
    workKey: '/works/OL84315W',
  },
  {
    id: 'the-hound-of-the-baskervilles',
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    category: 'Mystery',
    categoryLabel: 'Mystery, Noir & Suspense',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780141439228-L.jpg',
    firstPublishYear: 1902,
    readTimeMinutes: 7,
    tagline: 'Sherlock Holmes and Dr. Watson investigate a terrifying ghostly hound stalking the Dartmoor moors.',
    description: 'Sir Arthur Conan Doyle’s most celebrated Sherlock Holmes adventure pits the great detective against the legendary curse of the Baskerville family amidst the eerie, fog-drenched moors of Devonshire. A masterpiece of gothic atmosphere, deduction, and suspense.',
    workKey: '/works/OL262423W',
  },
  {
    id: 'show-your-work',
    title: 'Show Your Work!',
    author: 'Austin Kleon',
    category: 'Habits',
    categoryLabel: 'Habits & Focus',
    coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780761178972-L.jpg',
    firstPublishYear: 2014,
    readTimeMinutes: 5,
    tagline: '10 transformative ways to share your creativity and get discovered without self-promoting greed.',
    description: 'Austin Kleon shows how generative openness and generosity beat pushy self-promotion every time. Rather than hoarding unfinished work or waiting until you are a world-renowned genius, Kleon outlines 10 actionable rules for sharing daily creative scraps, cultivating an authentic audience, and learning in public.',
    workKey: '/works/OL16821630W',
  },
];

/**
 * Returns the current calendar week index since the fixed epoch (Monday, Jan 1, 2024 00:00:00 UTC).
 * This value increments ONLY on Monday at 00:00:00 UTC and is strictly identical for every user worldwide.
 */
export function getCurrentWeekIndex(date: Date = new Date()): number {
  const nowUtc = date.getTime();
  const diffMs = Math.max(0, nowUtc - EPOCH_MONDAY_UTC);
  return Math.floor(diffMs / ONE_WEEK_MS);
}

/**
 * Returns the number of days remaining in the current calendar week (until next Monday 00:00:00 UTC).
 */
export function getDaysRemainingInWeek(date: Date = new Date()): number {
  const nowUtc = date.getTime();
  const diffMs = Math.max(0, nowUtc - EPOCH_MONDAY_UTC);
  const msIntoCurrentWeek = diffMs % ONE_WEEK_MS;
  const msRemaining = ONE_WEEK_MS - msIntoCurrentWeek;
  return Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
}

/**
 * Deterministically returns the active Book of the Week for the current calendar week.
 * Remains 100% constant and frozen for the full 7-day period (Monday to Sunday) across all users globally.
 */
export function getBookOfTheWeek(date: Date = new Date()): BookOfTheWeek {
  const weekIndex = getCurrentWeekIndex(date);
  const index = weekIndex % WEEKLY_BOOK_ROSTER.length;
  return WEEKLY_BOOK_ROSTER[index];
}
