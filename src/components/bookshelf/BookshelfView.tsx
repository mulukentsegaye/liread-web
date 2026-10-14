import React, { useState } from 'react';
import { BookOpen, Bookmark, Play } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { useTimerStore } from '../../stores/timerStore';

interface BookshelfViewProps {
  initialTab?: 'bookshelf' | 'saved';
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({ initialTab = 'bookshelf' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookshelf' | 'saved'>(initialTab);
  const { user } = useAuthStore();
  const { posts } = useFeedStore();
  const { setBook, startTimer, setFullScreenOpen } = useTimerStore();

  const savedPosts = posts.filter((p) => p.isSaved);

  const sampleBooks = [
    {
      title: 'The Creative Act: A Way of Being',
      author: 'Rick Rubin',
      progress: 68,
      status: 'Currently Reading',
    },
    {
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      progress: 100,
      status: 'Finished',
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      progress: 42,
      status: 'Currently Reading',
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      progress: 100,
      status: 'Finished',
    },
    {
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      progress: 15,
      status: 'Want to Read',
    },
    {
      title: 'Tomorrow, and Tomorrow, and Tomorrow',
      author: 'Gabrielle Zevin',
      progress: 0,
      status: 'Want to Read',
    },
  ];

  const handleStartTimerForBook = (title: string, author: string) => {
    setBook(title, author);
    startTimer(title, author);
    setFullScreenOpen(true);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-vibe-ink-muted">
            PERSONAL LIBRARY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-vibe-ink break-words">
            {activeSubTab === 'bookshelf' ? 'My Bookshelf' : 'Saved Passages'}
          </h1>
          <p className="text-xs sm:text-sm mt-0.5 text-vibe-ink-secondary">
            {activeSubTab === 'bookshelf' 
              ? `${user.bookshelfCount} books in your digital library.` 
              : `${savedPosts.length} inspiring quotes you have kept.`}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-full w-full sm:w-auto border border-vibe-border bg-vibe-card-subtle">
          <button
            onClick={() => setActiveSubTab('bookshelf')}
            className={`min-h-[40px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              activeSubTab === 'bookshelf'
                ? 'bg-vibe-card text-vibe-accent shadow-xs border border-vibe-border'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bookshelf ({user.bookshelfCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`min-h-[40px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              activeSubTab === 'saved'
                ? 'bg-vibe-card text-vibe-accent shadow-xs border border-vibe-border'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSubTab === 'bookshelf' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {sampleBooks.map((b, idx) => (
            <div 
              key={idx} 
              className="bg-vibe-card border border-vibe-border rounded-2xl p-4 shadow-soft flex flex-col justify-between space-y-3 hover:shadow-vibe-elevated transition-all duration-500 group overflow-hidden"
            >
              <div className="w-full h-32 sm:h-36 rounded-xl border border-vibe-border bg-vibe-card-subtle p-3 flex flex-col justify-between text-center relative overflow-hidden">
                <span className="text-[10px] font-bold tracking-widest uppercase text-vibe-ink line-clamp-2">
                  {b.title}
                </span>
                <span className="text-[9px] text-vibe-ink-muted truncate">
                  {b.author}
                </span>

                <span 
                  className={`absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                    b.status === 'Currently Reading'
                      ? 'bg-vibe-accent text-white border-vibe-accent'
                      : 'bg-vibe-card text-vibe-ink-muted border-vibe-border'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-vibe-ink truncate">
                  {b.title}
                </h3>
                <p className="text-[11px] text-vibe-ink-muted truncate">
                  {b.author}
                </p>
                
                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-vibe-ink-muted">
                    <span>Progress</span>
                    <span>{b.progress}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5 bg-vibe-card-subtle">
                    <div 
                      className="h-1.5 rounded-full bg-vibe-accent"
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartTimerForBook(b.title, b.author)}
                className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold bg-vibe-card-subtle hover:bg-vibe-accent hover:text-white text-vibe-accent border border-vibe-border transition-colors active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Read & Time</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {savedPosts.length === 0 ? (
            <div className="rounded-3xl p-8 sm:p-10 text-center border border-vibe-border bg-vibe-card space-y-3">
              <Bookmark className="w-8 h-8 mx-auto text-vibe-ink-muted" />
              <h3 className="text-sm font-semibold text-vibe-ink">No saved passages yet</h3>
              <p className="text-xs max-w-sm mx-auto text-vibe-ink-muted">
                Click the "Save" bookmark button on any post in the Discover Feed to keep your favorite quotes here.
              </p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 shadow-soft space-y-2.5 overflow-hidden transition-all duration-500"
              >
                <div className="flex items-center justify-between text-xs text-vibe-ink-muted">
                  <span className="font-semibold truncate text-vibe-ink">{post.bookTitle}</span>
                  <span className="flex-shrink-0">{post.pageNumber ? `p. ${post.pageNumber}` : 'Passage'}</span>
                </div>
                <blockquote className="font-serif italic text-sm sm:text-base text-vibe-ink leading-relaxed border-l-2 border-vibe-accent pl-3.5 break-words">
                  “{post.quoteText}”
                </blockquote>
                <p className="text-xs text-vibe-ink-secondary">
                  Saved from <strong className="text-vibe-ink">{post.authorName}</strong>'s post
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
