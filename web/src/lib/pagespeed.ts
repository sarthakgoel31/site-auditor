/**
 * Google PageSpeed Insights API — free, 25K queries/day, no API key required.
 * Returns Lighthouse scores + Core Web Vitals for desktop and mobile.
 */

interface LighthouseResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface WebVitals {
  lcp: string;
  cls: string;
  fid: string;
  ttfb: string;
  pageWeight: string;
  requests: number;
}

export interface PageSpeedResult {
  lighthouse: LighthouseResult;
  metrics: WebVitals;
  screenshot?: string; // base64 screenshot from Lighthouse
}

export async function runPageSpeed(url: string, strategy: "desktop" | "mobile"): Promise<PageSpeedResult> {
  const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  apiUrl.searchParams.set("url", url);
  apiUrl.searchParams.set("strategy", strategy.toUpperCase());
  apiUrl.searchParams.append("category", "PERFORMANCE");
  apiUrl.searchParams.append("category", "ACCESSIBILITY");
  apiUrl.searchParams.append("category", "BEST_PRACTICES");
  apiUrl.searchParams.append("category", "SEO");

  // API key is optional for basic use (25K/day)
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (apiKey) apiUrl.searchParams.set("key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  const res = await fetch(apiUrl.toString(), { next: { revalidate: 0 }, signal: controller.signal });
  clearTimeout(timeout);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PageSpeed API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const categories = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  // Extract Lighthouse scores (0-100)
  const lighthouse: LighthouseResult = {
    performance: Math.round((categories.performance?.score ?? 0) * 100),
    accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((categories["best-practices"]?.score ?? 0) * 100),
    seo: Math.round((categories.seo?.score ?? 0) * 100),
  };

  // Extract Core Web Vitals from audits
  const lcpMs = audits["largest-contentful-paint"]?.numericValue ?? 0;
  const clsVal = audits["cumulative-layout-shift"]?.numericValue ?? 0;
  const fidMs = audits["max-potential-fid"]?.numericValue ?? 0;
  const ttfbMs = audits["server-response-time"]?.numericValue ?? 0;
  const totalBytes = audits["total-byte-weight"]?.numericValue ?? 0;
  const reqCount = audits["network-requests"]?.details?.items?.length ?? 0;

  const metrics: WebVitals = {
    lcp: `${(lcpMs / 1000).toFixed(1)}s`,
    cls: clsVal.toFixed(3),
    fid: `${Math.round(fidMs)}ms`,
    ttfb: `${Math.round(ttfbMs)}ms`,
    pageWeight: `${(totalBytes / 1024 / 1024).toFixed(1)}MB`,
    requests: reqCount,
  };

  // Extract screenshot (Lighthouse takes one)
  const screenshotData = audits["final-screenshot"]?.details?.data;

  return {
    lighthouse,
    metrics,
    screenshot: screenshotData || undefined,
  };
}
