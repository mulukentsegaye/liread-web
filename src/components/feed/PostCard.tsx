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
    <article className="bg-white rounded-3xl p-6 border border-[#e8ece8] shadow-soft transition-all hover:shadow-md space-y-4">
      
      {/* 1. Header: Author metadata & options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">
                {post.authorName}
              </span>
              <span className="text-xs text-gray-500">
                {post.actionText}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
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
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Stylized Passage & Book Card (Split View) */}
      <div className="bg-[#f6f5ef] border border-[#ece9df] rounded-2xl p-5 md:p-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left Column: Book Spine / Jacket preview */}
          <div 
            onClick={() => onSelectBookForTimer?.(post.bookTitle, post.bookAuthor, post.coverImageUrl)}
            className="md:col-span-4 flex flex-col items-center justify-center p-3 cursor-pointer group"
            title="Click to start timer with this book"
          >
            <div className="relative w-28 h-40 bg-[#faf8f3] rounded-md shadow-md border border-[#e5dfd3] flex flex-col items-center justify-between p-3.5 text-center transform transition-transform group-hover:scale-105 duration-300">
              {/* Minimalist book cover design */}
              <div className="text-[10px] font-bold tracking-widest text-[#2d3b2f] uppercase leading-tight">
                {post.bookTitle}
              </div>
              
              <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-300">
                <span className="w-6 h-6 rounded-full border border-gray-200"></span>
              </div>

              <div className="text-[9px] text-gray-500 tracking-wider font-medium">
                {post.bookAuthor}
              </div>

              {/* Book spine illusion line */}
              <div className="absolute left-1.5 top-0 bottom-0 w-[2px] bg-black/5"></div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#35523f] transition-colors">
                {post.bookTitle}
              </p>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                {post.bookAuthor}
              </p>
            </div>
          </div>

          {/* Right Column: Passage Quote */}
          <div className="md:col-span-8 flex flex-col justify-between h-full pl-0 md:pl-2">
            <div>
              <span className="text-4xl text-[#788e7e] font-serif leading-none block select-none -mb-2">
                “
              </span>
              <blockquote className="font-serif italic text-lg md:text-xl text-[#202d23] leading-relaxed font-normal">
                {post.quoteText}
              </blockquote>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#e8e4d8] text-gray-400 text-[10px]">
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

      {/* 3. Rating Stars (if finished book or rated) */}
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
        <p className="text-sm text-gray-700 leading-relaxed font-normal">
          {post.recommendationText}
        </p>
      )}

      {/* 5. Footer Actions: Upvote, Comment, Save */}
      <div className="flex items-center justify-between pt-2 border-t border-[#f0f4f0]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => toggleUpvote(post.id)}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
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
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </button>
        </div>

        <button
          onClick={() => toggleSave(post.id)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
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
