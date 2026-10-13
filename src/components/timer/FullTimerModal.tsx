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
    setBook,
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
      // Gentle white-noise / soft rain tone
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      setAudioObj(audio);
      setAmbientSound(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f5ef]/98 backdrop-blur-md flex flex-col justify-between p-6 md:p-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#38523f] flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Distraction-Free Reading
            </h2>
            <p className="text-[11px] text-gray-500">
              Immerse yourself in every sentence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-full border transition-all ${
              ambientSound 
                ? 'bg-[#38523f] text-white border-[#38523f]' 
                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
            }`}
            title="Toggle soothing library ambient sound"
          >
            {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setFullScreenOpen(false)}
            className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Zen Focus Display */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
        
        {/* Book Jacket Art */}
        <div className="relative w-32 h-48 bg-[#faf8f3] rounded-lg shadow-xl border border-[#e2dcd0] flex flex-col items-center justify-between p-4 text-center">
          <span className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">
            {bookTitle}
          </span>
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center">
            <span className="w-7 h-7 rounded-full border border-gray-200"></span>
          </div>
          <span className="text-[9px] text-gray-500 font-medium">
            {bookAuthor}
          </span>
          <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-black/5"></div>
        </div>

        {/* Current Book Inputs */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1f2d22]">
            {bookTitle}
          </h1>
          <p className="text-xs text-gray-500">
            by {bookAuthor}
          </p>
        </div>

        {/* Huge Digital Clock */}
        <div className="font-mono text-5xl md:text-7xl font-bold text-[#233528] tracking-widest py-4 drop-shadow-xs">
          <span>{formatHours}</span>:
          <span>{formatMins}</span>:
          <span>{formatSecs}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all shadow-xs"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            className="flex items-center gap-2 bg-[#36523f] hover:bg-[#273d2f] text-white px-8 py-4 rounded-2xl text-base font-semibold shadow-lg transition-all transform hover:scale-102"
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
            className="p-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 transition-all shadow-xs"
            title="Finish & log session"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>

      </div>

      {/* Bottom Quote & Tip */}
      <div className="text-center max-w-xl mx-auto">
        <p className="font-serif italic text-sm text-[#4b5e50]">
          “The more that you read, the more things you will know. The more that you learn, the more places you'll go.”
        </p>
        <span className="text-[10px] text-gray-400 font-mono mt-1 block">
          Press ESC or Close to return to Discover Feed while timer keeps running
        </span>
      </div>

    </div>
  );
};
