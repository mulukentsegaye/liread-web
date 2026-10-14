import React, { useEffect, useState } from 'react';
import { X, Play, Pause, Square, RotateCcw, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useTimerStore } from '../../stores/timerStore';
import { useAuthStore } from '../../stores/authStore';

export const FullTimerModal: React.FC = () => {
  const {
    isFullScreenOpen,
    setFullScreenOpen,
    isRunning,
    bookTitle,
    bookAuthor,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    getElapsedSeconds
  } = useTimerStore();

  const { logSessionMinutes } = useAuthStore();
  const [seconds, setSeconds] = useState(getElapsedSeconds());
  const [ambientSound, setAmbientSound] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSeconds(getElapsedSeconds());
    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, getElapsedSeconds]);

  if (!isFullScreenOpen) return null;

  const formatHours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const formatMins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const formatSecs = (seconds % 60).toString().padStart(2, '0');

  const handleStopAndSave = () => {
    const mins = stopTimer();
    if (mins > 0) {
      logSessionMinutes(mins);
      alert(`Reading session saved!\nLogged ${mins} minutes to your profile.`);
    }
    setFullScreenOpen(false);
  };

  const toggleSound = () => {
    if (ambientSound) {
      audioObj?.pause();
      setAmbientSound(false);
    } else {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      setAudioObj(audio);
      setAmbientSound(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto bg-vibe-bg text-vibe-ink backdrop-blur-md animate-in fade-in duration-300 transition-colors duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-vibe-accent text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-vibe-ink">
              Distraction-Free Reading
            </h2>
            <p className="text-[10px] sm:text-[11px] text-vibe-ink-muted">
              Immerse yourself in every sentence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            aria-label="Toggle ambient sound"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border transition-all ${
              ambientSound 
                ? 'bg-vibe-accent text-white border-vibe-accent' 
                : 'bg-vibe-card text-vibe-ink-secondary border-vibe-border hover:bg-vibe-card-subtle'
            }`}
            title="Toggle soothing ambient sound"
          >
            {ambientSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setFullScreenOpen(false)}
            aria-label="Close timer"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border border-vibe-border bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Focus Display */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4 sm:space-y-6 my-auto py-6 relative z-10">
        
        {/* Book Jacket Art */}
        <div className="relative w-24 h-36 sm:w-32 sm:h-48 rounded-lg shadow-vibe-elevated border border-vibe-border bg-vibe-card flex flex-col items-center justify-between p-3 sm:p-4 text-center">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-vibe-ink line-clamp-2">
            {bookTitle}
          </span>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-vibe-border flex items-center justify-center">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-vibe-accent/40"></span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-medium text-vibe-ink-muted truncate w-full">
            {bookAuthor}
          </span>
          <div className="absolute left-1.5 sm:left-2 top-0 bottom-0 w-[2px] bg-black/10 dark:bg-white/10"></div>
        </div>

        {/* Current Book Info */}
        <div className="space-y-0.5">
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-vibe-ink break-words">
            {bookTitle}
          </h1>
          <p className="text-xs text-vibe-ink-muted">
            by {bookAuthor}
          </p>
        </div>

        {/* Digital Clock */}
        <div className="font-mono text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider py-2 sm:py-4 select-none drop-shadow-md text-vibe-ink">
          <span>{formatHours}</span>:
          <span>{formatMins}</span>:
          <span>{formatSecs}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={resetTimer}
            aria-label="Reset timer"
            className="min-w-[48px] min-h-[48px] p-3 rounded-full border border-vibe-border bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all shadow-xs flex items-center justify-center active:scale-95"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            aria-label={isRunning ? 'Pause reading' : 'Resume reading'}
            className="min-h-[48px] flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-vibe-accent hover:bg-vibe-accent-hover text-white text-sm sm:text-base font-semibold shadow-lg transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Reading</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Resume Reading</span>
              </>
            )}
          </button>

          <button
            onClick={handleStopAndSave}
            aria-label="Finish and save reading session"
            className="min-w-[48px] min-h-[48px] p-3 rounded-full border border-vibe-border bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all shadow-xs flex items-center justify-center active:scale-95"
            title="Finish & log session"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>

      </div>

      {/* Bottom Quote & Tip */}
      <div className="text-center max-w-xl mx-auto pt-4 relative z-10">
        <p className="font-serif italic text-xs sm:text-sm text-vibe-ink-secondary">
          “The more that you read, the more things you will know. The more that you learn, the more places you'll go.”
        </p>
        <span className="text-[10px] font-mono mt-1 block text-vibe-ink-muted">
          Close to return to feed while timer keeps ticking
        </span>
      </div>

    </div>
  );
};
