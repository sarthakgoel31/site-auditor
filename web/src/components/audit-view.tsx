"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScoreCircle } from "./score-circle";

interface AuditResult {
  id: string;
  url: string;
  status: "queued" | "scanning" | "analyzing" | "complete" | "error";
  grade?: string;
  score?: number;
  lighthouse?: { performance: number; accessibility: number; bestPractices: number; seo: number };
  pillars?: { name: string; score: number }[];
  issues?: { severity: string; pillar: string; issue: string; persona: string; fix?: string }[];
  personas?: { name: string; verdict: string }[];
  screenshots?: { desktop?: string; tablet?: string; mobile?: string };
  error?: string;
}

const scanSteps = [
  { key: "queued", label: "Queued", detail: "Waiting to start..." },
  { key: "scanning", label: "Scanning", detail: "Taking screenshots at 3 viewports + running Lighthouse..." },
  { key: "analyzing", label: "Analyzing", detail: "AI evaluating from 4 persona perspectives across 8 UX pillars..." },
  { key: "complete", label: "Complete", detail: "Your report is ready." },
];

const severityColors: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const gradeColors: Record<string, string> = {
  A: "bg-emerald-500/10 text-emerald-400",
  B: "bg-blue-500/10 text-blue-400",
  C: "bg-yellow-500/10 text-yellow-400",
  D: "bg-orange-500/10 text-orange-400",
  F: "bg-red-500/10 text-red-400",
};

const pillarColors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#ec4899", "#f97316"];

export function AuditView({ id }: { id: string }) {
  const [audit, setAudit] = useState<AuditResult | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function poll() {
      try {
        const res = await fetch(`/api/audit?id=${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setAudit(data);
        if (data.status === "complete" || data.status === "error") {
          clearInterval(interval);
        }
      } catch { /* retry on next interval */ }
    }

    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!audit) {
    return (
      <div className="grid-bg flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (audit.status === "error") {
    return (
      <div className="grid-bg flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
          ✕
        </div>
        <h1 className="text-2xl font-bold">Audit Failed</h1>
        <p className="text-muted">{audit.error || "Something went wrong. Please try again."}</p>
        <a href="/" className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light">
          Try Again
        </a>
      </div>
    );
  }

  // Progress state
  if (audit.status !== "complete") {
    const currentStep = scanSteps.findIndex((s) => s.key === audit.status);
    return (
      <div className="grid-bg flex min-h-screen flex-col items-center justify-center gap-8 px-4">
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />

        {/* Scanning animation */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="pulse-glow flex h-24 w-24 items-center justify-center rounded-3xl border border-accent/30 bg-card"
        >
          <svg className="h-10 w-10 text-accent animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </motion.div>

        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Auditing {audit.url}</h1>
          <p className="text-muted">{scanSteps[currentStep]?.detail}</p>
        </div>

        {/* Progress steps */}
        <div className="flex gap-4">
          {scanSteps.slice(0, -1).map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                i < currentStep
                  ? "bg-emerald-500 text-white"
                  : i === currentStep
                    ? "bg-accent text-white animate-pulse"
                    : "bg-white/5 text-muted"
              }`}>
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span className={`hidden text-sm sm:block ${i <= currentStep ? "text-foreground" : "text-muted"}`}>
                {step.label}
              </span>
              {i < scanSteps.length - 2 && (
                <div className={`mx-2 h-px w-8 transition-all duration-500 ${i < currentStep ? "bg-emerald-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Complete — render full report
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col items-center gap-6 text-center"
        >
          <div className={`flex h-28 w-28 items-center justify-center rounded-3xl text-5xl font-bold ${gradeColors[audit.grade || "C"]}`}>
            {audit.grade}
          </div>
          <div>
            <p className="text-4xl font-bold">{audit.score}<span className="text-xl text-muted">/100</span></p>
            <p className="mt-1 text-muted">{audit.url}</p>
          </div>
        </motion.div>

        {/* Lighthouse */}
        {audit.lighthouse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 flex justify-center gap-8"
          >
            <ScoreCircle score={audit.lighthouse.performance} label="Performance" color="#22c55e" size={80} delay={0.3} />
            <ScoreCircle score={audit.lighthouse.accessibility} label="Accessibility" color="#3b82f6" size={80} delay={0.4} />
            <ScoreCircle score={audit.lighthouse.bestPractices} label="Best Practices" color="#f59e0b" size={80} delay={0.5} />
            <ScoreCircle score={audit.lighthouse.seo} label="SEO" color="#a855f7" size={80} delay={0.6} />
          </motion.div>
        )}

        {/* Pillar scores */}
        {audit.pillars && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-6 text-lg font-semibold">UX Pillar Scores</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {audit.pillars.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-36 text-sm text-muted">{p.name}</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.score * 10}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: pillarColors[i % pillarColors.length] }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-mono font-semibold" style={{ color: pillarColors[i % pillarColors.length] }}>
                    {p.score}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Persona Verdicts */}
        {audit.personas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12 grid gap-4 sm:grid-cols-2"
          >
            {audit.personas.map((p) => {
              const emoji = p.name === "Grandma" ? "👵" : p.name === "Teen" ? "🧑‍💻" : p.name === "Business" ? "👔" : "♿";
              return (
                <div key={p.name} className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <h3 className="font-semibold">{p.name}</h3>
                  </div>
                  <p className="text-sm text-muted italic">&ldquo;{p.verdict}&rdquo;</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Issues */}
        {audit.issues && audit.issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12 rounded-2xl border border-border bg-card"
          >
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Issues Found ({audit.issues.length})</h2>
            </div>
            <AnimatePresence>
              {audit.issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="border-b border-border/50 px-6 py-4 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${severityColors[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{issue.issue}</p>
                      {issue.fix && (
                        <p className="mt-1 text-sm text-muted">{issue.fix}</p>
                      )}
                    </div>
                    <span className="hidden shrink-0 text-xs text-muted md:block">{issue.persona}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer watermark */}
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted">
            Audited by{" "}
            <a href="https://sarthakgoel.cv" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">
              Site Auditor
            </a>
          </p>
          <a
            href="/"
            className="rounded-xl border border-border px-6 py-2.5 text-sm text-muted transition-all hover:border-accent/40 hover:text-foreground"
          >
            Audit another site
          </a>
        </div>
      </div>
    </div>
  );
}
