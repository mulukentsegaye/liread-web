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
        <ScrollRevealCard translateY={36}>
          <div className="text-center space-y-1.5 max-w-xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-display font-normal text-vibe-ink tracking-tight">
              Small daily pages. <span className="italic text-vibe-accent">Massive compounding wisdom.</span>
            </h2>
            <p className="text-xs sm:text-sm text-vibe-ink-secondary">
              See the annual impact of a calm, distraction-free reading habit.
            </p>
          </div>
        </ScrollRevealCard>

        {/* Main Interactive Calculator */}
        <ScrollRevealCard translateY={46} delayMs={100}>
          <div className="py-6 sm:py-8 px-5 sm:px-8 space-y-8 rounded-3xl border border-vibe-border/70 bg-vibe-card shadow-soft">
            
            {/* Unified Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-vibe-border/60">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-semibold text-vibe-ink-muted uppercase tracking-wider">Daily Reading:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vibe-accent text-white font-mono text-xs font-bold shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {minutes} min / day
                </span>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${milestone.bg} ${milestone.color}`}>
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
                      className={`px-3 py-1 rounded-full text-xs font-mono transition-all border cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-vibe-accent text-white border-vibe-accent font-bold shadow-xs'
                          : 'bg-transparent text-vibe-ink-secondary border-vibe-border hover:text-vibe-ink hover:bg-vibe-card-subtle'
                      }`}
                    >
                      {val}m
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2">
              <input
                id="reading-minutes-slider"
                type="range"
                min="10"
                max="60"
                step="1"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-vibe-accent cursor-pointer h-2 bg-vibe-border/50 rounded-lg transition-all"
                aria-label="Daily reading minutes target"
              />
              <div className="flex justify-between text-[11px] font-mono text-vibe-ink-muted">
                <span>10 mins</span>
                <span>25 mins (Pomodoro)</span>
                <span>45 mins</span>
                <span>60 mins (Mastery)</span>
              </div>
            </div>

            {/* Minimalist Metrics: 3 Clean Columns with Hairline Dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 divide-y sm:divide-y-0 sm:divide-x divide-vibe-border/60">
              
              {/* Metric 1: Books */}
              <div className="pt-4 sm:pt-0 sm:pl-4 first:pl-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-vibe-ink-muted">Books Finished</span>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-vibe-ink tracking-tight flex items-baseline gap-1.5">
                  <span>{animatedBooks}</span>
                  <span className="text-xs font-sans font-medium text-vibe-ink-muted">books / yr</span>
                </div>
                <p className="text-[11px] text-vibe-ink-muted">
                  Completed masterworks read cover to cover
                </p>
              </div>

              {/* Metric 2: Hours */}
              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-vibe-ink-muted">Deep Focus Time</span>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-vibe-ink tracking-tight flex items-baseline gap-1.5">
                  <span>{animatedHours}</span>
                  <span className="text-xs font-sans font-medium text-vibe-ink-muted">hours / yr</span>
                </div>
                <p className="text-[11px] text-vibe-ink-muted">
                  Quiet contemplative immersion away from screens
                </p>
              </div>

              {/* Metric 3: Words */}
              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-vibe-ink-muted">Words Absorbed</span>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-vibe-ink tracking-tight flex items-baseline gap-1.5">
                  <span>{animatedWords}M</span>
                  <span className="text-xs font-sans font-medium text-vibe-ink-muted">words / yr</span>
                </div>
                <p className="text-[11px] text-vibe-ink-muted">
                  Vocabulary, mental frameworks, and perspective
                </p>
              </div>

            </div>

            {/* Compounding Milestone Quote Footnote */}
            <div className="pt-4 border-t border-vibe-border/60 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Bookmark className="w-4 h-4 text-vibe-accent flex-shrink-0 fill-current" />
                <p className="text-xs text-vibe-ink-secondary italic font-display">
                  “{milestone.quote}”
                </p>
              </div>
              <span className="text-[10px] font-mono text-vibe-ink-muted flex-shrink-0 hidden sm:inline-block">
                Annual Compounding Insight
              </span>
            </div>

          </div>
        </ScrollRevealCard>

      </div>
    </section>
  );
};
