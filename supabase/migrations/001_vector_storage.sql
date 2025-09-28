-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create conversations table with vector embeddings
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  user_message_embedding vector(1536), -- OpenAI embedding dimension
  ai_response_embedding vector(1536),
  
  -- Metadata fields
  previous_activity TEXT,
  crisis_level TEXT DEFAULT 'none',
  attention_status TEXT DEFAULT 'focused',
  emotional_state TEXT DEFAULT 'neutral',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapeutic knowledge base table
CREATE TABLE IF NOT EXISTS therapeutic_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  content_embedding vector(1536),
  
  -- Categorization
  category TEXT NOT NULL, -- 'intervention', 'rsd_pattern', 'crisis_response', etc.
  subcategory TEXT,
  intervention_type TEXT, -- 'breathing', 'grounding', 'cognitive', etc.
  crisis_level TEXT[], -- array of applicable crisis levels
  attention_status TEXT[], -- array of applicable attention statuses
  
  -- Metadata
  source TEXT,
  effectiveness_score FLOAT DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for vector similarity search
CREATE INDEX IF NOT EXISTS conversations_user_message_embedding_idx 
  ON conversations USING ivfflat (user_message_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS conversations_ai_response_embedding_idx 
  ON conversations USING ivfflat (ai_response_embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS therapeutic_knowledge_embedding_idx 
  ON therapeutic_knowledge USING ivfflat (content_embedding vector_cosine_ops);

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS conversations_session_id_idx ON conversations(session_id);
CREATE INDEX IF NOT EXISTS conversations_crisis_level_idx ON conversations(crisis_level);
CREATE INDEX IF NOT EXISTS conversations_attention_status_idx ON conversations(attention_status);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS therapeutic_knowledge_category_idx ON therapeutic_knowledge(category);
CREATE INDEX IF NOT EXISTS therapeutic_knowledge_intervention_type_idx ON therapeutic_knowledge(intervention_type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapeutic_knowledge_updated_at 
  BEFORE UPDATE ON therapeutic_knowledge 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_conversations(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_session_id text DEFAULT NULL,
  filter_crisis_level text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  session_id text,
  user_message text,
  ai_response text,
  similarity float,
  crisis_level text,
  attention_status text,
  created_at timestamptz
)
LANGUAGE sql
AS $$
SELECT
  c.id,
  c.session_id,
  c.user_message,
  c.ai_response,
  1 - (c.user_message_embedding <=> query_embedding) as similarity,
  c.crisis_level,
  c.attention_status,
  c.created_at
FROM conversations c
WHERE 
  (filter_session_id IS NULL OR c.session_id = filter_session_id) AND
  (filter_crisis_level IS NULL OR c.crisis_level = filter_crisis_level) AND
  1 - (c.user_message_embedding <=> query_embedding) > match_threshold
ORDER BY c.user_message_embedding <=> query_embedding
LIMIT match_count;
$$;

-- Create function for therapeutic knowledge search
CREATE OR REPLACE FUNCTION search_therapeutic_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL,
  filter_intervention_type text DEFAULT NULL,
  filter_crisis_level text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  category text,
  subcategory text,
  intervention_type text,
  similarity float,
  effectiveness_score float
)
LANGUAGE sql
AS $$
SELECT
  tk.id,
  tk.content,
  tk.category,
  tk.subcategory,
  tk.intervention_type,
  1 - (tk.content_embedding <=> query_embedding) as similarity,
  tk.effectiveness_score
FROM therapeutic_knowledge tk
WHERE 
  (filter_category IS NULL OR tk.category = filter_category) AND
  (filter_intervention_type IS NULL OR tk.intervention_type = filter_intervention_type) AND
  (filter_crisis_level IS NULL OR filter_crisis_level = ANY(tk.crisis_level)) AND
  1 - (tk.content_embedding <=> query_embedding) > match_threshold
ORDER BY tk.content_embedding <=> query_embedding
LIMIT match_count;
$$;