import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedServerClient, supabase as publicSupabase } from "@/lib/supabase";

// GET /api/v1/communities - List all available communities
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const { data: communities, error } = await client
      .from("app_school_communities")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching communities:", error.message);
      return NextResponse.json({ communities: [] });
    }

    return NextResponse.json({ communities: communities || [] });
  } catch (err: any) {
    console.error("GET /api/v1/communities exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST /api/v1/communities - Create a new community tenant
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const client = authHeader ? createAuthenticatedServerClient(authHeader) : publicSupabase;

    const body = await req.json();
    const { name, slug, tagline, description, rules, is_private, logo_url, cover_url } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Community name is required." }, { status: 400 });
    }

    const communitySlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newCommunity = {
      id: `comm_${Date.now()}`,
      name: name.trim(),
      slug: communitySlug,
      tagline: tagline?.trim() || "A collaborative community for creators and engineers.",
      description: description?.trim() || "",
      rules: rules?.trim() || "1. Be helpful. 2. Share real work. 3. Zero spam.",
      is_private: is_private ?? false,
      logo_url: logo_url?.trim() || "",
      cover_url:
        cover_url?.trim() ||
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    };

    const { data, error } = await client
      .from("app_school_communities")
      .insert([newCommunity])
      .select()
      .single();

    if (error) {
      console.warn("Database insert failed for community, using local fallback:", error.message);
      return NextResponse.json({ community: newCommunity }, { status: 201 });
    }

    return NextResponse.json({ community: data }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/v1/communities exception:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
