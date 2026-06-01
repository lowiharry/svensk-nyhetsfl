import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://swedenupdate.com";

const esc = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function shell(opts: {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  bodyHtml: string;
  jsonLd?: Record<string, unknown>;
  type?: string;
  noindex?: boolean;
}) {
  const {
    title,
    description,
    canonical,
    image = `${SITE}/favicon.png`,
    bodyHtml,
    jsonLd,
    type = "website",
    noindex = false,
  } = opts;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(canonical)}" />
${noindex ? '<meta name="robots" content="noindex,follow" />' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />'}
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="${esc(type)}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:site_name" content="Sweden Update" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Resolve the original site path: prefer ?path=, else strip function prefix.
    let path = url.searchParams.get("path") ?? url.pathname;
    path = path.replace(/^\/functions\/v1\/prerender/, "");
    if (!path.startsWith("/")) path = "/" + path;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const headers = {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    };

    // --- Article detail: /article/<encoded source_url> ---
    const articleMatch = path.match(/^\/article\/(.+)$/);
    if (articleMatch) {
      const raw = articleMatch[1];
      let sourceUrl = raw;
      try {
        sourceUrl = decodeURIComponent(raw);
      } catch {
        /* keep raw */
      }

      const now = new Date().toISOString();
      const { data: article } = await supabase
        .from("articles")
        .select("*")
        .eq("source_url", sourceUrl)
        .maybeSingle();

      const canonical = `${SITE}/article/${encodeURIComponent(sourceUrl)}`;

      if (!article) {
        return new Response(
          shell({
            title: "Article not found | Sweden Update",
            description: "This article is no longer available.",
            canonical,
            bodyHtml: `<main><h1>Article not found</h1><p>This article may have expired. <a href="${SITE}/">Return to Sweden Update</a>.</p></main>`,
            noindex: true,
          }),
          { status: 404, headers },
        );
      }

      if (article.expiry_at && article.expiry_at < now) {
        return new Response(
          shell({
            title: `${article.title} | Sweden Update`,
            description: "This article has expired.",
            canonical,
            bodyHtml: `<main><h1>${esc(article.title)}</h1><p>This article has expired after 30 days. <a href="${SITE}/">Latest Swedish news</a>.</p></main>`,
            noindex: true,
          }),
          { status: 410, headers },
        );
      }

      const desc =
        (article.summary || article.title || "Sweden news article").slice(0, 300);
      const image = article.image_url || `${SITE}/favicon.png`;
      const pub = new Date(article.published_at).toISOString();
      const upd = new Date(article.updated_at || article.published_at).toISOString();

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: desc,
        image: [image],
        datePublished: pub,
        dateModified: upd,
        author: { "@type": "Organization", name: article.source_name || "Sweden Update" },
        publisher: {
          "@type": "Organization",
          name: "Sweden Update",
          logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        articleSection: article.category || "News",
      };

      const body = `
<main>
  <nav><a href="${SITE}/">Home</a> &raquo; <a href="${SITE}/category/${encodeURIComponent(article.category || "news")}">${esc(article.category || "News")}</a></nav>
  <article>
    <h1>${esc(article.title)}</h1>
    <p><time datetime="${pub}">${new Date(article.published_at).toUTCString()}</time> &middot; ${esc(article.source_name || "")}</p>
    ${article.image_url ? `<img src="${esc(article.image_url)}" alt="${esc(article.title)}" width="1200" height="630" />` : ""}
    ${article.summary ? `<p>${esc(article.summary)}</p>` : ""}
    ${article.ai_context ? `<section><h2>Context</h2><p>${esc(article.ai_context)}</p></section>` : ""}
    <p><a href="${esc(article.source_url)}" rel="nofollow noopener" target="_blank">Read the original article at ${esc(article.source_name || "source")}</a></p>
  </article>
</main>`;

      return new Response(
        shell({
          title: `${article.title} | Sweden Update`,
          description: desc,
          canonical,
          image,
          bodyHtml: body,
          jsonLd,
          type: "article",
        }),
        { headers },
      );
    }

    // --- Category: /category/<name> ---
    const catMatch = path.match(/^\/category\/(.+)$/);
    if (catMatch) {
      const category = decodeURIComponent(catMatch[1]);
      const now = new Date().toISOString();
      const { data: articles } = await supabase
        .from("articles")
        .select("title, source_url, summary, published_at")
        .eq("category", category)
        .gt("expiry_at", now)
        .order("published_at", { ascending: false })
        .limit(30);

      const canonical = `${SITE}/category/${encodeURIComponent(category)}`;
      const list = (articles || [])
        .map(
          (a) =>
            `<li><a href="${SITE}/article/${encodeURIComponent(a.source_url)}">${esc(a.title)}</a><p>${esc(a.summary || "")}</p></li>`,
        )
        .join("");

      return new Response(
        shell({
          title: `${category} News Sweden | Sweden Update`,
          description: `Latest ${category} news from Sweden — breaking ${category} headlines, updates, and analysis from Swedish sources.`,
          canonical,
          bodyHtml: `<main><h1>${esc(category)} News Sweden</h1><ul>${list}</ul></main>`,
        }),
        { headers },
      );
    }

    // --- Static pages ---
    if (path === "/about") {
      return new Response(
        shell({
          title: "About Sweden Update | Swedish News Aggregator",
          description:
            "Sweden Update aggregates and translates the latest Swedish news into English from trusted sources across Sweden.",
          canonical: `${SITE}/about`,
          bodyHtml: `<main><h1>About Sweden Update</h1><p>Sweden Update aggregates the latest news from trusted Swedish sources, translated into English in real time. Contact: swedenupdatenews@gmail.com</p></main>`,
        }),
        { headers },
      );
    }
    if (path === "/contact") {
      return new Response(
        shell({
          title: "Contact Sweden Update",
          description: "Get in touch with Sweden Update at swedenupdatenews@gmail.com.",
          canonical: `${SITE}/contact`,
          bodyHtml: `<main><h1>Contact</h1><p>Email: <a href="mailto:swedenupdatenews@gmail.com">swedenupdatenews@gmail.com</a></p></main>`,
        }),
        { headers },
      );
    }
    if (path === "/privacy-policy") {
      return new Response(
        shell({
          title: "Privacy Policy | Sweden Update",
          description: "Sweden Update privacy policy.",
          canonical: `${SITE}/privacy-policy`,
          bodyHtml: `<main><h1>Privacy Policy</h1><p>See our full privacy policy on the site.</p></main>`,
        }),
        { headers },
      );
    }

    // --- Home (and fallback) ---
    const now = new Date().toISOString();
    const { data: articles } = await supabase
      .from("articles")
      .select("title, source_url, summary, published_at, category")
      .gt("expiry_at", now)
      .order("published_at", { ascending: false })
      .limit(50);

    const list = (articles || [])
      .map(
        (a) =>
          `<li><a href="${SITE}/article/${encodeURIComponent(a.source_url)}">${esc(a.title)}</a><p>${esc(a.summary || "")}</p></li>`,
      )
      .join("");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (articles || []).slice(0, 20).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/article/${encodeURIComponent(a.source_url)}`,
        name: a.title,
      })),
    };

    return new Response(
      shell({
        title: "Sweden News Today - Breaking News Sweden | Latest Swedish Headlines",
        description:
          "Breaking news Sweden today - latest Swedish news, live updates, top stories, politics, economy, weather, and crime reports from Stockholm, Gothenburg, Malmö, Uppsala.",
        canonical: `${SITE}/`,
        bodyHtml: `<main><h1>Breaking News Sweden Today - Latest Swedish News Headlines</h1><ul>${list}</ul></main>`,
        jsonLd,
      }),
      { headers },
    );
  } catch (e) {
    console.error("prerender error:", e);
    return new Response("Prerender error", { status: 500, headers: corsHeaders });
  }
});