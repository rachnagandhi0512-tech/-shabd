import React, { useState, useEffect, useRef } from 'react';
import { WordPair, ChapterUnit, toGujaratiNumber } from '../data/samanarthiWords';
import { Volume2, Sparkles, Lightbulb, RotateCcw, Check, ArrowRight, Star, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ColumnMatchGameProps {
  chapter: ChapterUnit;
  onLevelComplete: (stats: { chapterId: string; score: number; mistakes: number; stars: number }) => void;
  onNextChapter: () => void;
  onOpenStudy: () => void;
}

const PAIR_COLORS = [
  { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800', badge: 'bg-emerald-500 text-white', stroke: '#10b981' },
  { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-500 text-white', stroke: '#3b82f6' },
  { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-500 text-white', stroke: '#a855f7' },
  { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-500 text-white', stroke: '#f59e0b' },
  { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-800', badge: 'bg-pink-500 text-white', stroke: '#ec4899' },
  { border: 'border-teal-500', bg: 'bg-teal-50', text: 'text-teal-800', badge: 'bg-teal-500 text-white', stroke: '#14b8a6' },
  { border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-800', badge: 'bg-rose-500 text-white', stroke: '#f43f5e' },
  { border: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-800', badge: 'bg-indigo-500 text-white', stroke: '#6366f1' },
];

export const ColumnMatchGame: React.FC<ColumnMatchGameProps> = ({
  chapter,
  onLevelComplete,
  onNextChapter,
  onOpenStudy,
}) => {
  const [leftItems, setLeftItems] = useState<WordPair[]>([]);
  const [rightItems, setRightItems] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // leftId -> rightId
  const [mistakes, setMistakes] = useState<number>(0);
  const [shakingLeft, setShakingLeft] = useState<string | null>(null);
  const [shakingRight, setShakingRight] = useState<string | null>(null);
  const [hintPair, setHintPair] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<Array<{ id: string; x1: number; y1: number; x2: number; y2: number; color: string }>>([]);

  // Initialize and shuffle columns when chapter changes
  useEffect(() => {
    resetGame();
  }, [chapter]);

  const resetGame = () => {
    const original = [...chapter.pairs];
    // Left column: words in natural order
    setLeftItems(original);
    // Right column: synonyms shuffled
    const shuffled = [...original].sort(() => Math.random() - 0.5);
    setRightItems(shuffled);

    setSelectedLeft(null);
    setSelectedRight(null);
    setMatches({});
    setMistakes(0);
    setShakingLeft(null);
    setShakingRight(null);
    setHintPair(null);
    setFeedbackMsg({
      text: `ડાબી બાજુનો શબ્દ અને જમણી બાજુનો સાચો સમાનાર્થી પસંદ કરીને જોડો.`,
      type: 'info',
    });
    setLines([]);
  };

  // Recalculate connecting SVG lines
  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: Array<{ id: string; x1: number; y1: number; x2: number; y2: number; color: string }> = [];

    const matchedEntries = Object.entries(matches);
    matchedEntries.forEach(([leftId, rightId], index) => {
      const leftEl = leftItemRefs.current[leftId];
      const rightEl = rightItemRefs.current[rightId];
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();

        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;

        const colorTheme = PAIR_COLORS[index % PAIR_COLORS.length];
        newLines.push({
          id: `${leftId}-${rightId}`,
          x1,
          y1,
          x2,
          y2,
          color: colorTheme.stroke,
        });
      }
    });

    setLines(newLines);
  };

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [matches]);

  // Handle clicking left column item
  const handleLeftClick = (item: WordPair) => {
    // If already matched, just speak
    if (matches[item.id]) {
      sounds.speakGujarati(item.word);
      return;
    }

    sounds.playClick();
    setHintPair(null);

    if (selectedRight) {
      // Both chosen -> evaluate match
      checkPairMatch(item.id, selectedRight);
    } else {
      setSelectedLeft(item.id);
      sounds.speakGujarati(item.word);
      setFeedbackMsg({
        text: `'${item.word}' માટે સામેથી સાચો સમાનાર્થી શબ્દ શોધો.`,
        type: 'info',
      });
    }
  };

  // Handle clicking right column item
  const handleRightClick = (item: WordPair) => {
    // Check if right item is already matched
    const isMatched = Object.values(matches).includes(item.id);
    if (isMatched) {
      sounds.speakGujarati(item.synonym);
      return;
    }

    sounds.playClick();
    setHintPair(null);

    if (selectedLeft) {
      // Both chosen -> evaluate match
      checkPairMatch(selectedLeft, item.id);
    } else {
      setSelectedRight(item.id);
      sounds.speakGujarati(item.synonym);
      setFeedbackMsg({
        text: `'${item.synonym}' નો મુખ્ય શબ્દ ડાબી બાજુથી શોધો.`,
        type: 'info',
      });
    }
  };

  // Check if chosen pair is a match
  const checkPairMatch = (leftId: string, rightId: string) => {
    const leftItem = leftItems.find((p) => p.id === leftId);
    const rightItem = rightItems.find((p) => p.id === rightId);

    if (!leftItem || !rightItem) return;

    if (leftItem.id === rightItem.id) {
      // CORRECT MATCH!
      sounds.playSuccess();
      const newMatches = { ...matches, [leftId]: rightId };
      setMatches(newMatches);
      setSelectedLeft(null);
      setSelectedRight(null);

      const remaining = leftItems.length - Object.keys(newMatches).length;
      setFeedbackMsg({
        text: `સરસ! સાચું જોડકું: ${leftItem.word} = ${rightItem.synonym} (${leftItem.meaning})`,
        type: 'success',
      });

      // Pronounce both words
      setTimeout(() => {
        sounds.speakGujarati(`${leftItem.word}, એટલે ${rightItem.synonym}`);
      }, 200);

      // Check level completion
      if (remaining === 0) {
        handleGameVictory(newMatches);
      }
    } else {
      // WRONG MATCH
      sounds.playError();
      setMistakes((prev) => prev + 1);
      setShakingLeft(leftId);
      setShakingRight(rightId);

      setFeedbackMsg({
        text: `અરેરે! '${leftItem.word}' અને '${rightItem.synonym}' સમાનાર્થી નથી. ફરી પ્રયત્ન કરો!`,
        type: 'error',
      });

      setTimeout(() => {
        setShakingLeft(null);
        setShakingRight(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  // Provide a friendly hint
  const handleShowHint = () => {
    const unmatched = leftItems.filter((item) => !matches[item.id]);
    if (unmatched.length === 0) return;

    sounds.playClick();
    const hintTarget = unmatched[0];
    setHintPair(hintTarget.id);
    setSelectedLeft(hintTarget.id);
    setSelectedRight(null);

    setFeedbackMsg({
      text: `💡 ઇશારો: '${hintTarget.word}' નો અર્થ '${hintTarget.meaning}' થાય છે. સામે '${hintTarget.synonym}' શોધો!`,
      type: 'info',
    });
  };

  // Level victory completion
  const handleGameVictory = (finalMatches: Record<string, string>) => {
    sounds.playVictory();
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    });

    const totalPairs = chapter.pairs.length;
    let stars = 3;
    if (mistakes >= 3) stars = 1;
    else if (mistakes >= 1) stars = 2;

    const baseScore = totalPairs * 100;
    const penalty = mistakes * 20;
    const finalScore = Math.max(100, baseScore - penalty);

    setTimeout(() => {
      onLevelComplete({
        chapterId: chapter.id,
        score: finalScore,
        mistakes,
        stars,
      });
    }, 1200);
  };

  const matchedCount = Object.keys(matches).length;
  const totalCount = chapter.pairs.length;
  const isFinished = matchedCount === totalCount;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Chapter Information Card */}
      <div className="bg-white rounded-3xl border border-amber-200/80 p-4 sm:p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {chapter.chapterNumber === 0 ? 'સંપૂર્ણ મહાસંગ્રામ' : `${chapter.chapterType} ${toGujaratiNumber(chapter.chapterNumber)}`}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {chapter.semester}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                લેખક/કવિ: <strong className="text-stone-700">{chapter.author}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {chapter.title} - <span className="text-amber-600">સમાનાર્થી શબ્દોનાં જોડકાં</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {chapter.description}
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleShowHint}
              disabled={isFinished}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-colors disabled:opacity-50"
              title="મદદ / ઇશારો મેળવો"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>ઇશારો</span>
            </button>

            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-bold transition-colors"
              title="જોડકાં ફરીથી ગોઠવો"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ફરીથી</span>
            </button>

            <button
              onClick={onOpenStudy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold transition-colors"
              title="પાઠના બધા શબ્દોનો અભ્યાસ કરો"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">શબ્દાર્થ</span>
            </button>
          </div>

        </div>

        {/* Progress Bar & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-1">
              <span>જોડાયેલા જોડકાં: {toGujaratiNumber(matchedCount)} / {toGujaratiNumber(totalCount)}</span>
              <span className="text-amber-700">{Math.round((matchedCount / totalCount) * 100)}% પૂર્ણ</span>
            </div>
            <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(matchedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-stone-600 pl-0 sm:pl-4">
            <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl">
              ભૂલો: {toGujaratiNumber(mistakes)}
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl">
              સાચાં: {toGujaratiNumber(matchedCount)}
            </span>
          </div>
        </div>

      </div>

      {/* Dynamic Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 shadow-xs'
              : feedbackMsg.type === 'error'
              ? 'bg-rose-100/90 border-rose-300 text-rose-900 shadow-xs animate-shake'
              : 'bg-amber-50/90 border-amber-300 text-amber-900'
          }`}
        >
          {feedbackMsg.type === 'success' && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
          {feedbackMsg.type === 'error' && <RotateCcw className="w-4 h-4 text-rose-700 shrink-0" />}
          {feedbackMsg.type === 'info' && <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Two Column Matching Arena */}
      <div ref={containerRef} className="relative bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm min-h-[460px]">
        
        {/* SVG Live Connecting Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
          style={{ overflow: 'visible' }}
        >
          {lines.map((l) => (
            <g key={l.id}>
              {/* Soft glow stroke */}
              <line
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.color}
                strokeWidth={7}
                strokeOpacity={0.2}
                strokeLinecap="round"
              />
              {/* Solid connecting line */}
              <line
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.color}
                strokeWidth={3}
                strokeDasharray="6,4"
                strokeLinecap="round"
              />
              {/* Pin dots at ends */}
              <circle cx={l.x1} cy={l.y1} r={4} fill={l.color} />
              <circle cx={l.x2} cy={l.y2} r={4} fill={l.color} />
            </g>
          ))}
        </svg>

        {/* Column Headers */}
        <div className="grid grid-cols-2 gap-4 sm:gap-12 mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">
              અ
            </span>
            <h3 className="font-extrabold text-stone-800 text-sm sm:text-base">
              શબ્દ (મુખ્ય શબ્દ)
            </h3>
          </div>

          <div className="flex items-center gap-2 justify-end sm:justify-start">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">
              બ
            </span>
            <h3 className="font-extrabold text-stone-800 text-sm sm:text-base">
              સમાનાર્થી શબ્દ
            </h3>
          </div>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-12 relative z-20">
          
          {/* COLUMN A (શબ્દ) */}
          <div className="space-y-3">
            {leftItems.map((item, index) => {
              const isMatched = !!matches[item.id];
              const isSelected = selectedLeft === item.id;
              const isShaking = shakingLeft === item.id;
              const isHinted = hintPair === item.id;

              // Find color theme for matched pair
              const matchedEntries = Object.entries(matches);
              const matchIdx = matchedEntries.findIndex(([lId]) => lId === item.id);
              const colorTheme = matchIdx !== -1 ? PAIR_COLORS[matchIdx % PAIR_COLORS.length] : null;

              return (
                <div key={item.id} className="relative">
                  <button
                    ref={(el) => {
                      leftItemRefs.current[item.id] = el;
                    }}
                    onClick={() => handleLeftClick(item)}
                    className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 text-left transition-all ${
                      isMatched && colorTheme
                        ? `${colorTheme.bg} ${colorTheme.border} ${colorTheme.text} shadow-2xs font-black cursor-default`
                        : isSelected
                        ? 'bg-amber-100 border-amber-500 shadow-md ring-4 ring-amber-300 scale-[1.02] text-amber-950 font-black'
                        : isHinted
                        ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200 animate-pulse text-stone-900 font-bold'
                        : isShaking
                        ? 'bg-rose-50 border-rose-500 animate-wiggle text-rose-900 font-bold'
                        : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200 hover:border-amber-300 text-stone-800 font-bold hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                          isMatched && colorTheme
                            ? colorTheme.badge
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {toGujaratiNumber(index + 1)}
                      </span>

                      <div>
                        <span className="text-base sm:text-lg font-black block">
                          {item.word}
                        </span>
                        {isMatched && (
                          <span className="text-[11px] font-semibold text-stone-500 block">
                            {item.meaning}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.speakGujarati(item.word);
                        }}
                        className="p-1 rounded-lg hover:bg-black/5 text-stone-400 hover:text-stone-700 transition-colors"
                        title="ઉચ્ચાર સાંભળો"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {isMatched && (
                        <span className="p-1 rounded-full bg-emerald-500 text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* COLUMN B (સમાનાર્થી શબ્દ) */}
          <div className="space-y-3">
            {rightItems.map((item, index) => {
              const matchedEntry = Object.entries(matches).find(([, rId]) => rId === item.id);
              const isMatched = !!matchedEntry;
              const isSelected = selectedRight === item.id;
              const isShaking = shakingRight === item.id;
              const isHinted = hintPair === item.id;

              // Find color theme for matched pair
              const matchedEntries = Object.entries(matches);
              const matchIdx = matchedEntries.findIndex(([, rId]) => rId === item.id);
              const colorTheme = matchIdx !== -1 ? PAIR_COLORS[matchIdx % PAIR_COLORS.length] : null;

              return (
                <div key={item.id} className="relative">
                  <button
                    ref={(el) => {
                      rightItemRefs.current[item.id] = el;
                    }}
                    onClick={() => handleRightClick(item)}
                    className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 text-left transition-all ${
                      isMatched && colorTheme
                        ? `${colorTheme.bg} ${colorTheme.border} ${colorTheme.text} shadow-2xs font-black cursor-default`
                        : isSelected
                        ? 'bg-teal-100 border-teal-500 shadow-md ring-4 ring-teal-300 scale-[1.02] text-teal-950 font-black'
                        : isHinted
                        ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200 animate-pulse text-stone-900 font-bold'
                        : isShaking
                        ? 'bg-rose-50 border-rose-500 animate-wiggle text-rose-900 font-bold'
                        : 'bg-stone-50/80 hover:bg-stone-100 border-stone-200 hover:border-teal-300 text-stone-800 font-bold hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                          isMatched && colorTheme
                            ? colorTheme.badge
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      <div>
                        <span className="text-base sm:text-lg font-black block">
                          {item.synonym}
                        </span>
                        {isMatched && item.alternates && item.alternates.length > 0 && (
                          <span className="text-[11px] font-semibold text-stone-500 block">
                            અન્ય: {item.alternates.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.speakGujarati(item.synonym);
                        }}
                        className="p-1 rounded-lg hover:bg-black/5 text-stone-400 hover:text-stone-700 transition-colors"
                        title="ઉચ્ચાર સાંભળો"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {isMatched && (
                        <span className="p-1 rounded-full bg-emerald-500 text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

        </div>

        {/* Victory Celebration Card inside game once finished */}
        {isFinished && (
          <div className="mt-8 p-6 rounded-3xl bg-linear-to-r from-emerald-500 to-teal-600 text-white text-center shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
              <Star className="w-8 h-8 text-amber-300 fill-amber-300 animate-bounce delay-100" />
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce delay-200" />
            </div>
            <h3 className="text-2xl font-black mb-1">
              ખૂબ ખૂબ અભિનંદન! 🎉
            </h3>
            <p className="text-emerald-100 text-sm font-semibold max-w-md mx-auto mb-4">
              તમે <strong>{chapter.title}</strong> ના તમામ સમાનાર્થી શબ્દોનાં જોડકાં સાચાં જોડી લીધાં છે!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30"
              >
                ફરીથી રમો
              </button>
              <button
                onClick={onNextChapter}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-white text-emerald-900 text-xs sm:text-sm font-extrabold shadow-lg hover:bg-emerald-50 transition-all scale-105"
              >
                <span>આગળનો પાઠ રમો</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
