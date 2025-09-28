# Supabase Vector Storage Setup Guide

## Overview
This setup migrates from ChromaDB to Supabase's built-in pgvector for automatic embeddings and better integration.

## Benefits
- ✅ **Automatic embeddings** via OpenAI API in Edge Functions
- ✅ **No separate vector database** to maintain
- ✅ **Built-in pgvector** for fast similarity search
- ✅ **Integrated with your existing Supabase project**
- ✅ **Better performance** with direct SQL queries
- ✅ **Cost effective** - only pay for OpenAI embeddings

## Setup Steps

### 1. Environment Variables
Add these to your Railway environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the Edge Functions, add to your Supabase project:
```bash
OPENAI_API_KEY=your_openai_api_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migration
Run the migration to create the vector tables:

```bash
# In your Supabase dashboard, go to SQL Editor and run:
supabase/migrations/001_vector_storage.sql
```

### 3. Deploy Edge Functions
Deploy the Edge Functions to Supabase:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the Edge Functions
supabase functions deploy vector-search
supabase functions deploy add-context
```

### 4. Seed Initial Therapeutic Knowledge
Create some initial therapeutic knowledge entries:

```sql
-- Insert some initial intervention knowledge
INSERT INTO therapeutic_knowledge (content, category, intervention_type, crisis_level, attention_status) VALUES
('Take three deep breaths, counting to 4 on the inhale and 6 on the exhale. This activates your parasympathetic nervous system.', 'intervention', 'breathing', ARRAY['mild', 'moderate'], ARRAY['focused', 'fading']),
('Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.', 'intervention', 'grounding', ARRAY['moderate', 'severe'], ARRAY['focused', 'fading']),
('ADHD brains feel emotions more intensely due to differences in emotional regulation. This is neurological, not a character flaw.', 'validation', 'adhd_education', ARRAY['mild', 'moderate'], ARRAY['focused', 'fading', 'hyperfocused']),
('When you notice the RSD spiral starting, pause and ask: "Is this thought helpful right now?" You don\'t have to believe every thought.', 'intervention', 'cognitive', ARRAY['mild', 'moderate'], ARRAY['focused']),
('Your worth is not determined by your productivity or mistakes. You are valuable simply because you exist.', 'validation', 'self_compassion', ARRAY['moderate', 'severe'], ARRAY['focused', 'fading']);
```

## Usage

### Storing Conversations
The service now automatically stores conversations with embeddings:

```typescript
await vectorRetrievalService.storeConversation({
  user_message: "I'm feeling overwhelmed",
  ai_response: "That sounds really difficult...",
  session_id: "session_123",
  crisis_level: "moderate",
  attention_status: "focused"
});
```

### Searching for Similar Contexts
```typescript
const results = await vectorRetrievalService.retrieveContext({
  query_text: "I can't handle this anymore",
  collection_name: "conversations",
  n_results: 5,
  filters: { crisis_level: "moderate" }
});
```

### Adding Therapeutic Knowledge
```typescript
await vectorRetrievalService.addContext({
  documents: ["New breathing technique..."],
  metadatas: [{
    category: "intervention",
    intervention_type: "breathing",
    crisis_level: ["mild", "moderate"]
  }],
  collection_name: "therapeutic_knowledge"
});
```

## Cost Estimation
- **OpenAI Embeddings**: ~$0.0001 per 1k tokens
- **Supabase**: Database storage and compute (existing plan)
- **Typical usage**: ~$5-10/month for moderate usage

## Migration Benefits
1. **No ChromaDB maintenance** - one less service to manage
2. **Automatic embeddings** - no manual preprocessing
3. **Better performance** - direct database queries
4. **Real-time capabilities** - can use Supabase realtime
5. **Integrated analytics** - query conversation patterns directly