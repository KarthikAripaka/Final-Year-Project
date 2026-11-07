import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q) {
      return NextResponse.json({ documents: [], notices: [], placements: [], events: [] });
    }

    const supabase = createAdminClient();

    // Query published documents
    const { data: documents } = await supabase
      .from("documents")
      .select("id, title, description, category, version, status")
      .ilike("title", `%${q}%`)
      .limit(5);

    // Query published notices
    const { data: notices } = await supabase
      .from("notices")
      .select("id, title, description, category, priority, deadline")
      .ilike("title", `%${q}%`)
      .limit(5);

    // Query active placements
    const { data: placements } = await supabase
      .from("placements")
      .select("id, company, role, salary, location, deadline")
      .or(`company.ilike.%${q}%,role.ilike.%${q}%`)
      .limit(5);

    // Query campus events
    const { data: events } = await supabase
      .from("events")
      .select("id, title, description, event_date, location")
      .ilike("title", `%${q}%`)
      .limit(5);

    return NextResponse.json({
      query: q,
      documents: documents || [],
      notices: notices || [],
      placements: placements || [],
      events: events || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to search campus platform" }, { status: 500 });
  }
}
