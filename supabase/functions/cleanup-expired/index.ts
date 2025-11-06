import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: expiredArticles, error: selectError } = await supabaseClient
      .from('articles')
      .select('id')
      .lt('expiry_at', thirtyDaysAgo.toISOString())

    if (selectError) {
      console.error('Error selecting expired articles:', selectError)
      throw selectError
    }

    if (expiredArticles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired articles to delete',
          deleted_count: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    const expiredIds = expiredArticles.map(article => article.id)

    const { error: deleteError } = await supabaseClient
      .from('articles')
      .delete()
      .in('id', expiredIds)

    if (deleteError) {
      console.error('Error deleting expired articles:', deleteError)
      throw deleteError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deleted ${expiredArticles.length} expired articles`,
        deleted_count: expiredArticles.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in cleanup-expired function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
