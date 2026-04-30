import { NextRequest, NextResponse } from "next/server";

/**
 * Embeddable badge SVG: /api/badge/[id]
 * Users paste: <img src="https://audit.sarthakgoel.cv/api/badge/abc123" />
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try loading from Supabase
  let grade = "?";
  let score = 0;
  let url = "";

  try {
    const { loadAudit } = await import("@/lib/supabase");
    const stored = await loadAudit(id);
    if (stored?.data) {
      const data = stored.data as { grade?: string; score?: number; url?: string };
      grade = data.grade || "?";
      score = data.score || 0;
      url = data.url || "";
    }
  } catch { /* fallback */ }

  const gradeColor = grade === "A" ? "#22c55e" : grade === "B" ? "#3b82f6" : grade === "C" ? "#eab308" : grade === "D" ? "#f97316" : grade === "F" ? "#ef4444" : "#6b7280";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="36" viewBox="0 0 200 36">
  <rect width="200" height="36" rx="6" fill="#0f1117"/>
  <rect width="60" height="36" rx="6" fill="${gradeColor}"/>
  <rect x="54" width="6" height="36" fill="${gradeColor}"/>
  <text x="30" y="23" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="bold" fill="white">${grade} ${score}</text>
  <text x="130" y="15" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#9094a6">UX Audit by</text>
  <text x="130" y="28" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="#7c5cfc">Site Auditor</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
