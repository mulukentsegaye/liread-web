import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Share2,
  Clock,
  Sparkles,
  X,
  Plus,
  Trash2,
  Check,
  Type
} from 'lucide-react';
import { useReaderStore } from '../../stores/readerStore';
import { useTimerStore } from '../../stores/timerStore';
import { useFeedStore } from '../../stores/feedStore';
import { toast } from '../../stores/noticeStore';
import { PdfReaderEngine } from './PdfReaderEngine';
import { EpubReaderEngine } from './EpubReaderEngine';
import { TxtReaderEngine } from './TxtReaderEngine';
import { READER_THEMES } from './readerThemeStyles';
import { ReaderTheme, ReaderFontFamily, ReadingMode } from '../../types/reader';

interface ReadEraViewerProps {
  onOpenShareModal?: (initialQuote: {
    quoteText: string;
    bookTitle: string;
    bookAuthor: string;
    pageNumber?: number | string;
  }) => void;
}

export const ReadEraViewer: React.FC<ReadEraViewerProps> = ({ onOpenShareModal }) => {
  const {
    activeBook,
    closeBook,
    currentPage,
    totalPages,
    progressPercent,
    settings,
    isControlsVisible,
    toggleControls,
    isTocOpen,
    setIsTocOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isBookmarksOpen,
    setIsBookmarksOpen,
    setTheme,
    setFontFamily,
    setFontSize,
    setReadingMode,
    updateProgress,
    toc,
    addBookmark,
    removeBookmark,
  } = useReaderStore();

  const { isRunning, startTimer, pauseTimer, getElapsedSeconds } = useTimerStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState<number>(currentPage);

  const activeTheme = READER_THEMES[settings.theme] || READER_THEMES.sepia;

  if (!activeBook) return null;

  // Toggle true browser full-screen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Quick text selection handler
  const handleShareSelection = (text: string) => {
    setSelectedText(text);
  };

  const handlePublishSelectedText = () => {
    if (!selectedText) return;
    if (onOpenShareModal) {
      onOpenShareModal({
        quoteText: selectedText,
        bookTitle: activeBook.title,
        bookAuthor: activeBook.author,
        pageNumber: currentPage,
      });
    } else {
      navigator.clipboard?.writeText(`"${selectedText}" — ${activeBook.title}`);
      toast.success('Passage copied to clipboard', 'Copied');
    }
    setSelectedText(null);
  };

  const handleCopySelectedText = () => {
    if (!selectedText) return;
    navigator.clipboard?.writeText(`"${selectedText}" — ${activeBook.title} (${activeBook.author})`);
    toast.success('Passage copied to clipboard', 'Copied');
    setSelectedText(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200"
      style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
    >
      {/* 1. TOP TOOLBAR (ReadEra Style Auto-Hiding Header) */}
      <div
        className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-6 h-14 border-b transition-all duration-300 backdrop-blur-md shadow-xs ${
          isControlsVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: `${activeTheme.cardBg}fa`,
          borderColor: activeTheme.border,
          color: activeTheme.text,
        }}
      >
        {/* Left: Back & Book Format Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={closeBook}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-75 transition-opacity"
            title="Back to library"
            aria-label="Back to library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span
            className="hidden xs:inline-flex text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
            style={{
              backgroundColor: `${activeTheme.accent}15`,
              borderColor: `${activeTheme.accent}30`,
              color: activeTheme.accent,
            }}
          >
            {activeBook.format}
          </span>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {activeBook.title}
            </h1>
            <p className="text-[10px] sm:text-[11px] truncate opacity-70">
              {activeBook.author}
            </p>
          </div>
        </div>

        {/* Right: ReadEra Menu Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Table of Contents */}
          <button
            type="button"
            onClick={() => {
              setIsTocOpen(!isTocOpen);
              setIsSettingsOpen(false);
              setIsBookmarksOpen(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isTocOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:opacity-75'
            }`}
            title="Table of Contents / Chapters"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Bookmarks */}
          <button
            type="button"
            onClick={() => {
              setIsBookmarksOpen(!isBookmarksOpen);
              setIsTocOpen(false);
              setIsSettingsOpen(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isBookmarksOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:opacity-75'
            }`}
            title="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Display & Typography Settings */}
          <button
            type="button"
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsTocOpen(false);
              setIsBookmarksOpen(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isSettingsOpen ? 'bg-black/10 dark:bg-white/10' : 'hover:opacity-75'
            }`}
            title="Reading Settings & Themes"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center hover:opacity-75 transition-opacity"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. CENTRAL READER ENGINE (PDF, EPUB, or TXT) */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        {activeBook.format === 'pdf' ? (
          <PdfReaderEngine onTapCenter={toggleControls} onShareSelection={handleShareSelection} />
        ) : activeBook.format === 'epub' ? (
          <EpubReaderEngine onTapCenter={toggleControls} onShareSelection={handleShareSelection} />
        ) : (
          <TxtReaderEngine onTapCenter={toggleControls} onShareSelection={handleShareSelection} />
        )}
      </div>

      {/* 3. FLOATING PASSAGE SELECTION TOOLBAR (Quote Sharing) */}
      {selectedText && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-vibe-card border border-vibe-border shadow-float rounded-2xl p-2 px-3 flex items-center gap-2 animate-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={handleCopySelectedText}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-vibe-card-subtle hover:bg-vibe-border text-vibe-ink font-medium transition-colors"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={handlePublishSelectedText}
            className="text-xs px-3 py-1.5 rounded-lg bg-vibe-accent hover:bg-vibe-accent-hover text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Quote to Feed</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedText(null)}
            className="p-1 text-vibe-ink-muted hover:text-vibe-ink rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. BOTTOM TOOLBAR (ReadEra Scrubber, Page Navigation & Timer) */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 px-4 sm:px-8 py-3 border-t transition-all duration-300 backdrop-blur-md shadow-float flex flex-col gap-2 ${
          isControlsVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: `${activeTheme.cardBg}fa`,
          borderColor: activeTheme.border,
          color: activeTheme.text,
        }}
      >
        {/* Fast Seek Scrubber Slider */}
        <div className="flex items-center gap-3 w-full max-w-2xl mx-auto">
          <input
            type="range"
            min={1}
            max={totalPages || 1}
            value={currentPage}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSliderVal(val);
              updateProgress(val, totalPages);
            }}
            className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Page status row */}
        <div className="flex items-center justify-between text-xs max-w-2xl mx-auto w-full">
          <button
            type="button"
            onClick={() => updateProgress(Math.max(1, currentPage - 1), totalPages)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:opacity-75 disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Central page counter and progress % */}
          <div className="text-center font-mono text-[11px] opacity-80 flex items-center gap-2">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <span>·</span>
            <span>{Math.round(progressPercent)}%</span>

            {/* Reading Timer indicator */}
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-[10px] px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>{formatTimer(getElapsedSeconds())}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => updateProgress(Math.min(totalPages, currentPage + 1), totalPages)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:opacity-75 disabled:opacity-30 transition-opacity"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. READERA DISPLAY & THEME SETTINGS FLYOUT */}
      {isSettingsOpen && (
        <div
          className="absolute right-3 sm:right-6 top-16 z-40 w-72 sm:w-80 rounded-3xl border shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: activeTheme.cardBg,
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: activeTheme.border }}>
            <span className="text-xs font-semibold uppercase tracking-wider">Reading Settings</span>
            <button type="button" onClick={() => setIsSettingsOpen(false)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 ReadEra Color Schemes */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider block mb-2 opacity-70">
              Color Scheme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(READER_THEMES) as ReaderTheme[]).map((themeKey) => {
                const item = READER_THEMES[themeKey];
                const isSelected = settings.theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setTheme(themeKey)}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                      isSelected ? 'ring-2 ring-emerald-500 shadow-xs' : 'opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: item.bg, borderColor: item.border, color: item.text }}
                  >
                    <span className="text-[10px] font-medium leading-none">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography Choice */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider block mb-2 opacity-70">
              Typography
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['serif', 'sans', 'mono'] as ReaderFontFamily[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFontFamily(f)}
                  className={`py-1.5 px-2 rounded-xl text-xs border capitalize transition-all ${
                    settings.fontFamily === f ? 'bg-black/10 dark:bg-white/15 font-semibold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ borderColor: activeTheme.border }}
                >
                  Aa {f}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Adjuster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-70">Font Size</label>
              <span className="font-mono text-xs">{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFontSize(Math.max(14, settings.fontSize - 1))}
                className="w-10 h-9 rounded-xl border flex items-center justify-center font-bold text-xs"
                style={{ borderColor: activeTheme.border }}
              >
                A-
              </button>
              <input
                type="range"
                min={14}
                max={30}
                value={settings.fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <button
                type="button"
                onClick={() => setFontSize(Math.min(30, settings.fontSize + 1))}
                className="w-10 h-9 rounded-xl border flex items-center justify-center font-bold text-sm"
                style={{ borderColor: activeTheme.border }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TABLE OF CONTENTS DRAWER */}
      {isTocOpen && (
        <div
          className="absolute left-3 sm:left-6 top-16 bottom-16 z-40 w-72 sm:w-88 rounded-3xl border shadow-2xl p-5 flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: activeTheme.cardBg,
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: activeTheme.border }}>
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Chapters ({toc.length})
            </span>
            <button type="button" onClick={() => setIsTocOpen(false)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {toc.length === 0 ? (
              <p className="text-xs text-center opacity-60 py-10">No chapters detected in this document.</p>
            ) : (
              toc.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const pageNum = parseInt(item.href, 10);
                    if (!isNaN(pageNum)) {
                      updateProgress(pageNum, totalPages);
                    }
                    setIsTocOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs truncate transition-colors flex items-center justify-between group"
                >
                  <span className="truncate group-hover:text-emerald-500 transition-colors">{item.label}</span>
                  <span className="text-[10px] font-mono opacity-50 ml-2">{idx + 1}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. BOOKMARKS DRAWER */}
      {isBookmarksOpen && (
        <div
          className="absolute left-3 sm:left-6 top-16 bottom-16 z-40 w-72 sm:w-88 rounded-3xl border shadow-2xl p-5 flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: activeTheme.cardBg,
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          <div className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: activeTheme.border }}>
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-500" />
              Bookmarks ({activeBook.bookmarks?.length || 0})
            </span>
            <button type="button" onClick={() => setIsBookmarksOpen(false)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => addBookmark(`Bookmark at page ${currentPage}`)}
            className="w-full py-2.5 px-3 rounded-xl mb-3 text-xs font-medium flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Bookmark Page {currentPage}</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {!activeBook.bookmarks || activeBook.bookmarks.length === 0 ? (
              <p className="text-xs text-center opacity-60 py-8">No bookmarks yet. Click above to bookmark this page.</p>
            ) : (
              activeBook.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-2.5 rounded-xl border flex items-center justify-between text-xs gap-2 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ borderColor: activeTheme.border }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const page = typeof bm.location === 'number' ? bm.location : parseInt(String(bm.location), 10) || 1;
                      updateProgress(page, totalPages);
                      setIsBookmarksOpen(false);
                    }}
                    className="flex-1 text-left truncate font-medium hover:text-emerald-500"
                  >
                    {bm.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBookmark(bm.id)}
                    className="p-1 opacity-40 hover:opacity-100 hover:text-rose-500 transition-opacity"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
