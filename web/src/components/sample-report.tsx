"use client";

import { motion } from "motion/react";
import { ScoreCircle } from "./score-circle";

const sampleIssues = [
  { severity: "Critical", pillar: "First Impression", issue: "No clear CTA above the fold", persona: "Grandma" },
  { severity: "High", pillar: "Mobile", issue: "Touch targets under 44px on nav links", persona: "Teen" },
  { severity: "High", pillar: "Trust", issue: "No testimonials or social proof visible", persona: "Business" },
  { severity: "Medium", pillar: "Accessibility", issue: "3 images missing alt text", persona: "Screen Reader" },
  { severity: "Low", pillar: "Copy", issue: "Jargon in secondary nav ('API Docs')", persona: "Grandma" },
];

const severityColors: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-400",
  High: "bg-orange-500/10 text-orange-400",
  Medium: "bg-yellow-500/10 text-yellow-400",
  Low: "bg-blue-500/10 text-blue-400",
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
    <section className="mx-auto max-w-6xl px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-accent">
          Sample output
        </p>
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          What your report looks like
        </h2>

        {/* Report card */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          {/* Top: Grade + Lighthouse */}
          <div className="mb-8 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-500/10 text-4xl font-bold text-yellow-400">
                C
              </div>
              <div>
                <p className="text-2xl font-bold">72<span className="text-lg text-muted">/100</span></p>
                <p className="text-sm text-muted">example-site.com</p>
              </div>
            </div>
            <div className="flex gap-6">
              <ScoreCircle score={91} label="Performance" color="#22c55e" size={64} delay={0} />
              <ScoreCircle score={78} label="Accessibility" color="#3b82f6" size={64} delay={0.1} />
              <ScoreCircle score={85} label="Best Practices" color="#22c55e" size={64} delay={0.2} />
              <ScoreCircle score={92} label="SEO" color="#22c55e" size={64} delay={0.3} />
            </div>
          </div>

          {/* Pillar bars */}
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {pillarScores.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="w-36 text-sm text-muted">{p.name}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.score * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-mono font-semibold" style={{ color: p.color }}>
                  {p.score}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Issues table */}
          <div className="rounded-xl border border-border">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-muted">Issues Found</h3>
            </div>
            {sampleIssues.map((issue, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0"
              >
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${severityColors[issue.severity]}`}>
                  {issue.severity}
                </span>
                <span className="flex-1 text-sm">{issue.issue}</span>
                <span className="hidden text-xs text-muted sm:block">{issue.pillar}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">
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
