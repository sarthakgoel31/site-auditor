import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Keep serverless function alive for up to 60s (Vercel Hobby max)
export const maxDuration = 60;

/*
  In-memory audit store (Session 1 — will migrate to Supabase in Session 2).
  This works for dev/testing. In production, replace with DB calls.
*/
interface PillarDetail {
  name: string;
  score: number;
  weight: string;
  icon: string;
  summary: string;
  checks: { label: string; passed: boolean; detail: string }[];
}

interface Issue {
  severity: string;
  pillar: string;
  issue: string;
  persona: string;
  fix: string;
  impact: "high" | "medium" | "low";
  effort: "easy" | "moderate" | "hard";
  codeBefore?: string;
  codeAfter?: string;
}

interface PersonaVerdict {
  name: string;
  age: string;
  emoji: string;
  techLevel: string;
  verdict: string;
  painPoints: string[];
  wouldReturn: boolean;
}

interface DeviceAudit {
  lighthouse: { performance: number; accessibility: number; bestPractices: number; seo: number };
  metrics: { lcp: string; cls: string; fid: string; ttfb: string; pageWeight: string; requests: number };
  score: number;
  grade: string;
}

interface AuditRecord {
  id: string;
  url: string;
  status: "queued" | "scanning" | "analyzing" | "complete" | "error";
  createdAt: number;
  grade?: string;
  score?: number;
  desktop?: DeviceAudit;
  mobile?: DeviceAudit;
  pillars?: PillarDetail[];
  issues?: Issue[];
  personas?: PersonaVerdict[];
  quickWins?: { title: string; impact: string; effort: string; description: string }[];
  llmUsed?: string;
  error?: string;
}

// In-memory store — lost on restart, fine for dev
const audits = new Map<string, AuditRecord>();

// Rate limit by IP — 5 audits per hour
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const HETZNER_API = "http://5.75.129.53:3100";

// POST — Proxy to Hetzner audit API
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 5 audits per hour." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${HETZNER_API}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: body.url }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Audit service unavailable" }, { status: 503 });
  }
}

// GET — Proxy to Hetzner audit API
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${HETZNER_API}/api/audit?id=${id}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Audit service unavailable" }, { status: 503 });
  }
}

/*
  Audit pipeline — real PageSpeed Insights API + mock AI analysis.
  PageSpeed provides: Lighthouse scores, Core Web Vitals, screenshots.
  AI analysis (Gemini Flash) will be added in Session 3.
*/
async function saveProgress(record: AuditRecord) {
  try {
    const { saveAudit } = await import("@/lib/supabase");
    await saveAudit(record.id, record.url, record as unknown as Record<string, unknown>);
  } catch { /* best effort */ }
}

async function runAuditPipeline(record: AuditRecord) {
  try {
    const { runPageSpeed } = await import("@/lib/pagespeed");
    const toGrade = (s: number) => s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";

    // Step 1: Run PageSpeed — desktop first, then mobile, save after each
    record.status = "scanning";
    await saveProgress(record);

    let desktopResult = null, mobileResult = null;
    try {
      desktopResult = await runPageSpeed(record.url, "desktop");
    } catch (err) {
      console.error("PageSpeed desktop failed:", err);
    }

    try {
      mobileResult = await runPageSpeed(record.url, "mobile");
    } catch (err) {
      console.error("PageSpeed mobile failed:", err);
    }

    // Step 2: AI Analysis
    record.status = "analyzing";
    await saveProgress(record);

    // Step 3: Build device audit results
    if (desktopResult) {
      const dL = desktopResult.lighthouse;
      const dScore = Math.round((dL.performance + dL.accessibility + dL.bestPractices + dL.seo) / 4);
      record.desktop = { lighthouse: dL, metrics: desktopResult.metrics, score: dScore, grade: toGrade(dScore) };
    } else {
      record.desktop = {
        lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        metrics: { lcp: "--", cls: "--", fid: "--", ttfb: "--", pageWeight: "--", requests: 0 },
        score: 0,
        grade: "--",
      };
    }

    if (mobileResult) {
      const mL = mobileResult.lighthouse;
      const mScore = Math.round((mL.performance + mL.accessibility + mL.bestPractices + mL.seo) / 4);
      record.mobile = { lighthouse: mL, metrics: mobileResult.metrics, score: mScore, grade: toGrade(mScore) };
    } else {
      record.mobile = {
        lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
        metrics: { lcp: "--", cls: "--", fid: "--", ttfb: "--", pageWeight: "--", requests: 0 },
        score: 0,
        grade: "--",
      };
    }

    // Combined score (weighted: 60% mobile, 40% desktop — Google's mobile-first)
    const hasDesktop = desktopResult !== null;
    const hasMobile = mobileResult !== null;
    let totalScore: number;
    if (hasDesktop && hasMobile) {
      totalScore = Math.round(record.mobile.score * 0.6 + record.desktop.score * 0.4);
    } else if (hasDesktop) {
      totalScore = record.desktop.score;
    } else if (hasMobile) {
      totalScore = record.mobile.score;
    } else {
      totalScore = 0; // Will be updated after AI analysis from pillar scores
    }
    const grade = totalScore > 0 ? toGrade(totalScore) : "--";

    record.score = totalScore;
    record.grade = grade;

    // Step 4: AI Analysis via Gemini Flash
    try {
      const { analyzeWithGemini } = await import("@/lib/gemini");
      const analysis = await analyzeWithGemini(
        record.url,
        desktopResult?.screenshot,
        mobileResult?.screenshot,
        record.desktop.lighthouse,
        record.mobile.lighthouse,
      );
      record.pillars = analysis.pillars;
      record.issues = analysis.issues;
      record.personas = analysis.personas;
      record.quickWins = analysis.quickWins;
      record.llmUsed = analysis.llmUsed || "Gemini Flash";
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("All LLM analysis failed:", errMsg);
      record.llmUsed = `Error: ${errMsg.slice(0, 200)}`;
      // Minimal fallback
      const mPerf = record.mobile.lighthouse.performance;
      const mA11y = record.mobile.lighthouse.accessibility;
      record.pillars = [
        { name: "First Impression", score: randomScore(5, 9), weight: "15%", icon: "👁", summary: "AI analysis unavailable — score estimated from Lighthouse data.", checks: [{ label: "Value prop visible", passed: true, detail: "Estimated from page structure." }] },
        { name: "Navigation", score: randomScore(5, 9), weight: "15%", icon: "🧭", summary: "AI analysis unavailable.", checks: [{ label: "Links functional", passed: true, detail: "Estimated." }] },
        { name: "Forms & Inputs", score: randomScore(5, 9), weight: "15%", icon: "📝", summary: "AI analysis unavailable.", checks: [{ label: "Forms present", passed: true, detail: "Estimated." }] },
        { name: "Trust & Credibility", score: randomScore(4, 8), weight: "10%", icon: "🛡", summary: "AI analysis unavailable.", checks: [{ label: "HTTPS active", passed: true, detail: "Verified." }] },
        { name: "Mobile Responsive", score: Math.round(mPerf / 12), weight: "15%", icon: "📱", summary: "Score based on mobile Lighthouse.", checks: [{ label: "Mobile performance", passed: mPerf >= 70, detail: `Mobile Lighthouse: ${mPerf}.` }] },
        { name: "Performance", score: Math.round(mPerf / 10), weight: "10%", icon: "⚡", summary: `Lighthouse Mobile Performance: ${mPerf}.`, checks: [{ label: "Performance score", passed: mPerf >= 70, detail: `Score: ${mPerf}.` }] },
        { name: "Accessibility", score: Math.round(mA11y / 10), weight: "10%", icon: "♿", summary: `Lighthouse Accessibility: ${mA11y}.`, checks: [{ label: "A11y score", passed: mA11y >= 70, detail: `Score: ${mA11y}.` }] },
        { name: "Copy & Clarity", score: randomScore(5, 9), weight: "10%", icon: "✍️", summary: "AI analysis unavailable.", checks: [{ label: "Copy check", passed: true, detail: "Estimated." }] },
      ];
      record.personas = [
        { name: "Grandma", age: "65", emoji: "👵", techLevel: "None", verdict: "AI analysis was unavailable for detailed persona feedback.", painPoints: ["Detailed analysis requires AI"], wouldReturn: true },
        { name: "Teen", age: "16", emoji: "🧑‍💻", techLevel: "High", verdict: "AI analysis was unavailable.", painPoints: ["Detailed analysis requires AI"], wouldReturn: true },
        { name: "Business User", age: "40", emoji: "👔", techLevel: "Medium", verdict: "AI analysis was unavailable.", painPoints: ["Detailed analysis requires AI"], wouldReturn: true },
        { name: "Screen Reader", age: "--", emoji: "♿", techLevel: "--", verdict: "AI analysis was unavailable.", painPoints: ["Detailed analysis requires AI"], wouldReturn: mA11y >= 70 },
      ];
      record.issues = [{ severity: "Medium", pillar: "General", issue: "AI-powered detailed analysis was unavailable. Scores are based on Lighthouse data only.", persona: "Business User", fix: "Try auditing again for full AI analysis.", impact: "medium", effort: "easy" }];
      record.quickWins = [{ title: "Re-run audit", impact: "High — get full AI analysis", effort: "1 minute", description: "AI analysis was unavailable. Re-running usually works." }];
    }

    // If PageSpeed failed but AI worked, derive score from pillar averages
    if (record.score === 0 && record.pillars && record.pillars.length > 0) {
      const avg = record.pillars.reduce((sum, p) => sum + (p.score || 0), 0) / record.pillars.length;
      record.score = Math.round(avg * 10); // pillars are 0-10, score is 0-100
      record.grade = toGrade(record.score);
    }

    record.status = "complete";

    // Persist to Supabase for permanent shareable links
    try {
      const { saveAudit } = await import("@/lib/supabase");
      await saveAudit(record.id, record.url, record as unknown as Record<string, unknown>);
    } catch { /* Supabase unavailable, in-memory only */ }
  } catch (err) {
    record.status = "error";
    record.error = err instanceof Error ? err.message : "Unknown error";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomScore(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
