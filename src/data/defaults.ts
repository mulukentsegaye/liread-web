import { UserProfile } from '../types';

/**
 * Shared visual defaults for Readers Hub.
 * There is intentionally NO demo user, post, or leaderboard data here —
 * every profile and feed entry in the app comes from a real Supabase account.
 */

export const DEFAULT_USER_AVATAR =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='%23059669'/><text x='50' y='55' font-family='system-ui, -apple-system, sans-serif' font-size='38' font-weight='700' fill='%23ffffff' text-anchor='middle' dominant-baseline='central'>RH</text></svg>";

/**
 * Local-only profile used by "Continue as Guest".
 * Guest sessions never reach the database: posting, voting, saving, and
 * leaderboard placement are all disabled while browsing as a guest.
 */
export const GUEST_USER: UserProfile = {
  id: 'guest-user',
  username: 'guest',
  fullName: 'Guest Explorer',
  subtitle: 'Exploring as guest',
  avatarUrl: DEFAULT_USER_AVATAR,
  totalMinutesRead: 0,
  currentStreak: 0,
  dailyGoalMinutes: 60,
  rankTier: 'Novice Reader',
  bookshelfCount: 0,
  savedPassagesCount: 0,
};
