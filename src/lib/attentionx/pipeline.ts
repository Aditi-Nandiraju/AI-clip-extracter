import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { ClipCandidate, ProgressState, Word } from "./types";
import { findClips } from "./score";
import { buildAssSubtitle } from "./subtitles";

let ffmpegInstance: FFmpeg | null = null;
let whisperPipe: any = null;

const FFMPEG_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

async function getFFmpeg(onLog?: (m: string) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  const ff = new FFmpeg();
  if (onLog) ff.on("log", ({ message }) => onLog(message));
  await ff.load({
    coreURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${FFMPEG_BASE}/ffmpeg-core.wasm`, "application/wasm"),
  });
  ffmpegInstance = ff;
  return ff;
}

async function getWhisper(onProgress: (msg: string, pct: number) => void) {
  if (whisperPipe) return whisperPipe;
  const { pipeline, env } = await import("@huggingface/transformers");
  env.allowLocalModels = false;
  whisperPipe = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
    progress_callback: (p: any) => {
      if (p?.status === "progress" && typeof p.progress === "number") {
        onProgress(`Loading Whisper: ${p.file ?? ""}`, p.progress);
      } else if (p?.status) {
        onProgress(`Whisper: ${p.status}`, 0);
      }
    },
  });
  return whisperPipe;
}

async function extractAudioPcm(
  ff: FFmpeg,
  inputName: string,
  onPct: (p: number) => void
): Promise<Float32Array> {
  ff.on("progress", ({ progress }) => onPct(Math.min(0.99, Math.max(0, progress))));
  await ff.exec(["-i", inputName, "-ac", "1", "-ar", "16000", "-f", "f32le", "audio.pcm"]);
  const data = await ff.readFile("audio.pcm");
  const buf = (data as Uint8Array).buffer.slice(
    (data as Uint8Array).byteOffset,
    (data as Uint8Array).byteOffset + (data as Uint8Array).byteLength
  );
  return new Float32Array(buf);
}

export interface PipelineResult {
  clips: { candidate: ClipCandidate; blob: Blob; filename: string }[];
  fullTranscript: string;
}

export async function runPipeline(
  file: File,
  options: { targetCount: number; minDur: number; maxDur: number },
  onProgress: (p: ProgressState) => void
): Promise<PipelineResult> {
  onProgress({ stage: "loading-ffmpeg", pct: 0, message: "Loading video engine..." });
  const ff = await getFFmpeg();

  const inputName = "input." + (file.name.split(".").pop() || "mp4");
  await ff.writeFile(inputName, await fetchFile(file));

  onProgress({ stage: "extracting-audio", pct: 0, message: "Extracting audio..." });
  const pcm = await extractAudioPcm(ff, inputName, (p) =>
    onProgress({ stage: "extracting-audio", pct: p, message: "Extracting audio..." })
  );

  onProgress({ stage: "loading-whisper", pct: 0, message: "Loading Whisper..." });
  const asr = await getWhisper((m, p) =>
    onProgress({ stage: "loading-whisper", pct: p, message: m })
  );

  onProgress({ stage: "transcribing", pct: 0, message: "Transcribing speech..." });
  const out = await asr(pcm, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: "word",
  });

  const rawChunks: any[] = (out as any).chunks ?? [];
  const words: Word[] = rawChunks
    .filter((c) => c?.timestamp && c.timestamp[0] != null && c.timestamp[1] != null)
    .map((c) => ({
      text: String(c.text).trim(),
      start: c.timestamp[0],
      end: c.timestamp[1],
    }))
    .filter((w) => w.text.length > 0 && w.end > w.start);

  if (!words.length) throw new Error("No speech detected in this video.");

  onProgress({ stage: "scoring", pct: 0, message: "Finding viral moments..." });
  const candidates = findClips(words, options);
  if (!candidates.length) throw new Error("Could not find clip-worthy segments.");

  onProgress({ stage: "rendering", pct: 0, message: "Rendering vertical clips..." });
  const results: PipelineResult["clips"] = [];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    onProgress({
      stage: "rendering",
      pct: i / candidates.length,
      message: `Rendering clip ${i + 1} of ${candidates.length}...`,
    });
    const ass = buildAssSubtitle(c.words, c.start, c.hook);
    const assName = `sub_${i}.ass`;
    await ff.writeFile(assName, new TextEncoder().encode(ass));
    const outName = `clip_${i}.mp4`;
    // 9:16 smart crop: scale to fill 1080 width then center crop
    const vf = `crop='min(iw\\,ih*9/16)':'min(ih\\,iw*16/9)',scale=1080:1920,subtitles=${assName}`;
    try {
      await ff.exec([
        "-ss", c.start.toFixed(2),
        "-to", c.end.toFixed(2),
        "-i", inputName,
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "26",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-y", outName,
      ]);
      const data = await ff.readFile(outName);
      const blob = new Blob([(data as Uint8Array).buffer as ArrayBuffer], { type: "video/mp4" });
      results.push({ candidate: c, blob, filename: outName });
    } catch (e) {
      console.error("Clip render failed", e);
    }
  }

  onProgress({ stage: "done", pct: 1, message: "Complete." });
  const fullTranscript = words.map((w) => w.text).join(" ");
  return { clips: results, fullTranscript };
}
