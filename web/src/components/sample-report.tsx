"use client";

import { motion } from "motion/react";
import { ScoreCircle } from "./score-circle";

const sampleIssues = [
  { severity: "Critical", issue: "No clear CTA above the fold", persona: "Grandma" },
  { severity: "High", issue: "Touch targets under 44px on nav links", persona: "Teen" },
  { severity: "High", issue: "No testimonials or social proof visible", persona: "Business" },
  { severity: "Medium", issue: "3 images missing alt text", persona: "Screen Reader" },
  { severity: "Low", issue: "Jargon in secondary nav ('API Docs')", persona: "Grandma" },
];

const severityColors: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-400",
  High: "bg-orange-500/15 text-orange-400",
  Medium: "bg-yellow-500/15 text-yellow-400",
  Low: "bg-blue-500/15 text-blue-400",
};

const pillarScores = [
  { name: "First Impression", score: 6, color: "#f59e0b" },
  { name: "Navigation", score: 8, color: "#22c55e" },
  { name: "Forms & Inputs", score: 7, color: "#3b82f6" },
  { name: "Trust & Credibility", score: 5, color: "#ef4444" },
  { name: "Mobile", score: 6, color: "#f59e0b" },
  { name: "Performance", score: 9, color: "#22c55e" },
  { name: "Accessibility", score: 7, color: "#3b82f6" },
  { name: "Copy & Clarity", score: 8, color: "#22c55e" },
];

export function SampleReport() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Sample output
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-5xl">
          What your report looks like
        </h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-lg text-muted">
          Interactive, expandable, with code-level fix suggestions.
        </p>

        {/* Report card */}
        <div className="rounded-3xl glass-surface p-8 md:p-10">
          {/* Top: Grade + Lighthouse */}
          <div className="mb-10 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-5xl font-bold text-yellow-400">
                C
              </div>
              <div>
                <p className="text-3xl font-bold">72<span className="text-lg text-muted">/100</span></p>
                <p className="text-sm text-muted mt-1">example-site.com</p>
              </div>
            </div>
            <div className="flex gap-8">
              <ScoreCircle score={91} label="Performance" color="#22c55e" size={72} delay={0} />
              <ScoreCircle score={78} label="Accessibility" color="#3b82f6" size={72} delay={0.1} />
              <ScoreCircle score={85} label="Best Practices" color="#22c55e" size={72} delay={0.2} />
              <ScoreCircle score={92} label="SEO" color="#22c55e" size={72} delay={0.3} />
            </div>
          </div>

          {/* Pillar bars */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {pillarScores.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-4"
              >
                <span className="w-40 text-sm text-muted">{p.name}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.score * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-mono font-bold" style={{ color: p.color }}>
                  {p.score}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Issues table */}
          <div className="rounded-2xl glass-card overflow-hidden">
            <div className="border-b border-glass-border bg-white/[0.02] px-6 py-4">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Issues Found</h3>
            </div>
            {sampleIssues.map((issue, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-glass-border/40 px-6 py-4 last:border-0 transition-colors hover:bg-white/[0.03]">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${severityColors[issue.severity]}`}>
                  {issue.severity}
                </span>
                <span className="flex-1 text-[15px]">{issue.issue}</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted">
                  {issue.persona}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
