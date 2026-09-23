import React, { useRef } from 'react';
import { Award, Printer, X, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { toGujaratiNumber } from '../data/samanarthiWords';

interface CertificateModalProps {
  studentName: string;
  totalScore: number;
  completedChaptersCount: number;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  totalScore,
  completedChaptersCount,
  onClose,
}) => {
  const dateStr = new Date().toLocaleDateString('gu-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="bg-stone-100 px-5 py-3 border-b border-stone-200 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-stone-800 font-extrabold text-sm">
            <Award className="w-5 h-5 text-amber-600" />
            <span>પ્રાથમિક શાળા પ્રશંસા પ્રમાણપત્ર</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>પ્રિન્ટ / સાચવો</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="p-8 sm:p-12 text-center bg-linear-to-b from-amber-50/50 to-orange-50/30 border-8 border-double border-amber-400 m-4 sm:m-6 rounded-3xl relative">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 text-amber-400 text-xl font-black">✦</div>
          <div className="absolute top-3 right-3 text-amber-400 text-xl font-black">✦</div>
          <div className="absolute bottom-3 left-3 text-amber-400 text-xl font-black">✦</div>
          <div className="absolute bottom-3 right-3 text-amber-400 text-xl font-black">✦</div>

          {/* Badge Icon */}
          <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-lg ring-4 ring-amber-300 mb-3">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-800 mb-1">
            ગુજરાત પ્રાથમિક શિક્ષણ બોર્ડ - ધોરણ ૬
          </h3>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
            પ્રશંસા પ્રમાણપત્ર
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto mb-4">
            આથી પ્રમાણિત કરવામાં આવે છે કે તેજસ્વી વિદ્યાર્થી/વિદ્યાર્થિની
          </p>

          <div className="inline-block border-b-2 border-amber-600 px-8 py-1 mb-4">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">
              {studentName || 'વિદ્યાર્થી'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 max-w-lg mx-auto leading-relaxed mb-6 font-medium">
            એ ધોરણ ૬ ગુજરાતી વિષયના તમામ પાઠોના <strong>સમાનાર્થી શબ્દોનાં જોડકાં રમત</strong> સફળતાપૂર્વક પૂર્ણ કરી શ્રેષ્ઠ દેખાવ કર્યો છે.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8 text-center">
            <div className="bg-white/80 border border-amber-200 p-2.5 rounded-2xl shadow-2xs">
              <div className="text-[11px] font-bold text-stone-500">કુલ સ્કોર</div>
              <div className="text-lg font-black text-amber-700">{toGujaratiNumber(totalScore)}</div>
            </div>
            <div className="bg-white/80 border border-amber-200 p-2.5 rounded-2xl shadow-2xs">
              <div className="text-[11px] font-bold text-stone-500">સંપૂર્ણ પાઠ</div>
              <div className="text-lg font-black text-emerald-700">{toGujaratiNumber(completedChaptersCount)} પાઠ</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-6 border-t border-amber-300 text-xs font-bold text-stone-600">
            <div>
              <div className="text-stone-800 font-extrabold">તારીખ: {dateStr}</div>
              <div>ગુજરાત પ્રાથમિક શાળા</div>
            </div>
            <div className="text-right">
              <div className="w-24 border-b border-stone-800 mb-1 mx-auto"></div>
              <div>ભાષા શિક્ષકની સહી</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
