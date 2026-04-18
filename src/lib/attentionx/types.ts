export interface Word {
  text: string;
  start: number;
  end: number;
}

export interface ClipCandidate {
  id: string;
  start: number;
  end: number;
  score: number;
  hook: string;
  transcript: string;
  words: Word[];
}

export type StageName =
  | "idle"
  | "loading-ffmpeg"
  | "extracting-audio"
  | "loading-whisper"
  | "transcribing"
  | "scoring"
  | "rendering"
  | "done"
  | "error";

export interface ProgressState {
  stage: StageName;
  pct: number;
  message: string;
}
