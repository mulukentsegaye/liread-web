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
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            PERSONAL LIBRARY
          </span>
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold break-words"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            {activeSubTab === 'bookshelf' ? 'My Bookshelf' : 'Saved Passages'}
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {activeSubTab === 'bookshelf' 
              ? `${user.bookshelfCount} books in your digital library.` 
              : `${savedPosts.length} inspiring quotes you have kept.`}
          </p>
        </div>

        {/* Tab switch */}
        <div 
          className="flex items-center gap-1 p-1 rounded-xl w-full sm:w-auto border"
          style={{
            backgroundColor: 'var(--bg-surface-accent)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setActiveSubTab('bookshelf')}
            className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              backgroundColor: activeSubTab === 'bookshelf' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'bookshelf' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: activeSubTab === 'bookshelf' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bookshelf ({user.bookshelfCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('saved')}
            className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
            style={{
              backgroundColor: activeSubTab === 'saved' ? 'var(--bg-surface)' : 'transparent',
              color: activeSubTab === 'saved' ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: activeSubTab === 'saved' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
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
              className="rounded-2xl p-4 border shadow-soft flex flex-col justify-between space-y-3 hover:shadow-md transition-all group overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div 
                className="w-full h-32 sm:h-36 rounded-xl border p-3 flex flex-col justify-between text-center relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface-accent)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span 
                  className="text-[10px] font-bold tracking-widest uppercase line-clamp-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {b.title}
                </span>
                <span className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {b.author}
                </span>

                <span 
                  className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: b.status === 'Currently Reading' 
                      ? 'var(--accent-primary)' 
                      : 'var(--bg-surface-active)',
                    color: b.status === 'Currently Reading' 
                      ? 'var(--accent-primary-fg)' 
                      : 'var(--text-primary)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  {b.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {b.title}
                </h3>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {b.author}
                </p>
                
                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Progress</span>
                    <span>{b.progress}%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--bg-surface-accent)' }}>
                    <div 
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${b.progress}%`,
                        backgroundColor: 'var(--accent-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartTimerForBook(b.title, b.author)}
                className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-surface-accent)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
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
            <div 
              className="rounded-3xl p-8 sm:p-10 text-center border space-y-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <Bookmark className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No saved passages yet</h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                Click the "Save" bookmark button on any post in the Discover Feed to keep your favorite quotes here.
              </p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div 
                key={post.id}
                className="rounded-2xl p-4 sm:p-5 border shadow-soft space-y-2.5 overflow-hidden transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{post.bookTitle}</span>
                  <span className="flex-shrink-0">{post.pageNumber ? `p. ${post.pageNumber}` : 'Passage'}</span>
                </div>
                <blockquote 
                  className="italic text-sm sm:text-base leading-relaxed border-l-2 pl-3.5 break-words"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--accent-primary)',
                  }}
                >
                  “{post.quoteText}”
                </blockquote>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Saved from <strong style={{ color: 'var(--text-primary)' }}>{post.authorName}</strong>'s post
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
