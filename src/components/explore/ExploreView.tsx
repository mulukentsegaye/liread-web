import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Star, 
  ChevronRight, 
  TrendingUp, 
  Flame, 
  Filter,
  Search,
  Loader2,
  X,
  WifiOff
} from 'lucide-react';
import { 
  CURATED_BOOKS, 
  CURATED_CATEGORIES, 
  CuratedCategory, 
  CuratedBook, 
  SPOTLIGHT_BOOK 
} from '../../data/curatedBooks';
import { 
  bookSearchService, 
  SuggestedBook, 
  isOfflineOrNetworkError 
} from '../../services/bookSearchService';

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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CuratedCategory>('All');

  // Open Library interactive search state for the dedicated Explore search bar
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setIsOffline(false);
      return;
    }

    setIsSearching(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check offline immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      const localMatches = bookSearchService.searchLocalCuratedBooks(query);
      setSuggestions(localMatches);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await bookSearchService.searchBooks(query, controller.signal);
        setSuggestions(results);
        setIsOffline(false);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          if (isOfflineOrNetworkError(err)) {
            setIsOffline(true);
            const localMatches = bookSearchService.searchLocalCuratedBooks(query);
            setSuggestions(localMatches);
          } else {
            console.warn('Search error in ExploreView:', err);
          }
        }
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside listener to dismiss search results dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectBook = (book: SuggestedBook) => {
    setShowResults(false);
    onViewBookDetails({
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      firstPublishYear: book.firstPublishYear,
      workKey: book.workKey,
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowResults(false);
    setIsSearching(false);
  };

  // Filter books according to selected category
  const filteredBooks = selectedCategory === 'All'
    ? CURATED_BOOKS
    : CURATED_BOOKS.filter((b) => b.category === selectedCategory);

  // Curate 4 books per shelf so each shelf breathes as a calm, spacious row
  const trendingBooks = CURATED_BOOKS.slice(0, 4);
  const habitsAndFocusBooks = CURATED_BOOKS.filter((b) => b.category === 'Habits' || b.category === 'Psychology').slice(0, 4);
  const philosophyAndMindfulnessBooks = CURATED_BOOKS.filter((b) => b.category === 'Philosophy' || b.category === 'Mindfulness').slice(0, 4);
  const fictionAndSciFiBooks = CURATED_BOOKS.filter((b) => b.category === 'Fiction' || b.category === 'Sci-Fi').slice(0, 4);

  // Render book card: calm, still, unhurried, no hover overlays or badges on cover
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
          description: book.description || book.tagline,
        })}
        className="group relative flex flex-col p-3 rounded-2xl bg-vibe-card border border-vibe-border shadow-xs hover:border-vibe-accent/40 transition-colors duration-200 cursor-pointer w-full min-w-0"
      >
        {/* Cover Thumbnail: stays still, no buttons or badges overlaid */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden mb-3 border border-vibe-border/60 bg-vibe-card-subtle shadow-xs">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-vibe-card-subtle">
              <BookOpen className="w-6 h-6 text-vibe-accent mb-1" />
              <p className="font-serif text-xs font-bold text-vibe-ink line-clamp-2">{book.title}</p>
            </div>
          )}
        </div>

        {/* Quiet, uncluttered book details */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-vibe-ink-muted">
            <span className="truncate">{book.categoryLabel}</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold font-mono flex-shrink-0">
              <Star className="w-3 h-3 fill-current" />
              {book.ratingAverage}
            </span>
          </div>

          <h3 className="font-serif text-xs sm:text-sm font-semibold text-vibe-ink line-clamp-1 group-hover:text-vibe-accent transition-colors">
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
    <div className="w-full max-w-5xl mx-auto space-y-12 sm:space-y-16 animate-in fade-in duration-300 pb-20 px-1 sm:px-2">
      
      {/* Page Header: Quiet literary intro */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vibe-accent/80" />
          <span className="font-sans text-[10.5px] font-medium tracking-wider uppercase text-vibe-ink-muted/80">
            Curated Recommendations
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-vibe-ink">
          Explore Books
        </h1>
      </div>

      {/* Featured Spotlight Card */}
      <div 
        onClick={() => onViewBookDetails({
          title: SPOTLIGHT_BOOK.title,
          author: SPOTLIGHT_BOOK.author,
          coverImageUrl: SPOTLIGHT_BOOK.coverImageUrl,
          firstPublishYear: SPOTLIGHT_BOOK.firstPublishYear,
          workKey: SPOTLIGHT_BOOK.workKey,
          description: SPOTLIGHT_BOOK.description || SPOTLIGHT_BOOK.tagline,
        })}
        className="group relative rounded-3xl border border-vibe-border bg-gradient-to-br from-vibe-card to-vibe-card-subtle p-6 sm:p-8 shadow-soft hover:border-vibe-accent/30 transition-colors duration-300 cursor-pointer overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Spotlight Cover: stays still */}
          <div className="md:col-span-4 flex justify-center md:justify-start">
            <div className="relative w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-md border border-vibe-border bg-vibe-card-subtle flex-shrink-0">
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-sans uppercase tracking-wider font-medium bg-vibe-accent text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Curator's Spotlight
              </span>
              <span className="text-xs text-vibe-ink-muted">
                {SPOTLIGHT_BOOK.firstPublishYear} · {SPOTLIGHT_BOOK.categoryLabel}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-vibe-ink tracking-tight group-hover:text-vibe-accent transition-colors">
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
                  description: SPOTLIGHT_BOOK.description || SPOTLIGHT_BOOK.tagline,
                })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Read 5–10 Min Summary</span>
              </button>

              <button
                type="button"
                onClick={() => onStartTimer(SPOTLIGHT_BOOK.title, SPOTLIGHT_BOOK.author, SPOTLIGHT_BOOK.coverImageUrl)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-vibe-card border border-vibe-border text-vibe-ink hover:border-vibe-accent transition-all active:scale-95 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-vibe-accent" />
                <span>Start Timer</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Category Filter Pills: calm and spacious */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-vibe-ink">
            <Filter className="w-3.5 h-3.5 text-vibe-accent" />
            <span>Browse by Category</span>
          </div>
          <span className="text-[11px] text-vibe-ink-muted">
            {filteredBooks.length} titles
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
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-vibe-accent text-white shadow-xs font-semibold'
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
          VIEW A: ALL CATEGORIES (Curated Shelves with Generous Clean Spacing)
          ========================================================================= */}
      {selectedCategory === 'All' ? (
        <div className="space-y-14 sm:space-y-16">
          
          {/* Shelf 1: Trending on Liread */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-current" />
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-vibe-ink">
                  Trending on Liread
                </h2>
              </div>
              <span className="text-xs text-vibe-accent font-medium">Popular This Week</span>
            </div>

            {/* Clean 4-column grid with generous gap, zero overlap */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
              {trendingBooks.map(renderBookCard)}
            </div>
          </div>

          {/* Shelf 2: Habits, Craft & High Cognition */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-vibe-ink">
                  Habits, Craft & High Cognition
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('Habits')}
                className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
              {habitsAndFocusBooks.map(renderBookCard)}
            </div>
          </div>

          {/* Shelf 3: Philosophy, Contemplation & Stoicism */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-500" />
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-vibe-ink">
                  Philosophy, Contemplation & Stoicism
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('Philosophy')}
                className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
              {philosophyAndMindfulnessBooks.map(renderBookCard)}
            </div>
          </div>

          {/* Shelf 4: Masterpiece Fiction & Sci-Fi */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-vibe-ink">
                  Masterpiece Fiction & Sci-Fi
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory('Fiction')}
                className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
              {fictionAndSciFiBooks.map(renderBookCard)}
            </div>
          </div>

        </div>
      ) : (
        /* =========================================================================
           VIEW B: FILTERED BY SPECIFIC CATEGORY
           ========================================================================= */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
            {filteredBooks.map(renderBookCard)}
          </div>
        </div>
      )}

      {/* Looking for a specific book? Card with Integrated Search Bar */}
      <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 md:p-10 text-center space-y-5 shadow-soft relative overflow-visible">
        <div className="space-y-2">
          <Sparkles className="w-6 h-6 text-vibe-accent mx-auto" />
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink tracking-tight">
            Looking for a specific book?
          </h3>
        </div>

        {/* Integrated Search Bar */}
        <div ref={searchContainerRef} className="max-w-xl mx-auto relative text-left">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-vibe-ink-muted absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowResults(true);
              }}
              placeholder="Search by title, author, or keyword (e.g. Sapiens, Virginia Woolf)..."
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-vibe-card-subtle border border-vibe-border text-xs sm:text-sm text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-none focus:border-vibe-accent focus:ring-2 focus:ring-vibe-accent/20 transition-all shadow-xs"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-vibe-accent animate-spin absolute right-4 pointer-events-none" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3.5 p-1 rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Results Dropdown */}
          {showResults && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-vibe-border bg-vibe-card shadow-2xl overflow-hidden max-h-80 overflow-y-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2.5 bg-vibe-card-subtle/90 border-b border-vibe-border flex items-center justify-between text-xs text-vibe-ink-muted font-medium">
                {isOffline ? (
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline Search
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-vibe-ink font-semibold">
                    <BookOpen className="w-4 h-4 text-vibe-accent" />
                    Search Results
                  </span>
                )}
                {suggestions.length > 0 && (
                  <span className="text-[11px] text-vibe-ink-muted">
                    {suggestions.length} {suggestions.length === 1 ? 'book' : 'books'} found
                  </span>
                )}
              </div>

              {/* Loading state: subtle, tranquil skeleton placeholders without duplicate spinners */}
              {isSearching && suggestions.length === 0 ? (
                <div className="p-2 space-y-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-2.5 flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-14 rounded-md bg-vibe-border/60 flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-3.5 bg-vibe-border/60 rounded-md w-3/5" />
                        <div className="h-2.5 bg-vibe-border/40 rounded-md w-2/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="divide-y divide-vibe-border/50">
                  {suggestions.map((book) => (
                    <div
                      key={book.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectBook(book)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectBook(book);
                        }
                      }}
                      className="p-3 hover:bg-vibe-card-subtle/80 flex items-center justify-between gap-3 transition-colors group cursor-pointer outline-none focus-visible:bg-vibe-card-subtle text-left"
                      title={`View book details for "${book.title}"`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-14 rounded-md overflow-hidden bg-vibe-border/30 flex-shrink-0 border border-vibe-border shadow-xs flex items-center justify-center">
                          {book.coverThumbnailUrl ? (
                            <img
                              src={book.coverThumbnailUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 text-vibe-ink-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-vibe-ink truncate group-hover:text-vibe-accent transition-colors">
                            {book.title}
                          </p>
                          <p className="text-[11px] text-vibe-ink-muted truncate">
                            by {book.author}
                            {book.firstPublishYear && (
                              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-vibe-card-subtle border border-vibe-border">
                                {book.firstPublishYear}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 pr-1 text-vibe-ink-muted group-hover:text-vibe-accent transition-colors">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-vibe-ink-muted space-y-1">
                  <p className="font-semibold text-vibe-ink">No books found for "{searchQuery}"</p>
                  <p className="text-[11px] text-vibe-ink-muted/80">Try checking the spelling or searching another title or author.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
