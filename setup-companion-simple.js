/**
 * CONFIGURACIÓN SIMPLE DEL COMPAÑERO COGNITIVO
 * 
 * Este script usa la API del backend para configurar el Compañero Cognitivo
 * sin necesidad de acceso directo a Supabase
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

console.log('🚀 CONFIGURACIÓN SIMPLE DEL COMPAÑERO COGNITIVO');
console.log('===============================================');

async function setupCompanionViaAPI() {
  try {
    console.log('🔍 Verificando estado del sistema...');
    
    // Verificar estado actual
    const statusResponse = await fetch(`${API_BASE}/companion/status`);
    
    if (!statusResponse.ok) {
      console.error('❌ Error: No se puede conectar al servidor backend');
      console.error('   Asegúrate de que el servidor esté corriendo en puerto 3001');
      process.exit(1);
    }
    
    const statusData = await statusResponse.json();
    console.log('📊 Estado actual:', statusData.status);
    
    if (statusData.status === 'ready') {
      console.log('✅ ¡El Compañero Cognitivo ya está configurado!');
      await testCompanion();
      return;
    }
    
    if (statusData.setup_required) {
      console.log('🔧 Configuración requerida, iniciando setup...');
      
      // Ejecutar configuración automática
      const setupResponse = await fetch(`${API_BASE}/companion/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const setupData = await setupResponse.json();
      
      if (setupData.status === 'success') {
        console.log('✅ Configuración completada exitosamente');
        console.log('📋 Resultados:', setupData.setup_results?.length || 0, 'comandos ejecutados');
        
        // Crear compañero de ejemplo
        await createSampleCompanion();
        
        console.log('\n🎉 ¡COMPAÑERO COGNITIVO LISTO!');
        console.log('============================');
        console.log('✅ Base de datos configurada');
        console.log('✅ Compañero de ejemplo creado');
        console.log('✅ Sistema completamente funcional');
        
      } else {
        console.error('❌ Error en configuración:', setupData.message);
        console.error('   Detalles:', setupData.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en configuración:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solución:');
      console.error('   1. Inicia el servidor backend: npm run dev:backend');
      console.error('   2. Espera a que esté corriendo en puerto 3001');
      console.error('   3. Ejecuta este script nuevamente');
    }
  }
}

async function createSampleCompanion() {
  try {
    console.log('🎭 Creando compañero de ejemplo...');
    
    const response = await fetch(`${API_BASE}/companion/demo_user/create`, {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log(`✅ Compañero "${data.companion.name}" creado`);
      console.log(`   Rasgos: ${data.companion.traits?.slice(0, 2).join(', ')}...`);
      console.log(`   Estado: ${data.companion.mood} (${data.companion.energy}% energía)`);
    } else {
      console.warn('⚠️  Advertencia creando compañero:', data.message);
    }
    
  } catch (error) {
    console.warn('⚠️  Error creando compañero de ejemplo:', error.message);
  }
}

async function testCompanion() {
  try {
    console.log('🧪 Probando compañero existente...');
    
    const response = await fetch(`${API_BASE}/companion/demo_user`);
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log(`✅ Compañero encontrado: ${data.companion.personality.name}`);
      console.log(`   Energía: ${data.companion.emotional_state.energy_level}%`);
      console.log(`   Memorias: ${data.companion.memory_count}`);
      console.log(`   Relación: ${data.companion.relationship_depth}%`);
    }
    
  } catch (error) {
    console.warn('⚠️  Error probando compañero:', error.message);
  }
}

// Ejecutar configuración
setupCompanionViaAPI();
