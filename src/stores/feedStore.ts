import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Post } from '../types';
import { DEFAULT_USER_AVATAR } from '../data/defaults';
import { postsService } from '../services/postsService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useNoticeStore, toast } from './noticeStore';
import { useAuthStore } from './authStore';

const feedClientId = 'client-' + Math.random().toString(36).substring(2, 11);
let feedRealtimeChannel: RealtimeChannel | null = null;

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
  deletePost: (postId: string, currentUserId?: string) => Promise<void>;
  initRealtime: () => () => void;
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set, get) => ({
      posts: [],
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
          set({ posts: supabasePosts });
        } catch (err) {
          console.warn('Failed to fetch posts from Supabase:', err);
          set({ posts: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      toggleUpvote: async (postId: string, currentUserId?: string) => {
        let nextUpvoted = false;
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              nextUpvoted = !post.isUpvoted;
              return {
                ...post,
                isUpvoted: nextUpvoted,
                upvotesCount: nextUpvoted ? post.upvotesCount + 1 : Math.max(0, post.upvotesCount - 1),
              };
            }
            return post;
          }),
        }));

        // Broadcast immediately to all active peer clients over WebSocket (sub-50ms sync)
        if (feedRealtimeChannel) {
          try {
            feedRealtimeChannel.send({
              type: 'broadcast',
              event: 'interaction',
              payload: {
                clientId: feedClientId,
                postId,
                action: nextUpvoted ? 'upvote' : 'unvote',
              },
            });
          } catch {}
        }

        if (isSupabaseConfigured() && currentUserId && currentUserId !== 'guest-user') {
          try {
            await postsService.toggleUpvote(postId, currentUserId);
          } catch (err) {
            console.warn('Could not sync upvote to Supabase:', err);
          }
        }
      },

      toggleSave: async (postId: string, currentUserId?: string) => {
        let nextSaved = false;
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              nextSaved = !post.isSaved;
              const currentBookmarks = post.bookmarksCount ?? (post.isSaved ? 1 : 0);
              return {
                ...post,
                isSaved: nextSaved,
                bookmarksCount: Math.max(0, currentBookmarks + (nextSaved ? 1 : -1)),
              };
            }
            return post;
          }),
        }));

        // Broadcast immediately to all active peer clients over WebSocket (sub-50ms sync)
        if (feedRealtimeChannel) {
          try {
            feedRealtimeChannel.send({
              type: 'broadcast',
              event: 'interaction',
              payload: {
                clientId: feedClientId,
                postId,
                action: nextSaved ? 'save' : 'unsave',
              },
            });
          } catch {}
        }

        if (isSupabaseConfigured() && currentUserId && currentUserId !== 'guest-user') {
          try {
            await postsService.toggleSavePost(postId, currentUserId);
          } catch (err) {
            console.warn('Could not sync bookmark to Supabase:', err);
          }
        }
      },

      initRealtime: () => {
        if (!isSupabaseConfigured() || typeof window === 'undefined') {
          return () => {};
        }

        if (feedRealtimeChannel) {
          return () => {};
        }

        const channel = supabase.channel('liread:feed-interactions');

        // 1. Instant Peer-to-Peer WebSocket Broadcast (sub-50ms between active browsers)
        channel.on('broadcast', { event: 'interaction' }, ({ payload }) => {
          if (!payload || !payload.postId || payload.clientId === feedClientId) return;

          set((state) => ({
            posts: state.posts.map((post) => {
              if (post.id !== payload.postId) return post;
              if (payload.action === 'save') {
                return {
                  ...post,
                  bookmarksCount: (post.bookmarksCount ?? 0) + 1,
                };
              }
              if (payload.action === 'unsave') {
                return {
                  ...post,
                  bookmarksCount: Math.max(0, (post.bookmarksCount ?? 0) - 1),
                };
              }
              if (payload.action === 'upvote') {
                return {
                  ...post,
                  upvotesCount: (post.upvotesCount ?? 0) + 1,
                };
              }
              if (payload.action === 'unvote') {
                return {
                  ...post,
                  upvotesCount: Math.max(0, (post.upvotesCount ?? 0) - 1),
                };
              }
              return post;
            }),
          }));
        });

        // 2. Realtime Postgres CDC Changes from Supabase Database
        channel
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'saved_posts' },
            (payload) => {
              const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
              if (!postId) return;
              if (payload.eventType === 'INSERT') {
                set((state) => ({
                  posts: state.posts.map((p) =>
                    p.id === postId ? { ...p, bookmarksCount: (p.bookmarksCount ?? 0) + 1 } : p
                  ),
                }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({
                  posts: state.posts.map((p) =>
                    p.id === postId ? { ...p, bookmarksCount: Math.max(0, (p.bookmarksCount ?? 0) - 1) } : p
                  ),
                }));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'post_upvotes' },
            (payload) => {
              const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
              if (!postId) return;
              if (payload.eventType === 'INSERT') {
                set((state) => ({
                  posts: state.posts.map((p) =>
                    p.id === postId ? { ...p, upvotesCount: (p.upvotesCount ?? 0) + 1 } : p
                  ),
                }));
              } else if (payload.eventType === 'DELETE') {
                set((state) => ({
                  posts: state.posts.map((p) =>
                    p.id === postId ? { ...p, upvotesCount: Math.max(0, (p.upvotesCount ?? 0) - 1) } : p
                  ),
                }));
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'posts' },
            (payload) => {
              const updated = payload.new as any;
              if (!updated || !updated.id) return;
              set((state) => ({
                posts: state.posts.map((p) => {
                  if (p.id !== updated.id) return p;
                  return {
                    ...p,
                    upvotesCount: typeof updated.upvotes_count === 'number' ? updated.upvotes_count : p.upvotesCount,
                    commentsCount: typeof updated.comments_count === 'number' ? updated.comments_count : p.commentsCount,
                    bookmarksCount: typeof updated.bookmarks_count === 'number' ? updated.bookmarks_count : p.bookmarksCount,
                  };
                }),
              }));
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              set({ isRealtimeActive: true });
            }
          });

        feedRealtimeChannel = channel;

        return () => {
          if (feedRealtimeChannel) {
            supabase.removeChannel(feedRealtimeChannel);
            feedRealtimeChannel = null;
            set({ isRealtimeActive: false });
          }
        };
      },

      addPost: async (postData: Partial<Post>, currentUserId?: string) => {
        if (!currentUserId || currentUserId === 'guest-user') {
          useNoticeStore.getState().showAlertModal({
            type: 'guest',
            title: 'Create an Account',
            message: 'Create a free Liread account to share reading moments, passages, and reflections with the community.',
            confirmLabel: 'Create Account',
            cancelLabel: 'Keep Browsing',
            onConfirm: () => useAuthStore.getState().openAuthModal('signup'),
          });
          return;
        }
        if (!isSupabaseConfigured()) {
          toast.warning('Unable to publish at this time. Please check your connection and try again.', 'Posting Unavailable');
          return;
        }

        const cleanTitle = (postData.bookTitle || '').trim();
        const hasQuote = Boolean(postData.quoteText && postData.quoteText.trim().length > 0);
        const hasRec = Boolean(postData.recommendationText && postData.recommendationText.trim().length > 0);
        const hasRating = Boolean(postData.rating);

        if (!cleanTitle) {
          toast.warning('Please enter a book title before publishing.', 'Title Required');
          return;
        }

        if (!hasQuote && !hasRec && !hasRating) {
          toast.warning('Your post cannot be empty. Please write a quote or reflection before publishing.', 'Empty Post');
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
          toast.error('Could not publish your post. Please check your connection and try again.', 'Publish Failed');
        }
      },

      deletePost: async (postId: string, currentUserId?: string) => {
        // Optimistic UI update
        set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
        if (currentUserId && isSupabaseConfigured() && !postId.startsWith('demo-post-')) {
          try {
            await postsService.deletePost(postId, currentUserId);
            toast.success('Your post has been removed from the feed.', 'Post Deleted');
          } catch (err) {
            console.warn('Failed to delete post in Supabase:', err);
            // Re-fetch to recover state if server failed
            get().fetchPosts(currentUserId);
            toast.error('Could not delete post. Please verify your permissions.', 'Delete Failed');
          }
        } else {
          toast.success('Post removed from feed.', 'Post Removed');
        }
      },
    }),
    {
      name: 'liread_feed_state_v2',
      partialize: (state) => ({
        posts: state.posts,
        sortBy: state.sortBy,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Always ensure feed tab starts from 'for_you' (never sticky on 'Mine')
        state.feedTab = 'for_you';
        const currentPosts = state.posts || [];
        // Filter out any demo posts or ghost/empty posts that have no quote, reflection, or rating
        // and sanitize any legacy hardcoded demo metrics
        state.posts = currentPosts
          .map((p) => {
            const isDemoCount = [42, 38, 56, 18, 34, 51, 29, 43].includes(p.upvotesCount);
            if (isDemoCount) {
              return { ...p, upvotesCount: 0, commentsCount: 0 };
            }
            return p;
          })
          .filter((p) => {
            if (p.id.startsWith('demo-post-')) return false;
            const hasQuote = Boolean(p.quoteText && p.quoteText.trim().length > 0);
            const hasRec = Boolean(p.recommendationText && p.recommendationText.trim().length > 0);
            const hasRating = Boolean(p.rating);
            return hasQuote || hasRec || hasRating;
          });
      },
    }
  )
);
