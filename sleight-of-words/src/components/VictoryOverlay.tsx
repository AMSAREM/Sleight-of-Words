import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, RotateCcw, Map, Home, Sparkles, Trophy, Heart, Flame } from 'lucide-react';
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
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#E7364B', '#FF85A1']
      });
    } else {
      sound.playSuccess();
      // Gentle confetti for 1-2 stars
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

  return (
    <div
      id="victory-screen-overlay"
      className="fixed inset-0 z-50 bg-[#0A102E]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div
        id="victory-card-container"
        className="w-full max-w-md bg-[#151F45] border-4 border-[#FFD467] rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(255,212,103,0.3)] relative flex flex-col items-center gap-4 text-center text-[#FFF7E3] animate-in zoom-in-95 duration-200"
      >
        {/* Ribbon Header */}
        <div className="relative -mt-10 sm:-mt-12">
          <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-[#F58A12] via-[#FFD467] to-[#F58A12] text-[#182453] font-heading text-lg sm:text-xl font-black uppercase tracking-wider shadow-xl border-2 border-[#FFE8A3] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#B85B04] animate-spin" style={{ animationDuration: '4s' }} />
            <span>{stars === 3 ? 'Magnificent Sleight!' : 'Trick Solved!'}</span>
            <Sparkles className="w-5 h-5 text-[#B85B04] animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* 3 Animated Stars */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-1">
          {[1, 2, 3].map((starNum) => {
            const hasStar = starNum <= stars;
            const isCenterStar = starNum === 2;
            return (
              <div
                key={starNum}
                className={`transition-all duration-500 transform ${
                  isCenterStar ? 'scale-125 -translate-y-1' : 'scale-100'
                } ${hasStar ? 'scale-110' : 'opacity-40'}`}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ${
                    hasStar
                      ? 'bg-gradient-to-t from-[#B8860B] to-[#FFE082] shadow-[0_0_20px_rgba(255,212,103,0.7)] border-2 border-[#FFF0A0]'
                      : 'bg-[#1D2A5E] border border-[#2D3F7D]'
                  }`}
                >
                  <Star
                    className={`w-9 h-9 sm:w-10 sm:h-10 ${
                      hasStar
                        ? 'fill-[#5B3900] text-[#5B3900] drop-shadow-md'
                        : 'text-gray-500 fill-gray-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stars Tagline */}
        <div className="flex flex-col items-center">
          <h2 className="font-heading text-2xl text-[#FFD467] drop-shadow-sm">
            {stars === 3 ? '3-Star Masterpiece!' : stars === 2 ? 'Well Performed! 2 Stars' : 'Good Effort! 1 Star'}
          </h2>
          {isFlawless && (
            <span className="text-xs font-bold text-[#7CE04A] bg-[#7CE04A]/10 px-2.5 py-0.5 rounded-full border border-[#7CE04A]/30 mt-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#7CE04A]" /> Flawless Cleared! (No hints or mistakes)
            </span>
          )}
        </div>

        {/* Answer Reveal Box */}
        <div className="w-full bg-[#0E1638] rounded-2xl p-3 border border-[#2C3E80] text-left">
          <div className="flex items-center justify-between text-xs text-[#9CB3E6] mb-1">
            <span className="font-heading uppercase tracking-wider text-[#5EC3FF]">Hidden Answer</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {answer}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#FFF7E3] font-medium leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Rewards Earned Breakdown */}
        <div className={`w-full grid ${currentStreak !== undefined ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {/* Coins */}
          <div className="bg-[#182453] rounded-xl p-2.5 border border-[#FFD467]/30 flex items-center justify-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#FFE082] to-[#FFB300] border border-[#FFD467] flex items-center justify-center text-xs font-black text-[#5B3900] shadow-sm">
              ¢
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#9CB3E6] uppercase font-bold block leading-none">Coins</span>
              <span className="font-heading text-base text-[#FFD467]">+{coinsEarned}</span>
            </div>
          </div>

          {/* Gems */}
          <div className="bg-[#182453] rounded-xl p-2.5 border border-[#5EC3FF]/30 flex items-center justify-center gap-2">
            <div className="w-5 h-5 rotate-45 bg-gradient-to-tr from-[#27C2E8] to-[#93E6FB] border border-[#5EC3FF] shadow-sm"></div>
            <div className="text-left">
              <span className="text-[10px] text-[#9CB3E6] uppercase font-bold block leading-none">Gems</span>
              <span className="font-heading text-base text-[#5EC3FF]">+{gemsEarned}</span>
            </div>
          </div>

          {/* Daily Streak */}
          {currentStreak !== undefined && (
            <div className="bg-[#182453] rounded-xl p-2.5 border border-[#F58A12]/40 flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#E7364B] to-[#F58A12] flex items-center justify-center text-white shadow-sm">
                <Flame className="w-4 h-4 fill-white animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#9CB3E6] uppercase font-bold block leading-none">Streak</span>
                <span className="font-heading text-base text-[#FFD467]">{currentStreak}d 🔥</span>
              </div>
            </div>
          )}
        </div>

        {/* Focus Hearts status */}
        <div className="flex items-center gap-2 text-xs text-[#9CB3E6]">
          <span>Focus Preserved:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-3.5 h-3.5 ${
                  h <= heartsLeft
                    ? 'text-[#E7364B] fill-[#E7364B]'
                    : 'text-gray-600 fill-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Primary Action Button: Next Trick */}
        <button
          id="victory-next-trick-btn"
          onClick={() => {
            sound.playTap();
            onNext();
          }}
          className="w-full py-3.5 rounded-2xl btn-chunky-green text-[#FFF7E3] font-heading text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-98 transition-all"
        >
          <span>{isDailyMode ? 'CONTINUE DAILY CHALLENGE' : 'NEXT TRICK'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Secondary Buttons Row */}
        <div className="w-full flex items-center justify-center gap-2 text-xs">
          <button
            id="victory-replay-btn"
            onClick={() => {
              sound.playTap();
              onReplay();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#1D2A5E] hover:bg-[#253675] text-[#9CB3E6] hover:text-white border border-[#2D3F7D] font-heading flex items-center justify-center gap-1 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          {!isDailyMode && (
            <button
              id="victory-map-btn"
              onClick={() => {
                sound.playTap();
                onGoToMap();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#1D2A5E] hover:bg-[#253675] text-[#5EC3FF] hover:text-white border border-[#2D3F7D] font-heading flex items-center justify-center gap-1 transition-all"
            >
              <Map className="w-3.5 h-3.5" />
              <span>World Map</span>
            </button>
          )}

          <button
            id="victory-home-btn"
            onClick={() => {
              sound.playTap();
              onGoHome();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-[#1D2A5E] hover:bg-[#253675] text-[#FFD467] hover:text-white border border-[#2D3F7D] font-heading flex items-center justify-center gap-1 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Parlor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
