import React from 'react';
import { Plus, Sparkles, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useFeedStore } from '../../stores/feedStore';
import { DEFAULT_USER_AVATAR } from '../../data/defaults';
import { PostCard } from './PostCard';

interface FeedContainerProps {
  onOpenCreateModal: () => void;
  onSelectBookForTimer?: (title: string, author: string, cover?: string) => void;
}

export const FeedContainer: React.FC<FeedContainerProps> = ({
  onOpenCreateModal,
  onSelectBookForTimer
}) => {
  const { user, isGuest, isAuthenticated } = useAuthStore();
  const { posts, feedTab, setFeedTab, sortBy, setSortBy, isLoading } = useFeedStore();

  const filteredPosts = posts.filter((p) => {
    if (feedTab === 'following') {
      // "Following" = your own posts plus posts from authors you interact with.
      // With no real follow graph yet, this resolves to your own activity.
      return user ? p.userId === user.id : false;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'top') {
      return b.upvotesCount - a.upvotesCount;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const firstName = user?.fullName?.split(' ')[0] ?? 'Reader';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 sm:space-y-6">

      {/* Page header */}
      <div className="pt-1 pb-1">
        <p className="font-mono text-[11px] font-bold tracking-widest uppercase text-vibe-ink-muted mb-1">
          Today's Reading Feed
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-normal text-vibe-ink leading-tight">
          A good day for a good book.
        </h1>
        <p className="text-sm text-vibe-ink-secondary mt-1.5">
          {posts.length === 0
            ? 'Real reading moments from real readers will appear here.'
            : 'Discover what readers around you are exploring right now.'}
        </p>
      </div>

      {/* Share bar / write prompt */}
      <div
        className="bg-vibe-card border border-vibe-border rounded-2xl p-3 sm:p-4 shadow-soft flex items-center gap-3 hover:border-vibe-accent/30 transition-all group cursor-pointer"
        onClick={onOpenCreateModal}
      >
        <img
          src={user?.avatarUrl ?? DEFAULT_USER_AVATAR}
          alt={user?.fullName ?? 'Guest'}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-vibe-border"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-vibe-ink-muted group-hover:text-vibe-ink transition-colors">
            What are you reading, <span className="font-semibold">{firstName}</span>?
          </p>
          <p className="text-xs text-vibe-ink-muted/70 mt-0.5">Share a passage, a rating, or a reflectionâ€¦</p>
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
            Mine
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

      {/* Post stream with Staggered Cascading Entrance */}
      <div key={`${feedTab}-${sortBy}`} className="space-y-4 sm:space-y-5">
        {isLoading && posts.length === 0 && (
          <div className="py-12 text-center text-sm text-vibe-ink-muted">Loading the feed…</div>
        )}

        {!isLoading && sortedPosts.length === 0 && (
          <div className="rounded-3xl p-12 text-center border border-vibe-border bg-vibe-card space-y-3 shadow-soft feed-card-stagger">
            <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-vibe-ink">
              {feedTab === 'following' ? 'Nothing posted yet' : 'The feed is empty'}
            </h3>
            <p className="text-xs text-vibe-ink-muted leading-relaxed max-w-sm mx-auto">
              {feedTab === 'following'
                ? 'Your own reading moments will appear here once you share one.'
                : isGuest
                ? 'No readers have shared yet. Be the first by creating an account.'
                : 'No one has shared a reading moment yet. Share the first passage from the book you are reading.'}
            </p>
            {isGuest && (
              <p className="text-[11px] text-vibe-ink-muted">Signing in lets you publish to the community.</p>
            )}
          </div>
        )}

        {sortedPosts.map((post, index) => (
          <div
            key={post.id}
            className="feed-card-stagger"
            style={{ animationDelay: `${Math.min(index * 65, 390)}ms` }}
          >
            <PostCard
              post={post}
              onSelectBookForTimer={onSelectBookForTimer}
            />
          </div>
        ))}
      </div>

      {/* End of feed */}
      {sortedPosts.length > 0 && (
        <div className="py-10 text-center">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="w-8 h-px bg-vibe-border" />
            <p className="text-xs text-vibe-ink-muted font-medium">
              You're all caught up â€” time for another chapter.
            </p>
            <div className="w-8 h-px bg-vibe-border" />
          </div>
        </div>
      )}

    </div>
  );
};
