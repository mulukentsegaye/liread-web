import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { leaderboardService } from '../../services/leaderboardService';
import { useAuthStore } from '../../stores/authStore';
import { LeaderboardEntry } from '../../types';

interface LeaderboardViewProps {
  onBack?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'lifetime'>('weekly');
  const [remoteList, setRemoteList] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isGuest } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    leaderboardService
      .getLeaderboard(filter, user?.id)
      .then((data) => {
        if (isMounted) setRemoteList(data || []);
      })
      .catch((err) => {
        console.warn('Leaderboard fetch error:', err);
        if (isMounted) setRemoteList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [filter, user?.id]);

  const currentList = remoteList;
  const userStanding = remoteList.find((e) => e.userId === user?.id) || null;

  const podium = currentList.slice(0, 3);

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in">

      <div className="space-y-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:border-vibe-border transition-colors group shadow-soft"
            aria-label="Back to feed"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Feed</span>
          </button>
        )}

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
              <span className="font-sans text-[10.5px] font-medium tracking-wider uppercase text-vibe-ink-muted/80">
                Community Rankings
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-vibe-ink leading-tight">
              Readers Leaderboard
            </h1>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full border border-vibe-border bg-vibe-card-subtle">
            {(['daily', 'weekly', 'lifetime'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all active:scale-95 ${
                  filter === tab
                    ? 'bg-vibe-card text-vibe-accent font-medium shadow-xs border border-vibe-border'
                    : 'text-vibe-ink-muted hover:text-vibe-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isGuest && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 text-center">
          Guest browsing — leaderboard reflects real readers. Create an account to appear on the board.
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-sm text-vibe-ink-muted">Loading leaderboard…</div>
      ) : currentList.length === 0 ? (
        <div className="rounded-3xl border border-vibe-border bg-vibe-card p-12 text-center space-y-3 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-vibe-ink">No readers yet</h3>
          <p className="text-sm text-vibe-ink-muted max-w-md mx-auto">
            The leaderboard appears once real users log reading sessions. Start a timer and be the first on the board.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-2">
            {podium[1] && (
              <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between shadow-soft order-1">
                <div className="w-6 h-6 rounded-full bg-slate-500/15 text-slate-500 font-bold text-xs flex items-center justify-center mb-2 font-mono">2</div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-heading font-bold flex items-center justify-center text-sm sm:text-base my-2 border-2 border-vibe-border bg-vibe-card-subtle text-vibe-ink shadow-xs">{podium[1].initials}</div>
                <p className="text-xs sm:text-sm font-semibold truncate w-full text-vibe-ink mt-1">{podium[1].fullName}</p>
                <span className="font-mono text-xs text-vibe-ink-muted mt-0.5 truncate w-full">{podium[1].formattedTime}</span>
              </div>
            )}
            {podium[0] && (
              <div className="bg-vibe-card border-2 border-vibe-accent rounded-2xl p-4 sm:p-6 text-center flex flex-col items-center justify-between shadow-float order-2 relative -translate-y-2 sm:-translate-y-3">
                <div className="absolute -top-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-md bg-amber-500 text-white"><Trophy className="w-4 h-4 fill-current" /></div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full font-heading font-bold flex items-center justify-center text-base sm:text-lg mt-3 mb-2 shadow-sm bg-vibe-accent text-white ring-4 ring-vibe-accent/20">{podium[0].initials}</div>
                <p className="text-xs sm:text-sm font-bold truncate w-full text-vibe-ink mt-1">{podium[0].fullName}</p>
                <span className="font-mono text-xs sm:text-sm font-bold text-vibe-accent mt-0.5 truncate w-full">{podium[0].formattedTime}</span>
                <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-amber-500 mt-1">1st Place</span>
              </div>
            )}
            {podium[2] && (
              <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between shadow-soft order-3">
                <div className="w-6 h-6 rounded-full bg-amber-700/15 text-amber-700 font-bold text-xs flex items-center justify-center mb-2 font-mono">3</div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-heading font-bold flex items-center justify-center text-sm sm:text-base my-2 border-2 border-vibe-border bg-vibe-card-subtle text-vibe-ink shadow-xs">{podium[2].initials}</div>
                <p className="text-xs sm:text-sm font-semibold truncate w-full text-vibe-ink mt-1">{podium[2].fullName}</p>
                <span className="font-mono text-xs text-vibe-ink-muted mt-0.5 truncate w-full">{podium[2].formattedTime}</span>
              </div>
            )}
            {podium.length === 1 && <div className="hidden sm:block order-1" />}
            {podium.length === 1 && <div className="hidden sm:block order-3" />}
          </div>

          <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-3">
            <div className="flex items-center justify-between px-3 pb-2 border-b border-vibe-border-subtle text-xs font-semibold uppercase tracking-wider text-vibe-ink-muted">
              <span>Rank & Reader</span>
              <span>Time Logged</span>
            </div>
            <div className="divide-y divide-vibe-border-subtle">
              {currentList.map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors hover:bg-vibe-card-subtle group">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className={`font-mono w-6 text-center text-xs sm:text-sm font-bold flex-shrink-0 ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-amber-700' : 'text-vibe-ink-muted'}`}>{entry.rank}</span>
                    <div className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-vibe-border bg-vibe-card-subtle text-vibe-ink group-hover:border-vibe-accent/40 transition-colors">{entry.initials}</div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-xs text-vibe-ink group-hover:text-vibe-accent transition-colors">{entry.fullName}</p>
                      <p className="text-[11px] truncate text-vibe-ink-muted">@{entry.username}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-3">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-vibe-ink tabular-nums">{entry.formattedTime}</span>
                  </div>
                </div>
              ))}
            </div>

            {userStanding && (
              <div className="mt-4 pt-3 border-t border-vibe-border-subtle">
                <div className="bg-vibe-accent-subtle/80 border border-vibe-accent/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="font-mono w-6 text-center text-xs sm:text-sm font-bold flex-shrink-0 text-vibe-accent">#{userStanding.rank}</span>
                    <div className="w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 bg-vibe-accent text-white shadow-xs">{userStanding.initials}</div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate text-vibe-ink">{userStanding.fullName} <span className="text-[11px] font-normal text-vibe-accent">(You)</span></p>
                      <p className="text-[11px] truncate text-vibe-ink-muted">@{user?.username || 'you'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-3">
                    <span className="font-mono text-xs sm:text-sm font-bold text-vibe-accent tabular-nums">{userStanding.formattedTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
