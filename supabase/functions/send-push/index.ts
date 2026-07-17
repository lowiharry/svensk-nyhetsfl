import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const ONESIGNAL_APP_ID = "201cb623-aec5-4215-b724-59ddbc3979a5";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ONESIGNAL_REST_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { title, message, url, image } = body ?? {};

    if (!title || !message) {
      return new Response(JSON.stringify({ error: 'title and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Subscribed Users'],
      headings: { en: String(title).slice(0, 120) },
      contents: { en: String(message).slice(0, 240) },
    };
    if (url) payload.url = url;
    if (image) {
      payload.chrome_web_image = image;
      payload.big_picture = image;
    }

    const res = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});