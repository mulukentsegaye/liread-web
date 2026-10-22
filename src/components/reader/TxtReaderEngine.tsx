import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useReaderStore } from '../../stores/readerStore';
import { READER_THEMES, getFontFamilyCss } from './readerThemeStyles';
import { Loader2 } from 'lucide-react';
import { TocItem } from '../../types/reader';

interface TxtReaderEngineProps {
  onTapCenter?: () => void;
  onShareSelection?: (text: string) => void;
}

export const TxtReaderEngine: React.FC<TxtReaderEngineProps> = ({ onTapCenter, onShareSelection }) => {
  const { activeBook, currentPage, updateProgress, setToc, settings } = useReaderStore();
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const activeTheme = READER_THEMES[settings.theme] || READER_THEMES.sepia;
  const fontFamilyCss = getFontFamilyCss(settings.fontFamily);

  // Load text content from fileBlob
  useEffect(() => {
    let isMounted = true;
    if (!activeBook?.fileBlob) return;

    setIsLoading(true);
    async function loadText() {
      try {
        let textContent = '';
        if (typeof activeBook!.fileBlob === 'string') {
          textContent = activeBook!.fileBlob;
        } else if (activeBook!.fileBlob instanceof Blob) {
          textContent = await activeBook!.fileBlob.text();
        } else if (activeBook!.fileBlob instanceof ArrayBuffer) {
          const decoder = new TextDecoder('utf-8');
          textContent = decoder.decode(activeBook!.fileBlob);
        }
        if (isMounted) {
          setRawText(textContent);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to read text file:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadText();
    return () => {
      isMounted = false;
    };
  }, [activeBook?.id]);

  // Paginate text into ReadEra-style book pages (~320 words per page)
  const pages = useMemo(() => {
    if (!rawText) return [''];
    const paragraphs = rawText.split(/\n\s*\n/);
    const resultPages: string[] = [];
    let currentChunk = '';
    let currentWords = 0;

    for (const p of paragraphs) {
      const words = p.trim().split(/\s+/).length;
      if (currentWords + words > 320 && currentChunk.length > 0) {
        resultPages.push(currentChunk.trim());
        currentChunk = p + '\n\n';
        currentWords = words;
      } else {
        currentChunk += p + '\n\n';
        currentWords += words;
      }
    }
    if (currentChunk.trim().length > 0) {
      resultPages.push(currentChunk.trim());
    }

    return resultPages.length > 0 ? resultPages : [rawText];
  }, [rawText]);

  // Sync total pages and extract TOC headings
  useEffect(() => {
    if (pages.length > 0 && activeBook) {
      updateProgress(currentPage || 1, pages.length);

      // Extract Chapter headings for TOC
      const detectedToc: TocItem[] = [];
      pages.forEach((pageContent, idx) => {
        const match = pageContent.match(/(?:CHAPTER|BOOK|ACT|SECTION)\s+([IVXLCDM0-9]+[^\n]*)/i);
        if (match) {
          detectedToc.push({
            id: `toc-${idx + 1}`,
            label: match[0].trim().slice(0, 40),
            href: String(idx + 1),
          });
        }
      });
      if (detectedToc.length > 0) {
        setToc(detectedToc);
      }
    }
  }, [pages.length, activeBook?.id]);

  const goToNextPage = useCallback(() => {
    if (currentPage < pages.length) {
      updateProgress(currentPage + 1, pages.length);
    }
  }, [currentPage, pages.length, updateProgress]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      updateProgress(currentPage - 1, pages.length);
    }
  }, [currentPage, pages.length, updateProgress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  // ReadEra-style 3-zone tap handling
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If user is selecting text, do not turn page
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width * 0.22) {
      goToPrevPage();
    } else if (clickX > width * 0.78) {
      goToNextPage();
    } else {
      onTapCenter?.();
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (text.length > 3 && onShareSelection) {
      onShareSelection(text);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-vibe-accent" />
        <p className="text-xs font-mono uppercase tracking-wider text-vibe-ink-muted">
          Formatting book pages...
        </p>
      </div>
    );
  }

  const currentPageText = pages[currentPage - 1] || pages[0] || '';

  return (
    <div
      onClick={handleContainerClick}
      onMouseUp={handleMouseUp}
      className="relative flex-1 w-full h-full flex flex-col items-center justify-start overflow-y-auto cursor-pointer select-text px-4 sm:px-8 py-8 sm:py-12 transition-colors duration-300"
      style={{
        backgroundColor: activeTheme.bg,
        color: activeTheme.text,
      }}
    >
      <div
        className="w-full max-w-2xl mx-auto space-y-5 leading-relaxed tracking-normal"
        style={{
          fontFamily: fontFamilyCss,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
        }}
      >
        {currentPageText.split('\n\n').map((paragraph, pIdx) => {
          const isHeading = /^(?:CHAPTER|BOOK|ACT|SECTION|[A-Z\s]{4,})/i.test(paragraph.trim()) && paragraph.length < 80;
          return isHeading ? (
            <h2
              key={pIdx}
              className="text-center font-bold uppercase tracking-wider my-6 text-[1.15em] border-b pb-2 opacity-90"
              style={{ borderColor: activeTheme.border }}
            >
              {paragraph.trim()}
            </h2>
          ) : (
            <p key={pIdx} className="indent-6 sm:indent-8 text-justify break-words">
              {paragraph.trim()}
            </p>
          );
        })}
      </div>
    </div>
  );
};
