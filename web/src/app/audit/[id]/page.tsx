import type { Metadata } from "next";
import { AuditView } from "@/components/audit-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  // Try loading audit data for dynamic OG
  let title = "UX Audit Report — Site Auditor";
  let description = "AI-powered UX audit with Lighthouse data, persona verdicts, and actionable fixes.";

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/site_audits?id=eq.${id}&select=data`,
        {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          next: { revalidate: 60 },
        }
      );
      const rows = await res.json();
      if (rows?.[0]?.data) {
        const data = rows[0].data;
        const site = (data.url || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
        title = `${site} scored ${data.grade} (${data.score}/100) — Site Auditor`;
        description = `UX audit: Grade ${data.grade}, Score ${data.score}/100. 4 personas, 8 pillars, actionable fixes.`;
      }
    }
  } catch { /* fallback to defaults */ }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://audit.sarthakgoel.cv";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `${baseUrl}/api/og/${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/api/og/${id}`],
    },
  };
}

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditView id={id} />;
}
