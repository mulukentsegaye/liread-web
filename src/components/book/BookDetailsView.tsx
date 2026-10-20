import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Bookmark, 
  Share2, 
  Star, 
  Check, 
  Quote, 
  CheckCircle2, 
  Loader2, 
  Library, 
  Plus, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { BookDetailsData, BookSummaryData } from '../../types';
import { aiSummaryService } from '../../services/aiSummaryService';
import { bookSearchService } from '../../services/bookSearchService';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { PostCard } from '../feed/PostCard';

interface BookDetailsViewProps {
  book: BookDetailsData;
  onBack: () => void;
  onStartTimer: (title: string, author: string, cover?: string) => void;
  onShareBook: (book: { title: string; author: string; coverImageUrl?: string }) => void;
}

export const BookDetailsView: React.FC<BookDetailsViewProps> = ({
  book,
  onBack,
  onStartTimer,
  onShareBook,
}) => {
  const { user, isGuest } = useAuthStore();
  const { posts } = useFeedStore();

  const [detailedBook, setDetailedBook] = useState<BookDetailsData>(book);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // AI Summary State
  const [summary, setSummary] = useState<BookSummaryData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'synopsis' | 'quotes'>('summary');

  // Bookshelf status state
  const [bookshelfStatus, setBookshelfStatus] = useState<'none' | 'want_to_read' | 'currently_reading' | 'finished'>('none');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const summarySectionRef = useRef<HTMLDivElement>(null);

  // Fetch deeper book details from Open Library if description is missing
  useEffect(() => {
    let isMounted = true;
    async function loadFullDetails() {
      if (!book.description) {
        setIsLoadingDetails(true);
        try {
          const fullData = await bookSearchService.getBookDetails(
            book.title,
            book.author,
            book.workKey,
            book.coverImageUrl
          );
          if (isMounted) {
            setDetailedBook((prev) => ({
              ...prev,
              description: fullData.description || prev.description,
              subjects: fullData.subjects || prev.subjects,
              firstPublishYear: fullData.firstPublishYear || prev.firstPublishYear,
              coverImageUrl: fullData.coverImageUrl || prev.coverImageUrl,
            }));
          }
        } catch (err) {
          console.warn('Failed to fetch full book details:', err);
        } finally {
          if (isMounted) setIsLoadingDetails(false);
        }
      }
    }
    loadFullDetails();
    return () => {
      isMounted = false;
    };
  }, [book]);

  // Load AI Summary on mount or when requested
  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      setIsLoadingSummary(true);
      try {
        const res = await aiSummaryService.getBookSummary(
          detailedBook.title,
          detailedBook.author,
          detailedBook.description
        );
        if (isMounted) {
          setSummary(res);
        }
      } catch (err) {
        console.warn('Failed to load AI summary:', err);
      } finally {
        if (isMounted) setIsLoadingSummary(false);
      }
    }
    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [detailedBook.title, detailedBook.author, detailedBook.description]);

  const handleScrollToSummary = () => {
    setActiveTab('summary');
    if (summarySectionRef.current) {
      summarySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookshelfToggle = (status: 'want_to_read' | 'currently_reading' | 'finished') => {
    if (isGuest) {
      alert('Sign in to track books on your personal bookshelf.');
      return;
    }
    setBookshelfStatus(status);
    setShowStatusDropdown(false);
  };

  // Filter community posts that talk about this specific book
  const bookRelatedPosts = posts.filter(
    (p) =>
      p.bookTitle.toLowerCase().includes(detailedBook.title.toLowerCase()) ||
      detailedBook.title.toLowerCase().includes(p.bookTitle.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* Top Navigation & Back Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-vibe-border bg-vibe-card text-xs font-semibold text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all active:scale-95 shadow-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onShareBook({
              title: detailedBook.title,
              author: detailedBook.author,
              coverImageUrl: detailedBook.coverImageUrl,
            })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-vibe-border bg-vibe-card text-xs font-semibold text-vibe-ink hover:bg-vibe-card-subtle transition-all active:scale-95 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-vibe-accent" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Hero: Book Presentation Header */}
      <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 md:p-10 shadow-soft transition-all space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Book Cover Showcase */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative group w-44 sm:w-52 h-64 sm:h-76 rounded-2xl overflow-hidden shadow-2xl border border-vibe-border bg-vibe-card-subtle transition-transform duration-300 group-hover:scale-[1.02]">
              {detailedBook.coverImageUrl ? (
                <img
                  src={detailedBook.coverImageUrl}
                  alt={detailedBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-vibe-card-subtle">
                  <BookOpen className="w-12 h-12 text-vibe-accent mb-2" />
                  <p className="font-serif font-bold text-sm text-vibe-ink line-clamp-2">{detailedBook.title}</p>
                  <p className="text-xs text-vibe-ink-muted mt-1">{detailedBook.author}</p>
                </div>
              )}
            </div>

            {/* Subtle Open Library Attribution */}
            <span className="text-[10px] text-vibe-ink-muted mt-3 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Verified Open Library record
            </span>
          </div>

          {/* Right: Book Metadata & Primary Action Stack */}
          <div className="md:col-span-8 space-y-5">
            <div>
              {/* Category & Year Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-vibe-accent-subtle text-vibe-accent border border-vibe-accent/20">
                  {detailedBook.subjects?.[0] || 'Literature'}
                </span>
                {detailedBook.firstPublishYear && (
                  <span className="text-xs font-mono text-vibe-ink-muted">
                    Published {detailedBook.firstPublishYear}
                  </span>
                )}
                <span className="text-vibe-border">·</span>
                <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  4.8 Community Rating
                </span>
              </div>

              {/* Title & Author */}
              <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-vibe-ink leading-tight">
                {detailedBook.title}
              </h1>
              <p className="text-base sm:text-lg text-vibe-ink-secondary mt-1 font-medium">
                by {detailedBook.author}
              </p>
            </div>

            {/* Reading Pills Row */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-vibe-border">
              <div className="text-center p-2 rounded-xl bg-vibe-card-subtle">
                <span className="block text-[10px] font-mono uppercase text-vibe-ink-muted">Est. Read</span>
                <span className="text-xs sm:text-sm font-bold text-vibe-ink">~5.5 Hours</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-vibe-card-subtle">
                <span className="block text-[10px] font-mono uppercase text-vibe-ink-muted">AI Summary</span>
                <span className="text-xs sm:text-sm font-bold text-vibe-accent">6–8 Mins</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-vibe-card-subtle">
                <span className="block text-[10px] font-mono uppercase text-vibe-ink-muted">Pacing</span>
                <span className="text-xs sm:text-sm font-bold text-vibe-ink">Mindful Flow</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              
              {/* Primary: AI Summary Button */}
              <button
                type="button"
                onClick={handleScrollToSummary}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover shadow-md transition-all active:scale-95 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Read 5–10 Min AI Summary</span>
              </button>

              {/* Start Reading Timer */}
              <button
                type="button"
                onClick={() => onStartTimer(detailedBook.title, detailedBook.author, detailedBook.coverImageUrl)}
                className="flex items-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-vibe-card-subtle border border-vibe-border text-vibe-ink hover:border-vibe-accent transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-vibe-accent" />
                <span>Start Timer</span>
              </button>

              {/* Share Book / Passage */}
              <button
                type="button"
                onClick={() => onShareBook({
                  title: detailedBook.title,
                  author: detailedBook.author,
                  coverImageUrl: detailedBook.coverImageUrl,
                })}
                className="flex items-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-vibe-card-subtle border border-vibe-border text-vibe-ink hover:border-vibe-accent transition-all active:scale-95"
                title={`Share a passage or moment from "${detailedBook.title}"`}
              >
                <Share2 className="w-4 h-4 text-vibe-accent" />
                <span>Share</span>
              </button>

              {/* Bookshelf Status Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-1.5 px-3.5 py-3 rounded-full text-xs sm:text-sm font-semibold border border-vibe-border bg-vibe-card-subtle text-vibe-ink-secondary hover:text-vibe-ink transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${bookshelfStatus !== 'none' ? 'fill-current text-vibe-accent' : ''}`} />
                  <span>
                    {bookshelfStatus === 'currently_reading' && 'Reading'}
                    {bookshelfStatus === 'want_to_read' && 'Want to Read'}
                    {bookshelfStatus === 'finished' && 'Finished'}
                    {bookshelfStatus === 'none' && 'Add to Shelf'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-vibe-card border border-vibe-border shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => handleBookshelfToggle('want_to_read')}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-vibe-card-subtle transition-colors flex items-center justify-between"
                    >
                      <span>Want to Read</span>
                      {bookshelfStatus === 'want_to_read' && <Check className="w-3.5 h-3.5 text-vibe-accent" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookshelfToggle('currently_reading')}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-vibe-card-subtle transition-colors flex items-center justify-between"
                    >
                      <span>Currently Reading</span>
                      {bookshelfStatus === 'currently_reading' && <Check className="w-3.5 h-3.5 text-vibe-accent" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookshelfToggle('finished')}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-vibe-card-subtle transition-colors flex items-center justify-between"
                    >
                      <span>Finished</span>
                      {bookshelfStatus === 'finished' && <Check className="w-3.5 h-3.5 text-vibe-accent" />}
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-vibe-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'summary'
              ? 'bg-vibe-accent text-white shadow-xs'
              : 'text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✨ 5–10 Min AI Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('synopsis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'synopsis'
              ? 'bg-vibe-accent text-white shadow-xs'
              : 'text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>About the Book</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'quotes'
              ? 'bg-vibe-accent text-white shadow-xs'
              : 'text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span>Quotes & Community ({bookRelatedPosts.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: AI SUMMARY READER (The requested feature)
          ========================================================================= */}
      {activeTab === 'summary' && (
        <div ref={summarySectionRef} className="space-y-6">
          
          {isLoadingSummary ? (
            <div className="rounded-3xl border border-vibe-border bg-vibe-card p-12 text-center space-y-4 shadow-soft">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-vibe-accent" />
              <div className="space-y-1">
                <p className="font-serif font-bold text-lg text-vibe-ink">Synthesizing 5–10 Minute Summary...</p>
                <p className="text-xs text-vibe-ink-muted max-w-sm mx-auto">
                  Distilling core mental models, executive takeaways, and notable quotes from {detailedBook.title}.
                </p>
              </div>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              
              {/* Summary Header Card */}
              <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-vibe-border">
                  <div className="flex items-center gap-2 text-xs font-semibold text-vibe-accent">
                    <Sparkles className="w-4 h-4" />
                    <span>Executive Literary Synthesis</span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-vibe-card-subtle border border-vibe-border text-vibe-ink-secondary">
                    ⏱️ {summary.readTimeMinutes} min read
                  </span>
                </div>

                {/* One-Sentence Takeaway */}
                <div className="py-2 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-vibe-ink-muted font-bold block">
                    The One-Sentence Essence
                  </span>
                  <blockquote className="font-serif italic text-base sm:text-xl text-vibe-ink leading-relaxed font-normal">
                    “{summary.oneSentenceTakeaway}”
                  </blockquote>
                </div>
              </div>

              {/* Core Ideas & Mental Models Grid */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
                  Core Ideas & Mental Models
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.keyIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-vibe-border bg-vibe-card p-5 space-y-2 shadow-xs hover:border-vibe-accent/40 transition-colors"
                    >
                      <h4 className="font-serif text-sm sm:text-base font-bold text-vibe-ink">
                        {idea.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                        {idea.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Executive Deep-Dive Text */}
              <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 md:p-10 shadow-soft space-y-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink pb-2 border-b border-vibe-border">
                  Executive Deep-Dive
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-vibe-ink leading-relaxed space-y-4">
                  {summary.fullSummaryMarkdown.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="font-serif text-base sm:text-lg font-bold text-vibe-ink pt-3">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    return (
                      <p key={idx} className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed font-sans">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Notable Quotes Card */}
              {summary.notableQuotes && summary.notableQuotes.length > 0 && (
                <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 shadow-soft space-y-4">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink flex items-center gap-2">
                    <Quote className="w-4 h-4 text-vibe-accent" />
                    <span>Memorable Passages & Quotes</span>
                  </h3>
                  <div className="space-y-3">
                    {summary.notableQuotes.map((quote, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border flex items-start justify-between gap-4 group"
                      >
                        <blockquote className="font-serif italic text-xs sm:text-sm text-vibe-ink leading-relaxed">
                          {quote}
                        </blockquote>
                        <button
                          type="button"
                          onClick={() => onShareBook({
                            title: detailedBook.title,
                            author: detailedBook.author,
                            coverImageUrl: detailedBook.coverImageUrl,
                          })}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-colors flex-shrink-0 opacity-80 group-hover:opacity-100"
                          title="Share this quote to community"
                        >
                          Share Quote
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Reading Timer Call to Action */}
              <div className="rounded-3xl border border-vibe-border bg-vibe-card-subtle p-6 sm:p-8 text-center space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-vibe-accent font-bold">
                  Take The Full Journey
                </span>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink">
                  Ready to read the complete work?
                </h4>
                <p className="text-xs sm:text-sm text-vibe-ink-secondary max-w-md mx-auto">
                  Step into distraction-free reading mode with customizable interval chimes and tranquil ambient soundscapes.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onStartTimer(detailedBook.title, detailedBook.author, detailedBook.coverImageUrl)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover shadow-md transition-all active:scale-95"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Launch Reading Timer with {detailedBook.title}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : null}

        </div>
      )}

      {/* =========================================================================
          TAB 2: ABOUT THE BOOK / SYNOPSIS
          ========================================================================= */}
      {activeTab === 'synopsis' && (
        <div className="rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-8 md:p-10 shadow-soft space-y-6">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink mb-1">
              About {detailedBook.title}
            </h3>
            <p className="text-xs text-vibe-ink-muted">Published archive description from Open Library</p>
          </div>

          {isLoadingDetails ? (
            <div className="py-12 text-center text-xs text-vibe-ink-muted flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-vibe-accent" />
              <span>Fetching archive details...</span>
            </div>
          ) : (
            <div className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed space-y-4">
              {detailedBook.description ? (
                detailedBook.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="italic text-vibe-ink-muted">
                  No editorial description is currently recorded in the Open Library archive for this specific edition.
                </p>
              )}
            </div>
          )}

          {detailedBook.subjects && detailedBook.subjects.length > 0 && (
            <div className="pt-4 border-t border-vibe-border space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-vibe-ink-muted block font-semibold">
                Indexed Subjects & Themes
              </span>
              <div className="flex flex-wrap gap-2">
                {detailedBook.subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs bg-vibe-card-subtle border border-vibe-border text-vibe-ink-secondary"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: COMMUNITY ACTIVITY & QUOTES
          ========================================================= */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink">
              Community Reflections ({bookRelatedPosts.length})
            </h3>
            <button
              type="button"
              onClick={() => onShareBook({
                title: detailedBook.title,
                author: detailedBook.author,
                coverImageUrl: detailedBook.coverImageUrl,
              })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share a Passage</span>
            </button>
          </div>

          {bookRelatedPosts.length > 0 ? (
            <div className="space-y-4">
              {bookRelatedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onSelectBookForTimer={onStartTimer}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-vibe-border bg-vibe-card p-10 text-center space-y-4 shadow-soft">
              <BookOpen className="w-10 h-10 mx-auto text-vibe-accent opacity-60" />
              <div className="space-y-1">
                <p className="font-serif font-bold text-base text-vibe-ink">No reader posts yet for this title</p>
                <p className="text-xs text-vibe-ink-muted max-w-sm mx-auto">
                  Be the first member of Readers Hub to share a favorite quotation, rating, or personal reflection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onShareBook({
                  title: detailedBook.title,
                  author: detailedBook.author,
                  coverImageUrl: detailedBook.coverImageUrl,
                })}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all active:scale-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish the First Moment</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
