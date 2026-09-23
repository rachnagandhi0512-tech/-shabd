import React, { useState } from 'react';
import { WordPair, ChapterUnit, GCERT_STD6_CHAPTERS, toGujaratiNumber } from '../data/samanarthiWords';
import { Volume2, Search, BookOpen, Sparkles, Filter, ChevronRight, Layers } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FlashcardsStudyProps {
  currentChapter: ChapterUnit;
  onSelectChapter: (chapter: ChapterUnit) => void;
}

export const FlashcardsStudy: React.FC<FlashcardsStudyProps> = ({
  currentChapter,
  onSelectChapter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewScope, setViewScope] = useState<'current' | 'all'>('current');

  const pairsToDisplay = viewScope === 'current'
    ? currentChapter.pairs
    : GCERT_STD6_CHAPTERS.flatMap((ch) => ch.pairs);

  const filteredPairs = pairsToDisplay.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.word.includes(term) ||
      p.synonym.includes(term) ||
      p.meaning.includes(term) ||
      p.alternates.some((alt) => alt.includes(term))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-blue-200/80 p-4 sm:p-5 shadow-xs mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
              📖 પ્રાથમિક શાળા શબ્દકોશ અને અભ્યાસ
            </span>
            <h2 className="text-lg sm:text-xl font-black text-stone-800 mt-1">
              {viewScope === 'current' ? currentChapter.title : 'સંપૂર્ણ ધોરણ ૬ શબ્દકોશ'}
            </h2>
            <p className="text-xs text-stone-500">
              દરેક શબ્દનો સાચો સમાનાર્થી, અર્થ, વાક્યપ્રયોગ અને શુદ્ધ ઉચ્ચાર સાંભળો
            </p>
          </div>

          {/* Toggle View Scope */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              onClick={() => {
                setViewScope('current');
                sounds.playClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                viewScope === 'current'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              આ પાઠ ({toGujaratiNumber(currentChapter.pairs.length)})
            </button>
            <button
              onClick={() => {
                setViewScope('all');
                sounds.playClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                viewScope === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              બધા પાઠ ({toGujaratiNumber(GCERT_STD6_CHAPTERS.flatMap((c) => c.pairs).length)})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="કોઈપણ શબ્દ કે સમાનાર્થી શોધો (દા.ત. જનની, આકાશ, સૂર્ય)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPairs.map((pair, idx) => (
          <div
            key={pair.id || idx}
            className="bg-white rounded-3xl border border-stone-200 hover:border-blue-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Word & Primary Synonym */}
              <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shrink-0">
                    {toGujaratiNumber(idx + 1)}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-stone-900">
                      {pair.word}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 font-extrabold mt-0.5">
                      <span>સમાનાર્થી:</span>
                      <span className="text-base text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {pair.synonym}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pronounce Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    sounds.speakGujarati(`${pair.word}, સમાનાર્થી શબ્દ ${pair.synonym}`);
                  }}
                  className="p-2.5 rounded-2xl bg-stone-50 hover:bg-blue-50 text-stone-600 hover:text-blue-700 border border-stone-200 hover:border-blue-300 transition-colors"
                  title="ઉચ્ચાર સાંભળો"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Alternate Synonyms */}
              {pair.alternates && pair.alternates.length > 0 && (
                <div className="mb-2.5">
                  <span className="text-xs font-bold text-stone-500">અન્ય સમાનાર્થી: </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {pair.alternates.map((alt, aIdx) => (
                      <span
                        key={aIdx}
                        className="text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meaning */}
              <div className="text-xs sm:text-sm text-stone-700 mb-2">
                <strong className="text-stone-800">અર્થ: </strong>
                <span>{pair.meaning}</span>
              </div>
            </div>

            {/* Sentence Usage */}
            <div className="mt-2 pt-2 border-t border-stone-100 bg-stone-50/70 p-2.5 rounded-2xl text-xs text-stone-600">
              <strong className="text-stone-700">વાક્યપ્રયોગ: </strong>
              <em className="text-stone-800 font-medium">"{pair.sentence}"</em>
            </div>
          </div>
        ))}
      </div>

      {filteredPairs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-700">કોઈ શબ્દ મળ્યો નહીં</h3>
          <p className="text-xs text-stone-500 mt-1">કૃપા કરીને બીજો શબ્દ શોધો</p>
        </div>
      )}
    </div>
  );
};
