import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Swords, Users, Bot, Zap, Trophy, Timer, RotateCcw, Sparkles, Check, Heart, ShieldAlert } from 'lucide-react';
import { GameMode, Puzzle, UserProfile, PlayerStats } from '../types';
import { SEAMS_PUZZLES, SPLITS_PUZZLES, CHARADES_PUZZLES } from '../data/puzzles';
import { sound } from '../utils/audio';

interface MultiplayerArenaProps {
  currentUser: UserProfile | null;
  playerStats: PlayerStats;
  onBackToHome: () => void;
  onUpdateStats: (newStats: PlayerStats) => void;
  onOpenAuth: () => void;
}

type DuelMode = 'ai' | 'pass_play' | 'room';

interface AiRival {
  id: string;
  name: string;
  avatar: string;
  title: string;
  difficulty: 'Novice' | 'Master' | 'Archmage';
  solveTimeSeconds: number; // typical time to solve
  quips: string[];
}

const AI_RIVALS: AiRival[] = [
  {
    id: 'rival_novice',
    name: 'Barnaby the Quick',
    avatar: '🎩',
    title: 'Apprentice Sleight',
    difficulty: 'Novice',
    solveTimeSeconds: 28,
    quips: [
      'Wait, does that word end in an E or a T?',
      'Let me inspect the seam closely...',
      'Aha! I think I almost have it!',
      'My wand sputtered!'
    ]
  },
  {
    id: 'rival_master',
    name: 'Madame Celeste',
    avatar: '🔮',
    title: 'Crystal Seer',
    difficulty: 'Master',
    solveTimeSeconds: 16,
    quips: [
      'The letters are revealing their true nature.',
      'A magician never reveals... but I see it clearly!',
      'My crystal sphere points to the boundary!',
      'Speed is nothing without clarity.'
    ]
  },
  {
    id: 'rival_archmage',
    name: 'Archmage Vex',
    avatar: '🦉',
    title: 'Grand Cipher Lord',
    difficulty: 'Archmage',
    solveTimeSeconds: 10,
    quips: [
      'Child\'s play. The answer is obvious.',
      'Before you blink, the trick is mine.',
      'Sleight of hand is mere illusion; my intellect is absolute.',
      'Checkmate in three syllables!'
    ]
  }
];

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  currentUser,
  playerStats,
  onBackToHome,
  onUpdateStats,
  onOpenAuth
}) => {
  const [duelMode, setDuelMode] = useState<DuelMode>('ai');
  const [selectedRival, setSelectedRival] = useState<AiRival>(AI_RIVALS[0]);
  const [matchState, setMatchState] = useState<'lobby' | 'countdown' | 'playing' | 'gameover'>('lobby');

  // Duel puzzle and game state
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(SEAMS_PUZZLES[0]);
  const [userGuess, setUserGuess] = useState('');
  const [userSolved, setUserSolved] = useState(false);
  const [rivalProgress, setRivalProgress] = useState(0); // 0 to 100%
  const [rivalSolved, setRivalSolved] = useState(false);
  const [winner, setWinner] = useState<'player' | 'rival' | 'draw' | null>(null);
  const [rivalQuip, setRivalQuip] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Pass and play states
  const [player1Name, setPlayer1Name] = useState(currentUser?.username || 'Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [turn, setTurn] = useState<1 | 2>(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  // Room duel code
  const [roomCode, setRoomCode] = useState('SLEIGHT-77');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Start Duel Match
  const startMatch = () => {
    sound.playTap();
    // Pick random puzzle
    const allPuzzles = [...SEAMS_PUZZLES, ...SPLITS_PUZZLES, ...CHARADES_PUZZLES];
    const rand = allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
    setCurrentPuzzle(rand);
    setUserGuess('');
    setUserSolved(false);
    setRivalProgress(0);
    setRivalSolved(false);
    setWinner(null);
    setElapsedTime(0);
    setCountdown(3);
    setRivalQuip(selectedRival.quips[0]);
    setMatchState('countdown');
  };

  // Countdown timer
  useEffect(() => {
    if (matchState !== 'countdown') return;

    if (countdown > 0) {
      sound.playTap();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      sound.playSuccess();
      setMatchState('playing');
    }
  }, [matchState, countdown]);

  // Playing timers (for user and AI rival)
  useEffect(() => {
    if (matchState !== 'playing' || userSolved || rivalSolved) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);

      // Advance AI Rival progress if in AI mode
      if (duelMode === 'ai') {
        const rivalTargetTime = selectedRival.solveTimeSeconds;
        setRivalProgress((prev) => {
          const step = 100 / rivalTargetTime;
          const next = Math.min(100, prev + step);

          // Change quip halfway
          if (next > 40 && next < 60) {
            setRivalQuip(selectedRival.quips[1]);
          } else if (next > 80 && next < 95) {
            setRivalQuip(selectedRival.quips[2]);
          }

          if (next >= 100) {
            setRivalSolved(true);
            setWinner('rival');
            setMatchState('gameover');
            sound.playError();
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [matchState, userSolved, rivalSolved, duelMode, selectedRival]);

  // Handle user submit guess
  const handleUserSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (matchState !== 'playing') return;

    const clean = userGuess.trim().toUpperCase();
    const isCorrect =
      clean === currentPuzzle.answer.toUpperCase() ||
      currentPuzzle.accepted_answers.some((a) => a.toUpperCase() === clean);

    if (isCorrect) {
      setUserSolved(true);
      setWinner('player');
      setMatchState('gameover');
      sound.playFanfare();

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 9999,
        colors: ['#FFD467', '#5EC3FF', '#7CE04A']
      });

      // Award duel coins
      const updated = {
        ...playerStats,
        coins: playerStats.coins + 25,
        gems: playerStats.gems + 2,
        multiplayerStats: {
          wins: (playerStats.multiplayerStats?.wins || 0) + 1,
          losses: playerStats.multiplayerStats?.losses || 0,
          draws: playerStats.multiplayerStats?.draws || 0,
          totalMatches: (playerStats.multiplayerStats?.totalMatches || 0) + 1
        }
      };
      onUpdateStats(updated);
    } else {
      sound.playError();
      setUserGuess('');
    }
  };

  return (
    <div
      id="multiplayer-arena-view"
      className="min-h-screen bg-[#0A102E] text-[#FFF7E3] flex flex-col font-sans pb-16 selection:bg-[#F58A12] selection:text-white"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0E1638]/90 backdrop-blur-md border-b border-[#253258] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            id="multiplayer-back-btn"
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
            <Swords className="w-5 h-5 text-[#F58A12]" />
            <span className="font-heading text-lg sm:text-xl text-[#FFD467] tracking-wide">
              Sleight Duel Arena
            </span>
          </div>

          {/* User badge or Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182453] border border-[#FFD467]/30 text-xs">
              <span className="text-base">{currentUser.avatar}</span>
              <span className="font-heading text-[#FFD467] hidden sm:inline">{currentUser.username}</span>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playTap();
                onOpenAuth();
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#24356E] text-[#5EC3FF] border border-[#3A52A3] hover:text-white font-heading"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-5 flex-1 flex flex-col">
        {matchState === 'lobby' ? (
          /* ================= LOBBY SCREEN ================= */
          <div className="flex flex-col gap-5 animate-in fade-in">
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#0E1638] p-1.5 rounded-2xl border border-[#253258]">
              <button
                id="mode-ai-duel"
                onClick={() => {
                  sound.playTap();
                  setDuelMode('ai');
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-heading transition-all ${
                  duelMode === 'ai'
                    ? 'btn-chunky-orange text-white shadow-md'
                    : 'text-[#9CB3E6] hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>vs AI Magician</span>
              </button>

              <button
                id="mode-pass-play"
                onClick={() => {
                  sound.playTap();
                  setDuelMode('pass_play');
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-heading transition-all ${
                  duelMode === 'pass_play'
                    ? 'btn-chunky-orange text-white shadow-md'
                    : 'text-[#9CB3E6] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pass & Play (2P)</span>
              </button>

              <button
                id="mode-room-duel"
                onClick={() => {
                  sound.playTap();
                  setDuelMode('room');
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-heading transition-all ${
                  duelMode === 'room'
                    ? 'btn-chunky-orange text-white shadow-md'
                    : 'text-[#9CB3E6] hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Room Duel</span>
              </button>
            </div>

            {/* AI Opponent Selector */}
            {duelMode === 'ai' && (
              <div className="bg-[#151F45] rounded-3xl p-5 border-2 border-[#2C3E80] flex flex-col gap-4 shadow-xl">
                <div>
                  <h2 className="font-heading text-lg text-[#FFD467] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F58A12]" />
                    <span>Choose Your Rival Conjurer</span>
                  </h2>
                  <p className="text-xs text-[#9CB3E6] mt-0.5">
                    Race against time! Whoever deciphers the hidden word seam first wins.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {AI_RIVALS.map((rival) => {
                    const isSelected = selectedRival.id === rival.id;
                    return (
                      <button
                        key={rival.id}
                        id={`rival-card-${rival.id}`}
                        onClick={() => {
                          sound.playTap();
                          setSelectedRival(rival);
                        }}
                        className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all ${
                          isSelected
                            ? 'bg-[#1F2F6B] border-2 border-[#FFD467] shadow-[0_0_20px_rgba(255,212,103,0.3)] scale-102'
                            : 'bg-[#0E1638] border border-[#253258] hover:bg-[#182453]'
                        }`}
                      >
                        <div className="text-4xl my-1 p-2 rounded-2xl bg-[#141C3D] border border-white/10">
                          {rival.avatar}
                        </div>
                        <span className="font-heading text-sm text-[#FFF7E3] font-bold">
                          {rival.name}
                        </span>
                        <span className="text-[11px] text-[#5EC3FF] font-semibold">
                          {rival.title}
                        </span>
                        <span
                          className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-heading font-black ${
                            rival.difficulty === 'Novice'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : rival.difficulty === 'Master'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {rival.difficulty} (~{rival.solveTimeSeconds}s)
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Match Rewards Card */}
                <div className="bg-[#0E1638] rounded-2xl p-3 border border-[#253258] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#FFD467]" />
                    <span>Duel Victory Rewards:</span>
                  </div>
                  <div className="flex items-center gap-3 font-heading font-bold text-[#FFD467]">
                    <span>+25 Coins</span>
                    <span className="text-[#5EC3FF]">+2 Gems</span>
                  </div>
                </div>

                <button
                  id="start-ai-duel-btn"
                  onClick={startMatch}
                  className="w-full py-4 rounded-2xl btn-chunky-orange text-white font-heading text-lg flex items-center justify-center gap-2 shadow-xl hover:scale-101 active:scale-98 transition-all"
                >
                  <Swords className="w-5 h-5" />
                  <span>START WORD SLEIGHT DUEL</span>
                </button>
              </div>
            )}

            {/* Pass and Play Configuration */}
            {duelMode === 'pass_play' && (
              <div className="bg-[#151F45] rounded-3xl p-5 border-2 border-[#2C3E80] flex flex-col gap-4 shadow-xl">
                <div>
                  <h2 className="font-heading text-lg text-[#FFD467] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#5EC3FF]" />
                    <span>2-Player Pass & Play Duel</span>
                  </h2>
                  <p className="text-xs text-[#9CB3E6] mt-0.5">
                    Two magicians compete on this device to crack word puzzles!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0E1638] rounded-2xl border border-[#253258]">
                    <label className="text-xs font-bold text-[#FFD467] block mb-1">
                      Magician 1 Name:
                    </label>
                    <input
                      type="text"
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      className="w-full px-3 py-2 bg-[#182453] text-white rounded-xl border border-[#2E4282] text-sm"
                    />
                  </div>

                  <div className="p-3 bg-[#0E1638] rounded-2xl border border-[#253258]">
                    <label className="text-xs font-bold text-[#5EC3FF] block mb-1">
                      Magician 2 Name:
                    </label>
                    <input
                      type="text"
                      value={player2Name}
                      onChange={(e) => setPlayer2Name(e.target.value)}
                      className="w-full px-3 py-2 bg-[#182453] text-white rounded-xl border border-[#2E4282] text-sm"
                    />
                  </div>
                </div>

                <button
                  id="start-pass-play-btn"
                  onClick={startMatch}
                  className="w-full py-3.5 rounded-2xl btn-chunky-green text-white font-heading text-base flex items-center justify-center gap-2 shadow-xl hover:scale-101 active:scale-98 transition-all"
                >
                  <Swords className="w-5 h-5" />
                  <span>START 2-PLAYER DUEL</span>
                </button>
              </div>
            )}

            {/* Room Duel Configuration */}
            {duelMode === 'room' && (
              <div className="bg-[#151F45] rounded-3xl p-5 border-2 border-[#2C3E80] flex flex-col gap-4 shadow-xl">
                <div>
                  <h2 className="font-heading text-lg text-[#FFD467] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#C084FC]" />
                    <span>Synchronized Room Duel</span>
                  </h2>
                  <p className="text-xs text-[#9CB3E6] mt-0.5">
                    Share a secret room code with a companion magician to battle over the same puzzle!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Host room */}
                  <div className="p-4 bg-[#0E1638] rounded-2xl border border-[#253258] flex flex-col gap-2">
                    <span className="text-xs font-bold text-[#FFD467]">Host a Parlor Room:</span>
                    <div className="p-3 bg-[#182453] rounded-xl text-center font-mono font-black text-lg text-[#FFD467] border border-[#FFD467]/30 tracking-widest">
                      {roomCode}
                    </div>
                    <button
                      onClick={startMatch}
                      className="w-full py-2 rounded-xl btn-chunky-orange text-white font-heading text-xs mt-1"
                    >
                      Host & Launch Room
                    </button>
                  </div>

                  {/* Join room */}
                  <div className="p-4 bg-[#0E1638] rounded-2xl border border-[#253258] flex flex-col gap-2">
                    <span className="text-xs font-bold text-[#5EC3FF]">Join Room with Code:</span>
                    <input
                      type="text"
                      placeholder="e.g. SLEIGHT-77"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="px-3 py-2.5 bg-[#182453] text-white font-mono text-center rounded-xl border border-[#2E4282] text-sm uppercase tracking-wider"
                    />
                    <button
                      onClick={startMatch}
                      className="w-full py-2 rounded-xl bg-[#2A3F80] hover:bg-[#3854A8] text-white font-heading text-xs mt-1 border border-[#4867BF]"
                    >
                      Join & Ready Up
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : matchState === 'countdown' ? (
          /* ================= COUNTDOWN SCREEN ================= */
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
            <span className="font-heading text-xl text-[#FFD467] uppercase tracking-widest mb-2">
              Conjuring Match...
            </span>
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border-4 border-[#FFF0A0] shadow-[0_0_50px_rgba(255,212,103,0.6)] flex items-center justify-center font-heading text-6xl font-black text-[#5B3900] animate-pulse">
              {countdown > 0 ? countdown : 'DUEL!'}
            </div>
            <p className="text-sm text-[#9CB3E6] mt-4 font-semibold">
              Prepare your wits! The hidden word is about to appear.
            </p>
          </div>
        ) : (
          /* ================= LIVE DUEL / PLAYING / GAME OVER ================= */
          <div className="flex flex-col gap-4 animate-in fade-in">
            {/* Duel Scoreboard & Rival Status */}
            <div className="bg-[#151F45] rounded-3xl p-4 border-2 border-[#2C3E80] shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {/* User side */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl">
                    {currentUser?.avatar || '🎩'}
                  </div>
                  <div>
                    <span className="font-heading text-xs sm:text-sm text-[#FFF7E3] font-bold block">
                      {currentUser?.username || 'You'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {userSolved ? 'SOLVED! ★★★' : 'Solving...'}
                    </span>
                  </div>
                </div>

                {/* Timer in center */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#FFD467] bg-[#0E1638] px-3 py-1 rounded-full border border-[#253258]">
                    <Timer className="w-3.5 h-3.5" />
                    <span>{elapsedTime}s</span>
                  </div>
                </div>

                {/* Opponent side */}
                <div className="flex items-center gap-2.5 text-right">
                  <div>
                    <span className="font-heading text-xs sm:text-sm text-[#FFF7E3] font-bold block">
                      {selectedRival.name}
                    </span>
                    <span className="text-[10px] text-[#5EC3FF] font-bold">
                      {rivalSolved ? 'SOLVED!' : `Progress: ${Math.floor(rivalProgress)}%`}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-xl">
                    {selectedRival.avatar}
                  </div>
                </div>
              </div>

              {/* Progress Bars comparison */}
              <div className="space-y-1.5 pt-1 border-t border-[#253258]">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Rival Conjurer Progress:</span>
                  <span>{Math.floor(rivalProgress)}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#0E1638] rounded-full overflow-hidden border border-[#253258]">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${rivalProgress}%` }}
                  ></div>
                </div>

                {/* Rival Quip speech bubble */}
                {rivalQuip && matchState === 'playing' && (
                  <div className="text-[11px] text-[#93E6FB] italic text-right pr-2">
                    "{rivalQuip}"
                  </div>
                )}
              </div>
            </div>

            {/* Duel Puzzle Card */}
            <div className="bg-[#121A3B] rounded-3xl p-5 border-2 border-[#FFD467]/40 shadow-xl flex flex-col gap-4 text-center">
              <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-heading font-black uppercase tracking-wider mx-auto">
                {currentPuzzle.mode.toUpperCase()} TRICK
              </div>

              {/* Clue / Sentence */}
              <div className="p-4 bg-[#0A102E] rounded-2xl border border-[#223060]">
                {currentPuzzle.sentence ? (
                  <p className="font-body text-base sm:text-lg text-[#FFF7E3] font-semibold leading-relaxed">
                    “{currentPuzzle.sentence}”
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[#9CB3E6]">Combine these parts into one whole:</p>
                    {/* Charades parts */}
                    {(currentPuzzle as any).charades?.parts.map((p: any, idx: number) => (
                      <div key={idx} className="text-sm font-semibold text-[#FFF7E3]">
                        Part {idx + 1}: {p.clue}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Input for Guess */}
              {matchState === 'playing' && (
                <form onSubmit={handleUserSubmit} className="flex gap-2">
                  <input
                    id="duel-answer-input"
                    type="text"
                    autoFocus
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
                    placeholder="TYPE HIDDEN WORD & HIT ENTER..."
                    className="flex-1 px-4 py-3 bg-[#0A102E] text-white font-heading font-black text-center text-lg sm:text-xl rounded-2xl border-2 border-[#FFD467] focus:outline-hidden focus:ring-4 focus:ring-[#FFD467]/30 tracking-widest uppercase"
                  />
                  <button
                    id="submit-duel-guess-btn"
                    type="submit"
                    className="px-6 py-3 rounded-2xl btn-chunky-orange text-white font-heading text-sm shadow-md"
                  >
                    CAST!
                  </button>
                </form>
              )}

              {/* Game Over Result Banner */}
              {matchState === 'gameover' && (
                <div
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-2 ${
                    winner === 'player'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                  }`}
                >
                  <div className="text-3xl">
                    {winner === 'player' ? '🏆' : '💀'}
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-black">
                    {winner === 'player' ? 'VICTORY! YOU OUTSMARTED THE RIVAL!' : 'DEFEATED! RIVAL WAS FASTER!'}
                  </h3>
                  <p className="text-xs">
                    The correct answer was:{' '}
                    <span className="font-mono font-black text-amber-300 px-2 py-0.5 rounded bg-black/40 border border-amber-400/40">
                      {currentPuzzle.answer}
                    </span>
                  </p>
                  <p className="text-xs opacity-90 max-w-md">
                    {currentPuzzle.explanation}
                  </p>

                  <div className="flex gap-3 mt-3 w-full max-w-xs">
                    <button
                      id="duel-play-again-btn"
                      onClick={startMatch}
                      className="flex-1 py-2.5 rounded-xl btn-chunky-orange text-white font-heading text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rematch</span>
                    </button>
                    <button
                      id="duel-lobby-btn"
                      onClick={() => setMatchState('lobby')}
                      className="flex-1 py-2.5 rounded-xl bg-[#1D2A5E] hover:bg-[#2A3C80] text-[#FFF7E3] font-heading text-xs border border-[#384E8F]"
                    >
                      Lobby
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
