import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, RotateCcw, Map, Home, Sparkles, Trophy, Heart, Flame, Gift } from 'lucide-react';
import { sound } from '../utils/audio';

interface VictoryOverlayProps {
  isOpen: boolean;
  stars: number;
  hintsUsed: number;
  wrongGuesses: number;
  heartsLeft: number;
  answer: string;
  explanation: string;
  isDailyMode?: boolean;
  currentStreak?: number;
  levelTitle?: string;
  levelIndex?: number;
  onNext: () => void;
  onReplay: () => void;
  onGoToMap: () => void;
  onGoHome: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  isOpen,
  stars,
  hintsUsed,
  wrongGuesses,
  heartsLeft,
  answer,
  explanation,
  isDailyMode = false,
  currentStreak,
  levelTitle = 'Word Parlor',
  levelIndex = 1,
  onNext,
  onReplay,
  onGoToMap,
  onGoHome
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Play fanfare for 3 stars or level clear
    if (stars === 3) {
      sound.playFanfare();
      // Multi-stage confetti celebration
      const count = 200;
      const defaults = {
        origin: { y: 0.65 },
        zIndex: 9999
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#FFD467', '#F58A12', '#FF6B6B']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#27C2E8', '#93E6FB', '#5EC3FF']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#A855F7', '#C084FC', '#7CE04A']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#FFD467', '#FFE082']
      });
    } else {
      sound.playSuccess();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        zIndex: 9999,
        colors: ['#FFD467', '#5EC3FF', '#7CE04A']
      });
    }

    // Play sequential star pops
    for (let i = 0; i < stars; i++) {
      setTimeout(() => {
        sound.playStarPop(i);
      }, 300 + i * 220);
    }
  }, [isOpen, stars]);

  if (!isOpen) return null;

  const coinsEarned = stars * 10;
  const gemsEarned = stars === 3 ? 5 : 0;
  const isFlawless = heartsLeft === 3 && hintsUsed === 0 && wrongGuesses === 0;

  // Track progress fraction for the road banner (Screen 3 reference: "9/12")
  const trackCurrent = ((levelIndex - 1) % 12) + 1;
  const trackTotal = 12;
  const trackPercentage = Math.round((trackCurrent / trackTotal) * 100);

  return (
    <div
      id="victory-screen-overlay"
      className="fixed inset-0 z-50 bg-[#0A102E]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div
        id="victory-card-container"
        className="w-full max-w-sm sm:max-w-md card-wordlanes p-5 sm:p-7 pt-9 flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-200"
      >
        {/* Overlapping Top Header Pill Tab (Screen 3 reference: "Warmful Valley 212-290") */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-7 py-2 tab-wordlanes text-xs font-black tracking-widest text-[#182453] uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-[#F58A12]" />
          <span>{isDailyMode ? 'DAILY TRICK EVENT' : `${levelTitle} • #${levelIndex}`}</span>
        </div>

        {/* Title: LEVEL COMPLETE (Screen 3 reference) */}
        <div className="pt-2">
          <h2 className="font-heading text-2xl sm:text-3xl text-[#182453] font-black tracking-wide leading-none">
            LEVEL COMPLETE
          </h2>
          <p className="text-xs text-gray-500 font-bold mt-1">
            {stars === 3 ? '★ 3-Star Masterpiece ★' : stars === 2 ? '★ 2 Stars Performed ★' : '★ 1 Star Cleared ★'}
          </p>
        </div>

        {/* 3 Animated Stars with Bevel Highlights */}
        <div className="flex items-center justify-center gap-3 my-0.5">
          {[1, 2, 3].map((starNum) => {
            const hasStar = starNum <= stars;
            const isCenterStar = starNum === 2;
            return (
              <div
                key={starNum}
                className={`transition-all duration-500 transform ${
                  isCenterStar ? 'scale-120 -translate-y-1' : 'scale-100'
                } ${hasStar ? 'scale-105' : 'opacity-35'}`}
              >
                <div
                  className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center ${
                    hasStar
                      ? 'bg-gradient-to-t from-[#B8860B] to-[#FFE082] shadow-[0_4px_0_#92400E] border-t-2 border-l-2 border-[#FFFBEB]'
                      : 'bg-gray-200 border border-gray-300'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 ${
                      hasStar
                        ? 'fill-[#5B3900] text-[#5B3900] drop-shadow-sm'
                        : 'text-gray-400 fill-gray-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Illustrated Gift Box & Progress Road Banner (Screen 3 reference) */}
        <div className="w-full bg-[#FFF0D4] rounded-2xl p-3.5 border-2 border-[#E8DCBE] flex flex-col items-center gap-2.5 relative">
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-heading font-black text-gray-500 uppercase tracking-wider">
              {isDailyMode ? 'Daily Trick Board' : 'World Journey'}
            </span>
            {/* Currency Reward Pill on Top of Road */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-xs font-heading font-black shadow-sm">
              <Gift className="w-3.5 h-3.5 text-[#FFD467]" />
              <span>+{coinsEarned + (gemsEarned > 0 ? ` & ${gemsEarned}💎` : '')}</span>
            </div>
          </div>

          {/* Stepping Stone Progress Ribbon (Screen 3 reference: purple path with "9/12" pill) */}
          <div className="w-full relative h-9 bg-purple-200/80 rounded-2xl p-1 flex items-center overflow-hidden border border-purple-300/80">
            {/* Winding road graphic line */}
            <div
              className="h-full bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#7C3AED] rounded-xl transition-all duration-700 relative flex items-center justify-end pr-2"
              style={{ width: `${Math.max(15, trackPercentage)}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-white opacity-80 animate-ping"></div>
            </div>

            {/* Road milestone marker pill (Screen 3 reference: "9/12") */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[#6D28D9] text-[11px] font-heading font-black shadow-sm border border-purple-200">
                {trackCurrent}/{trackTotal} to Magic Chest
              </span>
            </div>
          </div>
        </div>

        {/* Hidden Answer Explanation Box */}
        <div className="w-full bg-[#FFF0D4]/80 rounded-2xl p-3 border border-[#E8DCBE] text-left">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-heading uppercase tracking-wider text-[#0284C7] font-black">
              Trick Revealed
            </span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
              {answer}
            </span>
          </div>
          <p className="text-xs text-[#182453] font-bold leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Flawless / Focus Heart Status */}
        {isFlawless && (
          <div className="w-full flex items-center justify-center gap-1.5 text-xs font-heading font-black text-emerald-600 bg-emerald-50 py-1.5 rounded-xl border border-emerald-200">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>FLAWLESS! No hints or mistakes used</span>
          </div>
        )}

        {/* Primary Action Button: Big Chunky Pill Button (Screen 3 reference: "▶ Level 22" with lantern helper) */}
        <div className="w-full flex items-center gap-2">
          <button
            id="victory-next-trick-btn"
            onClick={() => {
              sound.playTap();
              onNext();
            }}
            className="flex-1 py-3.5 px-6 btn-wordlanes-purple text-base sm:text-lg font-black flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all"
          >
            <span>▶</span>
            <span>{isDailyMode ? 'CONTINUE DAILY' : `Level ${levelIndex + 1}`}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>

          {/* Lantern Helper Icon Badge (Screen 3 reference) */}
          <div
            className="w-13 h-13 rounded-2xl bg-[#FFF0D4] border-2 border-[#E8DCBE] flex items-center justify-center text-xl shadow-sm shrink-0"
            title="Flashlights / Lanterns for illuminating word seams"
          >
            🏮
          </div>
        </div>

        {/* Secondary Buttons Row */}
        <div className="w-full flex items-center justify-center gap-2 text-xs">
          <button
            id="victory-replay-btn"
            onClick={() => {
              sound.playTap();
              onReplay();
            }}
            className="flex-1 py-2 px-3 rounded-full bg-[#FFF0D4] hover:bg-[#FFE6B8] text-[#182453] border border-[#E8DCBE] font-heading font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
            <span>Replay</span>
          </button>

          {!isDailyMode && (
            <button
              id="victory-map-btn"
              onClick={() => {
                sound.playTap();
                onGoToMap();
              }}
              className="flex-1 py-2 px-3 rounded-full bg-[#FFF0D4] hover:bg-[#FFE6B8] text-[#0284C7] border border-[#E8DCBE] font-heading font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <Map className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>World Map</span>
            </button>
          )}

          <button
            id="victory-home-btn"
            onClick={() => {
              sound.playTap();
              onGoHome();
            }}
            className="flex-1 py-2 px-3 rounded-full bg-[#FFF0D4] hover:bg-[#FFE6B8] text-[#B85B04] border border-[#E8DCBE] font-heading font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Home className="w-3.5 h-3.5 text-[#B85B04]" />
            <span>Parlor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
