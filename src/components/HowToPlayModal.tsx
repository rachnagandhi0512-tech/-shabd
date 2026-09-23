import React from 'react';
import { X, Layers, Grid, Zap, BookOpen, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 p-6 overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-lg font-black text-stone-900">
              કેવી રીતે રમવું? (માર્ગદર્શિકા)
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3.5 text-xs sm:text-sm text-stone-700">
          
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
            <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
              ૧
            </span>
            <div>
              <strong className="text-amber-950 block mb-0.5">પાઠ પસંદ કરો:</strong>
              ઉપર આપેલા પાઠની સૂચિમાંથી તમારો મનપસંદ પાઠ (પ્રથમ સત્ર કે દ્વિતીય સત્ર) પસંદ કરો.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              ૨
            </span>
            <div>
              <strong className="text-emerald-950 block mb-0.5">જોડકાં જોડો:</strong>
              ડાબી બાજુ આપેલા મુખ્ય શબ્દ પર ક્લિક કરો, પછી જમણી બાજુથી તેનો સાચો સમાનાર્થી શબ્દ પસંદ કરો. બંને જોડાઈ જશે!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/80 border border-purple-200">
            <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              ૩
            </span>
            <div>
              <strong className="text-purple-950 block mb-0.5">અવાજ અને ઉચ્ચાર:</strong>
              શબ્દની બાજુમાં આપેલા સ્પીકર બટન (<Volume2 className="w-3.5 h-3.5 inline text-amber-700" />) પર ક્લિક કરીને શુદ્ધ ગુજરાતી ઉચ્ચાર સાંભળી શકો છો.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-sky-50/80 border border-sky-200">
            <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              ૪
            </span>
            <div>
              <strong className="text-sky-950 block mb-0.5">અન્ય રમતો અને કસોટી:</strong>
              જોડકાં ઉપરાંત તમે મેમરી કાર્ડ રમત, ઝડપી કસોટી અને વર્કશીટ પ્રિન્ટ પણ કરી શકો છો!
            </div>
          </div>

        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full mt-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm transition-colors"
        >
          સમજાઈ ગયું, રમત શરૂ કરો!
        </button>

      </div>
    </div>
  );
};
