import type { IncomingMessage, ServerResponse } from 'http';

interface AvailabilityResult {
  available: boolean;
  primaryFormat?: 'PDF' | 'EPUB';
  hasPdf?: boolean;
  hasEpub?: boolean;
}

// Step A: Check Open Library for direct public domain scan with IA ID
async function checkOpenLibrary(title: string, author?: string): Promise<{ iaId: string; pdfUrl: string } | null> {
  try {
    const cleanTitle = title.trim();
    const cleanAuthor = (author || '').trim();
    
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&has_fulltext=true&limit=5&fields=key,title,author_name,public_scan_b,ia`;
    if (cleanAuthor) {
      url += `&author=${encodeURIComponent(cleanAuthor)}`;
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Liread/1.0 (contact: support@liread.app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8500),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const doc = data.docs?.find((d: any) => d.public_scan_b === true && Array.isArray(d.ia) && d.ia.length > 0);
    
    if (doc && doc.ia && doc.ia[0]) {
      const iaId = doc.ia[0];
      return {
        iaId,
        pdfUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
      };
    }

    // If searching with author didn't yield a scan, fallback to searching just by title
    if (cleanAuthor) {
      const fallbackUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&has_fulltext=true&limit=5&fields=key,title,author_name,public_scan_b,ia`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Liread/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(6500),
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const fallbackDoc = fallbackData.docs?.find((d: any) => d.public_scan_b === true && Array.isArray(d.ia) && d.ia.length > 0);
        if (fallbackDoc && fallbackDoc.ia && fallbackDoc.ia[0]) {
          const iaId = fallbackDoc.ia[0];
          return {
            iaId,
            pdfUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Step B: Check Gutendex API for PDF or EPUB formats
async function checkGutendex(title: string, author?: string): Promise<{ pdfUrl: string | null; epubUrl: string | null } | null> {
  try {
    const cleanTitle = title.trim();
    const cleanAuthor = (author || '').trim();
    const searchQuery = cleanAuthor ? `${cleanTitle} ${cleanAuthor}` : cleanTitle;
    const url = `https://gutendex.com/books?search=${encodeURIComponent(searchQuery)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Liread/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const book = data.results?.[0];
    if (!book || !book.formats) return null;

    const formats = book.formats;
    const pdfUrl = formats['application/pdf'] || null;
    const epubUrl = formats['application/epub+zip'] || null;

    if (!pdfUrl && !epubUrl) return null;

    return { pdfUrl, epubUrl };
  } catch {
    return null;
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

  // Run Open Library & Gutendex checks in parallel
  const [olResult, gutenResult] = await Promise.allSettled([
    checkOpenLibrary(title, author),
    checkGutendex(title, author),
  ]);

  const olData = olResult.status === 'fulfilled' ? olResult.value : null;
  const gutenData = gutenResult.status === 'fulfilled' ? gutenResult.value : null;

  const pdfUrl = olData?.pdfUrl || gutenData?.pdfUrl || null;
  const epubUrl = gutenData?.epubUrl || null;

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
    } as AvailabilityResult);
  }

  // MODE: DOWNLOAD
  if (mode === 'download') {
    if (!available) {
      return res.status(404).json({ error: 'Book file not available for download', available: false });
    }

    // Determine target download URL & format
    let targetUrl = '';
    let targetExt = 'pdf';
    let mimeType = 'application/pdf';

    if (requestedFormat === 'epub' && epubUrl) {
      targetUrl = epubUrl;
      targetExt = 'epub';
      mimeType = 'application/epub+zip';
    } else if (requestedFormat === 'pdf' && pdfUrl) {
      targetUrl = pdfUrl;
      targetExt = 'pdf';
      mimeType = 'application/pdf';
    } else {
      // Default: prioritize PDF first, fallback to EPUB
      if (pdfUrl) {
        targetUrl = pdfUrl;
        targetExt = 'pdf';
        mimeType = 'application/pdf';
      } else if (epubUrl) {
        targetUrl = epubUrl;
        targetExt = 'epub';
        mimeType = 'application/epub+zip';
      }
    }

    if (!targetUrl) {
      return res.status(404).json({ error: 'Requested format not available', available: false });
    }

    const cleanTitle = title.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'book';
    const filename = `${cleanTitle}.${targetExt}`;

    try {
      const fileRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Liread/1.0',
        },
        redirect: 'follow',
      });

      if (!fileRes.ok || !fileRes.body) {
        return res.redirect(302, targetUrl);
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      
      const contentLength = fileRes.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      // Stream the response to the client
      const { Readable } = await import('stream');
      if (typeof Readable.fromWeb === 'function') {
        Readable.fromWeb(fileRes.body as any).pipe(res);
      } else {
        const arrayBuffer = await fileRes.arrayBuffer();
        res.end(Buffer.from(arrayBuffer));
      }
    } catch {
      // Graceful fallback: redirect browser directly to target URL
      return res.redirect(302, targetUrl);
    }
    return;
  }

  // Unknown mode
  return res.status(400).json({ error: `Unknown mode: ${mode}` });
}
