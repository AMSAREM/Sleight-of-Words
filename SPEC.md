# Sleight of Word: Project Spec

Single source of truth for the game. Paste sections of this file into any AI tool (Google AI Studio, Claude) instead of re-explaining the game. If this file and a chat disagree, this file wins. Change the file first, then the code.

## 1. What the game is

A mobile word game. Each level shows one sentence (or a set of clues) that hides a trick. The player finds the hidden answer. Three modes:

| Mode | Player sees | Player does | Answer |
|---|---|---|---|
| **Seams** | A sentence | Types the word hidden across the gap between two neighboring words | 3-6 letters |
| **Splits** | A sentence | Taps a word, then taps a gap to add one space so the sentence means something new | Two words, e.g. CAR PET |
| **Charades** | 2-3 clues | Solves each small word; together they build one big word | The whole word |

Tone: friendly, casual, bright. Sentences should read like natural English, never like filler made to hide a word.

## 2. Puzzle rules

### Seams
- Answer is a common English word, 3-6 letters.
- Its letters run consecutively across the end of one word and the start of the **next** word (ignoring spaces and punctuation). It crosses exactly one word boundary.
- The answer must not sit fully inside a single word.
- Avoid sentences that hide other common words of 4+ letters across boundaries (extras confuse players). If an extra is unavoidable, add it to `accepted_answers`.

### Splits
- One word in the sentence, split by a single space, becomes two real words.
- The altered sentence must make sense **and mean something different** from the original. "inland" vs "in land" fails this test.
- Only one space. Both parts must be real words.
- Optional `decoys` give custom feedback when a player picks a plausible wrong gap.

### Charades
- 2-3 small words combine, in order, into a larger word.
- Each part has a short clue. The whole word has its own clue.
- Clues must not contain the word they clue.
- If a part has several valid answers, every option must still rebuild the whole word (or be listed only if it does).

## 3. Data schema

Puzzles live in `puzzles/seams.json`, `puzzles/splits.json`, `puzzles/charades.json`. Each file is a JSON array.

### Base fields (all modes)
```json
{
  "id": "seams_0001",
  "mode": "seams",
  "difficulty": 1,
  "sentence": "The crab earned a shiny medal.",
  "answer": "BEAR",
  "accepted_answers": ["BEAR"],
  "explanation": "The letters run from the end of “crab” into the start of “earned”.",
  "tags": ["animal", "4-letter"],
  "status": "draft",
  "reviewed_by": null,
  "daily_date": null
}
```
- `id`: unique across all files. Format `<mode>_<4 digits>`.
- `difficulty`: integer 1-5. Hand-set at first, recomputed from play data after launch.
- `explanation`: exactly one sentence. Shown as the last hint and on the result screen.
- `status`: `draft`, `reviewed`, `live`, `retired`. `reviewed` and `live` require `reviewed_by`.
- `daily_date`: `YYYY-MM-DD` or `null`.
- `sentence` is required for Seams and Splits, optional for Charades.

### Seams payload
```json
"seams": {
  "word_index_a": 1,
  "word_index_b": 2,
  "split_at": 1,
  "hidden_extras": []
}
```
- Indexes are 0-based positions in `sentence.split(" ")`.
- `split_at`: how many letters of the answer come from the first word.
- `hidden_extras`: extra hidden words an author has checked and accepted as harmless.

### Splits payload
```json
"splits": {
  "word_index": 4,
  "original_word": "carpet",
  "split_positions": [3],
  "accepted_splits": [["car", "pet"]],
  "altered_sentence": "The children adored the car pet.",
  "meaning_changed": true,
  "decoys": {}
}
```
- `answer` is the first accepted split, uppercase, with a space: `CAR PET`.
- `split_positions` and `accepted_splits` are parallel lists.
- `meaning_changed` is a human decision. It must be `true` before a puzzle can be `reviewed` or `live`.
- `decoys`: map of cut position to feedback text, e.g. `{"2": "That reads the same as before."}`.

### Charades payload
```json
"charades": {
  "parts": [
    { "clue": "A vehicle", "answers": ["CAR"] },
    { "clue": "To decay", "answers": ["ROT"] }
  ],
  "whole": { "word": "CARROT", "clue": "A rabbit’s favorite orange vegetable" }
}
```
- `answer` equals `whole.word`.

## 4. Validation

Run `node scripts/validate.js` (also runs automatically on every push via GitHub Actions). It checks everything above that a machine can check. Add `--strict` to treat warnings as errors.

Optional word lists (one lowercase word per line):
- `scripts/wordlist.txt`: common English words. Enables the "is a real word" and hidden-extras checks.
- `scripts/blocklist.txt`: words that must never appear in a puzzle.

What the validator **cannot** check, so a human must:
- The sentence reads naturally.
- The Splits meaning genuinely changes.
- The puzzle is fun and the difficulty feels right.

Release gate for `live`: passes validator, human-reviewed, and played by at least a few real people with a solve rate between 30% and 80%.

## 5. Gameplay rules (from the prototype)

- **Focus:** 3 hearts per level. A wrong Lock in costs one. At zero the level fails and the answer is revealed.
- **Stars:** `max(1, 3 - hintsUsed - wrongGuesses)` on success, 0 on fail. Best result is kept.
- **Hints:** up to 3 per level, each costs one star.
  - Seams: 1) highlight the two words, 2) fill the first letter, 3) show the explanation.
  - Splits: 1) glow the target word, 2) open it for splitting, 3) show the explanation.
  - Charades: 1) first letter of the current part, 2) first letter of every open part, 3) fill in the current part.
- **Rewards:** 10 coins per star, plus 5 gems for a 3-star clear.
- **Skip it:** costs 20 gems. Not available in the Daily Trick.
- **Daily Trick:** 5 tricks per day, each clears part of a picture. Clearing all opens a chest (50 gems). Resets at local midnight.

## 6. Visual system (locked — no AI slop)

Reference images: "Cube Mania" logo (bevel/lighting model) and the Word Lanes screen pack
(card shapes, color-per-action, painterly backgrounds). Every generated asset must follow
this system. Reject anything that breaks a rule below rather than adjusting the rule to
fit the output.

**1. Light source:** top-left, always. Every bevel, highlight, and drop shadow in every
asset must agree with this. Never mix a top-left highlight on one element with a
top-right highlight on another.

**2. Bevel recipe** (logo letters, buttons, tiles):
- Flat base color
- Thin bright highlight along the top-left edge only
- Thin dark core-shadow line along the bottom-right edge only
- One soft drop shadow beneath, same angle and blur on every element
No extra inner glows, chromatic outlines, or per-element random gradients.

**3. Palette:** 6 colors max, defined once, reused everywhere.
- 1 background color (or a simple illustrated gradient)
- 2 accent colors max per screen (one "go" action color, one currency/reward color)
- 1 neutral card color (cream/off-white, not pure white)
- 1 shadow color (a dark tint of the background, not pure black)
Current picks: water `#27C2E8`, orange `#FFB63B`→`#F58A12`, gold frame `#FFD467`→`#F2A21E`,
navy stage `#182453`, cream paper `#FFF7E3`, green action `#7CE04A`→`#3FB52C`, blue helper
`#5EC3FF`→`#2A8CE0`, alert red `#E7364B`. Mode colors: Seams purple `#8B5CF6`, Splits
orange `#FF8A1F`, Charades multi (purple/orange/green/blue).

**4. Shapes:** one card shape (rounded rectangle, one corner radius everywhere), one
button shape (pill), one icon frame (rounded square or circle). Don't mix corner radii
across similar components.

**5. Backgrounds:** painterly/illustrated scenes with depth (foreground, midground, sky),
never a flat two-stop CSS gradient standing in for art.

**6. Typography:** Lilita One for headlines/numbers/tiles, Nunito (700/800) for body text
and sentences. Never substitute a generic sans-serif for the display font.

**7. Text inside generated images:** image models frequently misspell or garble text.
Never ask an image model to render final logo/button text. Generate background art and
icon/bevel style only, then place real text with CSS/HTML using the bevel recipe above.

**Reject any generated asset that:**
- Uses a different light direction per element
- Adds glassmorphism, neon glows, or a gradient not built from the palette above
- Uses a drop shadow with a different blur/angle than the rest of the set
- Uses more than 2 accent colors on one screen
- Renders text inside the image

### AI Studio prompt template (paste as-is, fill the bracket)
```
Generate a [CARD TYPE: settings panel / shop offer card / level-complete
banner] for a mobile word-puzzle game called "Sleight of Word."
Style: painterly casual-mobile-game illustration, rounded cream card,
[ACCENT COLOR] accent, single top-left light source, thin bevel highlight
+ core shadow + soft drop shadow (no glow, no gradient text).
Background: illustrated [scene], not a flat gradient.
No text rendered in the image — leave clear space for text to be added
separately.
```

### Review checklist before accepting any AI-generated asset
- [ ] Light direction matches every other accepted asset
- [ ] No color outside the 6-color palette
- [ ] Shadow blur/angle matches the rest of the set
- [ ] No rendered text inside the image
- [ ] Background has depth (not a flat two-stop gradient)

Known limits: image models drift back to their own defaults across a session, so
re-paste this instruction set for each new asset batch rather than assuming it carries
over. Consistency across separately-generated assets isn't guaranteed either — plan a
manual normalization pass (matching shadow blur/color) before shipping a batch.

**Accessibility (unchanged):** every button needs an accessible label; never rely on
color alone to carry meaning.

## 7. Content pipeline

1. Generate a batch with an AI tool using the prompt template below.
2. Save output to a branch as JSON in the schema above.
3. Run `node scripts/validate.js`. Fix all errors.
4. Ask a second AI to review naturalness, alternate answers, and (for Splits) whether the meaning really changes.
5. A human sets `meaning_changed`, `status`, and `reviewed_by`.
6. Playtest. Adjust `difficulty` from real results.

### Prompt template (Google AI Studio)

```
You are an expert word-puzzle designer. Generate 20 original puzzles for MODE.
Return ONLY a JSON array that follows the schema below. No commentary.

Rules for MODE: <paste the matching rules from section 2>
Schema: <paste the base fields and the matching payload from section 3>

Constraints:
- Sentences must sound natural and be under 12 words.
- Use "status": "draft" and "reviewed_by": null.
- Do not reuse any of these existing answers: <list>.
- Explanations are exactly one sentence.
- For Splits, only include puzzles where the meaning truly changes.
```

## 8. Repo workflow

- Work on `main` while you are the only contributor. Use branches when someone else joins or when trying something risky.
- Never commit secrets (API keys, database credentials). Use environment variables.
- Puzzle files change often; app code changes rarely. Keep commits small and named for what changed.
- Deploy `main` automatically (Vercel or GitHub Pages) so there is always one current playtest link.

## 9. Known risks and open questions

- Splits are the hardest to author well; expect a low pass rate for generated puzzles.
- Answer ambiguity (synonyms in Charades, extra hidden words in Seams) is the top source of unfair-feeling levels.
- Difficulty is guesswork until real solve-rate data exists.
- The economy (coins, gems) is a placeholder. Decide what they buy before building more of it.
- A steady daily-puzzle supply needs 365+ reviewed puzzles per year.
- Copy-paste between tools invites version drift. The repo is the master copy.
