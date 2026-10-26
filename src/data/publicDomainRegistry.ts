/**
 * Verified Public Domain Registry for Instant 0ms Book Downloads
 * Maps timeless classics to reliable, high-speed public domain archives
 * (Internet Archive, Project Gutenberg CDN).
 */

export interface PublicDomainBookEntry {
  available: boolean;
  primaryFormat?: 'PDF' | 'EPUB';
  hasPdf?: boolean;
  hasEpub?: boolean;
  pdfUrl?: string;
  epubUrl?: string;
  source?: string;
}

export interface RegistryItem {
  title: string;
  author: string;
  matches: string[];
  authorMatches?: string[];
  entry: PublicDomainBookEntry;
}

export const PUBLIC_DOMAIN_REGISTRY: RegistryItem[] = [
  {
    title: 'The Time Machine',
    author: 'H. G. Wells',
    matches: ['the time machine', 'time machine'],
    authorMatches: ['h g wells', 'hg wells', 'wells'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/timemachineinven00welluoft/timemachineinven00welluoft.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/35/pg35.epub',
      source: 'Internet Archive & Gutenberg',
    },
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    matches: ['pride and prejudice', 'pride & prejudice', 'pride prejudice'],
    authorMatches: ['jane austen', 'austen'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/prideprejudice00aust/prideprejudice00aust.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Frankenstein',
    author: 'Mary Shelley',
    matches: ['frankenstein', 'the modern prometheus'],
    authorMatches: ['mary shelley', 'shelley'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/frankensteinormo00shel_8/frankensteinormo00shel_8.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    matches: ['dracula'],
    authorMatches: ['bram stoker', 'stoker'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/dracula00stok_8/dracula00stok_8.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/345/pg345.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    matches: ['the great gatsby', 'great gatsby', 'gatsby'],
    authorMatches: ['fitzgerald', 'scott fitzgerald'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/greatgatsby0000unse_p9z0/greatgatsby0000unse_p9z0.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/64317/pg64317.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    matches: ['alice in wonderland', 'alices adventures in wonderland', 'alice'],
    authorMatches: ['lewis carroll', 'carroll'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/alicesadventures0000unse_v7d2/alicesadventures0000unse_v7d2.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    matches: ['the picture of dorian gray', 'picture of dorian gray', 'dorian gray'],
    authorMatches: ['oscar wilde', 'wilde'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/thepictureofdori0000unse/thepictureofdori0000unse.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/174/pg174.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Metamorphosis',
    author: 'Franz Kafka',
    matches: ['the metamorphosis', 'metamorphosis', 'die verwandlung'],
    authorMatches: ['franz kafka', 'kafka'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/metamorphosis0000kafk_g4r1/metamorphosis0000kafk_g4r1.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/5200/pg5200.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    matches: ['meditations'],
    authorMatches: ['marcus aurelius', 'aurelius'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/the-meditations-of-marcus-aurelius/The_Meditations_of_Marcus_Aurelius.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/2680/pg2680.epub',
      source: 'Internet Archive & Gutenberg',
    },
  },
  {
    title: 'The Republic',
    author: 'Plato',
    matches: ['the republic', 'republic'],
    authorMatches: ['plato'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/republicofplato00platiala/republicofplato00platiala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1497/pg1497.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Prince',
    author: 'Niccolò Machiavelli',
    matches: ['the prince', 'prince'],
    authorMatches: ['machiavelli', 'niccolo'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/the-prince-machiavelli/The_Prince_Machiavelli.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1232/pg1232.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    matches: ['beyond good and evil', 'jenseits von gut und bose'],
    authorMatches: ['nietzsche', 'friedrich'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/beyondgoodandevi00nietuoft/beyondgoodandevi00nietuoft.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/4363/pg4363.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Letters from a Stoic',
    author: 'Seneca',
    matches: ['letters from a stoic', 'epistulae morales', 'stoic letters'],
    authorMatches: ['seneca'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/senecas-letters-from-a-stoic/Senecas_Letters_from_a_Stoic.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/56071/pg56071.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Siddhartha',
    author: 'Hermann Hesse',
    matches: ['siddhartha'],
    authorMatches: ['hermann hesse', 'hesse'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/siddharthaanindi00hess/siddharthaanindi00hess.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/2500/pg2500.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    matches: ['moby dick', 'moby-dick', 'the whale'],
    authorMatches: ['herman melville', 'melville'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/mobydickorwhale01melv/mobydickorwhale01melv.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/2701/pg2701.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    matches: ['sherlock holmes', 'adventures of sherlock holmes', 'the adventures of sherlock holmes'],
    authorMatches: ['arthur conan doyle', 'conan doyle', 'doyle'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/adventuresofsher00doyliala/adventuresofsher00doyliala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    matches: ['jane eyre'],
    authorMatches: ['charlotte bronte', 'bronte'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/janeeyre00shargoog/janeeyre00shargoog.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1260/pg1260.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    matches: ['wuthering heights'],
    authorMatches: ['emily bronte', 'bronte'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/wutheringheight00bellgoog/wutheringheight00bellgoog.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/768/pg768.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    matches: ['crime and punishment', 'crime & punishment'],
    authorMatches: ['dostoevsky', 'dostoyevsky', 'fyodor'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/crimepunishment00dost/crimepunishment00dost.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/2554/pg2554.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    matches: ['brothers karamazov', 'the brothers karamazov'],
    authorMatches: ['dostoevsky', 'dostoyevsky', 'fyodor'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/brotherskaramazo00dostuoft/brotherskaramazo00dostuoft.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/28054/pg28054.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    matches: ['war and peace', 'war & peace'],
    authorMatches: ['leo tolstoy', 'tolstoy'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/warandpeace01tols/warandpeace01tols.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/2600/pg2600.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    matches: ['anna karenina'],
    authorMatches: ['leo tolstoy', 'tolstoy'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/annakarenina01tols/annakarenina01tols.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1399/pg1399.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    matches: ['a tale of two cities', 'tale of two cities'],
    authorMatches: ['charles dickens', 'dickens'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/ataleoftwocities00dickiala/ataleoftwocities00dickiala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/98/pg98.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Great Expectations',
    author: 'Charles Dickens',
    matches: ['great expectations'],
    authorMatches: ['charles dickens', 'dickens'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/greatexpectation00dick/greatexpectation00dick.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1400/pg1400.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: '1984',
    author: 'George Orwell',
    matches: ['1984', 'nineteen eighty-four', 'nineteen eighty four'],
    authorMatches: ['george orwell', 'orwell'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/george-orwell-1984-high-quality/George-Orwell-1984.pdf',
      epubUrl: 'https://archive.org/download/george-orwell-1984-high-quality/George-Orwell-1984.epub',
      source: 'Internet Archive',
    },
  },
  {
    title: 'Animal Farm',
    author: 'George Orwell',
    matches: ['animal farm'],
    authorMatches: ['george orwell', 'orwell'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/animal-farm-george-orwell/Animal_Farm.pdf',
      epubUrl: 'https://archive.org/download/animal-farm-george-orwell/Animal_Farm.epub',
      source: 'Internet Archive',
    },
  },
  {
    title: 'The Art of War',
    author: 'Sun Tzu',
    matches: ['the art of war', 'art of war'],
    authorMatches: ['sun tzu', 'sunzi', 'sun zi'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/artofwar00suntiala/artofwar00suntiala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/132/pg132.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Odyssey',
    author: 'Homer',
    matches: ['the odyssey', 'odyssey'],
    authorMatches: ['homer'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/odysseyofhomer00homeiala/odysseyofhomer00homeiala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1727/pg1727.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Iliad',
    author: 'Homer',
    matches: ['the iliad', 'iliad'],
    authorMatches: ['homer'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/iliadofhomer01homeiala/iliadofhomer01homeiala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/6130/pg6130.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    matches: ['the count of monte cristo', 'count of monte cristo', 'monte cristo'],
    authorMatches: ['alexandre dumas', 'dumas'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/countofmontecris01duma/countofmontecris01duma.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1184/pg1184.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Les Misérables',
    author: 'Victor Hugo',
    matches: ['les miserables', 'les misérables'],
    authorMatches: ['victor hugo', 'hugo'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/lesmiserables01hugo/lesmiserables01hugo.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/135/pg135.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Trial',
    author: 'Franz Kafka',
    matches: ['the trial', 'trial', 'der prozess'],
    authorMatches: ['franz kafka', 'kafka'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/derprozess00kafk/derprozess00kafk.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/7849/pg7849.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Dubliners',
    author: 'James Joyce',
    matches: ['dubliners'],
    authorMatches: ['james joyce', 'joyce'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/dubliners00joycuoft/dubliners00joycuoft.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/2814/pg2814.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Heart of Darkness',
    author: 'Joseph Conrad',
    matches: ['heart of darkness'],
    authorMatches: ['joseph conrad', 'conrad'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/heartofdarkness00conr/heartofdarkness00conr.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/219/pg219.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'The Yellow Wallpaper',
    author: 'Charlotte Perkins Gilman',
    matches: ['the yellow wallpaper', 'yellow wallpaper'],
    authorMatches: ['gilman', 'charlotte perkins'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/yellowwallpaper00gilmgoog/yellowwallpaper00gilmgoog.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/1952/pg1952.epub',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    title: 'Walden',
    author: 'Henry David Thoreau',
    matches: ['walden', 'life in the woods'],
    authorMatches: ['thoreau', 'henry david thoreau'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/waldenorlifeinwo00thoriala/waldenorlifeinwo00thoriala.pdf',
      epubUrl: 'https://www.gutenberg.org/cache/epub/205/pg205.epub',
      source: 'Project Gutenberg & IA',
    },
  },
];

function normalizeTitle(str: string): string {
  return str
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/^a\s+/, '')
    .replace(/^an\s+/, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normalizeAuthor(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

export function findPublicDomainBook(title?: string, author?: string): PublicDomainBookEntry | null {
  if (!title) return null;
  const cleanSearchTitle = normalizeTitle(title);
  if (!cleanSearchTitle) return null;

  const cleanSearchAuthor = author ? normalizeAuthor(author) : '';

  for (const item of PUBLIC_DOMAIN_REGISTRY) {
    const itemTitleNorm = normalizeTitle(item.title);
    
    // 1. Direct or alias match
    const titleMatch = 
      cleanSearchTitle === itemTitleNorm ||
      item.matches.some(m => normalizeTitle(m) === cleanSearchTitle || cleanSearchTitle.includes(normalizeTitle(m)) || normalizeTitle(m).includes(cleanSearchTitle));

    if (!titleMatch) continue;

    // 2. Author verification if provided
    if (cleanSearchAuthor && item.authorMatches && item.authorMatches.length > 0) {
      const authorTokens = cleanSearchAuthor.split(/\s+/).filter(t => t.length > 2);
      const matchesAuthor = authorTokens.some(tok => 
        item.authorMatches!.some(am => am.toLowerCase().includes(tok))
      );

      // If the title was an exact match (e.g. "The Time Machine" or "Pride and Prejudice"),
      // we accept it even if author string is slightly different.
      // If title was partial, we require author confirmation.
      if (cleanSearchTitle === itemTitleNorm || matchesAuthor) {
        return item.entry;
      }
    } else {
      return item.entry;
    }
  }

  return null;
}
