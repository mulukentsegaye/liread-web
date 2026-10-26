import { UserProfile, Post, LeaderboardEntry, ConsistentReader, LiveCoReader, WeeklyCuratorInsight } from '../types';

export const DEFAULT_USER_AVATAR =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23059669'/><text x='50' y='55' font-family='system-ui, -apple-system, sans-serif' font-size='44' font-weight='700' fill='%23ffffff' text-anchor='middle' dominant-baseline='central'>G</text></svg>";

/**
 * Local-only profile used by "Continue as Guest".
 */
export const GUEST_USER: UserProfile = {
  id: 'guest-user',
  username: 'guest',
  fullName: 'Guest Explorer',
  subtitle: 'Exploring as guest',
  bio: 'Exploring Liread as guest. Read-only browsing session.',
  location: 'Reading Sanctuary',
  favoriteGenres: ['Classics', 'Philosophy'],
  currentlyReadingBook: undefined,
  currentlyReadingAuthor: undefined,
  currentlyReadingProgress: 0,
  followersCount: 0,
  followingCount: 0,
  joinedDate: 'October 2026',
  avatarUrl: DEFAULT_USER_AVATAR,
  totalMinutesRead: 0,
  currentStreak: 0,
  dailyGoalMinutes: 30,
  rankTier: 'Novice Reader',
  bookshelfCount: 0,
  savedPassagesCount: 0,
};

/**
 * Empty fallbacks: all posts and social rankings are loaded directly
 * from live Supabase tables or real user activity.
 */
export const DEMO_POSTS: Post[] = [];
export const DEMO_CONSISTENT_READERS: ConsistentReader[] = [];
export const DEMO_LIVE_CO_READERS: LiveCoReader[] = [];
export const DEMO_TOP_CURATORS: WeeklyCuratorInsight[] = [];
export const DEMO_LEADERS: LeaderboardEntry[] = [];
