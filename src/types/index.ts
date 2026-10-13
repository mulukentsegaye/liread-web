export type RankTier = 
  | 'Novice Reader'
  | 'Bookworm'
  | 'Avid Reader'
  | 'Literary Scholar'
  | 'Master of Tomes';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  subtitle?: string;
  totalMinutesRead: number;
  currentStreak: number;
  dailyGoalMinutes: number;
  rankTier: RankTier;
  bookshelfCount: number;
  savedPassagesCount: number;
}

export type PostType = 'passage' | 'finished_book' | 'recommendation';

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  actionText: string; // e.g. "shared a passage", "finished a book"
  timeAgo: string;    // e.g. "2 hours ago"
  tag: string;        // e.g. "Creativity", "Fiction"
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl?: string;
  coverBgColor?: string;
  quoteText?: string;
  pageNumber?: number | string;
  recommendationText?: string;
  rating?: number;    // 1 - 5 stars
  upvotesCount: number;
  commentsCount: number;
  isUpvoted?: boolean;
  isSaved?: boolean;
  postType: PostType;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  fullName: string;
  initials: string;
  avatarUrl?: string;
  rank: number;
  minutesRead: number;
  formattedTime: string;
  isCurrentUser?: boolean;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookTitle: string;
  bookAuthor?: string;
  durationMinutes: number;
  durationSeconds: number;
  sessionDate: string;
  createdAt: string;
}

export interface TimerSessionData {
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl?: string;
  pageNote?: string;
}
