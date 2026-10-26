import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Clock, Brain, Bookmark } from 'lucide-react';
import { ScrollRevealCard } from './ScrollRevealCard';

interface ReadingImpactCalculatorProps {
  onStartHabit?: () => void;
  onContinueGuest?: () => void;
}

// Lightweight springy ease-out interpolator for real-time counters
function useAnimatedNumber(target: number, decimals: number = 0, duration: number = 300): string {
  const [current, setCurrent] = useState<number>(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = current;
    const endVal = target;
    const startTime = performance.now();

    if (startVal === endVal) return;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + (endVal - startVal) * easeOut;

      setCurrent(nextVal);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(endVal);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return decimals === 0 ? Math.round(current).toString() : current.toFixed(decimals);
}

export const ReadingImpactCalculator: React.FC<ReadingImpactCalculatorProps> = () => {
  const [minutes, setMinutes] = useState<number>(15);

  // Benchmarked Formulas: 15 min/day = 18 books, 109 hours, 3.2M words
  const targetBooks = Math.round(minutes * 1.2);
  const targetHours = Math.round((minutes / 15) * 109);
  const targetWords = (minutes / 15) * 3.2;

  // Animated smooth counter displays
  const animatedBooks = useAnimatedNumber(targetBooks, 0);
  const animatedHours = useAnimatedNumber(targetHours, 0);
  const animatedWords = useAnimatedNumber(targetWords, 1);

  // Dynamic compounding insights based on minutes
  const getMilestoneInsight = (mins: number) => {
    if (mins <= 15) {
      return {
        quote: "Finishing ~18 books a year — equivalent to 'Atomic Habits', 'Meditations', and 'The Great Gatsby' every month.",
        tag: "Consistent Habit",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20"
      };
    } else if (mins <= 25) {
      return {
        quote: "Over 180 hours of deep contemplation — more wisdom absorbed than 90% of adults experience in 5 years.",
        tag: "Focused Reader",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/20"
      };
    } else if (mins <= 45) {
      return {
        quote: "Equivalent to reading the entire Western literary canon or 3 master's degree book lists.",
        tag: "Deep Cultivator",
        color: "text-sky-600 dark:text-sky-400",
        bg: "bg-sky-500/10 border-sky-500/20"
      };
    } else {
      return {
        quote: "Absorbing over 70 masterworks and 12 million words of human wisdom every single year.",
        tag: "Literary Polymath",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/20"
      };
    }
  };

  const milestone = getMilestoneInsight(minutes);

  const presets = [10, 15, 25, 45, 60];

  return (
    <section id="calculator" className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-vibe-border relative">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-1.5 max-w-xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-display font-normal text-vibe-ink tracking-tight">
            Small daily pages. <span className="italic text-vibe-accent">Massive compounding wisdom.</span>
          </h2>
          <p className="text-xs sm:text-sm text-vibe-ink-secondary">
            See the annual impact of a calm, distraction-free reading habit.
          </p>
        </div>

        {/* Main Interactive Calculator Card */}
        <ScrollRevealCard delayMs={40}>
          <div className="rounded-2xl sm:rounded-3xl bg-vibe-card border border-vibe-border shadow-sm p-4 sm:p-6 space-y-5 backdrop-blur-sm">
            
            {/* Unified Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-vibe-border">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-vibe-ink-muted uppercase tracking-wider">Daily Reading:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-vibe-accent text-white font-mono text-xs font-bold shadow-xs">
                  <Clock className="w-3 h-3" />
                  {minutes} min / day
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${milestone.bg} ${milestone.color}`}>
                  ✦ {milestone.tag}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                {presets.map((val) => {
                  const isActive = minutes === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMinutes(val)}
                      className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all border cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-vibe-accent text-white border-vibe-accent font-bold shadow-xs'
                          : 'bg-vibe-card-subtle text-vibe-ink-secondary border-vibe-border hover:text-vibe-ink hover:bg-vibe-border/40'
                      }`}
                    >
                      {val}m
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range Slider */}
            <div>
              <input
                id="reading-minutes-slider"
                type="range"
                min="10"
                max="60"
                step="1"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-vibe-accent cursor-pointer h-2 bg-vibe-card-subtle rounded-lg border border-vibe-border transition-all"
                aria-label="Daily reading minutes target"
              />
            </div>

            {/* Minimalist Metrics: 3-column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Metric 1: Books */}
              <div className="rounded-xl p-4 bg-vibe-card-subtle border border-vibe-border flex items-center sm:flex-col sm:items-start justify-between sm:justify-start gap-2.5">
                <div className="flex items-center gap-2.5 sm:w-full">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-vibe-ink-muted sm:hidden">Books / year</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-vibe-ink tracking-tight flex items-baseline gap-1">
                    <span>{animatedBooks}</span>
                    <span className="text-xs font-sans font-medium text-vibe-ink-muted">books</span>
                  </div>
                  <div className="hidden sm:block text-[11px] font-medium text-vibe-ink-muted mt-0.5">
                    Completed masterworks / yr
                  </div>
                </div>
              </div>

              {/* Metric 2: Hours */}
              <div className="rounded-xl p-4 bg-vibe-card-subtle border border-vibe-border flex items-center sm:flex-col sm:items-start justify-between sm:justify-start gap-2.5">
                <div className="flex items-center gap-2.5 sm:w-full">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-vibe-ink-muted sm:hidden">Focus time</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-vibe-ink tracking-tight flex items-baseline gap-1">
                    <span>{animatedHours}</span>
                    <span className="text-xs font-sans font-medium text-vibe-ink-muted">hours</span>
                  </div>
                  <div className="hidden sm:block text-[11px] font-medium text-vibe-ink-muted mt-0.5">
                    Distraction-free focus / yr
                  </div>
                </div>
              </div>

              {/* Metric 3: Words */}
              <div className="rounded-xl p-4 bg-vibe-card-subtle border border-vibe-border flex items-center sm:flex-col sm:items-start justify-between sm:justify-start gap-2.5">
                <div className="flex items-center gap-2.5 sm:w-full">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-vibe-ink-muted sm:hidden">Words read</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-vibe-ink tracking-tight flex items-baseline gap-1">
                    <span>{animatedWords}M</span>
                    <span className="text-xs font-sans font-medium text-vibe-ink-muted">words</span>
                  </div>
                  <div className="hidden sm:block text-[11px] font-medium text-vibe-ink-muted mt-0.5">
                    Ideas & vocabulary absorbed
                  </div>
                </div>
              </div>

            </div>

            {/* Single Compact Milestone Quote */}
            <div className="rounded-xl px-3.5 py-2.5 bg-vibe-card-subtle/80 border border-vibe-border flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Bookmark className="w-3.5 h-3.5 text-vibe-accent flex-shrink-0 fill-current" />
                <p className="text-xs text-vibe-ink-secondary truncate italic font-display">
                  “{milestone.quote}”
                </p>
              </div>
              <span className="text-[10px] font-mono text-vibe-ink-muted flex-shrink-0">
                365 days
              </span>
            </div>

          </div>
        </ScrollRevealCard>

      </div>
    </section>
  );
};
