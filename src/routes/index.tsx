import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { runPipeline, type PipelineResult } from "@/lib/attentionx/pipeline";
import type { ProgressState } from "@/lib/attentionx/types";
import { formatTime } from "@/lib/attentionx/score";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AttentionX — Turn long videos into viral clips, in your browser" },
      {
        name: "description",
        content:
          "Drop a long video. Get vertical, captioned, hook-titled short clips. 100% in-browser, zero APIs.",
      },
      { property: "og:title", content: "AttentionX — Viral clips in your browser" },
      {
        property: "og:description",
        content: "Long-form to 9:16 shorts with karaoke captions. No upload, no API.",
      },
    ],
  }),
});

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<ProgressState>({
    stage: "idle",
    pct: 0,
    message: "Idle",
  });
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(3);
  const [maxDur, setMaxDur] = useState(45);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback((f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    setProgress({ stage: "idle", pct: 0, message: "Ready" });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const start = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const res = await runPipeline(
        file,
        { targetCount: count, minDur: 15, maxDur },
        (p) => setProgress(p)
      );
      setResult(res);
    } catch (e: any) {
      setError(e?.message || "Pipeline failed.");
      setProgress({ stage: "error", pct: 0, message: e?.message || "Failed" });
    }
  };

  const busy =
    progress.stage !== "idle" &&
    progress.stage !== "done" &&
    progress.stage !== "error";

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 pb-32 pt-10 md:px-10">
      {/* Header */}
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground font-mono text-xl font-bold">
            A
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              v1 · zero apis
            </div>
            <h1 className="font-mono text-sm font-bold">AttentionX</h1>
          </div>
        </div>
        <a
          href="https://github.com"
          className="hidden font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary md:block"
        >
          [ runs in your browser ]
        </a>
      </header>

      {/* Hero */}
      <section className="mb-16">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Automated Content Repurposing Engine
        </div>
        <h2 className="font-display mt-4 text-6xl leading-[0.95] md:text-8xl">
          Long videos
          <br />
          have <em className="text-primary">golden</em> moments.
          <br />
          We <span className="bg-primary px-3 text-primary-foreground">find them.</span>
        </h2>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Drop a lecture, podcast, or workshop. Get vertical 9:16 short clips with
          karaoke captions and hook headlines — generated <strong>entirely in your
          browser</strong>. No upload. No API key. No server.
        </p>
      </section>

      {/* Dropzone */}
      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-border bg-secondary/30 p-10 transition-colors hover:border-primary md:p-16"
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        {!file ? (
          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              [ step 01 ]
            </div>
            <h3 className="font-display mt-2 text-4xl md:text-5xl">
              Drop your video here
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              MP4, MOV, WEBM · processed locally · stays on your device
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-6 inline-flex bg-primary px-8 py-3 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
            >
              Choose file
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-primary">
                File loaded
              </div>
              <div className="font-display mt-1 truncate text-3xl">{file.name}</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type || "video"}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-primary disabled:opacity-40"
              >
                Replace
              </button>
              <button
                onClick={start}
                disabled={busy}
                className="bg-primary px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                {busy ? "Working..." : "Generate clips →"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="mt-8 grid gap-6 border border-border bg-secondary/20 p-6 md:grid-cols-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Number of clips
          </label>
          <input
            type="number"
            min={1}
            max={8}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
            disabled={busy}
            className="mt-2 w-full border border-border bg-background px-3 py-2 font-mono text-2xl"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Max clip length (sec)
          </label>
          <input
            type="number"
            min={20}
            max={90}
            value={maxDur}
            onChange={(e) => setMaxDur(Math.max(20, Math.min(90, Number(e.target.value) || 45)))}
            disabled={busy}
            className="mt-2 w-full border border-border bg-background px-3 py-2 font-mono text-2xl"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Engine
          </label>
          <div className="mt-2 border border-border bg-background px-3 py-2 font-mono text-sm">
            Whisper-tiny · ffmpeg.wasm · in-browser
          </div>
        </div>
      </section>

      {/* Always-visible Extract CTA + Progress */}
      <section className="mt-8 border border-border bg-card p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {busy ? (
              <span
                aria-label="loading"
                className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-primary"
              />
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center bg-primary font-mono text-lg font-bold text-primary-foreground">
                ▶
              </span>
            )}
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-primary">
                {progress.stage === "idle" ? "ready" : progress.stage}
              </div>
              <div className="font-display text-2xl leading-tight">
                {progress.stage === "idle"
                  ? file
                    ? "Ready to extract clips."
                    : "Drop a video to begin."
                  : progress.message}
              </div>
            </div>
          </div>
          <button
            onClick={start}
            disabled={!file || busy}
            className="inline-flex items-center justify-center gap-2 bg-primary px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {busy ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Working…
              </>
            ) : (
              <>Extract Clips →</>
            )}
          </button>
        </div>

        {/* Progress bar — always visible */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress.pct * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden bg-secondary">
            <div
              className={`h-full bg-primary transition-all duration-300 ${busy ? "animate-pulse" : ""}`}
              style={{ width: `${Math.max(2, progress.pct * 100)}%` }}
            />
          </div>
          {error && (
            <div className="mt-4 border border-destructive bg-destructive/10 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}
          {busy && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              First run downloads ~40MB Whisper + ~30MB ffmpeg core. Cached after that.
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      {result && result.clips.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-primary">
                Output · {result.clips.length} clips
              </div>
              <h3 className="font-display mt-1 text-5xl">Your viral cuts.</h3>
            </div>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {result.clips.map(({ candidate: c, blob, filename }, i) => {
              const url = URL.createObjectURL(blob);
              return (
                <article
                  key={c.id}
                  className="group flex flex-col border border-border bg-card"
                >
                  <div className="relative aspect-[9/16] bg-black">
                    <video
                      src={url}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute left-2 top-2 bg-primary px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      #{i + 1} · score {c.score.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="font-display text-xl leading-tight">
                      "{c.hook}"
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {formatTime(c.start)} → {formatTime(c.end)} ·{" "}
                      {(c.end - c.start).toFixed(1)}s
                    </div>
                    <p className="line-clamp-3 text-xs text-muted-foreground">
                      {c.transcript}
                    </p>
                    <a
                      href={url}
                      download={filename}
                      className="mt-auto bg-primary px-3 py-2 text-center font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
                    >
                      Download mp4
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer note */}
      <footer className="mt-24 border-t border-border pt-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">
              How it works
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              ffmpeg.wasm extracts the audio. Whisper-tiny (transformers.js)
              transcribes with word-level timestamps. A heuristic scorer finds
              hook-rich segments. ffmpeg.wasm crops to 9:16 and burns in karaoke
              captions.
            </p>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">
              Privacy
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Your video never leaves your device. There is no backend.
            </p>
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">
              Limits
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Best with videos under ~30 minutes. Browser RAM is the ceiling. Use
              Chrome/Edge for WebAssembly SIMD.
            </p>
          </div>
        </div>
        <div className="mt-10 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          AttentionX · Built with Lovable · No APIs were harmed in the making of this app.
        </div>
      </footer>
    </main>
  );
}
