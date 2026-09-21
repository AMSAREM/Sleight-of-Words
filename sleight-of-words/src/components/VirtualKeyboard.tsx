import React, { useEffect } from 'react';
import { Delete, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  submitLabel?: string;
  submitDisabled?: boolean;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onSubmit,
  disabled = false,
  submitLabel = 'LOCK IN',
  submitDisabled = false
}) => {
  // Listen to physical keyboard events as well
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // Ignore if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        sound.playTap();
        onKeyPress(key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        sound.playDelete();
        onBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!submitDisabled) {
          sound.playTap();
          onSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onKeyPress, onBackspace, onSubmit, submitDisabled]);

  return (
    <div id="virtual-keyboard-container" className="w-full max-w-xl mx-auto p-2 sm:p-3 rounded-2xl checkered-tray border-2 border-[#2C3B75] shadow-2xl">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {ROWS[0].map((letter) => (
          <button
            key={letter}
            id={`key-${letter}`}
            disabled={disabled}
            onClick={() => {
              sound.playTap();
              onKeyPress(letter);
            }}
            className="flex-1 max-w-[42px] h-10 sm:h-12 rounded-lg bg-[#273873] hover:bg-[#344994] active:bg-[#1D2A5E] text-[#FFF7E3] font-heading text-base sm:text-lg border-b-3 border-[#16214B] active:border-b-0 active:translate-y-0.5 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5 px-3">
        {ROWS[1].map((letter) => (
          <button
            key={letter}
            id={`key-${letter}`}
            disabled={disabled}
            onClick={() => {
              sound.playTap();
              onKeyPress(letter);
            }}
            className="flex-1 max-w-[42px] h-10 sm:h-12 rounded-lg bg-[#273873] hover:bg-[#344994] active:bg-[#1D2A5E] text-[#FFF7E3] font-heading text-base sm:text-lg border-b-3 border-[#16214B] active:border-b-0 active:translate-y-0.5 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Row 3 with Backspace and Submit */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {/* Backspace Button */}
        <button
          id="key-backspace"
          disabled={disabled}
          onClick={() => {
            sound.playDelete();
            onBackspace();
          }}
          aria-label="Backspace"
          className="flex-[1.4] max-w-[62px] h-10 sm:h-12 rounded-lg bg-[#3F2B54] hover:bg-[#52386E] active:bg-[#2C1D3C] text-[#FFA8BA] border-b-3 border-[#251735] active:border-b-0 active:translate-y-0.5 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Row 3 letters */}
        {ROWS[2].map((letter) => (
          <button
            key={letter}
            id={`key-${letter}`}
            disabled={disabled}
            onClick={() => {
              sound.playTap();
              onKeyPress(letter);
            }}
            className="flex-1 max-w-[42px] h-10 sm:h-12 rounded-lg bg-[#273873] hover:bg-[#344994] active:bg-[#1D2A5E] text-[#FFF7E3] font-heading text-base sm:text-lg border-b-3 border-[#16214B] active:border-b-0 active:translate-y-0.5 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
          >
            {letter}
          </button>
        ))}

        {/* Lock In / Submit Button */}
        <button
          id="key-submit"
          disabled={disabled || submitDisabled}
          onClick={() => {
            sound.playTap();
            onSubmit();
          }}
          className={`flex-[1.8] max-w-[80px] h-10 sm:h-12 rounded-lg font-heading text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-1 border-b-3 shadow-md ${
            submitDisabled || disabled
              ? 'bg-[#2B3559] text-gray-400 border-[#1B223D] opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-t from-[#F58A12] to-[#FFB63B] text-[#FFF7E3] border-[#B85B04] active:border-b-0 active:translate-y-0.5 hover:brightness-105'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </div>
  );
};
