<p align="center">
  <img src="logo.png" alt="Site Auditor Logo" width="120" />
</p>

# Site Auditor

AI-powered UX audit tool. Enter any URL, get a scored report with real Lighthouse data, AI persona analysis, and code-level fixes.

**Live:** [audit.sarthakgoel.cv](https://audit.sarthakgoel.cv)

## Why

You test your own sites as the power user who built them. Real users don't. A 65-year-old can't find your CTA. A teen on mobile hits tiny touch targets. A screen reader user gets zero alt text. This tool audits from 4 real user perspectives and gives you actionable fixes.

## How

```
Enter URL → Google PageSpeed Insights (Desktop + Mobile)
         → Groq Llama 3.3 AI (4 personas x 8 UX pillars)
         → Interactive report with grade A-F
```

## Features

| Feature | Detail |
|---|---|
| Real Lighthouse Scores | Google PageSpeed Insights API (Performance, Accessibility, Best Practices, SEO) |
| Desktop + Mobile Tabs | Separate scores per device, combined 60/40 weighted (Google's mobile-first) |
| Core Web Vitals | LCP, CLS, FID, TTFB, page weight, request count |
| 4 AI Personas | Grandma (65), Teen (16), Business User (40), Screen Reader |
| 8 UX Pillars | Scored 0-10 with expandable check-by-check detail |
| Persona Scores | Per-persona score bar, specific struggles, recommended fixes |
| Issues with Code Fixes | Before/after code snippets for each issue |
| Quick Wins | Top 3 highest-impact, lowest-effort fixes |
| Severity Filtering | Filter issues by Critical/High/Medium/Low |
| LLM Tag | Shows which AI model analyzed the site (Groq/Gemini/DeepSeek) |
| Progress Bar | Live countdown + elapsed timer during audit |
| Shareable Links | Copy report URL, share on X/LinkedIn/WhatsApp |
| OG Images | Auto-generated Open Graph images for social sharing |
| Embeddable Badge | SVG badge with grade + score for your README |
| Glassmorphism UI | Frosted glass cards, backdrop blur, animated score circles |
| Rate Limiting | 5 audits/hour per IP |

## Tech

| Component | Stack |
|---|---|
| Frontend | Next.js 16, Tailwind v4, Motion, Geist font |
| Lighthouse | Google PageSpeed Insights API (free, 25K/day with API key) |
| AI Analysis | Groq Llama 3.3 (primary) -> Gemini Flash -> DeepSeek (fallback chain) |
| Backend API | Express.js on Hetzner VPS (no timeout limits) |
| Persistence | Supabase Postgres (shareable audit links) |
| Frontend Host | Vercel (proxies API calls to Hetzner) |

## Architecture

```
site-auditor/
  web/                            # Next.js frontend (Vercel)
    src/app/
      page.tsx                    # Landing page with URL input
      audit/[id]/                 # Report page (polls API)
      api/audit/                  # Proxy to Hetzner backend
      api/badge/[id]/             # Embeddable SVG badge
      api/og/[id]/                # OG image generation
    src/components/
      hero.tsx                    # URL input + animated scores
      audit-view.tsx              # Full report with device tabs, personas, issues
      score-circle.tsx            # Animated circular score
    src/lib/
      gemini.ts                   # LLM fallback chain (Groq -> Gemini -> DeepSeek)
      pagespeed.ts                # Google PageSpeed Insights API
      supabase.ts                 # Audit persistence

  Hetzner (5.75.129.53:3100)      # Express.js API (no timeout limits)
    server.js                     # Full audit pipeline: PageSpeed + LLM
```

## Status

| Item | Status |
|---|---|
| Landing page + hero | Complete |
| Real Lighthouse via PageSpeed API | Complete |
| AI analysis (Groq/Gemini/DeepSeek fallback) | Complete |
| Desktop/Mobile/Combined tabs | Complete |
| Persona scores, struggles, fixes | Complete |
| Progress bar + ETA | Complete |
| OG images + share buttons | Complete |
| Embeddable badge | Complete |
| Supabase persistence | Complete |
| Hetzner backend (no timeouts) | Complete |
| Custom domain (audit.sarthakgoel.cv) | Complete |

---

Built by [Sarthak Goel](https://sarthakgoel.cv)
