// Featured News Scheduler
// Runs every minute (via pg_cron). At each of the 10 daily Stockholm slots
// (00, 06, 08, 10, 12, 14, 16, 18, 20, 22), assigns the newest unused article
// to the slot, marks it 'active', and marks all older slot rows 'expired'.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Slot hours in Europe/Stockholm local time
const SLOT_HOURS = [0, 6, 8, 10, 12, 14, 16, 18, 20, 22];

// Return the Stockholm wall-clock components for a given UTC Date.
function stockholmParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === "24" ? "00" : parts.hour),
    minute: Number(parts.minute),
  };
}

// Convert Stockholm wall-clock Y/M/D H to a UTC ISO string.
// Uses the trick: interpret the wall time as UTC, then subtract the offset
// discovered by re-formatting that UTC guess in Stockholm.
function stockholmToUtc(year: number, month: number, day: number, hour: number): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  const p = stockholmParts(guess);
  const asWallUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, 0);
  const offsetMs = asWallUtc - guess.getTime();
  return new Date(guess.getTime() - offsetMs);
}

// Return the last N slot instants (as UTC Dates) that are <= now.
function pastSlotInstants(now: Date, count: number): Date[] {
  const out: Date[] = [];
  const p = stockholmParts(now);
  let cursor = new Date(Date.UTC(p.year, p.month - 1, p.day));
  // walk backwards day-by-day, generating slot instants
  for (let dayOffset = 0; out.length < count && dayOffset < 30; dayOffset++) {
    const dayDate = new Date(cursor.getTime() - dayOffset * 86400_000);
    const dp = stockholmParts(dayDate);
    // slots for that day, newest first
    const slots = [...SLOT_HOURS].sort((a, b) => b - a);
    for (const h of slots) {
      const inst = stockholmToUtc(dp.year, dp.month, dp.day, h);
      if (inst.getTime() <= now.getTime()) {
        out.push(inst);
        if (out.length >= count) break;
      }
    }
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const now = new Date();
    // Ensure every past slot in the last 3 days has an assignment.
    const slots = pastSlotInstants(now, 30); // ~3 days of 10 slots

    // Fetch existing rows for those slots
    const slotIsos = slots.map((s) => s.toISOString());
    const { data: existing, error: exErr } = await supabase
      .from("featured_schedule")
      .select("id, slot_at, article_id, status")
      .in("slot_at", slotIsos);
    if (exErr) throw exErr;

    const filled = new Set((existing ?? []).map((r) => new Date(r.slot_at).toISOString()));
    const usedArticleIds = new Set((existing ?? []).map((r) => r.article_id));

    // Assign newest unused articles (respecting expiry) to any missing slots.
    // Oldest slot first so newest article ends up in the newest slot.
    const missing = slots.filter((s) => !filled.has(s.toISOString())).sort((a, b) => a.getTime() - b.getTime());

    if (missing.length > 0) {
      const nowIso = now.toISOString();
      const { data: candidates, error: candErr } = await supabase
        .from("articles")
        .select("id, published_at, image_url")
        .gt("expiry_at", nowIso)
        .not("image_url", "is", null)
        .order("published_at", { ascending: false })
        .limit(missing.length + usedArticleIds.size + 20);
      if (candErr) throw candErr;

      const pool = (candidates ?? []).filter((a) => !usedArticleIds.has(a.id));
      // Assign newest article to newest missing slot
      const missingNewestFirst = [...missing].reverse();
      const inserts: { article_id: string; slot_at: string; status: string }[] = [];
      for (const slot of missingNewestFirst) {
        const pick = pool.shift();
        if (!pick) break;
        inserts.push({ article_id: pick.id, slot_at: slot.toISOString(), status: "scheduled" });
      }
      if (inserts.length > 0) {
        const { error: insErr } = await supabase.from("featured_schedule").insert(inserts);
        if (insErr) throw insErr;
      }
    }

    // Determine active slot = most recent past slot that has a row
    const { data: latest, error: latestErr } = await supabase
      .from("featured_schedule")
      .select("id, slot_at")
      .lte("slot_at", now.toISOString())
      .order("slot_at", { ascending: false })
      .limit(1);
    if (latestErr) throw latestErr;

    const activeId = latest?.[0]?.id ?? null;

    if (activeId) {
      // Mark active
      await supabase
        .from("featured_schedule")
        .update({ status: "active" })
        .eq("id", activeId)
        .neq("status", "active");
      // Expire everything older that isn't already expired
      await supabase
        .from("featured_schedule")
        .update({ status: "expired" })
        .lt("slot_at", latest![0].slot_at)
        .neq("status", "expired");
    }

    // Also mark truly future rows (if any got created early) as 'scheduled'
    await supabase
      .from("featured_schedule")
      .update({ status: "scheduled" })
      .gt("slot_at", now.toISOString())
      .neq("status", "scheduled");

    return new Response(
      JSON.stringify({ ok: true, active_id: activeId, checked_slots: slots.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("featured-scheduler error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String((e as Error).message ?? e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});