---
name: audit-site
description: "AI-powered UX audit for any website. Simulates 4 user personas, checks 8 UX pillars, runs Lighthouse, takes screenshots at 3 viewports, and generates a scored HTML report. Use when someone says 'audit this site', 'check UX', 'review my site', 'audit-site', or gives a URL asking for UX feedback."
user_invocable: true
argument-hint: "<url> [--full]"
---

# Audit Site

Run an AI-powered UX audit on any URL. Produces a scored report with screenshots, Lighthouse data, persona verdicts, and actionable fixes.

## Parse Arguments

Extract from `$ARGUMENTS`:
1. **URL** — the website URL (required). Add `https://` if missing.
2. **Scope** — `--full` flag means audit homepage + up to 3 linked pages. Default is homepage only (quick).

If no URL provided, ask the user.

## Setup

```bash
export AUDIT_URL="<extracted URL>"
export AUDIT_DIR="/tmp/site-audit/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$AUDIT_DIR/screenshots"
echo "Auditing: $AUDIT_URL"
echo "Output: $AUDIT_DIR"
```

## Step 1: Capture Screenshots (parallel)

Take screenshots at 3 viewport sizes using Playwright:

```bash
# Desktop (1440x900)
npx playwright screenshot --wait-for-timeout 3000 \
  --viewport-size "1440,900" "$AUDIT_URL" "$AUDIT_DIR/screenshots/desktop.png" &

# Tablet (768x1024)  
npx playwright screenshot --wait-for-timeout 3000 \
  --viewport-size "768,1024" "$AUDIT_URL" "$AUDIT_DIR/screenshots/tablet.png" &

# Mobile (375x812)
npx playwright screenshot --wait-for-timeout 3000 \
  --viewport-size "375,812" "$AUDIT_URL" "$AUDIT_DIR/screenshots/mobile.png" &

# Full-page desktop
npx playwright screenshot --wait-for-timeout 5000 --full-page \
  --viewport-size "1440,900" "$AUDIT_URL" "$AUDIT_DIR/screenshots/desktop-full.png" &

wait
```

## Step 2: Run Lighthouse

```bash
npx lighthouse "$AUDIT_URL" --output=json --output-path="$AUDIT_DIR/lighthouse.json" \
  --chrome-flags="--headless --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet 2>/dev/null

# Extract scores
python3 -c "
import json
with open('$AUDIT_DIR/lighthouse.json') as f:
    data = json.load(f)
cats = data.get('categories', {})
for k in ['performance','accessibility','best-practices','seo']:
    score = cats.get(k, {}).get('score', 0)
    print(f'{k}: {int(score*100)}')
" 2>/dev/null || echo "Lighthouse failed — will use visual analysis only"
```

## Step 3: Visual Analysis

Read ALL 4 screenshots using the Read tool. Claude can see and analyze images.

For each screenshot, evaluate against the **8 UX Pillars**:

| Pillar | Weight | What to Check |
|--------|--------|---------------|
| First Impression | 15% | CTA clarity, value prop, hero load |
| Navigation | 15% | Reachability, mobile nav, dead links |
| Forms & Inputs | 15% | Validation, error messages, required markers |
| Trust & Credibility | 10% | SSL, contact info, social proof, design quality |
| Mobile Responsive | 15% | 375px readability, touch targets, scaling |
| Performance | 10% | Lighthouse perf, LCP, CLS |
| Accessibility | 10% | Contrast, alt text, keyboard nav |
| Copy & Clarity | 10% | No jargon, reading level, helpful errors |

Evaluate from **4 persona perspectives**:
- **Grandma (65, non-tech)** — Can she find what to do?
- **Teen (16, mobile-native)** — Is it fast and modern?
- **Business User (40, medium tech)** — Is there trust? Professional?
- **Screen Reader** — Accessible?

## Step 4: Score & Grade

Score each pillar 0-10. Calculate weighted total.

| Score | Grade | Color |
|-------|-------|-------|
| 90-100 | A | #22c55e (green) |
| 80-89 | B | #84cc16 (lime) |
| 70-79 | C | #eab308 (yellow) |
| 60-69 | D | #f97316 (orange) |
| 0-59 | F | #ef4444 (red) |

## Step 5: Generate HTML Report

Write a self-contained HTML report to `$AUDIT_DIR/report.html`.

The report MUST include:

### Header
- Site URL + audit date
- Overall grade as a large colored circle badge
- Overall score number

### Score Dashboard
- 8 pillar scores as horizontal bars (colored by score)
- Lighthouse 4 scores as colored circles (like PageSpeed Insights)

### Screenshots
- Desktop, tablet, mobile screenshots embedded as base64 images
- Side-by-side responsive layout

### Issues Table
Sorted by severity (Critical → High → Medium → Low):

| # | Pillar | Severity | Issue | Persona | Fix |
|---|--------|----------|-------|---------|-----|

Severity colors:
- Critical: red
- High: orange  
- Medium: yellow
- Low: blue

### Persona Verdicts
Each persona's 2-3 sentence reaction to the site. Written in their voice.

### Quick Wins
Top 3 highest-impact, lowest-effort fixes.

### Report Styling
```css
/* Dark theme */
body { background: #0f172a; color: #e2e8f0; font-family: Inter, system-ui, sans-serif; }
/* Responsive */
@media (max-width: 768px) { .screenshots { flex-direction: column; } }
/* Print-friendly */
@media print { body { background: white; color: black; } }
```

Embed screenshots as base64:
```bash
python3 -c "
import base64
for name in ['desktop', 'tablet', 'mobile']:
    path = '$AUDIT_DIR/screenshots/' + name + '.png'
    try:
        with open(path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode()
            print(f'{name}:{b64}')
    except: pass
"
```

## Step 6: Show Results

1. Open the report: `open "$AUDIT_DIR/report.html"`
2. Print a concise summary:

```
## Site Audit: [URL]
Grade: [A-F] ([score]/100)

Lighthouse: Perf [X] | A11y [X] | BP [X] | SEO [X]

### Top Issues
1. [Critical] ...
2. [High] ...
3. [Medium] ...

### Quick Wins
1. ...
2. ...
3. ...
```

3. Ask: "Want me to deploy this as a shareable artifact?"

## Full Scope Mode (--full)

If `--full` flag is set, AFTER homepage audit:

1. Extract 3 important internal links from the page (prefer: pricing, about, signup/contact)
2. Run Steps 1-4 for each internal page
3. Add a "Page-by-Page" section to the report
4. Check cross-page navigation consistency

## Rules

- Only audit sites Sarthak owns or provides
- Screenshots stay local (don't upload externally)
- Be brutally honest — catch issues before users do
- Prioritize by bounce-rate impact
- No paid API calls — everything runs locally
