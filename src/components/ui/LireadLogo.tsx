import React from 'react';
import { BookOpen } from 'lucide-react';

interface LireadLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  useJpg?: boolean;
}

const CONTAINER_SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'w-6 h-6 rounded-lg',
  sm: 'w-7 h-7 rounded-lg',
  md: 'w-8 h-8 rounded-xl',
  lg: 'w-10 h-10 rounded-xl',
  xl: 'w-12 h-12 rounded-2xl',
};

const ICON_SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-4.5 h-4.5',
  lg: 'w-5.5 h-5.5',
  xl: 'w-6.5 h-6.5',
};

/**
 * Official Liread Brand Logo component.
 * Renders an instant, non-glitching vector open-book brand icon.
 * Zero network requests, 0ms latency, responsive across all screen densities.
 */
export const LireadLogo: React.FC<LireadLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const containerClasses = CONTAINER_SIZE_MAP[size] || CONTAINER_SIZE_MAP.md;
  const iconClasses = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 bg-vibe-accent text-white shadow-xs select-none ${containerClasses} ${className}`}
      aria-hidden="true"
    >
      <BookOpen className={`${iconClasses} text-white`} strokeWidth={2.25} />
    </div>
  );
};
