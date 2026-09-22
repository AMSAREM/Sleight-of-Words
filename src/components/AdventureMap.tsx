import React, { useState } from 'react';
import { ArrowLeft, Star, Lock, Gift, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { GameMode, PlayerStats, Puzzle } from '../types';
import { SEAMS_PUZZLES, SPLITS_PUZZLES, CHARADES_PUZZLES, HANGMAN_PUZZLES } from '../data/puzzles';
import { sound } from '../utils/audio';

interface AdventureMapProps {
  playerStats: PlayerStats;
  onSelectLevel: (mode: GameMode, puzzleId: string) => void;
  onBackToHome: () => void;
  onClaimMilestoneChest?: (milestoneId: string, reward: { coins: number; gems: number }) => void;
}

interface WorldConfig {
  id: GameMode;
  name: string;
  subtitle: string;
  themeColor: string;
  borderColor: string;
  bgGradient: string;
  badge: string;
  puzzles: Puzzle[];
  minStarsToUnlock: number;
}

const WORLDS: WorldConfig[] = [
  {
    id: 'seams',
    name: 'Carnival Seams',
    subtitle: 'Where word boundaries blur into hidden magic',
    themeColor: '#FFD467',
    borderColor: '#F58A12',
    bgGradient: 'from-[#1A1842] via-[#121A3B] to-[#0A102E]',
    badge: '🎪 World 1',
    puzzles: SEAMS_PUZZLES,
    minStarsToUnlock: 0
  },
  {
    id: 'splits',
    name: 'The Split Alley',
    subtitle: 'Insert spaces to transmute whole sentences',
    themeColor: '#5EC3FF',
    borderColor: '#27C2E8',
    bgGradient: 'from-[#12253B] via-[#0E1A33] to-[#0A102E]',
    badge: '🔮 World 2',
    puzzles: SPLITS_PUZZLES,
    minStarsToUnlock: 6
  },
  {
    id: 'charades',
    name: 'Grand Charade Parlor',
    subtitle: 'Assemble cryptic fragments into the master word',
    themeColor: '#C084FC',
    borderColor: '#9333EA',
    bgGradient: 'from-[#25143A] via-[#1A0E2E] to-[#0A102E]',
    badge: '🃏 World 3',
    puzzles: CHARADES_PUZZLES,
    minStarsToUnlock: 15
  },
  {
    id: 'hangman',
    name: 'The Gallows Chamber',
    subtitle: 'Decipher secret words letter-by-letter before the strikes trigger',
    themeColor: '#FF6B8B',
    borderColor: '#E7364B',
    bgGradient: 'from-[#34111E] via-[#200A16] to-[#0A102E]',
    badge: '🪢 World 4',
    puzzles: HANGMAN_PUZZLES,
    minStarsToUnlock: 10
  }
];

export const AdventureMap: React.FC<AdventureMapProps> = ({
  playerStats,
  onSelectLevel,
  onBackToHome
}) => {
  const [activeWorldId, setActiveWorldId] = useState<GameMode>('seams');
  const [claimedChests, setClaimedChests] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sow_claimed_milestone_chests');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const activeWorld = WORLDS.find((w) => w.id === activeWorldId) || WORLDS[0];

  // Calculate total stars across all levels
  const totalStars = Object.values(playerStats.levelProgress).reduce(
    (acc, curr) => acc + (curr.stars || 0),
    0
  );

  const worldStars = activeWorld.puzzles.reduce((acc, p) => {
    return acc + (playerStats.levelProgress[p.id]?.stars || 0);
  }, 0);

  const worldMaxStars = activeWorld.puzzles.length * 3;

  const handleClaimChest = (chestId: string, coins: number, gems: number) => {
    if (claimedChests[chestId]) return;
    sound.playChestOpen();
    const updated = { ...claimedChests, [chestId]: true };
    setClaimedChests(updated);
    try {
      localStorage.setItem('sow_claimed_milestone_chests', JSON.stringify(updated));
    } catch {
      // ignore
    }
    // Give rewards to stats in local storage or state
    playerStats.coins += coins;
    playerStats.gems += gems;
  };

  return (
    <div
      id="adventure-map-view"
      className="min-h-screen bg-[#0A102E] text-[#FFF7E3] flex flex-col font-sans pb-16 selection:bg-[#F58A12] selection:text-white"
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1638]/90 backdrop-blur-md border-b border-[#253258] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            id="map-back-home-btn"
            onClick={() => {
              sound.playTap();
              onBackToHome();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A2550] hover:bg-[#253675] text-[#9CB3E6] hover:text-white border border-[#2B3C75] text-xs font-heading transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Parlor</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-heading text-lg sm:text-xl text-[#FFD467] tracking-wide">
              Stepping Stone Realm
            </span>
          </div>

          {/* Stars pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182453] border border-[#FFD467]/40 text-xs font-bold text-[#FFD467] shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#FFD467]" />
            <span>{totalStars} Total Stars</span>
          </div>
        </div>
      </header>

      {/* World Selection Tabs */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 bg-[#0E1638] p-1.5 rounded-2xl border border-[#253258]">
          {WORLDS.map((w) => {
            const isUnlocked = totalStars >= w.minStarsToUnlock;
            const isSelected = activeWorldId === w.id;

            return (
              <button
                key={w.id}
                id={`world-tab-${w.id}`}
                onClick={() => {
                  sound.playTap();
                  if (isUnlocked) {
                    setActiveWorldId(w.id);
                  } else {
                    sound.playError();
                  }
                }}
                className={`py-2 px-2 sm:px-3 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-[#1D2A5E] border-2 shadow-md'
                    : isUnlocked
                    ? 'hover:bg-[#152147] border border-transparent'
                    : 'opacity-50 cursor-not-allowed border border-transparent'
                }`}
                style={{
                  borderColor: isSelected ? w.borderColor : undefined
                }}
              >
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-heading font-black">
                  <span>{w.badge}</span>
                  {!isUnlocked && <Lock className="w-3 h-3 text-rose-400" />}
                </div>
                <span className="text-[10px] sm:text-xs text-[#9CB3E6] truncate w-full text-center">
                  {w.name}
                </span>
                {!isUnlocked && (
                  <span className="text-[9px] text-rose-300 font-mono mt-0.5">
                    {w.minStarsToUnlock}★ needed
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active World Banner */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-4">
        <div
          className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-r ${activeWorld.bgGradient} border-2 border-[${activeWorld.borderColor}] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFD467]/20 border border-[#FFD467]/40 text-[#FFD467] text-[10px] font-heading font-black tracking-wider uppercase">
                {activeWorld.badge}
              </span>
              <h1 className="font-heading text-xl sm:text-2xl text-[#FFF7E3]">
                {activeWorld.name}
              </h1>
            </div>
            <p className="text-xs text-[#9CB3E6] mt-1 max-w-md">
              {activeWorld.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0A102E]/60 px-4 py-2 rounded-2xl border border-white/10 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Realm Progress</span>
              <span className="font-heading text-sm text-[#FFD467]">
                {worldStars} / {worldMaxStars} Stars
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#182453] border border-[#FFD467]/50 flex items-center justify-center text-[#FFD467]">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Stepping Stone Adventure Trail */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-6 flex-1 flex flex-col items-center">
        <div className="w-full relative flex flex-col items-center gap-5 my-2">
          {activeWorld.puzzles.map((puzzle, index) => {
            const levelNum = index + 1;
            const progress = playerStats.levelProgress[puzzle.id];
            const isSolved = progress?.solved;
            const stars = progress?.stars || 0;

            // Level is unlocked if it's level 1, or if previous level has been attempted/solved
            const prevPuzzle = activeWorld.puzzles[index - 1];
            const isUnlocked = index === 0 || !!playerStats.levelProgress[prevPuzzle?.id]?.solved || stars > 0;
            const isCurrent = isUnlocked && !isSolved;

            // Zig-zag offset for stepping stone path feel
            const xOffsets = ['translate-x-0', 'translate-x-12 sm:translate-x-16', 'translate-x-0', '-translate-x-12 sm:-translate-x-16'];
            const currentOffset = xOffsets[index % xOffsets.length];

            const showMilestoneChest = levelNum % 5 === 0;
            const chestId = `chest_${activeWorld.id}_${levelNum}`;
            const isChestClaimed = claimedChests[chestId];
            const canClaimChest = isSolved && !isChestClaimed;

            return (
              <React.Fragment key={puzzle.id}>
                {/* Stepping Stone Node */}
                <div
                  className={`flex flex-col items-center relative transition-transform duration-300 ${currentOffset}`}
                >
                  <button
                    id={`map-node-${puzzle.id}`}
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playTap();
                        onSelectLevel(activeWorld.id, puzzle.id);
                      } else {
                        sound.playError();
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl ${
                      isSolved
                        ? 'bg-gradient-to-t from-[#B8860B] via-[#E5A810] to-[#FFD467] text-[#4A2F00] border-4 border-[#FFF0A0] shadow-[0_0_25px_rgba(255,212,103,0.4)]'
                        : isCurrent
                        ? 'bg-gradient-to-t from-[#1F4385] to-[#3B82F6] text-white border-4 border-[#93E6FB] shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-bounce'
                        : isUnlocked
                        ? 'bg-[#1D2A5E] text-[#FFF7E3] border-2 border-[#384E8F]'
                        : 'bg-[#101735] text-gray-500 border-2 border-[#1E284D] cursor-not-allowed opacity-60'
                    }`}
                  >
                    {/* Badge / Number */}
                    <div className="flex items-center justify-center">
                      {!isUnlocked ? (
                        <Lock className="w-5 h-5 text-gray-500" />
                      ) : (
                        <span className="font-heading text-lg sm:text-2xl font-black drop-shadow-sm">
                          {levelNum}
                        </span>
                      )}
                    </div>

                    {/* Stars Earned Underneath Level Number */}
                    {isUnlocked && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= stars
                                ? 'fill-[#5B3900] text-[#5B3900]'
                                : isSolved
                                ? 'fill-[#8B6508]/40 text-[#8B6508]/40'
                                : 'text-gray-500 fill-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Current Level Indicator Ring */}
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-ping"></div>
                    )}
                  </button>

                  {/* Level label & difficulty */}
                  <span className="text-[11px] font-heading text-[#9CB3E6] mt-1 font-bold">
                    {isSolved ? (
                      <span className="text-[#FFD467] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[#5EC3FF]">Play Now</span>
                    ) : (
                      `Trick #${levelNum}`
                    )}
                  </span>
                </div>

                {/* Milestone Chest Node if applicable */}
                {showMilestoneChest && (
                  <div className="my-2 p-3 rounded-2xl bg-[#151F45] border-2 border-[#FFD467]/60 flex items-center justify-between gap-4 max-w-sm w-full shadow-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 ${
                          isChestClaimed
                            ? 'bg-[#1C264D] border-gray-600 text-gray-500'
                            : canClaimChest
                            ? 'bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border-[#FFE8A3] text-[#5B3900] shadow-[0_0_20px_rgba(255,212,103,0.5)] animate-pulse'
                            : 'bg-[#141C3D] border-[#293A70] text-gray-400'
                        }`}
                      >
                        <Gift className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-heading font-black text-[#FFD467]">
                          Milestone Chest (Trick {levelNum})
                        </div>
                        <span className="text-[10px] text-[#9CB3E6]">
                          {isChestClaimed
                            ? 'Claimed: +50 Coins & +10 Gems'
                            : canClaimChest
                            ? 'Ready to unlock!'
                            : `Complete Trick ${levelNum} to unlock`}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`claim-${chestId}-btn`}
                      onClick={() => handleClaimChest(chestId, 50, 10)}
                      disabled={!canClaimChest}
                      className={`px-3 py-1.5 rounded-xl font-heading text-xs transition-all ${
                        isChestClaimed
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          : canClaimChest
                          ? 'btn-chunky-orange text-white shadow-md hover:scale-105 active:scale-95'
                          : 'bg-[#1C264D] text-gray-400 cursor-not-allowed border border-[#2B3C75]'
                      }`}
                    >
                      {isChestClaimed ? 'Opened' : canClaimChest ? 'Open!' : 'Locked'}
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
