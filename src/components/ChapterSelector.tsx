import React, { useState } from 'react';
import { GCERT_STD6_CHAPTERS, ChapterUnit, toGujaratiNumber } from '../data/samanarthiWords';
import { BookOpen, Star, CheckCircle, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ChapterSelectorProps {
  selectedChapterId: string;
  onSelectChapter: (chapter: ChapterUnit) => void;
  chapterProgress: Record<string, { stars: number; completed: boolean }>;
}

export const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  selectedChapterId,
  onSelectChapter,
  chapterProgress,
}) => {
  const [filterSemester, setFilterSemester] = useState<'all' | 'પ્રથમ સત્ર' | 'દ્વિતીય સત્ર'>('all');

  const filteredChapters = GCERT_STD6_CHAPTERS.filter((ch) => {
    if (filterSemester === 'all') return true;
    return ch.semester === filterSemester;
  });

  return (
    <div className="bg-stone-50/70 border-b border-amber-200/60 py-3.5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Title & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-stone-800 flex items-center gap-2">
                એકમ પસંદ કરો (પલાશ - નવો અભ્યાસક્રમ):
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                નવા પાઠ્યપુસ્તક 'પલાશ'ના દરેક એકમ પ્રમાણે સમાનાર્થી શબ્દો અલગ કરેલા છે
              </p>
            </div>
          </div>

          {/* Semester Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => {
                setFilterSemester('all');
                sounds.playClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterSemester === 'all'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              બધા પાઠ ({GCERT_STD6_CHAPTERS.length})
            </button>
            <button
              onClick={() => {
                setFilterSemester('પ્રથમ સત્ર');
                sounds.playClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterSemester === 'પ્રથમ સત્ર'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              પ્રથમ સત્ર (૧ થી ૯)
            </button>
            <button
              onClick={() => {
                setFilterSemester('દ્વિતીય સત્ર');
                sounds.playClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterSemester === 'દ્વિતીય સત્ર'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              દ્વિતીય સત્ર (૧૦ થી ૧૭)
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable or Grid Chapter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredChapters.map((ch) => {
            const isSelected = ch.id === selectedChapterId;
            const progress = chapterProgress[ch.id] || { stars: 0, completed: false };

            return (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChapter(ch);
                  sounds.playClick();
                }}
                className={`relative flex flex-col justify-between p-3 rounded-2xl text-left border-2 transition-all group ${
                  isSelected
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-300 scale-[1.02]'
                    : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-sm hover:scale-[1.01]'
                }`}
              >
                {/* Header Tag & Stars */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        ch.chapterNumber === 0
                          ? 'bg-purple-100 text-purple-800'
                          : ch.semester === 'પ્રથમ સત્ર'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {ch.chapterNumber === 0
                        ? 'મહાસંગ્રામ'
                        : `${ch.chapterType} ${toGujaratiNumber(ch.chapterNumber)}`}
                    </span>

                    {/* Progress Stars */}
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            progress.stars >= starIdx
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Chapter Title */}
                  <h3
                    className={`font-extrabold text-xs sm:text-sm line-clamp-1 ${
                      isSelected ? 'text-amber-950' : 'text-stone-800'
                    }`}
                  >
                    {ch.title}
                  </h3>

                  {/* Author / Info */}
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {ch.author}
                  </p>
                </div>

                {/* Footer Count Badge & Status */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px] font-bold">
                  <span className="text-stone-500">
                    {toGujaratiNumber(ch.pairs.length)} જોડકાં
                  </span>

                  {progress.completed ? (
                    <span className="flex items-center gap-0.5 text-emerald-600 font-extrabold text-[10px]">
                      <CheckCircle className="w-3 h-3" />
                      પૂર્ણ
                    </span>
                  ) : isSelected ? (
                    <span className="text-amber-600 font-extrabold text-[10px] flex items-center">
                      રમતમાં છે
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
