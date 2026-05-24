import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FACEBOOK_API_VERSION = "v20.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const facebookSetupSteps = [
  "Regenerate a Facebook Page Access Token, not a User token.",
  "Grant pages_show_list, pages_read_engagement, and pages_manage_posts.",
  "Confirm the token is for the same Page ID stored in FACEBOOK_PAGE_ID.",
  "If the app is live, make sure pages_manage_posts is approved in App Review.",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const pageToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
    const pageId = Deno.env.get("FACEBOOK_PAGE_ID");

    if (!pageToken || !pageId) {
      return jsonResponse({ error: "Facebook sharing is not configured" }, 500);
    }

    const body = await req.json().catch(() => null);
    const { title, link, imageUrl } = body ?? {};

    if (typeof title !== "string" || typeof link !== "string" || !title.trim() || !link.trim()) {
      return jsonResponse({ error: "title and link are required strings" }, 400);
    }

    const tokenCheckResp = await fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me?fields=id,name&access_token=${encodeURIComponent(pageToken)}`
    );
    const tokenCheckData = await tokenCheckResp.json();

    if (!tokenCheckResp.ok) {
      console.error("Facebook token validation error:", tokenCheckData);
      return jsonResponse(
        {
          error: "Facebook Page token is invalid or expired",
          details: tokenCheckData,
          setupSteps: facebookSetupSteps,
        },
        403
      );
    }

    if (tokenCheckData?.id && String(tokenCheckData.id) !== pageId) {
      return jsonResponse(
        {
          error: "Facebook Page token does not match FACEBOOK_PAGE_ID",
          details: { tokenPageId: tokenCheckData.id, configuredPageId: pageId, tokenPageName: tokenCheckData.name },
          setupSteps: facebookSetupSteps,
        },
        403
      );
    }

    const caption = `${title.trim()}\n\n${link.trim()}`;
    const hasImage = typeof imageUrl === "string" && imageUrl.startsWith("http");
    const endpoint = hasImage
      ? `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pageId}/photos`
      : `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pageId}/feed`;
    const payload = hasImage
      ? { url: imageUrl, caption, access_token: pageToken }
      : { message: title.trim(), link: link.trim(), access_token: pageToken };

    const fbResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(payload),
    });

    const fbData = await fbResp.json();

    if (!fbResp.ok) {
      console.error("Facebook API error:", fbData);
      const facebookCode = fbData?.error?.code;
      const isPermissionError = facebookCode === 200;
      return jsonResponse(
        {
          error: isPermissionError
            ? "Facebook Page token is missing required posting permissions"
            : "Facebook API error",
          details: fbData,
          setupSteps: isPermissionError ? facebookSetupSteps : undefined,
        },
        isPermissionError ? 403 : 502
      );
    }

    return jsonResponse({ success: true, post: fbData });
  } catch (err) {
    console.error("share-to-facebook error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});