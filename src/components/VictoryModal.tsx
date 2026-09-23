import React, { useState } from 'react';
import { Star, Award, RotateCcw, ArrowRight, Printer, Sparkles, Check } from 'lucide-react';
import { ChapterUnit, toGujaratiNumber } from '../data/samanarthiWords';
import { sounds } from '../utils/audio';
import { BalloonCelebration } from './BalloonCelebration';

interface VictoryModalProps {
  chapter: ChapterUnit;
  studentName: string;
  stats: {
    score: number;
    mistakes: number;
    stars: number;
  };
  onPlayAgain: () => void;
  onNextChapter: () => void;
  onOpenCertificate: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  chapter,
  studentName,
  stats,
  onPlayAgain,
  onNextChapter,
  onOpenCertificate,
  onClose,
}) => {
  const [showBalloons, setShowBalloons] = useState(true);

  return (
    <>
      {/* Floating Interactive Balloons and Celebration Music in the background */}
      {showBalloons && (
        <BalloonCelebration onClose={() => setShowBalloons(false)} />
      )}

      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-amber-300 p-6 text-center animate-in zoom-in-95 relative overflow-hidden">
          
          {/* Glow Header */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Stars Banner */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-10 h-10 transition-all ${
                  stats.stars >= s
                    ? 'text-amber-400 fill-amber-400 animate-bounce'
                    : 'text-stone-200'
                }`}
              />
            ))}
          </div>

          {/* Title */}
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-1">
            શાબાશ {studentName || 'દોસ્ત'}! 🏆
          </span>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            તમે જીતી ગયા! 🎉
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            <strong>{chapter.title}</strong> ના તમામ સમાનાર્થી શબ્દો સાચા જોડ્યા!
          </p>

          {/* Balloon Pop Hint Button */}
          <div className="my-3">
            <button
              onClick={() => {
                setShowBalloons(true);
                sounds.playBalloonPop();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-red-500 via-amber-500 to-purple-500 text-white text-xs font-black shadow-md hover:scale-105 transition-all animate-pulse"
            >
              <span>🎈 ફુગ્ગા ઊડી રહ્યા છે, ફોડવાની મજા માણો! 💥</span>
            </button>
          </div>

          {/* Score & Stats Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 my-3 grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-[11px] font-bold text-stone-500">મેળવેલા અંક</div>
              <div className="text-xl font-black text-amber-600">
                +{stats.score}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-500">ભૂલો</div>
              <div className="text-xl font-black text-stone-700">
                {toGujaratiNumber(stats.mistakes)}
              </div>
            </div>
          </div>

          {/* Word Review Pills */}
          <div className="text-left bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60 mb-4">
            <div className="text-[11px] font-extrabold text-amber-900 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>આ પાઠમાં શીખેલા શબ્દો:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {chapter.pairs.map((p) => (
                <span
                  key={p.id}
                  className="text-[11px] font-bold bg-white text-stone-800 px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs"
                >
                  {p.word} = {p.synonym}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                sounds.stopCelebrationMusic();
                sounds.playClick();
                onNextChapter();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md shadow-amber-500/30 transition-all scale-102"
            >
              <span>આગળનો પાઠ રમો</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sounds.stopCelebrationMusic();
                  sounds.playClick();
                  onPlayAgain();
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ફરીથી રમો</span>
              </button>

              <button
                onClick={() => {
                  sounds.stopCelebrationMusic();
                  sounds.playClick();
                  onOpenCertificate();
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>પ્રમાણપત્ર</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
