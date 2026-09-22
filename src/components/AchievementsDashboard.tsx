import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Eye,
  Layers,
  Star,
  Sparkles,
  Swords,
  Crown,
  Calendar,
  Coins,
  CheckCircle2,
  Lock,
  Gift,
  Award,
  Filter,
  Search,
  Zap,
  Split
} from 'lucide-react';
import { AchievementProgress } from '../types';
import { sound } from '../utils/audio';

interface AchievementsDashboardProps {
  achievements: AchievementProgress[];
  onClaimReward: (achievementId: string, reward: { coins: number; gems: number }) => void;
}

export const AchievementsDashboard: React.FC<AchievementsDashboardProps> = ({
  achievements,
  onClaimReward
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'in_progress' | 'streak' | 'mastery' | 'modes'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Summary counts
  const totalCount = achievements.length;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const claimedCount = achievements.filter((a) => a.isClaimed).length;
  const unclaimedCount = achievements.filter((a) => a.isUnlocked && !a.isClaimed).length;
  const overallPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Filter list
  const filteredAchievements = achievements.filter((ach) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = ach.title.toLowerCase().includes(q) || ach.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeFilter === 'unlocked') return ach.isUnlocked;
    if (activeFilter === 'in_progress') return !ach.isUnlocked;
    if (activeFilter === 'streak') return ach.category === 'streak';
    if (activeFilter === 'mastery') return ach.category === 'mastery';
    if (activeFilter === 'modes') return ach.category === 'modes';
    return true;
  });

  // Render specific badge icon
  const renderBadgeIcon = (iconName: string, color: string, isUnlocked: boolean) => {
    const iconProps = {
      className: `w-5 h-5 ${isUnlocked ? 'text-[#FFF7E3] drop-shadow' : 'text-[#6377AA]'}`
    };

    switch (iconName) {
      case 'flame':
        return <Flame {...iconProps} />;
      case 'eye':
        return <Eye {...iconProps} />;
      case 'layers':
        return <Layers {...iconProps} />;
      case 'star':
        return <Star {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'swords':
        return <Swords {...iconProps} />;
      case 'split':
        return <Split {...iconProps} />;
      case 'crown':
        return <Crown {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'coins':
        return <Coins {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  return (
    <section
      id="achievements-dashboard"
      className="bg-[#121A3B] rounded-3xl p-5 sm:p-6 border-2 border-[#253258] shadow-2xl flex flex-col gap-6"
    >
      {/* Dashboard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#253258]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFB63B] to-[#F58A12] border-t-2 border-l-2 border-[#FFE8A3] border-b-2 border-r-2 border-[#B85B04] shadow-md flex items-center justify-center text-[#182453]">
              <Trophy className="w-5 h-5 text-[#182453]" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl text-[#FFD467] font-black tracking-wide flex items-center gap-2">
                <span>Magician Achievements</span>
                {unclaimedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#7CE04A] text-[#182453] text-[10px] font-heading font-black animate-bounce shadow">
                    {unclaimedCount} REWARD{unclaimedCount > 1 ? 'S' : ''}!
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#9CB3E6]">
                Track grand milestones, master illusion modes, and collect prestigious badges
              </p>
            </div>
          </div>
        </div>

        {/* Global Progress Gauge */}
        <div className="flex items-center gap-4 bg-[#0A102E] px-4 py-2.5 rounded-2xl border border-[#223263] self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-[#9CB3E6] font-semibold block uppercase tracking-wider">
              Completion
            </span>
            <span className="font-heading text-base font-black text-[#FFD467] block leading-none">
              {unlockedCount} / {totalCount}
            </span>
          </div>

          <div className="w-24 sm:w-28 flex flex-col gap-1">
            <div className="w-full h-2.5 bg-[#141C40] rounded-full overflow-hidden border border-[#223060] p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#FFB63B] to-[#7CE04A] rounded-full transition-all duration-500 border-t border-l border-white/40"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-right font-mono text-[#5EC3FF]">
              {overallPercent}% Cleared
            </span>
          </div>
        </div>
      </div>

      {/* Featured Milestone Spotlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Spotlight 1: 10 in a Row */}
        {(() => {
          const ach = achievements.find((a) => a.id === 'streak_10_in_row');
          if (!ach) return null;
          return (
            <div
              id="spotlight-streak-10"
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.isUnlocked
                  ? 'bg-gradient-to-br from-[#2D160D] to-[#1A1838] border-[#F58A12] shadow-[0_0_15px_rgba(245,138,18,0.25)]'
                  : 'bg-[#0A102E] border-[#223263]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-black/40 shadow"
                style={{ backgroundColor: ach.isUnlocked ? '#F58A12' : '#182453' }}
              >
                <Flame className={`w-6 h-6 ${ach.isUnlocked ? 'text-[#FFF7E3]' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-[#FFF7E3] truncate">
                    10 in a Row
                  </span>
                  <span className="text-[10px] font-mono text-[#FFD467] font-bold">
                    {ach.current}/{ach.target}
                  </span>
                </div>
                <span className="text-[10px] text-[#9CB3E6] line-clamp-1">Unbroken focus run</span>
                <div className="w-full h-1.5 bg-[#141C40] rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#F58A12] rounded-full transition-all"
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Spotlight 2: Zero Hints */}
        {(() => {
          const ach = achievements.find((a) => a.id === 'zero_hints_single');
          if (!ach) return null;
          return (
            <div
              id="spotlight-zero-hints"
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.isUnlocked
                  ? 'bg-gradient-to-br from-[#0E2638] to-[#121A3B] border-[#5EC3FF] shadow-[0_0_15px_rgba(94,195,255,0.25)]'
                  : 'bg-[#0A102E] border-[#223263]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-black/40 shadow"
                style={{ backgroundColor: ach.isUnlocked ? '#2A8CE0' : '#182453' }}
              >
                <Eye className={`w-6 h-6 ${ach.isUnlocked ? 'text-[#FFF7E3]' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-[#FFF7E3] truncate">
                    0 Hints Used
                  </span>
                  <span className="text-[10px] font-mono text-[#5EC3FF] font-bold">
                    {ach.current >= 1 ? 'Unlocked' : `${ach.current}/1`}
                  </span>
                </div>
                <span className="text-[10px] text-[#9CB3E6] line-clamp-1">Pure intuitive solve</span>
                <div className="w-full h-1.5 bg-[#141C40] rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#5EC3FF] rounded-full transition-all"
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Spotlight 3: Unlock All Modes */}
        {(() => {
          const ach = achievements.find((a) => a.id === 'unlock_all_modes');
          if (!ach) return null;
          return (
            <div
              id="spotlight-all-modes"
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.isUnlocked
                  ? 'bg-gradient-to-br from-[#28133E] to-[#171033] border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                  : 'bg-[#0A102E] border-[#223263]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-t-2 border-l-2 border-white/30 border-b-2 border-r-2 border-black/40 shadow"
                style={{ backgroundColor: ach.isUnlocked ? '#8B5CF6' : '#182453' }}
              >
                <Layers className={`w-6 h-6 ${ach.isUnlocked ? 'text-[#FFF7E3]' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-[#FFF7E3] truncate">
                    All 4 Modes
                  </span>
                  <span className="text-[10px] font-mono text-[#C084FC] font-bold">
                    {ach.current}/4 Modes
                  </span>
                </div>
                <span className="text-[10px] text-[#9CB3E6] line-clamp-1">Adventure Map unlock</span>
                <div className="w-full h-1.5 bg-[#141C40] rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#8B5CF6] rounded-full transition-all"
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            id="filter-achievements-all"
            onClick={() => {
              sound.playTap();
              setActiveFilter('all');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-heading transition-all ${
              activeFilter === 'all'
                ? 'bg-[#FFD467] text-[#182453] font-black shadow-sm'
                : 'bg-[#0A102E] hover:bg-[#182453] text-[#9CB3E6] border border-[#223263]'
            }`}
          >
            All ({achievements.length})
          </button>

          <button
            id="filter-achievements-in-progress"
            onClick={() => {
              sound.playTap();
              setActiveFilter('in_progress');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-heading transition-all ${
              activeFilter === 'in_progress'
                ? 'bg-[#FFB63B] text-[#182453] font-black shadow-sm'
                : 'bg-[#0A102E] hover:bg-[#182453] text-[#9CB3E6] border border-[#223263]'
            }`}
          >
            In Progress ({totalCount - unlockedCount})
          </button>

          <button
            id="filter-achievements-unlocked"
            onClick={() => {
              sound.playTap();
              setActiveFilter('unlocked');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-heading transition-all ${
              activeFilter === 'unlocked'
                ? 'bg-[#7CE04A] text-[#182453] font-black shadow-sm'
                : 'bg-[#0A102E] hover:bg-[#182453] text-[#9CB3E6] border border-[#223263]'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>

          <button
            id="filter-achievements-streak"
            onClick={() => {
              sound.playTap();
              setActiveFilter('streak');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-heading transition-all hidden md:inline-flex ${
              activeFilter === 'streak'
                ? 'bg-[#F58A12] text-white font-black shadow-sm'
                : 'bg-[#0A102E] hover:bg-[#182453] text-[#9CB3E6] border border-[#223263]'
            }`}
          >
            Streak
          </button>

          <button
            id="filter-achievements-modes"
            onClick={() => {
              sound.playTap();
              setActiveFilter('modes');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-heading transition-all hidden md:inline-flex ${
              activeFilter === 'modes'
                ? 'bg-[#8B5CF6] text-white font-black shadow-sm'
                : 'bg-[#0A102E] hover:bg-[#182453] text-[#9CB3E6] border border-[#223263]'
            }`}
          >
            Game Modes
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#9CB3E6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="achievement-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestone..."
            className="w-full bg-[#0A102E] border border-[#223263] focus:border-[#FFD467] rounded-full pl-8 pr-3 py-1.5 text-xs text-[#FFF7E3] placeholder-[#6377AA] outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid of Achievement Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAchievements.map((ach) => {
          const isReadyToClaim = ach.isUnlocked && !ach.isClaimed;

          return (
            <div
              key={ach.id}
              id={`achievement-card-${ach.id}`}
              className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-3 ${
                ach.isUnlocked
                  ? 'bg-[#151F45] border-[#FFD467]/40 shadow-lg'
                  : 'bg-[#0C1433] border-[#223263]/70 opacity-90'
              }`}
            >
              {/* Top Row: Badge Icon + Info + Status */}
              <div className="flex items-start gap-3.5">
                {/* Small Badge Icon with Top-Left Bevel Recipe */}
                <div className="relative shrink-0">
                  <div
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl transition-all shadow-md ${
                      ach.isUnlocked
                        ? 'border-t-2 border-l-2 border-white/40 border-b-2 border-r-2 border-black/40'
                        : 'border-t-2 border-l-2 border-[#293A70] border-b-2 border-r-2 border-black/60 bg-[#0E1638]'
                    }`}
                    style={{
                      backgroundColor: ach.isUnlocked ? ach.badgeColor : '#101A38'
                    }}
                    title={`${ach.title} badge`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {renderBadgeIcon(ach.badgeIcon, ach.badgeColor, ach.isUnlocked)}
                      <span className="text-[11px] leading-none mt-0.5">{ach.badgeEmoji}</span>
                    </div>
                  </div>

                  {/* Corner Status Pill */}
                  {ach.isUnlocked ? (
                    <div
                      className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-[#121A3B] shadow"
                      title="Unlocked"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div
                      className="absolute -bottom-1 -right-1 bg-[#182453] text-[#9CB3E6] rounded-full p-0.5 border border-[#223263] shadow"
                      title="Locked"
                    >
                      <Lock className="w-3 h-3 text-[#9CB3E6]" />
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-sm sm:text-base font-black text-[#FFF7E3] truncate">
                      {ach.title}
                    </h3>
                    <span
                      className={`text-[10px] font-heading font-black px-2 py-0.5 rounded-full shrink-0 ${
                        ach.isUnlocked
                          ? 'bg-amber-400/20 text-[#FFD467] border border-amber-400/40'
                          : 'bg-[#182453] text-[#9CB3E6] border border-[#253258]'
                      }`}
                    >
                      {ach.isUnlocked ? 'UNLOCKED' : `${Math.min(ach.current, ach.target)}/${ach.target}`}
                    </span>
                  </div>

                  <p className="text-xs text-[#9CB3E6] mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Progress Bar & Claim Button */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1C2955]">
                {/* Visual Progress Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-[#9CB3E6]">
                      Progress: <strong className="text-[#FFF7E3]">{Math.min(ach.current, ach.target)}</strong> / {ach.target}
                    </span>
                    <span className="text-[#5EC3FF] font-bold">{ach.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0A102E] rounded-full overflow-hidden border border-[#1E294E] shadow-inner p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-300 border-t border-l border-white/30"
                      style={{
                        width: `${ach.progressPercent}%`,
                        backgroundColor: ach.isUnlocked ? '#7CE04A' : ach.badgeColor
                      }}
                    />
                  </div>
                </div>

                {/* Claim / Reward Pill */}
                <div className="shrink-0">
                  {isReadyToClaim ? (
                    <button
                      id={`claim-reward-${ach.id}`}
                      onClick={() => {
                        sound.playFanfare();
                        onClaimReward(ach.id, ach.reward);
                      }}
                      className="px-3 py-1.5 rounded-full btn-chunky-green text-[#FFF7E3] text-xs font-heading font-black flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                      title={`Claim +${ach.reward.coins} Coins & +${ach.reward.gems} Gems`}
                    >
                      <Gift className="w-3.5 h-3.5 text-white animate-bounce" />
                      <span>+{ach.reward.coins}¢ +{ach.reward.gems}💎</span>
                    </button>
                  ) : ach.isClaimed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-heading font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Claimed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A102E] text-[#9CB3E6] border border-[#223263] text-[10px] font-heading">
                      <span>Reward: +{ach.reward.coins}¢</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAchievements.length === 0 && (
          <div className="col-span-full py-8 text-center bg-[#0A102E] rounded-2xl border border-[#223263]">
            <p className="text-xs text-[#9CB3E6]">
              No achievements found matching your current filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
