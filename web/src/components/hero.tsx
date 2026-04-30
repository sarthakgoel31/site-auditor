"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ScoreCircle } from "./score-circle";

export function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    let normalized = url.trim();
    if (!normalized) return;
    if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;
    try { new URL(normalized); } catch { setError("Enter a valid URL"); return; }

    setLoading(true);
    try {
      const res = await fetch("http://5.75.129.53:3100/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }
      router.push(`/audit/${data.id}`);
    } catch { setError("Failed to start audit. Try again."); setLoading(false); }
  }

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 pt-24 pb-20">
      {/* Radial glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[900px] rounded-full bg-accent/[0.04] blur-[150px]" />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 flex items-center gap-2.5 rounded-full border border-border bg-surface px-5 py-2 text-sm text-muted"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        Free. No sign-up required.
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6 max-w-4xl text-center text-[3.2rem] font-bold leading-[1.1] tracking-tight md:text-[5rem] md:leading-[1.05]"
      >
        <span className="gradient-text">Your site.</span>{" "}
        <span className="text-accent">Audited by AI.</span>
        <br />
        <span className="gradient-text">In 60 seconds.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12 max-w-2xl text-center text-lg leading-relaxed text-muted md:text-xl"
      >
        4 user personas. 8 UX pillars. Lighthouse performance data.
        Screenshots at 3 viewports. Actionable fixes you can ship today.
      </motion.p>

      {/* URL Input */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative w-full max-w-2xl"
      >
        <div className="glow-border flex items-center rounded-2xl bg-surface">
          <div className="flex items-center pl-6 text-muted">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="Enter any URL..."
            disabled={loading}
            className="flex-1 bg-transparent px-5 py-5 text-lg text-foreground placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="mr-2.5 flex items-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Scanning...
              </>
            ) : (
              <>
                Audit Site
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
      </motion.form>

      {/* Sample scores */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-20 flex items-end gap-10 md:gap-14"
      >
        <ScoreCircle score={92} label="Performance" color="#22c55e" size={90} delay={1.0} />
        <ScoreCircle score={78} label="UX Score" color="#7c5cfc" size={110} delay={1.2} />
        <ScoreCircle score={85} label="Accessibility" color="#3b82f6" size={90} delay={1.4} />
      </motion.div>
    </section>
  );
}
