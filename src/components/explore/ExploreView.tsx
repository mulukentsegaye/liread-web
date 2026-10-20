import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Star, 
  ChevronRight, 
  TrendingUp, 
  Flame, 
  Bookmark, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  CURATED_BOOKS, 
  CURATED_CATEGORIES, 
  CuratedCategory, 
  CuratedBook, 
  SPOTLIGHT_BOOK 
} from '../../data/curatedBooks';

interface ExploreViewProps {
  onViewBookDetails: (book: {
    title: string;
    author: string;
    coverImageUrl?: string;
    firstPublishYear?: number;
    workKey?: string;
    description?: string;
  }) => void;
  onStartTimer: (title: string, author: string, cover?: string) => void;
  onShareBook: (book: { title: string; author: string; coverImageUrl?: string }) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onViewBookDetails,
  onStartTimer,
  onShareBook,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CuratedCategory>('All');

  // Filter books according to selected category
  const filteredBooks = selectedCategory === 'All'
    ? CURATED_BOOKS
    : CURATED_BOOKS.filter((b) => b.category === selectedCategory);

  // Group books into curated shelves for the default "All" view
  const trendingBooks = CURATED_BOOKS.slice(0, 6);
  const habitsAndFocusBooks = CURATED_BOOKS.filter((b) => b.category === 'Habits' || b.category === 'Psychology');
  const philosophyAndMindfulnessBooks = CURATED_BOOKS.filter((b) => b.category === 'Philosophy' || b.category === 'Mindfulness');
  const fictionAndSciFiBooks = CURATED_BOOKS.filter((b) => b.category === 'Fiction' || b.category === 'Sci-Fi');

  const renderBookCard = (book: CuratedBook) => {
    return (
      <div
        key={book.id}
        onClick={() => onViewBookDetails({
          title: book.title,
          author: book.author,
          coverImageUrl: book.coverImageUrl,
          firstPublishYear: book.firstPublishYear,
          workKey: book.workKey,
          description: book.tagline,
        })}
        className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-pointer min-w-[160px] sm:min-w-[190px]"
      >
        {/* Cover Thumbnail */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3 border border-vibe-border/60 bg-vibe-card-subtle shadow-xs">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-vibe-card-subtle">
              <BookOpen className="w-6 h-6 text-vibe-accent mb-1" />
              <p className="font-serif text-xs font-bold text-vibe-ink line-clamp-2">{book.title}</p>
            </div>
          )}

          {/* AI Summary Badge */}
          {book.hasSummary && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-vibe-accent/90 text-white backdrop-blur-md shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>5-Min Read</span>
              </span>
            </div>
          )}

          {/* Hover Overlay with Quick Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewBookDetails({
                  title: book.title,
                  author: book.author,
                  coverImageUrl: book.coverImageUrl,
                  firstPublishYear: book.firstPublishYear,
                  workKey: book.workKey,
                  description: book.tagline,
                });
              }}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white text-zinc-900 hover:bg-zinc-100 transition-colors shadow-sm flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Summary</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartTimer(book.title, book.author, book.coverImageUrl);
              }}
              className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-colors shadow-sm flex items-center justify-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Timer</span>
            </button>
          </div>
        </div>

        {/* Book Info */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-vibe-ink-muted">
            <span className="truncate max-w-[100px]">{book.categoryLabel}</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold font-mono">
              <Star className="w-3 h-3 fill-current" />
              {book.ratingAverage}
            </span>
          </div>

          <h3 className="font-serif text-xs sm:text-sm font-bold text-vibe-ink line-clamp-1 group-hover:text-vibe-accent transition-colors">
            {book.title}
          </h3>

          <p className="text-[11px] text-vibe-ink-muted truncate">
            {book.author}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vibe-accent animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-vibe-ink-muted">
            Curated Library & Recommendations
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-vibe-ink">
          Explore Books & Summaries
        </h1>
        <p className="text-xs sm:text-sm text-vibe-ink-secondary max-w-xl">
          Discover timeless literature, trending community reads, and 5–10 minute executive summaries crafted for deep readers.
        </p>
      </div>

      {/* Featured Spotlight Card */}
      <div 
        onClick={() => onViewBookDetails({
          title: SPOTLIGHT_BOOK.title,
          author: SPOTLIGHT_BOOK.author,
          coverImageUrl: SPOTLIGHT_BOOK.coverImageUrl,
          firstPublishYear: SPOTLIGHT_BOOK.firstPublishYear,
          workKey: SPOTLIGHT_BOOK.workKey,
          description: SPOTLIGHT_BOOK.tagline,
        })}
        className="group relative rounded-3xl border border-vibe-border bg-gradient-to-br from-vibe-card to-vibe-card-subtle p-6 sm:p-8 shadow-soft hover:shadow-float transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Spotlight Cover */}
          <div className="md:col-span-4 flex justify-center md:justify-start">
            <div className="relative w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-vibe-border group-hover:scale-[1.02] transition-transform duration-300">
              <img
                src={SPOTLIGHT_BOOK.coverImageUrl}
                alt={SPOTLIGHT_BOOK.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Spotlight Details */}
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest font-bold bg-vibe-accent text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Curator's Spotlight
              </span>
              <span className="text-xs text-vibe-ink-muted">
                {SPOTLIGHT_BOOK.firstPublishYear} · {SPOTLIGHT_BOOK.categoryLabel}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vibe-ink tracking-tight group-hover:text-vibe-accent transition-colors">
                {SPOTLIGHT_BOOK.title}
              </h2>
              <p className="text-sm sm:text-base text-vibe-ink-secondary font-medium">
                by {SPOTLIGHT_BOOK.author}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-vibe-ink-muted leading-relaxed max-w-lg">
              {SPOTLIGHT_BOOK.tagline}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onViewBookDetails({
                  title: SPOTLIGHT_BOOK.title,
                  author: SPOTLIGHT_BOOK.author,
                  coverImageUrl: SPOTLIGHT_BOOK.coverImageUrl,
                  firstPublishYear: SPOTLIGHT_BOOK.firstPublishYear,
                  workKey: SPOTLIGHT_BOOK.workKey,
                  description: SPOTLIGHT_BOOK.tagline,
                })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Read 5–10 Min Summary</span>
              </button>

              <button
                type="button"
                onClick={() => onStartTimer(SPOTLIGHT_BOOK.title, SPOTLIGHT_BOOK.author, SPOTLIGHT_BOOK.coverImageUrl)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-vibe-card border border-vibe-border text-vibe-ink hover:border-vibe-accent transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-vibe-accent" />
                <span>Start Timer</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-vibe-ink">
            <Filter className="w-3.5 h-3.5 text-vibe-accent" />
            <span>Browse by Category</span>
          </div>
          <span className="text-[11px] text-vibe-ink-muted">
            {filteredBooks.length} titles available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CURATED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-vibe-accent text-white shadow-xs border border-vibe-accent'
                    : 'bg-vibe-card border border-vibe-border text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          VIEW A: ALL CATEGORIES (Curated Shelves)
          ========================================================================= */}
      {selectedCategory === 'All' ? (
        <div className="space-y-10">
          
          {/* Shelf 1: Trending & Most Read */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-current" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
                  Trending on Readers Hub
                </h2>
              </div>
              <span className="text-xs text-vibe-accent font-medium">Popular This Week</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {trendingBooks.map(renderBookCard)}
            </div>
          </div>

          {/* Shelf 2: Habits, Systems & Deep Focus */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
                  Habits, Craft & High Cognition
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('Habits')}
                className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {habitsAndFocusBooks.map(renderBookCard)}
            </div>
          </div>

          {/* Shelf 3: Philosophy, Solitude & Mindfulness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
                  Philosophy, Contemplation & Stoicism
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('Philosophy')}
                className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {philosophyAndMindfulnessBooks.map(renderBookCard)}
            </div>
          </div>

          {/* Shelf 4: Literary Classics & Speculative Sci-Fi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
                  Masterpiece Fiction & Sci-Fi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('Fiction')}
                className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {fictionAndSciFiBooks.map(renderBookCard)}
            </div>
          </div>

        </div>
      ) : (
        /* =========================================================================
           VIEW B: FILTERED BY SPECIFIC CATEGORY
           ========================================================================= */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredBooks.map(renderBookCard)}
          </div>
        </div>
      )}

      {/* Gentle Footer Invitation */}
      <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 text-center space-y-3 shadow-soft">
        <Sparkles className="w-6 h-6 text-vibe-accent mx-auto" />
        <h3 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
          Looking for a specific book?
        </h3>
        <p className="text-xs sm:text-sm text-vibe-ink-secondary max-w-md mx-auto">
          Use the search bar at the very top of your screen to search millions of books on Open Library with live cover previews and AI summaries.
        </p>
      </div>

    </div>
  );
};
