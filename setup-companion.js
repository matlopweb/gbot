/**
 * SCRIPT DE CONFIGURACIÓN DEL COMPAÑERO COGNITIVO
 * 
 * Este script configura automáticamente la base de datos de Supabase
 * para habilitar el sistema revolucionario de Compañero Cognitivo
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

console.log('🚀 CONFIGURACIÓN DEL COMPAÑERO COGNITIVO');
console.log('==========================================');

// Verificar variables de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Error: Variables de Supabase no encontradas');
  console.error('   Asegúrate de tener SUPABASE_URL y SUPABASE_ANON_KEY en backend/.env');
  process.exit(1);
}

console.log('✅ Variables de Supabase encontradas');
console.log(`   URL: ${process.env.SUPABASE_URL.substring(0, 30)}...`);
console.log(`   Key: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...`);

// Crear cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupCognitiveCompanion() {
  try {
    console.log('\n🔍 Verificando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase.from('user_contexts').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('⚠️  Tablas básicas no encontradas, ejecutando esquema completo...');
      await executeFullSchema();
    } else if (error) {
      console.error('❌ Error de conexión a Supabase:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Conexión a Supabase exitosa');
      await setupCompanionTables();
    }

  } catch (error) {
    console.error('❌ Error en configuración:', error.message);
    process.exit(1);
  }
}

async function executeFullSchema() {
  try {
    console.log('\n📋 Ejecutando esquema completo de base de datos...');
    
    // Leer archivo SQL
    const sqlPath = path.join(__dirname, 'backend/src/config/supabase.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`🔧 Ejecutando ${commands.length} comandos SQL...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.includes('CREATE TABLE') || command.includes('companion_')) {
        console.log(`   ${i + 1}/${commands.length}: ${command.substring(0, 50)}...`);
      }

      try {
        // Usar RPC para ejecutar SQL crudo
        const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
        
        if (error) {
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            // Errores esperados, continuar
          } else {
            console.warn(`   ⚠️  Advertencia en comando ${i + 1}: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        // Intentar método alternativo para comandos que no funcionan con RPC
        if (command.includes('CREATE TABLE')) {
          console.warn(`   ⚠️  Comando ${i + 1} requiere ejecución manual en Supabase SQL Editor`);
        }
        errorCount++;
      }
    }

    console.log(`✅ Esquema ejecutado: ${successCount} éxitos, ${errorCount} advertencias`);
    
  } catch (error) {
    console.error('❌ Error ejecutando esquema:', error.message);
    throw error;
  }
}

async function setupCompanionTables() {
  try {
    console.log('\n🧠 Configurando tablas del Compañero Cognitivo...');

    // Lista de tablas del compañero cognitivo
    const companionTables = [
      'companion_personalities',
      'companion_emotional_states',
      'companion_memories',
      'companion_behavior_patterns',
      'voice_emotion_analysis',
      'companion_inner_world',
      'companion_proactive_interactions',
      'companion_personality_evolution'
    ];

    // Verificar qué tablas existen
    const existingTables = [];
    const missingTables = [];

    for (const tableName of companionTables) {
      try {
        const { error } = await supabase.from(tableName).select('*').limit(1);
        if (error) {
          missingTables.push(tableName);
        } else {
          existingTables.push(tableName);
        }
      } catch (err) {
        missingTables.push(tableName);
      }
    }

    console.log(`✅ Tablas existentes: ${existingTables.length}/${companionTables.length}`);
    existingTables.forEach(table => console.log(`   ✓ ${table}`));

    if (missingTables.length > 0) {
      console.log(`⚠️  Tablas faltantes: ${missingTables.length}`);
      missingTables.forEach(table => console.log(`   ✗ ${table}`));
      console.log('\n📝 Para crear las tablas faltantes:');
      console.log('   1. Ve a tu proyecto de Supabase');
      console.log('   2. Abre el SQL Editor');
      console.log('   3. Copia y pega el contenido de backend/src/config/supabase.sql');
      console.log('   4. Ejecuta el script');
    }

    // Crear datos de ejemplo si las tablas existen
    if (existingTables.includes('companion_personalities')) {
      await createSampleCompanion();
    }

  } catch (error) {
    console.error('❌ Error configurando tablas:', error.message);
    throw error;
  }
}

async function createSampleCompanion() {
  try {
    console.log('\n🎭 Creando compañero de ejemplo...');

    // Verificar si ya existe un compañero de ejemplo
    const { data: existing } = await supabase
      .from('companion_personalities')
      .select('*')
      .eq('user_id', 'demo_user')
      .single();

    if (existing) {
      console.log(`✅ Compañero "${existing.name}" ya existe`);
      return;
    }

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
      .insert([samplePersonality]);

    if (personalityError) {
      console.warn('⚠️  Error creando personalidad:', personalityError.message);
    } else {
      console.log('✅ Compañero "Luna" creado exitosamente');
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

    if (!emotionError) {
      console.log('✅ Estado emocional inicial creado');
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
      .insert([sampleInnerWorld]);

    if (!innerWorldError) {
      console.log('✅ Mundo interior inicial creado');
    }

  } catch (error) {
    console.warn('⚠️  Error creando datos de ejemplo:', error.message);
  }
}

async function testCompanionSystem() {
  try {
    console.log('\n🧪 Probando sistema del Compañero Cognitivo...');

    // Probar obtener personalidad
    const { data: personality, error: personalityError } = await supabase
      .from('companion_personalities')
      .select('*')
      .eq('user_id', 'demo_user')
      .single();

    if (personalityError) {
      console.log('❌ Error obteniendo personalidad:', personalityError.message);
      return false;
    }

    console.log(`✅ Personalidad encontrada: ${personality.name}`);
    console.log(`   Rasgos: ${personality.characteristics.slice(0, 2).join(', ')}...`);

    // Probar mundo interior
    const { data: innerWorld, error: innerWorldError } = await supabase
      .from('companion_inner_world')
      .select('*')
      .eq('user_id', 'demo_user')
      .single();

    if (!innerWorldError && innerWorld) {
      console.log(`✅ Mundo interior activo: ${innerWorld.emotional_state}`);
      console.log(`   Energía: ${innerWorld.energy_visualization}%`);
    }

    return true;

  } catch (error) {
    console.error('❌ Error probando sistema:', error.message);
    return false;
  }
}

// Ejecutar configuración
async function main() {
  try {
    await setupCognitiveCompanion();
    
    const systemWorking = await testCompanionSystem();
    
    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('============================');
    
    if (systemWorking) {
      console.log('✅ Compañero Cognitivo completamente funcional');
      console.log('✅ Base de datos configurada correctamente');
      console.log('✅ Datos de ejemplo creados');
      console.log('');
      console.log('🚀 ¡El sistema revolucionario está listo!');
      console.log('');
      console.log('Próximos pasos:');
      console.log('1. Recarga la aplicación web');
      console.log('2. Haz clic en el botón 🧠 para ver el Mundo Interior');
      console.log('3. Habla con tu compañero cognitivo único');
    } else {
      console.log('⚠️  Sistema parcialmente configurado');
      console.log('   Algunas tablas pueden necesitar creación manual');
    }
    
  } catch (error) {
    console.error('\n❌ CONFIGURACIÓN FALLIDA');
    console.error('========================');
    console.error('Error:', error.message);
    console.error('');
    console.error('Soluciones:');
    console.error('1. Verifica las variables SUPABASE_URL y SUPABASE_ANON_KEY');
    console.error('2. Ejecuta manualmente el SQL en Supabase SQL Editor');
    console.error('3. Verifica los permisos de la base de datos');
  }
}

main();
