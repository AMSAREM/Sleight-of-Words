import React from 'react';
import { X, Gift, Check, Sparkles, Trophy } from 'lucide-react';
import { Puzzle } from '../types';
import { sound } from '../utils/audio';

interface DailyTrickModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyPuzzles: Puzzle[];
  completedIds: string[];
  chestClaimed: boolean;
  onClaimChest: () => void;
  onSelectDailyTrick: (index: number) => void;
  currentDailyIndex: number;
}

export const DailyTrickModal: React.FC<DailyTrickModalProps> = ({
  isOpen,
  onClose,
  dailyPuzzles,
  completedIds,
  chestClaimed,
  onClaimChest,
  onSelectDailyTrick,
  currentDailyIndex
}) => {
  if (!isOpen) return null;

  const totalTricks = dailyPuzzles.length;
  const completedCount = completedIds.length;
  const allCompleted = completedCount >= totalTricks;

  // Mystery picture artwork pieces (5 pieces)
  const pieceImages = [
    'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    'linear-gradient(135deg, #4ECDC4 0%, #556270 100%)',
    'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
    'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)'
  ];

  return (
    <div
      id="daily-trick-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="daily-trick-card"
        className="w-full max-w-lg bg-[#151F45] border-4 border-[#FFD467] rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 text-[#FFF7E3]"
      >
        {/* Close Button */}
        <button
          id="close-daily-modal"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-heading uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Trick Challenge</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-[#FFD467] drop-shadow-md">
            The Daily Mystery Picture
          </h2>
          <p className="text-xs text-[#9CB3E6] mt-1">
            Clear 5 daily tricks to reveal the complete artwork and unlock the treasure chest!
          </p>
        </div>

        {/* Mystery Picture Grid (5 tiles) */}
        <div className="w-full h-44 sm:h-52 bg-[#0E1638] rounded-2xl border-2 border-[#2C3E80] overflow-hidden relative shadow-inner p-2">
          {/* Background Revealed Artwork */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#6D28D9] to-[#BE185D] opacity-90">
            <div className="text-center p-4">
              <Trophy className="w-16 h-16 text-[#FFD467] mx-auto animate-bounce drop-shadow-[0_0_15px_rgba(255,212,103,0.8)]" />
              <p className="font-heading text-xl text-[#FFF7E3] mt-2">Sleight Master Unlocked!</p>
              <p className="text-xs text-[#93E6FB]">All 5 daily tricks conquered today!</p>
            </div>
          </div>

          {/* 5 Covering Tiles */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-2">
            {dailyPuzzles.map((puzzle, idx) => {
              const isCleared = completedIds.includes(puzzle.id);
              // tile 5 spans across col 2 & 3
              const colSpan = idx === 4 ? 'col-span-2' : 'col-span-1';

              return (
                <div
                  key={puzzle.id}
                  className={`${colSpan} rounded-xl border border-[#3B4E90] flex items-center justify-center font-heading text-sm transition-all duration-700 relative overflow-hidden ${
                    isCleared
                      ? 'opacity-0 scale-90 pointer-events-none'
                      : 'opacity-100 bg-[#1A2655] shadow-md hover:brightness-110'
                  }`}
                  style={{
                    background: isCleared ? 'transparent' : pieceImages[idx % pieceImages.length]
                  }}
                >
                  <div className="bg-[#0E1638]/70 backdrop-blur-xs w-full h-full flex flex-col items-center justify-center gap-1 p-1">
                    <span className="text-xs text-[#FFD467]">Piece {idx + 1}</span>
                    <span className="text-[10px] uppercase font-bold text-[#93E6FB]">{puzzle.mode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar & Chest Unlock */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#9CB3E6]">
            <span>Daily Progress</span>
            <span className="text-[#FFD467] font-heading text-sm">{completedCount} / {totalTricks} Cleared</span>
          </div>

          <div className="w-full h-4 bg-[#0E1638] rounded-full overflow-hidden border border-[#2D4288] p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#FFB63B] to-[#7CE04A] rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalTricks) * 100}%` }}
            />
          </div>
        </div>

        {/* 5 Trick Quick Selectors */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {dailyPuzzles.map((p, idx) => {
            const isDone = completedIds.includes(p.id);
            const isCurrent = currentDailyIndex === idx;

            return (
              <button
                key={p.id}
                id={`daily-trick-slot-${idx}`}
                onClick={() => {
                  sound.playTap();
                  onSelectDailyTrick(idx);
                  onClose();
                }}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-amber-400 bg-amber-500/30 border-amber-300 scale-105'
                    : isDone
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-[#1D2A5E] border-[#2C3E80] text-[#9CB3E6] hover:bg-[#253675]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-heading text-xs ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-[#0E1638] text-[#5EC3FF]'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-[10px] font-bold uppercase">{p.mode}</span>
              </button>
            );
          })}
        </div>

        {/* Chest Claim Button */}
        {allCompleted && !chestClaimed ? (
          <button
            id="claim-chest-btn"
            onClick={() => {
              sound.playChestOpen();
              onClaimChest();
            }}
            className="w-full py-3 rounded-2xl btn-chunky-orange text-[#FFF7E3] font-heading text-lg flex items-center justify-center gap-2 shadow-xl animate-bounce"
          >
            <Gift className="w-6 h-6 text-[#FFD467]" />
            <span>CLAIM CHEST (+50 💎 GEMS)</span>
          </button>
        ) : chestClaimed ? (
          <div className="w-full py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-center font-heading text-sm flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Chest Claimed for Today! Resets at midnight.</span>
          </div>
        ) : (
          <div className="w-full py-2 bg-[#0E1638] rounded-xl border border-[#253258] text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Clear all 5 tricks to unlock the 50 💎 chest!</span>
          </div>
        )}
      </div>
    </div>
  );
};
