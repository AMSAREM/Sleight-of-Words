import React, { useMemo } from 'react';
import {
  Settings,
  Sparkles,
  Play,
  Map,
  Swords,
  Calendar,
  Star,
  Trophy,
  HelpCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  Flame,
  Music,
  CheckCircle2,
  Gift,
  Plus,
  Zap,
  Layers
} from 'lucide-react';
import { GameMode, PlayerStats, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { DailyStreakData, getCurrentWeekStreakStatus } from '../utils/streak';
import { AchievementsDashboard } from './AchievementsDashboard';
import { calculateAchievementsProgress } from '../data/achievements';
import { PainterlyLandscape } from './PainterlyLandscape';

interface HomePageProps {
  currentUser: UserProfile | null;
  playerStats: PlayerStats;
  dailyStreak: DailyStreakData;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenShop: () => void;
  onOpenDailyGift: () => void;
  onOpenAuth: () => void;
  onOpenHowToPlay: () => void;
  onOpenDaily: () => void;
  onGoToMap: () => void;
  onGoToMultiplayer: () => void;
  onGoToLaunch: () => void;
  onStartMode: (mode: GameMode) => void;
  onQuickPlay: () => void;
  onClaimAchievement?: (achievementId: string, reward: { coins: number; gems: number }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  playerStats,
  dailyStreak,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenShop,
  onOpenDailyGift,
  onOpenAuth,
  onOpenHowToPlay,
  onOpenDaily,
  onGoToMap,
  onGoToMultiplayer,
  onGoToLaunch,
  onStartMode,
  onQuickPlay,
  onClaimAchievement
}) => {
  // Aggregate stats
  const totalStars = Object.values(playerStats.levelProgress).reduce(
    (acc, curr) => acc + (curr.stars || 0),
    0
  );
  const solvedCount = Object.values(playerStats.levelProgress).filter((p) => p.solved).length;
  const nextLevelNumber = solvedCount + 1;
  const weekStatus = getCurrentWeekStreakStatus(dailyStreak);

  // Real-time achievements progress
  const achievementsProgress = useMemo(
    () => calculateAchievementsProgress(playerStats),
    [playerStats]
  );

  return (
    <div
      id="home-page-view"
      className="min-h-screen relative bg-[#0A102E] text-[#FFF7E3] flex flex-col font-sans pb-20 overflow-x-hidden selection:bg-[#F58A12] selection:text-white"
    >
      {/* Painterly Landscape Background (Screen 4 reference: illustrated depth with sky, hills, lighthouse, water, and reeds) */}
      <PainterlyLandscape className="opacity-90" />

      {/* Top Header Status Bar (Screen 4 reference) */}
      <header className="sticky top-0 z-40 bg-[#0E1638]/90 backdrop-blur-md border-b border-[#253258] px-3 sm:px-4 py-2.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Settings Button (Screen 4 reference: rounded square frame with top-left bevel) */}
          <div className="flex items-center gap-2">
            <button
              id="home-settings-btn"
              onClick={() => {
                sound.playTap();
                onOpenSettings();
              }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FFF7E3] to-[#EBDCB7] border-t-2 border-l-2 border-[#FFFFFF] shadow-[0_3px_0_#9E8F67] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_#9E8F67] flex items-center justify-center text-[#182453] transition-all"
              title="Game Settings"
              aria-label="Open Settings"
            >
              <Settings className="w-5 h-5 text-[#182453]" />
            </button>

            {/* Return to Launch Curtain button */}
            <button
              id="home-launch-screen-btn"
              onClick={() => {
                sound.playTap();
                onGoToLaunch();
              }}
              className="hidden min-[480px]:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#182453] hover:bg-[#253675] text-[#FFD467] border border-[#FFD467]/30 text-xs font-heading font-black shadow-sm transition-all"
              title="Return to Launch Curtain & Theme Song"
            >
              <Music className="w-3.5 h-3.5 text-[#FFD467]" />
              <span>Curtain</span>
            </button>
          </div>

          {/* Center: Lanterns / Flashlights counter (Screen 4 reference: "🏮 1") */}
          <div
            id="home-lanterns-counter"
            onClick={() => {
              sound.playTap();
              onOpenShop();
            }}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182453]/90 border border-[#5EC3FF]/40 hover:border-[#5EC3FF] shadow-sm text-xs font-heading transition-all"
            title="Flashlights / Lanterns: Illuminates hidden seam gaps! Tap to buy more in Shop"
          >
            <span className="text-base leading-none">🏮</span>
            <span className="text-[#FFD467] font-black text-sm">
              {playerStats.flashlights ?? 5}
            </span>
            <div className="w-4 h-4 rounded-full bg-[#5EC3FF] text-[#0A102E] flex items-center justify-center text-[10px] font-black leading-none ml-0.5">
              +
            </div>
          </div>

          {/* Right: Currency Status (Screen 4 reference: Coins with + and Gems with +) */}
          <div className="flex items-center gap-2">
            {/* Coins */}
            <div
              id="home-coins-counter"
              onClick={() => {
                sound.playTap();
                onOpenShop();
              }}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#182453]/90 border border-[#FFD467]/40 hover:border-[#FFD467] shadow-sm text-xs font-heading transition-all"
              title="Coins balance. Tap to buy more in Shop"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-b from-[#FFE082] to-[#FFB300] text-[#5B3900] text-[10px] font-black flex items-center justify-center shadow-inner">
                ¢
              </div>
              <span className="text-[#FFD467] font-black text-xs sm:text-sm">
                {playerStats.coins.toLocaleString()}
              </span>
              <div className="w-4 h-4 rounded-full bg-[#FFD467] text-[#5B3900] flex items-center justify-center text-[10px] font-black leading-none">
                +
              </div>
            </div>

            {/* Gems */}
            <div
              id="home-gems-counter"
              onClick={() => {
                sound.playTap();
                onOpenShop();
              }}
              className="hidden sm:flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182453]/90 border border-[#5EC3FF]/40 hover:border-[#5EC3FF] shadow-sm text-xs font-heading transition-all"
              title="Gems balance. Tap to buy more in Shop"
            >
              <div className="w-3.5 h-3.5 rotate-45 bg-[#27C2E8] shadow-sm"></div>
              <span className="text-[#5EC3FF] font-black text-xs sm:text-sm">
                {playerStats.gems.toLocaleString()}
              </span>
              <div className="w-4 h-4 rounded-full bg-[#5EC3FF] text-[#0A102E] flex items-center justify-center text-[10px] font-black leading-none">
                +
              </div>
            </div>

            {/* Magician Profile Avatar */}
            <button
              id="home-profile-btn"
              onClick={() => {
                sound.playTap();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-[#182453] hover:bg-[#253675] border border-[#FFD467]/30 text-xs transition-all shadow-sm"
              title="Magician Profile & Sign In"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border border-[#FFE8A3] flex items-center justify-center text-sm shadow">
                {currentUser?.avatar || '🎩'}
              </div>
              <span className="font-heading text-xs text-[#FFD467] font-bold hidden md:inline">
                {currentUser?.username || 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pt-6 flex-1 flex flex-col gap-6">
        {/* Central Stage Hero Section (Screen 4 reference: Sleight of Word branding + Big Chunky "▶ Level 22" Button) */}
        <div className="w-full flex flex-col items-center text-center pt-2 sm:pt-4 pb-2">
          {/* Top Logo / Title with Bevel Recipe */}
          <div className="relative inline-block mb-1">
            <h1 className="font-heading text-4xl sm:text-6xl text-[#FFD467] font-black tracking-wider leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] text-shadow-bevel">
              SLEIGHT OF WORDS
            </h1>
            <div className="inline-flex items-center gap-1.5 px-4 py-1 mt-2 rounded-full bg-[#182453]/80 backdrop-blur-sm border border-[#FFD467]/40 text-[#FFF7E3] text-xs font-heading font-black tracking-widest uppercase shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-[#F58A12]" />
              <span>THE PARLOR OF WORD ILLUSIONS</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#C2D4FF] max-w-md mt-2 font-bold drop-shadow">
            Spot hidden words trapped in plain sight across seams, deceptive spaces, and clever word alchemy.
          </p>

          {/* Primary Action Row: Big Chunky Pill Play Button (Screen 4 reference: "▶ Level 22" with Lantern helper) */}
          <div className="flex items-center justify-center gap-3 mt-6 w-full max-w-md px-2">
            <button
              id="home-hero-play-level-btn"
              onClick={() => {
                sound.playTap();
                onQuickPlay();
              }}
              className="flex-1 py-4 px-8 btn-wordlanes-purple text-lg sm:text-2xl font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-102 active:scale-98 transition-all"
            >
              <span className="text-xl">▶</span>
              <span>Level {nextLevelNumber}</span>
            </button>

            {/* Companion Lantern Badge (Screen 4 reference) */}
            <div
              onClick={() => {
                sound.playTap();
                onOpenShop();
              }}
              className="cursor-pointer w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FFF7E3] to-[#EBDCB7] border-t-2 border-l-2 border-[#FFFFFF] shadow-[0_4px_0_#9E8F67] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_#9E8F67] flex items-center justify-center text-2xl shrink-0 transition-all"
              title="Flashlight wands illuminate seams. Tap to buy in Shop"
            >
              🏮
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-4">
            {/* Daily Gift Button (Screen 6 reference) */}
            <button
              id="home-daily-gift-pill-btn"
              onClick={() => {
                sound.playTap();
                onOpenDailyGift();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-t border-l border-emerald-300 shadow-[0_3px_0_#065F46] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_1px_0_#065F46] text-xs font-heading font-black transition-all"
            >
              <Gift className="w-3.5 h-3.5 text-[#FFD467]" />
              <span>Daily Gift</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#5B3900] text-[9px] font-black">
                FREE
              </span>
            </button>

            {/* Adventure Map */}
            <button
              id="home-map-pill-btn"
              onClick={() => {
                sound.playTap();
                onGoToMap();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#182453]/90 hover:bg-[#253675] text-[#5EC3FF] border border-[#5EC3FF]/40 text-xs font-heading font-black shadow-md transition-all"
            >
              <Map className="w-3.5 h-3.5 text-[#5EC3FF]" />
              <span>Adventure Map</span>
            </button>

            {/* Daily Trick Spotlight */}
            <button
              id="home-daily-trick-pill-btn"
              onClick={() => {
                sound.playTap();
                onOpenDaily();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#182453]/90 hover:bg-[#253675] text-[#FFD467] border border-[#FFD467]/40 text-xs font-heading font-black shadow-md transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-[#F58A12]" />
              <span>Daily Trick ({dailyStreak.currentStreak}d)</span>
            </button>

            {/* Achievements Jump */}
            <button
              id="home-achievements-jump-btn"
              onClick={() => {
                sound.playTap();
                document.getElementById('achievements-dashboard')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#182453]/90 hover:bg-[#253675] text-[#FFF7E3] border border-[#FFD467]/30 text-xs font-heading font-black shadow-md transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFD467]" />
              <span>Badges ({achievementsProgress.filter((a) => a.isUnlocked).length}/{achievementsProgress.length})</span>
            </button>
          </div>
        </div>

        {/* Daily Streak & Trick Tracker Spotlight */}
        <div
          id="home-daily-streak-section"
          className="bg-[#121A3B]/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#F58A12]/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#E7364B] via-[#F58A12] to-[#FFD467] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_25px_rgba(245,138,18,0.5)] border-2 border-[#FFE8A3]">
                🔥
              </div>
              {dailyStreak.hasSolvedToday && (
                <div
                  className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 text-[10px] font-black border-2 border-[#141C47] shadow"
                  title="Solved today!"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-heading font-black text-[#FFD467] uppercase tracking-wider bg-[#F58A12]/20 px-2.5 py-0.5 rounded-full border border-[#F58A12]/40">
                  CONSECUTIVE DAYS TRACKER
                </span>
                <span className="text-xs font-heading text-[#5EC3FF]">
                  Personal Best: {dailyStreak.bestStreak} {dailyStreak.bestStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-[#FFF7E3]">
                  {dailyStreak.currentStreak} {dailyStreak.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
                </h3>
                <span className="text-xs text-[#9CB3E6]">
                  ({dailyStreak.totalDaysSolved} total {dailyStreak.totalDaysSolved === 1 ? 'day' : 'days'} solved)
                </span>
              </div>

              <p className="text-xs text-[#C2D4FF] mt-0.5 max-w-md">
                {dailyStreak.hasSolvedToday
                  ? '✨ Magnificent sleight! You solved a puzzle today. Your streak is safely locked in!'
                  : '⚡ At Risk! Solve at least one puzzle today to advance and maintain your daily streak!'}
              </p>
            </div>
          </div>

          {/* 7-Day Weekly Streak Dots */}
          <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
            <span className="text-[11px] font-heading font-bold text-gray-400 uppercase tracking-wider">
              THIS WEEK'S TRACK
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {weekStatus.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-heading font-black border transition-all ${
                      day.isToday
                        ? 'border-[#F58A12] ring-2 ring-[#F58A12]/50 scale-105'
                        : 'border-[#293A70]'
                    } ${
                      day.isSolved
                        ? 'bg-gradient-to-tr from-[#F58A12] to-[#FFD467] text-[#4A2F00] shadow-md'
                        : !day.isPast && !day.isToday
                        ? 'bg-[#0E1638] text-gray-500'
                        : 'bg-[#182453] text-gray-400'
                    }`}
                  >
                    {day.isSolved ? '★' : day.dayLabel[0]}
                  </div>
                  <span className="text-[9px] text-gray-400">{day.dayLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Hub Grid: Map, Multiplayer, Daily */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stepping Stone Map Card */}
          <div
            id="home-card-map"
            onClick={() => {
              sound.playTap();
              onGoToMap();
            }}
            className="group cursor-pointer bg-[#151F45]/90 hover:bg-[#1D2A5E] border-2 border-[#FFD467]/50 rounded-3xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B8860B] to-[#FFE082] text-[#4A2F00] flex items-center justify-center shadow">
                  <Map className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-heading font-black text-[#FFD467] bg-[#FFD467]/10 px-2.5 py-1 rounded-full border border-[#FFD467]/30">
                  3 WORLDS • 40 TRICKS
                </span>
              </div>
              <h3 className="font-heading text-lg text-[#FFF7E3] group-hover:text-[#FFD467] transition-colors">
                Stepping Stone Map
              </h3>
              <p className="text-xs text-[#9CB3E6] mt-1 leading-relaxed">
                Journey through the Carnival of Seams, Split Alley, and Grand Charade Parlor with milestone treasure chests.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#253258] flex items-center justify-between text-xs text-[#FFD467] font-heading font-bold">
              <span>Enter Map</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Multiplayer Arena Card */}
          <div
            id="home-card-multiplayer"
            onClick={() => {
              sound.playTap();
              onGoToMultiplayer();
            }}
            className="group cursor-pointer bg-[#151F45]/90 hover:bg-[#1D2A5E] border-2 border-[#F58A12]/50 rounded-3xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E7364B] to-[#F58A12] text-white flex items-center justify-center shadow">
                  <Swords className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-heading font-black text-[#F58A12] bg-[#F58A12]/10 px-2.5 py-1 rounded-full border border-[#F58A12]/30">
                  1v1 SLEIGHT DUELS
                </span>
              </div>
              <h3 className="font-heading text-lg text-[#FFF7E3] group-hover:text-[#F58A12] transition-colors">
                Multiplayer Arena
              </h3>
              <p className="text-xs text-[#9CB3E6] mt-1 leading-relaxed">
                Duel against AI Rival Conjurers (Barnaby, Celeste, Archmage Vex) or challenge a friend in 2-Player Pass & Play!
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#253258] flex items-center justify-between text-xs text-[#F58A12] font-heading font-bold">
              <span>Start Duel</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Daily Mystery Trick Card */}
          <div
            id="home-card-daily"
            onClick={() => {
              sound.playTap();
              onOpenDaily();
            }}
            className="group cursor-pointer bg-[#151F45]/90 hover:bg-[#1D2A5E] border-2 border-[#5EC3FF]/50 rounded-3xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#27C2E8] to-[#93E6FB] text-[#0A102E] flex items-center justify-center shadow">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-heading font-black text-[#5EC3FF] bg-[#5EC3FF]/10 px-2.5 py-1 rounded-full border border-[#5EC3FF]/30">
                  MYSTERY CHEST
                </span>
              </div>
              <h3 className="font-heading text-lg text-[#FFF7E3] group-hover:text-[#5EC3FF] transition-colors">
                Daily Trick Spotlight
              </h3>
              <p className="text-xs text-[#9CB3E6] mt-1 leading-relaxed">
                Solve 5 curated daily puzzles to reveal the hidden mystery image and unlock daily treasure chests!
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#253258] flex items-center justify-between text-xs text-[#5EC3FF] font-heading font-bold">
              <span>View Daily Trick</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 4 Game Modes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-heading text-xl text-[#FFD467] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#F58A12]" />
                <span>The Four Illusion Modes</span>
              </h2>
              <p className="text-xs text-[#9CB3E6]">
                Master the different forms of linguistic sleight of hand
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mode 1: Seams */}
            <div className="bg-[#121A3B]/95 rounded-3xl p-5 border-2 border-[#FFD467]/30 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-base text-[#FFD467] font-bold">
                    1. The Seams
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#182453] px-2 py-0.5 rounded text-amber-300">
                    Crossover
                  </span>
                </div>
                <p className="text-xs text-[#9CB3E6] leading-relaxed">
                  A hidden word crosses between two adjacent words.
                </p>
                <div className="mt-3 p-2.5 bg-[#0A102E] rounded-xl border border-[#223060] text-xs">
                  <span className="text-gray-400">Example:</span>
                  <div className="font-mono mt-0.5 text-[#FFF7E3]">
                    “The cra<strong className="text-amber-300">b ear</strong>ned a medal” → <span className="text-emerald-400 font-bold">BEAR</span>
                  </div>
                </div>
              </div>

              <button
                id="play-seams-mode-btn"
                onClick={() => {
                  sound.playTap();
                  onStartMode('seams');
                }}
                className="w-full py-2.5 rounded-xl btn-wordlanes-orange text-white font-heading text-xs shadow-md"
              >
                PLAY SEAMS
              </button>
            </div>

            {/* Mode 2: Splits */}
            <div className="bg-[#121A3B]/95 rounded-3xl p-5 border-2 border-[#5EC3FF]/30 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-base text-[#5EC3FF] font-bold">
                    2. The Splits
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#182453] px-2 py-0.5 rounded text-cyan-300">
                    Space Alchemy
                  </span>
                </div>
                <p className="text-xs text-[#9CB3E6] leading-relaxed">
                  Insert a space inside a single word to transform the sentence's meaning entirely.
                </p>
                <div className="mt-3 p-2.5 bg-[#0A102E] rounded-xl border border-[#223060] text-xs">
                  <span className="text-gray-400">Example:</span>
                  <div className="font-mono mt-0.5 text-[#FFF7E3]">
                    “A <strong className="text-cyan-300">scar city</strong>” ↔ “A <strong className="text-cyan-300">scarcity</strong>”
                  </div>
                </div>
              </div>

              <button
                id="play-splits-mode-btn"
                onClick={() => {
                  sound.playTap();
                  onStartMode('splits');
                }}
                className="w-full py-2.5 rounded-xl btn-wordlanes-green text-white font-heading text-xs shadow-md"
              >
                PLAY SPLITS
              </button>
            </div>

            {/* Mode 3: Charades */}
            <div className="bg-[#121A3B]/95 rounded-3xl p-5 border-2 border-[#C084FC]/30 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-base text-[#C084FC] font-bold">
                    3. The Charades
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#182453] px-2 py-0.5 rounded text-purple-300">
                    Part-to-Whole
                  </span>
                </div>
                <p className="text-xs text-[#9CB3E6] leading-relaxed">
                  Solve small clue fragments and stitch them together to form the master whole.
                </p>
                <div className="mt-3 p-2.5 bg-[#0A102E] rounded-xl border border-[#223060] text-xs">
                  <span className="text-gray-400">Example:</span>
                  <div className="font-mono mt-0.5 text-[#FFF7E3]">
                    [Vehicle: <strong className="text-purple-300">CAR</strong>] + [Domestic Animal: <strong className="text-purple-300">PET</strong>] = <span className="text-emerald-400 font-bold">CARPET</span>
                  </div>
                </div>
              </div>

              <button
                id="play-charades-mode-btn"
                onClick={() => {
                  sound.playTap();
                  onStartMode('charades');
                }}
                className="w-full py-2.5 rounded-xl btn-wordlanes-purple text-white font-heading text-xs shadow-md"
              >
                PLAY CHARADES
              </button>
            </div>

            {/* Mode 4: Hangman */}
            <div className="bg-[#121A3B]/95 rounded-3xl p-5 border-2 border-[#E7364B]/40 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading text-base text-[#FF6B8B] font-bold">
                    4. The Hangman
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#182453] px-2 py-0.5 rounded text-rose-300">
                    Letter Sleight
                  </span>
                </div>
                <p className="text-xs text-[#9CB3E6] leading-relaxed">
                  Decipher the secret mystery word letter-by-letter before the gallows strikes run out!
                </p>
                <div className="mt-3 p-2.5 bg-[#0A102E] rounded-xl border border-[#223060] text-xs">
                  <span className="text-gray-400">Clue:</span>
                  <div className="font-mono mt-0.5 text-[#FFF7E3]">
                    “Ancient vanish incantation” → <span className="text-emerald-400 font-bold">ABRACADABRA</span>
                  </div>
                </div>
              </div>

              <button
                id="play-hangman-mode-btn"
                onClick={() => {
                  sound.playTap();
                  onStartMode('hangman');
                }}
                className="w-full py-2.5 rounded-xl btn-wordlanes-orange text-white font-heading text-xs shadow-md"
              >
                PLAY HANGMAN
              </button>
            </div>
          </div>
        </div>

        {/* Magician Achievements Dashboard (Word Lanes Visual System) */}
        <AchievementsDashboard
          achievements={achievementsProgress}
          onClaimReward={onClaimAchievement || (() => {})}
        />
      </main>
    </div>
  );
};
