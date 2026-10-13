import React, { useEffect, useState } from 'react';
import { Pause, Play, Square, Maximize2 } from 'lucide-react';
import { useTimerStore } from '../../stores/timerStore';
import { useAuthStore } from '../../stores/authStore';

export const FloatingTimerBar: React.FC = () => {
  const {
    isRunning,
    bookTitle,
    subtitleNote,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getElapsedSeconds,
    setFullScreenOpen
  } = useTimerStore();

  const { logSessionMinutes } = useAuthStore();
  const [seconds, setSeconds] = useState(getElapsedSeconds());

  // Background-tab safe ticker
  useEffect(() => {
    // Immediate sync
    setSeconds(getElapsedSeconds());

    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, getElapsedSeconds]);

  // Format HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    const minutesRead = stopTimer();
    if (minutesRead > 0) {
      logSessionMinutes(minutesRead);
      alert(`Reading session saved!\nYou logged ${minutesRead} active minutes for "${bookTitle}".`);
    }
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRunning) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  };

  return (
    <div 
      onClick={() => setFullScreenOpen(true)}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-white/95 backdrop-blur-md rounded-2xl p-3 px-5 border border-[#e1e6e2] shadow-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-[#35523f]/50 transition-all group"
      title="Click to open full distraction-free reading timer"
    >
      {/* Left: Thumbnail & Book Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-8 h-11 bg-[#f4f2ea] rounded border border-[#dfdbcf] shadow-xs flex-shrink-0 flex items-center justify-center text-[7px] font-bold text-gray-700 text-center leading-none p-0.5 select-none">
          THE ACT
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-[#35523f] animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="text-[10px] font-bold tracking-wider text-[#35523f] uppercase">
              {isRunning ? 'Reading Now' : 'Timer Paused'}
            </span>
          </div>

          <h3 className="text-xs font-bold text-gray-900 truncate">
            {bookTitle}
          </h3>

          <p className="text-[11px] text-gray-400 truncate">
            {subtitleNote}
          </p>
        </div>
      </div>

      {/* Right: Digital Stopwatch & Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="font-mono text-base md:text-lg font-bold text-[#1a281e] tracking-tight leading-none">
            {formatTime(seconds)}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            Current session
          </span>
        </div>

        {/* Pause/Play Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
          className="flex items-center gap-1.5 bg-[#36523f] hover:bg-[#273d2f] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Resume</span>
            </>
          )}
        </button>

        {/* Stop Button */}
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop and log reading session"
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title="Stop & save session"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFullScreenOpen(true);
          }}
          aria-label="Expand distraction-free mode"
          className="p-1 text-gray-400 hover:text-gray-600 hidden sm:block"
          title="Full screen reading mode"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
