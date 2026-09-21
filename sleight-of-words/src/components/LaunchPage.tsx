import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  Flame,
  HelpCircle,
  Music,
  Map,
  Swords,
  ChevronRight,
  Star
} from 'lucide-react';
import { DailyStreakData } from '../utils/streak';
import { sound } from '../utils/audio';

interface LaunchPageProps {
  dailyStreak: DailyStreakData;
  isMuted: boolean;
  onToggleMute: () => void;
  onEnterParlor: () => void;
  onQuickPlay: () => void;
  onOpenHowToPlay: () => void;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({
  dailyStreak,
  isMuted,
  onToggleMute,
  onEnterParlor,
  onQuickPlay,
  onOpenHowToPlay
}) => {
  const [isPlayingTheme, setIsPlayingTheme] = useState<boolean>(sound.isThemeSongPlaying());
  const [activeBeat, setActiveBeat] = useState<number>(0);

  // Subscribe to theme song events
  useEffect(() => {
    const unsubState = sound.onThemeStateChange((playing) => {
      setIsPlayingTheme(playing);
    });

    const unsubBeat = sound.onThemeBeat((beat) => {
      setActiveBeat(beat);
    });

    return () => {
      unsubState();
      unsubBeat();
    };
  }, []);

  // Keyboard shortcut: Press Enter or Space to enter parlor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.playTap();
        onEnterParlor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnterParlor]);

  const handleToggleTheme = () => {
    const nextState = sound.toggleThemeSong();
    setIsPlayingTheme(nextState);
  };

  // Generate visualizer bar heights based on current beat
  const getBarHeight = (barIndex: number): number => {
    if (!isPlayingTheme) return 15;
    const base = [45, 80, 60, 95, 70, 85, 55, 90][barIndex % 8];
    const wave = Math.sin((activeBeat + barIndex) * 0.8) * 25;
    return Math.max(18, Math.min(100, Math.round(base + wave)));
  };

  return (
    <div
      id="launch-page-view"
      className="relative min-h-screen bg-[#070B21] text-[#FFF7E3] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none font-sans"
    >
      {/* Mystical Parlor Background Atmospheric Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep ambient spotlights */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#F58A12]/15 via-[#7E22CE]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#27C2E8]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#F58A12]/10 rounded-full blur-3xl"></div>

        {/* Floating magic card suit silhouettes */}
        <div className="absolute top-12 left-8 text-4xl opacity-10 text-[#FFD467] animate-pulse">♠</div>
        <div className="absolute top-32 right-12 text-3xl opacity-15 text-[#E7364B]">♥</div>
        <div className="absolute bottom-28 left-16 text-3xl opacity-10 text-[#FFD467]">♦</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-15 text-[#5EC3FF]">♣</div>
        <div className="absolute top-1/2 left-6 text-xl opacity-20 text-[#FFD467]">✨</div>
        <div className="absolute top-1/3 right-8 text-2xl opacity-20 text-[#FFD467]">🪄</div>
      </div>

      {/* Top Bar: Audio Controls & Help */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#182453]/80 border border-[#2B3C75] text-[11px] font-heading font-black tracking-widest text-[#FFD467] uppercase">
            ★ THE ILLUSIONIST'S SANCTUM ★
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Song Toggle Button */}
          <button
            id="launch-theme-song-btn"
            onClick={handleToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-heading font-black transition-all ${
              isPlayingTheme
                ? 'bg-[#F58A12]/20 border-[#F58A12] text-[#FFD467] shadow-[0_0_15px_rgba(245,138,18,0.4)] animate-pulse'
                : 'bg-[#182453]/80 border-[#2B3C75] text-[#9CB3E6] hover:text-white'
            }`}
            title={isPlayingTheme ? 'Pause Theme Song' : 'Play Theme Song (The Conjurer’s Waltz)'}
          >
            <Music className={`w-3.5 h-3.5 ${isPlayingTheme ? 'text-[#FFD467]' : 'text-gray-400'}`} />
            <span>{isPlayingTheme ? 'Theme Playing' : 'Play Theme'}</span>
          </button>

          {/* Sound FX Mute Button */}
          <button
            id="launch-sound-toggle-btn"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-[#182453]/80 hover:bg-[#253675] text-[#9CB3E6] hover:text-white border border-[#2B3C75] transition-all"
            title={isMuted ? 'Unmute FX' : 'Mute FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* How to Play Modal */}
          <button
            id="launch-help-btn"
            onClick={() => {
              sound.playTap();
              onOpenHowToPlay();
            }}
            className="p-2 rounded-xl bg-[#182453]/80 hover:bg-[#253675] text-[#9CB3E6] hover:text-white border border-[#2B3C75] transition-all"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Theatrical Marquee Centerpiece */}
      <main className="w-full max-w-2xl my-auto py-6 flex flex-col items-center text-center z-10">
        {/* Top Magician's Emblem */}
        <div className="relative mb-4 group cursor-pointer" onClick={handleToggleTheme}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#F58A12] via-[#FFD467] to-[#FFF1BF] border-3 border-[#FFE699] flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_35px_rgba(245,138,18,0.5)] transform hover:rotate-6 hover:scale-105 transition-all">
            🎩
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#182453] border-2 border-[#FFD467] flex items-center justify-center text-xs">
            ✨
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-heading font-black tracking-[0.25em] text-[#5EC3FF] uppercase drop-shadow">
            A Masterclass in Linguistic Sleight of Hand
          </p>

          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF2] via-[#FFD467] to-[#E58C0B] tracking-wide leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            SLEIGHT OF WORDS
          </h1>

          <p className="text-sm sm:text-base text-[#C2D4FF] max-w-md mx-auto leading-relaxed pt-1 font-medium">
            Where letters masquerade, sentences harbor secrets, and clever minds spot the invisible seams.
          </p>
        </div>

        {/* Interactive Theme Song Audio Box & Equalizer */}
        <div className="mt-6 w-full max-w-md bg-[#121A3B]/90 backdrop-blur-md rounded-2xl p-3.5 border-2 border-[#2C3E7C] shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="launch-music-circle-btn"
              onClick={handleToggleTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                isPlayingTheme
                  ? 'bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border-amber-300 text-[#211200] shadow-[0_0_15px_rgba(255,212,103,0.5)]'
                  : 'bg-[#182453] border-[#2D3F77] text-[#9CB3E6] hover:text-white'
              }`}
            >
              <Music className={`w-5 h-5 ${isPlayingTheme ? 'animate-bounce' : ''}`} />
            </button>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-xs font-bold text-[#FFD467]">
                  The Conjurer’s Waltz
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F58A12]/20 text-[#F58A12] font-bold border border-[#F58A12]/40">
                  Theme
                </span>
              </div>
              <p className="text-[10px] text-[#9CB3E6]">
                {isPlayingTheme ? 'Synthesized Victorian Parlor Waltz' : 'Click to start parlor soundtrack'}
              </p>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-1 h-7 px-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((barIdx) => (
              <div
                key={barIdx}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isPlayingTheme
                    ? 'bg-gradient-to-t from-[#F58A12] to-[#FFD467]'
                    : 'bg-[#293B73]'
                }`}
                style={{ height: `${getBarHeight(barIdx)}%` }}
              />
            ))}
          </div>
        </div>

        {/* Daily Streak Teaser Badge on Launch Page */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182453] border border-[#FFD467]/40 shadow-inner">
          <Flame className={`w-4 h-4 ${dailyStreak.currentStreak > 0 ? 'text-[#F58A12] animate-pulse' : 'text-gray-400'}`} />
          <span className="font-heading text-xs text-[#FFD467] font-black">
            {dailyStreak.currentStreak > 0
              ? `${dailyStreak.currentStreak} DAY STREAK`
              : 'DAILY STREAK READY'}
          </span>
          <span className="text-[#9CB3E6] text-[11px]">•</span>
          <span className="text-[11px] text-[#C2D4FF]">
            {dailyStreak.hasSolvedToday
              ? 'Streak protected today!'
              : 'Solve today to light the torch!'}
          </span>
        </div>

        {/* Primary Action Button: Enter the Parlor */}
        <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            id="launch-enter-parlor-btn"
            onClick={() => {
              sound.playTap();
              // If theme not playing, launch with soundtrack!
              if (!sound.isThemeSongPlaying()) {
                sound.startThemeSong();
              }
              onEnterParlor();
            }}
            className="w-full py-4 px-8 rounded-2xl btn-chunky-orange text-white font-heading text-lg font-black tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,138,18,0.4)] hover:scale-102 active:scale-98 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>ENTER THE PARLOR</span>
          </button>

          <button
            id="launch-quick-play-btn"
            onClick={() => {
              sound.playTap();
              onQuickPlay();
            }}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-[#182453] hover:bg-[#253675] text-[#5EC3FF] border-2 border-[#5EC3FF]/50 font-heading text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#FFD467]" />
            <span>QUICK PUZZLE</span>
          </button>
        </div>

        <p className="text-[11px] text-[#9CB3E6] mt-3">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#182453] border border-[#2B3C75] text-[#FFD467] font-mono text-[10px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[#182453] border border-[#2B3C75] text-[#FFD467] font-mono text-[10px]">Space</kbd> to begin
        </p>
      </main>

      {/* Bottom Feature Badges Showcase */}
      <footer className="w-full max-w-4xl z-10 pt-4 border-t border-[#1C2956]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9CB3E6]">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center font-heading text-[11px]">
          <span className="flex items-center gap-1 text-[#FFD467]">
            <span>🪡</span> The Seams
          </span>
          <span className="text-[#2B3C75]">•</span>
          <span className="flex items-center gap-1 text-[#5EC3FF]">
            <span>✂️</span> The Splits
          </span>
          <span className="text-[#2B3C75]">•</span>
          <span className="flex items-center gap-1 text-[#C084FC]">
            <span>🎭</span> The Charades
          </span>
          <span className="text-[#2B3C75]">•</span>
          <span className="flex items-center gap-1 text-[#FF6B8B]">
            <span>🪢</span> The Hangman
          </span>
          <span className="text-[#2B3C75]">•</span>
          <span className="flex items-center gap-1 text-[#F58A12]">
            <span>⚔️</span> 1v1 Sleight Duels
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playTap();
              onEnterParlor();
            }}
            className="hover:text-[#FFD467] font-heading flex items-center gap-1 transition-colors"
          >
            <span>Parlor Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
