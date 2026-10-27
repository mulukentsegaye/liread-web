import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HeroScrollAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLImageElement | null>(null);
  const clockRef = useRef<HTMLImageElement | null>(null);
  const cupRef = useRef<HTMLImageElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Create scroll-linked timeline linked to user scrolling down
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',       // begins when hero image approaches center viewport
          end: 'bottom 20%',      // completes as user scrolls past into features
          scrub: 1.2,             // smooth spring interpolation for silky feel
          invalidateOnRefresh: true,
        },
      });

      // 1. Coffee cup layer (lightest object: floats fastest, subtle tilt)
      tl.to(
        cupRef.current,
        {
          y: -160,
          opacity: 0,
          scale: 0.96,
          rotate: 3,
          ease: 'power1.out',
          force3D: true,
        },
        0
      );

      // 2. Vintage clock layer (medium weight: moderate float and gentle counter-tilt)
      tl.to(
        clockRef.current,
        {
          y: -115,
          opacity: 0,
          scale: 0.97,
          rotate: -2,
          ease: 'power1.out',
          force3D: true,
        },
        0
      );

      // 3. Open book layer (grounded base: steady upward translation and fade)
      tl.to(
        bookRef.current,
        {
          y: -75,
          opacity: 0,
          scale: 0.98,
          ease: 'power1.out',
          force3D: true,
        },
        0
      );

      // 4. Floating indicator badge fades out quickly
      if (indicatorRef.current) {
        tl.to(
          indicatorRef.current,
          {
            opacity: 0,
            y: -30,
            ease: 'power1.out',
          },
          0
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-800/80 bg-gradient-to-br from-[#f8f9fa] via-[#f3f4f6] to-[#eaebef] select-none my-6 sm:my-10"
      style={{
        aspectRatio: '1090 / 607',
      }}
    >
      {/* Layer 0: Atmospheric Studio Lighting & Subtle Radial Vignette */}
      <div className="absolute inset-0 bg-radial from-white/60 via-transparent to-stone-900/5 pointer-events-none" />

      {/* Layer 1: Open Book (Base Layer) */}
      <img
        ref={bookRef}
        src="/hero/hero-book.png"
        alt="Open book showing classic printed typography"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
        loading="eager"
        decoding="async"
      />

      {/* Layer 2: Vintage Brass Alarm Clock */}
      <img
        ref={clockRef}
        src="/hero/hero-clock.png"
        alt="Vintage golden focus clock"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
        loading="eager"
        decoding="async"
      />

      {/* Layer 3: Coffee Cup with Latte Art */}
      <img
        ref={cupRef}
        src="/hero/hero-cup.png"
        alt="Hot ceramic coffee cup with mindful latte art"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
        loading="eager"
        decoding="async"
      />

      {/* Floating Interactive Badge (Subtle Polish in Bottom-Left) */}
      <div
        ref={indicatorRef}
        className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-10 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-700/60 shadow-sm flex items-center gap-2 text-[11px] sm:text-xs font-medium text-stone-700 dark:text-stone-300 pointer-events-none transition-opacity"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Scroll to enter deep focus</span>
        <ArrowDown className="w-3 h-3 text-stone-400 animate-bounce ml-0.5" />
      </div>
    </div>
  );
};
