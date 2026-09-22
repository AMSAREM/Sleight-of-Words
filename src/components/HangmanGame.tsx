import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, RotateCcw, ArrowRight, Star, AlertCircle, FastForward, Skull, Sparkles, HelpCircle } from 'lucide-react';
import { HangmanPuzzle } from '../types';
import { sound } from '../utils/audio';

interface HangmanGameProps {
  puzzle: HangmanPuzzle;
  hearts: number;
  onLoseHeart: () => void;
  onPuzzleSolved: (stars: number, hintsUsed: number, wrongGuesses: number) => void;
  onNextPuzzle: () => void;
  onSkipPuzzle: () => void;
  canSkip: boolean;
  isDailyMode?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const HangmanGame: React.FC<HangmanGameProps> = ({
  puzzle,
  hearts,
  onLoseHeart,
  onPuzzleSolved,
  onNextPuzzle,
  onSkipPuzzle,
  canSkip,
  isDailyMode = false
}) => {
  const maxStrikes = puzzle.hangman?.max_strikes || 6;
  const answerUpper = useMemo(() => puzzle.answer.toUpperCase().trim(), [puzzle.answer]);

  // Extract unique alphabetical letters in answer
  const uniqueLettersInAnswer = useMemo(() => {
    const letters = new Set<string>();
    for (const ch of answerUpper) {
      if (/[A-Z]/.test(ch)) {
        letters.add(ch);
      }
    }
    return letters;
  }, [answerUpper]);

  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [isWrongShake, setIsWrongShake] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Calculate wrong guesses count
  const wrongGuesses = useMemo(() => {
    let count = 0;
    guessedLetters.forEach((letter) => {
      if (!uniqueLettersInAnswer.has(letter)) {
        count++;
      }
    });
    return count;
  }, [guessedLetters, uniqueLettersInAnswer]);

  // Reset state when puzzle changes
  useEffect(() => {
    setGuessedLetters(new Set());
    setHintsUsed(0);
    setIsWrongShake(false);
    setIsSuccess(false);
    setIsFailed(false);
    setMessage(null);
  }, [puzzle.id]);

  // Handle game over when strikes hit maximum or player has 0 hearts
  useEffect(() => {
    if (isSuccess) return;

    if (wrongGuesses >= maxStrikes && !isFailed) {
      setIsFailed(true);
      sound.playError();
      onLoseHeart();
      setMessage(`The illusion collapsed! The secret word was "${answerUpper}".`);
    } else if (hearts <= 0 && !isFailed) {
      setIsFailed(true);
      sound.playError();
      setMessage(`Out of focus hearts! The hidden word was "${answerUpper}".`);
    }
  }, [wrongGuesses, maxStrikes, isFailed, isSuccess, hearts, answerUpper, onLoseHeart]);

  // Handle guessing a letter
  const guessLetter = useCallback((letter: string) => {
    if (isSuccess || isFailed || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (uniqueLettersInAnswer.has(letter)) {
      sound.playSuccess();
      // Check if all letters are solved!
      let allFound = true;
      uniqueLettersInAnswer.forEach((ch) => {
        if (!newGuessed.has(ch)) {
          allFound = false;
        }
      });

      if (allFound) {
        setIsSuccess(true);
        sound.playFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Calculate stars: 0 wrong = 3 stars, 1-2 wrong = 2 stars, 3+ wrong = 1 star
        const currentWrong = Array.from(newGuessed).filter((l) => !uniqueLettersInAnswer.has(l)).length;
        const earnedStars = currentWrong === 0 ? 3 : currentWrong <= 2 ? 2 : 1;

        setTimeout(() => {
          onPuzzleSolved(earnedStars, hintsUsed, currentWrong);
        }, 1200);
      }
    } else {
      // Wrong guess
      sound.playError();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
    }
  }, [isSuccess, isFailed, guessedLetters, uniqueLettersInAnswer, hintsUsed, onPuzzleSolved]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || isFailed) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        guessLetter(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guessLetter, isSuccess, isFailed]);

  // Hint button: reveal a random unguessed correct letter
  const handleUseHint = () => {
    if (isSuccess || isFailed) return;
    const remainingLetters = Array.from(uniqueLettersInAnswer).filter((l) => !guessedLetters.has(l));
    if (remainingLetters.length === 0) return;

    sound.playTap();
    const randomLetter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
    setHintsUsed((prev) => prev + 1);
    guessLetter(randomLetter);
  };

  // Retry level
  const handleRetry = () => {
    sound.playTap();
    setGuessedLetters(new Set());
    setIsFailed(false);
    setMessage(null);
  };

  return (
    <div id="hangman-game-container" className="w-full flex flex-col items-center gap-4">
      {/* Top Banner: Category & Clue */}
      <div className="w-full max-w-xl bg-[#121A3B] rounded-2xl p-3 sm:p-4 border-2 border-[#E7364B]/40 shadow-xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E7364B]/20 text-[#FF6B8B] border border-[#E7364B]/40 font-heading text-[11px] uppercase tracking-wider font-black">
              🪢 THE HANGMAN
            </span>
            <span className="text-xs font-heading text-[#FFD467]">
              {puzzle.hangman?.category || 'Parlor Enigma'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Strikes remaining badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-heading ${
                wrongGuesses >= maxStrikes - 1
                  ? 'bg-rose-900/60 border-rose-500 text-rose-200 animate-pulse'
                  : 'bg-[#182453] border-[#293B73] text-[#FFD467]'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-[#E7364B]" />
              <span>
                {wrongGuesses}/{maxStrikes} Strikes
              </span>
            </div>

            {/* Hint Button */}
            <button
              id="hangman-hint-btn"
              onClick={handleUseHint}
              disabled={isSuccess || isFailed}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#182453] hover:bg-[#253675] disabled:opacity-50 text-[#FFD467] border border-[#FFD467]/30 text-xs font-heading transition-all"
              title="Reveal an unrevealed letter"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#FFD467]" />
              <span>Hint</span>
            </button>
          </div>
        </div>

        {/* Clue sentence */}
        <p className="text-xs sm:text-sm text-[#C2D4FF] leading-relaxed font-medium bg-[#0A102E]/70 p-2.5 rounded-xl border border-[#1E2B63]">
          <strong className="text-[#FFD467]">Clue: </strong>
          {puzzle.hangman?.hint || puzzle.explanation}
        </p>
      </div>

      {/* Main Stage: Ornate Gallows SVG + Visualizer */}
      <div
        className={`w-full max-w-xl bg-[#0F173D] rounded-3xl p-4 border-2 border-[#293A70] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transition-transform duration-200 ${
          isWrongShake ? 'translate-x-1 rotate-1 scale-98 ring-4 ring-rose-500/50' : ''
        }`}
      >
        {/* Deep ambient spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#E7364B]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Ornate Gallows SVG Canvas */}
        <div className="relative w-64 h-48 sm:h-52 flex items-center justify-center">
          <svg
            viewBox="0 0 240 200"
            className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          >
            {/* Stage Floor & Wooden Platform */}
            <rect x="20" y="180" width="200" height="14" rx="3" fill="#3E2723" stroke="#8D6E63" strokeWidth="2" />
            <line x1="30" y1="184" x2="210" y2="184" stroke="#5D4037" strokeWidth="1" />
            {/* Brass rivets on stage */}
            <circle cx="28" cy="187" r="2" fill="#FFD467" />
            <circle cx="212" cy="187" r="2" fill="#FFD467" />

            {/* Trapdoor opening line */}
            <line x1="120" y1="180" x2="180" y2="180" stroke="#E7364B" strokeWidth={wrongGuesses >= 6 ? 3 : 1} strokeDasharray={wrongGuesses >= 6 ? 'none' : '4 2'} />

            {/* Strike 1: Upright timber beam */}
            {wrongGuesses >= 1 && (
              <g id="gallows-post" className="animate-in fade-in duration-300">
                <rect x="50" y="30" width="14" height="150" rx="2" fill="#4E342E" stroke="#8D6E63" strokeWidth="2" />
                {/* Wood grain highlight */}
                <line x1="56" y1="35" x2="56" y2="175" stroke="#3E2723" strokeWidth="2" />
                {/* Base support triangular block */}
                <polygon points="40,180 50,150 50,180" fill="#3E2723" stroke="#8D6E63" strokeWidth="1.5" />
                <polygon points="64,180 64,150 74,180" fill="#3E2723" stroke="#8D6E63" strokeWidth="1.5" />
              </g>
            )}

            {/* Strike 2: Top crossbeam & support strut */}
            {wrongGuesses >= 2 && (
              <g id="gallows-beam" className="animate-in fade-in duration-300">
                <rect x="45" y="24" width="115" height="14" rx="2" fill="#4E342E" stroke="#8D6E63" strokeWidth="2" />
                {/* Support angle brace */}
                <line x1="64" y1="70" x2="100" y2="38" stroke="#8D6E63" strokeWidth="6" strokeLinecap="round" />
                {/* Decorative brass cap */}
                <circle cx="50" cy="31" r="3" fill="#FFD467" />
                <circle cx="150" cy="31" r="3" fill="#FFD467" />
              </g>
            )}

            {/* Strike 3: Suspended rope & brass noose ring */}
            {wrongGuesses >= 3 && (
              <g id="gallows-rope" className="animate-in fade-in duration-300">
                {/* Rope line */}
                <line x1="145" y1="38" x2="145" y2="70" stroke="#D7CCC8" strokeWidth="3.5" strokeDasharray="3 1" />
                {/* Knot */}
                <rect x="141" y="66" width="8" height="6" rx="2" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
                {/* Brass ring noose */}
                <ellipse cx="145" cy="80" rx="10" ry="12" fill="none" stroke="#FFD467" strokeWidth="2.5" />
              </g>
            )}

            {/* Strike 4: Magician's Head & Top Hat */}
            {wrongGuesses >= 4 && (
              <g id="gallows-head" className="animate-in fade-in duration-300">
                {/* Head circle */}
                <circle cx="145" cy="80" r="12" fill="#FFE0B2" stroke="#D7CCC8" strokeWidth="2" />
                {/* Mask or mustache */}
                <path d="M141 84 Q145 86 149 84" stroke="#212121" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Eyes */}
                {wrongGuesses >= 6 ? (
                  <>
                    {/* X eyes for game over */}
                    <path d="M139 77 L143 81 M143 77 L139 81" stroke="#E7364B" strokeWidth="1.5" />
                    <path d="M147 77 L151 81 M151 77 L147 81" stroke="#E7364B" strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <circle cx="141" cy="78" r="1.5" fill="#212121" />
                    <circle cx="149" cy="78" r="1.5" fill="#212121" />
                  </>
                )}

                {/* Ornate Magician Top Hat */}
                <rect x="133" y="58" width="24" height="14" rx="2" fill="#1A1A2E" stroke="#FFD467" strokeWidth="1.5" />
                {/* Hat ribbon */}
                <rect x="133" y="68" width="24" height="3" fill="#E7364B" />
                {/* Hat brim */}
                <ellipse cx="145" cy="72" rx="16" ry="3" fill="#1A1A2E" stroke="#FFD467" strokeWidth="1" />
                {/* Feather */}
                <path d="M152 64 Q156 56 160 54" stroke="#5EC3FF" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Strike 5: Magician Torso & Tuxedo Coat */}
            {wrongGuesses >= 5 && (
              <g id="gallows-torso" className="animate-in fade-in duration-300">
                {/* Torso */}
                <line x1="145" y1="92" x2="145" y2="135" stroke="#1A1A2E" strokeWidth="8" strokeLinecap="round" />
                {/* White Shirt Inset */}
                <line x1="145" y1="94" x2="145" y2="114" stroke="#FFF7E3" strokeWidth="3" />
                {/* Red Bowtie */}
                <polygon points="142,94 148,94 145,96" fill="#E7364B" />
                <polygon points="142,98 148,98 145,96" fill="#E7364B" />
                <circle cx="145" cy="96" r="1.5" fill="#FFD467" />
              </g>
            )}

            {/* Strike 6: Arms & Legs (Final Strike: Complete Magician Figure!) */}
            {wrongGuesses >= 6 && (
              <g id="gallows-limbs" className="animate-in fade-in duration-300">
                {/* Left Arm holding playing card */}
                <line x1="145" y1="102" x2="128" y2="118" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round" />
                <rect x="123" y="116" width="6" height="8" rx="1" fill="#FFF" stroke="#E7364B" strokeWidth="0.8" transform="rotate(-15 125 120)" />

                {/* Right Arm */}
                <line x1="145" y1="102" x2="162" y2="118" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round" />
                {/* White glove */}
                <circle cx="163" cy="119" r="3" fill="#FFF" />

                {/* Left Leg */}
                <line x1="145" y1="135" x2="132" y2="165" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="130" cy="166" rx="4" ry="2" fill="#212121" />

                {/* Right Leg */}
                <line x1="145" y1="135" x2="158" y2="165" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="160" cy="166" rx="4" ry="2" fill="#212121" />
              </g>
            )}

            {/* Atmospheric Lantern hanging from gallows tip */}
            <line x1="156" y1="38" x2="156" y2="48" stroke="#FFD467" strokeWidth="1" />
            <rect x="153" y="48" width="6" height="8" rx="1" fill="#FFD467" fillOpacity="0.8" stroke="#F58A12" strokeWidth="1" />
          </svg>

          {/* Glowing Status Message Pill Overlay */}
          {message && (
            <div className="absolute bottom-2 inset-x-4 bg-[#0A102E]/95 border-2 border-[#E7364B] text-[#FFF7E3] text-xs font-heading text-center p-2 rounded-xl shadow-xl animate-in zoom-in-95">
              {message}
            </div>
          )}
        </div>

        {/* Word Display: Individual Letter Tiles */}
        <div className="w-full mt-4 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 px-2">
          {answerUpper.split('').map((char, index) => {
            const isLetter = /[A-Z]/.test(char);
            if (!isLetter) {
              return (
                <span key={index} className="text-xl font-heading text-[#FFD467] px-1">
                  {char}
                </span>
              );
            }

            const isRevealed = guessedLetters.has(char);
            const isFailedMissing = isFailed && !isRevealed;

            return (
              <div
                key={index}
                className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center text-lg sm:text-2xl font-heading font-black shadow-md transition-all transform ${
                  isRevealed
                    ? 'bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border-[#FFE699] text-[#211200] scale-102 shadow-[0_0_12px_rgba(255,212,103,0.5)] animate-in zoom-in-90'
                    : isFailedMissing
                    ? 'bg-[#3A1020] border-[#E7364B] text-[#FF6B8B] animate-pulse'
                    : 'bg-[#0A102E] border-[#2B3C75] text-transparent'
                }`}
              >
                {isRevealed ? char : isFailedMissing ? char : '_'}
              </div>
            );
          })}
        </div>

        {/* Strikes Indicator Dots Bar */}
        <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-heading font-bold text-[#9CB3E6] uppercase tracking-wide mr-1">
            Gallows Strikes:
          </span>
          {Array.from({ length: maxStrikes }).map((_, idx) => {
            const isStruck = idx < wrongGuesses;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  isStruck
                    ? 'bg-[#E7364B] border-[#FF6B8B] shadow-[0_0_8px_rgba(231,54,75,0.8)]'
                    : 'bg-[#182453] border-[#2A3C72]'
                }`}
                title={`Strike ${idx + 1}`}
              >
                {isStruck && <Skull className="w-2.5 h-2.5 text-white" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Failure State Actions */}
      {isFailed && (
        <div className="w-full max-w-xl flex items-center justify-center gap-3 animate-in fade-in">
          <button
            id="hangman-retry-btn"
            onClick={handleRetry}
            className="flex-1 py-3 rounded-2xl bg-[#182453] hover:bg-[#253675] text-[#FFD467] border-2 border-[#FFD467]/50 font-heading text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            id="hangman-next-btn"
            onClick={onNextPuzzle}
            className="flex-1 py-3 rounded-2xl btn-chunky-orange text-white font-heading text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>NEXT PUZZLE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive Letter-Bank Keyboard */}
      <div
        id="hangman-keyboard"
        className="w-full max-w-xl bg-[#121A3B] rounded-3xl p-2.5 sm:p-3.5 border-2 border-[#2C3B75] shadow-2xl flex flex-col gap-1.5"
      >
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((letter) => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = isGuessed && uniqueLettersInAnswer.has(letter);
              const isWrong = isGuessed && !uniqueLettersInAnswer.has(letter);

              return (
                <button
                  key={letter}
                  id={`hangman-key-${letter}`}
                  onClick={() => guessLetter(letter)}
                  disabled={isGuessed || isSuccess || isFailed}
                  className={`h-11 sm:h-12 flex-1 max-w-[42px] rounded-xl font-heading text-sm sm:text-base font-black transition-all flex items-center justify-center select-none ${
                    isCorrect
                      ? 'bg-gradient-to-t from-[#2E7D32] to-[#4CAF50] border-2 border-[#A5D6A7] text-white shadow-sm scale-95 opacity-90 cursor-default'
                      : isWrong
                      ? 'bg-[#2E121E] border border-[#E7364B]/40 text-gray-500 opacity-40 cursor-not-allowed line-through'
                      : 'bg-[#182453] hover:bg-[#253775] active:translate-y-0.5 border border-[#2F4280] text-[#FFF7E3] hover:text-[#FFD467] shadow hover:border-[#FFD467]/40'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Controls Bar: Skip Button */}
      <div className="w-full max-w-xl flex items-center justify-between px-2 text-xs text-[#9CB3E6]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD467]" />
          <span>Type with your keyboard or tap the letters above.</span>
        </div>

        {canSkip && !isDailyMode && (
          <button
            onClick={() => {
              sound.playTap();
              onSkipPuzzle();
            }}
            className="text-[#5EC3FF] hover:text-[#FFD467] font-heading font-bold flex items-center gap-1 transition-colors"
            title="Skip for 20 gems"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip (20 Gems)</span>
          </button>
        )}
      </div>
    </div>
  );
};
