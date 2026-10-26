/**
 * Verified Public Domain Registry for Instant 0ms Book Downloads
 * Maps timeless classics to reliable, high-speed public domain archives (Internet Archive, Project Gutenberg, Standard Ebooks).
 */

export interface PublicDomainBookEntry {
  available: boolean;
  primaryFormat: 'PDF' | 'EPUB';
  hasPdf: boolean;
  hasEpub: boolean;
  pdfUrl?: string;
  epubUrl?: string;
  source: string;
}

interface RegistryItem {
  matches: string[];
  authorMatches?: string[];
  entry: PublicDomainBookEntry;
}

const PUBLIC_DOMAIN_REGISTRY: RegistryItem[] = [
  {
    matches: ['meditations'],
    authorMatches: ['marcus aurelius', 'aurelius'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/the-meditations-of-marcus-aurelius/The_Meditations_of_Marcus_Aurelius.pdf',
      epubUrl: 'https://archive.org/download/the-meditations-of-marcus-aurelius/The_Meditations_of_Marcus_Aurelius.epub',
      source: 'Internet Archive',
    },
  },
  {
    matches: ['the republic', 'republic'],
    authorMatches: ['plato'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/republicofplato00platiala/republicofplato00platiala.pdf',
      epubUrl: 'https://www.gutenberg.org/ebooks/1497.epub3.images',
      source: 'Project Gutenberg & IA',
    },
  },
  {
    matches: ['the prince', 'prince'],
    authorMatches: ['machiavelli', 'niccolo'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/the-prince-machiavelli/The_Prince_Machiavelli.pdf',
      epubUrl: 'https://www.gutenberg.org/ebooks/1232.epub3.images',
      source: 'Project Gutenberg',
    },
  },
  {
    matches: ['beyond good and evil'],
    authorMatches: ['nietzsche', 'friedrich'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/beyondgoodandevi00nietuoft/beyondgoodandevi00nietuoft.pdf',
      epubUrl: 'https://www.gutenberg.org/ebooks/4363.epub3.images',
      source: 'Internet Archive',
    },
  },
  {
    matches: ['letters from a stoic', 'epistulae morales'],
    authorMatches: ['seneca'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/senecas-letters-from-a-stoic/Senecas_Letters_from_a_Stoic.pdf',
      epubUrl: 'https://archive.org/download/senecas-letters-from-a-stoic/Senecas_Letters_from_a_Stoic.epub',
      source: 'Internet Archive',
    },
  },
  {
    matches: ['frankenstein'],
    authorMatches: ['mary shelley', 'shelley'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/frankensteinormo00shel/frankensteinormo00shel.pdf',
      epubUrl: 'https://www.gutenberg.org/ebooks/84.epub3.images',
      source: 'Project Gutenberg',
    },
  },
  {
    matches: ['pride and prejudice'],
    authorMatches: ['jane austen', 'austen'],
    entry: {
      available: true,
      primaryFormat: 'EPUB',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/prideandprejudic00auste/prideandprejudic00auste.pdf',
      epubUrl: 'https://www.gutenberg.org/ebooks/1342.epub3.images',
      source: 'Project Gutenberg',
    },
  },
  {
    matches: ['siddhartha'],
    authorMatches: ['hermann hesse', 'hesse'],
    entry: {
      available: true,
      primaryFormat: 'PDF',
      hasPdf: true,
      hasEpub: true,
      pdfUrl: 'https://archive.org/download/siddharthaanindi00hess/siddharthaanindi00hess.pdf',
      epubUrl: 'https://www.gutenberg.org/ebooks/2500.epub3.images',
      source: 'Project Gutenberg',
    },
  },
];

export function findPublicDomainBook(title: string, author?: string): PublicDomainBookEntry | null {
  if (!title) return null;
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalizedAuthor = (author || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const item of PUBLIC_DOMAIN_REGISTRY) {
    const titleMatches = item.matches.some(m => normalizedTitle.includes(m));
    if (!titleMatches) continue;

    if (item.authorMatches && item.authorMatches.length > 0) {
      if (normalizedAuthor && item.authorMatches.some(a => normalizedAuthor.includes(a))) {
        return item.entry;
      }
      // If author wasn't supplied or didn't match directly, still match if title is distinct
      if (!normalizedAuthor && item.matches.some(m => normalizedTitle === m || normalizedTitle.startsWith(m))) {
        return item.entry;
      }
    } else {
      return item.entry;
    }
  }

  return null;
}
