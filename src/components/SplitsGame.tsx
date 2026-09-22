import React, { useState, useEffect } from 'react';
import { Lightbulb, RotateCcw, ArrowRight, Star, AlertCircle, FastForward, Check, Scissors } from 'lucide-react';
import { SplitsPuzzle } from '../types';
import { sound } from '../utils/audio';

interface SplitsGameProps {
  puzzle: SplitsPuzzle;
  hearts: number;
  onLoseHeart: () => void;
  onPuzzleSolved: (stars: number, hintsUsed: number, wrongGuesses: number) => void;
  onNextPuzzle: () => void;
  onSkipPuzzle: () => void;
  canSkip: boolean;
  isDailyMode?: boolean;
}

export const SplitsGame: React.FC<SplitsGameProps> = ({
  puzzle,
  hearts,
  onLoseHeart,
  onPuzzleSolved,
  onNextPuzzle,
  onSkipPuzzle,
  canSkip,
  isDailyMode = false
}) => {
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [chosenSplitPos, setChosenSplitPos] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [decoyMessage, setDecoyMessage] = useState<string | null>(null);

  // Extract clean words from sentence
  const rawWords = puzzle.sentence.split(' ');
  const targetIndex = puzzle.splits.word_index;
  const targetWord = puzzle.splits.original_word;

  // Reset when puzzle changes
  useEffect(() => {
    setSelectedWordIndex(null);
    setChosenSplitPos(null);
    setHintsUsed(0);
    setWrongGuesses(0);
    setIsSuccess(false);
    setIsFailed(false);
    setMessage(null);
    setDecoyMessage(null);
  }, [puzzle.id]);

  // Handle failure when hearts reach 0
  useEffect(() => {
    if (hearts <= 0 && !isSuccess) {
      setIsFailed(true);
      sound.playError();
      setMessage(`Out of hearts! The answer was "${puzzle.answer}".`);
    }
  }, [hearts, isSuccess, puzzle.answer]);

  // Clean a word token into pure letters for splitting
  const stripLetters = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');

  const handleSelectWord = (idx: number) => {
    if (isSuccess || isFailed) return;
    sound.playTap();
    setSelectedWordIndex(idx);
    setChosenSplitPos(null);
    setDecoyMessage(null);
    setMessage(null);
  };

  const handleChooseGap = (gapPos: number) => {
    if (isSuccess || isFailed) return;
    sound.playTap();
    setChosenSplitPos(gapPos);
    setDecoyMessage(null);

    // Check if there is decoy feedback for this gap
    if (selectedWordIndex === targetIndex && puzzle.splits.decoys) {
      const decoyText = puzzle.splits.decoys[String(gapPos)];
      if (decoyText) {
        setDecoyMessage(`Note: ${decoyText}`);
      }
    }
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
      setMessage(`Hint 1: Look closely at the word "${rawWords[targetIndex]}"!`);
    } else if (nextHint === 2) {
      setSelectedWordIndex(targetIndex);
      setMessage(`Hint 2: We opened "${targetWord}" for you to split!`);
    } else if (nextHint === 3) {
      setMessage(`Hint 3: ${puzzle.explanation}`);
    }
  };

  const handleSubmit = () => {
    if (isSuccess || isFailed) return;

    if (selectedWordIndex === null || chosenSplitPos === null) {
      setMessage("First tap a word, then tap a gap between its letters to split it!");
      sound.playError();
      return;
    }

    // Check if word index is target
    if (selectedWordIndex !== targetIndex) {
      sound.playError();
      setWrongGuesses((prev) => prev + 1);
      onLoseHeart();
      setMessage(`Splitting "${rawWords[selectedWordIndex]}" doesn't change the meaning. Try another word! (-1 ❤️)`);
      return;
    }

    // Check if chosenSplitPos is an accepted split
    const isAccepted = puzzle.splits.split_positions.includes(chosenSplitPos);

    if (isAccepted) {
      sound.playSuccess();
      setIsSuccess(true);
      const earnedStars = Math.max(1, 3 - hintsUsed - wrongGuesses);
      onPuzzleSolved(earnedStars, hintsUsed, wrongGuesses);
      setMessage(`Brilliant! ${puzzle.explanation}`);
    } else {
      sound.playError();
      setWrongGuesses((prev) => prev + 1);
      onLoseHeart();
      setMessage("That split doesn't create two real words that change the meaning! (-1 ❤️)");
    }
  };

  const handleRetry = () => {
    setSelectedWordIndex(null);
    setChosenSplitPos(null);
    setWrongGuesses(0);
    setIsFailed(false);
    setMessage(null);
    setDecoyMessage(null);
  };

  // Compute altered sentence preview
  const getPreviewSentence = () => {
    if (selectedWordIndex === null || chosenSplitPos === null) {
      return null;
    }
    const token = rawWords[selectedWordIndex];
    const clean = stripLetters(token);
    if (chosenSplitPos <= 0 || chosenSplitPos >= clean.length) return null;

    const partA = clean.slice(0, chosenSplitPos);
    const partB = clean.slice(chosenSplitPos);
    const replaced = token.replace(new RegExp(clean, 'i'), `${partA} ${partB}`);

    return rawWords.map((w, i) => (i === selectedWordIndex ? replaced : w)).join(' ');
  };

  const previewSentence = getPreviewSentence();
  const activeWordForSplit = selectedWordIndex !== null ? stripLetters(rawWords[selectedWordIndex]) : '';

  return (
    <div id="splits-game-view" className="w-full flex flex-col items-center gap-4">
      {/* Header Info */}
      <div className="w-full max-w-xl flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-heading uppercase tracking-wider">
            Splits • Add One Space
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

      {/* Gold-framed Sentence Card with Interactive Word Chips */}
      <div
        id="sentence-card"
        className="w-full max-w-xl bg-[#FFF7E3] text-[#182453] rounded-2xl p-5 sm:p-6 gold-frame relative transition-all"
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#A8680E] mb-2 flex items-center justify-center gap-1">
            <Scissors className="w-3.5 h-3.5" />
            <span>Tap a word to split it with a single space</span>
          </p>

          {/* Interactive Words */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 my-2">
            {rawWords.map((wordToken, idx) => {
              const isSelected = selectedWordIndex === idx;
              const isGlowHint = hintsUsed >= 1 && idx === targetIndex;
              return (
                <button
                  key={idx}
                  id={`word-token-${idx}`}
                  disabled={isSuccess || isFailed}
                  onClick={() => handleSelectWord(idx)}
                  className={`text-lg sm:text-2xl font-bold px-2 py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-600 scale-105'
                      : isGlowHint
                      ? 'bg-amber-200 text-amber-950 ring-2 ring-amber-400 font-extrabold animate-pulse'
                      : 'hover:bg-amber-100 text-[#182453] border border-transparent hover:border-amber-300'
                  }`}
                >
                  {wordToken}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Word Split Inspector */}
        {selectedWordIndex !== null && activeWordForSplit.length > 2 && (
          <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-amber-900">
              Tap a gap divider to insert the space in “{activeWordForSplit}”:
            </p>

            <div className="flex items-center justify-center flex-wrap gap-1 p-2 bg-amber-50 rounded-xl border border-amber-300 shadow-inner">
              {activeWordForSplit.split('').map((char, charIdx) => {
                const showGapAfter = charIdx < activeWordForSplit.length - 1;
                const gapNumber = charIdx + 1;
                const isGapSelected = chosenSplitPos === gapNumber;

                return (
                  <React.Fragment key={charIdx}>
                    {/* Letter Tile */}
                    <div className="w-9 h-11 sm:w-11 sm:h-13 rounded-lg bg-white border-2 border-amber-300 flex items-center justify-center font-heading text-xl sm:text-2xl text-amber-950 shadow-sm">
                      {char.toUpperCase()}
                    </div>

                    {/* Gap Button */}
                    {showGapAfter && (
                      <button
                        id={`gap-btn-${gapNumber}`}
                        disabled={isSuccess || isFailed}
                        onClick={() => handleChooseGap(gapNumber)}
                        className={`w-5 sm:w-6 h-9 sm:h-11 rounded-md flex items-center justify-center transition-all ${
                          isGapSelected
                            ? 'bg-amber-600 text-white font-black scale-110 shadow-md ring-2 ring-amber-400'
                            : 'bg-amber-200/70 hover:bg-amber-300 text-amber-800'
                        }`}
                        title={`Split after ${char.toUpperCase()}`}
                      >
                        {isGapSelected ? '✂️' : '|'}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Altered Sentence Preview */}
        {previewSentence && (
          <div className="mt-3 p-3 bg-white rounded-xl border-2 border-amber-400 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">
              Altered Sentence Preview
            </span>
            <p className="text-base sm:text-lg font-bold text-[#182453]">
              “{previewSentence}”
            </p>
          </div>
        )}

        {/* Decoy Warning */}
        {decoyMessage && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg text-xs text-yellow-900 font-semibold text-center">
            {decoyMessage}
          </div>
        )}
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

      {/* Action Buttons: Hints, Lock In, Next, Retry */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 px-1">
        {/* Hint button */}
        <button
          id="splits-hint-btn"
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

        {/* Lock In / Submit Split Button */}
        {!isSuccess && !isFailed && (
          <button
            id="splits-lockin-btn"
            disabled={chosenSplitPos === null}
            onClick={handleSubmit}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-heading text-sm shadow-lg transition-all ${
              chosenSplitPos === null
                ? 'bg-[#2B3559] text-gray-400 border border-[#1B223D] opacity-60 cursor-not-allowed'
                : 'btn-chunky-orange text-white cursor-pointer active:scale-95 hover:brightness-105'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>LOCK IN SPLIT</span>
          </button>
        )}

        {/* Success Next Level */}
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

        {/* Failure Retry */}
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
    </div>
  );
};
