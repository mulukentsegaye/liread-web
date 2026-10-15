import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { INITIAL_POSTS, DEFAULT_USER_AVATAR } from '../data/mockData';
import { postsService } from '../services/postsService';
import { isSupabaseConfigured } from '../lib/supabase';

interface FeedStore {
  posts: Post[];
  feedTab: 'for_you' | 'following';
  sortBy: 'latest' | 'top';
  isCreateModalOpen: boolean;
  isLoading: boolean;
  isRealtimeActive: boolean;

  setFeedTab: (tab: 'for_you' | 'following') => void;
  setSortBy: (sort: 'latest' | 'top') => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  fetchPosts: (currentUserId?: string) => Promise<void>;
  toggleUpvote: (postId: string, currentUserId?: string) => Promise<void>;
  toggleSave: (postId: string, currentUserId?: string) => Promise<void>;
  addPost: (postData: Partial<Post>, currentUserId?: string) => Promise<void>;
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set, get) => ({
      posts: INITIAL_POSTS,
      feedTab: 'for_you',
      sortBy: 'latest',
      isCreateModalOpen: false,
      isLoading: false,
      isRealtimeActive: false,

      setFeedTab: (tab) => set({ feedTab: tab }),
      setSortBy: (sort) => {
        set({ sortBy: sort });
        get().fetchPosts();
      },
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

      fetchPosts: async (currentUserId?: string) => {
        if (!isSupabaseConfigured()) {
          return;
        }

        set({ isLoading: true });
        try {
          const { sortBy } = get();
          const supabasePosts = await postsService.getPosts({
            currentUserId,
            sortBy,
          });

          if (supabasePosts && supabasePosts.length > 0) {
            set({ posts: supabasePosts });
          }
        } catch (err) {
          console.warn('Failed to fetch posts from Supabase, using cached/mock posts:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      toggleUpvote: async (postId: string, currentUserId?: string) => {
        // Optimistic UI update
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

        if (isSupabaseConfigured() && currentUserId) {
          try {
            await postsService.toggleUpvote(postId, currentUserId);
          } catch (err) {
            console.warn('Could not sync upvote to Supabase:', err);
          }
        }
      },

      toggleSave: async (postId: string, currentUserId?: string) => {
        // Optimistic UI update
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

        if (isSupabaseConfigured() && currentUserId) {
          try {
            await postsService.toggleSavePost(postId, currentUserId);
          } catch (err) {
            console.warn('Could not sync bookmark to Supabase:', err);
          }
        }
      },

      addPost: async (postData: Partial<Post>, currentUserId?: string) => {
        const tempId = `post-${Date.now()}`;
        const newPost: Post = {
          id: tempId,
          userId: currentUserId || 'user-alex-morgan',
          authorName: postData.authorName || 'Alex Morgan',
          authorAvatar: postData.authorAvatar || DEFAULT_USER_AVATAR,
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

        // Prepend optimistically
        set((state) => ({
          posts: [newPost, ...state.posts],
          isCreateModalOpen: false,
        }));

        if (isSupabaseConfigured() && currentUserId) {
          try {
            const savedPost = await postsService.createPost(postData, currentUserId);
            // Replace temporary post with Supabase post
            set((state) => ({
              posts: state.posts.map((p) => (p.id === tempId ? savedPost : p)),
            }));
          } catch (err) {
            console.warn('Could not persist new post to Supabase:', err);
          }
        }
      },
    }),
    {
      name: 'readers_hub_feed_state_v1',
      partialize: (state) => ({
        posts: state.posts,
        feedTab: state.feedTab,
        sortBy: state.sortBy,
      }),
    }
  )
);
