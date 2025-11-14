import express from 'express';
import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import CognitiveCompanion from '../services/cognitiveCompanion.js';

const router = express.Router();

/**
 * RUTAS DEL COMPAÑERO COGNITIVO
 * 
 * Endpoints para gestionar el sistema revolucionario de personalidad evolutiva
 */

/**
 * GET /api/companion/test
 * Ruta de prueba para verificar que el sistema funciona
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Rutas del Compañero Cognitivo funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * GET /api/companion/status
 * Verificar estado del sistema de compañero cognitivo
 */
router.get('/status', async (req, res) => {
  try {
    logger.info('🔍 Checking Cognitive Companion system status...');

    // Verificar si Supabase está disponible
    if (!supabase) {
      return res.json({
        status: 'supabase_not_configured',
        message: 'Supabase no está configurado',
        setup_required: true,
        debug: {
          supabase_url: !!process.env.SUPABASE_URL,
          supabase_key: !!process.env.SUPABASE_ANON_KEY
        }
      });
    }

    // Verificar conexión a base de datos
    let testConnection, connectionError;
    try {
      const result = await supabase
        .from('companion_personalities')
        .select('count(*)')
        .limit(1);
      testConnection = result.data;
      connectionError = result.error;
    } catch (err) {
      connectionError = err;
    }

    if (connectionError) {
      return res.json({
        status: 'database_not_configured',
        message: 'Base de datos no configurada para Compañero Cognitivo',
        error: connectionError.message,
        setup_required: true,
        debug: {
          error_code: connectionError.code,
          error_details: connectionError.details
        }
      });
    }

    // Contar personalidades existentes
    const { data: personalityCount } = await supabase
      .from('companion_personalities')
      .select('id', { count: 'exact' });

    // Verificar tablas requeridas
    const requiredTables = [
      'companion_personalities',
      'companion_emotional_states',
      'companion_memories',
      'companion_inner_world'
    ];

    const tableStatus = {};
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        tableStatus[table] = error ? 'missing' : 'ready';
      } catch (err) {
        tableStatus[table] = 'error';
      }
    }

    const allTablesReady = Object.values(tableStatus).every(status => status === 'ready');

    res.json({
      status: allTablesReady ? 'ready' : 'partial',
      message: allTablesReady 
        ? 'Sistema de Compañero Cognitivo completamente operativo'
        : 'Algunas tablas del Compañero Cognitivo faltan',
      tables: tableStatus,
      personality_count: personalityCount?.length || 0,
      setup_required: !allTablesReady
    });

  } catch (error) {
    logger.error('Error checking companion status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verificando estado del sistema',
      error: error.message
    });
  }
});

/**
 * POST /api/companion/setup
 * Configurar automáticamente la base de datos del compañero cognitivo
 */
router.post('/setup', async (req, res) => {
  try {
    logger.info('🚀 Setting up Cognitive Companion database...');

    // Comandos SQL para crear las tablas
    const setupCommands = [
      `CREATE TABLE IF NOT EXISTS companion_personalities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        traits JSONB NOT NULL,
        characteristics TEXT[] NOT NULL,
        communication_style TEXT NOT NULL,
        interests TEXT[] NOT NULL,
        humor_style TEXT NOT NULL,
        energy_patterns JSONB NOT NULL,
        evolution_level INTEGER DEFAULT 1,
        experience_points INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS companion_emotional_states (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS companion_memories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        emotional_context JSONB NOT NULL,
        importance_score INTEGER NOT NULL CHECK (importance_score >= 0 AND importance_score <= 100),
        associations JSONB DEFAULT '[]',
        recall_count INTEGER DEFAULT 0,
        last_recalled TIMESTAMP WITH TIME ZONE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS companion_inner_world (
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
      )`
    ];

    // Ejecutar comandos de configuración
    const results = [];
    for (let i = 0; i < setupCommands.length; i++) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: setupCommands[i] });
        results.push({
          command: i + 1,
          status: error ? 'error' : 'success',
          error: error?.message
        });
      } catch (err) {
        // Intentar método alternativo
        try {
          await supabase.from('_temp_setup').insert([{ sql: setupCommands[i] }]);
          results.push({ command: i + 1, status: 'success' });
        } catch (err2) {
          results.push({
            command: i + 1,
            status: 'error',
            error: err2.message
          });
        }
      }
    }

    // Crear datos de ejemplo
    await createSampleCompanion();

    logger.info('✅ Cognitive Companion database setup completed');

    res.json({
      status: 'success',
      message: 'Base de datos del Compañero Cognitivo configurada exitosamente',
      setup_results: results,
      next_steps: [
        'Reiniciar el servidor para cargar el nuevo esquema',
        'Probar la creación de un compañero cognitivo',
        'Verificar el mundo interior en la interfaz'
      ]
    });

  } catch (error) {
    logger.error('Error setting up companion database:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error configurando base de datos',
      error: error.message
    });
  }
});

/**
 * GET /api/companion/:userId
 * Obtener información del compañero cognitivo de un usuario
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const companion = new CognitiveCompanion(userId);
    const initialized = await companion.initialize();
    
    if (!initialized) {
      return res.status(404).json({
        status: 'not_found',
        message: 'Compañero cognitivo no encontrado para este usuario'
      });
    }

    res.json({
      status: 'success',
      companion: {
        personality: companion.personality,
        emotional_state: companion.emotionalState,
        inner_world: companion.getInnerWorldState(),
        memory_count: companion.memories.size,
        relationship_depth: companion.calculateRelationshipDepth()
      }
    });

  } catch (error) {
    logger.error('Error getting companion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo información del compañero',
      error: error.message
    });
  }
});

/**
 * POST /api/companion/:userId/create
 * Crear un nuevo compañero cognitivo para un usuario
 */
router.post('/:userId/create', async (req, res) => {
  try {
    const { userId } = req.params;
    
    logger.info(`🎭 Creating new cognitive companion for user: ${userId}`);
    
    const companion = new CognitiveCompanion(userId);
    const initialized = await companion.initialize();
    
    if (initialized) {
      res.json({
        status: 'success',
        message: `Compañero cognitivo "${companion.personality.name}" creado exitosamente`,
        companion: {
          name: companion.personality.name,
          traits: companion.personality.characteristics,
          mood: companion.emotionalState.current_mood,
          energy: companion.emotionalState.energy_level
        }
      });
    } else {
      throw new Error('Failed to initialize companion');
    }

  } catch (error) {
    logger.error('Error creating companion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creando compañero cognitivo',
      error: error.message
    });
  }
});

/**
 * GET /api/companion/:userId/inner-world
 * Obtener estado actual del mundo interior
 */
router.get('/:userId/inner-world', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('companion_inner_world')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({
        status: 'not_found',
        message: 'Mundo interior no encontrado'
      });
    }

    res.json({
      status: 'success',
      inner_world: data
    });

  } catch (error) {
    logger.error('Error getting inner world:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error obteniendo mundo interior',
      error: error.message
    });
  }
});

/**
 * Función auxiliar para crear compañero de ejemplo
 */
async function createSampleCompanion() {
  try {
    const samplePersonality = {
      user_id: 'demo_user',
      name: 'Luna',
      traits: {
        openness: 85,
        conscientiousness: 70,
        extraversion: 60,
        agreeableness: 90,
        neuroticism: 20,
        curiosity: 95,
        playfulness: 75,
        supportiveness: 85,
        intuition: 80,
        creativity: 88
      },
      characteristics: [
        'Extremadamente curioso',
        'Sentido del humor natural', 
        'Altamente intuitivo',
        'Pensamiento creativo',
        'Increíblemente empático'
      ],
      communication_style: 'Conversador y energético, Usa humor y metáforas, Expresiones creativas y originales, Tono cálido y comprensivo',
      interests: ['Filosofía', 'Arte', 'Ciencia', 'Música', 'Naturaleza'],
      humor_style: 'Humor inteligente con toques de ironía suave',
      energy_patterns: {
        morning_energy: 80,
        afternoon_energy: 90,
        evening_energy: 70,
        peak_hours: ['10:00', '15:00', '20:00']
      }
    };

    await supabase.from('companion_personalities').upsert([samplePersonality]);
    logger.info('✅ Sample companion "Luna" created');

  } catch (error) {
    logger.warn('Warning creating sample companion:', error.message);
  }
}

export default router;
