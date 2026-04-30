<p align="center">
  <img src="logo.png" alt="Site Auditor Logo" width="120" />
</p>

# Site Auditor

AI-powered UX audit tool. Enter any URL, get a scored report with real Lighthouse data, AI persona verdicts, and code-level fixes.

**Live:** https://audit.sarthakgoel.cv/

## Why

You test your own sites as the power user who built them. Real users don't. A 65-year-old can't find your CTA. A teen on mobile hits tiny touch targets. A screen reader user gets zero alt text. You don't catch these because you're too close to the code.

## How It Works

```
Enter URL → Google PageSpeed Insights (Desktop + Mobile)
         → Gemini Flash AI (4 personas × 8 UX pillars)
         → Interactive report with grade A-F
```

## Features

| Feature | Detail |
|---|---|
| Real Lighthouse scores | Google PageSpeed Insights API (Performance, Accessibility, Best Practices, SEO) |
| Desktop + Mobile tabs | Separate scores per device, combined 60/40 weighted (Google's mobile-first) |
| Core Web Vitals | LCP, CLS, FID, TTFB, page weight, request count |
| 4 AI personas | Grandma (65), Teen (16), Business User (40), Screen Reader |
| 8 UX pillars | Scored 0-10 with expandable check-by-check detail |
| Issues with code fixes | Before/after code snippets for each issue |
| Quick Wins | Top 3 highest-impact, lowest-effort fixes |
| Severity filtering | Filter issues by Critical/High/Medium/Low |
| Glassmorphism UI | Frosted glass cards, backdrop blur, animated score circles |
| Shareable links | Copy report URL to share |
| Rate limiting | 5 audits/hour per IP |

## Tech

| Component | Stack |
|---|---|
| Frontend | Next.js 16, Tailwind v4, Motion, Geist font |
| Lighthouse data | Google PageSpeed Insights API (free, 25K/day) |
| AI analysis | Gemini 2.0 Flash (free tier) |
| Hosting | Vercel |

## Architecture

```
site-auditor/
├── web/                        # Next.js app
│   ├── src/app/
│   │   ├── page.tsx           # Landing page
│   │   ├── audit/[id]/        # Report page
│   │   └── api/audit/         # POST to start, GET to poll
│   ├── src/components/
│   │   ├── hero.tsx           # URL input + animated scores
│   │   ├── audit-view.tsx     # Full report with device tabs
│   │   ├── score-circle.tsx   # Animated circular score
│   │   ├── features.tsx       # Persona cards + pillar grid
│   │   └── ...
│   └── src/lib/
│       ├── pagespeed.ts       # Google PageSpeed Insights API
│       └── gemini.ts          # Gemini Flash AI analysis
├── agent.md                   # Claude Code agent definition
├── skill.md                   # Claude Code skill (/audit-site)
└── README.md
```

## Setup

```bash
cd web
npm install
cp .env.local.example .env.local
# Add GEMINI_API_KEY from https://aistudio.google.com/apikey
npm run dev
```

## Status

| Item | Status |
|---|---|
| Landing page + hero | Done |
| Audit progress animation | Done |
| Desktop/Mobile/Combined tabs | Done |
| Real Lighthouse via PageSpeed API | Done |
| AI analysis via Gemini Flash | Done |
| Glassmorphism UI | Done |
| Deployed on Vercel | Done |
| Custom domain | Pending |
| OG images for sharing | Pending |
| Share buttons | Pending |

---

Built by [Sarthak Goel](https://sarthakgoel.cv)
