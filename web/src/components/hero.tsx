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

    // Add https:// if missing
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }

    try {
      new URL(normalized);
    } catch {
      setError("Enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push(`/audit/${data.id}`);
    } catch {
      setError("Failed to start audit. Try again.");
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20 pb-16">
      {/* Radial glow behind hero */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-accent/5 blur-[120px]" />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Free. No sign-up required.
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4 max-w-3xl text-center text-5xl font-bold leading-tight tracking-tight md:text-7xl md:leading-[1.1]"
      >
        <span className="gradient-text">Your site.</span>{" "}
        <span className="text-accent">Audited by AI.</span>
        <br />
        <span className="gradient-text">In 60 seconds.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-10 max-w-xl text-center text-lg text-muted"
      >
        4 user personas. 8 UX pillars. Lighthouse performance data.
        Screenshots at 3 viewports. Actionable fixes you can ship today.
      </motion.p>

      {/* URL Input */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative w-full max-w-xl"
      >
        <div className="glow-border flex items-center rounded-2xl bg-card">
          <div className="flex items-center pl-5 text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className="flex-1 bg-transparent px-4 py-4 text-lg text-foreground placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="mr-2 flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Scanning
              </>
            ) : (
              <>
                Audit
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-center text-sm text-red-400">{error}</p>
        )}
      </motion.form>

      {/* Sample scores floating */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-16 flex items-center gap-8 md:gap-12"
      >
        <ScoreCircle score={92} label="Performance" color="#22c55e" size={80} delay={1.0} />
        <ScoreCircle score={78} label="UX Score" color="#6C47FF" size={100} delay={1.2} />
        <ScoreCircle score={85} label="Accessibility" color="#3b82f6" size={80} delay={1.4} />
      </motion.div>
    </section>
  );
}
