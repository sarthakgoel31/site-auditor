import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

/*
  In-memory audit store (Session 1 — will migrate to Supabase in Session 2).
  This works for dev/testing. In production, replace with DB calls.
*/
interface AuditRecord {
  id: string;
  url: string;
  status: "queued" | "scanning" | "analyzing" | "complete" | "error";
  createdAt: number;
  grade?: string;
  score?: number;
  lighthouse?: { performance: number; accessibility: number; bestPractices: number; seo: number };
  pillars?: { name: string; score: number }[];
  issues?: { severity: string; pillar: string; issue: string; persona: string; fix?: string }[];
  personas?: { name: string; verdict: string }[];
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

// POST — Start a new audit
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

  let url: string;
  try {
    const parsed = new URL(body.url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs" }, { status: 400 });
    }
    url = parsed.href;
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const id = randomUUID().slice(0, 8);
  const record: AuditRecord = {
    id,
    url,
    status: "queued",
    createdAt: Date.now(),
  };
  audits.set(id, record);

  // Start the audit pipeline (async, don't await)
  runAuditPipeline(record);

  return NextResponse.json({ id, url, status: "queued" });
}

// GET — Poll audit status
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id parameter required" }, { status: 400 });
  }

  const record = audits.get(id);
  if (!record) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}

/*
  Audit pipeline — Session 1: mock/demo pipeline with realistic timing.
  Session 2 will replace with:
  1. Google PageSpeed Insights API (Lighthouse scores)
  2. Browserless.io screenshots
  3. Gemini Flash analysis
*/
async function runAuditPipeline(record: AuditRecord) {
  try {
    // Step 1: Scanning (screenshots + lighthouse)
    record.status = "scanning";
    await sleep(3000);

    // Step 2: AI Analysis
    record.status = "analyzing";
    await sleep(4000);

    // Step 3: Generate results
    // TODO Session 2: Replace with real PageSpeed + Gemini pipeline
    const perf = randomScore(60, 98);
    const a11y = randomScore(65, 95);
    const bp = randomScore(70, 100);
    const seo = randomScore(70, 100);

    const pillarScores = [
      { name: "First Impression", score: randomScore(5, 10) },
      { name: "Navigation", score: randomScore(5, 10) },
      { name: "Forms & Inputs", score: randomScore(4, 10) },
      { name: "Trust & Credibility", score: randomScore(4, 10) },
      { name: "Mobile Responsive", score: randomScore(5, 10) },
      { name: "Performance", score: Math.round(perf / 10) },
      { name: "Accessibility", score: Math.round(a11y / 10) },
      { name: "Copy & Clarity", score: randomScore(5, 10) },
    ];

    const weights = [0.15, 0.15, 0.15, 0.10, 0.15, 0.10, 0.10, 0.10];
    const totalScore = Math.round(
      pillarScores.reduce((sum, p, i) => sum + p.score * 10 * weights[i], 0)
    );

    const grade = totalScore >= 90 ? "A" : totalScore >= 80 ? "B" : totalScore >= 70 ? "C" : totalScore >= 60 ? "D" : "F";

    record.lighthouse = { performance: perf, accessibility: a11y, bestPractices: bp, seo };
    record.pillars = pillarScores;
    record.score = totalScore;
    record.grade = grade;
    record.personas = [
      { name: "Grandma", verdict: `I can see the main page loads, but I'm not sure what to click first. The text is a bit small for my eyes.` },
      { name: "Teen", verdict: `The site loads okay but the design feels a bit dated. Needs more visual punch and faster interactions.` },
      { name: "Business", verdict: `I can find the core offering but would like to see more social proof and clearer pricing upfront.` },
      { name: "Screen Reader", verdict: `Some images are missing alt text and the navigation could use better ARIA labels for keyboard users.` },
    ];
    record.issues = [
      { severity: "High", pillar: "First Impression", issue: "CTA button not prominent enough above the fold", persona: "Grandma", fix: "Make the primary CTA larger with a contrasting color" },
      { severity: "Medium", pillar: "Mobile", issue: "Some touch targets are under 44px", persona: "Teen", fix: "Increase button padding to at least 44x44px" },
      { severity: "Medium", pillar: "Accessibility", issue: "Images missing descriptive alt text", persona: "Screen Reader", fix: "Add alt attributes describing the image content" },
      { severity: "Low", pillar: "Trust", issue: "No visible testimonials or reviews", persona: "Business", fix: "Add a social proof section with customer quotes" },
    ];

    record.status = "complete";
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
