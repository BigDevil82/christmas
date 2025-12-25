import { Snowflake } from 'lucide-react';
import { useRef, useState } from 'react';
import useStore from '../store';

const UI = () => {
  const { phase, handGesture, setPhase } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-10">
      {/* Header / Status */}
      <div className="w-full relative h-32">
        {/* Top Title - Moved Up */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center w-full">
            <h1 className="font-cursive text-5xl md:text-8xl text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse whitespace-nowrap">
            Merry Christmas
            </h1>
        </div>

        {/* Simplified Status Bar - Moved Down */}
        <div 
            className="absolute top-24 left-0 bg-glass backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white pointer-events-auto flex flex-col gap-1 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => phase === 'tree' ? setPhase('blooming') : setPhase('collapsing')}
        >
          <div className="flex items-center gap-2 text-xs md:text-sm opacity-80">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>状态: {phase === 'tree' ? '等待手势...' : '魔法进行中'}</span>
          </div>
          <div className="text-xs text-gold font-medium">
             {phase === 'tree' ? '✋ 张开手掌 / 🖱️ 点击 开启魔法' : '✊ 握紧拳头 复原 / 🖱️ 拖拽切换照片'}
          </div>
        </div>
      </div>

      {/* Footer / Music Player */}
      <div className="flex flex-col items-center justify-center pointer-events-auto gap-1 mb-2">
        {/* Hexagram Button - White Glowing Style */}
        {/* Snowflake Button */}
        <button 
            onClick={toggleMusic}
            className={`relative w-16 h-16 flex items-center justify-center transition-all duration-700 ${isPlaying ? 'scale-110' : 'hover:scale-105'}`}
        >
            <div className={`absolute inset-0 bg-blue-400/20 rounded-full blur-xl transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
            <Snowflake 
                size={48} 
                strokeWidth={1.5}
                className={`text-white drop-shadow-[0_0_10px_rgba(200,230,255,0.8)] transition-all duration-1000 ${isPlaying ? 'animate-spin-slow' : ''}`} 
            />
        </button>
        
        {/* Music Name - Moved further down */}
        <div className="bg-glass backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs md:text-sm font-medium mt-2">
            {isPlaying ? (
                <div className="flex items-center gap-2">
                    <span className="animate-pulse text-gold">♪</span>
                    <span>We Wish You A Merry Christmas</span>
                    <span className="animate-pulse text-gold">♪</span>
                </div>
            ) : (
                <span className="opacity-70">点击播放音乐</span>
            )}
        </div>

        <audio ref={audioRef} loop src="/We_Wish_You_A_Merry_Christmas.mp3" /> 
      </div>
    </div>
  );
};

export default UI;
