import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Award, BookOpen, Layers, Zap, Grid, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

export type GameMode = 'columns' | 'memory' | 'quiz' | 'study';

interface HeaderProps {
  score: number;
  streak: number;
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  onOpenHowToPlay: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const AVATARS = [
  { name: 'કાનો', icon: '👦', color: 'bg-amber-100 border-amber-300' },
  { name: 'મીરા', icon: '👧', color: 'bg-pink-100 border-pink-300' },
  { name: 'અર્જુન', icon: '🏹', color: 'bg-emerald-100 border-emerald-300' },
  { name: 'દીયા', icon: '🪔', color: 'bg-purple-100 border-purple-300' },
  { name: 'કબીર', icon: '🌟', color: 'bg-sky-100 border-sky-300' },
];

export const Header: React.FC<HeaderProps> = ({
  score,
  streak,
  currentMode,
  onSelectMode,
  studentName,
  onUpdateStudentName,
  onOpenHowToPlay,
  soundEnabled,
  onToggleSound,
}) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-amber-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Grade Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white text-xl shadow-md shadow-amber-500/20 ring-2 ring-amber-300 font-bold shrink-0">
              ૬
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  ધોરણ ૬ પલાશ
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  નવો અભ્યાસક્રમ (GCERT)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-stone-800 tracking-tight leading-tight">
                સમાનાર્થી શબ્દો: <span className="text-amber-600">જોડકાં રમત</span>
              </h1>
            </div>
          </div>

          {/* Student Profile & Quick Stats */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Streak & Score Badges */}
            <div className="flex items-center gap-2 bg-amber-50/80 px-3 py-1.5 rounded-2xl border border-amber-200 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
                <span className="text-stone-600 text-xs hidden md:inline">અંક:</span>
                <span className="font-extrabold text-amber-900">{score}</span>
              </div>

              {streak > 1 && (
                <div className="flex items-center gap-1 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                  🔥 {streak}x કૉમ્બો
                </div>
              )}
            </div>

            {/* Student Avatar Selector */}
            <div className="relative">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-xs font-semibold text-stone-700 transition-colors"
                title="વિદ્યાર્થી બદલો"
              >
                <span className="text-base">🎓</span>
                <span className="max-w-[70px] truncate">{studentName}</span>
              </button>

              {showAvatarPicker && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-xs font-bold text-stone-500 px-2 py-1">વિદ્યાર્થી પસંદ કરો:</div>
                  <div className="space-y-1">
                    {AVATARS.map((av) => (
                      <button
                        key={av.name}
                        onClick={() => {
                          onUpdateStudentName(av.name);
                          setShowAvatarPicker(false);
                          sounds.playClick();
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs font-bold transition-all ${
                          studentName === av.name ? 'bg-amber-100 text-amber-900' : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="text-base">{av.icon}</span>
                        <span>{av.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-stone-100 mt-1">
                    <input
                      type="text"
                      placeholder="તમારું નામ લખો..."
                      value={studentName}
                      onChange={(e) => onUpdateStudentName(e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-2xl border transition-colors ${
                soundEnabled
                  ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                  : 'bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200'
              }`}
              title={soundEnabled ? 'અવાજ બંધ કરો' : 'અવાજ ચાલુ કરો'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Help / Instructions Button */}
            <button
              onClick={onOpenHowToPlay}
              className="p-2 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors"
              title="કેવી રીતે રમવું?"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Navigation Tabs - Game Modes */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              onSelectMode('columns');
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              currentMode === 'columns'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>🔗 જોડકાં જોડો</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('memory');
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              currentMode === 'memory'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>🃏 મેમરી કાર્ડ રમત</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('quiz');
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              currentMode === 'quiz'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ ઝડપી કસોટી</span>
          </button>

          <button
            onClick={() => {
              onSelectMode('study');
              sounds.playClick();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              currentMode === 'study'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 શબ્દકોશ અને અભ્યાસ</span>
          </button>
        </div>

      </div>
    </header>
  );
};
