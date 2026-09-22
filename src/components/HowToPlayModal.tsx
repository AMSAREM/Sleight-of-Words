import React from 'react';
import { X, HelpCircle, Heart, Star, Sparkles, Scissors, Puzzle as PuzzleIcon } from 'lucide-react';
import { sound } from '../utils/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="how-to-play-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="how-to-play-card"
        className="w-full max-w-lg bg-[#151F45] border-4 border-[#FFD467] rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 text-[#FFF7E3] max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="close-how-to-play-modal"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#253675] hover:bg-[#344B98] text-[#FFF7E3] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-[#5EC3FF] text-xs font-heading uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-[#FFD467] drop-shadow-md">
            Sleight of Words Rules
          </h2>
          <p className="text-xs text-[#9CB3E6] mt-0.5">
            A word puzzle game of hidden boundaries and clever tricks.
          </p>
        </div>

        {/* 3 Game Modes Breakdown */}
        <div className="flex flex-col gap-3">
          {/* Seams */}
          <div className="p-3.5 rounded-2xl bg-[#1E2B63] border border-purple-500/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-heading text-xs flex items-center justify-center shadow">
                1
              </span>
              <h3 className="font-heading text-base text-purple-300">Seams</h3>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              Read the sentence. A common English word (3-6 letters) hides across the gap between two neighboring words! Its letters run consecutively across the end of one word and the start of the next.
            </p>
            <div className="bg-[#0E1638] p-2 rounded-xl text-xs text-[#FFF7E3]">
              <span className="text-[#FFD467] font-bold">Example:</span> “The cra<span className="text-purple-400 underline font-black">b ear</span>ned a shiny medal.” → Answer: <span className="text-purple-300 font-extrabold">BEAR</span>
            </div>
          </div>

          {/* Splits */}
          <div className="p-3.5 rounded-2xl bg-[#1E2B63] border border-amber-500/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-heading text-xs flex items-center justify-center shadow">
                2
              </span>
              <h3 className="font-heading text-base text-amber-300">Splits</h3>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              Tap a word in the sentence, then tap a gap between its letters to insert one space. Both halves must form real English words, and the sentence must mean something delightfully new!
            </p>
            <div className="bg-[#0E1638] p-2 rounded-xl text-xs text-[#FFF7E3]">
              <span className="text-[#FFD467] font-bold">Example:</span> “The children adored the <span className="text-amber-400 font-black">carpet</span>.” → Split into <span className="text-amber-300 font-extrabold">CAR PET</span>
            </div>
          </div>

          {/* Charades */}
          <div className="p-3.5 rounded-2xl bg-[#1E2B63] border border-emerald-500/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-heading text-xs flex items-center justify-center shadow">
                3
              </span>
              <h3 className="font-heading text-base text-emerald-300">Charades</h3>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              Solve 2 or 3 smaller word clues. Joined together in order, they form the larger whole word answer!
            </p>
            <div className="bg-[#0E1638] p-2 rounded-xl text-xs text-[#FFF7E3]">
              <span className="text-[#FFD467] font-bold">Example:</span> “A vehicle” (<span className="text-emerald-300 font-bold">CAR</span>) + “To decay” (<span className="text-emerald-300 font-bold">ROT</span>) = <span className="text-emerald-400 font-black">CARROT</span>!
            </div>
          </div>

          {/* Hangman */}
          <div className="p-3.5 rounded-2xl bg-[#1E2B63] border border-rose-500/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-heading text-xs flex items-center justify-center shadow">
                4
              </span>
              <h3 className="font-heading text-base text-rose-300">The Hangman</h3>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              Decipher the hidden mystery word letter-by-letter. Type with your keyboard or tap the letter keypad. You have 6 gallows strikes before the illusion collapses!
            </p>
            <div className="bg-[#0E1638] p-2 rounded-xl text-xs text-[#FFF7E3]">
              <span className="text-[#FFD467] font-bold">Example:</span> “Ancient vanish incantation” → <span className="text-rose-300 font-bold">_ B R _ C _ D _ B R _</span> → <span className="text-emerald-400 font-black">ABRACADABRA</span>!
            </div>
          </div>
        </div>

        {/* Gameplay Economy & Rules */}
        <div className="p-3.5 bg-[#0E1638] rounded-2xl border border-[#253258] flex flex-col gap-2">
          <h4 className="font-heading text-sm text-[#FFD467] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFD467]" />
            <span>Gameplay & Scoring (from SPEC.md)</span>
          </h4>

          <ul className="text-xs text-gray-300 space-y-1.5">
            <li className="flex items-start gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#E7364B] fill-[#E7364B] mt-0.5 shrink-0" />
              <span><strong>Focus Hearts:</strong> You have 3 hearts per level. A wrong guess loses 1 heart. At 0 hearts, the level fails!</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mt-0.5 shrink-0" />
              <span><strong>Stars:</strong> Earn up to 3 stars per level: <code>max(1, 3 - hintsUsed - wrongGuesses)</code>.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">¢</span>
              <span><strong>Rewards:</strong> 10 coins per star, plus 5 gems for a pristine 3-star clear!</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-cyan-400 font-bold mt-0.5 shrink-0">💎</span>
              <span><strong>Skip Level:</strong> Costs 20 gems if you get stuck on any regular puzzle.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
