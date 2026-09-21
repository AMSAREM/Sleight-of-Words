export type GameMode = 'seams' | 'splits' | 'charades' | 'hangman';

export type PuzzleStatus = 'draft' | 'reviewed' | 'live' | 'retired';

export interface BasePuzzle {
  id: string;
  mode: GameMode;
  difficulty: number; // 1 to 5
  sentence?: string;
  answer: string;
  accepted_answers: string[];
  explanation: string;
  tags: string[];
  status: PuzzleStatus;
  reviewed_by: string | null;
  daily_date: string | null;
}

export interface SeamsPayload {
  word_index_a: number;
  word_index_b: number;
  split_at: number;
  hidden_extras?: string[];
}

export interface SeamsPuzzle extends BasePuzzle {
  mode: 'seams';
  sentence: string;
  seams: SeamsPayload;
}

export interface SplitsPayload {
  word_index: number;
  original_word: string;
  split_positions: number[];
  accepted_splits: [string, string][];
  altered_sentence: string;
  meaning_changed: boolean;
  decoys?: Record<string, string>;
}

export interface SplitsPuzzle extends BasePuzzle {
  mode: 'splits';
  sentence: string;
  splits: SplitsPayload;
}

export interface CharadePart {
  clue: string;
  answers: string[];
}

export interface CharadesPayload {
  parts: CharadePart[];
  whole: {
    word: string;
    clue: string;
  };
}

export interface CharadesPuzzle extends BasePuzzle {
  mode: 'charades';
  charades: CharadesPayload;
}

export interface HangmanPayload {
  category: string;
  hint: string;
  max_strikes?: number;
}

export interface HangmanPuzzle extends BasePuzzle {
  mode: 'hangman';
  hangman: HangmanPayload;
}

export type Puzzle = SeamsPuzzle | SplitsPuzzle | CharadesPuzzle | HangmanPuzzle;

export type ActiveView = 'launch' | 'home' | 'game' | 'map' | 'multiplayer';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  title: string;
  createdAt: string;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  currentGuess?: string;
  solved: boolean;
  solveTimeSeconds?: number;
  isAi?: boolean;
}

export interface MultiplayerRound {
  roundNumber: number;
  puzzle: Puzzle;
  player1State: {
    solved: boolean;
    solveTimeSeconds: number;
    scoreEarned: number;
  };
  player2State: {
    solved: boolean;
    solveTimeSeconds: number;
    scoreEarned: number;
  };
}

export interface PlayerStats {
  coins: number;
  gems: number;
  hearts: number; // 0 to 3
  levelProgress: Record<string, {
    stars: number; // 0 to 3
    solved: boolean;
    hintsUsed: number;
    wrongGuesses: number;
  }>;
  dailyProgress: {
    date: string;
    completedIds: string[];
    chestClaimed: boolean;
  };
  multiplayerStats?: {
    wins: number;
    losses: number;
    draws: number;
    totalMatches: number;
  };
}
