import React from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, color }) => {
  const getGlowColor = () => {
    switch (color) {
      case 'purple': return 'shadow-[0_0_100px_rgba(168,85,247,0.5)] bg-purple-500/10';
      case 'cyan': return 'shadow-[0_0_100px_rgba(6,182,212,0.5)] bg-cyan-500/10';
      default: return 'shadow-[0_0_100px_rgba(255,255,255,0.2)] bg-white/5';
    }
  };

  const getRingColor = () => {
    switch (color) {
        case 'purple': return 'border-purple-500/20';
        case 'cyan': return 'border-cyan-500/20';
        default: return 'border-white/10';
    }
  }

  return (
    // Changed from inset-0 to centered absolute positioning relative to parent
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0 w-[500px] h-[500px]">
      {/* Core Glow */}
      <div 
        className={`w-64 h-64 rounded-full blur-3xl transition-all duration-1000 ${getGlowColor()} ${isPlaying ? 'scale-150 opacity-60 animate-breathe' : 'scale-50 opacity-0'}`}
      />
      
      {/* Outer Rings */}
      <div className={`absolute w-[600px] h-[600px] border rounded-full transition-all duration-[2000ms] ${getRingColor()} ${isPlaying ? 'scale-100 opacity-100 rotate-12' : 'scale-50 opacity-0 rotate-0'}`} />
      <div className={`absolute w-[900px] h-[900px] border rounded-full transition-all duration-[3000ms] delay-75 ${getRingColor()} ${isPlaying ? 'scale-100 opacity-60 -rotate-12' : 'scale-50 opacity-0 rotate-0'}`} />
      <div className={`absolute w-[1200px] h-[1200px] border rounded-full transition-all duration-[4000ms] delay-150 ${getRingColor()} ${isPlaying ? 'scale-100 opacity-30 rotate-6' : 'scale-50 opacity-0 rotate-0'}`} />
    </div>
  );
};

export default Visualizer;