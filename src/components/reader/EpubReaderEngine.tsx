import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import { useReaderStore } from '../../stores/readerStore';
import { READER_THEMES, getFontFamilyCss } from './readerThemeStyles';
import { Loader2, AlertCircle } from 'lucide-react';
import { TocItem } from '../../types/reader';

interface EpubReaderEngineProps {
  onTapCenter?: () => void;
  onShareSelection?: (text: string) => void;
}

export const EpubReaderEngine: React.FC<EpubReaderEngineProps> = ({ onTapCenter, onShareSelection }) => {
  const { activeBook, currentLocation, updateProgress, setToc, settings } = useReaderStore();
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<any | null>(null);
  const renditionRef = useRef<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeTheme = READER_THEMES[settings.theme] || READER_THEMES.sepia;
  const fontFamilyCss = getFontFamilyCss(settings.fontFamily);

  // Initialize EPUB Book & Rendition
  useEffect(() => {
    let isMounted = true;
    if (!activeBook?.fileBlob || !viewerRef.current) return;

    setIsLoading(true);
    setErrorMsg(null);

    async function loadEpub() {
      try {
        let arrayBuffer: ArrayBuffer;
        if (activeBook!.fileBlob instanceof ArrayBuffer) {
          arrayBuffer = activeBook!.fileBlob;
        } else {
          arrayBuffer = await (activeBook!.fileBlob as Blob).arrayBuffer();
        }

        const book = ePub(arrayBuffer);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          flow: settings.readingMode === 'continuous' ? 'scrolled-doc' : 'paginated',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Apply theme & font overrides inside the EPUB iframe
        rendition.themes.register('activeTheme', {
          body: {
            background: `${activeTheme.bg} !important`,
            color: `${activeTheme.text} !important`,
            'font-family': `${fontFamilyCss} !important`,
            'font-size': `${settings.fontSize}px !important`,
            'line-height': `${settings.lineHeight} !important`,
            padding: '16px 24px !important',
          },
          'p, span, div, li': {
            color: `${activeTheme.text} !important`,
          },
          'a': {
            color: `${activeTheme.accent} !important`,
          },
          'h1, h2, h3, h4, h5': {
            color: `${activeTheme.text} !important`,
            'font-family': `${fontFamilyCss} !important`,
          },
        });
        rendition.themes.select('activeTheme');

        // Display saved location or beginning
        const startLocation = currentLocation || activeBook?.currentLocation || undefined;
        await rendition.display(startLocation);

        if (!isMounted) return;

        // Listen for location changes
        rendition.on('relocated', (location: any) => {
          if (!isMounted) return;
          const cfi = location.start.cfi;
          const page = location.start.displayed?.page || 1;
          const total = location.start.displayed?.total || 100;
          updateProgress(page, total, cfi);
        });

        // Listen for text selection to allow Feed Quote Sharing
        rendition.on('selected', (_cfiRange: string, contents: any) => {
          const selection = contents.window.getSelection();
          if (selection && selection.toString().trim().length > 3 && onShareSelection) {
            onShareSelection(selection.toString().trim());
          }
        });

        // Handle Tap Navigation inside iframe
        rendition.on('click', (e: MouseEvent) => {
          const width = window.innerWidth;
          const clickX = e.clientX;
          if (clickX < width * 0.22) {
            rendition.prev();
          } else if (clickX > width * 0.78) {
            rendition.next();
          } else {
            onTapCenter?.();
          }
        });

        // Load TOC / Navigation
        book.loaded.navigation.then((nav: any) => {
          if (!isMounted) return;
          if (nav && nav.toc) {
            const formatted: TocItem[] = nav.toc.map((item: any) => ({
              id: item.id || item.href,
              label: item.label.trim(),
              href: item.href,
              subitems: item.subitems?.map((sub: any) => ({
                id: sub.id || sub.href,
                label: sub.label.trim(),
                href: sub.href,
              })),
            }));
            setToc(formatted);
          }
        });

        // Generate location index for accurate percentage calculation
        book.ready.then(() => {
          return book.locations.generate(1000);
        }).then(() => {
          if (!isMounted) return;
          setIsLoading(false);
        }).catch(() => {
          if (isMounted) setIsLoading(false);
        });

      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to open EPUB:', err);
        setErrorMsg(err.message || 'Could not parse this EPUB file.');
        setIsLoading(false);
      }
    }

    loadEpub();

    return () => {
      isMounted = false;
      if (renditionRef.current) {
        renditionRef.current.destroy();
        renditionRef.current = null;
      }
      if (bookRef.current) {
        bookRef.current.destroy();
        bookRef.current = null;
      }
    };
  }, [activeBook?.id]);

  // Update styles when user changes font, size, or theme
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.override('color', activeTheme.text);
      renditionRef.current.themes.override('background', activeTheme.bg);
      renditionRef.current.themes.override('font-family', fontFamilyCss);
      renditionRef.current.themes.override('font-size', `${settings.fontSize}px`);
      renditionRef.current.themes.override('line-height', String(settings.lineHeight));
    }
  }, [settings.theme, settings.fontFamily, settings.fontSize, settings.lineHeight]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!renditionRef.current) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        renditionRef.current.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        renditionRef.current.prev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (errorMsg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-vibe-ink">Cannot open EPUB</h3>
        <p className="text-xs text-vibe-ink-muted max-w-sm">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div
      className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: activeTheme.bg }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-3 bg-black/5 backdrop-blur-xs">
          <Loader2 className="w-8 h-8 animate-spin text-vibe-accent" />
          <p className="text-xs font-mono uppercase tracking-wider text-vibe-ink-muted">
            Opening EPUB book...
          </p>
        </div>
      )}

      {/* EPUB iframe rendition container */}
      <div ref={viewerRef} className="w-full h-full max-w-4xl mx-auto" />
    </div>
  );
};
