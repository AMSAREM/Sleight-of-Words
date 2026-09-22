import React from 'react';
import { Volume2, VolumeX, Music, Smartphone, Globe, Award, X, Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  vibrationEnabled: boolean;
  onToggleVibration: () => void;
  language: string;
  onSelectLanguage: (lang: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  musicEnabled,
  onToggleMusic,
  vibrationEnabled,
  onToggleVibration,
  language,
  onSelectLanguage
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0A102E]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-card"
        className="relative w-full max-w-sm card-wordlanes p-6 sm:p-7 pt-9 flex flex-col items-center gap-5 text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlapping Top Header Pill Tab (Screen 1 reference) */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-7 py-2 tab-wordlanes text-xs sm:text-sm font-black tracking-widest text-[#182453] uppercase shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F58A12]" />
          <span>SETTINGS</span>
        </div>

        {/* Top-Right Close Button (Screen 1 reference) */}
        <button
          id="settings-close-btn"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute -top-3 -right-3 w-9 h-9 btn-close-wordlanes text-sm font-black shadow-lg"
          aria-label="Close Settings"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Toggles Container */}
        <div className="w-full flex flex-col gap-3.5 pt-2">
          {/* 1. Sound FX Toggle */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FFF0D4]/70 border border-[#E8DCBE]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#5EC3FF]/20 text-[#2A8CE0] flex items-center justify-center">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#2A8CE0]" />}
              </div>
              <span className="font-heading text-sm text-[#182453] font-bold">Sound</span>
            </div>

            {/* Word Lanes Style Switch */}
            <button
              id="settings-sound-switch-btn"
              onClick={() => {
                sound.playTap();
                onToggleMute();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 border-2 relative ${
                !isMuted
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] border-[#6D28D9] shadow-inner'
                  : 'bg-gray-300 border-gray-400'
              }`}
              aria-label="Toggle Sound"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 border border-gray-200 ${
                  !isMuted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Theme Music Toggle */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FFF0D4]/70 border border-[#E8DCBE]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#A855F7]/20 text-[#7E22CE] flex items-center justify-center">
                <Music className="w-4 h-4 text-[#7E22CE]" />
              </div>
              <span className="font-heading text-sm text-[#182453] font-bold">Theme Music</span>
            </div>

            <button
              id="settings-music-switch-btn"
              onClick={() => {
                sound.playTap();
                onToggleMusic();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 border-2 relative ${
                musicEnabled
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] border-[#6D28D9] shadow-inner'
                  : 'bg-gray-300 border-gray-400'
              }`}
              aria-label="Toggle Music"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 border border-gray-200 ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Vibration / Haptic Feedback */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FFF0D4]/70 border border-[#E8DCBE]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#7CE04A]/20 text-[#3FB52C] flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#3FB52C]" />
              </div>
              <span className="font-heading text-sm text-[#182453] font-bold">Vibration</span>
            </div>

            <button
              id="settings-vibration-switch-btn"
              onClick={() => {
                sound.playTap();
                onToggleVibration();
              }}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 border-2 relative ${
                vibrationEnabled
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] border-[#6D28D9] shadow-inner'
                  : 'bg-gray-300 border-gray-400'
              }`}
              aria-label="Toggle Vibration"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 border border-gray-200 ${
                  vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Word Lanes Style Language & Region Buttons (Screen 1 reference) */}
        <div className="w-full flex flex-col gap-3 pt-1 border-t border-[#E8DCBE]">
          {/* Language pill */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-heading font-black text-gray-500 uppercase tracking-wider">Language</span>
            <button
              id="settings-language-btn"
              onClick={() => {
                sound.playTap();
                onSelectLanguage(language === 'English' ? 'English (UK)' : 'English');
              }}
              className="w-full max-w-[200px] py-2 px-4 btn-wordlanes-blue text-xs font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language || 'English'}</span>
            </button>
          </div>

          {/* Magician Title & Country pill */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-heading font-black text-gray-500 uppercase tracking-wider">Country / Parlor</span>
            <button
              id="settings-country-btn"
              onClick={() => {
                sound.playTap();
              }}
              className="w-full max-w-[200px] py-2 px-4 btn-wordlanes-blue text-xs font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Canada (Parlor #1)</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 font-mono">
          Sleight of Word • v1.0.4
        </div>
      </div>
    </div>
  );
};
