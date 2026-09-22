import React, { useState, useEffect } from 'react';
import { Lightbulb, RotateCcw, ArrowRight, Star, AlertCircle, FastForward } from 'lucide-react';
import { SeamsPuzzle } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';
import { sound } from '../utils/audio';

interface SeamsGameProps {
  puzzle: SeamsPuzzle;
  hearts: number;
  onLoseHeart: () => void;
  onPuzzleSolved: (stars: number, hintsUsed: number, wrongGuesses: number) => void;
  onNextPuzzle: () => void;
  onSkipPuzzle: () => void;
  canSkip: boolean;
  isDailyMode?: boolean;
}

export const SeamsGame: React.FC<SeamsGameProps> = ({
  puzzle,
  hearts,
  onLoseHeart,
  onPuzzleSolved,
  onNextPuzzle,
  onSkipPuzzle,
  canSkip,
  isDailyMode = false
}) => {
  const targetLength = puzzle.answer.length;
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [isWrongShake, setIsWrongShake] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Reset state when puzzle changes
  useEffect(() => {
    setTypedLetters([]);
    setHintsUsed(0);
    setWrongGuesses(0);
    setIsWrongShake(false);
    setIsSuccess(false);
    setIsFailed(false);
    setMessage(null);
  }, [puzzle.id]);

  // Handle zero hearts failure
  useEffect(() => {
    if (hearts <= 0 && !isSuccess) {
      setIsFailed(true);
      sound.playError();
      setMessage(`Out of hearts! The hidden answer was "${puzzle.answer}".`);
    }
  }, [hearts, isSuccess, puzzle.answer]);

  // Keyboard handlers
  const handleKeyPress = (char: string) => {
    if (isSuccess || isFailed) return;
    if (typedLetters.length < targetLength) {
      setTypedLetters((prev) => [...prev, char]);
      setMessage(null);
    }
  };

  const handleBackspace = () => {
    if (isSuccess || isFailed) return;
    setTypedLetters((prev) => prev.slice(0, -1));
    setMessage(null);
  };

  const handleUseHint = () => {
    if (isSuccess || isFailed) return;
    if (hintsUsed >= 3) {
      setMessage("All 3 hints have already been used for this puzzle.");
      return;
    }

    sound.playHint();
    const nextHint = hintsUsed + 1;
    setHintsUsed(nextHint);

    if (nextHint === 1) {
      setMessage("Hint 1: Look at the highlighted neighboring words in the sentence!");
    } else if (nextHint === 2) {
      // Auto-fill first letter if not already typed
      const firstChar = puzzle.answer[0];
      setTypedLetters([firstChar]);
      setMessage(`Hint 2: The hidden word starts with "${firstChar}"!`);
    } else if (nextHint === 3) {
      setMessage(`Hint 3: ${puzzle.explanation}`);
    }
  };

  const handleSubmit = () => {
    if (isSuccess || isFailed) return;

    const currentGuess = typedLetters.join('');
    if (currentGuess.length < targetLength) {
      setMessage(`Type all ${targetLength} letters first!`);
      sound.playError();
      return;
    }

    const isCorrect = puzzle.accepted_answers.some(
      (ans) => ans.toUpperCase() === currentGuess.toUpperCase()
    );

    if (isCorrect) {
      sound.playSuccess();
      setIsSuccess(true);
      const earnedStars = Math.max(1, 3 - hintsUsed - wrongGuesses);
      onPuzzleSolved(earnedStars, hintsUsed, wrongGuesses);
      setMessage(`Correct! ${puzzle.explanation}`);
    } else {
      sound.playError();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
      setWrongGuesses((prev) => prev + 1);
      onLoseHeart();
      setMessage(`"${currentGuess}" is not correct. Try again! (-1 ❤️)`);
    }
  };

  const handleRetry = () => {
    setTypedLetters([]);
    setWrongGuesses(0);
    setIsFailed(false);
    setMessage(null);
  };

  // Split sentence into words for rendering & highlight
  const words = puzzle.sentence.split(' ');
  const wordA = puzzle.seams.word_index_a;
  const wordB = puzzle.seams.word_index_b;

  return (
    <div id="seams-game-view" className="w-full flex flex-col items-center gap-4">
      {/* Level Tag & Instruction Card */}
      <div className="w-full max-w-xl flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-heading uppercase tracking-wider">
            Seams • {targetLength} Letters
          </span>
          <span className="text-xs text-[#5EC3FF]">Difficulty: {puzzle.difficulty}/5</span>
        </div>

        {/* Skip button if player has enough gems */}
        {!isDailyMode && !isSuccess && (
          <button
            id="skip-level-btn"
            disabled={!canSkip}
            onClick={() => {
              if (canSkip) {
                sound.playTap();
                onSkipPuzzle();
              }
            }}
            className="flex items-center gap-1 text-xs font-heading px-2 py-1 rounded-lg bg-[#273873] border border-[#3B4D8A] text-[#FFD467] hover:bg-[#344B98] disabled:opacity-40 transition-all"
            title="Skip level for 20 Gems"
          >
            <FastForward className="w-3.5 h-3.5 text-[#5EC3FF]" />
            <span>Skip (20 💎)</span>
          </button>
        )}
      </div>

      {/* Gold-framed Cream Paper Sentence Card */}
      <div
        id="sentence-card"
        className="w-full max-w-xl bg-[#FFF7E3] text-[#182453] rounded-2xl p-5 sm:p-6 gold-frame relative transition-all"
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#A8680E] mb-2">
            Find the word hidden across two neighboring words
          </p>

          {/* Sentence Display */}
          <p className="text-xl sm:text-2xl font-bold leading-relaxed text-[#182453]">
            {words.map((word, idx) => {
              const isHighlightWord = hintsUsed >= 1 && (idx === wordA || idx === wordB);
              return (
                <span
                  key={idx}
                  className={`inline-block mx-1 transition-all rounded px-1.5 py-0.5 ${
                    isHighlightWord
                      ? 'bg-purple-200 text-purple-950 font-extrabold ring-2 ring-purple-500 shadow-sm scale-105'
                      : ''
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>
        </div>

        {/* Seam Boundary Visual Hint if Hint 1 active */}
        {hintsUsed >= 1 && (
          <div className="mt-3 py-1 px-3 bg-purple-100 border border-purple-300 rounded-xl text-center text-xs text-purple-900 font-semibold">
            ✨ The seam crosses between “{words[wordA]}” and “{words[wordB]}”
          </div>
        )}
      </div>

      {/* Inset Slot Tray with Jelly Letter Tiles */}
      <div className="flex flex-col items-center gap-2">
        <div
          id="letter-slots-tray"
          className={`flex items-center justify-center gap-2 sm:gap-3 p-3 rounded-2xl inset-slot border border-[#253258] transition-transform ${
            isWrongShake ? 'animate-bounce text-red-400' : ''
          }`}
        >
          {Array.from({ length: targetLength }).map((_, slotIndex) => {
            const letter = typedLetters[slotIndex] || '';
            const isFilled = letter.length > 0;
            return (
              <div
                key={slotIndex}
                id={`slot-${slotIndex}`}
                className={`w-12 h-13 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center font-heading text-2xl sm:text-3xl transition-all duration-150 ${
                  isFilled
                    ? isSuccess
                      ? 'jelly-tile-green text-green-950 scale-105'
                      : 'jelly-tile-purple text-purple-950 scale-100'
                    : 'bg-[#151F45] border-2 border-dashed border-[#2E3F78] text-transparent'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        {/* Dynamic Status / Helper Message */}
        {message && (
          <div
            id="game-message-banner"
            className={`max-w-md px-4 py-2 rounded-xl text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all ${
              isSuccess
                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                : isFailed
                ? 'bg-rose-950/80 border border-rose-500 text-rose-200'
                : 'bg-[#1D2A5E] border border-[#3B4E90] text-[#FFF7E3]'
            }`}
          >
            {isSuccess ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <AlertCircle className="w-4 h-4 text-[#5EC3FF]" />}
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Hints & Actions Bar */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 px-1">
        {/* Hint button */}
        <button
          id="seams-hint-btn"
          disabled={hintsUsed >= 3 || isSuccess || isFailed}
          onClick={handleUseHint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1F2D63] border border-[#344C99] hover:bg-[#283C85] text-[#FFD467] font-heading text-xs sm:text-sm shadow-md disabled:opacity-50 transition-all active:scale-95"
        >
          <Lightbulb className="w-4 h-4 text-[#FFD467]" />
          <span>HINT ({3 - hintsUsed} left)</span>
          <span className="text-[10px] bg-[#0E1638] px-1.5 py-0.5 rounded text-[#5EC3FF] font-sans">
            Cost: 1★
          </span>
        </button>

        {/* If solved, show Next Level button */}
        {isSuccess && (
          <button
            id="next-level-btn"
            onClick={() => {
              sound.playTap();
              onNextPuzzle();
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl btn-chunky-green text-[#FFF7E3] font-heading text-sm shadow-lg animate-pulse"
          >
            <span>NEXT TRICK</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* If failed, show Retry button */}
        {isFailed && (
          <button
            id="retry-level-btn"
            onClick={handleRetry}
            className="flex items-center gap-1 px-4 py-2 rounded-xl btn-chunky-orange text-[#FFF7E3] font-heading text-sm shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>
        )}
      </div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        disabled={isSuccess || isFailed}
        submitDisabled={typedLetters.length < targetLength}
      />
    </div>
  );
};
