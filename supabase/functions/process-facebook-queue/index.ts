import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const adminToken = Deno.env.get("ADMIN_SHARE_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking for articles to post to Facebook...");

    // Find the oldest article that is enriched but not yet posted to Facebook
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("id, title, source_url, image_url, ai_summary")
      .is("facebook_posted_at", null)
      .not("ai_enriched_at", "is", null)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching article:", fetchError);
      throw fetchError;
    }

    if (!article) {
      console.log("No articles ready to be posted to Facebook.");
      return new Response(
        JSON.stringify({ message: "No articles to process" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing article: ${article.title} (${article.id})`);

    // Prepare link for sharing
    const link = `https://swedenupdate.com/article/${encodeURIComponent(article.source_url)}`;

    // Invoke share-to-facebook function
    const { data: shareData, error: shareError } = await supabase.functions.invoke("share-to-facebook", {
      body: {
        title: article.title,
        link,
        imageUrl: article.image_url,
        summary: article.ai_summary,
      },
      headers: {
        "x-admin-token": adminToken || "",
      },
    });

    if (shareError || shareData?.error) {
      console.error("Error sharing to Facebook:", shareError || shareData?.error);
      throw new Error(shareError?.message || shareData?.error || "Failed to share to Facebook");
    }

    console.log("Successfully shared to Facebook:", shareData);

    // Update article with facebook_posted_at timestamp
    const { error: updateError } = await supabase
      .from("articles")
      .update({ facebook_posted_at: new Date().toISOString() })
      .eq("id", article.id);

    if (updateError) {
      console.error("Error updating article facebook_posted_at:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, articleId: article.id, fbData: shareData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-facebook-queue error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
