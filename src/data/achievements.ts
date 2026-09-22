import { AchievementDefinition, AchievementProgress, PlayerStats } from '../types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'streak_10_in_row',
    title: 'Unbroken Focus',
    description: 'Solve 10 word puzzles in a row without losing all your hearts.',
    category: 'streak',
    target: 10,
    badgeEmoji: '🔥',
    badgeIcon: 'flame',
    badgeColor: '#F58A12',
    reward: { coins: 50, gems: 15 }
  },
  {
    id: 'zero_hints_single',
    title: 'Keen Intuition',
    description: 'Solve a puzzle with pristine focus using exactly 0 hints.',
    category: 'mastery',
    target: 1,
    badgeEmoji: '👁️',
    badgeIcon: 'eye',
    badgeColor: '#5EC3FF',
    reward: { coins: 20, gems: 5 }
  },
  {
    id: 'zero_hints_master',
    title: 'Pure Sight',
    description: 'Solve 5 puzzles without requesting a single hint.',
    category: 'mastery',
    target: 5,
    badgeEmoji: '🔮',
    badgeIcon: 'sparkles',
    badgeColor: '#7CE04A',
    reward: { coins: 40, gems: 10 }
  },
  {
    id: 'unlock_all_modes',
    title: 'Master of All Arts',
    description: 'Unlock all 4 illusion game modes on the Adventure Map.',
    category: 'modes',
    target: 4,
    badgeEmoji: '🗝️',
    badgeIcon: 'layers',
    badgeColor: '#8B5CF6',
    reward: { coins: 60, gems: 20 }
  },
  {
    id: 'first_trick',
    title: 'Apprentice Sleight',
    description: 'Solve your very first word illusion in any mode.',
    category: 'mastery',
    target: 1,
    badgeEmoji: '🪄',
    badgeIcon: 'sparkles',
    badgeColor: '#FFD467',
    reward: { coins: 20, gems: 5 }
  },
  {
    id: 'three_stars_5',
    title: 'Flawless Conjurer',
    description: 'Attain a perfect 3-star rating on 5 different puzzles.',
    category: 'mastery',
    target: 5,
    badgeEmoji: '⭐',
    badgeIcon: 'star',
    badgeColor: '#FFD467',
    reward: { coins: 50, gems: 15 }
  },
  {
    id: 'total_stars_30',
    title: 'Starlight Sovereign',
    description: 'Accumulate 30 total stars across worlds.',
    category: 'mastery',
    target: 30,
    badgeEmoji: '👑',
    badgeIcon: 'crown',
    badgeColor: '#F58A12',
    reward: { coins: 80, gems: 25 }
  },
  {
    id: 'seams_adept',
    title: 'Seamstitcher',
    description: 'Solve 5 hidden word puzzles in Carnival Seams mode.',
    category: 'modes',
    target: 5,
    badgeEmoji: '🎪',
    badgeIcon: 'sparkles',
    badgeColor: '#8B5CF6',
    reward: { coins: 30, gems: 10 }
  },
  {
    id: 'splits_adept',
    title: 'Space Alchemist',
    description: 'Transmute 5 sentences by splitting a word in Split Alley.',
    category: 'modes',
    target: 5,
    badgeEmoji: '✂️',
    badgeIcon: 'split',
    badgeColor: '#FF8A1F',
    reward: { coins: 30, gems: 10 }
  },
  {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    description: 'Solve 5 Daily Trick challenges across your journey.',
    category: 'special',
    target: 5,
    badgeEmoji: '📅',
    badgeIcon: 'calendar',
    badgeColor: '#27C2E8',
    reward: { coins: 40, gems: 10 }
  },
  {
    id: 'duelist_triumph',
    title: 'Parlor Champion',
    description: 'Win 3 duels against rivals in the Multiplayer Arena.',
    category: 'special',
    target: 3,
    badgeEmoji: '⚔️',
    badgeIcon: 'swords',
    badgeColor: '#E7364B',
    reward: { coins: 40, gems: 10 }
  },
  {
    id: 'coin_hoarder',
    title: 'Grand Treasurer',
    description: 'Amass 100 gold coins from your illusion triumphs.',
    category: 'special',
    target: 100,
    badgeEmoji: '🪙',
    badgeIcon: 'coins',
    badgeColor: '#FFD467',
    reward: { coins: 50, gems: 15 }
  }
];

export const calculateAchievementsProgress = (stats: PlayerStats): AchievementProgress[] => {
  const levelEntries = Object.entries(stats.levelProgress || {});
  
  // Total stars
  const totalStars = levelEntries.reduce((sum, [, p]) => sum + (p.stars || 0), 0);
  
  // Total solved
  const solvedCount = levelEntries.filter(([, p]) => p.solved).length;
  
  // 3-star clears
  const threeStarCount = levelEntries.filter(([, p]) => p.stars === 3).length;
  
  // Solved with 0 hints used
  const zeroHintCount = levelEntries.filter(([, p]) => p.solved && (!p.hintsUsed || p.hintsUsed === 0)).length;
  
  // Consecutive solves: track live streak or max attained
  const maxConsecutive = Math.max(
    stats.maxConsecutiveSolves || 0,
    stats.consecutiveSolves || 0,
    // Baseline fallback if player had already solved puzzles
    solvedCount >= 10 ? 10 : solvedCount
  );

  // Modes unlocked based on AdventureMap star requirements:
  // Seams: 0 stars (always unlocked)
  // Splits: 6 stars
  // Hangman: 10 stars
  // Charades: 15 stars
  const modesUnlocked = 1 + 
    (totalStars >= 6 ? 1 : 0) + 
    (totalStars >= 10 ? 1 : 0) + 
    (totalStars >= 15 ? 1 : 0);

  // Mode specific solve counts
  const seamsCount = levelEntries.filter(([id, p]) => id.startsWith('seams') && p.solved).length;
  const splitsCount = levelEntries.filter(([id, p]) => id.startsWith('splits') && p.solved).length;

  // Daily tricks solved
  const dailyTricksCount = stats.dailyProgress?.completedIds?.length || 0;

  // Multiplayer wins
  const multiplayerWins = stats.multiplayerStats?.wins || 0;

  const claimedIds = new Set(stats.claimedAchievementIds || []);

  return ACHIEVEMENTS.map((ach) => {
    let current = 0;

    switch (ach.id) {
      case 'streak_10_in_row':
        current = maxConsecutive;
        break;
      case 'zero_hints_single':
      case 'zero_hints_master':
        current = zeroHintCount;
        break;
      case 'unlock_all_modes':
        current = modesUnlocked;
        break;
      case 'first_trick':
        current = solvedCount;
        break;
      case 'three_stars_5':
        current = threeStarCount;
        break;
      case 'total_stars_30':
        current = totalStars;
        break;
      case 'seams_adept':
        current = seamsCount;
        break;
      case 'splits_adept':
        current = splitsCount;
        break;
      case 'daily_devotee':
        current = dailyTricksCount;
        break;
      case 'duelist_triumph':
        current = multiplayerWins;
        break;
      case 'coin_hoarder':
        current = stats.coins || 0;
        break;
      default:
        current = 0;
    }

    const isUnlocked = current >= ach.target;
    const isClaimed = claimedIds.has(ach.id);
    const progressPercent = Math.min(100, Math.round((Math.min(current, ach.target) / ach.target) * 100));

    return {
      ...ach,
      current,
      isUnlocked,
      isClaimed,
      progressPercent
    };
  });
};
