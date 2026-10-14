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
    <div className="fixed inset-0 z-50 bg-[#f6f5ef]/98 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-y-auto animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#38523f] flex items-center justify-center text-white flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
              Distraction-Free Reading
            </h2>
            <p className="text-[10px] sm:text-[11px] text-gray-500">
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
                ? 'bg-[#38523f] text-white border-[#38523f]' 
                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
            }`}
            title="Toggle soothing library ambient sound"
          >
            {ambientSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setFullScreenOpen(false)}
            aria-label="Close timer"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Zen Focus Display */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4 sm:space-y-6 my-auto py-6">
        
        {/* Book Jacket Art */}
        <div className="relative w-24 h-36 sm:w-32 sm:h-48 bg-[#faf8f3] rounded-lg shadow-xl border border-[#e2dcd0] flex flex-col items-center justify-between p-3 sm:p-4 text-center">
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-gray-700 uppercase line-clamp-2">
            {bookTitle}
          </span>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 flex items-center justify-center">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-200"></span>
          </div>
          <span className="text-[8px] sm:text-[9px] text-gray-500 font-medium truncate w-full">
            {bookAuthor}
          </span>
          <div className="absolute left-1.5 sm:left-2 top-0 bottom-0 w-[2px] bg-black/5"></div>
        </div>

        {/* Current Book Info */}
        <div className="space-y-0.5">
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#1f2d22] break-words">
            {bookTitle}
          </h1>
          <p className="text-xs text-gray-500">
            by {bookAuthor}
          </p>
        </div>

        {/* Digital Clock with Responsive Typography */}
        <div className="font-mono text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold text-[#233528] tracking-wider py-2 sm:py-4 drop-shadow-xs select-none">
          <span>{formatHours}</span>:
          <span>{formatMins}</span>:
          <span>{formatSecs}</span>
        </div>

        {/* Controls with touch targets >= 44x44px */}
        <div className="flex items-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={resetTimer}
            aria-label="Reset timer"
            className="min-w-[48px] min-h-[48px] p-3 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all shadow-xs flex items-center justify-center active:scale-95"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            aria-label={isRunning ? 'Pause reading' : 'Resume reading'}
            className="min-h-[48px] flex items-center gap-2 bg-[#36523f] hover:bg-[#273d2f] text-white px-6 sm:px-8 py-3.5 rounded-2xl text-sm sm:text-base font-semibold shadow-lg transition-all active:scale-95"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause Reading</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Resume Reading</span>
              </>
            )}
          </button>

          <button
            onClick={handleStopAndSave}
            aria-label="Finish and save reading session"
            className="min-w-[48px] min-h-[48px] p-3 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 transition-all shadow-xs flex items-center justify-center active:scale-95"
            title="Finish & log session"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>

      </div>

      {/* Bottom Quote & Tip */}
      <div className="text-center max-w-xl mx-auto pt-4">
        <p className="font-serif italic text-xs sm:text-sm text-[#4b5e50]">
          “The more that you read, the more things you will know. The more that you learn, the more places you'll go.”
        </p>
        <span className="text-[10px] text-gray-400 font-mono mt-1 block">
          Close to return to feed while timer keeps ticking
        </span>
      </div>

    </div>
  );
};
