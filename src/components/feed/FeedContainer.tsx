import React from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { PostCard } from './PostCard';

interface FeedContainerProps {
  onOpenCreateModal: () => void;
  onSelectBookForTimer?: (title: string, author: string, cover?: string) => void;
}

export const FeedContainer: React.FC<FeedContainerProps> = ({ 
  onOpenCreateModal,
  onSelectBookForTimer
}) => {
  const { user } = useAuthStore();
  const { posts, feedTab, setFeedTab, sortBy, setSortBy } = useFeedStore();

  const filteredPosts = posts.filter((p) => {
    if (feedTab === 'following') {
      return p.userId === 'user-maya-patel' || p.userId === 'user-alex-morgan';
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'top') {
      return b.upvotesCount - a.upvotesCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      
      {/* 1. Feed Header & Hero Banner */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-vibe-ink-muted">
          YOUR DAILY DOSE OF DISCOVERY
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-vibe-ink break-words">
          A good day for a good book.
        </h1>
        <p className="text-xs sm:text-sm text-vibe-ink-secondary">
          Find your next read. Share what stays with you.
        </p>
      </div>

      {/* 2. "What are you reading, Alex?" Share Bar */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl p-2.5 sm:p-3.5 shadow-soft flex items-center justify-between gap-2 sm:gap-3 transition-all duration-500">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-1 ring-vibe-border flex-shrink-0"
          />
          <button
            onClick={onOpenCreateModal}
            className="text-left text-xs text-vibe-ink-muted hover:text-vibe-ink transition-colors truncate w-full py-2 min-h-[44px] flex items-center"
          >
            What are you reading, {user.fullName.split(' ')[0]}?
          </button>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex-shrink-0 min-h-[40px] flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-full bg-vibe-accent hover:bg-vibe-accent-hover text-white transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Share a moment</span>
          <span className="inline xs:hidden sm:hidden">Share</span>
        </button>
      </div>

      {/* 3. Feed Navigation Tabs & Sorting */}
      <div className="flex items-center justify-between border-b border-vibe-border pb-1">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setFeedTab('for_you')}
            className={`min-h-[44px] flex items-center text-xs font-semibold transition-colors pb-1 relative ${
              feedTab === 'for_you' ? 'text-vibe-ink font-bold' : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            For you
            {feedTab === 'for_you' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-vibe-accent" />
            )}
          </button>

          <button
            onClick={() => setFeedTab('following')}
            className={`min-h-[44px] flex items-center text-xs font-semibold transition-colors pb-1 relative ${
              feedTab === 'following' ? 'text-vibe-ink font-bold' : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            Following
            {feedTab === 'following' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-vibe-accent" />
            )}
          </button>
        </div>

        {/* Sorting Dropdown */}
        <button
          onClick={() => setSortBy(sortBy === 'latest' ? 'top' : 'latest')}
          className="min-h-[44px] flex items-center gap-1 text-[11px] font-medium text-vibe-ink-secondary hover:text-vibe-ink transition-colors px-1"
        >
          <span>{sortBy === 'latest' ? 'Latest' : 'Top upvoted'}</span>
          <ChevronDown className="w-3 h-3 text-vibe-ink-muted" />
        </button>
      </div>

      {/* 4. Feed Stream */}
      <div className="space-y-4 sm:space-y-6">
        {sortedPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onSelectBookForTimer={onSelectBookForTimer}
          />
        ))}
      </div>

      {/* 5. End of Feed Marker */}
      <div className="py-8 sm:py-10 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-medium px-4 text-vibe-ink-muted">
          <Check className="w-3.5 h-3.5 flex-shrink-0 text-vibe-accent" />
          <span>You're all caught up. Time for another chapter.</span>
        </p>
      </div>

    </div>
  );
};
