import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { INITIAL_POSTS } from '../data/mockData';

interface FeedStore {
  posts: Post[];
  feedTab: 'for_you' | 'following';
  sortBy: 'latest' | 'top';
  isCreateModalOpen: boolean;

  setFeedTab: (tab: 'for_you' | 'following') => void;
  setSortBy: (sort: 'latest' | 'top') => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  toggleUpvote: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addPost: (postData: Partial<Post>) => void;
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set) => ({
      posts: INITIAL_POSTS,
      feedTab: 'for_you',
      sortBy: 'latest',
      isCreateModalOpen: false,

      setFeedTab: (tab) => set({ feedTab: tab }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

      toggleUpvote: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              const wasUpvoted = !!post.isUpvoted;
              return {
                ...post,
                isUpvoted: !wasUpvoted,
                upvotesCount: wasUpvoted ? Math.max(0, post.upvotesCount - 1) : post.upvotesCount + 1,
              };
            }
            return post;
          }),
        }));
      },

      toggleSave: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                isSaved: !post.isSaved,
              };
            }
            return post;
          }),
        }));
      },

      addPost: (postData) => {
        const newPost: Post = {
          id: `post-${Date.now()}`,
          userId: 'user-alex-morgan',
          authorName: 'Alex Morgan',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          actionText: postData.postType === 'finished_book' ? 'finished a book' : 'shared a passage',
          timeAgo: 'Just now',
          tag: postData.tag || 'General',
          bookTitle: postData.bookTitle || 'Untitled Book',
          bookAuthor: postData.bookAuthor || 'Unknown Author',
          coverImageUrl: postData.coverImageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
          coverBgColor: '#e9ece7',
          quoteText: postData.quoteText,
          pageNumber: postData.pageNumber,
          recommendationText: postData.recommendationText,
          rating: postData.rating,
          upvotesCount: 0,
          commentsCount: 0,
          isUpvoted: false,
          isSaved: false,
          postType: postData.postType || 'passage',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          posts: [newPost, ...state.posts],
          isCreateModalOpen: false,
        }));
      },
    }),
    {
      name: 'readers_hub_feed_state_v1',
    }
  )
);
