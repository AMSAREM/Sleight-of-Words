import { SeamsPuzzle, SplitsPuzzle, CharadesPuzzle, HangmanPuzzle, Puzzle } from '../types';

export const SEAMS_PUZZLES: SeamsPuzzle[] = [
  {
    id: "seams_0001",
    mode: "seams",
    difficulty: 1,
    sentence: "The crab earned a shiny medal.",
    answer: "BEAR",
    accepted_answers: ["BEAR"],
    explanation: "The letters run from the end of “crab” into the start of “earned”.",
    tags: ["animal", "4-letter"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    seams: { word_index_a: 1, word_index_b: 2, split_at: 1, hidden_extras: [] }
  },
  {
    id: "seams_0002",
    mode: "seams",
    difficulty: 1,
    sentence: "The ship landed at dawn.",
    answer: "PLAN",
    accepted_answers: ["PLAN"],
    explanation: "The last letter of “ship” joins the start of “landed”.",
    tags: ["4-letter"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    seams: { word_index_a: 1, word_index_b: 2, split_at: 1, hidden_extras: [] }
  },
  {
    id: "seams_0003",
    mode: "seams",
    difficulty: 2,
    sentence: "We wash airy curtains weekly.",
    answer: "HAIR",
    accepted_answers: ["HAIR"],
    explanation: "The last letter of “wash” joins the start of “airy”.",
    tags: ["body", "4-letter"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    seams: { word_index_a: 1, word_index_b: 2, split_at: 1, hidden_extras: [] }
  },
  {
    id: "seams_0004",
    mode: "seams",
    difficulty: 2,
    sentence: "The wise owl ate berries at dusk.",
    answer: "LATE",
    accepted_answers: ["LATE"],
    explanation: "The last letter of “owl” joins the beginning of “ate”.",
    tags: ["time", "4-letter"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    seams: { word_index_a: 2, word_index_b: 3, split_at: 1, hidden_extras: [] }
  },
  {
    id: "seams_0005",
    mode: "seams",
    difficulty: 3,
    sentence: "She enjoyed fast art projects.",
    answer: "STAR",
    accepted_answers: ["STAR"],
    explanation: "The end of “fast” links with the start of “art”.",
    tags: ["celestial", "4-letter"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    seams: { word_index_a: 2, word_index_b: 3, split_at: 2, hidden_extras: [] }
  }
];

export const SPLITS_PUZZLES: SplitsPuzzle[] = [
  {
    id: "splits_0001",
    mode: "splits",
    difficulty: 2,
    sentence: "The children adored the carpet.",
    answer: "CAR PET",
    accepted_answers: ["CAR PET"],
    explanation: "Add a space after “car” and the floor covering becomes a “car pet”.",
    tags: ["household"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    splits: {
      word_index: 4,
      original_word: "carpet",
      split_positions: [3],
      accepted_splits: [["car", "pet"]],
      altered_sentence: "The children adored the car pet.",
      meaning_changed: true,
      decoys: {}
    }
  },
  {
    id: "splits_0002",
    mode: "splits",
    difficulty: 2,
    sentence: "The camper looked intent.",
    answer: "IN TENT",
    accepted_answers: ["IN TENT"],
    explanation: "“Intent” becomes “in tent”: the camper is no longer focused, just inside the tent.",
    tags: ["outdoors"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    splits: {
      word_index: 3,
      original_word: "intent",
      split_positions: [2],
      accepted_splits: [["in", "tent"]],
      altered_sentence: "The camper looked in tent.",
      meaning_changed: true,
      decoys: {}
    }
  },
  {
    id: "splits_0003",
    mode: "splits",
    difficulty: 3,
    sentence: "After a long search, the keys were nowhere.",
    answer: "NOW HERE",
    accepted_answers: ["NOW HERE"],
    explanation: "“Nowhere” becomes “now here”: the keys go from lost to found.",
    tags: ["everyday"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    splits: {
      word_index: 7,
      original_word: "nowhere",
      split_positions: [3],
      accepted_splits: [["now", "here"]],
      altered_sentence: "After a long search, the keys were now here.",
      meaning_changed: true,
      decoys: { "2": "That reads the same as before. Try a space that changes the meaning." }
    }
  },
  {
    id: "splits_0004",
    mode: "splits",
    difficulty: 2,
    sentence: "He placed a teapot on the counter.",
    answer: "TEA POT",
    accepted_answers: ["TEA POT"],
    explanation: "“Teapot” separates into “tea pot”, two distinct everyday words.",
    tags: ["kitchen"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    splits: {
      word_index: 3,
      original_word: "teapot",
      split_positions: [3],
      accepted_splits: [["tea", "pot"]],
      altered_sentence: "He placed a tea pot on the counter.",
      meaning_changed: true,
      decoys: { "2": "“te” is not an accepted standard word." }
    }
  },
  {
    id: "splits_0005",
    mode: "splits",
    difficulty: 3,
    sentence: "The runner completed a tough workout.",
    answer: "WORK OUT",
    accepted_answers: ["WORK OUT"],
    explanation: "The noun “workout” splits into the verb phrase “work out”.",
    tags: ["fitness"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    splits: {
      word_index: 5,
      original_word: "workout",
      split_positions: [4],
      accepted_splits: [["work", "out"]],
      altered_sentence: "The runner completed a tough work out.",
      meaning_changed: true,
      decoys: { "2": "“wo” and “rkout” are not complete words." }
    }
  }
];

export const CHARADES_PUZZLES: CharadesPuzzle[] = [
  {
    id: "charades_0001",
    mode: "charades",
    difficulty: 1,
    answer: "CARROT",
    accepted_answers: ["CARROT"],
    explanation: "CAR plus ROT builds CARROT.",
    tags: ["food"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    charades: {
      parts: [
        { clue: "A vehicle", answers: ["CAR"] },
        { clue: "To decay", answers: ["ROT"] }
      ],
      whole: { word: "CARROT", clue: "A rabbit’s favorite orange vegetable" }
    }
  },
  {
    id: "charades_0002",
    mode: "charades",
    difficulty: 2,
    answer: "ANTHEM",
    accepted_answers: ["ANTHEM"],
    explanation: "ANT plus HEM builds ANTHEM.",
    tags: ["music"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    charades: {
      parts: [
        { clue: "A tiny colony insect", answers: ["ANT"] },
        { clue: "The edge of a dress", answers: ["HEM"] }
      ],
      whole: { word: "ANTHEM", clue: "A national song" }
    }
  },
  {
    id: "charades_0003",
    mode: "charades",
    difficulty: 3,
    answer: "CATALOG",
    accepted_answers: ["CATALOG"],
    explanation: "CAT plus A plus LOG builds CATALOG.",
    tags: ["shopping"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    charades: {
      parts: [
        { clue: "A purring pet", answers: ["CAT"] },
        { clue: "An indefinite article", answers: ["A"] },
        { clue: "A chunk of firewood", answers: ["LOG"] }
      ],
      whole: { word: "CATALOG", clue: "A list of products for sale" }
    }
  },
  {
    id: "charades_0004",
    mode: "charades",
    difficulty: 2,
    answer: "PANCAKE",
    accepted_answers: ["PANCAKE"],
    explanation: "PAN plus CAKE builds PANCAKE.",
    tags: ["breakfast"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    charades: {
      parts: [
        { clue: "A shallow cooking vessel", answers: ["PAN"] },
        { clue: "A sweet baked birthday dessert", answers: ["CAKE"] }
      ],
      whole: { word: "PANCAKE", clue: "A flat breakfast treat served with syrup" }
    }
  },
  {
    id: "charades_0005",
    mode: "charades",
    difficulty: 3,
    answer: "SUNFLOWER",
    accepted_answers: ["SUNFLOWER"],
    explanation: "SUN plus FLOWER builds SUNFLOWER.",
    tags: ["nature"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    charades: {
      parts: [
        { clue: "The bright daytime star", answers: ["SUN"] },
        { clue: "A blooming garden blossom", answers: ["FLOWER"] }
      ],
      whole: { word: "SUNFLOWER", clue: "A tall golden plant that faces the daylight" }
    }
  }
];

export const HANGMAN_PUZZLES: HangmanPuzzle[] = [
  {
    id: "hangman_0001",
    mode: "hangman",
    difficulty: 1,
    answer: "ABRACADABRA",
    accepted_answers: ["ABRACADABRA"],
    explanation: "ABRACADABRA is the classic magical incantation traditionally spoken to manifest an illusion.",
    tags: ["magic", "incantation"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Stage Magic",
      hint: "The ancient incantation spoken by illusionists when performing a vanish.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0002",
    mode: "hangman",
    difficulty: 4,
    answer: "PRESTIDIGITATION",
    accepted_answers: ["PRESTIDIGITATION"],
    explanation: "Prestidigitation derives from the Latin 'presto' (quick) and 'digitus' (finger), denoting manual sleight of hand.",
    tags: ["sleight", "dexterity"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Sleight of Hand",
      hint: "A high-society word literally translating to quick fingers and dexterous trickery.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0003",
    mode: "hangman",
    difficulty: 2,
    answer: "ILLUSIONIST",
    accepted_answers: ["ILLUSIONIST"],
    explanation: "An illusionist orchestrates theatrical phenomena to deceive sensory perception.",
    tags: ["performer", "theatre"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Theatrical Arts",
      hint: "A stage performer who deceives the audience's senses through craft and misdirection.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0004",
    mode: "hangman",
    difficulty: 3,
    answer: "MISDIRECTION",
    accepted_answers: ["MISDIRECTION"],
    explanation: "Misdirection is the psychological cornerstone of sleight of hand, guiding focus away from the secret move.",
    tags: ["technique", "psychology"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Psychology of Magic",
      hint: "The subtle art of drawing the audience's gaze elsewhere while the secret maneuver occurs.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0005",
    mode: "hangman",
    difficulty: 2,
    answer: "LEVITATION",
    accepted_answers: ["LEVITATION"],
    explanation: "Levitation is the classic grand stage illusion in which a person or object appears to float effortlessly in space.",
    tags: ["illusion", "flying"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Stage Marvels",
      hint: "The impossible feat of floating unsupported in mid-air above the parlor stage floor.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0006",
    mode: "hangman",
    difficulty: 2,
    answer: "TELEPATHY",
    accepted_answers: ["TELEPATHY"],
    explanation: "Telepathy is mind-to-mind communication, a frequent theme in Victorian mentalism demonstrations.",
    tags: ["mentalism", "mind"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Mentalism",
      hint: "The apparent transmission of thoughts or secret messages without spoken words or signs.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0007",
    mode: "hangman",
    difficulty: 2,
    answer: "TALISMAN",
    accepted_answers: ["TALISMAN"],
    explanation: "A talisman is an enchanted object consecrated to channel luck, protection, or mystical virtues.",
    tags: ["artifact", "amulet"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Occult Lore",
      hint: "An inscribed amulet or gemstone believed to harbor magical power and ward off misfortune.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0008",
    mode: "hangman",
    difficulty: 3,
    answer: "CHICANERY",
    accepted_answers: ["CHICANERY"],
    explanation: "Chicanery signifies subtle artifice and clever deception, beloved by cunning parlor conjurers.",
    tags: ["trickery", "vocabulary"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Deception & Guile",
      hint: "Clever trickery, deception by subterfuge, or sharp linguistic maneuvering.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0009",
    mode: "hangman",
    difficulty: 3,
    answer: "APPARITION",
    accepted_answers: ["APPARITION"],
    explanation: "An apparition is a ghostly appearance or projection, famously simulated in Victorian pepper's ghost illusions.",
    tags: ["phantom", "ghost"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Séance & Phantoms",
      hint: "A spectral figure or ghostly optical illusion summoned inside the Victorian dark chamber.",
      max_strikes: 6
    }
  },
  {
    id: "hangman_0010",
    mode: "hangman",
    difficulty: 1,
    answer: "HOUDINI",
    accepted_answers: ["HOUDINI"],
    explanation: "Harry Houdini was the world's most famous escapologist, famed for defying shackles and impossible constraints.",
    tags: ["legend", "escapology"],
    status: "live",
    reviewed_by: "Author",
    daily_date: null,
    hangman: {
      category: "Master Escapologists",
      hint: "The surname of the legendary escapologist renowned for breaking free from chains, milk cans, and gallows.",
      max_strikes: 6
    }
  }
];

export const DAILY_TRICKS: Puzzle[] = [
  SEAMS_PUZZLES[0],
  SPLITS_PUZZLES[0],
  CHARADES_PUZZLES[0],
  HANGMAN_PUZZLES[0],
  SEAMS_PUZZLES[1],
  SPLITS_PUZZLES[1]
];

export const ALL_PUZZLES: Record<string, Puzzle[]> = {
  seams: SEAMS_PUZZLES,
  splits: SPLITS_PUZZLES,
  charades: CHARADES_PUZZLES,
  hangman: HANGMAN_PUZZLES
};
