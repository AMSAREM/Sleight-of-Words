import React, { useState, useEffect } from 'react';
import { Lightbulb, RotateCcw, ArrowRight, Star, AlertCircle, FastForward, CheckCircle2 } from 'lucide-react';
import { CharadesPuzzle } from '../types';
import { VirtualKeyboard } from './VirtualKeyboard';
import { sound } from '../utils/audio';

interface CharadesGameProps {
  puzzle: CharadesPuzzle;
  hearts: number;
  onLoseHeart: () => void;
  onPuzzleSolved: (stars: number, hintsUsed: number, wrongGuesses: number) => void;
  onNextPuzzle: () => void;
  onSkipPuzzle: () => void;
  canSkip: boolean;
  isDailyMode?: boolean;
}

export const CharadesGame: React.FC<CharadesGameProps> = ({
  puzzle,
  hearts,
  onLoseHeart,
  onPuzzleSolved,
  onNextPuzzle,
  onSkipPuzzle,
  canSkip,
  isDailyMode = false
}) => {
  const parts = puzzle.charades.parts;
  const wholeWord = puzzle.charades.whole.word;
  const wholeClue = puzzle.charades.whole.clue;

  const [activePartIndex, setActivePartIndex] = useState<number>(0);
  const [partInputs, setPartInputs] = useState<string[]>(parts.map(() => ''));
  const [solvedParts, setSolvedParts] = useState<boolean[]>(parts.map(() => false));
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Reset when puzzle changes
  useEffect(() => {
    setActivePartIndex(0);
    setPartInputs(parts.map(() => ''));
    setSolvedParts(parts.map(() => false));
    setHintsUsed(0);
    setWrongGuesses(0);
    setIsSuccess(false);
    setIsFailed(false);
    setMessage(null);
  }, [puzzle.id]);

  // Handle failure when hearts reach 0
  useEffect(() => {
    if (hearts <= 0 && !isSuccess) {
      setIsFailed(true);
      sound.playError();
      setMessage(`Out of hearts! The whole word was "${wholeWord}".`);
    }
  }, [hearts, isSuccess, wholeWord]);

  // Current active part target length
  const currentPart = parts[activePartIndex];
  const targetPartLength = currentPart ? currentPart.answers[0].length : 0;
  const currentPartInput = partInputs[activePartIndex] || '';

  const handleKeyPress = (char: string) => {
    if (isSuccess || isFailed || solvedParts[activePartIndex]) return;

    if (currentPartInput.length < targetPartLength) {
      const nextInput = currentPartInput + char;
      const updated = [...partInputs];
      updated[activePartIndex] = nextInput;
      setPartInputs(updated);
      setMessage(null);
    }
  };

  const handleBackspace = () => {
    if (isSuccess || isFailed || solvedParts[activePartIndex]) return;
    const nextInput = currentPartInput.slice(0, -1);
    const updated = [...partInputs];
    updated[activePartIndex] = nextInput;
    setPartInputs(updated);
    setMessage(null);
  };

  const handleUseHint = () => {
    if (isSuccess || isFailed) return;
    if (hintsUsed >= 3) {
      setMessage("All 3 hints have been used for this puzzle.");
      return;
    }

    sound.playHint();
    const nextHint = hintsUsed + 1;
    setHintsUsed(nextHint);

    if (nextHint === 1) {
      // First letter of the current part
      const firstLetter = currentPart.answers[0][0];
      const updated = [...partInputs];
      updated[activePartIndex] = firstLetter;
      setPartInputs(updated);
      setMessage(`Hint 1: Part ${activePartIndex + 1} starts with "${firstLetter}"!`);
    } else if (nextHint === 2) {
      // First letter of every open part
      const updated = [...partInputs];
      parts.forEach((p, idx) => {
        if (!solvedParts[idx]) {
          updated[idx] = p.answers[0][0];
        }
      });
      setPartInputs(updated);
      setMessage("Hint 2: Revealed the 1st letter of all open parts!");
    } else if (nextHint === 3) {
      // Fill in current part completely
      const answer = currentPart.answers[0];
      const updatedInputs = [...partInputs];
      updatedInputs[activePartIndex] = answer;
      setPartInputs(updatedInputs);

      const updatedSolved = [...solvedParts];
      updatedSolved[activePartIndex] = true;
      setSolvedParts(updatedSolved);

      setMessage(`Hint 3: Solved Part ${activePartIndex + 1} (${answer})!`);

      // Check if all parts now solved
      checkAllSolved(updatedSolved);
    }
  };

  const checkAllSolved = (solvedArr: boolean[]) => {
    if (solvedArr.every(Boolean)) {
      sound.playSuccess();
      setIsSuccess(true);
      const earnedStars = Math.max(1, 3 - hintsUsed - wrongGuesses);
      onPuzzleSolved(earnedStars, hintsUsed, wrongGuesses);
      setMessage(`Mastery! ${puzzle.explanation}`);
    } else {
      // Move to next unsolved part
      const nextUnsolved = solvedArr.findIndex((s) => !s);
      if (nextUnsolved !== -1) {
        setActivePartIndex(nextUnsolved);
      }
    }
  };

  const handleSubmit = () => {
    if (isSuccess || isFailed) return;

    if (currentPartInput.length < targetPartLength) {
      setMessage(`Type all ${targetPartLength} letters for Part ${activePartIndex + 1}!`);
      sound.playError();
      return;
    }

    // Check if input matches any accepted answer for current part
    const isCorrect = currentPart.answers.some(
      (ans) => ans.toUpperCase() === currentPartInput.toUpperCase()
    );

    if (isCorrect) {
      sound.playTap();
      const updatedSolved = [...solvedParts];
      updatedSolved[activePartIndex] = true;
      setSolvedParts(updatedSolved);

      setMessage(`Part ${activePartIndex + 1} correct!`);
      checkAllSolved(updatedSolved);
    } else {
      sound.playError();
      setWrongGuesses((prev) => prev + 1);
      onLoseHeart();
      setMessage(`"${currentPartInput}" is not the answer for this clue! (-1 ❤️)`);
    }
  };

  const handleRetry = () => {
    setPartInputs(parts.map(() => ''));
    setSolvedParts(parts.map(() => false));
    setActivePartIndex(0);
    setWrongGuesses(0);
    setIsFailed(false);
    setMessage(null);
  };

  return (
    <div id="charades-game-view" className="w-full flex flex-col items-center gap-4">
      {/* Header Info */}
      <div className="w-full max-w-xl flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-heading uppercase tracking-wider">
            Charades • {parts.length} Clues → 1 Word
          </span>
          <span className="text-xs text-[#5EC3FF]">Difficulty: {puzzle.difficulty}/5</span>
        </div>

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

      {/* Whole Word Banner & Clue */}
      <div
        id="charades-whole-card"
        className="w-full max-w-xl bg-[#FFF7E3] text-[#182453] rounded-2xl p-4 sm:p-5 gold-frame text-center"
      >
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#A8680E] block mb-1">
          Whole Word Clue ({wholeWord.length} letters)
        </span>
        <p className="text-lg sm:text-xl font-bold text-[#182453] mb-3">
          “{wholeClue}”
        </p>

        {/* Whole Word Assembled Jelly Slots */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 p-2 rounded-xl inset-slot max-w-md mx-auto">
          {parts.map((part, pIdx) => {
            const isPartDone = solvedParts[pIdx];
            const partLetters = isPartDone
              ? part.answers[0].split('')
              : Array.from({ length: part.answers[0].length }).map((_, i) => partInputs[pIdx][i] || '');

            return (
              <div
                key={pIdx}
                onClick={() => {
                  if (!isSuccess && !isFailed) {
                    sound.playTap();
                    setActivePartIndex(pIdx);
                  }
                }}
                className={`flex gap-1 p-1 rounded-lg cursor-pointer transition-all ${
                  activePartIndex === pIdx && !isPartDone
                    ? 'ring-2 ring-emerald-400 bg-emerald-950/40'
                    : ''
                }`}
              >
                {partLetters.map((char, cIdx) => (
                  <div
                    key={cIdx}
                    className={`w-9 h-11 sm:w-11 sm:h-13 rounded-lg flex items-center justify-center font-heading text-lg sm:text-2xl transition-all ${
                      isPartDone
                        ? 'jelly-tile-green text-green-950 scale-100'
                        : char
                        ? 'jelly-tile text-amber-950'
                        : 'bg-[#151F45] border border-dashed border-[#2E3F78] text-transparent'
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part Clues Stack */}
      <div className="w-full max-w-xl flex flex-col gap-2">
        {parts.map((part, pIdx) => {
          const isActive = activePartIndex === pIdx;
          const isDone = solvedParts[pIdx];
          const partLen = part.answers[0].length;

          return (
            <div
              key={pIdx}
              id={`part-card-${pIdx}`}
              onClick={() => {
                if (!isSuccess && !isFailed) {
                  sound.playTap();
                  setActivePartIndex(pIdx);
                }
              }}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-100 shadow-sm'
                  : isActive
                  ? 'bg-[#1F2D63] border-emerald-400 shadow-lg scale-[1.01]'
                  : 'bg-[#151F45] border-[#253675] text-gray-300 hover:bg-[#1A2655]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-[#253675] text-[#9CB3E6]'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : pIdx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs uppercase tracking-wider text-[#5EC3FF]">
                      Part {pIdx + 1} • {partLen} Letters
                    </span>
                    {isDone && (
                      <span className="text-xs font-bold text-emerald-400">
                        = {part.answers[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#FFF7E3]">
                    “{part.clue}”
                  </p>
                </div>
              </div>

              {/* Mini slot preview */}
              <div className="flex gap-1">
                {Array.from({ length: partLen }).map((_, cIdx) => {
                  const letter = isDone ? part.answers[0][cIdx] : partInputs[pIdx][cIdx] || '';
                  return (
                    <div
                      key={cIdx}
                      className={`w-6 h-8 sm:w-8 sm:h-10 rounded flex items-center justify-center font-heading text-sm sm:text-base ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : letter
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-[#0E1638] text-transparent border border-[#253258]'
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
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

      {/* Hints & Actions Bar */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 px-1">
        {/* Hint button */}
        <button
          id="charades-hint-btn"
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

      {/* Virtual Keyboard for active part */}
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        disabled={isSuccess || isFailed || solvedParts[activePartIndex]}
        submitDisabled={currentPartInput.length < targetPartLength}
      />
    </div>
  );
};
