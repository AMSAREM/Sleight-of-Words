import React, { useState } from 'react';
import { X, Star, Lock, Play } from 'lucide-react';
import { GameMode, Puzzle, PlayerStats } from '../types';
import { sound } from '../utils/audio';

interface LevelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPuzzles: Record<string, Puzzle[]>;
  currentMode: GameMode;
  stats: PlayerStats;
  onSelectLevel: (mode: GameMode, levelIndex: number) => void;
}

export const LevelMapModal: React.FC<LevelMapModalProps> = ({
  isOpen,
  onClose,
  allPuzzles,
  currentMode: initialMode,
  stats,
  onSelectLevel
}) => {
  const [selectedTab, setSelectedTab] = useState<GameMode>(initialMode);

  if (!isOpen) return null;

  const modePuzzles = allPuzzles[selectedTab] || [];

  return (
    <div
      id="level-map-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="level-map-card"
        className="w-full max-w-lg bg-[#151F45] border-4 border-[#27C2E8] rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 text-[#FFF7E3]"
      >
        {/* Close Button */}
        <button
          id="close-level-map-modal"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#253675] hover:bg-[#344B98] text-[#FFF7E3] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-[#5EC3FF] drop-shadow-md">
            Level Journey
          </h2>
          <p className="text-xs text-[#9CB3E6] mt-0.5">
            Select a stepping-stone to jump straight into any trick!
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-2 p-1 bg-[#0E1638] rounded-2xl border border-[#253258]">
          {(['seams', 'splits', 'charades'] as GameMode[]).map((mode) => {
            const active = selectedTab === mode;
            return (
              <button
                key={mode}
                id={`map-tab-${mode}`}
                onClick={() => {
                  sound.playTap();
                  setSelectedTab(mode);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl font-heading text-xs sm:text-sm capitalize transition-all ${
                  active
                    ? 'btn-chunky-blue text-white shadow-md'
                    : 'text-[#9CB3E6] hover:text-white hover:bg-[#1E2B63]'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>

        {/* Stepping-stone Level Map Grid */}
        <div className="w-full bg-[#0E1638] rounded-2xl p-4 border border-[#253258] flex flex-col gap-3 max-h-[380px] overflow-y-auto">
          {modePuzzles.map((puzzle, idx) => {
            const progress = stats.levelProgress[puzzle.id];
            const isSolved = progress?.solved || false;
            const stars = progress?.stars || 0;

            return (
              <div
                key={puzzle.id}
                id={`level-stone-${puzzle.id}`}
                onClick={() => {
                  sound.playTap();
                  onSelectLevel(selectedTab, idx);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSolved
                    ? 'bg-[#1D2C66] border-[#3B54A6] hover:bg-[#253880]'
                    : 'bg-[#162047] border-[#223060] hover:bg-[#1C2857]'
                }`}
              >
                {/* Stone number & icon */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-heading text-lg shadow-md border-b-3 ${
                      isSolved
                        ? 'btn-chunky-green text-white border-[#28771A]'
                        : 'bg-[#273873] text-[#5EC3FF] border-[#16214B]'
                    }`}
                  >
                    {isSolved ? <Play className="w-5 h-5 fill-white" /> : idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm text-[#FFF7E3]">
                        Level {idx + 1}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-[#93E6FB] font-bold">
                        Diff: {puzzle.difficulty}/5
                      </span>
                    </div>

                    <p className="text-xs text-[#9CB3E6] truncate max-w-[200px] sm:max-w-[280px]">
                      {puzzle.mode === 'charades'
                        ? puzzle.charades.whole.clue
                        : puzzle.sentence}
                    </p>
                  </div>
                </div>

                {/* Stars earned */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starNum) => (
                    <Star
                      key={starNum}
                      className={`w-4 h-4 ${
                        starNum <= stars
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
                          : 'fill-gray-700 text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
