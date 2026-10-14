import React, { useState } from 'react';
import { X, Sparkles, Star } from 'lucide-react';
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

    setBookTitle('');
    setBookAuthor('');
    setQuoteText('');
    setPageNumber('');
    setRecommendationText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full h-full sm:h-auto sm:max-w-lg rounded-none sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl border border-[#e5ebe5] flex flex-col justify-between overflow-y-auto max-h-screen sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#eef2ee] pb-4 mb-4">
            <div className="flex items-center gap-2 text-[#35523f]">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1b2b20]">
                Share a Reading Moment
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Post Type Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPostType('passage')}
              className={`min-h-[44px] py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
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
              className={`min-h-[44px] py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
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
              className={`min-h-[44px] py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                postType === 'recommendation'
                  ? 'bg-[#e7eee8] border-[#38523f] text-[#203425]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Recommend
            </button>
          </div>

          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Book Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
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
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
                />
              </div>
            </div>

            {/* Quote Section */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Favorite Passage or Quote
              </label>
              <textarea
                rows={3}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="“The object isn't to make art, it's to be in that wonderful state...”"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none font-serif italic"
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
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Genre / Tag
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none bg-white"
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

            {/* Star Rating */}
            {postType === 'finished_book' && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-400 active:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-gray-300'}`} />
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
                rows={3}
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                placeholder="What made this passage stay with you?"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:border-[#38523f] focus:ring-1 focus:ring-[#38523f] focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions (touch targets >= 44px) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eef2ee] mt-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            form="create-post-form"
            type="submit"
            className="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-semibold bg-[#38523f] hover:bg-[#273d2f] text-white rounded-xl shadow-xs transition-colors active:scale-95"
          >
            Publish Moment
          </button>
        </div>

      </div>
    </div>
  );
};
