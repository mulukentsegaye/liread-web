import React, { useState } from 'react';
import { BookOpen, Bookmark, Clock, Plus, Play } from 'lucide-react';
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
      coverBg: '#ecebe4',
    },
    {
      title: 'Before the Coffee Gets Cold',
      author: 'Toshikazu Kawaguchi',
      progress: 100,
      status: 'Finished',
      coverBg: '#e5ece9',
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      progress: 42,
      status: 'Currently Reading',
      coverBg: '#ede8e1',
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      progress: 100,
      status: 'Finished',
      coverBg: '#f0ede6',
    },
    {
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      progress: 15,
      status: 'Want to Read',
      coverBg: '#ebf1ec',
    },
    {
      title: 'Tomorrow, and Tomorrow, and Tomorrow',
      author: 'Gabrielle Zevin',
      progress: 0,
      status: 'Want to Read',
      coverBg: '#edf0f2',
    },
  ];

  const handleStartTimerForBook = (title: string, author: string) => {
    setBook(title, author);
    startTimer(title, author);
    setFullScreenOpen(true);
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            PERSONAL LIBRARY
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#192b1e]">
            {activeSubTab === 'bookshelf' ? 'My Bookshelf' : 'Saved Passages'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {activeSubTab === 'bookshelf' 
              ? `${user.bookshelfCount} books in your digital library.` 
              : `${savedPosts.length} inspiring quotes you have kept.`}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#f0f4f0] p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('bookshelf')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'bookshelf'
                ? 'bg-white text-[#253d2d] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bookshelf ({user.bookshelfCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'saved'
                ? 'bg-white text-[#253d2d] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Passages ({savedPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Content depending on subtab */}
      {activeSubTab === 'bookshelf' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sampleBooks.map((b, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-4 border border-[#e8ece8] shadow-soft flex flex-col justify-between space-y-3 hover:shadow-md transition-all group"
            >
              <div 
                className="w-full h-36 rounded-xl border border-gray-200/80 p-3 flex flex-col justify-between text-center relative overflow-hidden"
                style={{ backgroundColor: b.coverBg }}
              >
                <span className="text-[10px] font-bold tracking-widest text-[#243327] uppercase">
                  {b.title}
                </span>
                <span className="text-[9px] text-gray-500">
                  {b.author}
                </span>

                <span className={`absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                  b.status === 'Currently Reading' 
                    ? 'bg-[#35523f] text-white' 
                    : b.status === 'Finished'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {b.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-800 truncate">
                  {b.title}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {b.author}
                </p>
                
                {/* Reading Progress */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Progress</span>
                    <span>{b.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-[#35523f] h-1.5 rounded-full"
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartTimerForBook(b.title, b.author)}
                className="w-full flex items-center justify-center gap-1.5 bg-[#f0f5f1] hover:bg-[#35523f] hover:text-white text-[#2c4434] py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Read & Time</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#e8ece8] space-y-3">
              <Bookmark className="w-8 h-8 text-gray-300 mx-auto" />
              <h3 className="text-sm font-semibold text-gray-700">No saved passages yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Click the "Save" bookmark button on any post in the Discover Feed to keep your favorite quotes here.
              </p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-2xl p-5 border border-[#e8ece8] shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-800">{post.bookTitle}</span>
                  <span>{post.pageNumber ? `p. ${post.pageNumber}` : 'Passage'}</span>
                </div>
                <blockquote className="font-serif italic text-base text-[#1e2e22] leading-relaxed border-l-2 border-[#35523f] pl-4">
                  “{post.quoteText}”
                </blockquote>
                <p className="text-xs text-gray-500">
                  Saved from <strong className="text-gray-700">{post.authorName}</strong>'s post
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
