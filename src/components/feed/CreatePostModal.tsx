import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Star, 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  WifiOff, 
  Quote, 
  Plus, 
  Tag
} from 'lucide-react';
import { useFeedStore } from '../../stores/feedStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../stores/noticeStore';
import { PostType } from '../../types';
import { getUserAvatar } from '../../utils/avatar';
import { bookSearchService, SuggestedBook, isOfflineOrNetworkError } from '../../services/bookSearchService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBook?: {
    title: string;
    author: string;
    coverImageUrl?: string;
    quoteText?: string;
    pageNumber?: number | string;
  } | null;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, initialBook }) => {
  const { addPost } = useFeedStore();
  const { user } = useAuthStore();

  const [postType, setPostType] = useState<PostType>('passage');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);
  const [quoteText, setQuoteText] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [tag, setTag] = useState('Creativity');
  const [recommendationText, setRecommendationText] = useState('');
  const [rating, setRating] = useState(5);

  // Progressive disclosure controls for optional sections
  const [showReflection, setShowReflection] = useState(false);
  const [showManualAuthor, setShowManualAuthor] = useState(false);

  // Open Library Book Search & Auto-Suggest state
  const [suggestions, setSuggestions] = useState<SuggestedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedBook, setSelectedBook] = useState<SuggestedBook | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Pre-fill initialBook if passed (e.g. from book details, timer, or feed action)
  useEffect(() => {
    if (isOpen && initialBook) {
      setBookTitle(initialBook.title);
      setBookAuthor(initialBook.author);
      setCoverImageUrl(initialBook.coverImageUrl);
      if (initialBook.quoteText) {
        setQuoteText(initialBook.quoteText);
        setPostType('passage');
      }
      if (initialBook.pageNumber) {
        setPageNumber(String(initialBook.pageNumber));
      }
      setSelectedBook({
        id: initialBook.title,
        title: initialBook.title,
        author: initialBook.author,
        coverImageUrl: initialBook.coverImageUrl,
      });
      setShowSuggestions(false);
    }
  }, [isOpen, initialBook]);

  // Debounced search on bookTitle change (only when user actively types and hasn't picked a book yet)
  useEffect(() => {
    const query = bookTitle.trim();

    if (query.length < 2 || (selectedBook && selectedBook.title.toLowerCase() === query.toLowerCase())) {
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

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { books } = await bookSearchService.searchBooks(query, controller.signal);
        setSuggestions(books);
        setIsOffline(false);
        setShowSuggestions(true);
      } catch (err: any) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          if (isOfflineOrNetworkError(err)) {
            setIsOffline(true);
            setSuggestions([]);
            setShowSuggestions(false);
          } else {
            console.warn('Search error in CreatePostModal:', err);
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
  }, [bookTitle, selectedBook]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const handleSelectBook = (book: SuggestedBook) => {
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setCoverImageUrl(book.coverImageUrl);
    setSelectedBook(book);
    setShowSuggestions(false);
    setShowManualAuthor(false);
  };

  const handleClearSelectedBook = () => {
    setSelectedBook(null);
    setBookTitle('');
    setBookAuthor('');
    setCoverImageUrl(undefined);
    setShowManualAuthor(false);
  };

  const handleClose = () => {
    setShowSuggestions(false);
    onClose();
  };

  // Check if form is ready to publish
  const cleanTitle = bookTitle.trim();
  const cleanQuote = quoteText.trim();
  const cleanRecommendation = recommendationText.trim();

  const isPublishable = 
    Boolean(cleanTitle) && (
      (postType === 'passage' && Boolean(cleanQuote)) ||
      (postType === 'finished_book' && (Boolean(rating) || Boolean(cleanRecommendation) || Boolean(cleanQuote))) ||
      (postType === 'recommendation' && (Boolean(cleanRecommendation) || Boolean(cleanQuote)))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cleanTitle) {
      toast.warning('Please tag a book title for your reading moment.', 'Book Title');
      return;
    }

    if (postType === 'passage' && !cleanQuote) {
      toast.warning('Please enter a quote or passage to share.', 'Passage Empty');
      return;
    }

    if (postType === 'recommendation' && !cleanRecommendation && !cleanQuote) {
      toast.warning('Please share why you recommend this book.', 'Recommendation Empty');
      return;
    }

    addPost(
      {
        postType,
        bookTitle: cleanTitle,
        bookAuthor: bookAuthor.trim() || 'Unknown Author',
        coverImageUrl: coverImageUrl || undefined,
        quoteText: cleanQuote || undefined,
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
        tag: tag || 'General',
        recommendationText: cleanRecommendation || undefined,
        rating: postType === 'finished_book' ? rating : undefined,
        authorName: user?.fullName,
        authorAvatar: getUserAvatar(user),
      },
      user?.id
    );

    // Reset modal state
    setBookTitle('');
    setBookAuthor('');
    setCoverImageUrl(undefined);
    setSelectedBook(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setQuoteText('');
    setPageNumber('');
    setRecommendationText('');
    setShowReflection(false);
    setShowManualAuthor(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-vibe-card border border-vibe-border text-vibe-ink shadow-vibe-elevated flex flex-col justify-between overflow-y-auto max-h-[92vh] transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-vibe-border/70">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Back"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-vibe-border bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all active:scale-95 shadow-xs"
                title="Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 text-vibe-accent">
                <Quote className="w-4 h-4 flex-shrink-0" />
                <h2 className="font-heading text-base sm:text-lg font-semibold text-vibe-ink">
                  Share a Reading Moment
                </h2>
              </div>
            </div>

            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="w-8 h-8 flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Post Type Selector (Clean Pill Segmented Bar) */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-vibe-card-subtle border border-vibe-border/70 text-xs font-medium">
            <button
              type="button"
              onClick={() => setPostType('passage')}
              className={`py-1.5 px-2 text-center rounded-lg transition-all ${
                postType === 'passage'
                  ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border/50'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Passage Quote
            </button>
            <button
              type="button"
              onClick={() => setPostType('finished_book')}
              className={`py-1.5 px-2 text-center rounded-lg transition-all ${
                postType === 'finished_book'
                  ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border/50'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Finished Book
            </button>
            <button
              type="button"
              onClick={() => setPostType('recommendation')}
              className={`py-1.5 px-2 text-center rounded-lg transition-all ${
                postType === 'recommendation'
                  ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border/50'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Recommend
            </button>
          </div>

          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4 pt-1">

            {/* 1. PRIMARY CONTENT CANVAS (CONTENT FIRST) */}
            {postType === 'passage' && (
              <div className="space-y-1.5">
                <div className="relative">
                  <Quote className="absolute left-3.5 top-3.5 w-4 h-4 text-vibe-accent/40 pointer-events-none" />
                  <textarea
                    rows={3}
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    placeholder="“What words stayed with you today? Type or paste a passage...”"
                    className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-3 rounded-2xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted/60 focus:border-vibe-accent focus:bg-vibe-card focus:outline-none font-display italic font-normal leading-relaxed resize-none transition-all shadow-inner/5"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Finished Book Star Rating */}
            {postType === 'finished_book' && (
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-vibe-card-subtle border border-vibe-border/70 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-vibe-ink-muted font-medium">
                  Your Rating
                </span>
                <div className="flex items-center gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current text-amber-500' : 'text-vibe-border stroke-[1.5]'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Review / Reflection Canvas for Finished & Recommend Modes */}
            {(postType === 'finished_book' || postType === 'recommendation') && (
              <div className="space-y-1.5">
                <textarea
                  rows={3}
                  value={recommendationText}
                  onChange={(e) => setRecommendationText(e.target.value)}
                  placeholder={
                    postType === 'finished_book'
                      ? 'What were your biggest takeaways or impressions?'
                      : 'Why do you recommend this book to fellow readers?'
                  }
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted/60 focus:border-vibe-accent focus:bg-vibe-card focus:outline-none leading-relaxed resize-none transition-all"
                  autoFocus
                />
              </div>
            )}

            {/* 2. STREAMLINED BOOK TAGGING (COMPACT, SMART, UNIFIED) */}
            <div className="space-y-1.5">
              {selectedBook || (bookTitle && !showSuggestions) ? (
                /* Selected Book Badge Pill */
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-9 rounded bg-vibe-border/40 overflow-hidden flex-shrink-0 flex items-center justify-center border border-vibe-border/50">
                      {coverImageUrl ? (
                        <img src={coverImageUrl} alt={bookTitle} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-vibe-ink-muted" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-vibe-ink truncate">{bookTitle}</p>
                      <p className="text-[10px] text-vibe-ink-muted truncate">by {bookAuthor || 'Unknown Author'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelectedBook}
                    className="text-[11px] font-medium text-vibe-ink-muted hover:text-rose-500 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Single unified auto-suggest book input */
                <div className="relative" ref={searchContainerRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => {
                        setBookTitle(e.target.value);
                        setSelectedBook(null);
                      }}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      placeholder="📖 Tag book (e.g. Meditations, Rick Rubin...)"
                      className="w-full text-xs sm:text-sm pl-3.5 pr-8 py-2.5 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted/65 focus:border-vibe-accent focus:bg-vibe-card focus:outline-none transition-all"
                      autoComplete="off"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-vibe-ink-muted pointer-events-none">
                      {isSearching ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-vibe-accent" />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-vibe-ink-muted/70" />
                      )}
                    </div>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && bookTitle.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-vibe-border bg-vibe-card shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 bg-vibe-card-subtle border-b border-vibe-border flex items-center justify-between text-[10px] text-vibe-ink-muted font-medium">
                        <span className="flex items-center gap-1.5 text-vibe-ink">
                          <BookOpen className="w-3 h-3 text-vibe-accent" />
                          Suggested Editions
                        </span>
                        <span>{suggestions.length} found</span>
                      </div>

                      <div className="divide-y divide-vibe-border/40">
                        {suggestions.map((book) => (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => handleSelectBook(book)}
                            className="w-full p-2 text-left hover:bg-vibe-card-subtle flex items-center gap-2.5 transition-colors cursor-pointer group"
                          >
                            <div className="w-6 h-8 rounded overflow-hidden bg-vibe-border/30 flex-shrink-0 border border-vibe-border flex items-center justify-center">
                              {book.coverThumbnailUrl ? (
                                <img src={book.coverThumbnailUrl} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-3 h-3 text-vibe-ink-muted" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-vibe-ink truncate group-hover:text-vibe-accent transition-colors">
                                {book.title}
                              </p>
                              <p className="text-[10px] text-vibe-ink-muted truncate">by {book.author}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtle link to specify author manually if not picking an auto-suggest */}
                  {bookTitle.trim().length > 0 && !selectedBook && !showManualAuthor && (
                    <button
                      type="button"
                      onClick={() => setShowManualAuthor(true)}
                      className="text-[10px] text-vibe-ink-muted hover:text-vibe-accent mt-1 inline-block transition-colors"
                    >
                      + Add author name manually
                    </button>
                  )}

                  {showManualAuthor && (
                    <input
                      type="text"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder="Author name (e.g. Rick Rubin)"
                      className="w-full text-xs p-2 mt-1.5 rounded-lg border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none"
                    />
                  )}
                </div>
              )}
            </div>

            {/* 3. OPTIONAL PROGRESSIVE DISCLOSURE: REFLECTION IN PASSAGE MODE */}
            {postType === 'passage' && (
              <div>
                {!showReflection ? (
                  <button
                    type="button"
                    onClick={() => setShowReflection(true)}
                    className="text-xs text-vibe-ink-muted hover:text-vibe-accent flex items-center gap-1.5 py-1 transition-colors group cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-vibe-accent/70 group-hover:scale-110 transition-transform" />
                    <span>Add your reflection or takeaway <span className="text-[10.5px] opacity-70">(optional)</span></span>
                  </button>
                ) : (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-medium uppercase tracking-wider text-vibe-ink-muted">
                        Your Thoughts <span className="text-[10px] text-vibe-ink-muted/70 font-normal lowercase">(optional)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReflection(false);
                          setRecommendationText('');
                        }}
                        className="text-[10.5px] text-vibe-ink-muted hover:text-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={recommendationText}
                      onChange={(e) => setRecommendationText(e.target.value)}
                      placeholder="What made this passage stay with you?"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none resize-none"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. COMPACT METADATA STRIP: PAGE # & TAG (MINIMALIST, HORIZONTAL) */}
            <div className="flex items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-vibe-ink-muted">Page:</span>
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  placeholder="opt."
                  className="w-16 px-2 py-1 text-xs font-mono rounded-lg border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted/50 focus:border-vibe-accent focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-vibe-ink-muted" />
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-vibe-border bg-vibe-card-subtle text-vibe-ink focus:border-vibe-accent focus:outline-none cursor-pointer"
                >
                  <option value="Creativity">Creativity</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Memoir">Memoir</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Poetry">Poetry</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-vibe-border/70 mt-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-vibe-ink-muted hover:text-vibe-ink transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            form="create-post-form"
            type="submit"
            disabled={!isPublishable}
            className={`px-5 py-2 text-xs sm:text-sm font-medium rounded-full shadow-xs transition-all active:scale-95 cursor-pointer ${
              isPublishable
                ? 'bg-vibe-accent hover:bg-vibe-accent-hover text-white shadow-sm'
                : 'bg-vibe-card-subtle text-vibe-ink-muted border border-vibe-border/60 opacity-60 cursor-not-allowed'
            }`}
          >
            Publish Moment
          </button>
        </div>

      </div>
    </div>
  );
};
