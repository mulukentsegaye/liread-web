import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookRefreshSpinner } from './BookRefreshSpinner';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
}

const PULL_THRESHOLD = 64; // Pixels needed to trigger refresh
const MAX_PULL = 96; // Maximum visual travel distance

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  scrollContainerRef,
  disabled = false,
}) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);

  // Sync ref for event handlers
  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current || disabled) return;
    setIsRefreshing(true);
    setPullDistance(52); // Resting height while spinning

    // Provide subtle haptic feedback on supported mobile devices
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    try {
      // Execute the actual page data refresh with a guaranteed smooth minimum duration
      await Promise.all([
        Promise.resolve(onRefresh()),
        new Promise((resolve) => setTimeout(resolve, 850)),
      ]);

      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 380));
    } catch (err) {
      console.warn('Pull-to-refresh action encountered an error:', err);
    } finally {
      setIsSuccess(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, disabled]);

  // Attach touch and mouse listeners to the scroll container
  useEffect(() => {
    const element = scrollContainerRef?.current;
    if (!element || disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      // Only initiate pull-to-refresh if we are scrolled to the very top
      if (element.scrollTop <= 1) {
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
        isDraggingRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = currentX - startXRef.current;

      // Disregard horizontal gestures (like horizontal book shelves)
      if (Math.abs(diffX) > Math.abs(diffY)) {
        return;
      }

      // If user is pulling down while at the top
      if (diffY > 0 && element.scrollTop <= 1) {
        // Prevent default native browser overscroll bounce to allow custom book animation
        if (e.cancelable && diffY > 8) {
          e.preventDefault();
        }

        // Apply logarithmic dampening physics curve
        const damped = Math.min(MAX_PULL, Math.pow(diffY, 0.82) * 1.3);
        setPullDistance(damped);
      } else {
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (!isDraggingRef.current || isRefreshingRef.current) return;
      isDraggingRef.current = false;

      setPullDistance((current) => {
        if (current >= PULL_THRESHOLD) {
          handleRefresh();
          return 52;
        }
        return 0;
      });
    };

    // Attach passive: false so we can selectively call preventDefault() when pulling down
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [scrollContainerRef, disabled, handleRefresh]);

  const pullProgress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const isVisible = pullDistance > 0 || isRefreshing;

  return (
    <div className="relative w-full min-h-full">
      {/* Pull-To-Refresh Top Creative Pill Indicator */}
      <div
        className={`pointer-events-none absolute left-0 right-0 top-2 z-30 flex items-center justify-center transition-all ${
          isRefreshing || pullDistance === 0 ? 'duration-300 ease-out' : 'duration-75'
        }`}
        style={{
          transform: `translate3d(0, ${pullDistance > 0 ? pullDistance - 48 : -60}px, 0)`,
          opacity: isVisible ? Math.min(1, Math.max(0, (pullDistance - 10) / 30)) : 0,
        }}
        aria-hidden={!isVisible}
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-vibe-card/95 border border-vibe-border shadow-float backdrop-blur-md text-vibe-ink pointer-events-auto transition-all">
          <BookRefreshSpinner
            pullProgress={pullProgress}
            isRefreshing={isRefreshing}
            isSuccess={isSuccess}
          />

          <div className="flex flex-col text-left pr-1 select-none">
            <span className="font-heading text-xs font-bold tracking-tight text-vibe-ink leading-tight">
              {isSuccess
                ? 'All caught up!'
                : isRefreshing
                ? 'Turning pages...'
                : pullProgress >= 1
                ? 'Release to refresh'
                : 'Pull down to refresh'}
            </span>
            <span className="text-[10px] font-mono text-vibe-ink-muted leading-tight">
              {isSuccess
                ? 'Fresh content loaded'
                : isRefreshing
                ? 'Updating library data'
                : 'Scroll down to update'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content with subtle responsive spring offset when pulled */}
      <div
        className={`w-full min-h-full transition-transform ${
          isRefreshing || pullDistance === 0 ? 'duration-300 ease-out' : 'duration-75'
        }`}
        style={{
          transform: `translate3d(0, ${Math.min(32, pullDistance * 0.35)}px, 0)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
