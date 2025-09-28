import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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

    const { documents, metadatas, ids, collection_name = 'therapeutic_knowledge' } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate embeddings for each document
    const embeddingPromises = documents.map(async (doc: string, index: number) => {
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: doc,
        }),
      })

      if (!embeddingResponse.ok) {
        throw new Error(`Failed to generate embedding for document ${index}`)
      }

      const embeddingData = await embeddingResponse.json()
      return embeddingData.data[0].embedding
    })

    const embeddings = await Promise.all(embeddingPromises)

    // Store in appropriate table
    if (collection_name === 'conversations') {
      // This would be called from the conversation storage
      const insertData = documents.map((doc: string, index: number) => ({
        id: ids?.[index],
        user_message: doc,
        ai_response: metadatas?.[index]?.ai_response || '',
        user_message_embedding: embeddings[index],
        session_id: metadatas?.[index]?.session_id,
        crisis_level: metadatas?.[index]?.crisis_level,
        attention_status: metadatas?.[index]?.attention_status,
        emotional_state: metadatas?.[index]?.emotional_state,
        previous_activity: metadatas?.[index]?.previous_activity,
      }))

      const { error } = await supabaseClient
        .from('conversations')
        .upsert(insertData)

      if (error) throw error
    } else {
      // Store therapeutic knowledge
      const insertData = documents.map((doc: string, index: number) => ({
        id: ids?.[index],
        content: doc,
        content_embedding: embeddings[index],
        category: metadatas?.[index]?.category || 'general',
        subcategory: metadatas?.[index]?.subcategory,
        intervention_type: metadatas?.[index]?.intervention_type,
        crisis_level: metadatas?.[index]?.crisis_level || ['none'],
        attention_status: metadatas?.[index]?.attention_status || ['focused'],
        source: metadatas?.[index]?.source,
        effectiveness_score: metadatas?.[index]?.effectiveness_score || 0.0,
      }))

      const { error } = await supabaseClient
        .from('therapeutic_knowledge')
        .upsert(insertData)

      if (error) throw error
    }

    return new Response(JSON.stringify({ success: true, count: documents.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Add context error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})