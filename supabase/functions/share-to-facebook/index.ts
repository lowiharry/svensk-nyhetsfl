import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const pageToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
    const pageId = Deno.env.get("FACEBOOK_PAGE_ID");

    if (!pageToken || !pageId) {
      throw new Error("Facebook sharing is not configured");
    }

    const body = await req.json();
    const { title, link, imageUrl } = body ?? {};

    if (typeof title !== "string" || typeof link !== "string" || !title.trim() || !link.trim()) {
      return new Response(
        JSON.stringify({ error: "title and link are required strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const caption = `${title}\n\n${link}`;
    let endpoint: string;
    let payload: Record<string, string>;

    if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      // Photo post with link in caption
      endpoint = `https://graph.facebook.com/v20.0/${pageId}/photos`;
      payload = {
        url: imageUrl,
        caption,
        access_token: pageToken,
      };
    } else {
      // Plain link post fallback
      endpoint = `https://graph.facebook.com/v20.0/${pageId}/feed`;
      payload = {
        message: title,
        link,
        access_token: pageToken,
      };
    }

    const fbResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload),
    });

    const fbData = await fbResp.json();

    if (!fbResp.ok) {
      console.error("Facebook API error:", fbData);
      return new Response(
        JSON.stringify({ error: "Facebook API error", details: fbData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, post: fbData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("share-to-facebook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});