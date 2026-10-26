import type { IncomingMessage, ServerResponse } from 'http';

// ==============================================================================
// SELF-CONTAINED VERIFIED PUBLIC DOMAIN REGISTRY (Zero external relative imports)
// Guarantees 100% reliable execution on Vercel Serverless & Node.js ESM runtimes
// ==============================================================================

/**
 * Verified Public Domain Registry for Instant 0ms Book Downloads
 * Maps timeless classics to reliable, high-speed public domain archives
 * (Internet Archive, Project Gutenberg CDN).
 */

interface PublicDomainBookEntry {
  available: boolean;
  primaryFormat?: 'PDF' | 'EPUB';
  hasPdf?: boolean;
  hasEpub?: boolean;
  pdfUrl?: string;
  epubUrl?: string;
  source?: string;
}

interface RegistryItem {
  title: string;
  author: string;
  matches: string[];
  authorMatches?: string[];
  entry: PublicDomainBookEntry;
}

const PUBLIC_DOMAIN_REGISTRY: RegistryItem[] = [
  {
    title: 'The Time Machine',
    author: 'H. G. Wells',
    matches: ['the time machine', 'time machine'],
    authorMatches: ['h g wells', 'hg wells', 'wells'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
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
      primaryFormat: 'EPUB',
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
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/84/pg84.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    matches: ['dracula'],
    authorMatches: ['bram stoker', 'stoker'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/345/pg345.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    matches: ['the great gatsby', 'great gatsby', 'gatsby'],
    authorMatches: ['fitzgerald', 'scott fitzgerald'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/64317/pg64317.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    matches: ['alice in wonderland', 'alices adventures in wonderland', 'alice'],
    authorMatches: ['lewis carroll', 'carroll'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    matches: ['the picture of dorian gray', 'picture of dorian gray', 'dorian gray'],
    authorMatches: ['oscar wilde', 'wilde'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/174/pg174.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Metamorphosis',
    author: 'Franz Kafka',
    matches: ['the metamorphosis', 'metamorphosis', 'die verwandlung'],
    authorMatches: ['franz kafka', 'kafka'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/5200/pg5200.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    matches: ['meditations'],
    authorMatches: ['marcus aurelius', 'aurelius'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
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
      primaryFormat: 'EPUB',
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
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/1232/pg1232.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Beyond Good and Evil',
    author: 'Friedrich Nietzsche',
    matches: ['beyond good and evil', 'jenseits von gut und bose'],
    authorMatches: ['nietzsche', 'friedrich'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/4363/pg4363.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Letters from a Stoic',
    author: 'Seneca',
    matches: ['letters from a stoic', 'epistulae morales', 'stoic letters'],
    authorMatches: ['seneca'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/56071/pg56071.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Siddhartha',
    author: 'Hermann Hesse',
    matches: ['siddhartha'],
    authorMatches: ['hermann hesse', 'hesse'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/2500/pg2500.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    matches: ['moby dick', 'moby-dick', 'the whale'],
    authorMatches: ['herman melville', 'melville'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/2701/pg2701.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    matches: ['sherlock holmes', 'adventures of sherlock holmes', 'the adventures of sherlock holmes'],
    authorMatches: ['arthur conan doyle', 'conan doyle', 'doyle'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    matches: ['jane eyre'],
    authorMatches: ['charlotte bronte', 'bronte'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/1260/pg1260.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    matches: ['wuthering heights'],
    authorMatches: ['emily bronte', 'bronte'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/768/pg768.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    matches: ['crime and punishment', 'crime & punishment'],
    authorMatches: ['dostoevsky', 'dostoyevsky', 'fyodor'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/2554/pg2554.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Brothers Karamazov',
    author: 'Fyodor Dostoevsky',
    matches: ['brothers karamazov', 'the brothers karamazov'],
    authorMatches: ['dostoevsky', 'dostoyevsky', 'fyodor'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/28054/pg28054.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'War and Peace',
    author: 'Leo Tolstoy',
    matches: ['war and peace', 'war & peace'],
    authorMatches: ['leo tolstoy', 'tolstoy'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/2600/pg2600.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Anna Karenina',
    author: 'Leo Tolstoy',
    matches: ['anna karenina'],
    authorMatches: ['leo tolstoy', 'tolstoy'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/1399/pg1399.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    matches: ['a tale of two cities', 'tale of two cities'],
    authorMatches: ['charles dickens', 'dickens'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/98/pg98.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Great Expectations',
    author: 'Charles Dickens',
    matches: ['great expectations'],
    authorMatches: ['charles dickens', 'dickens'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/1400/pg1400.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: '1984',
    author: 'George Orwell',
    matches: ['1984', 'nineteen eighty four', 'nineteen eighty-four'],
    authorMatches: ['george orwell', 'orwell'],
    entry: {
      available: false,
    },
  },
  {
    title: 'Animal Farm',
    author: 'George Orwell',
    matches: ['animal farm'],
    authorMatches: ['george orwell', 'orwell'],
    entry: {
      available: false,
    },
  },
  {
    title: 'The Art of War',
    author: 'Sun Tzu',
    matches: ['the art of war', 'art of war'],
    authorMatches: ['sun tzu', 'sunzi', 'sun zi'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/132/pg132.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Odyssey',
    author: 'Homer',
    matches: ['the odyssey', 'odyssey'],
    authorMatches: ['homer'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
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
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/6130/pg6130.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    matches: ['the count of monte cristo', 'count of monte cristo', 'monte cristo'],
    authorMatches: ['alexandre dumas', 'dumas'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/1184/pg1184.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Les Misérables',
    author: 'Victor Hugo',
    matches: ['les miserables', 'les misérables'],
    authorMatches: ['victor hugo', 'hugo'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/135/pg135.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Trial',
    author: 'Franz Kafka',
    matches: ['the trial', 'trial', 'der prozess'],
    authorMatches: ['franz kafka', 'kafka'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/7849/pg7849.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Dubliners',
    author: 'James Joyce',
    matches: ['dubliners'],
    authorMatches: ['james joyce', 'joyce'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/2814/pg2814.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'Heart of Darkness',
    author: 'Joseph Conrad',
    matches: ['heart of darkness'],
    authorMatches: ['joseph conrad', 'conrad'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/219/pg219.epub',
      source: 'Project Gutenberg',
    },
  },
  {
    title: 'The Yellow Wallpaper',
    author: 'Charlotte Perkins Gilman',
    matches: ['the yellow wallpaper', 'yellow wallpaper'],
    authorMatches: ['gilman', 'charlotte perkins'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
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
      primaryFormat: 'EPUB',
      hasPdf: false,
      hasEpub: true,
      epubUrl: 'https://www.gutenberg.org/cache/epub/205/pg205.epub',
      source: 'Project Gutenberg',
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

function findPublicDomainBook(title?: string, author?: string): PublicDomainBookEntry | null {
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


interface AvailabilityResult {
  available: boolean;
  primaryFormat?: 'PDF' | 'EPUB';
  hasPdf?: boolean;
  hasEpub?: boolean;
  pdfUrl?: string;
  epubUrl?: string;
  source?: string;
}

// Step A: Check Open Library for public domain scan with IA (Internet Archive) ID
async function checkOpenLibrary(title: string, author?: string): Promise<{ pdfUrl?: string; epubUrl?: string } | null> {
  try {
    const cleanTitle = title.trim();
    const cleanAuthor = (author || '').trim();
    
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=5&fields=key,title,author_name,public_scan_b,ia`;
    if (cleanAuthor) {
      url += `&author=${encodeURIComponent(cleanAuthor)}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    const docs = Array.isArray(data.docs) ? data.docs : [];
    const scanDoc = docs.find((d: any) => (d.public_scan_b === true || Array.isArray(d.ia)) && d.ia?.[0]) || docs.find((d: any) => d.ia?.[0]);
    
    if (scanDoc && scanDoc.ia && scanDoc.ia[0]) {
      const iaId = scanDoc.ia[0];
      return {
        pdfUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
        epubUrl: `https://archive.org/download/${iaId}/${iaId}.epub`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Step B: Check Gutendex API for Project Gutenberg public domain EPUB or PDF formats
async function checkGutendex(title: string, author?: string): Promise<{ pdfUrl?: string; epubUrl?: string } | null> {
  try {
    const cleanTitle = title.trim();
    const cleanAuthor = (author || '').trim();
    const searchQuery = cleanAuthor ? `${cleanTitle} ${cleanAuthor}` : cleanTitle;
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(searchQuery)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const book = data.results?.[0];
    if (!book || !book.formats) return null;

    const formats = book.formats;
    const pdfUrl = formats['application/pdf'] || null;
    const epubUrl = 
      formats['application/epub+zip'] || 
      (book.id ? `https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.epub` : null);

    if (!pdfUrl && !epubUrl) return null;

    return {
      pdfUrl: pdfUrl || undefined,
      epubUrl: epubUrl || undefined,
    };
  } catch {
    return null;
  }
}

// Stream book file directly to browser with Content-Disposition: attachment
async function streamFile(
  res: any, 
  targetUrl: string, 
  title: string, 
  format: string,
  fallbackUrl?: string,
  fallbackFormat?: string
) {
  const isEpub = format.toLowerCase() === 'epub';
  const targetExt = isEpub ? 'epub' : 'pdf';
  const mimeType = isEpub ? 'application/epub+zip' : 'application/pdf';
  const cleanTitle = title.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'book';
  const filename = `${cleanTitle}.${targetExt}`;

  async function tryStream(url: string, mime: string, fname: string): Promise<boolean> {
    try {
      const fileRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
      });

      if (!fileRes.ok || !fileRes.body) {
        return false;
      }

      res.setHeader('Content-Type', mime);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fname)}"; filename*=UTF-8''${encodeURIComponent(fname)}`
      );

      const contentLength = fileRes.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      const { Readable } = await import('stream');
      if (typeof Readable.fromWeb === 'function') {
        Readable.fromWeb(fileRes.body as any).pipe(res);
      } else {
        const reader = fileRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      }
      return true;
    } catch (err) {
      console.warn(`Streaming failed for ${url}:`, err);
      return false;
    }
  }

  // 1. Try primary URL
  const primarySuccess = await tryStream(targetUrl, mimeType, filename);
  if (primarySuccess) return;

  // 2. If primary failed, try fallback URL (e.g. Gutenberg EPUB)
  if (fallbackUrl && fallbackUrl !== targetUrl) {
    const fbIsEpub = (fallbackFormat || 'epub').toLowerCase() === 'epub';
    const fbExt = fbIsEpub ? 'epub' : 'pdf';
    const fbMime = fbIsEpub ? 'application/epub+zip' : 'application/pdf';
    const fbFilename = `${cleanTitle}.${fbExt}`;
    const fbSuccess = await tryStream(fallbackUrl, fbMime, fbFilename);
    if (fbSuccess) return;
  }

  // 3. Both failed: Return clean 502 JSON error rather than a dead 302 redirect
  return res.status(502).json({
    error: 'The book source file is temporarily unreachable from upstream archives. Please try again or request via Telegram.',
    available: false,
  });
}

function wrapResponse(res: any) {
  if (!res.status) {
    res.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function (data: any) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
      return this;
    };
  }
  if (!res.redirect) {
    res.redirect = function (statusOrUrl: number | string, optUrl?: string) {
      const status = typeof statusOrUrl === 'number' ? statusOrUrl : 302;
      const url = typeof statusOrUrl === 'string' ? statusOrUrl : optUrl!;
      this.statusCode = status;
      this.setHeader('Location', url);
      this.end();
      return this;
    };
  }
  return res;
}

function parseQuery(req: any): Record<string, string> {
  if (req.query && typeof req.query === 'object') {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.query)) {
      out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return out;
  }
  try {
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    const out: Record<string, string> = {};
    parsedUrl.searchParams.forEach((val, key) => {
      out[key] = val;
    });
    return out;
  } catch {
    return {};
  }
}

export default async function handler(req: any, res: any) {
  try {
    wrapResponse(res);

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const query = parseQuery(req);
    const title = (query.title || '').trim();
    const author = (query.author || '').trim();
    const mode = (query.mode || 'check').toLowerCase();
    const requestedFormat = (query.format || '').toLowerCase();
    const directUrl = (query.url || '').trim();

    if (!title && !directUrl) {
      return res.status(400).json({ error: 'Title or url parameter is required', available: false });
    }

    // Direct URL streaming shortcut (if client already knows the direct CDN link)
    if (directUrl && mode === 'download') {
      const isEpub = requestedFormat === 'epub' || directUrl.endsWith('.epub');
      return streamFile(res, directUrl, title || 'book', isEpub ? 'epub' : 'pdf');
    }

    // 1. FAST REGISTRY LOOKUP
    const registryMatch = findPublicDomainBook(title, author);
    if (registryMatch && registryMatch.available) {
      if (mode === 'check') {
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        return res.status(200).json({
          available: true,
          primaryFormat: registryMatch.primaryFormat,
          hasPdf: registryMatch.hasPdf,
          hasEpub: registryMatch.hasEpub,
          pdfUrl: registryMatch.pdfUrl,
          epubUrl: registryMatch.epubUrl,
          source: registryMatch.source || 'registry',
        } as AvailabilityResult);
      }

      if (mode === 'download') {
        const isEpub = requestedFormat === 'epub' && registryMatch.epubUrl;
        const targetUrl = isEpub
          ? registryMatch.epubUrl
          : (registryMatch.pdfUrl || registryMatch.epubUrl);
        const fallbackUrl = !isEpub ? registryMatch.epubUrl : undefined;

        if (targetUrl) {
          return streamFile(res, targetUrl, title, isEpub ? 'epub' : (registryMatch.pdfUrl ? 'pdf' : 'epub'), fallbackUrl, 'epub');
        }
      }
    }

    // 2. DYNAMIC LIVE LOOKUP: Run Open Library & Gutendex in parallel
    const [olResult, gutenResult] = await Promise.allSettled([
      checkOpenLibrary(title, author),
      checkGutendex(title, author),
    ]);

    const olData = olResult.status === 'fulfilled' ? olResult.value : null;
    const gutenData = gutenResult.status === 'fulfilled' ? gutenResult.value : null;

    const epubUrl = gutenData?.epubUrl || olData?.epubUrl || null;
    const pdfUrl = olData?.pdfUrl || gutenData?.pdfUrl || null;

    const hasEpub = Boolean(epubUrl);
    const hasPdf = Boolean(pdfUrl);
    const available = hasEpub || hasPdf;
    const primaryFormat: 'PDF' | 'EPUB' | undefined = hasEpub ? 'EPUB' : (hasPdf ? 'PDF' : undefined);

    // MODE: CHECK
    if (mode === 'check') {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      if (!available) {
        return res.status(200).json({ available: false });
      }
      return res.status(200).json({
        available: true,
        primaryFormat,
        hasPdf,
        hasEpub,
        pdfUrl: pdfUrl || undefined,
        epubUrl: epubUrl || undefined,
        source: gutenData ? 'gutendex' : 'openlibrary',
      } as AvailabilityResult);
    }

    // MODE: DOWNLOAD
    if (mode === 'download') {
      if (!available) {
        return res.status(404).json({ error: 'Book file not available for download', available: false });
      }

      const isEpub = requestedFormat === 'epub' && epubUrl;
      let targetUrl = '';
      let targetFormat = 'epub';
      let fallbackUrl = undefined;
      let fallbackFormat = 'epub';

      if (isEpub) {
        targetUrl = epubUrl!;
        targetFormat = 'epub';
        fallbackUrl = pdfUrl || undefined;
        fallbackFormat = 'pdf';
      } else if (pdfUrl) {
        targetUrl = pdfUrl;
        targetFormat = 'pdf';
        fallbackUrl = epubUrl || undefined;
        fallbackFormat = 'epub';
      } else {
        targetUrl = epubUrl || '';
        targetFormat = 'epub';
      }

      if (!targetUrl) {
        return res.status(404).json({ error: 'Requested format not available', available: false });
      }

      return streamFile(res, targetUrl, title, targetFormat, fallbackUrl, fallbackFormat);
    }

    return res.status(400).json({ error: `Unknown mode: ${mode}` });
  } catch (fatalErr: any) {
    console.error('[book-file-api] Fatal unhandled error:', fatalErr);
    return res.status(500).json({
      error: 'An internal server error occurred processing the book file request.',
      details: fatalErr?.message
    });
  }
}
