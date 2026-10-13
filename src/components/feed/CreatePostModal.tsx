import React, { useState } from 'react';
import { X, BookOpen, Quote, Star, Sparkles } from 'lucide-react';
import { useFeedStore } from '../../stores/feedStore';
import { PostType } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { addPost } = useFeedStore();

  const [postType, setPostType] = useState<PostType>('passage');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [tag, setTag] = useState('Creativity');
  const [recommendationText, setRecommendationText] = useState('');
  const [rating, setRating] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      alert('Please enter a book title');
      return;
    }

    addPost({
      postType,
      bookTitle: bookTitle.trim(),
      bookAuthor: bookAuthor.trim() || 'Unknown Author',
      quoteText: quoteText.trim() || undefined,
      pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
      tag,
      recommendationText: recommendationText.trim() || undefined,
      rating: postType === 'finished_book' ? rating : undefined,
    });

    // Reset & close
    setBookTitle('');
    setBookAuthor('');
    setQuoteText('');
    setPageNumber('');
    setRecommendationText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl border border-[#e5ebe5] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eef2ee] pb-4">
          <div className="flex items-center gap-2 text-[#35523f]">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-serif text-xl font-bold text-[#1b2b20]">
              Share a Reading Moment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPostType('passage')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
              postType === 'passage'
                ? 'bg-[#e7eee8] border-[#38523f] text-[#203425]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Passage Quote
          </button>
          <button
            type="button"
            onClick={() => setPostType('finished_book')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
              postType === 'finished_book'
                ? 'bg-[#e7eee8] border-[#38523f] text-[#203425]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Finished Book
          </button>
          <button
            type="button"
            onClick={() => setPostType('recommendation')}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
              postType === 'recommendation'
                ? 'bg-[#e7eee8] border-[#38523f] text-[#203425]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Recommendation
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Book Title & Author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. The Creative Act"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Author
              </label>
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                placeholder="e.g. Rick Rubin"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
              />
            </div>
          </div>

          {/* Quote Section (for passage / quote) */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Favorite Passage or Quote
            </label>
            <textarea
              rows={2}
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="“The object isn't to make art, it's to be in that wonderful state...”"
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none font-serif italic"
            />
          </div>

          {/* Page Number & Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Page #
              </label>
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="e.g. 19"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Genre / Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none bg-white"
              >
                <option value="Creativity">Creativity</option>
                <option value="Fiction">Fiction</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Memoir">Memoir</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Poetry">Poetry</option>
              </select>
            </div>
          </div>

          {/* Star Rating (if finished book) */}
          {postType === 'finished_book' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reflection / Thoughts */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Your Thoughts & Reflections
            </label>
            <textarea
              rows={2}
              value={recommendationText}
              onChange={(e) => setRecommendationText(e.target.value)}
              placeholder="What made this passage stay with you?"
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eef2ee]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#38523f] hover:bg-[#273d2f] text-white rounded-xl shadow-xs transition-colors"
            >
              Publish Moment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
