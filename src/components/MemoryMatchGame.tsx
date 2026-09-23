import React, { useState, useEffect } from 'react';
import { WordPair, ChapterUnit, toGujaratiNumber } from '../data/samanarthiWords';
import { Volume2, Sparkles, RotateCcw, Check, Star, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface MemoryCard {
  cardId: string;
  pairId: string;
  text: string;
  type: 'word' | 'synonym';
  pair: WordPair;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  chapter: ChapterUnit;
  onLevelComplete: (stats: { chapterId: string; score: number; mistakes: number; stars: number }) => void;
  onNextChapter: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  chapter,
  onLevelComplete,
  onNextChapter,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    initGame();
  }, [chapter]);

  const initGame = () => {
    const pairs = chapter.pairs.slice(0, 6); // Up to 6 pairs = 12 cards
    const cardList: MemoryCard[] = [];

    pairs.forEach((p, idx) => {
      // Main word card
      cardList.push({
        cardId: `w-${idx}-${p.id}`,
        pairId: p.id,
        text: p.word,
        type: 'word',
        pair: p,
        isFlipped: false,
        isMatched: false,
      });

      // Synonym card
      cardList.push({
        cardId: `s-${idx}-${p.id}`,
        pairId: p.id,
        text: p.synonym,
        type: 'synonym',
        pair: p,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle randomly
    cardList.sort(() => Math.random() - 0.5);

    setCards(cardList);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsLocked(false);
  };

  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    sounds.playClick();
    sounds.speakGujarati(card.text);

    const updated = cards.map((c) =>
      c.cardId === card.cardId ? { ...c, isFlipped: true } : c
    );
    setCards(updated);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [first, second] = newFlipped;

      if (first.pairId === second.pairId && first.type !== second.type) {
        // MATCH!
        sounds.playSuccess();
        setTimeout(() => {
          sounds.speakGujarati(`${first.text} અને ${second.text}`);
        }, 150);

        const marked = updated.map((c) =>
          c.pairId === first.pairId ? { ...c, isMatched: true, isFlipped: true } : c
        );
        setCards(marked);
        setFlippedCards([]);
        setIsLocked(false);

        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);

        if (newMatched === chapter.pairs.slice(0, 6).length) {
          handleVictory(moves + 1);
        }
      } else {
        // NOT A MATCH
        sounds.playError();
        setTimeout(() => {
          const resetFlipped = updated.map((c) =>
            c.cardId === first.cardId || c.cardId === second.cardId
              ? { ...c, isFlipped: false }
              : c
          );
          setCards(resetFlipped);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleVictory = (finalMoves: number) => {
    sounds.playVictory();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    let stars = 3;
    if (finalMoves > 12) stars = 1;
    else if (finalMoves > 8) stars = 2;

    setTimeout(() => {
      onLevelComplete({
        chapterId: chapter.id,
        score: Math.max(100, 600 - finalMoves * 15),
        mistakes: Math.max(0, finalMoves - 6),
        stars,
      });
    }, 1200);
  };

  const totalPairs = chapter.pairs.slice(0, 6).length;
  const isFinished = matchedPairs === totalPairs;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
      {/* Chapter Title & Memory Stats */}
      <div className="bg-white rounded-3xl border border-purple-200/80 p-4 sm:p-5 shadow-xs mb-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
            🃏 મેમરી કાર્ડ રમત: {chapter.title}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-stone-800 mt-1">
            કાર્ડ ઉલટાવીને સમાનાર્થી જોડી શોધો
          </h2>
          <p className="text-xs text-stone-500">
            એક કાર્ડ પર શબ્દ અને બીજા પર તેનો સાચો સમાનાર્થી છુપાયેલો છે.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-purple-900">
            પ્રયત્નો: {toGujaratiNumber(moves)}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-900">
            જોડીઓ: {toGujaratiNumber(matchedPairs)} / {toGujaratiNumber(totalPairs)}
          </div>
          <button
            onClick={initGame}
            className="p-2 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition-colors"
            title="ફરીથી કાર્ડ વહેંચો"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 min-h-[380px]">
        {cards.map((card) => {
          const showFace = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.cardId}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched || isLocked}
              className={`h-28 sm:h-32 rounded-3xl p-3 border-2 transition-all transform perspective-1000 flex flex-col items-center justify-center text-center relative select-none ${
                card.isMatched
                  ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                  : showFace
                  ? 'bg-white border-purple-500 shadow-lg ring-4 ring-purple-200 scale-105'
                  : 'bg-linear-to-br from-amber-400 to-orange-500 border-amber-600 shadow-sm hover:scale-102 hover:shadow-md cursor-pointer'
              }`}
            >
              {showFace ? (
                <>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-1 ${
                      card.type === 'word'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {card.type === 'word' ? 'મુખ્ય શબ્દ' : 'સમાનાર્થી'}
                  </span>
                  <span className="text-base sm:text-xl font-black text-stone-900 line-clamp-1">
                    {card.text}
                  </span>
                  {card.isMatched && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
                      <Check className="w-3.5 h-3.5" />
                      સાચી જોડી!
                    </span>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <span className="text-2xl sm:text-3xl font-black drop-shadow-sm mb-1">
                    ?
                  </span>
                  <span className="text-[10px] font-extrabold tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                    ગુજરાતી
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="mt-6 p-5 rounded-3xl bg-linear-to-r from-purple-600 to-indigo-600 text-white text-center shadow-xl animate-in zoom-in-95">
          <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
            <Star className="w-6 h-6 fill-amber-300" />
            <Star className="w-7 h-7 fill-amber-300" />
            <Star className="w-6 h-6 fill-amber-300" />
          </div>
          <h3 className="text-xl font-black mb-1">અદ્ભુત યાદશક્તિ! 🎉</h3>
          <p className="text-purple-100 text-xs sm:text-sm mb-3">
            તમે {toGujaratiNumber(moves)} પ્રયત્નોમાં તમામ કાર્ડની સાચી જોડીઓ શોધી લીધી!
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={initGame}
              className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30"
            >
              ફરીથી રમો
            </button>
            <button
              onClick={onNextChapter}
              className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white text-purple-900 text-xs sm:text-sm font-extrabold shadow-md hover:bg-purple-50 transition-all"
            >
              <span>આગળનો પાઠ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
