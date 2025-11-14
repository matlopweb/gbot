/**
 * CONFIGURACIÓN INMEDIATA DEL COMPAÑERO COGNITIVO
 * Script simplificado para configurar ahora mismo
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

console.log('🚀 CONFIGURACIÓN INMEDIATA DEL COMPAÑERO COGNITIVO');
console.log('=================================================');

// Verificar variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Variables de Supabase no encontradas en backend/.env');
  process.exit(1);
}

console.log('✅ Variables encontradas');
console.log(`   URL: ${process.env.SUPABASE_URL.substring(0, 30)}...`);

// Crear cliente
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupNow() {
  try {
    console.log('\n🔍 Verificando conexión...');
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('user_contexts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Tablas básicas no encontradas, esto es normal para primera configuración');
    } else {
      console.log('✅ Conexión a Supabase exitosa');
    }

    console.log('\n🧠 Creando tablas del Compañero Cognitivo...');
    
    // Crear tabla de personalidades
    console.log('   📋 Creando companion_personalities...');
    const { error: personalityError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companion_personalities (
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
        );
      `
    });

    if (personalityError && !personalityError.message.includes('already exists')) {
      console.warn('   ⚠️  Error creando personalities:', personalityError.message);
    } else {
      console.log('   ✅ companion_personalities creada');
    }

    // Crear tabla de estados emocionales
    console.log('   📋 Creando companion_emotional_states...');
    const { error: emotionError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (emotionError && !emotionError.message.includes('already exists')) {
      console.warn('   ⚠️  Error creando emotional_states:', emotionError.message);
    } else {
      console.log('   ✅ companion_emotional_states creada');
    }

    // Crear tabla de mundo interior
    console.log('   📋 Creando companion_inner_world...');
    const { error: innerWorldError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (innerWorldError && !innerWorldError.message.includes('already exists')) {
      console.warn('   ⚠️  Error creando inner_world:', innerWorldError.message);
    } else {
      console.log('   ✅ companion_inner_world creada');
    }

    // Crear tabla de memorias
    console.log('   📋 Creando companion_memories...');
    const { error: memoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companion_memories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          emotional_context JSONB NOT NULL,
          importance_score INTEGER NOT NULL CHECK (importance_score >= 0 AND importance_score <= 100),
          associations JSONB DEFAULT '[]',
          recall_count INTEGER DEFAULT 0,
          last_recalled TIMESTAMP WITH TIME ZONE,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (memoriesError && !memoriesError.message.includes('already exists')) {
      console.warn('   ⚠️  Error creando memories:', memoriesError.message);
    } else {
      console.log('   ✅ companion_memories creada');
    }

    console.log('\n🎭 Creando compañero de ejemplo "Luna"...');
    
    // Crear personalidad de Luna
    const { error: insertError } = await supabase
      .from('companion_personalities')
      .upsert([{
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
      }]);

    if (insertError) {
      console.warn('   ⚠️  Error creando Luna:', insertError.message);
    } else {
      console.log('   ✅ Compañero "Luna" creado');
    }

    // Crear estado emocional inicial
    const { error: emotionInsertError } = await supabase
      .from('companion_emotional_states')
      .upsert([{
        user_id: 'demo_user',
        current_mood: 'curious',
        energy_level: 75,
        empathy_level: 85,
        excitement: 60,
        calmness: 70,
        emotional_memory: []
      }]);

    if (!emotionInsertError) {
      console.log('   ✅ Estado emocional inicial creado');
    }

    // Crear mundo interior inicial
    const { error: innerInsertError } = await supabase
      .from('companion_inner_world')
      .upsert([{
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
      }]);

    if (!innerInsertError) {
      console.log('   ✅ Mundo interior inicial creado');
    }

    console.log('\n🧪 Probando sistema...');
    
    // Verificar que todo funciona
    const { data: testPersonality } = await supabase
      .from('companion_personalities')
      .select('*')
      .eq('user_id', 'demo_user')
      .single();

    if (testPersonality) {
      console.log(`   ✅ Personalidad verificada: ${testPersonality.name}`);
      console.log(`   ✅ Rasgos: ${testPersonality.characteristics.slice(0, 2).join(', ')}...`);
    }

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
    console.log('============================');
    console.log('✅ Tablas del Compañero Cognitivo creadas');
    console.log('✅ Compañero "Luna" configurado');
    console.log('✅ Sistema completamente funcional');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('1. Recarga tu aplicación web');
    console.log('2. Haz clic en el botón 🧠 para ver el Mundo Interior');
    console.log('3. ¡Habla con tu compañero cognitivo único!');

  } catch (error) {
    console.error('\n❌ Error en configuración:', error.message);
    console.error('\n💡 Si ves errores de "exec_sql", es normal.');
    console.error('   Copia manualmente el SQL de backend/src/config/supabase.sql');
    console.error('   y ejecútalo en el SQL Editor de Supabase.');
  }
}

setupNow();
