import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealCardProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  scaleFrom?: number;
  translateY?: number;
  durationMs?: number;
}

/**
 * High-performance, tactile scroll reveal component.
 * Causes elements to smoothly pop up and flow upward into place
 * as the reader scrolls down into each section.
 * 
 * Uses an Apple / Linear grade spring cubic-bezier curve:
 * cubic-bezier(0.16, 1, 0.3, 1)
 */
export const ScrollRevealCard: React.FC<ScrollRevealCardProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.08,
  scaleFrom = 0.95,
  translateY = 44,
  durationMs = 720,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect user's accessibility preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    // Fallback if IntersectionObserver is unsupported in legacy browser
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // If already in the viewport on initial mount (above the fold), show immediately
    try {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 20 && rect.bottom > 0) {
        setIsVisible(true);
        return;
      }
    } catch {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        // -30px bottom margin triggers the upward pop just as the element enters the screen
        rootMargin: '0px 0px -30px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={containerRef}
      className={`will-change-transform ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translateY(0px) scale(1)'
          : `translateY(${translateY}px) scale(${scaleFrom})`,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
};
