import React from 'react';
import { Heart, MessageSquare, Bookmark, MoreHorizontal, Star } from 'lucide-react';
import { Post } from '../../types';
import { useFeedStore } from '../../stores/feedStore';

interface PostCardProps {
  post: Post;
  onSelectBookForTimer?: (title: string, author: string, cover?: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelectBookForTimer }) => {
  const { toggleUpvote, toggleSave } = useFeedStore();

  return (
    <article className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft transition-all duration-500 hover:shadow-vibe-elevated space-y-4 overflow-hidden">
      
      {/* 1. Header: Author metadata & options */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-vibe-border flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm text-vibe-ink truncate">
                {post.authorName}
              </span>
              <span className="text-[11px] sm:text-xs text-vibe-ink-muted">
                {post.actionText}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-vibe-ink-muted mt-0.5">
              <span>{post.timeAgo}</span>
              <span>·</span>
              <span className="font-medium text-vibe-accent bg-vibe-accent-subtle border border-vibe-accent/20 px-2 py-0.5 rounded-full">
                {post.tag}
              </span>
            </div>
          </div>
        </div>

        <button 
          aria-label="More options"
          className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors flex-shrink-0"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Stylized Passage & Book Card (Mobile: flex-col, Tablet/Desktop: flex-row) */}
      <div className="bg-vibe-card-subtle border border-vibe-border rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 transition-colors duration-500 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-stretch">
          
          {/* Book Spine / Jacket preview */}
          <div 
            onClick={() => onSelectBookForTimer?.(post.bookTitle, post.bookAuthor, post.coverImageUrl)}
            className="flex flex-col items-center justify-center p-2 cursor-pointer group flex-shrink-0 w-full sm:w-36"
            title="Click to start timer with this book"
          >
            <div className="relative w-28 h-36 sm:h-40 bg-vibe-card rounded-md shadow-xs border border-vibe-border flex flex-col items-center justify-between p-3 text-center transform transition-transform group-hover:scale-105 duration-300">
              <div className="text-[10px] font-bold tracking-widest text-vibe-ink uppercase leading-tight line-clamp-2">
                {post.bookTitle}
              </div>
              
              <div className="w-8 h-8 rounded-full border border-vibe-border flex items-center justify-center opacity-60">
                <span className="w-5 h-5 rounded-full border border-vibe-accent/40"></span>
              </div>

              <div className="text-[9px] tracking-wider font-medium text-vibe-ink-muted truncate w-full">
                {post.bookAuthor}
              </div>

              {/* Book spine tactile accent */}
              <div className="absolute left-1.5 top-0 bottom-0 w-[2px] bg-black/5 dark:bg-white/10"></div>
            </div>

            <div className="mt-2 text-center w-full">
              <p className="text-xs font-bold text-vibe-ink leading-tight transition-colors truncate">
                {post.bookTitle}
              </p>
              <p className="text-[11px] text-vibe-ink-muted leading-tight mt-0.5 truncate">
                {post.bookAuthor}
              </p>
            </div>
          </div>

          {/* Passage Quote block with Literary Serif Typography */}
          <div className="flex flex-col justify-between h-full flex-1 min-w-0 w-full">
            <div>
              <span className="font-serif text-3xl sm:text-4xl text-vibe-accent leading-none block select-none -mb-1 opacity-80">
                “
              </span>
              <blockquote className="font-serif italic text-base sm:text-lg md:text-xl text-vibe-ink leading-relaxed font-normal break-words">
                {post.quoteText}
              </blockquote>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-vibe-border-subtle text-[10px]">
              <span className="font-bold tracking-widest uppercase text-vibe-ink-muted">
                A PASSAGE TO KEEP
              </span>
              {post.pageNumber && (
                <span className="font-mono text-xs text-vibe-ink-muted">
                  p. {post.pageNumber}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Star Rating (if finished book or rated) */}
      {post.rating && (
        <div className="flex items-center gap-1 pt-1 text-vibe-secondary">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < (post.rating || 0) ? 'fill-current' : 'opacity-25'}`} 
            />
          ))}
        </div>
      )}

      {/* 4. Reader Reflection & Review */}
      {post.recommendationText && (
        <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed font-normal break-words">
          {post.recommendationText}
        </p>
      )}

      {/* 5. Footer Actions: Upvote, Comment, Save */}
      <div className="flex items-center justify-between pt-1 border-t border-vibe-border-subtle">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => toggleUpvote(post.id)}
            aria-label="Upvote post"
            className={`min-h-[40px] px-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${
              post.isUpvoted 
                ? 'text-vibe-secondary font-semibold' 
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            <Heart 
              className={`w-4 h-4 transition-transform active:scale-125 ${
                post.isUpvoted ? 'fill-current' : ''
              }`} 
            />
            <span>{post.upvotesCount}</span>
          </button>

          <button
            onClick={() => alert(`Comments for "${post.bookTitle}":\nJoin the discussion thread with fellow readers!`)}
            aria-label="Comment on post"
            className="min-h-[40px] px-2 flex items-center gap-1.5 text-xs font-medium text-vibe-ink-muted hover:text-vibe-ink transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </button>
        </div>

        <button
          onClick={() => toggleSave(post.id)}
          aria-label="Save passage"
          className={`min-h-[40px] px-3 flex items-center gap-1.5 text-xs font-medium transition-colors ${
            post.isSaved 
              ? 'text-vibe-accent font-semibold' 
              : 'text-vibe-ink-muted hover:text-vibe-ink'
          }`}
        >
          <Bookmark 
            className={`w-4 h-4 transition-all ${post.isSaved ? 'fill-current' : ''}`} 
          />
          <span>Save</span>
        </button>
      </div>

    </article>
  );
};
