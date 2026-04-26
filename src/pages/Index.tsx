import { ChangeEvent, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { compareImages } from "@/lib/fireworksVision";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";

const API_KEY = import.meta.env.VITE_FIREWORKS_API_KEY as string;

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [checkedCount, setCheckedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /** Run the vision comparison against every knowledgebase entry in order. */
  async function identifyPattern(file: File) {
    setIsAnalyzing(true);
    setPattern(null);
    setError(null);
    setCheckedCount(0);

    try {
      for (let i = 0; i < KNOWLEDGE_BASE.length; i++) {
        const entry = KNOWLEDGE_BASE[i];
        setCheckedCount(i + 1);

        const answer = await compareImages(
          API_KEY,
          file,
          entry.imagePath,
          "Do these two images show the same weave pattern?"
        );

        console.log(`Checking pattern: ${entry.name} - Agent Response: ${answer}`);

        if (answer.toLowerCase().startsWith("yes")) {
          console.log(`Match found: ${entry.name}`);
          setPattern(entry.name);
          return;
        }
      }

      console.log("No match found in knowledge base.");
      // No match found
      setPattern("Unknown Pattern");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setPattern(null);
    setError(null);
    identifyPattern(file);
  };

  const progressPct = isAnalyzing
    ? Math.round((checkedCount / KNOWLEDGE_BASE.length) * 100)
    : pattern
    ? 100
    : 0;

  return (
    <main className="min-h-screen overflow-hidden bg-textile-surface text-foreground">
      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div className="absolute inset-0 woven-grid opacity-70" aria-hidden="true" />
        <div className="absolute left-1/2 top-8 h-[88%] w-16 -translate-x-1/2 bg-loom-gradient opacity-10 blur-3xl" aria-hidden="true" />

        {/* ── Left column ── */}
        <div className="relative z-10 animate-thread-rise space-y-7">
          <div className="inline-flex items-center gap-2 border border-border bg-linen px-3 py-2 text-sm font-semibold text-ink-soft shadow-thread">
            <Sparkles className="h-4 w-4 text-thread" />
            Textile vision assistant
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
              Identify weave patterns from a fabric image.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-ink-soft">
              Upload a close-up fabric photo and our AI compares it against the
              knowledge base to give you a precise weave pattern name.
            </p>
          </div>

          <div className="grid max-w-lg grid-cols-3 border border-border bg-linen shadow-thread">
            {[
              { label: "Warp", value: "Scan" },
              { label: "Weft", value: "Match" },
              { label: "Repeat", value: "Name" },
            ].map(({ label, value }) => (
              <div key={label} className="border-r border-border p-4 last:border-r-0">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
              </div>
            ))}
          </div>

          {/* Knowledge-base legend */}
          <div className="max-w-lg space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Patterns in knowledge base
            </p>
            <div className="flex flex-wrap gap-2">
              {KNOWLEDGE_BASE.map((entry) => {
                const isMatch = pattern === entry.name;
                const isChecked =
                  !isAnalyzing &&
                  pattern !== null &&
                  KNOWLEDGE_BASE.findIndex((e) => e.name === entry.name) <
                    KNOWLEDGE_BASE.findIndex((e) => e.name === pattern);
                return (
                  <span
                    key={entry.name}
                    className={`border px-3 py-1 text-sm font-semibold transition-colors ${
                      isMatch
                        ? "border-primary bg-primary text-primary-foreground"
                        : isChecked
                        ? "border-border bg-linen text-muted-foreground line-through"
                        : "border-border bg-linen text-ink-soft"
                    }`}
                  >
                    {entry.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="relative z-10 animate-thread-rise [animation-delay:120ms]">
          <div className="border border-border bg-card p-3 shadow-loom">
            <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">

              {/* Upload zone */}
              <label
                id="fabric-upload-label"
                className="group relative flex min-h-[420px] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-primary bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-thread focus-within:ring-2 focus-within:ring-ring"
              >
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Uploaded textile preview"
                      className="h-full min-h-[420px] w-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-y-0 w-1/2 bg-loom-gradient opacity-30 blur-xl motion-safe:animate-shuttle-scan" />
                    )}
                  </>
                ) : (
                  <div className="flex max-w-xs flex-col items-center gap-5 text-center">
                    <div className="flex h-20 w-20 items-center justify-center border border-border bg-linen shadow-thread transition duration-300 group-hover:scale-105">
                      <ImagePlus className="h-9 w-9 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">
                        Drop in a fabric image
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        PNG, JPG, or WEBP close-ups work best.
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="fabric-upload-input"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                />
              </label>

              {/* Result panel */}
              <aside className="flex min-h-[420px] flex-col justify-between bg-primary p-6 text-primary-foreground">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <Camera className="h-6 w-6" />
                    <span className="border border-primary-foreground/30 px-2 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                      Result
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-primary-foreground/70">
                      Uploaded image
                    </p>
                    <p className="mt-2 break-words text-lg font-semibold">
                      {fileName || "No image selected"}
                    </p>
                  </div>

                  <div className="border-t border-primary-foreground/20 pt-6">
                    {isAnalyzing ? (
                      <div className="space-y-4">
                        <Loader2 className="h-9 w-9 motion-safe:animate-spin" />
                        <p className="text-3xl font-black leading-tight">
                          Reading thread structure…
                        </p>
                        <p className="text-sm text-primary-foreground/60">
                          Checking pattern {checkedCount} of{" "}
                          {KNOWLEDGE_BASE.length}
                        </p>
                      </div>
                    ) : error ? (
                      <div className="space-y-3">
                        <AlertCircle className="h-9 w-9 text-red-300" />
                        <p className="text-xl font-black leading-tight">
                          Analysis failed
                        </p>
                        <p className="text-sm text-primary-foreground/70 break-words">
                          {error}
                        </p>
                      </div>
                    ) : pattern ? (
                      <div className="space-y-4">
                        <CheckCircle2 className="h-9 w-9 text-accent" />
                        <div>
                          <p className="text-sm uppercase tracking-[0.22em] text-primary-foreground/70">
                            Pattern name
                          </p>
                          <h2 className="mt-3 text-4xl font-black leading-tight">
                            {pattern}
                          </h2>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <UploadCloud className="mt-1 h-7 w-7 shrink-0 text-primary-foreground/50" />
                        <p className="text-3xl font-black leading-tight">
                          Your weave pattern name will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-8 border border-primary-foreground/25 bg-primary-foreground/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-primary-foreground/70">
                      {isAnalyzing ? "Analysing…" : pattern ? "Complete" : "Awaiting upload"}
                    </p>
                    <p className="text-sm font-bold">{progressPct}%</p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                    <div
                      className="h-full rounded-full bg-primary-foreground transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;