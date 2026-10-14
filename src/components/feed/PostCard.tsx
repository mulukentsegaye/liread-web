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
    <article className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#e8ece8] shadow-soft transition-all hover:shadow-md space-y-4 overflow-hidden">
      
      {/* 1. Header: Author metadata & options */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-gray-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                {post.authorName}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-500">
                {post.actionText}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              <span>{post.timeAgo}</span>
              <span>·</span>
              <span className="font-medium text-[#44634d] bg-[#eff4ef] px-1.5 py-0.2 rounded">
                {post.tag}
              </span>
            </div>
          </div>
        </div>

        <button 
          aria-label="More options"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Stylized Passage & Book Card (Mobile: flex-col, Tablet/Desktop: flex-row) */}
      <div className="bg-[#f6f5ef] border border-[#ece9df] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 transition-colors overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-stretch">
          
          {/* Book Spine / Jacket preview */}
          <div 
            onClick={() => onSelectBookForTimer?.(post.bookTitle, post.bookAuthor, post.coverImageUrl)}
            className="flex flex-col items-center justify-center p-2 cursor-pointer group flex-shrink-0 w-full sm:w-36"
            title="Click to start timer with this book"
          >
            <div className="relative w-28 h-36 sm:h-40 bg-[#faf8f3] rounded-md shadow-md border border-[#e5dfd3] flex flex-col items-center justify-between p-3 text-center transform transition-transform group-hover:scale-105 duration-300">
              <div className="text-[10px] font-bold tracking-widest text-[#2d3b2f] uppercase leading-tight line-clamp-2">
                {post.bookTitle}
              </div>
              
              <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-300">
                <span className="w-5 h-5 rounded-full border border-gray-200"></span>
              </div>

              <div className="text-[9px] text-gray-500 tracking-wider font-medium truncate w-full">
                {post.bookAuthor}
              </div>

              {/* Book spine line */}
              <div className="absolute left-1.5 top-0 bottom-0 w-[2px] bg-black/5"></div>
            </div>

            <div className="mt-2 text-center w-full">
              <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#35523f] transition-colors truncate">
                {post.bookTitle}
              </p>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                {post.bookAuthor}
              </p>
            </div>
          </div>

          {/* Passage Quote block */}
          <div className="flex flex-col justify-between h-full flex-1 min-w-0 w-full">
            <div>
              <span className="text-3xl sm:text-4xl text-[#788e7e] font-serif leading-none block select-none -mb-1">
                “
              </span>
              <blockquote className="font-serif italic text-base sm:text-lg md:text-xl text-[#202d23] leading-relaxed font-normal break-words">
                {post.quoteText}
              </blockquote>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#e8e4d8] text-gray-400 text-[10px]">
              <span className="font-bold tracking-widest uppercase">
                A PASSAGE TO KEEP
              </span>
              {post.pageNumber && (
                <span className="font-mono text-xs text-gray-500">
                  p. {post.pageNumber}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Star Rating (if finished book or rated) */}
      {post.rating && (
        <div className="flex items-center gap-1 text-amber-500 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < (post.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
      )}

      {/* 4. Reader Reflection & Review */}
      {post.recommendationText && (
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal break-words">
          {post.recommendationText}
        </p>
      )}

      {/* 5. Footer Actions: Upvote, Comment, Save with min 44x44px touch targets */}
      <div className="flex items-center justify-between pt-1 border-t border-[#f0f4f0]">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => toggleUpvote(post.id)}
            aria-label="Upvote post"
            className={`min-h-[44px] min-w-[44px] px-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${
              post.isUpvoted 
                ? 'text-rose-600' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Heart 
              className={`w-4 h-4 transition-transform active:scale-125 ${
                post.isUpvoted ? 'fill-rose-500 text-rose-500' : ''
              }`} 
            />
            <span>{post.upvotesCount}</span>
          </button>

          <button
            onClick={() => alert(`Comments for "${post.bookTitle}":\nJoin the discussion thread with fellow readers!`)}
            aria-label="Comment on post"
            className="min-h-[44px] min-w-[44px] px-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </button>
        </div>

        <button
          onClick={() => toggleSave(post.id)}
          aria-label="Save passage"
          className={`min-h-[44px] min-w-[44px] px-3 flex items-center gap-1.5 text-xs font-medium transition-colors ${
            post.isSaved 
              ? 'text-[#35523f] font-semibold' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bookmark 
            className={`w-4 h-4 transition-all ${
              post.isSaved ? 'fill-[#35523f] text-[#35523f]' : ''
            }`} 
          />
          <span>Save</span>
        </button>
      </div>

    </article>
  );
};
