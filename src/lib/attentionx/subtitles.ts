import type { Word } from "./types";

function assTime(t: number): string {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t - Math.floor(t)) * 100);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

/**
 * Build an ASS subtitle file for a clip with karaoke-style word highlights.
 * Times are relative to the clip start.
 */
export function buildAssSubtitle(words: Word[], clipStart: number, hook: string): string {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hook,Impact,72,&H0000F0FF,&H000000FF,&H00000000,&H88000000,1,0,0,0,100,100,0,0,3,4,2,2,40,40,160,1
Style: Cap,Impact,84,&H00FFFFFF,&H000000FF,&H00000000,&H88000000,1,0,0,0,100,100,0,0,1,5,3,5,80,80,0,1
Style: CapHi,Impact,84,&H0000F0FF,&H000000FF,&H00000000,&H88000000,1,0,0,0,100,100,0,0,1,5,3,5,80,80,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  const lines: string[] = [];
  // Hook headline pinned at top for first 3s
  const safeHook = hook.replace(/[\r\n]+/g, " ").replace(/[{}]/g, "").toUpperCase();
  lines.push(`Dialogue: 0,${assTime(0)},${assTime(3)},Hook,,0,0,0,,${safeHook}`);

  // Group words into chunks of 3-4 for caption rendering
  const groupSize = 3;
  for (let i = 0; i < words.length; i += groupSize) {
    const group = words.slice(i, i + groupSize);
    if (!group.length) continue;
    const gStart = Math.max(0, group[0].start - clipStart);
    const gEnd = Math.max(gStart + 0.2, group[group.length - 1].end - clipStart);
    // Per-word: render group with current word highlighted
    for (let k = 0; k < group.length; k++) {
      const wStart = Math.max(0, group[k].start - clipStart);
      const wEnd = Math.max(wStart + 0.1, group[k].end - clipStart);
      const text = group
        .map((w, idx) => {
          const t = (w.text || "").replace(/[{}]/g, "").toUpperCase();
          if (idx === k) return `{\\c&H0000F0FF&}${t}{\\c&HFFFFFF&}`;
          return t;
        })
        .join(" ");
      lines.push(`Dialogue: 1,${assTime(wStart)},${assTime(wEnd)},Cap,,0,0,0,,${text}`);
    }
    // ensure final group word holds until gEnd
    if (group.length) {
      const last = group[group.length - 1];
      const lastEnd = Math.max(0, last.end - clipStart);
      if (lastEnd < gEnd) {
        const text = group.map((w) => (w.text || "").replace(/[{}]/g, "").toUpperCase()).join(" ");
        lines.push(`Dialogue: 1,${assTime(lastEnd)},${assTime(gEnd)},Cap,,0,0,0,,${text}`);
      }
    }
  }

  return header + lines.join("\n") + "\n";
}
