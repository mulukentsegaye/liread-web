import React, { useState, useEffect } from 'react';
import { BookOpen, Bookmark, Play, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { useTimerStore } from '../../stores/timerStore';
import { bookshelfService, BookshelfItem } from '../../services/bookshelfService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface BookshelfViewProps {
  initialTab?: 'bookshelf' | 'saved';
  onBack?: () => void;
  onViewBookDetails?: (title: string, author: string, cover?: string) => void;
}

function bookCoverColor(title: string): string {
  const colors = ['#1a3a4a', '#2d4a3e', '#3a2d4a', '#4a2d2d', '#2d3a4a', '#3a4a2d', '#4a3a2d', '#2d2d4a', '#4a2d3a', '#3a2d3a'];
  let hash = 0; for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) % colors.length;
  return colors[Math.abs(hash)];
}
function bookCoverAccent(title: string): string {
  const accents = ['#7fb5c8', '#7dc4a0', '#a697c8', '#c87a7a', '#7a97c8', '#a0c87a', '#c8a07a', '#7a7ac8', '#c87aa0', '#a07ac8'];
  let hash = 0; for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) % accents.length;
  return accents[Math.abs(hash)];
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({ initialTab = 'bookshelf', onBack, onViewBookDetails }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookshelf' | 'saved'>(initialTab);
  const { user, isGuest } = useAuthStore();
  const { posts } = useFeedStore();
  const { setBook, startTimer, setFullScreenOpen } = useTimerStore();
  const [dbBooks, setDbBooks] = useState<BookshelfItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || isGuest || !isSupabaseConfigured()) { setDbBooks([]); return; }
    setLoading(true);
    bookshelfService.getBookshelf(user.id).then((items) => setDbBooks(items || [])).finally(() => setLoading(false));
  }, [user?.id, isGuest]);

  const savedPosts = posts.filter((p) => p.isSaved);

  const demoBooks = [
    {
      title: 'The Creative Act: A Way of Being',
      author: 'Rick Rubin',
      progress: 68,
      status: 'Currently Reading',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      progress: 100,
      status: 'Finished',
      coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      progress: 42,
      status: 'Currently Reading',
      coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const mappedBooks = dbBooks.length > 0 ? dbBooks.map((b) => ({
    title: b.title,
    author: b.author,
    progress: b.progressPercentage,
    status: b.status === 'currently_reading' ? 'Currently Reading' : b.status === 'finished' ? 'Finished' : 'Want to Read',
    coverUrl: b.coverImageUrl || '',
  })) : (isGuest ? demoBooks : []);

  const handleStartTimerForBook = (title: string, author: string, cover?: string) => {
    setBook(title, author, cover);
    startTimer(title, author);
    setFullScreenOpen(true);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in">
      <div className="space-y-4">
        {onBack && (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink transition-colors group shadow-soft" aria-label="Back to feed">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Feed</span>
          </button>
        )}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-vibe-ink-muted">Personal Library</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-vibe-ink leading-tight">{activeSubTab === 'bookshelf' ? 'My Bookshelf' : 'Saved Passages'}</h1>
            <p className="text-xs sm:text-sm mt-1 text-vibe-ink-secondary">
              {activeSubTab === 'bookshelf'
                ? (isGuest ? 'Create an account to build your bookshelf.' : `${mappedBooks.length} titles in your reading collection.`)
                : `${savedPosts.length} inspiring passages kept in your commonplace book.`}
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-full border border-vibe-border bg-vibe-card-subtle">
            <button onClick={() => setActiveSubTab('bookshelf')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${activeSubTab === 'bookshelf' ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border' : 'text-vibe-ink-muted hover:text-vibe-ink'}`}>
              <BookOpen className="w-3.5 h-3.5" /><span>Bookshelf ({mappedBooks.length})</span>
            </button>
            <button onClick={() => setActiveSubTab('saved')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-full transition-all ${activeSubTab === 'saved' ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border' : 'text-vibe-ink-muted hover:text-vibe-ink'}`}>
              <Bookmark className="w-3.5 h-3.5" /><span>Saved ({savedPosts.length})</span>
            </button>
          </div>
        </div>
      </div>

      {isGuest && activeSubTab === 'bookshelf' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 text-center">
          Guest browsing — your bookshelf will appear after you create an account.
        </div>
      )}

      {activeSubTab === 'bookshelf' ? (
        loading ? <div className="py-10 text-center text-sm text-vibe-ink-muted">Loading bookshelf…</div> :
        mappedBooks.length === 0 ? (
          <div className="rounded-3xl p-12 text-center border border-vibe-border bg-vibe-card space-y-3 shadow-soft max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center mx-auto"><BookOpen className="w-6 h-6" /></div>
            <h3 className="font-heading text-lg font-semibold text-vibe-ink">Your bookshelf is empty</h3>
            <p className="text-xs text-vibe-ink-muted leading-relaxed">Books you add will appear here. Real library, no demo titles — start by tracking a book with the Reading Timer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {mappedBooks.map((b, idx) => {
              const coverColor = bookCoverColor(b.title);
              const coverAccent = bookCoverAccent(b.title);
              const isFinished = b.status === 'Finished';
              const isReading = b.status === 'Currently Reading';
              return (
                <div key={idx} className="bg-vibe-card border border-vibe-border rounded-2xl p-4 shadow-soft flex flex-col justify-between hover:shadow-float hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden mb-3.5 border border-vibe-border/60 shadow-xs flex items-center justify-center">
                    {b.coverUrl ? (
                      <><img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" /></>
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-between relative" style={{ backgroundColor: coverColor }}>
                        <div className="w-6 h-1 rounded-full opacity-60" style={{ backgroundColor: coverAccent }} />
                        <div><span className="font-heading font-bold text-white text-sm line-clamp-2 leading-tight">{b.title}</span><span className="text-[11px] text-white/70 block mt-1">{b.author}</span></div>
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Readers Hub</div>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1 ${isReading ? 'bg-vibe-accent text-white' : isFinished ? 'bg-emerald-600/90 text-white' : 'bg-black/50 text-white/90 border border-white/20'}`}>
                        {isFinished && <Check className="w-2.5 h-2.5 stroke-[3]" />}{b.status}
                      </span>
                    </div>
                    <button onClick={() => handleStartTimerForBook(b.title, b.author, b.coverUrl)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] text-white font-medium text-xs gap-1.5" title={`Start timer for ${b.title}`}>
                      <div className="w-10 h-10 rounded-full bg-vibe-accent flex items-center justify-center text-white shadow-lg"><Play className="w-4 h-4 fill-current ml-0.5" /></div>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3
                        onClick={() => onViewBookDetails?.(b.title, b.author, b.coverUrl)}
                        className="font-heading text-base font-semibold text-vibe-ink line-clamp-1 group-hover:text-vibe-accent transition-colors cursor-pointer hover:underline"
                        title={`View book info and AI summary for "${b.title}"`}
                      >
                        {b.title}
                      </h3>
                      <p className="text-xs text-vibe-ink-muted mt-0.5">{b.author}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-vibe-ink-muted"><span className="font-medium text-vibe-ink-secondary">Progress</span><span className="font-mono font-semibold text-vibe-ink">{b.progress}%</span></div>
                      <div className="w-full rounded-full h-1.5 bg-vibe-card-subtle overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${isFinished ? 'bg-emerald-500' : 'bg-vibe-accent'}`} style={{ width: `${b.progress}%` }} /></div>
                    </div>
                    <button onClick={() => handleStartTimerForBook(b.title, b.author, b.coverUrl)} className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-vibe-card-subtle hover:bg-vibe-accent hover:text-white text-vibe-ink border border-vibe-border hover:border-vibe-accent transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-xs">
                      <Play className="w-3.5 h-3.5 fill-current" /><span>{isFinished ? 'Re-read with Timer' : 'Continue Reading'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {savedPosts.length === 0 ? (
            <div className="rounded-3xl p-12 text-center border border-vibe-border bg-vibe-card space-y-3 shadow-soft max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center mx-auto"><Bookmark className="w-6 h-6" /></div>
              <h3 className="font-heading text-lg font-semibold text-vibe-ink">No saved passages yet</h3>
              <p className="text-xs text-vibe-ink-muted leading-relaxed">Click the bookmark icon on any quote in your Discover Feed to collect your favorite literary passages here.</p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div key={post.id} className="bg-vibe-card border border-vibe-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-3 hover:border-vibe-border transition-all duration-300">
                <div className="flex items-center justify-between text-xs text-vibe-ink-muted">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" /><span className="font-semibold text-vibe-ink">{post.bookTitle}</span><span className="text-vibe-ink-muted">by {post.bookAuthor}</span></div>
                  {post.pageNumber && <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-vibe-card-subtle border border-vibe-border text-vibe-ink-muted">p. {post.pageNumber}</span>}
                </div>
                <blockquote className="font-display italic font-normal text-base sm:text-lg text-vibe-ink leading-relaxed border-l-2 border-vibe-accent pl-4 py-0.5">“{post.quoteText}”</blockquote>
                <div className="pt-2 border-t border-vibe-border-subtle flex items-center justify-between text-xs text-vibe-ink-secondary">
                  <span>Saved from <strong className="text-vibe-ink font-medium">{post.authorName}</strong></span>
                  <button onClick={() => handleStartTimerForBook(post.bookTitle, post.bookAuthor, post.coverImageUrl)} className="inline-flex items-center gap-1 font-semibold text-vibe-accent hover:text-vibe-accent-hover transition-colors"><Play className="w-3 h-3 fill-current" /><span>Time this book</span></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
