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

  useEffect(() => {
    setSeconds(getElapsedSeconds());
    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, getElapsedSeconds]);

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
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-[90%] md:max-w-xl bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 px-3.5 sm:px-5 border border-[#e1e6e2] shadow-2xl flex items-center justify-between gap-2 sm:gap-4 cursor-pointer hover:border-[#35523f]/50 transition-all group"
      title="Click to open full distraction-free reading timer"
    >
      {/* Left: Thumbnail & Book Details */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div className="relative w-7 h-10 sm:w-8 sm:h-11 bg-[#f4f2ea] rounded border border-[#dfdbcf] shadow-xs flex-shrink-0 flex items-center justify-center text-[6px] sm:text-[7px] font-bold text-gray-700 text-center leading-none p-0.5 select-none">
          THE ACT
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isRunning ? 'bg-[#35523f] animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#35523f] uppercase truncate">
              {isRunning ? 'Reading' : 'Paused'}
            </span>
          </div>

          <h3 className="text-xs font-bold text-gray-900 truncate max-w-[130px] sm:max-w-[200px]">
            {bookTitle}
          </h3>

          <p className="hidden sm:block text-[11px] text-gray-400 truncate max-w-[180px]">
            {subtitleNote}
          </p>
        </div>
      </div>

      {/* Right: Digital Stopwatch & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="font-mono text-sm sm:text-base md:text-lg font-bold text-[#1a281e] tracking-tight leading-none">
            {formatTime(seconds)}
          </div>
          <span className="hidden sm:inline-block text-[10px] text-gray-400 font-medium">
            Current session
          </span>
        </div>

        {/* Pause/Play Button (Min 44x44px touch target) */}
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 bg-[#36523f] hover:bg-[#273d2f] text-white px-3 sm:px-3.5 rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Resume</span>
            </>
          )}
        </button>

        {/* Stop Button (Min 44x44px touch target) */}
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop and log reading session"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
          title="Stop & save session"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Fullscreen Expand Icon (Desktop & Tablet) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFullScreenOpen(true);
          }}
          aria-label="Expand distraction-free mode"
          className="hidden sm:flex min-w-[36px] min-h-[36px] items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Full screen reading mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
