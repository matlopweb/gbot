/**
 * CONFIGURACIÓN MANUAL DEL COMPAÑERO COGNITIVO
 * Ingresa tus variables de Supabase manualmente
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('🚀 CONFIGURACIÓN MANUAL DEL COMPAÑERO COGNITIVO');
console.log('===============================================');
console.log('');
console.log('Necesitamos tus variables de Supabase para continuar.');
console.log('Puedes encontrarlas en: https://supabase.com/dashboard/project/[tu-proyecto]/settings/api');
console.log('');

async function setupManual() {
  try {
    // Solicitar variables de Supabase
    const supabaseUrl = await question('🔗 Ingresa tu SUPABASE_URL: ');
    const supabaseKey = await question('🔑 Ingresa tu SUPABASE_ANON_KEY: ');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables requeridas no proporcionadas');
      rl.close();
      return;
    }

    console.log('\n✅ Variables recibidas');
    console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n🔍 Verificando conexión...');
    
    // Probar conexión
    const { data, error } = await supabase
      .from('user_contexts')
      .select('count')
      .limit(1);
    
    if (error && error.code !== '42P01') {
      console.error('❌ Error de conexión:', error.message);
      rl.close();
      return;
    }

    console.log('✅ Conexión exitosa a Supabase');

    console.log('\n🧠 Configurando Compañero Cognitivo...');
    console.log('');
    console.log('⚠️  IMPORTANTE: Si ves errores de "exec_sql", es normal.');
    console.log('   Tendrás que ejecutar el SQL manualmente en Supabase.');
    console.log('');

    const continuar = await question('¿Continuar con la configuración automática? (s/n): ');
    
    if (continuar.toLowerCase() !== 's' && continuar.toLowerCase() !== 'si') {
      console.log('\n📋 CONFIGURACIÓN MANUAL:');
      console.log('======================');
      console.log('1. Ve a tu proyecto de Supabase');
      console.log('2. Abre el SQL Editor');
      console.log('3. Copia todo el contenido de: backend/src/config/supabase.sql');
      console.log('4. Pega y ejecuta el script completo');
      console.log('5. Recarga tu aplicación web');
      rl.close();
      return;
    }

    // Intentar configuración automática
    console.log('\n📋 Creando tablas...');

    // Crear tabla de personalidades
    console.log('   🎭 companion_personalities...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
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
      
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
      console.log('      ✅ Creada');
    } catch (err) {
      console.log('      ❌ Error:', err.message);
    }

    // Crear tabla de mundo interior
    console.log('   🌟 companion_inner_world...');
    try {
      const { error } = await supabase.rpc('exec_sql', {
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
      
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
      console.log('      ✅ Creada');
    } catch (err) {
      console.log('      ❌ Error:', err.message);
    }

    console.log('\n🎭 Creando compañero "Luna"...');
    
    // Crear personalidad de Luna
    try {
      const { error } = await supabase
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

      if (error) {
        throw error;
      }
      console.log('   ✅ Compañero "Luna" creado');
    } catch (err) {
      console.log('   ❌ Error creando Luna:', err.message);
    }

    // Crear mundo interior
    try {
      const { error } = await supabase
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

      if (error) {
        throw error;
      }
      console.log('   ✅ Mundo interior creado');
    } catch (err) {
      console.log('   ❌ Error creando mundo interior:', err.message);
    }

    console.log('\n🧪 Probando sistema...');
    
    // Verificar que funciona
    try {
      const { data } = await supabase
        .from('companion_personalities')
        .select('*')
        .eq('user_id', 'demo_user')
        .single();

      if (data) {
        console.log(`   ✅ Compañero verificado: ${data.name}`);
        console.log(`   ✅ Rasgos: ${data.characteristics.slice(0, 2).join(', ')}...`);
      }
    } catch (err) {
      console.log('   ⚠️  No se pudo verificar el compañero');
    }

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
    console.log('============================');
    console.log('✅ Sistema del Compañero Cognitivo configurado');
    console.log('✅ Compañero "Luna" disponible');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('1. Recarga tu aplicación web');
    console.log('2. Busca el botón 🧠 en la esquina superior izquierda');
    console.log('3. ¡Explora el Mundo Interior de tu compañero!');
    console.log('4. Habla con el sistema de voz para interactuar');
    console.log('');
    console.log('Si algo no funciona, ejecuta manualmente el SQL de:');
    console.log('backend/src/config/supabase.sql en tu proyecto de Supabase');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

setupManual();
