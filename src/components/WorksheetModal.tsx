import React, { useState } from 'react';
import { ChapterUnit, toGujaratiNumber } from '../data/samanarthiWords';
import { Printer, X, FileText, CheckCircle, School } from 'lucide-react';
import { sounds } from '../utils/audio';

interface WorksheetModalProps {
  chapter: ChapterUnit;
  studentName: string;
  onClose: () => void;
}

export const WorksheetModal: React.FC<WorksheetModalProps> = ({
  chapter,
  studentName,
  onClose,
}) => {
  const [schoolName, setSchoolName] = useState('શ્રી પ્રાથમિક શાળા');
  const [rollNo, setRollNo] = useState('૧');

  const shuffledSynonyms = [...chapter.pairs].sort(() => Math.random() - 0.5);

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Toolbar (hidden during print) */}
        <div className="bg-stone-100 px-5 py-3 border-b border-stone-200 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-stone-800 font-extrabold text-sm">
            <School className="w-5 h-5 text-amber-600" />
            <span>પ્રાથમિક શાળા એકમ કસોટી પત્રક (Worksheet)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>પ્રિન્ટ / PDF સેવ કરો</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Worksheet Body */}
        <div className="p-6 sm:p-10 overflow-y-auto font-sans text-stone-900 bg-white">
          
          {/* Header of Test Paper */}
          <div className="border-b-2 border-stone-900 pb-4 mb-6 text-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {schoolName}
            </h1>
            <h2 className="text-base font-bold text-stone-700 mt-0.5">
              પ્રાથમિક શાળા મૂલ્યાંકન કસોટી: ધોરણ ૬ (છઠ્ઠું)
            </h2>
            <div className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-3 py-0.5 rounded-full text-xs font-extrabold mt-1">
              વિષય: ગુજરાતી | એકમ: {chapter.title} ({chapter.semester})
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-300 text-xs sm:text-sm font-bold text-left">
              <div>
                વિદ્યાર્થીનું નામ: <span className="underline">{studentName || '_____________'}</span>
              </div>
              <div>
                હાજરી નંબર: <span className="underline">{rollNo}</span>
              </div>
              <div className="text-right">
                કુલ ગુણ: <span className="font-black">૧૫</span>
              </div>
            </div>
          </div>

          {/* Question 1: Match the pairs (જોડકાં જોડો) */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-extrabold mb-3">
              પ્રશ્ન ૧: નીચે આપેલા 'અ' વિભાગના શબ્દો સામે 'બ' વિભાગમાંથી સાચો સમાનાર્થી શોધીને જોડો. (ગુણ: ૬)
            </h3>

            <div className="grid grid-cols-3 gap-4 border border-stone-300 p-4 rounded-xl">
              <div>
                <div className="font-extrabold text-xs sm:text-sm border-b border-stone-300 pb-1 mb-2">
                  વિભાગ 'અ' (શબ્દ)
                </div>
                {chapter.pairs.map((p, idx) => (
                  <div key={p.id} className="py-1 text-xs sm:text-sm font-semibold">
                    ({toGujaratiNumber(idx + 1)}) {p.word}
                  </div>
                ))}
              </div>

              <div>
                <div className="font-extrabold text-xs sm:text-sm border-b border-stone-300 pb-1 mb-2 text-center">
                  જવાબ
                </div>
                {chapter.pairs.map((p, idx) => (
                  <div key={p.id} className="py-1 text-xs sm:text-sm font-semibold text-center">
                    ({toGujaratiNumber(idx + 1)}) [ &nbsp;&nbsp;&nbsp;&nbsp; ]
                  </div>
                ))}
              </div>

              <div>
                <div className="font-extrabold text-xs sm:text-sm border-b border-stone-300 pb-1 mb-2">
                  વિભાગ 'બ' (સમાનાર્થી)
                </div>
                {shuffledSynonyms.map((p, idx) => (
                  <div key={p.id} className="py-1 text-xs sm:text-sm font-semibold">
                    ({String.fromCharCode(65 + idx)}) {p.synonym}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question 2: Two synonyms each */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-extrabold mb-3">
              પ્રશ્ન ૨: નીચે આપેલા શબ્દોના બબ્બે સમાનાર્થી શબ્દો લખો. (ગુણ: ૪)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {chapter.pairs.slice(0, 4).map((p, idx) => (
                <div key={p.id} className="text-xs sm:text-sm font-bold border-b border-stone-200 pb-2">
                  ({toGujaratiNumber(idx + 1)}) {p.word} = (૧) ____________ &nbsp; (૨) ____________
                </div>
              ))}
            </div>
          </div>

          {/* Question 3: Sentence making */}
          <div>
            <h3 className="text-sm sm:text-base font-extrabold mb-3">
              પ્રશ્ન ૩: આપેલા સમાનાર્થી શબ્દનો ઉપયોગ કરી વાક્ય બનાવો. (ગુણ: ૫)
            </h3>
            <div className="space-y-3">
              {chapter.pairs.slice(0, 3).map((p, idx) => (
                <div key={p.id} className="text-xs sm:text-sm font-bold">
                  <div>({toGujaratiNumber(idx + 1)}) શબ્દ: '{p.synonym}' ({p.word})</div>
                  <div className="mt-1 border-b border-dashed border-stone-400 h-6"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Signature */}
          <div className="mt-10 pt-6 border-t border-stone-300 flex justify-between text-xs sm:text-sm font-bold text-stone-600">
            <div>વિદ્યાર્થીની સહી: _________________</div>
            <div>શિક્ષકની સહી / ગુણ: ____ / ૧૫</div>
          </div>

        </div>

      </div>
    </div>
  );
};
