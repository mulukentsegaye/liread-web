import React, { useState } from 'react';
import { X, Sparkles, Star, ArrowLeft } from 'lucide-react';
import { useFeedStore } from '../../stores/feedStore';
import { useAuthStore } from '../../stores/authStore';
import { PostType } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { addPost } = useFeedStore();
  const { user } = useAuthStore();

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

    addPost(
      {
        postType,
        bookTitle: bookTitle.trim(),
        bookAuthor: bookAuthor.trim() || 'Unknown Author',
        quoteText: quoteText.trim() || undefined,
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
        tag,
        recommendationText: recommendationText.trim() || undefined,
        rating: postType === 'finished_book' ? rating : undefined,
        authorName: user.fullName,
        authorAvatar: user.avatarUrl,
      },
      user.id
    );

    setBookTitle('');
    setBookAuthor('');
    setQuoteText('');
    setPageNumber('');
    setRecommendationText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full h-full sm:h-auto sm:max-w-lg rounded-none sm:rounded-3xl p-5 sm:p-6 md:p-8 bg-vibe-card border border-vibe-border text-vibe-ink shadow-vibe-elevated flex flex-col justify-between overflow-y-auto max-h-screen sm:max-h-[90vh] transition-all duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-vibe-border pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full border border-vibe-border bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all active:scale-95 shadow-xs group"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center gap-2 text-vibe-accent">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <h2 className="font-serif text-lg sm:text-xl font-bold text-vibe-ink">
                  Share a Reading Moment
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
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
                  ? 'bg-vibe-accent-subtle border-vibe-accent text-vibe-accent shadow-xs'
                  : 'bg-vibe-card border-vibe-border text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Passage Quote
            </button>
            <button
              type="button"
              onClick={() => setPostType('finished_book')}
              className={`min-h-[44px] py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                postType === 'finished_book'
                  ? 'bg-vibe-accent-subtle border-vibe-accent text-vibe-accent shadow-xs'
                  : 'bg-vibe-card border-vibe-border text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Finished Book
            </button>
            <button
              type="button"
              onClick={() => setPostType('recommendation')}
              className={`min-h-[44px] py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                postType === 'recommendation'
                  ? 'bg-vibe-accent-subtle border-vibe-accent text-vibe-accent shadow-xs'
                  : 'bg-vibe-card border-vibe-border text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Recommend
            </button>
          </div>

          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Book Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. The Creative Act"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                  Author
                </label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="e.g. Rick Rubin"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Quote Section */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                Favorite Passage or Quote
              </label>
              <textarea
                rows={3}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="“The object isn't to make art, it's to be in that wonderful state...”"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none font-serif italic"
              />
            </div>

            {/* Page Number & Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                  Page #
                </label>
                <input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  placeholder="e.g. 19"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                  Genre / Tag
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink focus:border-vibe-accent focus:outline-none"
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
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                  Your Rating
                </label>
                <div className="flex items-center gap-2 text-vibe-secondary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'opacity-25'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reflection / Thoughts */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1 text-vibe-ink-muted">
                Your Thoughts & Reflections
              </label>
              <textarea
                rows={3}
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                placeholder="What made this passage stay with you?"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink placeholder:text-vibe-ink-muted focus:border-vibe-accent focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-vibe-border mt-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-semibold text-vibe-ink-muted hover:text-vibe-ink transition-colors"
          >
            Cancel
          </button>
          <button
            form="create-post-form"
            type="submit"
            className="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full bg-vibe-accent hover:bg-vibe-accent-hover text-white shadow-xs transition-colors active:scale-95"
          >
            Publish Moment
          </button>
        </div>

      </div>
    </div>
  );
};
