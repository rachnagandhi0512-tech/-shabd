import React, { useState, useEffect } from 'react';
import { WordPair, ChapterUnit, toGujaratiNumber, ALL_WORD_PAIRS } from '../data/samanarthiWords';
import { Volume2, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface RapidQuizGameProps {
  chapter: ChapterUnit;
  onLevelComplete: (stats: { chapterId: string; score: number; mistakes: number; stars: number }) => void;
  onNextChapter: () => void;
}

export const RapidQuizGame: React.FC<RapidQuizGameProps> = ({
  chapter,
  onLevelComplete,
  onNextChapter,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [options, setOptions] = useState<string[]>([]);

  const currentPair = chapter.pairs[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setScore(0);
    setMistakes(0);
    loadQuestion(0);
  }, [chapter]);

  const loadQuestion = (index: number) => {
    setSelectedOption(null);
    setIsAnswered(false);

    const target = chapter.pairs[index];
    if (!target) return;

    // Pick 3 distractors from chapter or other pairs
    const distractors = ALL_WORD_PAIRS
      .filter((p) => p.synonym !== target.synonym && p.word !== target.word)
      .map((p) => p.synonym)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const fullOptions = [target.synonym, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(fullOptions);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    sounds.playClick();
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentPair.synonym;

    if (isCorrect) {
      sounds.playSuccess();
      setScore((s) => s + 100);
      sounds.speakGujarati(`સાચો જવાબ! ${currentPair.word} એટલે ${currentPair.synonym}`);
    } else {
      sounds.playError();
      setMistakes((m) => m + 1);
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex + 1 < chapter.pairs.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      loadQuestion(nextIdx);
    } else {
      // Quiz complete
      sounds.playVictory();
      confetti({ particleCount: 80, spread: 70 });

      let stars = 3;
      if (mistakes >= 3) stars = 1;
      else if (mistakes >= 1) stars = 2;

      onLevelComplete({
        chapterId: chapter.id,
        score,
        mistakes,
        stars,
      });
    }
  };

  const isLast = currentIndex === chapter.pairs.length - 1;

  if (!currentPair) return null;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4">
      {/* Quiz Top Bar */}
      <div className="bg-white rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs mb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              ⚡ પ્રાથમિક શાળા કસોટી: {chapter.title}
            </span>
            <h2 className="text-base sm:text-lg font-black text-stone-800 mt-1">
              સાચો સમાનાર્થી વિકલ્પ પસંદ કરો
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-2xl text-xs font-extrabold text-emerald-900">
              પ્રશ્ન: {toGujaratiNumber(currentIndex + 1)} / {toGujaratiNumber(chapter.pairs.length)}
            </span>
            <span className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-2xl text-xs font-extrabold text-amber-900">
              અંક: {toGujaratiNumber(score)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / chapter.pairs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm text-center">
        
        <p className="text-xs sm:text-sm font-bold text-stone-500 mb-2">
          નીચે આપેલા શબ્દનો સાચો સમાનાર્થી કયો છે?
        </p>

        {/* Highlighted Word */}
        <div className="inline-flex items-center gap-3 bg-amber-50 border-2 border-amber-300 px-6 py-3 rounded-3xl shadow-xs mb-6">
          <span className="text-2xl sm:text-3xl font-black text-amber-950">
            '{currentPair.word}'
          </span>
          <button
            onClick={() => sounds.speakGujarati(currentPair.word)}
            className="p-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            title="ઉચ્ચાર સાંભળો"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mx-auto mb-6">
          {options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentPair.synonym;

            let btnStyle = 'bg-stone-50 border-stone-200 hover:border-amber-300 text-stone-800 hover:bg-stone-100';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-4 ring-emerald-200 font-black';
              } else if (isSelected) {
                btnStyle = 'bg-rose-100 border-rose-500 text-rose-950 ring-4 ring-rose-200 font-black';
              } else {
                btnStyle = 'bg-stone-50 border-stone-200 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border-2 text-left font-bold text-base sm:text-lg flex items-center justify-between transition-all ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-black/10 text-stone-700 text-xs font-black flex items-center justify-center">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card after answer */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 max-w-xl mx-auto mb-6 text-left animate-in fade-in">
            <div className="text-xs font-extrabold text-amber-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>શબ્દાર્થ અને સમજૂતી:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700">
              <strong>{currentPair.word}</strong> = <strong>{currentPair.synonym}</strong>
              {currentPair.alternates.length > 0 && ` (અન્ય: ${currentPair.alternates.join(', ')})`}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              વાક્યપ્રયોગ: <em>{currentPair.sentence}</em>
            </p>
          </div>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base mx-auto shadow-md transition-all scale-105"
          >
            <span>{isLast ? 'પરિણામ જુઓ' : 'આગળનો પ્રશ્ન'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

      </div>
    </div>
  );
};
