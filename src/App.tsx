import React, { useState, useEffect } from 'react';
import { ActiveView, GameMode, PlayerStats, Puzzle, UserProfile } from './types';
import { ALL_PUZZLES, DAILY_TRICKS, SEAMS_PUZZLES } from './data/puzzles';
import { LaunchPage } from './components/LaunchPage';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AdventureMap } from './components/AdventureMap';
import { MultiplayerArena } from './components/MultiplayerArena';
import { VictoryOverlay } from './components/VictoryOverlay';
import { AuthModal } from './components/AuthModal';
import { SeamsGame } from './components/SeamsGame';
import { SplitsGame } from './components/SplitsGame';
import { CharadesGame } from './components/CharadesGame';
import { HangmanGame } from './components/HangmanGame';
import { DailyTrickModal } from './components/DailyTrickModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SpecValidatorModal } from './components/SpecValidatorModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { DailyGiftModal } from './components/DailyGiftModal';
import { sound } from './utils/audio';
import { DailyStreakData, loadDailyStreak, recordPuzzleSolveForStreak } from './utils/streak';

const STORAGE_KEY = 'sleight_of_words_player_stats_v1';
const USER_KEY = 'sleight_of_words_current_user';

const getInitialStats = (): PlayerStats => {
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset hearts to 3 on new session
      parsed.hearts = 3;
      parsed.consecutiveSolves = parsed.consecutiveSolves || 0;
      parsed.maxConsecutiveSolves = parsed.maxConsecutiveSolves || 0;
      parsed.claimedAchievementIds = parsed.claimedAchievementIds || [];
      parsed.flashlights = parsed.flashlights ?? 5;
      parsed.musicEnabled = parsed.musicEnabled ?? true;
      parsed.vibrationEnabled = parsed.vibrationEnabled ?? true;
      parsed.language = parsed.language || 'English';
      if (parsed.dailyProgress?.date !== todayStr) {
        parsed.dailyProgress = {
          date: todayStr,
          completedIds: [],
          chestClaimed: false
        };
      }
      return parsed;
    }
  } catch {
    // ignore
  }

  return {
    coins: 30,
    gems: 25,
    hearts: 3,
    flashlights: 5,
    musicEnabled: true,
    vibrationEnabled: true,
    language: 'English',
    consecutiveSolves: 0,
    maxConsecutiveSolves: 0,
    claimedAchievementIds: [],
    levelProgress: {},
    dailyProgress: {
      date: todayStr,
      completedIds: [],
      chestClaimed: false
    },
    multiplayerStats: {
      wins: 0,
      losses: 0,
      draws: 0,
      totalMatches: 0
    }
  };
};

export const App: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats>(getInitialStats);
  const [activeView, setActiveView] = useState<ActiveView>('launch');
  const [dailyStreak, setDailyStreak] = useState<DailyStreakData>(loadDailyStreak);
  const [currentMode, setCurrentMode] = useState<GameMode>('seams');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [isDailyMode, setIsDailyMode] = useState<boolean>(false);
  const [dailyIndex, setDailyIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // User Authentication & Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Victory Overlay State
  const [victoryData, setVictoryData] = useState<{
    isOpen: boolean;
    stars: number;
    hintsUsed: number;
    wrongGuesses: number;
    heartsLeft: number;
    answer: string;
    explanation: string;
  } | null>(null);

  // Auxiliary Modals
  const [isDailyOpen, setIsDailyOpen] = useState<boolean>(false);
  const [isValidatorOpen, setIsValidatorOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isDailyGiftOpen, setIsDailyGiftOpen] = useState<boolean>(false);

  const handleAddCurrency = (reward: { coins?: number; gems?: number; flashlights?: number }) => {
    setStats((prev) => ({
      ...prev,
      coins: prev.coins + (reward.coins || 0),
      gems: prev.gems + (reward.gems || 0),
      flashlights: (prev.flashlights || 0) + (reward.flashlights || 0)
    }));
  };

  const handleToggleMusic = () => {
    setStats((prev) => {
      const next = !prev.musicEnabled;
      if (next) {
        sound.startThemeSong();
      } else {
        sound.stopThemeSong();
      }
      return { ...prev, musicEnabled: next };
    });
  };

  const handleToggleVibration = () => {
    setStats((prev) => ({
      ...prev,
      vibrationEnabled: !prev.vibrationEnabled
    }));
  };

  const handleSelectLanguage = (lang: string) => {
    setStats((prev) => ({
      ...prev,
      language: lang
    }));
  };

  // Persist stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Persist current user to localStorage
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Current active puzzle
  const currentPuzzlesList = isDailyMode ? DAILY_TRICKS : (ALL_PUZZLES[currentMode] || []);
  const activeIndex = isDailyMode ? dailyIndex : currentLevelIndex;
  const currentPuzzle: Puzzle = currentPuzzlesList[activeIndex] || currentPuzzlesList[0] || SEAMS_PUZZLES[0];

  // Actions
  const handleLoseHeart = () => {
    setStats((prev) => {
      const nextHearts = Math.max(0, prev.hearts - 1);
      return {
        ...prev,
        hearts: nextHearts,
        // Reset streak on loss of all hearts
        consecutiveSolves: nextHearts === 0 ? 0 : (prev.consecutiveSolves || 0)
      };
    });
  };

  const handleClaimAchievement = (achievementId: string, reward: { coins: number; gems: number }) => {
    setStats((prev) => {
      const alreadyClaimed = (prev.claimedAchievementIds || []).includes(achievementId);
      if (alreadyClaimed) return prev;
      return {
        ...prev,
        coins: prev.coins + (reward.coins || 0),
        gems: prev.gems + (reward.gems || 0),
        claimedAchievementIds: [...(prev.claimedAchievementIds || []), achievementId]
      };
    });
  };

  const handlePuzzleSolved = (stars: number, hintsUsed: number, wrongGuesses: number) => {
    const earnedCoins = stars * 10;
    const earnedGems = stars === 3 ? 5 : 0;
    const prevStars = stats.levelProgress[currentPuzzle.id]?.stars || 0;
    const bestStars = Math.max(prevStars, stars);

    const updatedProgress = {
      ...stats.levelProgress,
      [currentPuzzle.id]: {
        stars: bestStars,
        solved: true,
        hintsUsed,
        wrongGuesses
      }
    };

    let updatedDaily = { ...stats.dailyProgress };
    if (isDailyMode && !updatedDaily.completedIds.includes(currentPuzzle.id)) {
      updatedDaily.completedIds = [...updatedDaily.completedIds, currentPuzzle.id];
    }

    // Update Daily Consecutive Streak in localStorage
    const { streak: updatedStreak } = recordPuzzleSolveForStreak();
    setDailyStreak(updatedStreak);

    // Track consecutive solves for achievements
    const nextConsecutive = (stats.consecutiveSolves || 0) + 1;
    const bestConsecutive = Math.max(stats.maxConsecutiveSolves || 0, nextConsecutive);

    setStats((prev) => ({
      ...prev,
      coins: prev.coins + earnedCoins,
      gems: prev.gems + earnedGems,
      consecutiveSolves: nextConsecutive,
      maxConsecutiveSolves: bestConsecutive,
      levelProgress: updatedProgress,
      dailyProgress: updatedDaily
    }));

    // Trigger Victory Overlay with confetti and fanfare!
    setVictoryData({
      isOpen: true,
      stars,
      hintsUsed,
      wrongGuesses,
      heartsLeft: stats.hearts,
      answer: currentPuzzle.answer,
      explanation: currentPuzzle.explanation
    });
  };

  const handleNextPuzzle = () => {
    setVictoryData(null);
    if (isDailyMode) {
      if (dailyIndex + 1 < DAILY_TRICKS.length) {
        setDailyIndex((prev) => prev + 1);
        setStats((prev) => ({ ...prev, hearts: 3 }));
      } else {
        setIsDailyOpen(true);
      }
    } else {
      const maxIndex = currentPuzzlesList.length - 1;
      if (currentLevelIndex < maxIndex) {
        setCurrentLevelIndex((prev) => prev + 1);
        setStats((prev) => ({ ...prev, hearts: 3 }));
      } else {
        // All levels completed in this world, go to map!
        setActiveView('map');
      }
    }
  };

  const handleReplayPuzzle = () => {
    setVictoryData(null);
    setStats((prev) => ({ ...prev, hearts: 3 }));
  };

  const handleSkipPuzzle = () => {
    if (stats.gems < 20 || isDailyMode) return;

    sound.playTap();
    setStats((prev) => ({
      ...prev,
      gems: prev.gems - 20,
      hearts: 3
    }));

    handleNextPuzzle();
  };

  const handleSelectMode = (mode: GameMode) => {
    setIsDailyMode(false);
    setCurrentMode(mode);
    setCurrentLevelIndex(0);
    setStats((prev) => ({ ...prev, hearts: 3 }));
    setActiveView('game');
  };

  const handleSelectLevelFromMap = (mode: GameMode, puzzleId: string) => {
    setIsDailyMode(false);
    setCurrentMode(mode);
    const targetList = ALL_PUZZLES[mode] || [];
    const foundIdx = targetList.findIndex((p) => p.id === puzzleId);
    setCurrentLevelIndex(foundIdx >= 0 ? foundIdx : 0);
    setStats((prev) => ({ ...prev, hearts: 3 }));
    setActiveView('game');
  };

  const handleQuickPlay = () => {
    // Find first unsolved puzzle in current or next mode
    for (const mode of ['seams', 'splits', 'charades'] as GameMode[]) {
      const puzzles = ALL_PUZZLES[mode] || [];
      const unsolvedIdx = puzzles.findIndex((p) => !stats.levelProgress[p.id]?.solved);
      if (unsolvedIdx !== -1) {
        setCurrentMode(mode);
        setCurrentLevelIndex(unsolvedIdx);
        setIsDailyMode(false);
        setStats((prev) => ({ ...prev, hearts: 3 }));
        setActiveView('game');
        return;
      }
    }
    // All solved, play level 0 of seams
    setCurrentMode('seams');
    setCurrentLevelIndex(0);
    setIsDailyMode(false);
    setActiveView('game');
  };

  const handleSelectDailyTrick = (index: number) => {
    setIsDailyMode(true);
    setDailyIndex(index);
    setStats((prev) => ({ ...prev, hearts: 3 }));
    setActiveView('game');
  };

  const handleClaimChest = () => {
    setStats((prev) => ({
      ...prev,
      gems: prev.gems + 50,
      dailyProgress: {
        ...prev.dailyProgress,
        chestClaimed: true
      }
    }));
  };

  return (
    <div id="sleight-of-words-app" className="min-h-screen bg-[#0A102E] text-[#FFF7E3] flex flex-col font-sans">
      {/* View 0: Grand Launch Page with Theme Song */}
      {activeView === 'launch' && (
        <LaunchPage
          dailyStreak={dailyStreak}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onEnterParlor={() => setActiveView('home')}
          onQuickPlay={handleQuickPlay}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        />
      )}

      {/* View 1: Home Page */}
      {activeView === 'home' && (
        <HomePage
          currentUser={currentUser}
          playerStats={stats}
          dailyStreak={dailyStreak}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenDailyGift={() => setIsDailyGiftOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenDaily={() => setIsDailyOpen(true)}
          onGoToMap={() => setActiveView('map')}
          onGoToMultiplayer={() => setActiveView('multiplayer')}
          onGoToLaunch={() => setActiveView('launch')}
          onStartMode={handleSelectMode}
          onQuickPlay={handleQuickPlay}
          onClaimAchievement={handleClaimAchievement}
        />
      )}

      {/* View 2: Stepping Stone Adventure Map */}
      {activeView === 'map' && (
        <AdventureMap
          playerStats={stats}
          onSelectLevel={handleSelectLevelFromMap}
          onBackToHome={() => setActiveView('home')}
        />
      )}

      {/* View 3: Multiplayer Duel Arena */}
      {activeView === 'multiplayer' && (
        <MultiplayerArena
          currentUser={currentUser}
          playerStats={stats}
          onBackToHome={() => setActiveView('home')}
          onUpdateStats={setStats}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* View 4: Puzzle Solving Game View */}
      {activeView === 'game' && (
        <div className="min-h-screen bg-[#182453] text-[#FFF7E3] flex flex-col justify-between">
          {/* Top Navigation & Status Bar */}
          <Header
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            stats={stats}
            dailyStreak={dailyStreak}
            currentLevelIndex={activeIndex}
            totalLevels={currentPuzzlesList.length}
            isDailyMode={isDailyMode}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onGoHome={() => setActiveView('home')}
            onGoToLaunch={() => setActiveView('launch')}
            onOpenMap={() => setActiveView('map')}
            onOpenDaily={() => setIsDailyOpen(true)}
            onGoToMultiplayer={() => setActiveView('multiplayer')}
            onOpenValidator={() => setIsValidatorOpen(true)}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          />

          {/* Main Play Arena */}
          <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 flex flex-col items-center justify-center">
            {/* Daily Banner if in Daily Trick mode */}
            {isDailyMode && (
              <div className="w-full max-w-xl mb-3 py-1.5 px-3 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center justify-between text-xs text-[#FFD467]">
                <span className="font-heading tracking-wide uppercase">
                  Daily Trick {dailyIndex + 1} of 5
                </span>
                <button
                  onClick={() => setIsDailyOpen(true)}
                  className="font-bold underline hover:text-white"
                >
                  View Mystery Art
                </button>
              </div>
            )}

            {/* Game Mode Component Routing */}
            {currentPuzzle.mode === 'seams' && (
              <SeamsGame
                key={currentPuzzle.id}
                puzzle={currentPuzzle}
                hearts={stats.hearts}
                onLoseHeart={handleLoseHeart}
                onPuzzleSolved={handlePuzzleSolved}
                onNextPuzzle={handleNextPuzzle}
                onSkipPuzzle={handleSkipPuzzle}
                canSkip={stats.gems >= 20}
                isDailyMode={isDailyMode}
              />
            )}

            {currentPuzzle.mode === 'splits' && (
              <SplitsGame
                key={currentPuzzle.id}
                puzzle={currentPuzzle}
                hearts={stats.hearts}
                onLoseHeart={handleLoseHeart}
                onPuzzleSolved={handlePuzzleSolved}
                onNextPuzzle={handleNextPuzzle}
                onSkipPuzzle={handleSkipPuzzle}
                canSkip={stats.gems >= 20}
                isDailyMode={isDailyMode}
              />
            )}

            {currentPuzzle.mode === 'charades' && (
              <CharadesGame
                key={currentPuzzle.id}
                puzzle={currentPuzzle}
                hearts={stats.hearts}
                onLoseHeart={handleLoseHeart}
                onPuzzleSolved={handlePuzzleSolved}
                onNextPuzzle={handleNextPuzzle}
                onSkipPuzzle={handleSkipPuzzle}
                canSkip={stats.gems >= 20}
                isDailyMode={isDailyMode}
              />
            )}

            {currentPuzzle.mode === 'hangman' && (
              <HangmanGame
                key={currentPuzzle.id}
                puzzle={currentPuzzle}
                hearts={stats.hearts}
                onLoseHeart={handleLoseHeart}
                onPuzzleSolved={handlePuzzleSolved}
                onNextPuzzle={handleNextPuzzle}
                onSkipPuzzle={handleSkipPuzzle}
                canSkip={stats.gems >= 20}
                isDailyMode={isDailyMode}
              />
            )}
          </main>

          {/* Footer Details */}
          <footer className="w-full py-2.5 text-center text-xs text-[#5EC3FF]/70 border-t border-[#1F2C60] bg-[#0E1638]/60 flex items-center justify-center gap-2 flex-wrap px-3">
            <button
              onClick={() => setActiveView('home')}
              className="text-[#FFD467] font-heading hover:underline"
            >
              Parlor Home
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveView('map')}
              className="text-[#5EC3FF] font-heading hover:underline"
            >
              World Map
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveView('multiplayer')}
              className="text-[#F58A12] font-heading hover:underline"
            >
              Multiplayer Duel
            </button>
            <span>•</span>
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="underline hover:text-[#FFD467]"
            >
              Rules
            </button>
            <span>•</span>
            <button
              onClick={() => setIsValidatorOpen(true)}
              className="underline hover:text-[#7CE04A]"
            >
              Validator
            </button>
          </footer>
        </div>
      )}

      {/* Confetti & 3-Star Victory Overlay (Screen 3 reference) */}
      {victoryData && (
        <VictoryOverlay
          isOpen={victoryData.isOpen}
          stars={victoryData.stars}
          hintsUsed={victoryData.hintsUsed}
          wrongGuesses={victoryData.wrongGuesses}
          heartsLeft={victoryData.heartsLeft}
          answer={victoryData.answer}
          explanation={victoryData.explanation}
          isDailyMode={isDailyMode}
          currentStreak={dailyStreak.currentStreak}
          levelTitle={
            currentMode === 'seams'
              ? 'Carnival Seams'
              : currentMode === 'splits'
              ? 'Split Alley'
              : currentMode === 'charades'
              ? 'Grand Charades'
              : 'Gallows Chamber'
          }
          levelIndex={activeIndex + 1}
          onNext={handleNextPuzzle}
          onReplay={handleReplayPuzzle}
          onGoToMap={() => {
            setVictoryData(null);
            setActiveView('map');
          }}
          onGoHome={() => {
            setVictoryData(null);
            setActiveView('home');
          }}
        />
      )}

      {/* Settings Modal (Screen 1 reference) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        musicEnabled={stats.musicEnabled ?? true}
        onToggleMusic={handleToggleMusic}
        vibrationEnabled={stats.vibrationEnabled ?? true}
        onToggleVibration={handleToggleVibration}
        language={stats.language || 'English'}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Shop Modal (Screen 2 reference) */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={stats.coins}
        gems={stats.gems}
        flashlights={stats.flashlights ?? 5}
        onAddCurrency={handleAddCurrency}
      />

      {/* Daily Gift Modal (Screen 6 reference) */}
      <DailyGiftModal
        isOpen={isDailyGiftOpen}
        onClose={() => setIsDailyGiftOpen(false)}
        onClaimGift={handleAddCurrency}
      />

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Daily Trick Mystery Modal */}
      <DailyTrickModal
        isOpen={isDailyOpen}
        onClose={() => setIsDailyOpen(false)}
        dailyPuzzles={DAILY_TRICKS}
        completedIds={stats.dailyProgress.completedIds}
        chestClaimed={stats.dailyProgress.chestClaimed}
        onClaimChest={handleClaimChest}
        onSelectDailyTrick={handleSelectDailyTrick}
        currentDailyIndex={dailyIndex}
      />

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* SPEC Validator Modal */}
      <SpecValidatorModal
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
      />
    </div>
  );
};
