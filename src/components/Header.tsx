import React from 'react';
import { Volume2, VolumeX, Map, Calendar, Sparkles, Heart, HelpCircle, CheckSquare, Home, Swords, User, Flame, Music } from 'lucide-react';
import { GameMode, PlayerStats, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { DailyStreakData } from '../utils/streak';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: PlayerStats;
  currentLevelIndex: number;
  totalLevels: number;
  isDailyMode: boolean;
  currentUser: UserProfile | null;
  dailyStreak?: DailyStreakData;
  onOpenAuth: () => void;
  onGoHome: () => void;
  onGoToLaunch?: () => void;
  onOpenMap: () => void;
  onOpenDaily: () => void;
  onGoToMultiplayer: () => void;
  onOpenValidator: () => void;
  onOpenHowToPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  stats,
  currentLevelIndex,
  totalLevels,
  isDailyMode,
  currentUser,
  dailyStreak,
  onOpenAuth,
  onGoHome,
  onGoToLaunch,
  onOpenMap,
  onOpenDaily,
  onGoToMultiplayer,
  onOpenValidator,
  onOpenHowToPlay
}) => {
  const [muted, setMuted] = React.useState<boolean>(sound.getMuted());

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playTap();
    }
  };

  const modeInfo = {
    seams: { label: 'Seams', color: 'bg-purple-600 border-purple-400 text-purple-100', activeBg: 'btn-chunky-purple' },
    splits: { label: 'Splits', color: 'bg-amber-600 border-amber-400 text-amber-100', activeBg: 'btn-chunky-orange' },
    charades: { label: 'Charades', color: 'bg-emerald-600 border-emerald-400 text-emerald-100', activeBg: 'btn-chunky-green' },
    hangman: { label: 'Hangman', color: 'bg-rose-600 border-rose-400 text-rose-100', activeBg: 'btn-chunky-red' }
  };

  return (
    <header id="app-header" className="w-full bg-[#0E1638] border-b border-[#253675] shadow-lg sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-3 py-2 flex flex-col gap-2">
        {/* Top bar: Brand, Parlor, Duel, Map & Stats */}
        <div className="flex items-center justify-between">
          {/* Logo & Parlor Home button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="header-home-btn"
              onClick={() => {
                sound.playTap();
                onGoHome();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#182453] hover:bg-[#253675] text-[#FFD467] hover:text-white border border-[#FFD467]/30 text-xs font-heading font-black shadow-sm transition-all"
              title="Return to Parlor Hub"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Parlor</span>
            </button>

            <button
              id="brand-logo-btn"
              onClick={onGoHome}
              className="flex items-center gap-1.5 text-left group transition-transform active:scale-95"
              title="Sleight of Words"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#F58A12] to-[#FFD467] flex items-center justify-center shadow-md border border-[#FFE699]">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#182453]" />
              </div>
              <div className="hidden min-[420px]:block">
                <h1 className="font-heading text-base sm:text-lg text-[#FFF7E3] leading-none drop-shadow-sm">
                  Sleight of Words
                </h1>
                <p className="text-[9px] text-[#5EC3FF] font-bold tracking-wide uppercase">Hidden Word Puzzles</p>
              </div>
            </button>
          </div>

          {/* Player status: Hearts, Coins, Gems, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hearts (Focus) */}
            <div
              id="player-hearts"
              className="flex items-center gap-0.5 sm:gap-1 bg-[#182453] px-2 py-1 rounded-full border border-[#2D4288] shadow-inner"
              title="Focus: 3 hearts per level"
            >
              {[1, 2, 3].map((heartNum) => (
                <Heart
                  key={heartNum}
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    heartNum <= stats.hearts
                      ? 'fill-[#E7364B] text-[#E7364B] drop-shadow-[0_0_6px_rgba(231,54,75,0.7)] scale-100'
                      : 'fill-[#3B4875] text-[#253258] scale-75'
                  }`}
                />
              ))}
            </div>

            {/* Daily Streak */}
            {dailyStreak !== undefined && (
              <div
                id="header-player-streak"
                className={`flex items-center gap-1 bg-[#182453] px-2 py-1 rounded-full border shadow-inner ${
                  dailyStreak.currentStreak > 0 ? 'border-[#F58A12]/60 text-[#FFD467]' : 'border-[#2D4288] text-[#9CB3E6]'
                }`}
                title={`Daily Streak: ${dailyStreak.currentStreak} days`}
              >
                <Flame className={`w-3.5 h-3.5 ${dailyStreak.currentStreak > 0 ? 'text-[#F58A12] fill-[#F58A12]' : 'text-gray-400'}`} />
                <span className="font-heading text-xs font-black">{dailyStreak.currentStreak}</span>
              </div>
            )}

            {/* Coins */}
            <div
              id="player-coins"
              className="flex items-center gap-1 bg-[#182453] px-2 py-1 rounded-full border border-[#FFD467]/30 shadow-inner"
              title="Coins earned from clearing levels"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#FFE082] to-[#FFB300] border border-[#FFD467] flex items-center justify-center text-[9px] font-black text-[#5B3900]">
                ¢
              </div>
              <span className="font-heading text-xs text-[#FFD467]">{stats.coins}</span>
            </div>

            {/* Gems */}
            <div
              id="player-gems"
              className="flex items-center gap-1 bg-[#182453] px-2 py-1 rounded-full border border-[#5EC3FF]/30 shadow-inner"
              title="Gems earned from 3-star clears & daily tricks"
            >
              <div className="w-3 h-3 rotate-45 bg-gradient-to-tr from-[#27C2E8] to-[#93E6FB] border border-[#5EC3FF] shadow-[0_0_6px_rgba(39,194,232,0.6)]"></div>
              <span className="font-heading text-xs text-[#5EC3FF]">{stats.gems}</span>
            </div>

            {/* Theme Song / Title Curtain Button */}
            {onGoToLaunch && (
              <button
                id="header-launch-btn"
                onClick={() => {
                  sound.playTap();
                  onGoToLaunch();
                }}
                title="Launch Curtain & Theme Song"
                className="p-1.5 rounded-lg bg-[#182453] text-[#FFD467] hover:text-white hover:bg-[#253675] border border-[#FFD467]/30 transition-all"
              >
                <Music className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Sound toggle button */}
            <button
              id="sound-toggle-btn"
              onClick={handleToggleSound}
              aria-label={muted ? 'Unmute game sounds' : 'Mute game sounds'}
              className="p-1.5 rounded-lg bg-[#182453] text-[#5EC3FF] hover:text-[#FFF7E3] hover:bg-[#253675] border border-[#2D4288] transition-all"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* User Profile / Auth Button */}
            <button
              id="header-user-profile-btn"
              onClick={() => {
                sound.playTap();
                onOpenAuth();
              }}
              className="p-1 rounded-lg bg-[#182453] hover:bg-[#253675] border border-[#FFD467]/40 text-sm shadow-sm transition-all"
              title={currentUser ? `Signed in as ${currentUser.username}` : 'Sign In / Sign Up'}
            >
              {currentUser?.avatar ? <span>{currentUser.avatar}</span> : <User className="w-4 h-4 text-[#FFD467]" />}
            </button>
          </div>
        </div>

        {/* Second row: Mode selector tabs & navigation shortcuts */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
          {/* Main 3 Modes */}
          <div className="flex items-center gap-1.5">
            {(['seams', 'splits', 'charades', 'hangman'] as GameMode[]).map((mode) => {
              const active = currentMode === mode && !isDailyMode;
              const info = modeInfo[mode];
              return (
                <button
                  key={mode}
                  id={`mode-tab-${mode}`}
                  onClick={() => {
                    sound.playTap();
                    onSelectMode(mode);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-heading text-xs sm:text-sm tracking-wide transition-all whitespace-nowrap flex items-center gap-1 border ${
                    active
                      ? `${info.activeBg} text-[#FFF7E3] border-white/40 scale-105 shadow-md`
                      : 'bg-[#182453] text-[#9CB3E6] border-[#253675] hover:bg-[#202F68]'
                  }`}
                >
                  <span>{info.label}</span>
                  {active && (
                    <span className="text-[10px] opacity-90 px-1 py-0.2 bg-black/20 rounded">
                      {currentLevelIndex + 1}/{totalLevels}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Navigation: Stepping Map, Multiplayer Duel, Daily */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              id="header-duel-arena-btn"
              onClick={() => {
                sound.playTap();
                onGoToMultiplayer();
              }}
              className="px-2 py-1 rounded-xl bg-[#1F1938] text-[#F58A12] border border-[#F58A12]/40 hover:bg-[#2A1F4C] transition-all flex items-center gap-1 text-xs font-heading font-black"
              title="1v1 Sleight Duel Arena"
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duel</span>
            </button>

            <button
              id="header-stepping-map-btn"
              onClick={() => {
                sound.playTap();
                onOpenMap();
              }}
              className="px-2 py-1 rounded-xl bg-[#182453] text-[#5EC3FF] border border-[#253258] hover:bg-[#202F68] hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
              title="Stepping Stone Realm Map"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>

            <button
              id="daily-trick-header-btn"
              onClick={() => {
                sound.playTap();
                onOpenDaily();
              }}
              className={`px-2 py-1 rounded-xl font-heading text-xs flex items-center gap-1 border transition-all ${
                isDailyMode
                  ? 'btn-chunky-orange text-white border-amber-300'
                  : 'bg-[#1D2A5E] text-[#FFD467] border-[#FFB63B]/40 hover:bg-[#253675]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#FFB63B]" />
              <span className="hidden md:inline">Daily</span>
            </button>

            <button
              id="spec-validator-btn"
              onClick={() => {
                sound.playTap();
                onOpenValidator();
              }}
              className="p-1 rounded-xl bg-[#182453] text-[#9CB3E6] border border-[#253258] hover:bg-[#202F68] hover:text-[#7CE04A] transition-all"
              title="SPEC.md Puzzle Sandbox & Validator"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>

            <button
              id="rules-help-btn"
              onClick={() => {
                sound.playTap();
                onOpenHowToPlay();
              }}
              className="p-1 rounded-xl bg-[#182453] text-[#9CB3E6] border border-[#253258] hover:bg-[#202F68] hover:text-white transition-all"
              title="Rules & How to Play"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
