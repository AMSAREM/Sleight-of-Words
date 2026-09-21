#!/usr/bin/env node
/*
 * Sleight of Word: puzzle validator
 *
 * Usage:
 *   node scripts/validate.js                 validate ../puzzles/*.json
 *   node scripts/validate.js --strict        treat warnings as errors
 *   node scripts/validate.js --dir some/dir  validate a different folder
 *
 * Optional helper files (one lowercase word per line):
 *   scripts/wordlist.txt   common English words (enables real-word + hidden-extras checks)
 *   scripts/blocklist.txt  words that must never appear
 *
 * Exit code is 1 when any error is found, so it can gate a GitHub Action.
 * See SPEC.md for the rules this file enforces.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const dirFlag = args.indexOf('--dir');
const PUZZLE_DIR = dirFlag > -1 && args[dirFlag + 1]
  ? path.resolve(args[dirFlag + 1])
  : path.join(__dirname, '..', 'puzzles');

const MODES = ['seams', 'splits', 'charades'];
const STATUSES = ['draft', 'reviewed', 'live', 'retired'];

function loadList(file) {
  try {
    return new Set(
      fs.readFileSync(file, 'utf8').split(/\r?\n/).map(s => s.trim().toLowerCase()).filter(Boolean)
    );
  } catch (e) {
    return null;
  }
}
const WORDS = loadList(path.join(__dirname, 'wordlist.txt'));
const BLOCK = loadList(path.join(__dirname, 'blocklist.txt'));

/* ---------- small helpers ---------- */
const stripLetters = s => String(s).toLowerCase().replace(/[^a-z]/g, '');
const isUpperWord = s => typeof s === 'string' && /^[A-Z]+$/.test(s);
const nonEmpty = s => typeof s === 'string' && s.trim().length > 0;

/* ---------- checks shared by every mode ---------- */
function checkBase(p, mode, err, warn) {
  if (!nonEmpty(p.id)) err('missing id');
  else if (!new RegExp('^' + mode + '_\\d{4}$').test(p.id)) warn(`id should look like ${mode}_0001`);
  if (p.mode !== mode) err(`mode "${p.mode}" does not match file "${mode}.json"`);
  if (!Number.isInteger(p.difficulty) || p.difficulty < 1 || p.difficulty > 5) err('difficulty must be an integer from 1 to 5');
  if (!STATUSES.includes(p.status)) err(`status must be one of: ${STATUSES.join(', ')}`);
  if ((p.status === 'reviewed' || p.status === 'live') && !nonEmpty(p.reviewed_by)) err('reviewed and live puzzles need reviewed_by');

  if (!nonEmpty(p.explanation) || p.explanation.trim().length < 10) {
    err('explanation is missing or too short');
  } else {
    const enders = (p.explanation.match(/[.!?](?=\s|$)/g) || []).length;
    if (enders > 1 || /\n/.test(p.explanation)) warn('explanation should be exactly one sentence');
  }

  if (!Array.isArray(p.accepted_answers) || !p.accepted_answers.length) {
    err('accepted_answers must be a non-empty array');
  } else {
    if (!p.accepted_answers.includes(p.answer)) err('accepted_answers must include answer');
    p.accepted_answers.forEach(a => {
      if (!/^[A-Z]+( [A-Z]+)*$/.test(a)) err(`accepted answer "${a}" must be uppercase letters`);
    });
  }

  if (mode !== 'charades' && !nonEmpty(p.sentence)) err('sentence is required');
  if (p.daily_date != null && !/^\d{4}-\d{2}-\d{2}$/.test(p.daily_date)) err('daily_date must be YYYY-MM-DD or null');

  if (BLOCK) {
    const text = [p.sentence, p.answer, p.explanation]
      .concat(p.charades && p.charades.parts ? p.charades.parts.map(x => x.clue) : [])
      .filter(Boolean).join(' ').toLowerCase();
    (text.match(/[a-z]+/g) || []).forEach(w => {
      if (BLOCK.has(w)) err(`contains blocked word "${w}"`);
    });
  }
}

/* ---------- Seams ---------- */
function checkSeams(p, err, warn) {
  const ans = p.answer;
  if (!/^[A-Z]{3,6}$/.test(ans || '')) { err('answer must be 3-6 uppercase letters'); return; }
  if (!nonEmpty(p.sentence)) return;
  if (WORDS && !WORDS.has(ans.toLowerCase())) err(`answer "${ans}" is not in the word list`);

  // Flatten the sentence to letters and remember which word each letter belongs to.
  const tokens = p.sentence.split(' ');
  const wordOf = [];
  let flat = '';
  tokens.forEach((t, ti) => {
    for (const ch of t.toLowerCase()) {
      if (/[a-z]/.test(ch)) { flat += ch; wordOf.push(ti); }
    }
  });

  const a = ans.toLowerCase();
  const spans = [];
  for (let i = flat.indexOf(a); i !== -1; i = flat.indexOf(a, i + 1)) {
    const first = wordOf[i], last = wordOf[i + a.length - 1];
    const fromFirst = wordOf.slice(i, i + a.length).filter(t => t === first).length;
    spans.push({ first, last, fromFirst });
  }
  if (!spans.length) { err('answer letters do not appear in the sentence'); return; }

  const crossing = spans.filter(x => x.first !== x.last);
  const inside = spans.filter(x => x.first === x.last);
  const good = crossing.filter(x => x.last - x.first === 1);

  if (!crossing.length) err('answer never spans two words (it sits inside a single word)');
  else if (!good.length) err('answer spans more than two words; it must cross exactly one boundary');
  if (good.length > 1) warn('answer appears across word boundaries more than once');
  if (inside.length) warn('answer also appears inside a single word, which may confuse players');

  // Payload
  const s = p.seams;
  if (!s || typeof s !== 'object') err('missing seams payload');
  else if (good.length) {
    const g = good[0];
    if (s.word_index_a !== g.first || s.word_index_b !== g.last) err(`seams word indexes should be ${g.first} and ${g.last}`);
    if (s.split_at !== g.fromFirst) err(`seams.split_at should be ${g.fromFirst}`);
    if (s.hidden_extras != null && !Array.isArray(s.hidden_extras)) err('seams.hidden_extras must be an array');
  }

  // Hidden extras: other common words of 4-6 letters that also cross a boundary.
  if (WORDS) {
    const accepted = new Set((p.accepted_answers || []).map(x => x.toLowerCase()));
    const known = new Set(((s && s.hidden_extras) || []).map(x => String(x).toLowerCase()));
    for (let len = 4; len <= 6; len++) {
      for (let i = 0; i + len <= flat.length; i++) {
        if (wordOf[i] === wordOf[i + len - 1]) continue;
        const w = flat.slice(i, i + len);
        if (w !== a && WORDS.has(w) && !accepted.has(w) && !known.has(w)) {
          warn(`another word hides here: "${w}" (add it to accepted_answers or hidden_extras, or rewrite)`);
        }
      }
    }
  } else if (!checkSeams.noted) {
    checkSeams.noted = true;
    console.log('  note: scripts/wordlist.txt not found, skipping real-word and hidden-extras checks');
  }
}

/* ---------- Splits ---------- */
function checkSplits(p, err, warn) {
  if (!/^[A-Z]+ [A-Z]+$/.test(p.answer || '')) err('answer must be two uppercase words separated by one space');
  if (!nonEmpty(p.sentence)) return;
  const sp = p.splits;
  if (!sp || typeof sp !== 'object') { err('missing splits payload'); return; }

  const tokens = p.sentence.split(' ');
  const tok = tokens[sp.word_index];
  if (tok === undefined) { err('splits.word_index is out of range'); return; }
  const original = stripLetters(tok);
  if (!nonEmpty(sp.original_word) || sp.original_word.toLowerCase() !== original) {
    err(`splits.original_word must match the sentence word at word_index (found "${original}")`);
  }

  if (!Array.isArray(sp.accepted_splits) || !sp.accepted_splits.length) { err('accepted_splits must be a non-empty array'); return; }
  if (!Array.isArray(sp.split_positions) || sp.split_positions.length !== sp.accepted_splits.length) {
    err('split_positions must be a list the same length as accepted_splits');
  }

  sp.accepted_splits.forEach((parts, i) => {
    if (!Array.isArray(parts) || parts.length !== 2 || parts.some(x => !nonEmpty(x))) {
      err(`accepted_splits[${i}] must be exactly two non-empty strings`);
      return;
    }
    if (parts.join('').toLowerCase() !== original) err(`accepted_splits[${i}] does not rebuild "${original}"`);
    if (Array.isArray(sp.split_positions) && sp.split_positions[i] !== parts[0].length) {
      err(`split_positions[${i}] should be ${parts[0].length}`);
    }
    if (WORDS) parts.forEach(w => { if (!WORDS.has(w.toLowerCase())) warn(`"${w}" is not in the word list`); });
  });

  const first = sp.accepted_splits[0];
  if (Array.isArray(first) && first.length === 2) {
    if (p.answer !== first.join(' ').toUpperCase()) err(`answer should be "${first.join(' ').toUpperCase()}" (the first accepted split)`);
    const altered = tokens.map((t, i) => (i === sp.word_index ? t.replace(/[A-Za-z]+/, first.join(' ')) : t)).join(' ');
    if (!nonEmpty(sp.altered_sentence) || sp.altered_sentence.trim().toLowerCase() !== altered.toLowerCase()) {
      err(`altered_sentence should be: ${altered}`);
    }
  }

  if (sp.meaning_changed !== true) {
    if (p.status === 'reviewed' || p.status === 'live') err('meaning_changed must be true before a puzzle can be reviewed or live');
    else warn('meaning_changed is not true yet (needs a human decision)');
  }

  if (sp.decoys != null) {
    if (typeof sp.decoys !== 'object' || Array.isArray(sp.decoys)) err('splits.decoys must be an object');
    else {
      Object.entries(sp.decoys).forEach(([k, v]) => {
        const pos = Number(k);
        if (!Number.isInteger(pos) || pos < 1 || pos >= original.length) err(`decoy position "${k}" is outside the word`);
        else if ((sp.split_positions || []).includes(pos)) err(`decoy position ${pos} is also an accepted split`);
        if (!nonEmpty(v)) err(`decoy ${k} needs feedback text`);
      });
    }
  }
}

/* ---------- Charades ---------- */
function checkCharades(p, err, warn) {
  const c = p.charades;
  if (!c || typeof c !== 'object') { err('missing charades payload'); return; }
  if (!Array.isArray(c.parts) || c.parts.length < 2 || c.parts.length > 3) { err('charades.parts must have 2 or 3 parts'); return; }

  const whole = c.whole && c.whole.word;
  if (!isUpperWord(whole) || whole.length < 4) { err('whole.word must be 4+ uppercase letters'); return; }
  if (p.answer !== whole) err('answer must equal whole.word');
  if (!nonEmpty(c.whole.clue)) err('whole.clue is required');
  else if (new RegExp('\\b' + whole + '\\b', 'i').test(c.whole.clue)) err('whole.clue contains the answer');
  if (WORDS && !WORDS.has(whole.toLowerCase())) err(`whole word "${whole}" is not in the word list`);

  let partsOk = true;
  c.parts.forEach((pt, i) => {
    if (!nonEmpty(pt.clue)) { err(`part ${i + 1} needs a clue`); partsOk = false; }
    if (!Array.isArray(pt.answers) || !pt.answers.length || !pt.answers.every(isUpperWord)) {
      err(`part ${i + 1} answers must be a non-empty list of uppercase words`);
      partsOk = false;
      return;
    }
    pt.answers.forEach(a => {
      if (a.length > 1 && nonEmpty(pt.clue) && new RegExp('\\b' + a + '\\b', 'i').test(pt.clue)) warn(`part ${i + 1} clue contains its own answer "${a}"`);
      if (a === whole) err(`part ${i + 1} answer equals the whole word`);
      if (WORDS && !WORDS.has(a.toLowerCase())) warn(`part answer "${a}" is not in the word list`);
    });
  });
  if (!partsOk) return;

  // At least one choice of part answers must rebuild the whole word.
  const tuples = c.parts
    .map(pt => pt.answers)
    .reduce((acc, list) => acc.flatMap(t => list.map(x => t.concat(x))), [[]]);
  const good = tuples.filter(t => t.join('') === whole);
  if (!good.length) { err(`no combination of part answers builds ${whole}`); return; }
  c.parts.forEach((pt, i) => {
    pt.answers.forEach(a => {
      if (!good.some(t => t[i] === a)) warn(`part ${i + 1} answer "${a}" cannot build ${whole}`);
    });
  });
}

/* ---------- one puzzle ---------- */
function validate(p, mode) {
  const errors = [], warnings = [];
  const err = m => errors.push(m), warn = m => warnings.push(m);
  if (!p || typeof p !== 'object') return { errors: ['entry is not an object'], warnings };
  try {
    checkBase(p, mode, err, warn);
    if (mode === 'seams') checkSeams(p, err, warn);
    if (mode === 'splits') checkSplits(p, err, warn);
    if (mode === 'charades') checkCharades(p, err, warn);
  } catch (e) {
    err(`validator crashed on this entry: ${e.message}`);
  }
  return { errors, warnings };
}

/* ---------- main ---------- */
let totalErrors = 0, totalWarnings = 0, count = 0;
const seenIds = new Map();
const seenAnswers = new Map();

for (const mode of MODES) {
  const file = path.join(PUZZLE_DIR, `${mode}.json`);
  if (!fs.existsSync(file)) { console.log(`- ${mode}.json not found, skipping`); continue; }

  let list;
  try {
    list = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.log(`✗ ${mode}.json is not valid JSON: ${e.message}`);
    totalErrors++;
    continue;
  }
  if (!Array.isArray(list)) { console.log(`✗ ${mode}.json must contain a JSON array`); totalErrors++; continue; }

  list.forEach((p, idx) => {
    count++;
    const { errors, warnings } = validate(p, mode);
    const id = p && p.id ? p.id : `(entry ${idx})`;

    if (p && p.id) {
      if (seenIds.has(p.id)) errors.push(`duplicate id, also used in ${seenIds.get(p.id)}`);
      else seenIds.set(p.id, `${mode}.json`);
    }
    if (p && p.answer) {
      const key = `${mode}:${p.answer}`;
      if (seenAnswers.has(key)) warnings.push(`answer "${p.answer}" is already used by ${seenAnswers.get(key)}`);
      else seenAnswers.set(key, id);
    }

    if (errors.length || warnings.length) {
      console.log(`${errors.length ? '✗' : '!'} ${mode}.json  ${id}`);
      errors.forEach(m => console.log(`    error: ${m}`));
      warnings.forEach(m => console.log(`    warning: ${m}`));
    }
    totalErrors += errors.length;
    totalWarnings += warnings.length;
  });
}

const failed = totalErrors > 0 || (STRICT && totalWarnings > 0);
console.log(`\nChecked ${count} puzzle${count === 1 ? '' : 's'}: ${totalErrors} error${totalErrors === 1 ? '' : 's'}, ${totalWarnings} warning${totalWarnings === 1 ? '' : 's'}.`);
console.log(failed ? 'FAILED' : 'OK');
process.exit(failed ? 1 : 0);
