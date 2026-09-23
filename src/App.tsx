/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GCERT_STD6_CHAPTERS, ChapterUnit } from './data/samanarthiWords';
import { Header, GameMode } from './components/Header';
import { ChapterSelector } from './components/ChapterSelector';
import { ColumnMatchGame } from './components/ColumnMatchGame';
import { MemoryMatchGame } from './components/MemoryMatchGame';
import { RapidQuizGame } from './components/RapidQuizGame';
import { FlashcardsStudy } from './components/FlashcardsStudy';
import { VictoryModal } from './components/VictoryModal';
import { CertificateModal } from './components/CertificateModal';
import { WorksheetModal } from './components/WorksheetModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { sounds } from './utils/audio';
import { BalloonCelebration } from './components/BalloonCelebration';
import { FileText, Award, BookOpen, School, Sparkles } from 'lucide-react';

export default function App() {
  const [selectedChapter, setSelectedChapter] = useState<ChapterUnit>(GCERT_STD6_CHAPTERS[0]); // Default: એકમ ૧ - પર્વત તારા (પલાશ)
  const [currentMode, setCurrentMode] = useState<GameMode>('columns');
  const [studentName, setStudentName] = useState<string>('કાનો');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Chapter completion tracking
  const [chapterProgress, setChapterProgress] = useState<Record<string, { stars: number; completed: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('std6_gujarati_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modals state
  const [victoryStats, setVictoryStats] = useState<{ score: number; mistakes: number; stars: number } | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [showWorksheet, setShowWorksheet] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showBalloonGame, setShowBalloonGame] = useState<boolean>(false);

  // Sync audio toggle with sound manager
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sounds.setSoundEnabled(nextVal);
  };

  // Handle level completion
  const handleLevelComplete = (stats: { chapterId: string; score: number; mistakes: number; stars: number }) => {
    setScore((prev) => prev + stats.score);
    setStreak((prev) => prev + 1);

    const updated = {
      ...chapterProgress,
      [stats.chapterId]: {
        stars: Math.max(chapterProgress[stats.chapterId]?.stars || 0, stats.stars),
        completed: true,
      },
    };
    setChapterProgress(updated);
    try {
      localStorage.setItem('std6_gujarati_progress', JSON.stringify(updated));
    } catch {
      // Storage error ignored
    }

    setVictoryStats({
      score: stats.score,
      mistakes: stats.mistakes,
      stars: stats.stars,
    });
  };

  // Jump to next chapter
  const handleNextChapter = () => {
    setVictoryStats(null);
    const currentIndex = GCERT_STD6_CHAPTERS.findIndex((c) => c.id === selectedChapter.id);
    if (currentIndex !== -1 && currentIndex + 1 < GCERT_STD6_CHAPTERS.length) {
      setSelectedChapter(GCERT_STD6_CHAPTERS[currentIndex + 1]);
    } else {
      setSelectedChapter(GCERT_STD6_CHAPTERS[0]);
    }
  };

  const completedCount = Object.values(chapterProgress).filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Navigation & App Header */}
      <Header
        score={score}
        streak={streak}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        studentName={studentName}
        onUpdateStudentName={setStudentName}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Chapter Selection Bar with Categories (પ્રથમ સત્ર / દ્વિતીય સત્ર) */}
      <ChapterSelector
        selectedChapterId={selectedChapter.id}
        onSelectChapter={setSelectedChapter}
        chapterProgress={chapterProgress}
      />

      {/* Primary School Classroom Tools Banner */}
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-teal-500/10 border border-amber-200/80 rounded-2xl px-4 py-2 text-xs font-bold">
          
          <div className="flex items-center gap-2 text-stone-700">
            <School className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>ગુજરાત પ્રાથમિક શાળા શિક્ષણ:</strong> ધોરણ ૬ ગુજરાતી પાઠ્યપુસ્તક આધારિત વ્યાકરણ અને શબ્દ ભંડોળ.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorksheet(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold transition-all shadow-2xs hover:scale-102"
              title="શાળા માટે પ્રશ્નપત્ર / વર્કશીટ પ્રિન્ટ કરો"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>એકમ કસોટી વર્કશીટ પ્રિન્ટ કરો</span>
            </button>

            <button
              onClick={() => setShowBalloonGame(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-linear-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xs font-extrabold transition-all shadow-2xs hover:scale-105 animate-pulse"
              title="ફુગ્ગા ફોડો અને મ્યુઝિક માણો"
            >
              <span>🎈 ફુગ્ગા ફોડો!</span>
            </button>

            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-2xs hover:scale-102"
              title="વિદ્યાર્થી પ્રશંસા પ્રમાણપત્ર જુઓ"
            >
              <Award className="w-3.5 h-3.5" />
              <span>પ્રમાણપત્ર</span>
            </button>
          </div>

        </div>
      </div>

      {/* Active Game Area */}
      <main className="flex-1 py-2">
        {currentMode === 'columns' && (
          <ColumnMatchGame
            chapter={selectedChapter}
            onLevelComplete={handleLevelComplete}
            onNextChapter={handleNextChapter}
            onOpenStudy={() => setCurrentMode('study')}
          />
        )}

        {currentMode === 'memory' && (
          <MemoryMatchGame
            chapter={selectedChapter}
            onLevelComplete={handleLevelComplete}
            onNextChapter={handleNextChapter}
          />
        )}

        {currentMode === 'quiz' && (
          <RapidQuizGame
            chapter={selectedChapter}
            onLevelComplete={handleLevelComplete}
            onNextChapter={handleNextChapter}
          />
        )}

        {currentMode === 'study' && (
          <FlashcardsStudy
            currentChapter={selectedChapter}
            onSelectChapter={setSelectedChapter}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500">
        <p className="font-semibold text-stone-600">
          ધોરણ ૬ ગુજરાતી વિષય સમાનાર્થી શબ્દો જોડકાં રમત • પ્રાથમિક શાળા અને GCERT અભ્યાસક્રમ
        </p>
        <p className="mt-0.5 text-[11px] text-stone-400">
          વિદ્યાર્થીઓ માટે ગુજરાતી ભાષાના શબ્દો, સાચા સમાનાર્થી, અર્થ અને ઉચ્ચાર શીખવા માટેનું શૈક્ષણિક માધ્યમ.
        </p>
      </footer>

      {/* Victory Celebration Modal */}
      {victoryStats && (
        <VictoryModal
          chapter={selectedChapter}
          studentName={studentName}
          stats={victoryStats}
          onPlayAgain={() => setVictoryStats(null)}
          onNextChapter={handleNextChapter}
          onOpenCertificate={() => {
            setVictoryStats(null);
            setShowCertificate(true);
          }}
          onClose={() => setVictoryStats(null)}
        />
      )}

      {/* Student Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          studentName={studentName}
          totalScore={score}
          completedChaptersCount={completedCount}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Printable Classroom Worksheet Modal */}
      {showWorksheet && (
        <WorksheetModal
          chapter={selectedChapter}
          studentName={studentName}
          onClose={() => setShowWorksheet(false)}
        />
      )}

      {/* Standalone Balloon Celebration Mode */}
      {showBalloonGame && (
        <BalloonCelebration onClose={() => setShowBalloonGame(false)} />
      )}

      {/* How to Play Help Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

    </div>
  );
}
