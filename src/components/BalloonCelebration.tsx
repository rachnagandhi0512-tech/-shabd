import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { toGujaratiNumber } from '../data/samanarthiWords';

interface BalloonItem {
  id: number;
  x: number; // percentage from left
  size: number; // size in px (65 to 90)
  speed: number; // animation duration in seconds (6 to 12s)
  color: string;
  shineColor: string;
  stringColor: string;
  swayDelay: number;
  char: string;
}

const BALLOON_PALETTES = [
  { color: '#ef4444', shine: '#fca5a5', string: '#b91c1c', char: '🎈' }, // Red
  { color: '#f59e0b', shine: '#fde68a', string: '#b45309', char: '⭐' }, // Yellow
  { color: '#10b981', shine: '#a7f3d0', string: '#047857', char: '✨' }, // Green
  { color: '#3b82f6', shine: '#bfdbfe', string: '#1d4ed8', char: '🎉' }, // Blue
  { color: '#ec4899', shine: '#fbcfe8', string: '#be185d', char: '💖' }, // Pink
  { color: '#8b5cf6', shine: '#ddd6fe', string: '#6d28d9', char: '🌟' }, // Purple
  { color: '#f97316', shine: '#fed7aa', string: '#c2410c', char: '🚀' }, // Orange
  { color: '#06b6d4', shine: '#cffafe', string: '#0e7490', char: '🎊' }, // Cyan
];

const POP_WORDS = ['શાબાશ! 💥', 'વાહ! 🎈', 'અદ્ભુત! ⭐', '+૧૦ બોનસ! 🎯', 'સુપર! 🌟', 'મસ્ત! 🎉', 'પૉપ! 💥'];

interface BalloonCelebrationProps {
  onClose?: () => void;
}

export const BalloonCelebration: React.FC<BalloonCelebrationProps> = ({ onClose }) => {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [popPopups, setPopPopups] = useState<Array<{ id: number; x: number; y: number; text: string }>>([]);
  const [musicMuted, setMusicMuted] = useState<boolean>(false);

  // Start celebration music on mount
  useEffect(() => {
    sounds.startCelebrationMusic();

    // Spawn initial balloons
    const initialList: BalloonItem[] = [];
    for (let i = 0; i < 18; i++) {
      initialList.push(createBalloon(i));
    }
    setBalloons(initialList);

    // Keep spawning new balloons continuously
    let nextId = 20;
    const interval = setInterval(() => {
      setBalloons((prev) => {
        // Keep max 24 balloons on screen
        const alive = prev.filter((b) => b !== null);
        if (alive.length < 22) {
          return [...alive, createBalloon(nextId++)];
        }
        return alive;
      });
    }, 1200);

    return () => {
      clearInterval(interval);
      sounds.stopCelebrationMusic();
    };
  }, []);

  const createBalloon = (id: number): BalloonItem => {
    const palette = BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
    return {
      id,
      x: 5 + Math.random() * 85, // 5% to 90% across screen
      size: 65 + Math.random() * 30, // 65px to 95px
      speed: 7 + Math.random() * 6, // 7s to 13s float time
      color: palette.color,
      shineColor: palette.shine,
      stringColor: palette.string,
      swayDelay: Math.random() * 2,
      char: palette.char,
    };
  };

  const handlePop = (e: React.MouseEvent, balloon: BalloonItem) => {
    e.stopPropagation();
    sounds.playBalloonPop();

    // Trigger local confetti burst at balloon position
    const clientX = e.clientX / window.innerWidth;
    const clientY = e.clientY / window.innerHeight;
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x: clientX, y: clientY },
      colors: [balloon.color, '#ffffff', '#fbbf24'],
    });

    // Remove popped balloon
    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
    setPoppedCount((c) => c + 1);

    // Add floating praise text
    const randomPraise = POP_WORDS[Math.floor(Math.random() * POP_WORDS.length)];
    const popupId = Date.now() + Math.random();
    setPopPopups((prev) => [
      ...prev,
      { id: popupId, x: e.clientX, y: e.clientY, text: randomPraise },
    ]);

    setTimeout(() => {
      setPopPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 1000);
  };

  const handleToggleMusic = () => {
    if (musicMuted) {
      sounds.startCelebrationMusic();
      setMusicMuted(false);
    } else {
      sounds.stopCelebrationMusic();
      setMusicMuted(true);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-auto z-40 overflow-hidden select-none">
      
      {/* Floating Header Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border-2 border-amber-300 shadow-xl animate-in slide-in-from-top">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-900">
          <span className="text-xl animate-bounce">🎈</span>
          <span>ફુગ્ગા પર ક્લિક કરીને ફોડો!</span>
        </div>

        <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
          <span>ફોડેલા:</span>
          <span className="text-sm font-black text-amber-700">{toGujaratiNumber(poppedCount)}</span>
        </div>

        {/* Music Toggle */}
        <button
          onClick={handleToggleMusic}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
          title={musicMuted ? 'મ્યુઝિક ચાલુ કરો' : 'મ્યુઝિક બંધ કરો'}
        >
          {musicMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
          <span className="hidden sm:inline">{musicMuted ? 'મ્યુઝિક બંધ' : 'મ્યુઝિક ચાલુ 🎵'}</span>
        </button>

        {onClose && (
          <button
            onClick={() => {
              sounds.stopCelebrationMusic();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Pop Words */}
      {popPopups.map((popup) => (
        <div
          key={popup.id}
          className="absolute z-50 pointer-events-none font-black text-lg sm:text-2xl text-amber-950 bg-amber-300/90 px-3 py-1 rounded-2xl shadow-lg border border-white animate-out fade-out zoom-out duration-1000"
          style={{
            left: popup.x,
            top: popup.y - 30,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {popup.text}
        </div>
      ))}

      {/* Floating Balloons Layer */}
      {balloons.map((b) => (
        <div
          key={b.id}
          onClick={(e) => handlePop(e, b)}
          className="absolute cursor-pointer hover:scale-115 active:scale-90 transition-transform filter drop-shadow-md"
          style={{
            left: `${b.x}%`,
            bottom: '-140px',
            animation: `floatUp ${b.speed}s linear infinite, balloonSway 3s ease-in-out infinite alternate`,
            animationDelay: `${b.swayDelay}s`,
          }}
        >
          <div
            className="relative flex flex-col items-center justify-center rounded-[50%_50%_50%_50%/40%_40%_60%_60%]"
            style={{
              width: `${b.size}px`,
              height: `${b.size * 1.25}px`,
              backgroundColor: b.color,
              boxShadow: `inset 6px 6px 12px ${b.shineColor}, inset -6px -6px 12px rgba(0,0,0,0.25)`,
            }}
          >
            {/* Balloon Reflection Highlight */}
            <div
              className="absolute top-2.5 left-2.5 rounded-full bg-white/70"
              style={{
                width: `${b.size * 0.22}px`,
                height: `${b.size * 0.35}px`,
                transform: 'rotate(-30deg)',
              }}
            />

            {/* Center Symbol */}
            <span className="text-white/90 text-sm font-black drop-shadow-sm select-none pointer-events-none">
              {b.char}
            </span>

            {/* Balloon Knot */}
            <div
              className="absolute -bottom-1.5 w-3 h-2 rounded-xs"
              style={{ backgroundColor: b.stringColor }}
            />
          </div>

          {/* Balloon String */}
          <div
            className="w-0.5 mx-auto h-16 origin-top"
            style={{
              backgroundColor: b.stringColor,
              animation: 'stringWiggle 2s ease-in-out infinite alternate',
            }}
          />
        </div>
      ))}

      {/* CSS Keyframes injected for smooth floating and swaying */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0);
            opacity: 0.95;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-130vh);
            opacity: 0;
          }
        }

        @keyframes balloonSway {
          0% {
            margin-left: -15px;
          }
          100% {
            margin-left: 15px;
          }
        }

        @keyframes stringWiggle {
          0% {
            transform: rotate(-6deg);
          }
          100% {
            transform: rotate(6deg);
          }
        }
      `}</style>

    </div>
  );
};
