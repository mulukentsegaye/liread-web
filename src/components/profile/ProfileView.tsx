import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Camera, 
  Trash2, 
  Edit3, 
  MapPin, 
  Users, 
  Flame, 
  BookOpen, 
  Clock, 
  Settings, 
  Sun, 
  Moon, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  UserPlus,
  UserCheck,
  LogIn,
  Bookmark,
  Lock,
  Star,
  Quote,
  Loader2
} from 'lucide-react';
import { Post, UserProfile } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useNoticeStore, toast } from '../../stores/noticeStore';
import { useTheme } from '../../context/ThemeContext';
import { getUserAvatar, isCustomAvatar } from '../../utils/avatar';
import { authService } from '../../services/authService';
import { followService } from '../../services/followService';
import { bookshelfService, BookshelfItem } from '../../services/bookshelfService';
import { postsService } from '../../services/postsService';
import { PostCard } from '../feed/PostCard';

interface ProfileViewProps {
  viewingUserId?: string | null;
  onViewUserProfile?: (userId: string) => void;
  onBack?: () => void;
  onStartTimer?: (book: { title: string; author: string; coverImageUrl?: string }) => void;
  onAdjustGoal?: () => void;
  onOpenAuthModal?: (tab: 'signin' | 'signup') => void;
  onViewBookDetails?: (title: string, author: string, cover?: string) => void;
}

const AVAILABLE_GENRES = [
  'Technology & Coding',
  'Science & Nature',
  'Business & Finance',
  'Psychology',
  'Self-Improvement',
  'Habits & Focus',
  'Philosophy',
  'History & Society',
  'Biography & Memoir',
  'Classic Lit',
  'Fiction & Novels',
  'Science Fiction',
  'Fantasy',
  'Design & Art',
  'Health & Wellness',
  'Mystery & Thriller',
  'Essays & Ideas',
  'Poetry',
  'Mindfulness',
];

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  viewingUserId,
  onViewUserProfile,
  onBack, 
  onStartTimer,
  onAdjustGoal,
  onOpenAuthModal,
  onViewBookDetails
}) => {
  const { 
    user, 
    isAuthenticated, 
    isGuest,
    signOut, 
    updateUser 
  } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();

  // Determine whether we are viewing someone else or our own profile
  const isViewingOther = Boolean(viewingUserId && viewingUserId !== user?.id);

  // States for viewing another user's profile
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [targetFollowersCount, setTargetFollowersCount] = useState(0);
  const [targetFollowingCount, setTargetFollowingCount] = useState(0);
  const [targetPosts, setTargetPosts] = useState<Post[]>([]);
  const [targetBooks, setTargetBooks] = useState<BookshelfItem[]>([]);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  const [otherActiveTab, setOtherActiveTab] = useState<'quotes' | 'shelf'>('quotes');

  // Own profile view switcher: 'profile' vs 'settings'
  const [accountView, setAccountView] = useState<'profile' | 'settings'>('profile');
  const [isInlineEditingBio, setIsInlineEditingBio] = useState(false);

  // Own profile editable form states
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBookTitle, setEditBookTitle] = useState('');
  const [editBookAuthor, setEditBookAuthor] = useState('');
  const [editBookProgress, setEditBookProgress] = useState<number>(0);
  const [editDailyGoal, setEditDailyGoal] = useState<number>(30);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load target user profile when viewing someone else
  useEffect(() => {
    if (!isViewingOther || !viewingUserId) {
      setTargetUser(null);
      return;
    }

    let mounted = true;
    setIsLoadingTarget(true);

    Promise.all([
      authService.getUserProfile(viewingUserId),
      followService.isFollowing(user?.id, viewingUserId),
      followService.getFollowCounts(viewingUserId),
      bookshelfService.getBookshelf(viewingUserId),
      postsService.getUserPosts(viewingUserId, user?.id),
    ])
      .then(([profile, followingStatus, counts, books, posts]) => {
        if (!mounted) return;
        setTargetUser(profile);
        setIsFollowing(followingStatus);
        setTargetFollowersCount(counts.followersCount);
        setTargetFollowingCount(counts.followingCount);
        setTargetBooks(books);
        setTargetPosts(posts);
      })
      .catch((err) => {
        console.warn('Failed to load profile for user', viewingUserId, err);
      })
      .finally(() => {
        if (mounted) setIsLoadingTarget(false);
      });

    return () => {
      mounted = false;
    };
  }, [viewingUserId, isViewingOther, user?.id]);

  // Initialize own editable fields whenever user profile loads
  useEffect(() => {
    if (user && !isViewingOther) {
      setEditFullName(user.fullName || '');
      setEditUsername(user.username || '');
      setEditBio(user.bio || user.subtitle || '');
      setEditLocation(user.location || '');
      setEditBookTitle(user.currentlyReadingBook || '');
      setEditBookAuthor(user.currentlyReadingAuthor || '');
      setEditBookProgress(user.currentlyReadingProgress ?? 0);
      setEditDailyGoal(user.dailyGoalMinutes || 30);
      setSelectedGenres(user.favoriteGenres && user.favoriteGenres.length > 0 
        ? user.favoriteGenres 
        : []
      );
      setIsPrivateProfile(user.isPrivate === true);
    }
  }, [user, isViewingOther]);

  // Handle follow / unfollow another reader
  const handleToggleFollow = async () => {
    if (!user || isGuest) {
      if (onOpenAuthModal) {
        onOpenAuthModal('signup');
      }
      toast.info('Sign in to follow other readers and see their updates in your feed.', 'Sign In Required');
      return;
    }
    if (!viewingUserId || followLoading) return;

    setFollowLoading(true);
    const willFollow = !isFollowing;

    // Optimistic UI update
    setIsFollowing(willFollow);
    setTargetFollowersCount((prev) => Math.max(0, prev + (willFollow ? 1 : -1)));

    try {
      if (willFollow) {
        await followService.follow(user.id, viewingUserId);
        toast.success(`You are now following @${targetUser?.username || 'reader'}.`, 'Following');
      } else {
        await followService.unfollow(user.id, viewingUserId);
        toast.info(`Unfollowed @${targetUser?.username || 'reader'}.`, 'Unfollowed');
      }
    } catch (err: any) {
      // Revert optimistic state
      setIsFollowing(!willFollow);
      setTargetFollowersCount((prev) => Math.max(0, prev + (willFollow ? -1 : 1)));
      toast.error('Could not update follow status. Please try again.', 'Error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select an image file (PNG, JPG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Please choose an image under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

        updateUser({ avatarUrl: optimizedDataUrl });
        setStatusMessage({ type: 'success', text: 'Profile photo updated successfully!' });
        toast.success('Your new profile avatar is live.', 'Photo Updated');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateUser({ avatarUrl: '' });
    setStatusMessage({ type: 'info', text: 'Profile photo removed. Showing your personalized initial icon.' });
    toast.info('Reverted to dynamic personalized monogram avatar.', 'Avatar Reset');
  };

  const handleToggleGenre = (genre: string) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(next);
    updateUser({ favoriteGenres: next });
  };

  const handleSaveProfileChanges = async () => {
    if (!user) return;
    try {
      await updateUser({
        fullName: editFullName.trim() || user.fullName,
        username: editUsername.trim().replace(/^@/, '') || user.username,
        bio: editBio.trim(),
        subtitle: editBio.trim(),
        location: editLocation.trim(),
        currentlyReadingBook: editBookTitle.trim(),
        currentlyReadingAuthor: editBookAuthor.trim(),
        currentlyReadingProgress: editBookProgress,
        dailyGoalMinutes: editDailyGoal,
        favoriteGenres: selectedGenres,
        isPrivate: isPrivateProfile,
      });
      setIsInlineEditingBio(false);
      setStatusMessage({ type: 'success', text: 'Profile & reading preferences saved!' });
      toast.success('Your social reader profile is updated.', 'Profile Saved');
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (onBack) onBack();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to sign out. Please try again.' });
    }
  };

  // ==============================================================================
  // VIEW 1: VISITING ANOTHER READER'S PUBLIC OR PRIVATE PROFILE
  // ==============================================================================
  if (isViewingOther) {
    if (isLoadingTarget) {
      return (
        <div className="w-full max-w-4xl mx-auto py-20 text-center space-y-3 animate-in fade-in">
          <Loader2 className="w-7 h-7 mx-auto animate-spin text-vibe-accent" />
          <p className="text-xs text-vibe-ink-muted font-medium">Loading reader profile...</p>
        </div>
      );
    }

    if (!targetUser) {
      return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
          <div className="border-b border-vibe-border pb-4">
            {onBack && (
              <button
                onClick={onBack}
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>
          <div className="p-12 rounded-3xl bg-vibe-card border border-vibe-border text-center space-y-3">
            <User className="w-10 h-10 mx-auto text-vibe-ink-muted opacity-40" />
            <h3 className="font-heading font-bold text-base text-vibe-ink">Reader Profile Not Found</h3>
            <p className="text-xs text-vibe-ink-muted">This user profile may have been removed or is unavailable.</p>
          </div>
        </div>
      );
    }

    const isPrivate = targetUser.isPrivate === true;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-vibe-border pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:border-vibe-accent/40 transition-colors group shadow-soft cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}

            <div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-vibe-ink leading-tight truncate">
                {targetUser.fullName || targetUser.username}
              </h1>
              <p className="text-[11px] text-vibe-ink-muted">
                {isPrivate ? 'Private Reader Profile' : 'Public Reader Profile'}
              </p>
            </div>
          </div>

          {/* Follow / Unfollow Action Button */}
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={followLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer ${
              isFollowing
                ? 'bg-vibe-card-subtle border border-vibe-border text-vibe-ink hover:border-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10'
                : 'bg-vibe-accent hover:bg-vibe-accent-hover text-white'
            }`}
          >
            {followLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>

        {/* Reader Profile Hero Banner Card */}
        <div className="rounded-3xl border border-vibe-border bg-vibe-card shadow-soft overflow-hidden">
          {/* Header Strip */}
          <div className="h-20 sm:h-24 w-full bg-vibe-card-subtle relative p-4 flex items-center justify-between border-b border-vibe-border">
            <span className="text-[11px] font-mono uppercase tracking-widest text-vibe-ink-muted font-medium">
              ✦ {targetUser.rankTier || 'Reader'}
            </span>
            <span className="text-[11px] font-mono text-vibe-ink-muted">
              {targetUser.joinedDate || 'Member since 2026'}
            </span>
          </div>

          <div className="p-5 sm:p-7 -mt-10 space-y-5">
            {/* Avatar & Identification */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <img
                  src={getUserAvatar(targetUser)}
                  alt={targetUser.fullName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-vibe-card flex-shrink-0 bg-vibe-card shadow-md"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-vibe-ink truncate">
                      {targetUser.fullName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-vibe-accent/10 text-vibe-accent border border-vibe-accent/20 flex-shrink-0">
                      {targetUser.rankTier || 'Reader'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-vibe-ink-muted truncate mt-0.5">
                    @{targetUser.username}
                  </p>
                  {targetUser.location && (
                    <p className="text-xs text-vibe-ink-secondary flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-vibe-ink-muted" />
                      <span>{targetUser.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Follower and Following Real Counts */}
              <div className="flex items-center gap-4 bg-vibe-card-subtle px-4 py-2 rounded-2xl border border-vibe-border text-xs self-start sm:self-auto">
                <div className="text-center">
                  <span className="font-mono font-bold text-base text-vibe-ink block">
                    {targetFollowersCount}
                  </span>
                  <span className="text-[10px] font-medium text-vibe-ink-muted uppercase tracking-wider">
                    Followers
                  </span>
                </div>
                <div className="w-px h-6 bg-vibe-border" />
                <div className="text-center">
                  <span className="font-mono font-bold text-base text-vibe-ink block">
                    {targetFollowingCount}
                  </span>
                  <span className="text-[10px] font-medium text-vibe-ink-muted uppercase tracking-wider">
                    Following
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {targetUser.bio || targetUser.subtitle ? (
              <div className="pt-3 border-t border-vibe-border/60">
                <p className="text-sm text-vibe-ink-secondary leading-relaxed font-sans italic">
                  “{targetUser.bio || targetUser.subtitle}”
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* CASE A: PROFILE IS PRIVATE */}
        {isPrivate ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-vibe-card border border-vibe-border shadow-soft text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-heading text-base sm:text-lg font-bold text-vibe-ink">
                This Reader's Profile is Private
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-muted leading-relaxed">
                @{targetUser.username} keeps their bookshelf, reading activity, and statistics private. Follow them to connect in the community.
              </p>
            </div>
          </div>
        ) : (
          /* CASE B: PROFILE IS PUBLIC (DEFAULT) */
          <div className="space-y-6">

            {/* Reader Habit Progress Strip */}
            <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Bookshelf</span>
                </div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-vibe-ink">
                  {targetUser.bookshelfCount ?? targetBooks.length}
                </span>
                <span className="block text-[11px] text-vibe-ink-muted mt-1">books</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1.5">
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Streak</span>
                </div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-vibe-ink">
                  {targetUser.currentStreak ?? 0}
                </span>
                <span className="block text-[11px] text-vibe-ink-muted mt-1">days</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center">
                <div className="flex items-center justify-center gap-1.5 text-sky-500 mb-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Focus Time</span>
                </div>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-vibe-ink">
                  {targetUser.totalMinutesRead ?? 0}
                </span>
                <span className="block text-[11px] text-vibe-ink-muted mt-1">mins</span>
              </div>
            </div>

            {/* Currently Reading Book (If public & set) */}
            {targetUser.currentlyReadingBook && (
              <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft space-y-3">
                <div className="flex items-center justify-between text-xs font-heading font-semibold text-vibe-ink">
                  <div className="flex items-center gap-2 text-vibe-accent">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-bold">Currently Reading</span>
                  </div>
                  {typeof targetUser.currentlyReadingProgress === 'number' && targetUser.currentlyReadingProgress > 0 && (
                    <span className="font-mono text-xs font-bold text-vibe-accent">
                      {targetUser.currentlyReadingProgress}% Complete
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-base text-vibe-ink truncate">{targetUser.currentlyReadingBook}</h4>
                    {targetUser.currentlyReadingAuthor && (
                      <p className="text-xs text-vibe-ink-muted truncate mt-0.5">{targetUser.currentlyReadingAuthor}</p>
                    )}
                  </div>
                  {onViewBookDetails && (
                    <button
                      type="button"
                      onClick={() => onViewBookDetails(targetUser.currentlyReadingBook!, targetUser.currentlyReadingAuthor || '')}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-vibe-card-subtle border border-vibe-border hover:bg-vibe-card text-vibe-ink transition-colors shrink-0 cursor-pointer"
                    >
                      View Book
                    </button>
                  )}
                </div>

                {typeof targetUser.currentlyReadingProgress === 'number' && targetUser.currentlyReadingProgress > 0 && (
                  <div className="w-full h-2 rounded-full bg-vibe-card-subtle border border-vibe-border overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-vibe-accent rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, targetUser.currentlyReadingProgress)}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Favorite Genres Chips (If set) */}
            {targetUser.favoriteGenres && targetUser.favoriteGenres.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft space-y-3">
                <h4 className="text-sm font-heading font-bold text-vibe-ink">Favorite Genres & Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {targetUser.favoriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-vibe-card-subtle border border-vibe-border text-vibe-ink-secondary"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tabs: Shared Passages vs Bookshelf */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-vibe-border pb-3">
                <button
                  type="button"
                  onClick={() => setOtherActiveTab('quotes')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    otherActiveTab === 'quotes'
                      ? 'bg-vibe-accent text-white font-semibold shadow-xs'
                      : 'text-vibe-ink-muted hover:text-vibe-ink'
                  }`}
                >
                  Shared Quotes ({targetPosts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setOtherActiveTab('shelf')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    otherActiveTab === 'shelf'
                      ? 'bg-vibe-accent text-white font-semibold shadow-xs'
                      : 'text-vibe-ink-muted hover:text-vibe-ink'
                  }`}
                >
                  Bookshelf ({targetBooks.length})
                </button>
              </div>

              {/* TAB 1: Shared Quotes */}
              {otherActiveTab === 'quotes' && (
                <div className="space-y-4">
                  {targetPosts.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-vibe-card border border-vibe-border text-center text-xs text-vibe-ink-muted">
                      @{targetUser.username} has not shared any reading quotes or reflections yet.
                    </div>
                  ) : (
                    targetPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onSelectBookForTimer={(title, author, cover) =>
                          onStartTimer?.({ title, author, coverImageUrl: cover })
                        }
                        onViewBookDetails={onViewBookDetails}
                        onViewUserProfile={onViewUserProfile}
                      />
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: Bookshelf */}
              {otherActiveTab === 'shelf' && (
                <div className="space-y-4">
                  {targetBooks.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-vibe-card border border-vibe-border text-center text-xs text-vibe-ink-muted">
                      No books currently on this bookshelf.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {targetBooks.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft flex gap-3.5 items-start hover:border-vibe-accent/40 transition-colors"
                        >
                          {item.coverImageUrl ? (
                            <img
                              src={item.coverImageUrl}
                              alt={item.title}
                              className="w-14 h-20 rounded-lg object-cover flex-shrink-0 shadow-xs border border-vibe-border"
                            />
                          ) : (
                            <div className="w-14 h-20 rounded-lg bg-vibe-card-subtle flex items-center justify-center flex-shrink-0 border border-vibe-border text-vibe-ink-muted">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className={`inline-block text-[9.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'finished'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : item.status === 'currently_reading'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                : 'bg-vibe-card-subtle text-vibe-ink-muted border border-vibe-border'
                            }`}>
                              {item.status === 'finished' ? 'Finished' : item.status === 'currently_reading' ? 'Reading' : 'Want to Read'}
                            </span>
                            <h5 className="font-heading font-bold text-xs sm:text-sm text-vibe-ink truncate">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-vibe-ink-muted truncate">
                              {item.author}
                            </p>
                            {item.rating && (
                              <div className="flex items-center gap-1 text-amber-500 text-[10px] pt-0.5">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="font-mono font-bold">{item.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    );
  }

  // ==============================================================================
  // VIEW 2: AUTHENTICATED USER'S OWN SOCIAL PROFILE & SETTINGS
  // ==============================================================================
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Page Header with Back button and Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-vibe-border pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:border-vibe-border transition-colors group shadow-soft cursor-pointer"
              aria-label="Back to feed"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-vibe-accent/15 text-vibe-accent flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-heading text-lg sm:text-xl font-bold text-vibe-ink leading-tight truncate">
                {isGuest ? 'Guest Explorer' : 'Reader Profile & Settings'}
              </h1>
              <p className="text-[11px] text-vibe-ink-muted">
                {isGuest ? 'Browsing mode with local storage' : 'Manage your reading identity and preferences'}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher: Profile vs Settings */}
        {isAuthenticated && !isGuest && (
          <div className="flex items-center gap-1 p-1 rounded-full bg-vibe-card border border-vibe-border text-xs shadow-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAccountView('profile')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                accountView === 'profile'
                  ? 'bg-vibe-accent text-white font-semibold shadow-xs'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setAccountView('settings')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                accountView === 'settings'
                  ? 'bg-vibe-accent text-white font-semibold shadow-xs'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Message Banner */}
      {statusMessage && (
        <div 
          className={`p-3.5 rounded-2xl text-xs flex flex-col gap-2 border shadow-soft ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
          }`}
        >
          <div className="flex items-start gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug flex-1">{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* AUTHENTICATED USER'S OWN PROFILE */}
      {isAuthenticated && !isGuest && user && (
        <div className="space-y-6">
          
          {/* SUB-VIEW A: SOCIAL READER PROFILE */}
          {accountView === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Visual Profile Hero Banner Card */}
              <div className="rounded-3xl border border-vibe-border bg-vibe-card shadow-soft overflow-hidden">
                {/* Decorative Archival Header Pattern */}
                <div className="h-20 sm:h-24 w-full bg-vibe-card-subtle relative p-4 flex items-center justify-between border-b border-vibe-border">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-vibe-ink-muted font-medium">
                    ✦ {user.rankTier || 'Reader'} Member
                  </span>
                  <span className="text-[11px] font-mono text-vibe-ink-muted">
                    {user.joinedDate || 'Member since 2026'}
                  </span>
                </div>

                <div className="p-5 sm:p-7 -mt-10 space-y-5">
                  {/* Avatar, Identity and Photo actions */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-end gap-4">
                      <div className="relative group flex-shrink-0">
                        <img
                          src={getUserAvatar(user)}
                          alt={user.fullName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-vibe-card flex-shrink-0 bg-vibe-card shadow-md"
                        />
                        <label
                          htmlFor="page-avatar-file-input"
                          className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity"
                          title="Upload profile photo"
                        >
                          <Camera className="w-5 h-5" />
                          <span className="text-[9px] font-semibold mt-0.5">Edit</span>
                        </label>
                        <input
                          id="page-avatar-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-vibe-ink truncate">
                            {user.fullName}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-vibe-accent/10 text-vibe-accent border border-vibe-accent/20 flex-shrink-0">
                            {user.rankTier || 'Novice'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-vibe-ink-muted truncate mt-0.5">
                          @{user.username}
                        </p>
                        {user.location && (
                          <p className="text-xs text-vibe-ink-secondary flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-vibe-ink-muted" />
                            <span>{user.location}</span>
                          </p>
                        )}
                        
                        {/* Real Followers & Following Counts for Own Profile */}
                        <div className="flex items-center gap-3 text-xs font-medium text-vibe-ink pt-1.5">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-sm text-vibe-ink">{user.followersCount ?? 0}</span>
                            <span className="text-vibe-ink-muted text-[11px]">Followers</span>
                          </div>
                          <span className="text-vibe-border">·</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-sm text-vibe-ink">{user.followingCount ?? 0}</span>
                            <span className="text-vibe-ink-muted text-[11px]">Following</span>
                          </div>
                          {user.isPrivate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Private</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick edit photo buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <label
                        htmlFor="page-avatar-file-input"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-vibe-card border border-vibe-border hover:bg-vibe-card-subtle text-vibe-ink transition-colors cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-vibe-accent" />
                        <span>{isCustomAvatar(user.avatarUrl) ? 'Change Photo' : 'Upload Photo'}</span>
                      </label>

                      {isCustomAvatar(user.avatarUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="p-1.5 rounded-full border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove custom photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="pt-3 border-t border-vibe-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-heading font-semibold text-vibe-ink">
                      <span>Reader Bio</span>
                      <button
                        type="button"
                        onClick={() => setIsInlineEditingBio(!isInlineEditingBio)}
                        className="text-xs font-sans font-medium text-vibe-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isInlineEditingBio ? 'Cancel' : 'Edit Bio'}</span>
                      </button>
                    </div>

                    {isInlineEditingBio ? (
                      <div className="space-y-2">
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value.slice(0, 240))}
                          rows={3}
                          className="w-full text-xs sm:text-sm p-3 rounded-xl bg-vibe-card border border-vibe-border text-vibe-ink focus:ring-1 focus:ring-vibe-accent focus:outline-hidden resize-none leading-relaxed"
                          placeholder="Write a few lines about what you love to read, favorite authors, or your reading routine..."
                        />
                        <div className="flex items-center justify-between text-xs text-vibe-ink-muted">
                          <span>{editBio.length} / 240 characters</span>
                          <button
                            type="button"
                            onClick={handleSaveProfileChanges}
                            className="px-4 py-1.5 rounded-full bg-vibe-accent text-white font-semibold text-xs hover:bg-vibe-accent-hover transition-colors shadow-xs cursor-pointer"
                          >
                            Save Bio
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-vibe-ink-secondary leading-relaxed font-sans italic">
                        {user.bio || user.subtitle ? `“${user.bio || user.subtitle}”` : 'No bio added yet.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reader Activity & Habit Progress Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1.5 text-vibe-accent mb-2">
                    <Bookmark className="w-4 h-4" />
                    <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Saved</span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-vibe-ink">
                    {user.savedPassagesCount ?? 0}
                  </span>
                  <span className="block text-xs text-vibe-ink-muted mt-1">passages</span>
                </div>

                <div className="p-3 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1.5">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[10px] xs:text-[11px] font-mono uppercase font-bold tracking-wider">Streak</span>
                  </div>
                  <span className="font-mono text-xl sm:text-3xl font-bold text-vibe-ink">
                    {user.currentStreak ?? 0}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-vibe-ink-muted mt-0.5 sm:mt-1">days</span>
                </div>

                <div className="p-3 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[10px] xs:text-[11px] font-mono uppercase font-bold tracking-wider">Shelf</span>
                  </div>
                  <span className="font-mono text-xl sm:text-3xl font-bold text-vibe-ink">
                    {user.bookshelfCount ?? 0}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-vibe-ink-muted mt-0.5 sm:mt-1">books</span>
                </div>

                <div className="p-3 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-sky-500 mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] xs:text-[11px] font-mono uppercase font-bold tracking-wider">Time</span>
                  </div>
                  <span className="font-mono text-xl sm:text-3xl font-bold text-vibe-ink">
                    {user.totalMinutesRead ?? 0}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-vibe-ink-muted mt-0.5 sm:mt-1">mins</span>
                </div>
              </div>

              {/* Currently Reading Book Card */}
              {editBookTitle ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft space-y-3">
                  <div className="flex items-center justify-between text-xs font-heading font-semibold text-vibe-ink">
                    <div className="flex items-center gap-2 text-vibe-accent">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-bold">Currently Reading</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-vibe-accent">
                      {editBookProgress}% Complete
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-base text-vibe-ink truncate">{editBookTitle}</h4>
                      {editBookAuthor && <p className="text-xs text-vibe-ink-muted truncate mt-0.5">{editBookAuthor}</p>}
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {onStartTimer && (
                        <button
                          type="button"
                          onClick={() => onStartTimer({ title: editBookTitle, author: editBookAuthor })}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-vibe-accent/10 text-vibe-accent hover:bg-vibe-accent/20 transition-colors"
                        >
                          Read Now
                        </button>
                      )}
                      <span className="text-xs font-mono text-vibe-ink-muted">
                        Goal: {user.dailyGoalMinutes || 30}m / day
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-vibe-card-subtle border border-vibe-border overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-vibe-accent rounded-full transition-all duration-500"
                      style={{ width: `${editBookProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-vibe-ink">No book currently selected</h4>
                    <p className="text-xs text-vibe-ink-muted mt-0.5">Add a book from search or bookshelf to track reading progress.</p>
                  </div>
                  {onStartTimer && (
                    <button
                      type="button"
                      onClick={() => onStartTimer({ title: 'Focus Session', author: '' })}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-colors shrink-0"
                    >
                      Start Reading
                    </button>
                  )}
                </div>
              )}

              {/* Favorite Genres & Reading Taste Chips */}
              <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft space-y-3">
                <div className="flex items-center justify-between text-xs font-heading font-semibold text-vibe-ink">
                  <span className="text-sm font-bold">Favorite Genres</span>
                  <span className="text-xs font-mono text-vibe-ink-muted">Tap to toggle</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleToggleGenre(genre)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-vibe-accent text-white shadow-xs font-semibold'
                            : 'bg-vibe-card-subtle text-vibe-ink-secondary border border-vibe-border hover:bg-vibe-card hover:text-vibe-ink'
                        }`}
                      >
                        <span>{genre}</span>
                        {isSelected && <span className="ml-1 text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* SUB-VIEW B: SETTINGS, HABIT GOALS & PREFERENCES */}
          {accountView === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Daily Reading Goal Preference */}
              <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-vibe-accent" />
                    <h4 className="font-heading font-bold text-sm sm:text-base text-vibe-ink">
                      Daily Reading Target
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-vibe-accent">
                    {editDailyGoal} min / day
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[15, 25, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setEditDailyGoal(mins);
                        updateUser({ dailyGoalMinutes: mins });
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                        editDailyGoal === mins
                          ? 'bg-vibe-accent text-white font-bold shadow-xs'
                          : 'bg-vibe-card-subtle border border-vibe-border text-vibe-ink hover:border-vibe-accent'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Metadata Inputs */}
              <div className="space-y-4 p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-vibe-ink">
                  Public Identity Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-vibe-ink-muted">Display Name</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:ring-1 focus:ring-vibe-accent focus:outline-hidden"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-vibe-ink-muted">Username Handle</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:ring-1 focus:ring-vibe-accent focus:outline-hidden"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-vibe-ink-muted">Reading Nook / Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:ring-1 focus:ring-vibe-accent focus:outline-hidden"
                    placeholder="e.g. Quiet Home Library, Kyoto"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-vibe-ink-muted">Currently Reading Title</label>
                    <input
                      type="text"
                      value={editBookTitle}
                      onChange={(e) => setEditBookTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:ring-1 focus:ring-vibe-accent focus:outline-hidden"
                      placeholder="Book Title"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-vibe-ink-muted">Author</label>
                    <input
                      type="text"
                      value={editBookAuthor}
                      onChange={(e) => setEditBookAuthor(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:ring-1 focus:ring-vibe-accent focus:outline-hidden"
                      placeholder="Author Name"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfileChanges}
                  className="w-full py-2.5 rounded-xl bg-vibe-accent text-white font-semibold text-xs hover:bg-vibe-accent-hover transition-colors shadow-xs cursor-pointer"
                >
                  Save Profile Updates
                </button>
              </div>

              {/* Preferences & Privacy Settings */}
              <div className="p-5 sm:p-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft space-y-4">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-vibe-ink">
                  Preferences & Privacy
                </h4>

                {/* Quick Theme Switcher */}
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-vibe-ink">Appearance Mode</p>
                    <p className="text-[11px] text-vibe-ink-muted">Switch between light and dark mode</p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-vibe-border bg-vibe-card-subtle text-xs font-medium text-vibe-ink hover:border-vibe-accent transition-colors cursor-pointer"
                  >
                    {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                    <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                </div>

                {/* Profile Privacy Toggle (Public default vs Private) */}
                <div className="flex items-center justify-between pt-3 border-t border-vibe-border/60">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-vibe-accent" />
                      <p className="text-xs font-semibold text-vibe-ink">Private Reading Profile</p>
                    </div>
                    <p className="text-[11px] text-vibe-ink-muted leading-relaxed">
                      When enabled, your bookshelf, currently reading book, and reading stats are hidden from other visitors. Your bio remains public and readers can still follow you.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={isPrivateProfile}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setIsPrivateProfile(val);
                      updateUser({ isPrivate: val });
                      toast.info(
                        val ? 'Your reading shelf and stats are now private.' : 'Your reading shelf and stats are now public.',
                        val ? 'Profile Made Private' : 'Profile Made Public'
                      );
                    }}
                    className="w-4 h-4 accent-vibe-accent cursor-pointer flex-shrink-0"
                  />
                </div>
              </div>

              {/* Danger Zone: Sign Out Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* VIEW 3: GUEST ACCOUNT VIEW */}
      {isGuest && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Guest Explorer Card */}
          <div className="p-6 rounded-3xl bg-vibe-card border border-vibe-border shadow-soft space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={getUserAvatar(null)}
                alt="Guest"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-vibe-border flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-vibe-ink truncate">Guest Explorer</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Guest Mode
                  </span>
                </div>
                <p className="text-xs text-vibe-ink-muted truncate mt-0.5">Read-only browsing session</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
              Your reading timer history, custom ambience, and shelf items are stored locally in this browser. Create an account to permanently sync your reading progress and unlock community features.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuthModal?.('signup')}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuthModal?.('signin')}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-vibe-border text-vibe-ink hover:bg-vibe-card-subtle text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Existing Account</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
