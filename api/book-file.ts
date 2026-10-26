import type { IncomingMessage, ServerResponse } from 'http';
import { findPublicDomainBook } from '../src/data/publicDomainRegistry';

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
    
    // Build query with title and optional author, avoiding slow fulltext flag
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=5&fields=key,title,author_name,public_scan_b,ia`;
    if (cleanAuthor) {
      url += `&author=${encodeURIComponent(cleanAuthor)}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Liread/1.0; +https://liread.app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    // Prefer docs explicitly marked with public_scan_b and having an Internet Archive ID
    const docs = Array.isArray(data.docs) ? data.docs : [];
    const scanDoc = docs.find((d: any) => (d.public_scan_b === true || Array.isArray(d.ia)) && d.ia?.[0]) || docs.find((d: any) => d.ia?.[0]);
    
    if (scanDoc && scanDoc.ia && scanDoc.ia[0]) {
      const iaId = scanDoc.ia[0];
      return {
        pdfUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
        epubUrl: `https://archive.org/download/${iaId}/${iaId}.epub`,
      };
    }

    // Secondary fallback: general search query if title+author exact search didn't yield IA ID
    if (cleanAuthor) {
      const fallbackUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(`${cleanTitle} ${cleanAuthor}`)}&limit=4&fields=key,title,author_name,public_scan_b,ia`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Liread/1.0; +https://liread.app)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const fallbackDocs = Array.isArray(fallbackData.docs) ? fallbackData.docs : [];
        const fallbackDoc = fallbackDocs.find((d: any) => d.ia?.[0]);
        if (fallbackDoc && fallbackDoc.ia?.[0]) {
          const iaId = fallbackDoc.ia[0];
          return {
            pdfUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
            epubUrl: `https://archive.org/download/${iaId}/${iaId}.epub`,
          };
        }
      }
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
    
    // Note: Gutendex strictly requires the trailing slash before query parameters to avoid 301 redirects
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(searchQuery)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Liread/1.0; +https://liread.app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const book = data.results?.[0];
    if (!book || !book.formats) return null;

    const formats = book.formats;
    const pdfUrl = formats['application/pdf'] || null;
    const epubUrl = 
      formats['application/epub+zip'] || 
      (book.id ? `https://www.gutenberg.org/ebooks/${book.id}.epub3.images` : null);

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
// This prevents cross-origin navigation, avoids tab popups, and triggers a real native browser download immediately.
async function streamFile(res: any, targetUrl: string, title: string, format: string) {
  const isEpub = format.toLowerCase() === 'epub';
  const targetExt = isEpub ? 'epub' : 'pdf';
  const mimeType = isEpub ? 'application/epub+zip' : 'application/pdf';
  const cleanTitle = title.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'book';
  const filename = `${cleanTitle}.${targetExt}`;

  try {
    const fileRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Liread/1.0',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    if (!fileRes.ok || !fileRes.body) {
      return res.redirect(302, targetUrl);
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const contentLength = fileRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream chunks directly from CDN to browser without buffering in memory
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
  } catch {
    // Graceful fallback if streaming fails
    return res.redirect(302, targetUrl);
  }
}

// Helper: Ensure res has standard express/vercel methods (status, json, redirect)
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

// Helper: Extract query parameters from request
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

  if (!title) {
    return res.status(400).json({ error: 'Title parameter is required', available: false });
  }

  // 1. FAST REGISTRY LOOKUP: Zero-delay instant check for verified timeless classics
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
        source: 'registry',
      } as AvailabilityResult);
    }

    if (mode === 'download') {
      const isEpub = requestedFormat === 'epub' && registryMatch.epubUrl;
      const targetUrl = isEpub
        ? registryMatch.epubUrl
        : (registryMatch.pdfUrl || registryMatch.epubUrl);

      if (targetUrl) {
        return streamFile(res, targetUrl, title, isEpub ? 'epub' : 'pdf');
      }
    }
  }

  // 2. DYNAMIC LIVE LOOKUP: Run Open Library & Gutendex checks in parallel
  const [olResult, gutenResult] = await Promise.allSettled([
    checkOpenLibrary(title, author),
    checkGutendex(title, author),
  ]);

  const olData = olResult.status === 'fulfilled' ? olResult.value : null;
  const gutenData = gutenResult.status === 'fulfilled' ? gutenResult.value : null;

  const pdfUrl = olData?.pdfUrl || gutenData?.pdfUrl || null;
  const epubUrl = gutenData?.epubUrl || olData?.epubUrl || null;

  const hasPdf = Boolean(pdfUrl);
  const hasEpub = Boolean(epubUrl);
  const available = hasPdf || hasEpub;
  const primaryFormat: 'PDF' | 'EPUB' | undefined = hasPdf ? 'PDF' : (hasEpub ? 'EPUB' : undefined);

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

    // Determine target download URL & format
    const isEpub = requestedFormat === 'epub' && epubUrl;
    let targetUrl = '';
    if (isEpub) {
      targetUrl = epubUrl!;
    } else if (pdfUrl) {
      targetUrl = pdfUrl;
    } else {
      targetUrl = epubUrl || '';
    }

    if (!targetUrl) {
      return res.status(404).json({ error: 'Requested format not available', available: false });
    }

    return streamFile(res, targetUrl, title, isEpub ? 'epub' : 'pdf');
  }

  // Unknown mode
  return res.status(400).json({ error: `Unknown mode: ${mode}` });
}
