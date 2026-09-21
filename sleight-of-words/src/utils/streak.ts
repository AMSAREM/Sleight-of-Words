// Daily streak tracking utility with local storage persistence
export interface DailyStreakData {
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string; // "YYYY-MM-DD"
  totalDaysSolved: number;
  history: string[]; // List of YYYY-MM-DD dates solved
  hasSolvedToday: boolean;
}

export const STREAK_STORAGE_KEY = 'sleight_of_words_daily_streak_v1';

export const getLocalDateString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDaysBetweenDates = (dateStrA: string, dateStrB: string): number => {
  if (!dateStrA || !dateStrB) return 9999;
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
};

export const loadDailyStreak = (): DailyStreakData => {
  const today = getLocalDateString();
  const defaultStreak: DailyStreakData = {
    currentStreak: 0,
    bestStreak: 0,
    lastSolvedDate: '',
    totalDaysSolved: 0,
    history: [],
    hasSolvedToday: false
  };

  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      return defaultStreak;
    }

    const parsed = JSON.parse(raw);
    const lastSolved = parsed.lastSolvedDate || '';
    const diff = lastSolved ? getDaysBetweenDates(lastSolved, today) : 9999;

    let currentStreak = Number(parsed.currentStreak) || 0;
    const bestStreak = Number(parsed.bestStreak) || 0;
    const history: string[] = Array.isArray(parsed.history) ? parsed.history : [];
    const totalDaysSolved = Number(parsed.totalDaysSolved) || history.length || 0;

    const hasSolvedToday = diff === 0;

    // If more than 1 day has elapsed since last solve, the streak has lapsed
    if (diff > 1) {
      currentStreak = 0;
      // Persist the reset streak
      localStorage.setItem(
        STREAK_STORAGE_KEY,
        JSON.stringify({
          currentStreak: 0,
          bestStreak,
          lastSolvedDate: lastSolved,
          totalDaysSolved,
          history
        })
      );
    }

    return {
      currentStreak,
      bestStreak,
      lastSolvedDate: lastSolved,
      totalDaysSolved,
      history,
      hasSolvedToday
    };
  } catch {
    return defaultStreak;
  }
};

/**
 * Call this whenever a player solves ANY puzzle (Seams, Splits, Charades, Daily, or Duel).
 * Increments streak if this is the first solve of a new day.
 */
export const recordPuzzleSolveForStreak = (): {
  streak: DailyStreakData;
  isNewDaySolve: boolean;
} => {
  const today = getLocalDateString();
  const current = loadDailyStreak();

  // Already solved today? No need to advance streak again today
  if (current.lastSolvedDate === today) {
    return {
      streak: { ...current, hasSolvedToday: true },
      isNewDaySolve: false
    };
  }

  const diff = current.lastSolvedDate
    ? getDaysBetweenDates(current.lastSolvedDate, today)
    : 9999;

  let newCurrentStreak = 1;
  if (diff === 1) {
    // Solved yesterday! Streak continues!
    newCurrentStreak = current.currentStreak + 1;
  } else {
    // Starting a new streak
    newCurrentStreak = 1;
  }

  const newBestStreak = Math.max(current.bestStreak, newCurrentStreak);
  const newHistory = current.history.includes(today)
    ? current.history
    : [...current.history, today];
  const newTotalDays = current.totalDaysSolved + 1;

  const updated: DailyStreakData = {
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    lastSolvedDate: today,
    totalDaysSolved: newTotalDays,
    history: newHistory,
    hasSolvedToday: true
  };

  try {
    localStorage.setItem(
      STREAK_STORAGE_KEY,
      JSON.stringify({
        currentStreak: updated.currentStreak,
        bestStreak: updated.bestStreak,
        lastSolvedDate: updated.lastSolvedDate,
        totalDaysSolved: updated.totalDaysSolved,
        history: updated.history
      })
    );
  } catch {
    // ignore
  }

  return {
    streak: updated,
    isNewDaySolve: true
  };
};

export interface WeekDayStatus {
  dayLabel: string;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  isSolved: boolean;
}

/**
 * Returns the 7 days of the current week (Mon-Sun) to render a visual streak week progress bar.
 */
export const getCurrentWeekStreakStatus = (streak: DailyStreakData): WeekDayStatus[] => {
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ...
  
  // Calculate Monday of this week
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days: WeekDayStatus[] = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getLocalDateString(d);
    const diff = getDaysBetweenDates(dateStr, todayStr);

    days.push({
      dayLabel: dayNames[i],
      dateStr,
      isToday: dateStr === todayStr,
      isPast: diff > 0,
      isSolved: streak.history.includes(dateStr)
    });
  }

  return days;
};
