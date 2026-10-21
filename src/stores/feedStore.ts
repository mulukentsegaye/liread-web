import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { DEFAULT_USER_AVATAR, DEMO_POSTS } from '../data/defaults';
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
      posts: DEMO_POSTS,
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
        set({ isLoading: true });
        try {
          let supabasePosts: Post[] = [];
          if (isSupabaseConfigured()) {
            const { sortBy } = get();
            supabasePosts = await postsService.getPosts({ currentUserId, sortBy });
          }
          if (supabasePosts.length > 0) {
            set({ posts: supabasePosts });
          } else {
            // If database is empty or not yet seeded with seed.sql, display rich demo feed
            set({ posts: DEMO_POSTS });
          }
        } catch (err) {
          console.warn('Failed to fetch posts from Supabase, using demo feed:', err);
          set({ posts: DEMO_POSTS });
        } finally {
          set({ isLoading: false });
        }
      },

      toggleUpvote: async (postId: string, currentUserId?: string) => {
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

        if (isSupabaseConfigured() && currentUserId && currentUserId !== 'guest-user') {
          try {
            await postsService.toggleUpvote(postId, currentUserId);
          } catch (err) {
            console.warn('Could not sync upvote to Supabase:', err);
          }
        }
      },

      toggleSave: async (postId: string, currentUserId?: string) => {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              return { ...post, isSaved: !post.isSaved };
            }
            return post;
          }),
        }));

        if (isSupabaseConfigured() && currentUserId && currentUserId !== 'guest-user') {
          try {
            await postsService.toggleSavePost(postId, currentUserId);
          } catch (err) {
            console.warn('Could not sync bookmark to Supabase:', err);
          }
        }
      },

      addPost: async (postData: Partial<Post>, currentUserId?: string) => {
        if (!currentUserId || currentUserId === 'guest-user') {
          alert('Create an account to share reading moments. Guests can only browse.');
          return;
        }
        if (!isSupabaseConfigured()) {
          alert('Supabase is not configured.');
          return;
        }
        const tempId = `post-${Date.now()}`;
        const newPost: Post = {
          id: tempId,
          userId: currentUserId,
          authorName: postData.authorName || 'You',
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

        set((state) => ({
          posts: [newPost, ...state.posts],
          isCreateModalOpen: false,
        }));

        try {
          const savedPost = await postsService.createPost(postData, currentUserId);
          set((state) => ({
            posts: state.posts.map((p) => (p.id === tempId ? savedPost : p)),
          }));
        } catch (err) {
          console.warn('Could not persist new post to Supabase:', err);
          // Remove temp post on failure to avoid phantom data
          set((state) => ({ posts: state.posts.filter((p) => p.id !== tempId) }));
          alert('Failed to publish. Please try again.');
        }
      },
    }),
    {
      name: 'readers_hub_feed_state_v3',
      partialize: (state) => ({
        posts: state.posts,
        feedTab: state.feedTab,
        sortBy: state.sortBy,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Automatically sync demo posts to authentic Open Library book covers
        const currentPosts = state.posts || [];
        const hasOutdatedDemoCover = currentPosts.some(
          (p) => p.id.startsWith('demo-post-') && p.coverImageUrl?.includes('unsplash.com')
        );
        if (hasOutdatedDemoCover) {
          state.posts = currentPosts.map((p) => {
            if (p.id.startsWith('demo-post-')) {
              const freshDemo = DEMO_POSTS.find((d) => d.id === p.id);
              if (freshDemo) return { ...p, coverImageUrl: freshDemo.coverImageUrl };
            }
            return p;
          });
        }
      },
    }
  )
);
