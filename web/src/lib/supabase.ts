/**
 * Supabase client for persistent audit storage.
 * Uses the same Supabase project as Archana (free tier, 2 project limit).
 * Table: site_audits
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export interface StoredAudit {
  id: string;
  url: string;
  status: string;
  grade: string | null;
  score: number | null;
  data: Record<string, unknown>; // full audit JSON
  created_at: string;
}

export async function saveAudit(id: string, url: string, data: Record<string, unknown>) {
  const sb = getSupabase();
  if (!sb) return;

  await sb.from("site_audits").upsert({
    id,
    url,
    status: data.status || "complete",
    grade: data.grade || null,
    score: data.score || null,
    data,
    created_at: new Date().toISOString(),
  });
}

export async function loadAudit(id: string): Promise<StoredAudit | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data } = await sb
    .from("site_audits")
    .select("*")
    .eq("id", id)
    .single();

  return data as StoredAudit | null;
}
