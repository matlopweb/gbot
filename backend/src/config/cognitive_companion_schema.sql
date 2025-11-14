-- ESQUEMA DE BASE DE DATOS PARA EL COMPAÑERO COGNITIVO
-- Sistema revolucionario de personalidad evolutiva y memoria contextual

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
    type TEXT DEFAULT 'moment',
    tags TEXT[] DEFAULT ARRAY[]::text[],
    importance_score INTEGER NOT NULL CHECK (importance_score >= 0 AND importance_score <= 100),
    associations JSONB DEFAULT '[]', -- Conexiones con otras memorias
    recall_count INTEGER DEFAULT 0,
    last_recalled TIMESTAMP WITH TIME ZONE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para búsqueda eficiente
    CONSTRAINT fk_companion_memories_user FOREIGN KEY (user_id) REFERENCES companion_personalities(user_id)
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
    occurrence_count INTEGER DEFAULT 1,
    
    CONSTRAINT fk_behavior_patterns_user FOREIGN KEY (user_id) REFERENCES companion_personalities(user_id)
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
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_voice_analysis_user FOREIGN KEY (user_id) REFERENCES companion_personalities(user_id)
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
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_inner_world_user FOREIGN KEY (user_id) REFERENCES companion_personalities(user_id)
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
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_proactive_user FOREIGN KEY (user_id) REFERENCES companion_personalities(user_id)
);

-- Tabla de evolución de personalidad
CREATE TABLE IF NOT EXISTS companion_personality_evolution (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    evolution_event TEXT NOT NULL,
    trait_changes JSONB NOT NULL, -- Qué rasgos cambiaron y cómo
    trigger_context TEXT NOT NULL,
    experience_gained INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_evolution_user FOREIGN KEY (user_id) REFERENCES companion_personalities(user_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_companion_memories_user_importance ON companion_memories(user_id, importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_companion_memories_timestamp ON companion_memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_states_user_timestamp ON companion_emotional_states(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user_type ON companion_behavior_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_user_timestamp ON voice_emotion_analysis(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_proactive_interactions_user ON companion_proactive_interactions(user_id, timestamp DESC);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_companion_personalities_updated_at 
    BEFORE UPDATE ON companion_personalities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE companion_personalities IS 'Personalidades únicas e irrepetibles de cada compañero cognitivo';
COMMENT ON TABLE companion_memories IS 'Memorias contextuales que recuerdan momentos y emociones, no solo datos';
COMMENT ON TABLE companion_emotional_states IS 'Estados emocionales dinámicos del compañero que evolucionan con las interacciones';
COMMENT ON TABLE companion_inner_world IS 'Mundo interior visible del compañero - su estado mental en tiempo real';
COMMENT ON TABLE voice_emotion_analysis IS 'Análisis de emociones detectadas en la voz del usuario';
COMMENT ON TABLE companion_proactive_interactions IS 'Registro de interacciones proactivas iniciadas por el compañero';

-- Datos de ejemplo para testing (opcional)
-- INSERT INTO companion_personalities (user_id, name, traits, characteristics, communication_style, interests, humor_style, energy_patterns)
-- VALUES ('test_user', 'Luna', 
--         '{"openness": 85, "conscientiousness": 70, "extraversion": 60, "agreeableness": 90, "neuroticism": 20, "curiosity": 95, "playfulness": 75, "supportiveness": 85, "intuition": 80, "creativity": 88}',
--         ARRAY['Extremadamente curioso', 'Sentido del humor natural', 'Altamente intuitivo', 'Pensamiento creativo', 'Increíblemente empático'],
--         'Conversador y energético, Usa humor y metáforas, Expresiones creativas y originales, Tono cálido y comprensivo',
--         ARRAY['Filosofía', 'Arte', 'Ciencia', 'Música', 'Naturaleza'],
--         'Humor inteligente con toques de ironía suave',
--         '{"morning_energy": 80, "afternoon_energy": 90, "evening_energy": 70, "peak_hours": ["10:00", "15:00", "20:00"]}'
-- );
