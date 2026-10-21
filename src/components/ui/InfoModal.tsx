import React, { useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Timer, 
  BookOpen, 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Heart,
  Lock
} from 'lucide-react';
import { useNoticeStore } from '../../stores/noticeStore';

export const InfoModal: React.FC = () => {
  const { infoModal, closeInfoModal } = useNoticeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && infoModal?.isOpen) {
        closeInfoModal();
      }
    };
    if (infoModal?.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [infoModal, closeInfoModal]);

  if (!infoModal?.isOpen) return null;

  const isHelp = infoModal.type === 'help';
  const isTerms = infoModal.type === 'terms';
  const isPrivacy = infoModal.type === 'privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={closeInfoModal}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-vibe-card border border-vibe-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col transition-all duration-300 celebration-toast-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-vibe-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vibe-accent/15 text-vibe-accent flex items-center justify-center flex-shrink-0">
              {isHelp && <HelpCircle className="w-5 h-5" />}
              {isTerms && <FileText className="w-5 h-5" />}
              {isPrivacy && <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3
                id="info-modal-title"
                className="font-heading text-lg sm:text-xl font-bold text-vibe-ink tracking-tight"
              >
                {isHelp && 'Help & Community Guide'}
                {isTerms && 'Terms of Service'}
                {isPrivacy && 'Privacy Policy'}
              </h3>
              <p className="text-xs text-vibe-ink-muted">
                {isHelp && 'Everything you need to know to cultivate your reading habit'}
                {isTerms && 'Our simple, respectful community standards'}
                {isPrivacy && 'How your reading notes and data remain yours'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeInfoModal}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-vibe-ink-secondary leading-relaxed">
          {/* Help & Community Content */}
          {isHelp && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Timer className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-vibe-ink text-sm">Focus Reading Timer</h4>
                  <p className="text-xs text-vibe-ink-secondary mt-1">
                    Track intentional reading minutes with peaceful background ambient soundscapes (rain, crackling hearth, coffee shop). Every completed session logs toward your daily goal.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-vibe-ink text-sm">Passages & Quotes Feed</h4>
                  <p className="text-xs text-vibe-ink-secondary mt-1">
                    Share captivating book excerpts, personal reflections, and recommendations. Upvote quotes that inspire you and save gems to your personal shelf.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trophy className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-vibe-ink text-sm">Weekly Leaderboards</h4>
                  <p className="text-xs text-vibe-ink-secondary mt-1">
                    Friendly accountability with fellow bibliophiles. Track total minutes read each week and celebrate milestones together.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Flame className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-vibe-ink text-sm">Daily Habit Streaks</h4>
                  <p className="text-xs text-vibe-ink-secondary mt-1">
                    Consistency is everything. Read every day to build a streak that reinforces a lifetime reading ritual.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Terms of Service Content */}
          {isTerms && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-vibe-ink flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-500" />
                  1. Respectful & Thoughtful Community
                </h4>
                <p className="text-xs text-vibe-ink-secondary">
                  Readers Hub is a peaceful sanctuary for book lovers. We expect all members to treat fellow readers with kindness, constructive engagement, and open-minded appreciation for diverse perspectives.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-vibe-ink flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  2. Honest Reading Logs
                </h4>
                <p className="text-xs text-vibe-ink-secondary">
                  Reading sessions and leaderboard minutes should reflect genuine reading time. The community spirit thrives when everyone logs time sincerely.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-vibe-ink flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  3. Quoting & Fair Use
                </h4>
                <p className="text-xs text-vibe-ink-secondary">
                  When sharing passages and quotes from books, attribute the original author and title. Readers Hub honors the creative works of authors around the world.
                </p>
              </div>
            </div>
          )}

          {/* Privacy Policy Content */}
          {isPrivacy && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-vibe-ink flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  1. Your Data Belongs to You
                </h4>
                <p className="text-xs text-vibe-ink-secondary">
                  Your reading history, personal notes, and bookmarks are yours. We do not sell or monetize personal reading logs or profile information to third parties.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-vibe-ink flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  2. Secure Storage & Privacy
                </h4>
                <p className="text-xs text-vibe-ink-secondary">
                  All account details and sessions are protected with industry-standard encryption and Supabase row-level security policies.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-vibe-ink flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  3. Guest Browsing
                </h4>
                <p className="text-xs text-vibe-ink-secondary">
                  Guest mode allows you to freely explore the public catalog and community feed with zero tracking cookies or forced registration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-vibe-border bg-vibe-card-subtle/50 flex justify-end">
          <button
            type="button"
            onClick={closeInfoModal}
            className="px-5 py-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-sm font-semibold shadow-sm transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
