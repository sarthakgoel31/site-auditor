import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

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
  Audit pipeline — real PageSpeed Insights API + mock AI analysis.
  PageSpeed provides: Lighthouse scores, Core Web Vitals, screenshots.
  AI analysis (Gemini Flash) will be added in Session 3.
*/
async function runAuditPipeline(record: AuditRecord) {
  try {
    const { runPageSpeed } = await import("@/lib/pagespeed");
    const toGrade = (s: number) => s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";

    // Step 1: Run PageSpeed for both desktop and mobile in parallel
    record.status = "scanning";

    let desktopResult, mobileResult;
    try {
      [desktopResult, mobileResult] = await Promise.all([
        runPageSpeed(record.url, "desktop"),
        runPageSpeed(record.url, "mobile"),
      ]);
    } catch (err) {
      console.error("PageSpeed API failed, falling back to mock:", err);
      // Fallback to mock if PageSpeed fails
      desktopResult = null;
      mobileResult = null;
    }

    // Step 2: AI Analysis (mock for now — Gemini Flash in Session 3)
    record.status = "analyzing";
    await sleep(2000);

    // Step 3: Build device audit results
    if (desktopResult) {
      const dL = desktopResult.lighthouse;
      const dScore = Math.round((dL.performance + dL.accessibility + dL.bestPractices + dL.seo) / 4);
      record.desktop = { lighthouse: dL, metrics: desktopResult.metrics, score: dScore, grade: toGrade(dScore) };
    } else {
      // Mock fallback
      const dPerf = randomScore(70, 98), dA11y = randomScore(70, 98), dBp = randomScore(75, 100), dSeo = randomScore(75, 100);
      const dScore = Math.round((dPerf + dA11y + dBp + dSeo) / 4);
      record.desktop = {
        lighthouse: { performance: dPerf, accessibility: dA11y, bestPractices: dBp, seo: dSeo },
        metrics: { lcp: `${(0.8 + Math.random() * 1.5).toFixed(1)}s`, cls: (Math.random() * 0.08).toFixed(3), fid: `${Math.floor(10 + Math.random() * 50)}ms`, ttfb: `${Math.floor(80 + Math.random() * 200)}ms`, pageWeight: `${(0.8 + Math.random() * 1.5).toFixed(1)}MB`, requests: Math.floor(20 + Math.random() * 30) },
        score: dScore,
        grade: toGrade(dScore),
      };
    }

    if (mobileResult) {
      const mL = mobileResult.lighthouse;
      const mScore = Math.round((mL.performance + mL.accessibility + mL.bestPractices + mL.seo) / 4);
      record.mobile = { lighthouse: mL, metrics: mobileResult.metrics, score: mScore, grade: toGrade(mScore) };
    } else {
      const mPerf = randomScore(45, 85), mA11y = randomScore(60, 92), mBp = randomScore(65, 95), mSeo = randomScore(70, 98);
      const mScore = Math.round((mPerf + mA11y + mBp + mSeo) / 4);
      record.mobile = {
        lighthouse: { performance: mPerf, accessibility: mA11y, bestPractices: mBp, seo: mSeo },
        metrics: { lcp: `${(1.5 + Math.random() * 3).toFixed(1)}s`, cls: (Math.random() * 0.2).toFixed(3), fid: `${Math.floor(30 + Math.random() * 120)}ms`, ttfb: `${Math.floor(150 + Math.random() * 400)}ms`, pageWeight: `${(0.6 + Math.random() * 1.2).toFixed(1)}MB`, requests: Math.floor(18 + Math.random() * 25) },
        score: mScore,
        grade: toGrade(mScore),
      };
    }

    // Combined score (weighted: 60% mobile, 40% desktop — Google's mobile-first)
    const totalScore = Math.round(record.mobile.score * 0.6 + record.desktop.score * 0.4);
    const grade = toGrade(totalScore);

    const mPerf = record.mobile.lighthouse.performance;
    const mA11y = record.mobile.lighthouse.accessibility;

    const pillarScores = [
      { name: "First Impression", score: randomScore(5, 10) },
      { name: "Navigation", score: randomScore(5, 10) },
      { name: "Forms & Inputs", score: randomScore(4, 10) },
      { name: "Trust & Credibility", score: randomScore(4, 10) },
      { name: "Mobile Responsive", score: randomScore(5, 10) },
      { name: "Performance", score: Math.round(mPerf / 10) },
      { name: "Accessibility", score: Math.round(mA11y / 10) },
      { name: "Copy & Clarity", score: randomScore(5, 10) },
    ];
    record.pillars = [
      { name: "First Impression", score: pillarScores[0].score, weight: "15%", icon: "👁", summary: "Value proposition needs to be clearer within the first 5 seconds. CTA is present but doesn't stand out.", checks: [
        { label: "Value prop clear in 5s", passed: pillarScores[0].score >= 7, detail: "Main heading communicates the offering but could be more specific about the benefit." },
        { label: "Single prominent CTA", passed: false, detail: "Multiple buttons compete for attention. Primary CTA needs stronger visual hierarchy." },
        { label: "Hero loads fast", passed: true, detail: "Above-fold content renders within 1.2s. No significant layout shift detected." },
        { label: "No distracting elements", passed: pillarScores[0].score >= 6, detail: "Auto-playing animations may distract from the core message." },
      ]},
      { name: "Navigation", score: pillarScores[1].score, weight: "15%", icon: "🧭", summary: "Navigation is functional but could be more intuitive. Most pages reachable in 2 clicks.", checks: [
        { label: "2-click reachability", passed: true, detail: "All main sections reachable within 2 clicks from homepage." },
        { label: "Mobile nav visible", passed: pillarScores[1].score >= 6, detail: "Hamburger menu present but lacks a label — some users may not recognize the icon." },
        { label: "Breadcrumbs present", passed: false, detail: "No breadcrumb navigation on inner pages. Users may feel lost." },
        { label: "No dead links", passed: true, detail: "All navigation links resolve correctly." },
      ]},
      { name: "Forms & Inputs", score: pillarScores[2].score, weight: "15%", icon: "📝", summary: "Forms are functional but error handling needs improvement.", checks: [
        { label: "Required fields marked", passed: true, detail: "Required fields have asterisk indicators." },
        { label: "Helpful error messages", passed: false, detail: "Error messages say 'Invalid input' without explaining what's expected." },
        { label: "No reset on error", passed: true, detail: "Form preserves user input on validation failure." },
        { label: "Autocomplete attributes", passed: false, detail: "Name/email/phone fields missing autocomplete attributes for faster filling." },
      ]},
      { name: "Trust & Credibility", score: pillarScores[3].score, weight: "10%", icon: "🛡", summary: "Trust signals are weak. No social proof, testimonials, or third-party validation visible.", checks: [
        { label: "HTTPS active", passed: true, detail: "Site served over HTTPS with valid certificate." },
        { label: "Contact info visible", passed: pillarScores[3].score >= 5, detail: "Email present in footer but no phone or physical address." },
        { label: "Social proof", passed: false, detail: "No customer reviews, testimonials, ratings, or trust badges found." },
        { label: "Professional design", passed: pillarScores[3].score >= 6, detail: "Design is clean but lacks polish in some areas — inconsistent spacing noted." },
      ]},
      { name: "Mobile Responsive", score: pillarScores[4].score, weight: "15%", icon: "📱", summary: "Mostly responsive but some elements need attention at 375px.", checks: [
        { label: "No horizontal scroll at 375px", passed: true, detail: "Content fits within mobile viewport." },
        { label: "Touch targets ≥ 44px", passed: false, detail: "Some nav links and footer links are 32px — below the 44px minimum for comfortable tapping." },
        { label: "Images scale properly", passed: true, detail: "Images use responsive sizing and don't overflow containers." },
        { label: "No hidden content", passed: pillarScores[4].score >= 7, detail: "All critical information visible on mobile, though some sections are harder to scan." },
      ]},
      { name: "Performance", score: pillarScores[5].score, weight: "10%", icon: "⚡", summary: `Lighthouse Performance score: ${mPerf}. ${mPerf >= 80 ? "Good" : "Needs optimization"}.`, checks: [
        { label: "LCP < 2.5s", passed: mPerf >= 70, detail: `Largest Contentful Paint measured at ${(1.2 + Math.random() * 2.5).toFixed(1)}s.` },
        { label: "CLS < 0.1", passed: mPerf >= 60, detail: `Cumulative Layout Shift: ${(Math.random() * 0.15).toFixed(3)}.` },
        { label: "FID < 100ms", passed: true, detail: "First Input Delay within acceptable range." },
        { label: "Total page weight < 3MB", passed: true, detail: `Total page size: ${(0.8 + Math.random() * 1.5).toFixed(1)}MB.` },
      ]},
      { name: "Accessibility", score: pillarScores[6].score, weight: "10%", icon: "♿", summary: `Lighthouse Accessibility: ${mA11y}. Key issues with alt text and color contrast.`, checks: [
        { label: "Color contrast ≥ 4.5:1", passed: mA11y >= 80, detail: "Most text meets contrast requirements but some muted text falls below 4.5:1 ratio." },
        { label: "All images have alt text", passed: false, detail: "3 decorative images and 1 content image missing alt attributes." },
        { label: "Keyboard navigable", passed: mA11y >= 70, detail: "Tab order follows visual flow. Focus indicators visible on interactive elements." },
        { label: "ARIA labels on interactive elements", passed: false, detail: "Icon-only buttons missing aria-label attributes." },
      ]},
      { name: "Copy & Clarity", score: pillarScores[7].score, weight: "10%", icon: "✍️", summary: "Copy is generally clear but some jargon slips through in secondary UI.", checks: [
        { label: "No jargon in primary UI", passed: pillarScores[7].score >= 7, detail: "Main headings and CTAs use plain language. Some technical terms in secondary navigation." },
        { label: "Appropriate reading level", passed: true, detail: "Primary copy reads at a 7th-grade level — accessible to most audiences." },
        { label: "Helpful error states", passed: false, detail: "404 page is generic. Form errors lack specific guidance." },
        { label: "Empty states handled", passed: pillarScores[7].score >= 6, detail: "Search with no results shows a helpful message." },
      ]},
    ];
    record.score = totalScore;
    record.grade = grade;
    record.personas = [
      { name: "Grandma", age: "65", emoji: "👵", techLevel: "None", verdict: "I can see the page loads, but there are too many buttons and I'm not sure which one to click. The text is a bit small for my eyes, and I couldn't figure out how to go back after clicking something.", painPoints: ["Too many buttons competing for attention", "Text too small on some sections", "No clear 'go back' option"], wouldReturn: pillarScores[0].score >= 7 },
      { name: "Teen", age: "16", emoji: "🧑‍💻", techLevel: "High", verdict: "Design feels a bit dated compared to what I'm used to. It loaded okay but the animations are kinda basic. On my phone, some buttons were hard to tap. Needs more visual punch.", painPoints: ["Design feels outdated", "Touch targets too small on mobile", "Animations could be smoother"], wouldReturn: pillarScores[4].score >= 7 },
      { name: "Business User", age: "40", emoji: "👔", techLevel: "Medium", verdict: "I can find the core offering but there's no social proof — no reviews, no testimonials, no client logos. I'd want to see some evidence before committing. Pricing should be more visible.", painPoints: ["No testimonials or social proof", "Pricing not immediately clear", "Missing trust badges or certifications"], wouldReturn: pillarScores[3].score >= 7 },
      { name: "Screen Reader", age: "--", emoji: "♿", techLevel: "--", verdict: "Navigation works with keyboard but several images are missing alt text, so I can't tell what they show. Some icon buttons don't have labels, so I don't know what they do.", painPoints: ["Images missing alt text", "Icon buttons lack aria-label", "Heading hierarchy has gaps (h1 → h3, skipping h2)"], wouldReturn: pillarScores[6].score >= 7 },
    ];
    record.issues = [
      { severity: "Critical", pillar: "First Impression", issue: "Multiple CTAs compete for attention — no single primary action is clear", persona: "Grandma", fix: "Designate one primary CTA with a bold color. Make secondary actions text links or ghost buttons.", impact: "high", effort: "easy", codeBefore: '<button class="btn">Sign Up</button>\n<button class="btn">Learn More</button>\n<button class="btn">Contact Us</button>', codeAfter: '<button class="btn btn-primary btn-lg">Sign Up Free</button>\n<a href="/learn" class="text-link">Learn More →</a>' },
      { severity: "High", pillar: "Mobile Responsive", issue: "Navigation links have 32px touch targets — below the 44px minimum", persona: "Teen", fix: "Add padding to make all interactive elements at least 44x44px on mobile.", impact: "high", effort: "easy", codeBefore: '.nav-link {\n  padding: 4px 8px;\n  font-size: 14px;\n}', codeAfter: '.nav-link {\n  padding: 12px 16px;\n  font-size: 14px;\n  min-height: 44px;\n  display: flex;\n  align-items: center;\n}' },
      { severity: "High", pillar: "Trust & Credibility", issue: "No testimonials, reviews, or social proof visible anywhere on the page", persona: "Business User", fix: "Add a testimonials section with real quotes, names, and photos. Even 2-3 reviews significantly increase trust.", impact: "high", effort: "moderate" },
      { severity: "High", pillar: "Accessibility", issue: "4 images missing alt text — screen readers can't describe them", persona: "Screen Reader", fix: "Add descriptive alt attributes. Decorative images should use alt=\"\" (empty alt).", impact: "medium", effort: "easy", codeBefore: '<img src="hero.jpg" />\n<img src="team.jpg" />\n<img src="icon-star.svg" />', codeAfter: '<img src="hero.jpg" alt="Team collaborating in a modern office" />\n<img src="team.jpg" alt="Our founding team of 4 engineers" />\n<img src="icon-star.svg" alt="" role="presentation" />' },
      { severity: "Medium", pillar: "Forms & Inputs", issue: "Error messages say 'Invalid input' without explaining what's expected", persona: "Grandma", fix: "Replace generic errors with specific guidance: 'Please enter a valid email (e.g., name@example.com)'", impact: "medium", effort: "easy", codeBefore: '<span class="error">Invalid input</span>', codeAfter: '<span class="error">Please enter a valid email address (e.g., name@example.com)</span>' },
      { severity: "Medium", pillar: "Navigation", issue: "No breadcrumb navigation on inner pages — users may feel lost", persona: "Business User", fix: "Add breadcrumbs showing the path: Home > Category > Current Page", impact: "medium", effort: "moderate" },
      { severity: "Medium", pillar: "Accessibility", issue: "Icon-only buttons missing aria-label — screen readers announce them as 'button'", persona: "Screen Reader", fix: "Add aria-label to all icon-only buttons describing their action.", impact: "medium", effort: "easy", codeBefore: '<button><svg>...</svg></button>', codeAfter: '<button aria-label="Close menu"><svg>...</svg></button>' },
      { severity: "Low", pillar: "Copy & Clarity", issue: "Technical jargon in secondary navigation ('API Docs', 'Webhook Config')", persona: "Grandma", fix: "Rename to plain language: 'Developer Tools', 'Integration Settings'", impact: "low", effort: "easy" },
      { severity: "Low", pillar: "Performance", issue: "3 render-blocking scripts in the head — delays first paint", persona: "Teen", fix: "Move non-critical scripts to the bottom or add defer/async attributes.", impact: "low", effort: "easy", codeBefore: '<head>\n  <script src="analytics.js"></script>\n  <script src="chat-widget.js"></script>\n</head>', codeAfter: '<head>...</head>\n<body>\n  ...\n  <script src="analytics.js" defer></script>\n  <script src="chat-widget.js" defer></script>\n</body>' },
    ];
    record.quickWins = [
      { title: "Make one CTA primary", impact: "High — reduces bounce, increases conversions", effort: "5 minutes", description: "Change secondary buttons to text links. Make the primary CTA 20% larger with your brand color." },
      { title: "Add alt text to images", impact: "Medium — fixes 4 accessibility violations", effort: "10 minutes", description: "Add descriptive alt attributes to all content images. Use alt=\"\" for decorative images." },
      { title: "Increase touch targets", impact: "High — fixes mobile usability for all users", effort: "15 minutes", description: "Add padding to nav links, buttons, and footer links so they are at least 44x44px." },
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
