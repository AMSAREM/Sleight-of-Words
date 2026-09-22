import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Check, Gift } from 'lucide-react';
import { sound } from '../utils/audio';

interface DailyGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimGift: (reward: { coins: number; gems: number; flashlights: number }) => void;
  hasClaimedToday?: boolean;
}

export const DailyGiftModal: React.FC<DailyGiftModalProps> = ({
  isOpen,
  onClose,
  onClaimGift,
  hasClaimedToday = false
}) => {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [revealedReward, setRevealedReward] = useState<{
    coins: number;
    gems: number;
    flashlights: number;
  } | null>(null);

  if (!isOpen) return null;

  const handlePickBox = (boxIndex: number) => {
    if (selectedBox !== null || hasClaimedToday) return;

    sound.playFanfare();
    setSelectedBox(boxIndex);

    // Box rewards variation
    const rewards = [
      { coins: 150, gems: 10, flashlights: 2 },
      { coins: 250, gems: 5, flashlights: 1 },
      { coins: 100, gems: 15, flashlights: 3 }
    ];
    const pickedReward = rewards[boxIndex % rewards.length];
    setRevealedReward(pickedReward);

    // Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
      colors: ['#7CE04A', '#5EC3FF', '#FFD467', '#A855F7']
    });

    onClaimGift(pickedReward);
  };

  return (
    <div
      id="daily-gift-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0A102E]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="daily-gift-card"
        className="relative w-full max-w-sm card-wordlanes p-6 sm:p-7 pt-9 flex flex-col items-center gap-5 text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlapping Top Header Pill Tab (Screen 6 reference) */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 tab-wordlanes text-xs sm:text-sm font-black tracking-widest text-[#182453] uppercase shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F58A12]" />
          <span>DAILY GIFT</span>
        </div>

        {/* Top-Right Close Button */}
        <button
          id="daily-gift-close-btn"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 btn-close-wordlanes text-sm font-black shadow-lg"
          aria-label="Close Daily Gift"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Subtitle (Screen 6 reference) */}
        <div className="pt-2">
          <h3 className="font-heading text-lg sm:text-xl text-[#182453] font-black">
            {revealedReward ? 'Grand Surprise Unlocked!' : 'Pick your daily gift!'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasClaimedToday && !revealedReward
              ? "You have already claimed today's gift! Come back tomorrow."
              : 'Choose one of the 3 mystery magician boxes below'}
          </p>
        </div>

        {/* 3 Interactive Gift Boxes (Screen 6 reference) */}
        <div className="w-full flex items-center justify-center gap-3 sm:gap-4 my-2">
          {/* Box 1: Emerald Green Box */}
          <button
            id="daily-box-1"
            disabled={selectedBox !== null || hasClaimedToday}
            onClick={() => handlePickBox(0)}
            className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
              selectedBox === 0
                ? 'scale-110 bg-emerald-100 border-2 border-emerald-500 shadow-xl'
                : selectedBox !== null
                ? 'opacity-40 scale-95'
                : 'hover:scale-105 active:scale-95 bg-[#FFF0D4]/80 border-2 border-[#E8DCBE] shadow-md hover:shadow-lg'
            }`}
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#34D399] to-[#059669] flex items-center justify-center text-3xl shadow-[0_4px_0_#065F46] border-t-2 border-l-2 border-[#A7F3D0] relative">
              <Gift className="w-9 h-9 text-white drop-shadow-sm" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white opacity-70"></div>
            </div>
            <span className="font-heading text-xs text-[#182453] font-bold mt-2">Emerald</span>
          </button>

          {/* Box 2: Coral / Peach Box */}
          <button
            id="daily-box-2"
            disabled={selectedBox !== null || hasClaimedToday}
            onClick={() => handlePickBox(1)}
            className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
              selectedBox === 1
                ? 'scale-110 bg-rose-100 border-2 border-rose-500 shadow-xl'
                : selectedBox !== null
                ? 'opacity-40 scale-95'
                : 'hover:scale-105 active:scale-95 bg-[#FFF0D4]/80 border-2 border-[#E8DCBE] shadow-md hover:shadow-lg'
            }`}
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#FB7185] to-[#E11D48] flex items-center justify-center text-3xl shadow-[0_4px_0_#9F1239] border-t-2 border-l-2 border-[#FECDD3] relative">
              <Gift className="w-9 h-9 text-white drop-shadow-sm" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white opacity-70"></div>
            </div>
            <span className="font-heading text-xs text-[#182453] font-bold mt-2">Coral</span>
          </button>

          {/* Box 3: Royal Purple Box */}
          <button
            id="daily-box-3"
            disabled={selectedBox !== null || hasClaimedToday}
            onClick={() => handlePickBox(2)}
            className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
              selectedBox === 2
                ? 'scale-110 bg-purple-100 border-2 border-purple-500 shadow-xl'
                : selectedBox !== null
                ? 'opacity-40 scale-95'
                : 'hover:scale-105 active:scale-95 bg-[#FFF0D4]/80 border-2 border-[#E8DCBE] shadow-md hover:shadow-lg'
            }`}
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#A855F7] to-[#7E22CE] flex items-center justify-center text-3xl shadow-[0_4px_0_#581C87] border-t-2 border-l-2 border-[#E9D5FF] relative">
              <Gift className="w-9 h-9 text-white drop-shadow-sm" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white opacity-70"></div>
            </div>
            <span className="font-heading text-xs text-[#182453] font-bold mt-2">Royal</span>
          </button>
        </div>

        {/* Revealed Rewards Box */}
        {revealedReward && (
          <div className="w-full bg-[#FFF0D4] p-3.5 rounded-2xl border border-[#E8DCBE] animate-in zoom-in-95 duration-200">
            <span className="text-[10px] font-heading font-black text-emerald-700 uppercase tracking-wider block mb-2">
              🎉 Added to Your Bag!
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1 font-heading text-sm text-[#B85B04] font-black">
                <span>🪙</span>
                <span>+{revealedReward.coins} Coins</span>
              </div>
              <div className="flex items-center gap-1 font-heading text-sm text-[#0284C7] font-black">
                <span>💎</span>
                <span>+{revealedReward.gems} Gems</span>
              </div>
              <div className="flex items-center gap-1 font-heading text-sm text-[#6D28D9] font-black">
                <span>🏮</span>
                <span>+{revealedReward.flashlights} Wands</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Button */}
        <button
          id="daily-gift-done-btn"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className={`w-full py-3 rounded-full text-xs font-heading font-black shadow-md ${
            revealedReward || hasClaimedToday
              ? 'btn-wordlanes-green'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {revealedReward ? 'CONTINUE PLAYING' : hasClaimedToday ? 'COME BACK TOMORROW' : 'SELECT A BOX ABOVE'}
        </button>
      </div>
    </div>
  );
};
