import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, CheckSquare, Play, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';
import { ALL_PUZZLES } from '../data/puzzles';

interface SpecValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationReport {
  errors: string[];
  warnings: string[];
}

export const SpecValidatorModal: React.FC<SpecValidatorModalProps> = ({ isOpen, onClose }) => {
  const [selectedMode, setSelectedMode] = useState<'seams' | 'splits' | 'charades' | 'hangman'>('seams');
  const [customJson, setCustomJson] = useState<string>('');
  const [report, setReport] = useState<ValidationReport | null>(null);

  if (!isOpen) return null;

  // Run in-browser validator according to SPEC.md and scripts/validate.js rules
  const validatePuzzleObject = (p: any, mode: string): ValidationReport => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const err = (m: string) => errors.push(m);
    const warn = (m: string) => warnings.push(m);

    if (!p || typeof p !== 'object') {
      return { errors: ['Entry is not an object'], warnings: [] };
    }

    // Base checks
    if (!p.id) err('Missing id');
    else if (!new RegExp('^' + mode + '_\\d{4}$').test(p.id)) warn(`id should look like ${mode}_0001`);

    if (p.mode !== mode) err(`mode "${p.mode}" does not match mode "${mode}"`);
    if (!Number.isInteger(p.difficulty) || p.difficulty < 1 || p.difficulty > 5) {
      err('difficulty must be an integer from 1 to 5');
    }

    if (!['draft', 'reviewed', 'live', 'retired'].includes(p.status)) {
      err('status must be one of: draft, reviewed, live, retired');
    }

    if ((p.status === 'reviewed' || p.status === 'live') && !p.reviewed_by) {
      err('reviewed and live puzzles require reviewed_by');
    }

    if (!p.explanation || p.explanation.trim().length < 10) {
      err('explanation is missing or too short (must be at least 10 characters)');
    } else {
      const enders = (p.explanation.match(/[.!?](?=\s|$)/g) || []).length;
      if (enders > 1 || /\n/.test(p.explanation)) warn('explanation should be exactly one sentence');
    }

    if (!Array.isArray(p.accepted_answers) || !p.accepted_answers.length) {
      err('accepted_answers must be a non-empty array');
    } else {
      if (!p.accepted_answers.includes(p.answer)) err('accepted_answers must include answer');
      p.accepted_answers.forEach((a: string) => {
        if (!/^[A-Z]+( [A-Z]+)*$/.test(a)) err(`accepted answer "${a}" must be uppercase letters`);
      });
    }

    if (mode !== 'charades' && mode !== 'hangman' && !p.sentence) err('sentence is required');

    // Mode-specific checks
    if (mode === 'seams') {
      const ans = p.answer || '';
      if (!/^[A-Z]{3,6}$/.test(ans)) err('answer must be 3-6 uppercase letters');

      if (p.sentence) {
        const tokens = p.sentence.split(' ');
        const wordOf: number[] = [];
        let flat = '';
        tokens.forEach((t: string, ti: number) => {
          for (const ch of t.toLowerCase()) {
            if (/[a-z]/.test(ch)) {
              flat += ch;
              wordOf.push(ti);
            }
          }
        });

        const a = ans.toLowerCase();
        const spans: { first: number; last: number; fromFirst: number }[] = [];
        for (let i = flat.indexOf(a); i !== -1; i = flat.indexOf(a, i + 1)) {
          const first = wordOf[i], last = wordOf[i + a.length - 1];
          const fromFirst = wordOf.slice(i, i + a.length).filter((t) => t === first).length;
          spans.push({ first, last, fromFirst });
        }

        if (!spans.length) {
          err('answer letters do not appear consecutively in the sentence');
        } else {
          const crossing = spans.filter((x) => x.first !== x.last);
          const good = crossing.filter((x) => x.last - x.first === 1);
          if (!crossing.length) err('answer never spans two words (it sits inside a single word)');
          else if (!good.length) err('answer spans more than two words; it must cross exactly one boundary');

          const s = p.seams;
          if (!s || typeof s !== 'object') err('missing seams payload');
          else if (good.length) {
            const g = good[0];
            if (s.word_index_a !== g.first || s.word_index_b !== g.last) {
              err(`seams word indexes should be ${g.first} and ${g.last}`);
            }
            if (s.split_at !== g.fromFirst) err(`seams.split_at should be ${g.fromFirst}`);
          }
        }
      }
    } else if (mode === 'splits') {
      if (!/^[A-Z]+ [A-Z]+$/.test(p.answer || '')) err('answer must be two uppercase words separated by one space');
      const sp = p.splits;
      if (!sp || typeof sp !== 'object') err('missing splits payload');
      else if (p.sentence) {
        const tokens = p.sentence.split(' ');
        const tok = tokens[sp.word_index];
        if (tok === undefined) err('splits.word_index is out of range');
        else {
          const original = tok.toLowerCase().replace(/[^a-z]/g, '');
          if (!sp.original_word || sp.original_word.toLowerCase() !== original) {
            err(`splits.original_word must match sentence word at word_index ("${original}")`);
          }
        }

        if (!Array.isArray(sp.accepted_splits) || !sp.accepted_splits.length) {
          err('accepted_splits must be a non-empty array');
        }
        if (sp.meaning_changed !== true) {
          if (p.status === 'reviewed' || p.status === 'live') err('meaning_changed must be true for live puzzles');
          else warn('meaning_changed is not yet confirmed true');
        }
      }
    } else if (mode === 'charades') {
      const c = p.charades;
      if (!c || typeof c !== 'object') err('missing charades payload');
      else {
        if (!Array.isArray(c.parts) || c.parts.length < 2 || c.parts.length > 3) {
          err('charades.parts must have 2 or 3 parts');
        }
        const whole = c.whole && c.whole.word;
        if (!whole || !/^[A-Z]{4,}$/.test(whole)) err('whole.word must be 4+ uppercase letters');
        if (p.answer !== whole) err('answer must equal whole.word');
        if (!c.whole?.clue) err('whole.clue is required');
        else if (new RegExp('\\b' + whole + '\\b', 'i').test(c.whole.clue)) {
          err('whole.clue contains the answer');
        }
      }
    } else if (mode === 'hangman') {
      if (!/^[A-Z]{3,}$/.test(p.answer || '')) err('answer must be 3+ uppercase letters');
      if (!p.hangman || typeof p.hangman !== 'object') err('missing hangman payload');
      else {
        if (!p.hangman.category) err('hangman.category is required');
        if (!p.hangman.hint) err('hangman.hint is required');
      }
    }

    return { errors, warnings };
  };

  const handleValidateCurrentDataset = () => {
    sound.playTap();
    const puzzles = ALL_PUZZLES[selectedMode] || [];
    let totalErrors: string[] = [];
    let totalWarnings: string[] = [];

    puzzles.forEach((pz) => {
      const res = validatePuzzleObject(pz, selectedMode);
      res.errors.forEach((e) => totalErrors.push(`[${pz.id}]: ${e}`));
      res.warnings.forEach((w) => totalWarnings.push(`[${pz.id}]: ${w}`));
    });

    setReport({ errors: totalErrors, warnings: totalWarnings });
  };

  const handleValidateCustomJson = () => {
    sound.playTap();
    try {
      const parsed = JSON.parse(customJson);
      const res = validatePuzzleObject(parsed, parsed.mode || selectedMode);
      setReport(res);
    } catch (e: any) {
      setReport({ errors: [`JSON Parse Error: ${e.message}`], warnings: [] });
    }
  };

  const handleLoadSampleJson = () => {
    sound.playTap();
    const sample = ALL_PUZZLES[selectedMode][0];
    setCustomJson(JSON.stringify(sample, null, 2));
    setReport(null);
  };

  return (
    <div
      id="spec-validator-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="spec-validator-card"
        className="w-full max-w-2xl bg-[#151F45] border-4 border-[#7CE04A] rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 text-[#FFF7E3] max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="close-spec-validator-modal"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[#7CE04A] text-xs font-heading uppercase tracking-wider mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Developer / Content Pipeline Tool</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-[#7CE04A] drop-shadow-md">
            SPEC.md Puzzle Validator
          </h2>
          <p className="text-xs text-[#9CB3E6] mt-0.5">
            Real-time validation against the Sleight of Words specification & schemas.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 p-1 bg-[#0E1638] rounded-2xl border border-[#253258]">
          {(['seams', 'splits', 'charades', 'hangman'] as const).map((m) => (
            <button
              key={m}
              id={`validator-mode-${m}`}
              onClick={() => {
                sound.playTap();
                setSelectedMode(m);
                setReport(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl font-heading text-xs capitalize transition-all ${
                selectedMode === m
                  ? 'btn-chunky-green text-white shadow'
                  : 'text-[#9CB3E6] hover:bg-[#1E2B63]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              id="validate-all-btn"
              onClick={handleValidateCurrentDataset}
              className="px-3 py-1.5 rounded-xl btn-chunky-green text-white font-heading text-xs flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Validate All {selectedMode} ({ALL_PUZZLES[selectedMode].length})</span>
            </button>

            <button
              id="load-sample-json-btn"
              onClick={handleLoadSampleJson}
              className="px-3 py-1.5 rounded-xl bg-[#253675] hover:bg-[#344B98] text-[#FFF7E3] font-heading text-xs flex items-center gap-1.5 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Sample JSON</span>
            </button>
          </div>

          {customJson.trim().length > 0 && (
            <button
              id="validate-json-btn"
              onClick={handleValidateCustomJson}
              className="px-3 py-1.5 rounded-xl btn-chunky-orange text-white font-heading text-xs flex items-center gap-1.5 shadow"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Validate Input JSON</span>
            </button>
          )}
        </div>

        {/* JSON Editor Sandbox */}
        <div>
          <label className="text-xs font-bold text-[#9CB3E6] mb-1 block">
            Inspect or Paste Single Puzzle JSON:
          </label>
          <textarea
            id="puzzle-json-textarea"
            rows={7}
            value={customJson}
            onChange={(e) => setCustomJson(e.target.value)}
            placeholder={`{\n  "id": "${selectedMode}_0001",\n  "mode": "${selectedMode}",\n  "difficulty": 1,\n  "answer": "...",\n  ...\n}`}
            className="w-full bg-[#0E1638] text-emerald-300 font-mono text-xs p-3 rounded-2xl border border-[#2C3E80] focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Results Banner */}
        {report && (
          <div className="p-3.5 rounded-2xl bg-[#0E1638] border border-[#253258] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {report.errors.length === 0 ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-heading text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Validation Passed! 0 Errors, {report.warnings.length} Warnings.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400 font-heading text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span>Validation Failed: {report.errors.length} Error(s)</span>
                </div>
              )}
            </div>

            {report.errors.map((e, idx) => (
              <div key={idx} className="text-xs text-rose-300 font-mono bg-rose-950/40 p-1.5 rounded border border-rose-900">
                ✗ {e}
              </div>
            ))}

            {report.warnings.map((w, idx) => (
              <div key={idx} className="text-xs text-amber-300 font-mono bg-amber-950/40 p-1.5 rounded border border-amber-900">
                ! {w}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
