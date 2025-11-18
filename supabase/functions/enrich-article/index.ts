import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId } = await req.json();
    
    if (!articleId) {
      return new Response(
        JSON.stringify({ error: 'Article ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_AI_STUDIO_KEY');

    if (!googleApiKey) {
      throw new Error('GOOGLE_AI_STUDIO_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already enriched
    if (article.ai_enriched_at) {
      return new Response(
        JSON.stringify({ 
          message: 'Article already enriched',
          enrichedAt: article.ai_enriched_at 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional news analyst. Given a news article, provide:
1. A unique summary in your own words (2-3 sentences)
2. Context explaining background and significance (2-3 sentences)
3. Timeline of key events (bullet points)
4. Analysis of implications and impact (2-3 sentences)
5. "What We Know Now" - key facts distilled (bullet points)

Format your response as JSON with keys: summary, context, timeline, analysis, whatWeKnow`;

    const fullPrompt = `${systemPrompt}

Article Title: ${article.title}

Source: ${article.source_name}
Published: ${article.published_at}
Category: ${article.category || 'general'}

${article.summary ? `Summary: ${article.summary}` : ''}
${article.content ? `Content: ${article.content}` : ''}

Provide unique analysis and insights for this article.`;

    // Call Google Gemini API with gemini-1.5-flash model
    console.log('Calling Google Gemini for article:', articleId);
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Google Gemini API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Google API rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Google API key invalid or expired. Please check your API key.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Google Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiContent) {
      throw new Error('No content received from Google Gemini API');
    }
    
    console.log('AI response received:', aiContent.substring(0, 200));

    // Parse AI response
    let enrichment;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                        aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      enrichment = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: use the raw response
      enrichment = {
        summary: aiContent.substring(0, 500),
        context: '',
        timeline: '',
        analysis: '',
        whatWeKnow: ''
      };
    }

    // Update article with enrichment
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        ai_summary: enrichment.summary,
        ai_context: enrichment.context,
        ai_timeline: enrichment.timeline,
        ai_analysis: enrichment.analysis,
        ai_what_we_know: enrichment.whatWeKnow,
        ai_enriched_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (updateError) {
      console.error('Failed to update article:', updateError);
      throw updateError;
    }

    console.log('Article enriched successfully:', articleId);

    return new Response(
      JSON.stringify({ 
        success: true,
        enrichment
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-article function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
