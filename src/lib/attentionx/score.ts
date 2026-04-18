import type { Word, ClipCandidate } from "./types";

const HOOK_KEYWORDS = [
  "secret","never","always","mistake","wrong","truth","actually","crazy","insane","shocking",
  "nobody","everyone","money","success","fail","failed","love","hate","best","worst","biggest",
  "first","last","reason","because","why","how","stop","start","change","life","killed","died",
  "won","lost","million","billion","free","trick","hack","rule","lesson","story","remember",
  "imagine","realize","realized","discovered","found","problem","solution","important","critical",
];

const SUPERLATIVES = /\b(most|best|worst|biggest|smallest|greatest|hardest|easiest|fastest|slowest|only|every|all|none|never|always)\b/gi;

function scoreText(text: string): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  let kw = 0;
  for (const w of words) if (HOOK_KEYWORDS.includes(w.replace(/[^a-z]/g, ""))) kw++;
  const density = kw / words.length;
  const punct = (text.match(/[!?]/g) || []).length;
  const sup = (text.match(SUPERLATIVES) || []).length;
  const numbers = (text.match(/\b\d+\b/g) || []).length;
  return density * 10 + punct * 0.6 + sup * 0.5 + numbers * 0.4;
}

function pickHook(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (!sentences.length) return text.slice(0, 60);
  let best = sentences[0];
  let bestS = -1;
  for (const s of sentences) {
    const sc = scoreText(s);
    if (sc > bestS) { bestS = sc; best = s; }
  }
  const trimmed = best.trim().replace(/\s+/g, " ");
  return trimmed.length > 70 ? trimmed.slice(0, 67) + "..." : trimmed;
}

export function findClips(
  words: Word[],
  opts: { targetCount: number; minDur: number; maxDur: number }
): ClipCandidate[] {
  if (!words.length) return [];
  const { targetCount, minDur, maxDur } = opts;
  const totalDur = words[words.length - 1].end;

  // Build candidate windows by sliding through sentence boundaries
  const segments: { start: number; end: number; words: Word[] }[] = [];
  let cur: Word[] = [];
  let curStart = words[0].start;
  for (const w of words) {
    if (!cur.length) curStart = w.start;
    cur.push(w);
    const dur = w.end - curStart;
    const endsSentence = /[.!?]$/.test(w.text.trim());
    if (dur >= minDur && (endsSentence || dur >= maxDur)) {
      segments.push({ start: curStart, end: w.end, words: cur });
      cur = [];
    }
  }
  if (cur.length) segments.push({ start: curStart, end: cur[cur.length - 1].end, words: cur });

  // Merge/extend short segments so each is between min and max duration
  const candidates: ClipCandidate[] = [];
  let i = 0;
  while (i < segments.length) {
    let combined = segments[i];
    let j = i + 1;
    while (combined.end - combined.start < minDur && j < segments.length) {
      combined = {
        start: combined.start,
        end: segments[j].end,
        words: [...combined.words, ...segments[j].words],
      };
      j++;
    }
    if (combined.end - combined.start > maxDur) {
      // truncate to maxDur
      const targetEnd = combined.start + maxDur;
      const ws = combined.words.filter((w) => w.end <= targetEnd);
      if (ws.length >= 3) {
        combined = { start: combined.start, end: ws[ws.length - 1].end, words: ws };
      }
    }
    const transcript = combined.words.map((w) => w.text).join(" ").replace(/\s+/g, " ").trim();
    const dur = combined.end - combined.start;
    if (dur >= Math.min(minDur, 5) && transcript.length > 10) {
      candidates.push({
        id: `c_${Math.round(combined.start * 1000)}`,
        start: combined.start,
        end: combined.end,
        score: scoreText(transcript) + Math.min(dur / 60, 0.5),
        hook: pickHook(transcript),
        transcript,
        words: combined.words,
      });
    }
    i = Math.max(j, i + 1);
  }

  // Suppress overlaps, keep top by score
  candidates.sort((a, b) => b.score - a.score);
  const picked: ClipCandidate[] = [];
  for (const c of candidates) {
    if (picked.length >= targetCount) break;
    const overlaps = picked.some((p) => !(c.end < p.start || c.start > p.end));
    if (!overlaps) picked.push(c);
  }
  picked.sort((a, b) => a.start - b.start);
  return picked;
}

export function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
