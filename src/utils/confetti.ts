import confetti from 'canvas-confetti';

/**
 * Triggers a tasteful, celebratory burst of confetti matching the Readers Hub brand palette.
 */
export function triggerCelebrationConfetti(): void {
  // Respect prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Readers Hub Palette: Mint-Emerald, Deep Emerald, Gold, Sky, Rose
  const colors = ['#059669', '#34D399', '#10B981', '#FBBF24', '#F59E0B', '#38BDF8', '#F43F5E'];

  // Burst 1: Center upward fountain
  confetti({
    particleCount: 65,
    spread: 75,
    origin: { y: 0.62 },
    colors,
    ticks: 220,
    gravity: 1.05,
    scalar: 0.95,
  });

  // Burst 2: Side cannons with slight delay for depth
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors,
      ticks: 200,
      gravity: 1.1,
      scalar: 0.85,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors,
      ticks: 200,
      gravity: 1.1,
      scalar: 0.85,
    });
  }, 160);
}
