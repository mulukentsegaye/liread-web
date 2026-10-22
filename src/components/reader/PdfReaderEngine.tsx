import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import { useReaderStore } from '../../stores/readerStore';
import { READER_THEMES } from './readerThemeStyles';
import { Loader2, AlertCircle } from 'lucide-react';
import { TocItem } from '../../types/reader';

// Configure Mozilla PDF.js worker (hosted statically in public/ for zero-latency offline loading)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface PdfReaderEngineProps {
  onTapCenter?: () => void;
  onShareSelection?: (text: string) => void;
}

export const PdfReaderEngine: React.FC<PdfReaderEngineProps> = ({ onTapCenter }) => {
  const { activeBook, currentPage, updateProgress, setToc, settings } = useReaderStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scale, setScale] = useState(1.2);

  const activeTheme = READER_THEMES[settings.theme] || READER_THEMES.sepia;
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    if (!activeBook || !activeBook.fileBlob) return;

    setIsLoading(true);
    setErrorMsg(null);

    async function loadPdf() {
      try {
        let arrayBuffer: ArrayBuffer;
        if (activeBook!.fileBlob instanceof ArrayBuffer) {
          arrayBuffer = activeBook!.fileBlob;
        } else {
          arrayBuffer = await (activeBook!.fileBlob as Blob).arrayBuffer();
        }

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        updateProgress(activeBook!.currentPage || 1, doc.numPages);

        // Load Table of Contents (Outline)
        try {
          const outline = await doc.getOutline();
          if (outline && outline.length > 0) {
            const formattedToc: TocItem[] = [];
            for (const item of outline) {
              formattedToc.push({
                id: item.title,
                label: item.title,
                href: typeof item.dest === 'string' ? item.dest : String(item.dest || ''),
              });
            }
            setToc(formattedToc);
          }
        } catch {
          // Some PDFs don't have outlines
        }

        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load PDF:', err);
        setErrorMsg(err.message || 'Could not parse this PDF file.');
        setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [activeBook?.id]);

  // Render Current Page to Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

      try {
        // Cancel any pending render task to prevent canvas collision
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const unscaledViewport = page.getViewport({ scale: 1 });
        // Calculate fit-to-width or fit-to-height scale
        const widthScale = (containerWidth - 32) / unscaledViewport.width;
        const heightScale = (containerHeight - 48) / unscaledViewport.height;
        const autoFitScale = Math.min(widthScale, heightScale, 1.8);

        const currentScale = Math.max(autoFitScale, 0.8) * scale;
        const viewport = page.getViewport({ scale: currentScale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Support High DPI screens (Retina)
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.warn('PDF page render error:', err);
        }
      }
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc && currentPage) {
        renderPage(currentPage);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, currentPage, renderPage]);

  // Page turns
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      updateProgress(currentPage + 1, totalPages);
    }
  }, [currentPage, totalPages, updateProgress]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      updateProgress(currentPage - 1, totalPages);
    }
  }, [currentPage, totalPages, updateProgress]);

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

  // Click regions (ReadEra style: Left 25% = prev, Right 25% = next, Center 50% = toggle chrome)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // Color theme filter applied to PDF pages
  const getCanvasFilter = () => {
    if (settings.theme === 'sepia') {
      return 'sepia(35%) contrast(98%) brightness(96%)';
    }
    if (settings.theme === 'night') {
      return 'invert(90%) hue-rotate(180deg) contrast(90%) brightness(95%)';
    }
    if (settings.theme === 'contrast') {
      return 'invert(100%) contrast(110%)';
    }
    return 'none';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-vibe-accent" />
        <p className="text-xs font-mono uppercase tracking-wider text-vibe-ink-muted">
          Loading PDF pages...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-vibe-ink">Cannot open PDF</h3>
        <p className="text-xs text-vibe-ink-muted max-w-sm">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex-1 w-full h-full flex items-center justify-center overflow-auto select-none cursor-pointer py-4"
      style={{ backgroundColor: activeTheme.bg }}
    >
      <canvas
        ref={canvasRef}
        className="shadow-2xl rounded-sm transition-transform duration-150"
        style={{
          filter: getCanvasFilter(),
        }}
      />
    </div>
  );
};
