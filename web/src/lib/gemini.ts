/**
 * Gemini Flash AI analysis — free tier, 15 RPM.
 * Analyzes PageSpeed screenshots from 4 persona perspectives across 8 UX pillars.
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

export interface GeminiAnalysis {
  pillars: PillarDetail[];
  issues: Issue[];
  personas: PersonaVerdict[];
  quickWins: { title: string; impact: string; effort: string; description: string }[];
}

const SYSTEM_PROMPT = `You are a UX auditor. You analyze website screenshots and Lighthouse data to produce actionable UX reports.

You evaluate from 4 user personas:
1. Grandma (65, no tech skills) — Can she find the CTA? Is text readable? Any jargon?
2. Teen (16, high tech) — Is it fast? Modern design? Mobile-first?
3. Business User (40, medium tech) — Trust signals? Pricing clarity? Professional feel?
4. Screen Reader (accessibility) — Alt text? ARIA labels? Keyboard navigable?

You score 8 UX pillars (each 0-10):
1. First Impression (15%) — Value prop clear in 5s? Prominent CTA? Fast hero load?
2. Navigation (15%) — 2-click reachability? Mobile nav? Breadcrumbs? Dead links?
3. Forms & Inputs (15%) — Required marked? Error messages helpful? No reset on error?
4. Trust & Credibility (10%) — HTTPS? Contact info? Social proof? Consistent design?
5. Mobile Responsive (15%) — No h-scroll at 375px? Touch targets ≥44px? Images scale?
6. Performance (10%) — Based on Lighthouse performance score.
7. Accessibility (10%) — Contrast ≥4.5:1? Alt text? Keyboard nav? ARIA labels?
8. Copy & Clarity (10%) — No jargon? Appropriate reading level? Helpful errors?

Respond ONLY with valid JSON matching this exact structure (no markdown, no explanation):
{
  "pillars": [
    {
      "name": "First Impression",
      "score": 7,
      "weight": "15%",
      "icon": "👁",
      "summary": "...",
      "checks": [
        {"label": "Value prop clear in 5s", "passed": true, "detail": "..."},
        {"label": "Single prominent CTA", "passed": false, "detail": "..."},
        {"label": "Hero loads fast", "passed": true, "detail": "..."},
        {"label": "No distracting elements", "passed": true, "detail": "..."}
      ]
    }
    // ... all 8 pillars with 4 checks each
  ],
  "issues": [
    {
      "severity": "Critical|High|Medium|Low",
      "pillar": "...",
      "issue": "...",
      "persona": "Grandma|Teen|Business User|Screen Reader",
      "fix": "...",
      "impact": "high|medium|low",
      "effort": "easy|moderate|hard",
      "codeBefore": "optional HTML/CSS showing the problem",
      "codeAfter": "optional HTML/CSS showing the fix"
    }
  ],
  "personas": [
    {
      "name": "Grandma",
      "age": "65",
      "emoji": "👵",
      "techLevel": "None",
      "verdict": "First person quote of their experience...",
      "painPoints": ["point 1", "point 2", "point 3"],
      "wouldReturn": false
    }
    // ... all 4 personas
  ],
  "quickWins": [
    {
      "title": "...",
      "impact": "High — ...",
      "effort": "5 minutes",
      "description": "..."
    }
    // exactly 3 quick wins
  ]
}

IMPORTANT:
- Always provide exactly 8 pillars with exactly 4 checks each
- Provide 5-12 issues sorted by severity (Critical first)
- Provide exactly 4 persona verdicts
- Provide exactly 3 quick wins
- Include codeBefore/codeAfter for at least 3 issues
- Be specific and actionable, not generic
- Use the Lighthouse scores provided to inform your Performance and Accessibility pillar scores`;

export async function analyzeWithGemini(
  url: string,
  desktopScreenshot: string | undefined,
  mobileScreenshot: string | undefined,
  lighthouseDesktop: { performance: number; accessibility: number; bestPractices: number; seo: number },
  lighthouseMobile: { performance: number; accessibility: number; bestPractices: number; seo: number },
): Promise<GeminiAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  parts.push({
    text: `Analyze this website: ${url}

Lighthouse Desktop: Performance=${lighthouseDesktop.performance}, Accessibility=${lighthouseDesktop.accessibility}, Best Practices=${lighthouseDesktop.bestPractices}, SEO=${lighthouseDesktop.seo}
Lighthouse Mobile: Performance=${lighthouseMobile.performance}, Accessibility=${lighthouseMobile.accessibility}, Best Practices=${lighthouseMobile.bestPractices}, SEO=${lighthouseMobile.seo}

${desktopScreenshot ? "Desktop screenshot attached." : "No desktop screenshot available."} ${mobileScreenshot ? "Mobile screenshot attached." : "No mobile screenshot available."}

Produce the full UX audit JSON as specified.`,
  });

  // Attach screenshots if available (base64 from PageSpeed)
  if (desktopScreenshot) {
    const base64 = desktopScreenshot.replace(/^data:image\/\w+;base64,/, "");
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64 } });
  }
  if (mobileScreenshot) {
    const base64 = mobileScreenshot.replace(/^data:image\/\w+;base64,/, "");
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64 } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 8000,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No content in Gemini response");

  const parsed = JSON.parse(content) as GeminiAnalysis;

  // Validate structure
  if (!parsed.pillars || parsed.pillars.length !== 8) throw new Error("Expected 8 pillars");
  if (!parsed.personas || parsed.personas.length !== 4) throw new Error("Expected 4 personas");
  if (!parsed.issues || parsed.issues.length === 0) throw new Error("Expected at least 1 issue");
  if (!parsed.quickWins || parsed.quickWins.length === 0) throw new Error("Expected at least 1 quick win");

  return parsed;
}
