import React, { useState } from 'react';
import { X, Sparkles, Flame, Check, Plus, Coins, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  gems: number;
  flashlights: number;
  onAddCurrency: (reward: { coins?: number; gems?: number; flashlights?: number }) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  gems,
  flashlights,
  onAddCurrency
}) => {
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (id: string, reward: { coins?: number; gems?: number; flashlights?: number }) => {
    sound.playFanfare();
    onAddCurrency(reward);
    setPurchasedId(id);
    setTimeout(() => setPurchasedId(null), 1800);
  };

  return (
    <div
      id="shop-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0A102E]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="shop-card"
        className="relative w-full max-w-md card-wordlanes p-5 sm:p-7 pt-9 flex flex-col items-center gap-4 text-center max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlapping Top Header Pill Tab (Screen 2 reference) */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 tab-wordlanes text-xs sm:text-sm font-black tracking-widest text-[#182453] uppercase shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F58A12]" />
          <span>SHOP</span>
        </div>

        {/* Top-Right Close Button (Screen 2 reference) */}
        <button
          id="shop-close-btn"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 btn-close-wordlanes text-sm font-black shadow-lg"
          aria-label="Close Shop"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Top Currency Status Ribbon (Screen 2 reference) */}
        <div className="w-full flex items-center justify-center gap-3 pt-1">
          {/* Flashlights / Lanterns */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFF0D4] border border-[#E8DCBE] text-xs font-heading">
            <span className="text-base leading-none">🏮</span>
            <span className="text-[#182453] font-black">{flashlights}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFF0D4] border border-[#E8DCBE] text-xs font-heading">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#FFE082] to-[#FFB300] border border-[#FFD467] flex items-center justify-center text-[10px] font-black text-[#5B3900]">
              ¢
            </div>
            <span className="text-[#B85B04] font-black">{coins.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFF0D4] border border-[#E8DCBE] text-xs font-heading">
            <div className="w-3 h-3 rotate-45 bg-[#27C2E8]"></div>
            <span className="text-[#0284C7] font-black">{gems.toLocaleString()}</span>
          </div>
        </div>

        {/* Featured Big Bundle Card (Screen 2 reference) */}
        <div className="w-full rounded-2xl p-4 bg-gradient-to-r from-[#14B8A6]/20 via-[#0D9488]/15 to-[#0F766E]/25 border-2 border-[#14B8A6] flex items-center justify-between gap-3 text-left relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FEF08A] to-[#F59E0B] p-2 flex items-center justify-center text-3xl shadow-md border border-[#FDE68A]">
              🎁
            </div>
            <div>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#14B8A6] text-white text-[10px] font-heading font-black tracking-wider uppercase mb-1">
                3x the value
              </div>
              <h4 className="font-heading text-sm text-[#182453] font-black leading-tight">
                3,000 Coins + 3 Lanterns
              </h4>
              <span className="text-[11px] text-gray-500 block">One-time starter bundle</span>
            </div>
          </div>

          <button
            id="shop-buy-starter-btn"
            onClick={() => handlePurchase('bundle', { coins: 3000, flashlights: 3 })}
            className="px-4 py-2.5 btn-wordlanes-blue text-xs font-black shrink-0 shadow-md flex items-center gap-1"
          >
            {purchasedId === 'bundle' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>CLAIMED!</span>
              </>
            ) : (
              <span>USD$ 3.99</span>
            )}
          </button>
        </div>

        {/* Shop Items List (Screen 2 reference) */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Row 1: No Ads / Parlor Pass */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF0D4]/60 border border-[#E8DCBE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl border border-purple-200">
                🚫
              </div>
              <div className="text-left">
                <span className="font-heading text-xs sm:text-sm text-[#182453] font-bold block">
                  No Ads / Parlor Pass
                </span>
                <span className="text-[10px] text-gray-500">Uninterrupted gameplay & bonus gems</span>
              </div>
            </div>

            <button
              id="shop-buy-noads-btn"
              onClick={() => handlePurchase('noads', { gems: 50 })}
              className="px-3.5 py-2 btn-wordlanes-blue text-xs font-black shrink-0 shadow"
            >
              {purchasedId === 'noads' ? 'UNLOCKED!' : 'USD$ 0.99'}
            </button>
          </div>

          {/* Row 2: 12 Flashlights / Hint Lanterns */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF0D4]/60 border border-[#E8DCBE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl border border-amber-200">
                🏮
              </div>
              <div className="text-left">
                <span className="font-heading text-xs sm:text-sm text-[#182453] font-bold block">
                  12 Flashlights
                </span>
                <span className="text-[10px] text-gray-500">Illuminates hidden letter boundaries</span>
              </div>
            </div>

            <button
              id="shop-buy-flashlights-btn"
              onClick={() => handlePurchase('flashlights', { flashlights: 12 })}
              className="px-3.5 py-2 btn-wordlanes-blue text-xs font-black shrink-0 shadow"
            >
              {purchasedId === 'flashlights' ? 'OBTAINED!' : 'USD$ 0.99'}
            </button>
          </div>

          {/* Row 3: 2,720 Coins */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF0D4]/60 border border-[#E8DCBE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-amber-600 flex items-center justify-center text-xl border border-yellow-200">
                🪙
              </div>
              <div className="text-left">
                <span className="font-heading text-xs sm:text-sm text-[#182453] font-bold block">
                  2,720 Coins
                </span>
                <span className="text-[10px] text-gray-500">Medium pouch for unlocking clues</span>
              </div>
            </div>

            <button
              id="shop-buy-coins-small-btn"
              onClick={() => handlePurchase('coins_small', { coins: 2720 })}
              className="px-3.5 py-2 btn-wordlanes-blue text-xs font-black shrink-0 shadow"
            >
              {purchasedId === 'coins_small' ? 'ADDED!' : 'USD$ 0.99'}
            </button>
          </div>

          {/* Row 4: 31,440 Coins (Most Popular) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF0D4]/60 border border-[#E8DCBE] relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center text-xl border border-amber-300">
                💰
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xs sm:text-sm text-[#182453] font-bold">
                    31,440 Coins
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#E7364B] text-white text-[9px] font-heading font-black">
                    MOST POPULAR
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">Grand Magician hoard</span>
              </div>
            </div>

            <button
              id="shop-buy-coins-large-btn"
              onClick={() => handlePurchase('coins_large', { coins: 31440, gems: 20 })}
              className="px-3.5 py-2 btn-wordlanes-blue text-xs font-black shrink-0 shadow"
            >
              {purchasedId === 'coins_large' ? 'ADDED!' : 'USD$ 4.99'}
            </button>
          </div>

          {/* Row 5: Daily Free Token Grant */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl border border-emerald-200">
                ✨
              </div>
              <div className="text-left">
                <span className="font-heading text-xs sm:text-sm text-emerald-900 font-bold block">
                  Free Parlor Gift
                </span>
                <span className="text-[10px] text-emerald-700">Daily gift of +100 Coins</span>
              </div>
            </div>

            <button
              id="shop-claim-free-btn"
              onClick={() => handlePurchase('free_daily', { coins: 100, flashlights: 1 })}
              className="px-3.5 py-2 btn-wordlanes-green text-xs font-black shrink-0 shadow"
            >
              {purchasedId === 'free_daily' ? 'CLAIMED!' : 'FREE'}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-400">
          Purchases are credited instantly to your local session balance.
        </p>
      </div>
    </div>
  );
};
