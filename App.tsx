
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Lock, RotateCcw, X } from 'lucide-react';
import { TRACKS } from './constants';
import { Track } from './types';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [task, setTask] = useState<string>('');
  const [durationInput, setDurationInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isCountDown, setIsCountDown] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack: Track = TRACKS[currentTrackIndex];

  // Timer Logic
  useEffect(() => {
    let interval: number | undefined;
    if (isPlaying && isSessionActive) {
      interval = window.setInterval(() => {
        if (isCountDown) {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsPlaying(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimeLeft(s => s + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isSessionActive, isCountDown]);

  // Audio Playback Logic
  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.src !== currentTrack.url) {
         audioRef.current.src = currentTrack.url;
         audioRef.current.load();
      }
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Auto-play prevented:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying, currentTrack.url]);

  const togglePlay = () => {
    if (!isSessionActive) {
      // Start new session
      const minutes = parseInt(durationInput, 10);
      if (!isNaN(minutes) && minutes > 0) {
        setTimeLeft(minutes * 60);
        setIsCountDown(true);
      } else {
        setTimeLeft(0);
        setIsCountDown(false);
      }
      setIsSessionActive(true);
      setIsPlaying(true);
    } else {
      // Toggle pause/play
      setIsPlaying(!isPlaying);
    }
  };

  const handleTrackEnd = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIndex);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setIsSessionActive(false);
    setTimeLeft(0);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const getThemeStyles = () => {
    if (currentTrack.themeColor === 'cyan') {
      return {
        bg: 'bg-slate-950',
        accent: 'text-cyan-400',
        ring: 'ring-cyan-500/50',
        buttonGradient: 'from-cyan-500 to-blue-600',
        glow: 'shadow-cyan-500/40',
        caret: 'caret-cyan-400'
      };
    }
    return {
      bg: 'bg-zinc-950',
      accent: 'text-purple-400',
      ring: 'ring-purple-500/50',
      buttonGradient: 'from-purple-500 to-indigo-600',
      glow: 'shadow-purple-500/40',
      caret: 'caret-purple-400'
    };
  };

  const theme = getThemeStyles();

  return (
    <div className={`relative h-screen w-full flex flex-col items-center justify-between overflow-hidden transition-colors duration-1000 ${theme.bg}`}>
      
      <audio 
        ref={audioRef}
        onEnded={handleTrackEnd}
        preload="auto"
      />

      {/* Header */}
      <div className="z-10 mt-16 flex flex-col items-center space-y-2 opacity-80">
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-full bg-white/5 border border-white/10 ${isPlaying ? 'animate-pulse' : ''}`}>
             <Lock className={`w-3 h-3 ${isPlaying ? theme.accent : 'text-gray-500'}`} />
          </div>
          <span className="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase">
            {isSessionActive ? (isPlaying ? 'LOCKED IN' : 'PAUSED') : 'CONFIGURE PROTOCOL'}
          </span>
        </div>
      </div>

      {/* Main Control Cluster */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full mb-32 md:mb-48">
        
        {/* Background Visualizer */}
        <Visualizer isPlaying={isPlaying} color={currentTrack.themeColor} />
        
        {/* Content Switcher: Inputs vs Timer */}
        <div className="relative h-40 flex items-center justify-center mb-8 w-full max-w-lg px-8">
            {!isSessionActive ? (
                <div className="flex flex-col items-center w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Task Input */}
                    <input 
                        type="text" 
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="ENTER MISSION"
                        className={`w-full bg-transparent text-center text-2xl md:text-3xl font-mono font-bold text-white placeholder-white/20 outline-none border-b border-white/10 focus:border-white/40 transition-colors pb-2 uppercase tracking-wider ${theme.caret}`}
                    />
                    
                    {/* Duration Input */}
                    <div className="flex items-center space-x-4">
                        <input 
                            type="number" 
                            value={durationInput}
                            onChange={(e) => setDurationInput(e.target.value)}
                            placeholder="00"
                            className={`w-24 bg-transparent text-center text-4xl md:text-5xl font-mono font-bold text-white placeholder-white/20 outline-none border-b border-white/10 focus:border-white/40 transition-colors pb-2 ${theme.caret}`}
                        />
                        <span className="text-sm font-mono text-gray-500 uppercase tracking-widest pt-4">MINUTES</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    {/* Active Task Display */}
                    {task && (
                        <div className="mb-4 text-sm md:text-base font-mono text-gray-400 uppercase tracking-[0.2em] text-center max-w-md truncate">
                            Running Protocol: <span className="text-white font-bold">{task}</span>
                        </div>
                    )}
                    {/* Timer Display */}
                    <div className={`font-mono font-black text-7xl md:text-9xl tracking-tighter tabular-nums transition-all duration-500 select-none ${isPlaying ? 'text-white scale-105 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]' : 'text-white/20 scale-100'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            )}
        </div>

        {/* Enhanced Button */}
        <div className="relative group cursor-pointer" onClick={togglePlay}>
           {/* Outer Pulsing Ring */}
           <div className={`absolute inset-0 -m-4 rounded-full border border-white/5 transition-all duration-1000 ${isPlaying ? 'scale-110 opacity-100' : 'scale-90 opacity-0'}`}></div>
           <div className={`absolute inset-0 -m-8 rounded-full border border-white/5 transition-all duration-1000 delay-100 ${isPlaying ? 'scale-110 opacity-60' : 'scale-90 opacity-0'}`}></div>

           {/* Glow Effect */}
           <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isPlaying ? `opacity-50 bg-gradient-to-tr ${theme.buttonGradient}` : 'opacity-0 bg-white'}`}></div>
           
           {/* Main Button Body */}
           <button 
              className={`relative flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full transition-all duration-300 active:scale-95 border-4 
              ${isPlaying 
                 ? `bg-gray-900 border-white/20 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]` 
                 : 'bg-black border-white/10 hover:border-white/30'
               }`}
            >
               {/* Inner Gradient Circle */}
               <div className={`absolute inset-2 rounded-full opacity-20 bg-gradient-to-b from-white to-transparent pointer-events-none`}></div>
               
               {/* Icon */}
               <div className={`relative z-10 transition-all duration-300 ${isPlaying ? 'scale-90' : 'scale-100 translate-x-1'}`}>
                  {isPlaying ? (
                    <Pause className={`w-10 h-10 md:w-12 md:h-12 fill-current ${theme.accent} drop-shadow-md`} />
                  ) : (
                    <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-current opacity-90" />
                  )}
               </div>
            </button>
        </div>

        {/* Reset Control */}
        <div className={`mt-12 transition-all duration-500 ${isSessionActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); resetSession(); }}
            className="p-2 group flex items-center space-x-3 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
            <span className="text-[10px] font-mono text-gray-600 group-hover:text-gray-300 tracking-widest uppercase">Abort Protocol</span>
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="z-10 mb-10 flex flex-col items-center">
         <div className="h-0.5 w-8 bg-white/10 mb-4 rounded-full"></div>
         <p className={`text-[10px] font-mono uppercase tracking-widest transition-colors duration-500 ${isPlaying ? theme.accent : 'text-gray-600'}`}>
          {currentTrack.title}
        </p>
      </div>

    </div>
  );
};

export default App;
