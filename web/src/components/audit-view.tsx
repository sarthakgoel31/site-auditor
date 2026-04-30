"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScoreCircle } from "./score-circle";

/* ─── Types ─── */
interface PillarDetail {
  name: string; score: number; weight: string; icon: string; summary: string;
  checks: { label: string; passed: boolean; detail: string }[];
}
interface Issue {
  severity: string; pillar: string; issue: string; persona: string; fix: string;
  impact: string; effort: string; codeBefore?: string; codeAfter?: string;
}
interface PersonaVerdict {
  name: string; age: string; emoji: string; techLevel: string; verdict: string;
  painPoints: string[]; wouldReturn: boolean;
  score?: number; struggles?: string[]; fixes?: string[];
}
interface DeviceAudit {
  lighthouse: { performance: number; accessibility: number; bestPractices: number; seo: number };
  metrics: { lcp: string; cls: string; fid: string; ttfb: string; pageWeight: string; requests: number };
  score: number;
  grade: string;
}
interface AuditResult {
  id: string; url: string;
  status: "queued" | "scanning" | "analyzing" | "complete" | "error";
  grade?: string; score?: number;
  desktop?: DeviceAudit; mobile?: DeviceAudit;
  pillars?: PillarDetail[]; issues?: Issue[]; personas?: PersonaVerdict[];
  quickWins?: { title: string; impact: string; effort: string; description: string }[];
  llmUsed?: string;
  error?: string;
}

/* ─── Constants ─── */
const scanSteps = [
  { key: "queued", label: "Queued", detail: "Waiting to start..." },
  { key: "scanning", label: "Scanning", detail: "Taking screenshots at 3 viewports + running Lighthouse..." },
  { key: "analyzing", label: "Analyzing", detail: "AI evaluating from 4 persona perspectives across 8 UX pillars..." },
  { key: "complete", label: "Complete", detail: "Your report is ready." },
];

const sevColors: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-400 border-red-500/20",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Low: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};
const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25" },
  B: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/25" },
  C: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/25" },
  D: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/25" },
  F: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/25" },
  "--": { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/25" },
};
const pillarColors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4", "#ec4899", "#f97316"];

/* ─── Chevron Icon ─── */
function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted shrink-0">
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

/* ─── Section Card ─── */
function Section({ title, count, children, defaultOpen = false }: {
  title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-8 rounded-2xl glass-surface overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-7 py-5 text-left transition-colors hover:bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          {count !== undefined && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold font-mono text-accent">{count}</span>
          )}
        </div>
        <Chevron open={open} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="border-t border-glass-border px-7 py-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Device Tab Panel ─── */
function DevicePanel({ device, label }: { device: DeviceAudit; label: string }) {
  const gc = gradeColors[device.grade] || gradeColors["--"];
  return (
    <div className="space-y-6">
      {/* Mini grade + Lighthouse */}
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-5">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${gc.border} ${gc.bg} text-2xl font-bold ${gc.text}`}>
            {device.grade}
          </div>
          <div>
            <p className="text-2xl font-bold">{device.score}<span className="text-base text-muted">/100</span></p>
            <p className="text-sm text-muted">{label} Score</p>
          </div>
        </div>
        <div className="flex gap-5">
          <ScoreCircle score={device.lighthouse.performance} label="Perf" color="#22c55e" size={60} delay={0} />
          <ScoreCircle score={device.lighthouse.accessibility} label="A11y" color="#3b82f6" size={60} delay={0.05} />
          <ScoreCircle score={device.lighthouse.bestPractices} label="BP" color="#f59e0b" size={60} delay={0.1} />
          <ScoreCircle score={device.lighthouse.seo} label="SEO" color="#a855f7" size={60} delay={0.15} />
        </div>
      </div>
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {[
          { label: "LCP", value: device.metrics.lcp, good: parseFloat(device.metrics.lcp) < 2.5 },
          { label: "CLS", value: device.metrics.cls, good: parseFloat(device.metrics.cls) < 0.1 },
          { label: "FID", value: device.metrics.fid, good: parseInt(device.metrics.fid) < 100 },
          { label: "TTFB", value: device.metrics.ttfb, good: parseInt(device.metrics.ttfb) < 300 },
          { label: "Size", value: device.metrics.pageWeight, good: parseFloat(device.metrics.pageWeight) < 2 },
          { label: "Requests", value: String(device.metrics.requests), good: device.metrics.requests < 40 },
        ].map((m) => (
          <div key={m.label} className="rounded-xl glass-card p-3 text-center">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">{m.label}</p>
            <p className={`mt-1 text-lg font-bold font-mono ${m.good ? "text-emerald-400" : "text-orange-400"}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function AuditView({ id }: { id: string }) {
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [deviceTab, setDeviceTab] = useState<"combined" | "desktop" | "mobile">("combined");
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [expandedPersona, setExpandedPersona] = useState<number | null>(null);
  const [issueFilter, setIssueFilter] = useState("all");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function poll() {
      try {
        const res = await fetch(`/api/audit?id=${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setAudit(data);
        if (data.status === "complete" || data.status === "error") clearInterval(interval);
      } catch { /* retry */ }
    }
    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (!audit) return (
    <div className="grid-bg flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
    </div>
  );

  if (audit.status === "error") return (
    <div className="grid-bg flex min-h-screen flex-col items-center justify-center gap-5 px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 text-4xl">✕</div>
      <h1 className="text-3xl font-bold">Audit Failed</h1>
      <p className="text-lg text-muted">{audit.error || "Something went wrong."}</p>
      <a href="/" className="mt-4 rounded-xl bg-accent px-8 py-3 font-semibold text-white hover:bg-accent-light">Try Again</a>
    </div>
  );

  /* ─── Progress ─── */
  if (audit.status !== "complete") {
    const cur = scanSteps.findIndex((s) => s.key === audit.status);
    return (
      <div className="grid-bg flex min-h-screen flex-col items-center justify-center gap-10 px-6">
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-accent/[0.04] blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="pulse-glow flex h-28 w-28 items-center justify-center rounded-3xl border border-accent/25 bg-surface">
          <svg className="h-12 w-12 text-accent animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </motion.div>
        <div className="text-center">
          <h1 className="mb-3 text-3xl font-bold">Auditing {audit.url}</h1>
          <p className="text-lg text-muted">{scanSteps[cur]?.detail}</p>
        </div>
        <div className="flex gap-5">
          {scanSteps.slice(0, -1).map((step, i) => (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${i < cur ? "bg-emerald-500 text-white" : i === cur ? "bg-accent text-white animate-pulse" : "bg-white/5 text-muted"}`}>
                {i < cur ? "✓" : i + 1}
              </div>
              <span className={`hidden text-[15px] sm:block ${i <= cur ? "text-foreground font-medium" : "text-muted"}`}>{step.label}</span>
              {i < scanSteps.length - 2 && <div className={`mx-3 h-px w-10 ${i < cur ? "bg-emerald-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── COMPLETE REPORT ─── */
  const filteredIssues = audit.issues?.filter((iss) => issueFilter === "all" || iss.severity === issueFilter) || [];
  const issueCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  audit.issues?.forEach((i) => { if (i.severity in issueCounts) issueCounts[i.severity as keyof typeof issueCounts]++; });
  const gc = gradeColors[audit.grade || "C"];

  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14 flex flex-col items-center gap-7 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
            className={`flex h-36 w-36 items-center justify-center rounded-3xl border-2 ${gc.border} ${gc.bg} text-7xl font-bold ${gc.text}`}>
            {audit.grade}
          </motion.div>
          <div>
            <p className="text-5xl font-bold">{audit.score}<span className="text-2xl text-muted">/100</span></p>
            <p className="mt-2 text-lg text-muted">{audit.url}</p>
            {audit.llmUsed && (
              <p className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Analysis by {audit.llmUsed}
              </p>
            )}
          </div>
        </motion.div>

        {/* ── DEVICE TABS: Desktop / Mobile / Combined ── */}
        {(audit.desktop || audit.mobile) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-10 glass-surface rounded-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-glass-border">
              {(["combined", "desktop", "mobile"] as const).map((tab) => (
                <button key={tab} onClick={() => setDeviceTab(tab)}
                  className={`flex-1 py-4 text-sm font-semibold transition-all ${
                    deviceTab === tab
                      ? "text-accent border-b-2 border-accent bg-white/[0.02]"
                      : "text-muted hover:text-foreground hover:bg-white/[0.02]"
                  }`}>
                  <div className="flex items-center justify-center gap-2">
                    {tab === "combined" && <span>🏆</span>}
                    {tab === "desktop" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                    )}
                    {tab === "mobile" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>
                    )}
                    {tab === "combined" ? "Combined" : tab === "desktop" ? "Desktop" : "Mobile"}
                    {tab !== "combined" && (
                      <span className={`ml-1 rounded-md px-1.5 py-0.5 text-xs font-bold ${
                        (tab === "desktop" ? audit.desktop?.score ?? 0 : audit.mobile?.score ?? 0) >= 80 ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                      }`}>
                        {tab === "desktop" ? audit.desktop?.score : audit.mobile?.score}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {/* Tab content */}
            <div className="p-6">
              {deviceTab === "combined" && audit.desktop && audit.mobile && (
                <div className="flex flex-col items-center gap-6">
                  <p className="text-sm text-muted">Weighted: 60% Mobile + 40% Desktop (Google mobile-first indexing)</p>
                  <div className="flex items-center gap-12">
                    <div className="text-center">
                      <p className="text-xs text-muted mb-2">Desktop</p>
                      <ScoreCircle score={audit.desktop.score} label="" color="#3b82f6" size={80} delay={0} />
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-accent">{audit.score}</p>
                      <p className="text-sm text-muted">Combined</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted mb-2">Mobile</p>
                      <ScoreCircle score={audit.mobile.score} label="" color="#f59e0b" size={80} delay={0.1} />
                    </div>
                  </div>
                </div>
              )}
              {deviceTab === "desktop" && audit.desktop && <DevicePanel device={audit.desktop} label="Desktop" />}
              {deviceTab === "mobile" && audit.mobile && <DevicePanel device={audit.mobile} label="Mobile" />}
            </div>
          </motion.div>
        )}

        {/* ── QUICK WINS ── */}
        {audit.quickWins && (
          <Section title="Quick Wins" count={audit.quickWins.length} defaultOpen={true}>
            <div className="grid gap-4 md:grid-cols-3">
              {audit.quickWins.map((qw, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="text-xl">🎯</span>
                    <h3 className="text-[15px] font-bold text-emerald-400">{qw.title}</h3>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-muted">{qw.description}</p>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-400">Impact: {qw.impact}</span>
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 text-muted">Effort: {qw.effort}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ── UX PILLARS ── */}
        {audit.pillars && (
          <Section title="UX Pillar Scores" count={8} defaultOpen={true}>
            <div className="space-y-1">
              {audit.pillars.map((p, i) => (
                <div key={p.name}>
                  <button onClick={() => setExpandedPillar(expandedPillar === i ? null : i)}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/[0.03]">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="w-40 text-left text-[15px] font-medium">{p.name}</span>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.score * 10}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                        className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: pillarColors[i] }} />
                    </div>
                    <span className="w-8 text-right text-[15px] font-mono font-bold" style={{ color: pillarColors[i] }}>{p.score}</span>
                    <span className="w-12 text-right text-xs text-muted">{p.weight}</span>
                    <Chevron open={expandedPillar === i} />
                  </button>
                  <AnimatePresence>
                    {expandedPillar === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="ml-14 mr-4 mb-3 mt-1 rounded-xl glass-card p-5">
                          <p className="mb-5 text-[15px] text-muted leading-relaxed">{p.summary}</p>
                          <div className="space-y-3">
                            {p.checks.map((c, ci) => (
                              <div key={ci} className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${c.passed ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                  {c.passed ? "✓" : "✕"}
                                </div>
                                <div>
                                  <p className={`text-[15px] font-medium ${c.passed ? "" : "text-red-400"}`}>{c.label}</p>
                                  <p className="mt-0.5 text-sm text-muted">{c.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── PERSONAS ── */}
        {audit.personas && (
          <Section title="Persona Verdicts" count={4} defaultOpen={true}>
            <div className="grid gap-4 sm:grid-cols-2">
              {audit.personas.map((p, i) => (
                <div key={p.name} className="rounded-xl glass-card overflow-hidden">
                  <button onClick={() => setExpandedPersona(expandedPersona === i ? null : i)}
                    className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-white/[0.03]">
                    <span className="text-4xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[15px] font-bold">{p.name}</h3>
                        {p.age !== "--" && <span className="text-xs text-muted">Age {p.age}</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">Tech: {p.techLevel}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${p.wouldReturn ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {p.wouldReturn ? "Would return" : "Would leave"}
                    </span>
                    <Chevron open={expandedPersona === i} />
                  </button>
                  <AnimatePresence>
                    {expandedPersona === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="border-t border-glass-border px-5 pb-5 pt-4">
                          {p.score != null && (
                            <div className="mb-4 flex items-center gap-3">
                              <span className="text-xs font-bold text-muted uppercase tracking-[0.15em]">Score</span>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-glass-border overflow-hidden">
                                  <div className={`h-full rounded-full ${p.score >= 7 ? "bg-emerald-500" : p.score >= 4 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${p.score * 10}%` }} />
                                </div>
                                <span className={`text-sm font-bold ${p.score >= 7 ? "text-emerald-400" : p.score >= 4 ? "text-amber-400" : "text-red-400"}`}>{p.score}/10</span>
                              </div>
                            </div>
                          )}
                          <p className="mb-4 text-[15px] italic text-muted leading-relaxed">&ldquo;{p.verdict}&rdquo;</p>
                          <p className="mb-2 text-xs font-bold text-muted uppercase tracking-[0.15em]">Pain Points</p>
                          <ul className="space-y-2">
                            {p.painPoints.map((pp, pi) => (
                              <li key={pi} className="flex items-start gap-2.5 text-[15px]">
                                <span className="text-red-400 mt-1 text-xs">●</span>
                                <span className="text-muted">{pp}</span>
                              </li>
                            ))}
                          </ul>
                          {p.struggles && p.struggles.length > 0 && (
                            <>
                              <p className="mt-4 mb-2 text-xs font-bold text-muted uppercase tracking-[0.15em]">Struggled With</p>
                              <ul className="space-y-2">
                                {p.struggles.map((s, si) => (
                                  <li key={si} className="flex items-start gap-2.5 text-[15px]">
                                    <span className="text-amber-400 mt-1 text-xs">▲</span>
                                    <span className="text-muted">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {p.fixes && p.fixes.length > 0 && (
                            <>
                              <p className="mt-4 mb-2 text-xs font-bold text-muted uppercase tracking-[0.15em]">Recommended Fixes</p>
                              <ul className="space-y-2">
                                {p.fixes.map((f, fi) => (
                                  <li key={fi} className="flex items-start gap-2.5 text-[15px]">
                                    <span className="text-emerald-400 mt-1 text-xs">✓</span>
                                    <span className="text-muted">{f}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── ISSUES ── */}
        {audit.issues && audit.issues.length > 0 && (
          <Section title="Issues Found" count={audit.issues.length} defaultOpen={true}>
            {/* Filter chips */}
            <div className="mb-6 flex flex-wrap gap-2">
              {["all", "Critical", "High", "Medium", "Low"].map((f) => (
                <button key={f} onClick={() => setIssueFilter(f)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    issueFilter === f ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-white/[0.04] text-muted hover:bg-white/[0.08]"
                  }`}>
                  {f === "all" ? `All (${audit.issues!.length})` : `${f} (${issueCounts[f as keyof typeof issueCounts]})`}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredIssues.map((issue, i) => (
                <div key={i} className="rounded-xl glass-card overflow-hidden">
                  <button onClick={() => setExpandedIssue(expandedIssue === i ? null : i)}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-white/[0.03]">
                    <span className={`mt-0.5 shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${sevColors[issue.severity]}`}>
                      {issue.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold">{issue.issue}</p>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted">
                        <span>{issue.pillar}</span>
                        <span className="text-zinc-600">|</span>
                        <span>{issue.persona}</span>
                        <span className="text-zinc-600">|</span>
                        <span className={issue.impact === "high" ? "text-red-400 font-medium" : issue.impact === "medium" ? "text-yellow-400" : "text-blue-400"}>
                          {issue.impact} impact
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span>{issue.effort} fix</span>
                      </div>
                    </div>
                    <Chevron open={expandedIssue === i} />
                  </button>
                  <AnimatePresence>
                    {expandedIssue === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="border-t border-glass-border px-5 pb-5 pt-4 space-y-4">
                          <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.15em] mb-2">How to fix</p>
                            <p className="text-[15px] text-muted leading-relaxed">{issue.fix}</p>
                          </div>
                          {issue.codeBefore && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-2 text-xs font-bold text-red-400 uppercase tracking-[0.15em]">Before</p>
                                <pre className="rounded-xl bg-red-500/[0.04] border border-red-500/10 p-4 text-sm font-mono text-red-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">{issue.codeBefore}</pre>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-bold text-emerald-400 uppercase tracking-[0.15em]">After</p>
                                <pre className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 p-4 text-sm font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">{issue.codeAfter}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── SHARE + EMBED ── */}
        <div className="mb-8 glass-surface rounded-2xl p-7">
          <h2 className="mb-5 text-xl font-bold">Share your score</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My site scored ${audit.grade} (${audit.score}/100) on Site Auditor!`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#1DA1F2]/10 px-5 py-3 text-sm font-semibold text-[#1DA1F2] transition-all hover:bg-[#1DA1F2]/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#0A66C2]/10 px-5 py-3 text-sm font-semibold text-[#0A66C2] transition-all hover:bg-[#0A66C2]/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out my site's UX audit score: ${audit.grade} (${audit.score}/100) ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-5 py-3 text-sm font-semibold text-[#25D366] transition-all hover:bg-[#25D366]/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-5 py-3 text-sm font-semibold text-muted transition-all hover:bg-white/[0.08] hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Copy link
            </button>
          </div>

          {/* Embeddable badge */}
          <div>
            <p className="mb-2 text-sm font-semibold text-muted">Embed badge on your site</p>
            <div className="flex items-center gap-4">
              <img src={`/api/badge/${id}`} alt="Site Auditor Badge" height={36} />
              <button
                onClick={() => {
                  const base = typeof window !== "undefined" ? window.location.origin : "";
                  navigator.clipboard.writeText(`<a href="${window.location.href}"><img src="${base}/api/badge/${id}" alt="UX Audit Score" /></a>`);
                }}
                className="rounded-lg bg-white/[0.04] px-4 py-2 text-xs font-mono text-muted transition-all hover:bg-white/[0.08] hover:text-foreground"
              >
                Copy embed code
              </button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex flex-col items-center gap-5 py-12 text-center">
          <p className="text-[15px] text-muted">
            Free audit by{" "}
            <a href="https://sarthakgoel.cv" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-accent-light">
              Sarthak Goel
            </a>
          </p>
          <a href="/" className="rounded-xl bg-accent px-8 py-3 text-[15px] font-semibold text-white hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 transition-all">
            Audit another site
          </a>
        </div>
      </div>
    </div>
  );
}
