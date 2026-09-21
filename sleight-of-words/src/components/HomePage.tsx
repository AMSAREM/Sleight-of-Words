import React from 'react';
import {
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
  User,
  ChevronRight,
  Award,
  Layers,
  Zap,
  Flame,
  Music,
  CheckCircle2
} from 'lucide-react';
import { GameMode, PlayerStats, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { DailyStreakData, getCurrentWeekStreakStatus } from '../utils/streak';

interface HomePageProps {
  currentUser: UserProfile | null;
  playerStats: PlayerStats;
  dailyStreak: DailyStreakData;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAuth: () => void;
  onOpenHowToPlay: () => void;
  onOpenDaily: () => void;
  onGoToMap: () => void;
  onGoToMultiplayer: () => void;
  onGoToLaunch: () => void;
  onStartMode: (mode: GameMode) => void;
  onQuickPlay: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  playerStats,
  dailyStreak,
  isMuted,
  onToggleMute,
  onOpenAuth,
  onOpenHowToPlay,
  onOpenDaily,
  onGoToMap,
  onGoToMultiplayer,
  onGoToLaunch,
  onStartMode,
  onQuickPlay
}) => {
  // Aggregate stats
  const totalStars = Object.values(playerStats.levelProgress).reduce(
    (acc, curr) => acc + (curr.stars || 0),
    0
  );
  const solvedCount = Object.values(playerStats.levelProgress).filter((p) => p.solved).length;
  const threeStarCount = Object.values(playerStats.levelProgress).filter((p) => p.stars === 3).length;
  const weekStatus = getCurrentWeekStreakStatus(dailyStreak);

  return (
    <div
      id="home-page-view"
      className="min-h-screen bg-[#0A102E] text-[#FFF7E3] flex flex-col font-sans pb-16 selection:bg-[#F58A12] selection:text-white"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1638]/90 backdrop-blur-md border-b border-[#253258] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playTap();
                onGoToLaunch();
              }}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border border-[#FFE8A3] flex items-center justify-center text-lg shadow-md hover:scale-105 transition-transform"
              title="Return to Launch Page & Theme Song"
            >
              🎩
            </button>
            <div>
              <span className="font-heading text-lg sm:text-xl font-black text-[#FFD467] tracking-wider block leading-none">
                SLEIGHT OF WORDS
              </span>
              <span className="text-[10px] text-[#9CB3E6] font-semibold tracking-wide">
                The Parlor of Word Illusions
              </span>
            </div>
          </div>

          {/* Right Header items: Theme/Launch, Audio, Help, Profile */}
          <div className="flex items-center gap-2">
            {/* Launch / Theme Song Curtain button */}
            <button
              id="home-launch-screen-btn"
              onClick={() => {
                sound.playTap();
                onGoToLaunch();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#182453] hover:bg-[#253675] text-[#FFD467] border border-[#FFD467]/30 text-xs font-heading font-black shadow-sm transition-all"
              title="Return to Launch Screen & Theme Song"
            >
              <Music className="w-3.5 h-3.5 text-[#FFD467]" />
              <span className="hidden sm:inline">Theme Curtain</span>
            </button>

            <button
              id="home-sound-toggle-btn"
              onClick={onToggleMute}
              className="p-2 rounded-xl bg-[#182453] hover:bg-[#253675] text-[#9CB3E6] hover:text-white border border-[#2B3C75] transition-all"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              id="home-help-btn"
              onClick={() => {
                sound.playTap();
                onOpenHowToPlay();
              }}
              className="p-2 rounded-xl bg-[#182453] hover:bg-[#253675] text-[#9CB3E6] hover:text-white border border-[#2B3C75] transition-all"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Profile Pill */}
            <button
              id="home-profile-btn"
              onClick={() => {
                sound.playTap();
                onOpenAuth();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#182453] hover:bg-[#253675] border border-[#FFD467]/40 text-xs transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm">
                {currentUser?.avatar || '🎩'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-heading text-xs text-[#FFD467] font-bold block leading-tight">
                  {currentUser?.username || 'Magician Sign In'}
                </span>
                <span className="text-[9px] text-[#9CB3E6] block leading-none">
                  {currentUser?.title || 'Guest Conjurer'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="max-w-5xl mx-auto w-full px-4 pt-6 flex-1 flex flex-col gap-6">
        {/* Magician Stat Ribbon with Daily Streak */}
        <div className="bg-[#121A3B] rounded-3xl p-4 sm:p-5 border-2 border-[#293A70] shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border-2 border-[#FFE8A3] flex items-center justify-center text-3xl shadow-lg">
              {currentUser?.avatar || '🪄'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg sm:text-xl text-[#FFF7E3]">
                  {currentUser ? `Welcome, ${currentUser.username}!` : 'Welcome, Guest Conjurer!'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-heading font-black border border-amber-400/40">
                  {currentUser?.title || 'Apprentice Sleight'}
                </span>
              </div>
              <p className="text-xs text-[#9CB3E6] mt-0.5">
                Ready to spot hidden words trapped between ordinary sentences?
              </p>
            </div>
          </div>

          {/* Currency and Stats Pills: Streak, Stars, Coins, Gems */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Daily Streak Count Pill */}
            <div
              id="home-streak-pill"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-heading transition-all ${
                dailyStreak.currentStreak > 0
                  ? 'bg-gradient-to-r from-[#2B1736] to-[#1E1945] border-[#F58A12] text-[#FFD467] shadow-[0_0_12px_rgba(245,138,18,0.3)]'
                  : 'bg-[#0A102E] border-[#253675] text-[#9CB3E6]'
              }`}
              title={
                dailyStreak.hasSolvedToday
                  ? `Streak protected! You solved a puzzle today. Consecutive days: ${dailyStreak.currentStreak}`
                  : `Daily streak: ${dailyStreak.currentStreak} days. Solve a puzzle today to advance your streak!`
              }
            >
              <Flame
                className={`w-4 h-4 ${
                  dailyStreak.currentStreak > 0
                    ? 'text-[#F58A12] fill-[#F58A12] drop-shadow-[0_0_8px_rgba(245,138,18,0.8)] animate-pulse'
                    : 'text-gray-400'
                }`}
              />
              <span className="text-[#FFD467] font-black text-sm">{dailyStreak.currentStreak}</span>
              <span className="text-gray-400 text-[10px] hidden min-[400px]:inline">
                {dailyStreak.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
              </span>
              {dailyStreak.hasSolvedToday && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" title="Solved today!" />
              )}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0A102E] border border-[#FFD467]/30 text-xs font-heading">
              <Star className="w-4 h-4 fill-[#FFD467] text-[#FFD467]" />
              <span className="text-[#FFD467] font-black">{totalStars}</span>
              <span className="text-gray-400 text-[10px]">Stars</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0A102E] border border-[#FFD467]/30 text-xs font-heading">
              <div className="w-4 h-4 rounded-full bg-gradient-to-b from-[#FFE082] to-[#FFB300] text-[#5B3900] text-[10px] font-black flex items-center justify-center">
                ¢
              </div>
              <span className="text-[#FFD467] font-black">{playerStats.coins}</span>
              <span className="text-gray-400 text-[10px]">Coins</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0A102E] border border-[#5EC3FF]/30 text-xs font-heading">
              <div className="w-3 h-3 rotate-45 bg-[#5EC3FF]"></div>
              <span className="text-[#5EC3FF] font-black">{playerStats.gems}</span>
              <span className="text-gray-400 text-[10px]">Gems</span>
            </div>
          </div>
        </div>

        {/* Hero Quick Play Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#20153D] via-[#1B2754] to-[#12315E] border-3 border-[#FFD467] p-6 sm:p-8 shadow-[0_0_40px_rgba(255,212,103,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F58A12]/30 border border-[#F58A12] text-[#FFD467] text-xs font-heading font-black tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 text-[#F58A12] animate-pulse" />
              <span>THE GRAND ILLUSION AWAITS</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl text-[#FFF7E3] font-black tracking-tight leading-tight">
              Test Your Eyes & Wits Against The Word Master
            </h1>
            <p className="text-xs sm:text-sm text-[#9CB3E6] max-w-lg leading-relaxed">
              Words hide in plain sight between word boundaries, deceptive spaces, and cryptic fragments. Uncover them to earn stars, coins, and magical glory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              id="home-quick-play-btn"
              onClick={() => {
                sound.playTap();
                onQuickPlay();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-chunky-orange text-white font-heading text-lg font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-103 active:scale-97 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>QUICK PLAY</span>
            </button>

            <button
              id="home-explore-map-btn"
              onClick={() => {
                sound.playTap();
                onGoToMap();
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#182453] hover:bg-[#253675] text-[#5EC3FF] border-2 border-[#5EC3FF]/50 font-heading text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Map className="w-4 h-4" />
              <span>WORLD MAP</span>
            </button>
          </div>
        </div>

        {/* Dedicated Daily Streak Tracker Spotlight Section */}
        <div
          id="home-daily-streak-section"
          className="bg-gradient-to-r from-[#1B1138] via-[#141C47] to-[#0E234F] rounded-3xl p-5 sm:p-6 border-2 border-[#F58A12]/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#E7364B] via-[#F58A12] to-[#FFD467] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_25px_rgba(245,138,18,0.5)] border-2 border-[#FFE8A3]">
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

          {/* 7-Day Current Week Calendar Row */}
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <div className="flex items-center justify-between w-full md:w-auto gap-4 mb-2">
              <span className="text-[11px] text-[#9CB3E6] font-semibold uppercase tracking-wide">
                This Week’s Streak
              </span>
              {!dailyStreak.hasSolvedToday && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenDaily();
                  }}
                  className="text-[11px] text-[#FFD467] font-bold underline hover:text-white"
                >
                  Play Daily Trick →
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {weekStatus.map((day) => (
                <div
                  key={day.dateStr}
                  className={`flex flex-col items-center justify-center w-9 sm:w-11 py-2 rounded-xl border text-center transition-all ${
                    day.isSolved
                      ? 'bg-gradient-to-b from-[#F58A12]/30 to-[#E7364B]/30 border-[#F58A12] text-[#FFD467] shadow-[0_0_10px_rgba(245,138,18,0.3)]'
                      : day.isToday
                      ? 'bg-[#1E2C63] border-[#5EC3FF] text-[#FFF7E3] animate-pulse'
                      : 'bg-[#0A102E]/80 border-[#223263] text-[#6377AA]'
                  }`}
                  title={`${day.dayLabel} (${day.dateStr}): ${day.isSolved ? 'Puzzle Solved!' : day.isToday ? 'Today (Pending solve)' : 'No solve recorded'}`}
                >
                  <span className="text-[10px] font-heading font-black">{day.dayLabel}</span>
                  <div className="mt-1 flex items-center justify-center">
                    {day.isSolved ? (
                      <Flame className="w-3.5 h-3.5 text-[#F58A12] fill-[#F58A12]" />
                    ) : day.isToday ? (
                      <div className="w-2 h-2 rounded-full bg-[#5EC3FF]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2B3B6D]" />
                    )}
                  </div>
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
            className="group cursor-pointer bg-[#151F45] hover:bg-[#1D2A5E] border-2 border-[#FFD467]/50 rounded-3xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
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
            className="group cursor-pointer bg-[#151F45] hover:bg-[#1D2A5E] border-2 border-[#F58A12]/50 rounded-3xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
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
            className="group cursor-pointer bg-[#151F45] hover:bg-[#1D2A5E] border-2 border-[#5EC3FF]/50 rounded-3xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
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
            <div className="bg-[#121A3B] rounded-3xl p-5 border-2 border-[#FFD467]/30 flex flex-col justify-between gap-4">
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
                className="w-full py-2.5 rounded-xl btn-chunky-orange text-white font-heading text-xs shadow-md"
              >
                PLAY SEAMS
              </button>
            </div>

            {/* Mode 2: Splits */}
            <div className="bg-[#121A3B] rounded-3xl p-5 border-2 border-[#5EC3FF]/30 flex flex-col justify-between gap-4">
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
                className="w-full py-2.5 rounded-xl btn-chunky-green text-white font-heading text-xs shadow-md"
              >
                PLAY SPLITS
              </button>
            </div>

            {/* Mode 3: Charades */}
            <div className="bg-[#121A3B] rounded-3xl p-5 border-2 border-[#C084FC]/30 flex flex-col justify-between gap-4">
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
                className="w-full py-2.5 rounded-xl bg-[#581C87] hover:bg-[#6B21A8] text-white font-heading text-xs shadow-md border border-[#7E22CE]"
              >
                PLAY CHARADES
              </button>
            </div>

            {/* Mode 4: Hangman */}
            <div className="bg-[#121A3B] rounded-3xl p-5 border-2 border-[#E7364B]/40 flex flex-col justify-between gap-4">
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
                className="w-full py-2.5 rounded-xl btn-chunky-red text-white font-heading text-xs shadow-md"
              >
                PLAY HANGMAN
              </button>
            </div>
          </div>
        </div>

        {/* Magician Achievement Badges Shelf */}
        <div className="bg-[#121A3B] rounded-3xl p-5 border-2 border-[#253258] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base text-[#FFD467] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F58A12]" />
              <span>Magician Achievements & Accolades</span>
            </h3>
            <span className="text-xs text-[#9CB3E6] font-mono">
              {solvedCount} Solved • {threeStarCount} Perfect 3★
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-[#0A102E] rounded-2xl border border-[#223060] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
                🪄
              </div>
              <div>
                <span className="text-xs font-heading text-[#FFF7E3] font-bold block">First Trick</span>
                <span className="text-[10px] text-emerald-400">
                  {solvedCount >= 1 ? 'Unlocked' : 'Solve 1 level'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#0A102E] rounded-2xl border border-[#223060] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
                ⭐
              </div>
              <div>
                <span className="text-xs font-heading text-[#FFF7E3] font-bold block">3-Star Master</span>
                <span className="text-[10px] text-emerald-400">
                  {threeStarCount >= 3 ? `${threeStarCount}/3 Cleared` : `${threeStarCount}/3 Cleared`}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#0A102E] rounded-2xl border border-[#223060] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg">
                ⚔️
              </div>
              <div>
                <span className="text-xs font-heading text-[#FFF7E3] font-bold block">Duelist</span>
                <span className="text-[10px] text-cyan-400">
                  {playerStats.multiplayerStats?.wins || 0} Wins
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#0A102E] rounded-2xl border border-[#223060] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                🎪
              </div>
              <div>
                <span className="text-xs font-heading text-[#FFF7E3] font-bold block">Grand Conjurer</span>
                <span className="text-[10px] text-amber-300">
                  {totalStars >= 20 ? 'Ascended' : `${totalStars}/20 Stars`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
