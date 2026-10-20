import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, className = '' }) => {
  const [current, setCurrent] = useState(value);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (value !== current) {
      setPrev(current);
      setCurrent(value);
      setDirection(value > current ? 'up' : 'down');

      const timer = setTimeout(() => {
        setPrev(null);
        setDirection(null);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [value, current]);

  return (
    <span className={`relative inline-flex items-center justify-center overflow-hidden h-[1.25em] min-w-[1.2ch] tabular-nums font-semibold select-none leading-none ${className}`}>
      {direction === null && (
        <span className="inline-block leading-none">{current}</span>
      )}

      {direction === 'up' && (
        <>
          <span
            key={`prev-${prev}`}
            className="absolute inset-0 flex items-center justify-center animate-counter-up-out pointer-events-none"
          >
            {prev}
          </span>
          <span
            key={`curr-${current}`}
            className="inline-flex items-center justify-center animate-counter-up-in pointer-events-none"
          >
            {current}
          </span>
        </>
      )}

      {direction === 'down' && (
        <>
          <span
            key={`prev-${prev}`}
            className="absolute inset-0 flex items-center justify-center animate-counter-down-out pointer-events-none"
          >
            {prev}
          </span>
          <span
            key={`curr-${current}`}
            className="inline-flex items-center justify-center animate-counter-down-in pointer-events-none"
          >
            {current}
          </span>
        </>
      )}
    </span>
  );
};
