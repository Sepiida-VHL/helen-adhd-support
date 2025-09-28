import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query_text, collection_name = 'conversations', match_count = 5, filters } = await req.json()

    // Generate embedding using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query_text,
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding')
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    // Search based on collection type
    let searchResults
    if (collection_name === 'conversations') {
      const { data, error } = await supabaseClient.rpc('search_conversations', {
        query_embedding: embedding,
        match_count,
        filter_session_id: filters?.session_id,
        filter_crisis_level: filters?.crisis_level,
      })

      if (error) throw error
      searchResults = data
    } else {
      // Search therapeutic knowledge
      const { data, error } = await supabaseClient.rpc('search_therapeutic_knowledge', {
        query_embedding: embedding,
        match_count,
        filter_category: filters?.category,
        filter_intervention_type: filters?.intervention_type,
        filter_crisis_level: filters?.crisis_level,
      })

      if (error) throw error
      searchResults = data
    }

    // Transform results to match expected format
    const response = {
      documents: searchResults.map(result => 
        collection_name === 'conversations' ? result.user_message : result.content
      ),
      ids: searchResults.map(result => result.id),
      distances: searchResults.map(result => 1 - result.similarity), // Convert similarity to distance
      metadatas: searchResults.map(result => ({
        session_id: result.session_id,
        crisis_level: result.crisis_level,
        attention_status: result.attention_status,
        category: result.category,
        intervention_type: result.intervention_type,
        similarity: result.similarity,
      })),
      query_context: {
        collection_name,
        query_text,
        match_count: searchResults.length,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Vector search error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})