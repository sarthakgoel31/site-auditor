import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let grade = "?";
  let score = 0;
  let url = "unknown site";

  // Try loading from Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/site_audits?id=eq.${id}&select=data`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const rows = await res.json();
      if (rows?.[0]?.data) {
        const data = rows[0].data;
        grade = data.grade || "?";
        score = data.score || 0;
        url = data.url || "unknown site";
      }
    }
  } catch { /* fallback */ }

  const gradeColor = grade === "A" ? "#22c55e" : grade === "B" ? "#3b82f6" : grade === "C" ? "#eab308" : grade === "D" ? "#f97316" : grade === "F" ? "#ef4444" : "#6b7280";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0f1117 0%, #1a1b2e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Grade circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "160px",
            height: "160px",
            borderRadius: "32px",
            backgroundColor: `${gradeColor}20`,
            border: `3px solid ${gradeColor}`,
            fontSize: "80px",
            fontWeight: "bold",
            color: gradeColor,
            marginBottom: "24px",
          }}
        >
          {grade}
        </div>

        {/* Score */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "12px" }}>
          <span style={{ fontSize: "56px", fontWeight: "bold", color: "#f0f0f3" }}>{score}</span>
          <span style={{ fontSize: "28px", color: "#9094a6" }}>/100</span>
        </div>

        {/* URL */}
        <div style={{ fontSize: "22px", color: "#9094a6", marginBottom: "40px" }}>
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </div>

        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#7c5cfc",
              fontSize: "14px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            SA
          </div>
          <span style={{ fontSize: "20px", color: "#9094a6" }}>
            Site Auditor — AI-Powered UX Audit
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
