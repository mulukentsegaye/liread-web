import React from 'react';
import { Plus, Sparkles, TrendingUp, Clock } from 'lucide-react';
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
    <div className="w-full max-w-2xl mx-auto space-y-5 sm:space-y-6">

      {/* Page header */}
      <div className="pt-1 pb-1">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-vibe-ink-muted mb-1">
          Today's Reading Feed
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-vibe-ink">
          A good day for a good book.
        </h1>
        <p className="text-sm text-vibe-ink-secondary mt-1.5">
          Discover what readers around you are exploring right now.
        </p>
      </div>

      {/* Share bar / write prompt */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl p-3 sm:p-4 shadow-soft flex items-center gap-3 hover:border-vibe-accent/30 transition-all group cursor-pointer" onClick={onOpenCreateModal}>
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-vibe-border"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-vibe-ink-muted group-hover:text-vibe-ink transition-colors">
            What are you reading, <span className="font-semibold">{user.fullName.split(' ')[0]}</span>?
          </p>
          <p className="text-xs text-vibe-ink-muted/70 mt-0.5">Share a passage, a rating, or a reflection…</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenCreateModal(); }}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span>Share</span>
        </button>
      </div>

      {/* Feed navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-vibe-card border border-vibe-border rounded-xl p-1 shadow-soft">
          <button
            onClick={() => setFeedTab('for_you')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              feedTab === 'for_you'
                ? 'bg-vibe-accent text-white shadow-sm'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            <Sparkles className="w-3 h-3" strokeWidth={2} />
            For you
          </button>
          <button
            onClick={() => setFeedTab('following')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              feedTab === 'following'
                ? 'bg-vibe-accent text-white shadow-sm'
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            Following
          </button>
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortBy(sortBy === 'latest' ? 'top' : 'latest')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle border border-vibe-border transition-all"
        >
          {sortBy === 'latest' ? (
            <><Clock className="w-3.5 h-3.5" strokeWidth={1.75} />Latest</>
          ) : (
            <><TrendingUp className="w-3.5 h-3.5" strokeWidth={1.75} />Top</>
          )}
        </button>
      </div>

      {/* Post stream */}
      <div className="space-y-4 sm:space-y-5">
        {sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onSelectBookForTimer={onSelectBookForTimer}
          />
        ))}
      </div>

      {/* End of feed */}
      <div className="py-10 text-center">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="w-8 h-px bg-vibe-border" />
          <p className="text-xs text-vibe-ink-muted font-medium">
            You're all caught up — time for another chapter.
          </p>
          <div className="w-8 h-px bg-vibe-border" />
        </div>
      </div>

    </div>
  );
};
