import React from 'react';
import { SanctuaryView } from '../sanctuary/SanctuaryView';

interface LeaderboardViewProps {
  onBack?: () => void;
  onStartTimer?: (title: string, author: string, cover?: string) => void;
  onAdjustGoal?: () => void;
}

/**
 * Backward compatibility alias: replaces old raw-time Leaderboard with Sanctuary & Consistency.
 */
export const LeaderboardView: React.FC<LeaderboardViewProps> = (props) => {
  return <SanctuaryView {...props} />;
};
