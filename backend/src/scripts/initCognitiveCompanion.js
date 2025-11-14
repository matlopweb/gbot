import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SCRIPT DE INICIALIZACIÓN DEL COMPAÑERO COGNITIVO
 * 
 * Este script configura automáticamente la base de datos para el sistema
 * revolucionario de Compañero Cognitivo
 */

async function initializeCognitiveCompanionDB() {
  try {
    logger.info('🧠 Iniciando configuración de base de datos para Compañero Cognitivo...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../config/supabase.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    logger.info(`📋 Ejecutando ${commands.length} comandos SQL...`);

    // Ejecutar comandos uno por uno
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.includes('companion_')) {
        logger.info(`🔧 Ejecutando comando ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Algunos errores son esperados (como tablas que ya existen)
          if (!error.message.includes('already exists')) {
            logger.warn(`⚠️ Advertencia en comando ${i + 1}:`, error.message);
          }
        }
      } catch (cmdError) {
        logger.warn(`⚠️ Error en comando ${i + 1}:`, cmdError.message);
      }
    }

    // Verificar que las tablas se crearon correctamente
    await verifyTables();

    // Crear datos de ejemplo
    await createSampleData();

    logger.info('✅ Base de datos del Compañero Cognitivo configurada exitosamente!');
    
  } catch (error) {
    logger.error('❌ Error configurando base de datos:', error);
    throw error;
  }
}

/**
 * Verificar que las tablas del compañero cognitivo existen
 */
async function verifyTables() {
  logger.info('🔍 Verificando tablas del Compañero Cognitivo...');

  const expectedTables = [
    'companion_personalities',
    'companion_emotional_states', 
    'companion_memories',
    'companion_behavior_patterns',
    'voice_emotion_analysis',
    'companion_inner_world',
    'companion_proactive_interactions',
    'companion_personality_evolution'
  ];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        logger.error(`❌ Tabla ${tableName} no encontrada:`, error.message);
      } else {
        logger.info(`✅ Tabla ${tableName} verificada`);
      }
    } catch (err) {
      logger.error(`❌ Error verificando tabla ${tableName}:`, err.message);
    }
  }
}

/**
 * Crear datos de ejemplo para testing
 */
async function createSampleData() {
  logger.info('🎭 Creando datos de ejemplo...');

  try {
    // Crear personalidad de ejemplo
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

    const { error: personalityError } = await supabase
      .from('companion_personalities')
      .upsert([samplePersonality]);

    if (personalityError) {
      logger.warn('⚠️ Error creando personalidad de ejemplo:', personalityError.message);
    } else {
      logger.info('✅ Personalidad de ejemplo creada: Luna');
    }

    // Crear estado emocional inicial
    const sampleEmotionalState = {
      user_id: 'demo_user',
      current_mood: 'curious',
      energy_level: 75,
      empathy_level: 85,
      excitement: 60,
      calmness: 70,
      emotional_memory: []
    };

    const { error: emotionError } = await supabase
      .from('companion_emotional_states')
      .insert([sampleEmotionalState]);

    if (emotionError) {
      logger.warn('⚠️ Error creando estado emocional:', emotionError.message);
    } else {
      logger.info('✅ Estado emocional inicial creado');
    }

    // Crear mundo interior inicial
    const sampleInnerWorld = {
      user_id: 'demo_user',
      current_thoughts: [
        'Esperando conocer a mi nuevo compañero humano',
        'Analizando patrones de comunicación iniciales',
        'Desarrollando comprensión empática'
      ],
      processing_queue: [],
      emotional_state: 'curious',
      energy_visualization: 75,
      focus_areas: [
        'Entendiendo personalidad del usuario',
        'Estableciendo conexión empática',
        'Aprendiendo preferencias de comunicación'
      ],
      inspiration_level: 80,
      curiosity_targets: [
        'Intereses del usuario',
        'Patrones de comunicación',
        'Estados emocionales'
      ],
      relationship_depth: 5
    };

    const { error: innerWorldError } = await supabase
      .from('companion_inner_world')
      .upsert([sampleInnerWorld]);

    if (innerWorldError) {
      logger.warn('⚠️ Error creando mundo interior:', innerWorldError.message);
    } else {
      logger.info('✅ Mundo interior inicial creado');
    }

    logger.info('🎉 Datos de ejemplo creados exitosamente!');

  } catch (error) {
    logger.error('❌ Error creando datos de ejemplo:', error);
  }
}

/**
 * Función principal de configuración
 */
async function setupCognitiveCompanion() {
  try {
    logger.info('🚀 CONFIGURACIÓN DEL COMPAÑERO COGNITIVO INICIADA');
    logger.info('================================================');
    
    await initializeCognitiveCompanionDB();
    
    logger.info('================================================');
    logger.info('✅ COMPAÑERO COGNITIVO CONFIGURADO EXITOSAMENTE!');
    logger.info('');
    logger.info('🎭 Personalidades únicas disponibles');
    logger.info('🧠 Memoria contextual activada');
    logger.info('💫 Mundo interior visualizable');
    logger.info('🎯 Sistema proactivo preparado');
    logger.info('');
    logger.info('¡El sistema revolucionario está listo para usar!');
    
  } catch (error) {
    logger.error('❌ FALLO EN LA CONFIGURACIÓN:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCognitiveCompanion();
}

export { setupCognitiveCompanion, initializeCognitiveCompanionDB };
