# Site Auditor

**AI-powered UX audit that simulates real users so you catch friction before they bounce.**

Give it a URL. Get a scored report with screenshots, Lighthouse data, persona verdicts, and fixes -- all inside Claude Code.

Inspired by [grandma-proof](https://github.com/rav4nn/grandma-proof), rebuilt as a zero-cost Claude Code skill.

---

## Why

You test your own sites as a power user who built every page. Real users don't. A 65-year-old can't find your CTA. A teenager on mobile hits a 44px touch target miss. A screen reader user gets zero alt text. You don't catch these because you're too close to the code.

Site Auditor simulates 4 user personas, checks 8 UX pillars, captures screenshots at 3 viewports, runs Lighthouse, and generates a scored HTML report with actionable fixes. One command: `/audit-site <url>`. No API keys, no paid services -- runs entirely within Claude Code.

---

## How It Works

```
/audit-site https://yoursite.com
    --> Playwright captures desktop (1440), tablet (768), mobile (375)
    --> Lighthouse runs performance, accessibility, best-practices, SEO
    --> Claude analyzes screenshots from 4 persona perspectives
    --> Scores 8 UX pillars (0-10 weighted)
    --> Generates HTML report with grade A-F
    --> Opens report in browser
```

---

## 4 Personas

Every page is evaluated from 4 perspectives:

| Persona | Age | Tech Level | What They Test |
|---------|-----|------------|----------------|
| Grandma | 65 | None | Can she find the CTA? Does jargon confuse her? |
| Teen | 16 | High | Is it fast? Does it feel modern? Mobile-first? |
| Business User | 40 | Medium | Is there trust? Pricing clarity? Professional feel? |
| Screen Reader | -- | -- | Alt text, ARIA labels, keyboard navigation |

---

## 8 UX Pillars

| Pillar | Weight | What's Checked |
|--------|--------|----------------|
| First Impression | 15% | Value prop clarity, CTA prominence, hero load speed |
| Navigation | 15% | 2-click reachability, mobile nav, breadcrumbs, dead links |
| Forms & Inputs | 15% | Required markers, error messages, reset-on-error, autofill |
| Trust & Credibility | 10% | HTTPS, contact info, social proof, design consistency |
| Mobile Responsive | 15% | 375px readability, touch targets >= 44px, image scaling |
| Performance | 10% | Lighthouse perf, LCP < 2.5s, CLS < 0.1 |
| Accessibility | 10% | Contrast >= 4.5:1, alt text, keyboard nav |
| Copy & Clarity | 10% | No jargon, reading level, helpful errors, empty states |

---

## Grading

| Score | Grade | Verdict |
|-------|-------|---------|
| 90-100 | A | Ship it |
| 80-89 | B | Good, minor polish needed |
| 70-79 | C | Usable, but notable issues |
| 60-69 | D | Needs work before sharing |
| 0-59 | F | Major UX overhaul needed |

---

## 25 Confusion Indicators

Flags these UX friction patterns when detected:

1. Multiple similar buttons with no clear primary
2. No visible CTA above fold
3. Action with no visual feedback
4. Error messages without fix instructions
5. Required fields not marked
6. Jargon in primary UI copy
7. Loading without progress indicator
8. Hamburger menu without label on mobile
9. Modal without clear dismiss button
10. Unexpected redirect
11. Buttons too small or too close together
12. Low contrast text
13. Auto-playing media
14. Popups blocking content
15. Forms resetting on error
16. Inconsistent navigation between pages
17. No confirmation before destructive action
18. Links that don't look clickable
19. Important info in hover-only tooltips
20. No breadcrumbs in deep pages
21. Too many options without hierarchy
22. No progress indication in multi-step flows
23. Broken images or missing assets
24. Inconsistent spacing or alignment
25. Mixed font sizes without clear hierarchy

---

## Report Output

The HTML report includes:

- **Grade badge** -- large colored circle (A-F) with score
- **8-pillar score dashboard** -- horizontal bars colored by score
- **Lighthouse scores** -- Performance, Accessibility, Best Practices, SEO
- **Screenshots** -- Desktop, tablet, mobile side-by-side (base64 embedded)
- **Issues table** -- Sorted by severity (Critical/High/Medium/Low) with pillar, persona, and fix
- **Persona verdicts** -- What each persona would say about the site (in their voice)
- **Quick wins** -- Top 3 highest-impact, lowest-effort fixes

Dark theme (`#0f172a`), responsive layout, print-friendly light mode for PDF export.

---

## Usage

### As a Claude Code Skill

```bash
# Quick audit (homepage only)
/audit-site https://myarchana.in

# Full audit (homepage + 3 key pages)
/audit-site https://myarchana.in --full
```

### Manual Setup

Requires [Claude Code](https://claude.ai/claude-code) and Node.js.

1. Copy `agent.md` to `.claude/agents/site-auditor-agent.md`
2. Copy `skill.md` to `.claude/skills/audit-site/SKILL.md`
3. Run `/audit-site <url>` in Claude Code

### Dependencies (auto-installed)

```bash
npx playwright install chromium  # Headless browser for screenshots
npx lighthouse --version         # Performance auditing
```

No API keys. No paid services. Everything runs locally.

---

## Architecture

```
/audit-site <url>
    |
    v
[Playwright]
├── Desktop screenshot (1440x900)
├── Tablet screenshot (768x1024)
├── Mobile screenshot (375x812)
└── Full-page screenshot (1440x900, scrolled)
    |
    v
[Lighthouse]
├── Performance score
├── Accessibility score
├── Best Practices score
└── SEO score
    |
    v
[Claude Visual Analysis]
├── Read all 4 screenshots
├── Evaluate 8 pillars x 4 personas
├── Detect confusion indicators
└── Score each pillar 0-10
    |
    v
[Report Generator]
├── Calculate weighted grade (A-F)
├── Build issues table (sorted by severity)
├── Write persona verdicts
├── Identify quick wins
└── Generate self-contained HTML report
    |
    v
[Output]
├── Open report in browser
├── Print summary to terminal
└── Offer artifact deployment
```

---

## Files

```
site-auditor/
├── README.md          -- This file
├── agent.md           -- Claude Code agent definition
├── skill.md           -- Claude Code skill (slash command)
└── examples/          -- Sample audit reports
```

---

## Compared to grandma-proof

| | grandma-proof | site-auditor |
|---|---|---|
| Runtime | Python + FastAPI server | Claude Code (no server) |
| LLM | OpenAI/Gemini API (paid) | Claude (already in session, free) |
| Personas | 1 (Grandma only) | 4 (Grandma, Teen, Business, Screen Reader) |
| Evaluation | Heuristic fallback (stubs) | Claude visual analysis (no stubs) |
| Lighthouse | No | Yes (perf, a11y, BP, SEO) |
| Screenshots | Raw Playwright | 3 viewports + full page |
| Output | JSON + markdown | Self-contained HTML report with embedded screenshots |
| Cost | Needs API keys | Zero |
| Status | MVP with partial implementation | Fully functional |

---

## Examples

> Sample reports will be added after first audits are run.

---

<p align="center">
  <sub>Built with <a href="https://claude.ai/claude-code">Claude Code</a></sub>
</p>
