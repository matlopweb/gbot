-- Schema para Supabase (opcional)
-- Ejecuta este SQL en tu proyecto de Supabase si decides usar persistencia

-- Tabla de contextos de usuario
CREATE TABLE IF NOT EXISTS user_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_contexts_user_id ON user_contexts(user_id);

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  messages JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para conversaciones
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- Tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para preferencias
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Tabla de tokens de servicios (Google, Spotify, etc.)
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  service TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, service)
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_service ON user_tokens(user_id, service);

-- Tabla de elementos guardados (notas, links, audio)
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'note', 'audio')),
  title TEXT,
  content TEXT,
  url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_type ON saved_items(type);

-- Tabla de escenarios personalizados
CREATE TABLE IF NOT EXISTS user_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT DEFAULT 'neutral',
  widgets JSONB DEFAULT '[]'::jsonb,
  automations JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_scenarios_user ON user_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scenarios_active ON user_scenarios(user_id, is_active);

-- Tabla de embeddings para búsqueda semántica (opcional - requiere extensión pgvector)
-- Descomenta si quieres usar búsqueda semántica
/*
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS message_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embeddings dimension
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_id ON message_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_embedding ON message_embeddings USING ivfflat (embedding vector_cosine_ops);
*/

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_user_contexts_updated_at
  BEFORE UPDATE ON user_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_scenarios_updated_at
  BEFORE UPDATE ON user_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scenarios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (ajustar según tus necesidades)
-- Por ahora, permitir todo desde el service role
CREATE POLICY "Enable all for service role" ON user_contexts
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON conversations
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON user_preferences
  FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON saved_items
  FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON user_scenarios
  FOR ALL USING (true);

-- Comentarios para documentación
COMMENT ON TABLE user_contexts IS 'Almacena el contexto de conversación de cada usuario';
COMMENT ON TABLE conversations IS 'Historial de conversaciones completas';
COMMENT ON TABLE user_preferences IS 'Preferencias y configuración de cada usuario';
COMMENT ON TABLE user_scenarios IS 'Escenarios personalizados (modos) configurados por cada usuario';

-- ============================================================================
-- COMPAÑERO COGNITIVO - SISTEMA REVOLUCIONARIO DE PERSONALIDAD EVOLUTIVA
-- ============================================================================

-- Tabla de personalidades únicas de compañeros
CREATE TABLE IF NOT EXISTS companion_personalities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    traits JSONB NOT NULL, -- Big Five + rasgos únicos
    characteristics TEXT[] NOT NULL,
    communication_style TEXT NOT NULL,
    interests TEXT[] NOT NULL,
    humor_style TEXT NOT NULL,
    energy_patterns JSONB NOT NULL,
    evolution_level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estados emocionales del compañero
CREATE TABLE IF NOT EXISTS companion_emotional_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    current_mood TEXT NOT NULL,
    energy_level INTEGER NOT NULL CHECK (energy_level >= 0 AND energy_level <= 100),
    empathy_level INTEGER NOT NULL CHECK (empathy_level >= 0 AND empathy_level <= 100),
    excitement INTEGER NOT NULL CHECK (excitement >= 0 AND excitement <= 100),
    calmness INTEGER NOT NULL CHECK (calmness >= 0 AND calmness <= 100),
    last_interaction TIMESTAMP WITH TIME ZONE,
    emotional_memory JSONB DEFAULT '[]',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de memorias vivas (contextuales)
CREATE TABLE IF NOT EXISTS companion_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    emotional_context JSONB NOT NULL, -- Estado emocional cuando se creó
    importance_score INTEGER NOT NULL CHECK (importance_score >= 0 AND importance_score <= 100),
    associations JSONB DEFAULT '[]', -- Conexiones con otras memorias
    recall_count INTEGER DEFAULT 0,
    last_recalled TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de patrones de comportamiento detectados
CREATE TABLE IF NOT EXISTS companion_behavior_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- 'daily_routine', 'emotional_cycle', 'communication_style', etc.
    pattern_data JSONB NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_confirmed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    occurrence_count INTEGER DEFAULT 1
);

-- Tabla de análisis emocional de voz
CREATE TABLE IF NOT EXISTS voice_emotion_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    transcript TEXT NOT NULL,
    detected_emotions JSONB NOT NULL, -- joy, sadness, anger, etc. con scores
    confidence_level REAL NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
    audio_features JSONB, -- pitch, tempo, volume patterns
    context_tags TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mundo interior (estado mental del compañero)
CREATE TABLE IF NOT EXISTS companion_inner_world (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    current_thoughts TEXT[],
    processing_queue JSONB DEFAULT '[]',
    emotional_state TEXT NOT NULL,
    energy_visualization INTEGER NOT NULL CHECK (energy_visualization >= 0 AND energy_visualization <= 100),
    focus_areas TEXT[],
    inspiration_level INTEGER NOT NULL CHECK (inspiration_level >= 0 AND inspiration_level <= 100),
    curiosity_targets TEXT[],
    relationship_depth INTEGER NOT NULL CHECK (relationship_depth >= 0 AND relationship_depth <= 100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de interacciones proactivas
CREATE TABLE IF NOT EXISTS companion_proactive_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'time_based', 'pattern_based', 'emotional_state', etc.
    trigger_data JSONB NOT NULL,
    message_content TEXT NOT NULL,
    emotional_tone TEXT NOT NULL,
    success_rate REAL DEFAULT 0,
    user_response_type TEXT, -- 'positive', 'neutral', 'negative', 'ignored'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de evolución de personalidad
CREATE TABLE IF NOT EXISTS companion_personality_evolution (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    evolution_event TEXT NOT NULL,
    trait_changes JSONB NOT NULL, -- Qué rasgos cambiaron y cómo
    trigger_context TEXT NOT NULL,
    experience_gained INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización del Compañero Cognitivo
CREATE INDEX IF NOT EXISTS idx_companion_personalities_user ON companion_personalities(user_id);
CREATE INDEX IF NOT EXISTS idx_companion_memories_user_importance ON companion_memories(user_id, importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_companion_memories_timestamp ON companion_memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_states_user_timestamp ON companion_emotional_states(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user_type ON companion_behavior_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_user_timestamp ON voice_emotion_analysis(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_proactive_interactions_user ON companion_proactive_interactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_inner_world_user ON companion_inner_world(user_id);

-- Triggers para actualizar updated_at en tablas del compañero
CREATE TRIGGER update_companion_personalities_updated_at 
    BEFORE UPDATE ON companion_personalities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security para tablas del compañero
ALTER TABLE companion_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_emotional_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_emotion_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_inner_world ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_proactive_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_personality_evolution ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para el compañero cognitivo
CREATE POLICY "Enable all for service role" ON companion_personalities FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON companion_emotional_states FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON companion_memories FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON companion_behavior_patterns FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON voice_emotion_analysis FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON companion_inner_world FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON companion_proactive_interactions FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON companion_personality_evolution FOR ALL USING (true);

-- Comentarios para documentación del compañero cognitivo
COMMENT ON TABLE companion_personalities IS 'Personalidades únicas e irrepetibles de cada compañero cognitivo';
COMMENT ON TABLE companion_memories IS 'Memorias contextuales que recuerdan momentos y emociones, no solo datos';
COMMENT ON TABLE companion_emotional_states IS 'Estados emocionales dinámicos del compañero que evolucionan con las interacciones';
COMMENT ON TABLE companion_inner_world IS 'Mundo interior visible del compañero - su estado mental en tiempo real';
COMMENT ON TABLE voice_emotion_analysis IS 'Análisis de emociones detectadas en la voz del usuario';
COMMENT ON TABLE companion_proactive_interactions IS 'Registro de interacciones proactivas iniciadas por el compañero';


