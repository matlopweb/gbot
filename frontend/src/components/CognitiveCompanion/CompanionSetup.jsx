import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Database, CheckCircle, AlertCircle, Loader, 
  Sparkles, Heart, Zap, Settings, Play, RefreshCw
} from 'lucide-react';

/**
 * CONFIGURACIÓN DEL COMPAÑERO COGNITIVO
 * 
 * Componente para configurar automáticamente la base de datos
 * y inicializar el sistema revolucionario de personalidad evolutiva
 */
export function CompanionSetup({ onSetupComplete }) {
  const [setupStatus, setSetupStatus] = useState('checking'); // checking, ready, setup_required, setting_up, complete, error
  const [systemStatus, setSystemStatus] = useState(null);
  const [setupProgress, setSetupProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [companion, setCompanion] = useState(null);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const checkSystemStatus = async () => {
    try {
      addLog('🔍 Verificando estado del sistema...', 'info');
      
      const response = await fetch('/api/companion/status');
      const data = await response.json();
      
      setSystemStatus(data);
      
      if (data.status === 'ready') {
        setSetupStatus('ready');
        addLog('✅ Sistema de Compañero Cognitivo operativo', 'success');
      } else if (data.setup_required) {
        setSetupStatus('setup_required');
        addLog('⚠️ Configuración de base de datos requerida', 'warning');
      } else {
        setSetupStatus('partial');
        addLog('⚠️ Configuración parcial detectada', 'warning');
      }
      
    } catch (error) {
      setSetupStatus('error');
      addLog(`❌ Error verificando sistema: ${error.message}`, 'error');
    }
  };

  const setupDatabase = async () => {
    try {
      setSetupStatus('setting_up');
      setSetupProgress(10);
      addLog('🚀 Iniciando configuración de base de datos...', 'info');

      const response = await fetch('/api/companion/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setSetupProgress(50);
      addLog('📋 Ejecutando comandos SQL...', 'info');

      const data = await response.json();
      
      if (data.status === 'success') {
        setSetupProgress(80);
        addLog('✅ Base de datos configurada exitosamente', 'success');
        
        // Crear compañero de ejemplo
        await createSampleCompanion();
        
        setSetupProgress(100);
        setSetupStatus('complete');
        addLog('🎉 ¡Compañero Cognitivo listo para usar!', 'success');
        
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        throw new Error(data.message || 'Error en configuración');
      }

    } catch (error) {
      setSetupStatus('error');
      addLog(`❌ Error en configuración: ${error.message}`, 'error');
    }
  };

  const createSampleCompanion = async () => {
    try {
      addLog('🎭 Creando compañero cognitivo de ejemplo...', 'info');
      
      const response = await fetch('/api/companion/demo_user/create', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCompanion(data.companion);
        addLog(`✨ Compañero "${data.companion.name}" creado`, 'success');
      }
    } catch (error) {
      addLog(`⚠️ Advertencia creando compañero: ${error.message}`, 'warning');
    }
  };

  const getStatusIcon = () => {
    switch (setupStatus) {
      case 'checking':
        return <Loader className="animate-spin text-blue-500" size={32} />;
      case 'ready':
        return <CheckCircle className="text-green-500" size={32} />;
      case 'setup_required':
        return <AlertCircle className="text-yellow-500" size={32} />;
      case 'setting_up':
        return <RefreshCw className="animate-spin text-purple-500" size={32} />;
      case 'complete':
        return <Sparkles className="text-pink-500" size={32} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={32} />;
      default:
        return <Brain className="text-gray-500" size={32} />;
    }
  };

  const getStatusMessage = () => {
    switch (setupStatus) {
      case 'checking':
        return 'Verificando sistema...';
      case 'ready':
        return 'Sistema operativo';
      case 'setup_required':
        return 'Configuración requerida';
      case 'setting_up':
        return 'Configurando sistema...';
      case 'complete':
        return '¡Configuración completa!';
      case 'error':
        return 'Error en configuración';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: setupStatus === 'setting_up' ? 360 : 0,
                scale: setupStatus === 'complete' ? [1, 1.2, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 2, repeat: setupStatus === 'setting_up' ? Infinity : 0 },
                scale: { duration: 0.5 }
              }}
            >
              {getStatusIcon()}
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Compañero Cognitivo</h2>
              <p className="text-purple-200">{getStatusMessage()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          {setupStatus === 'setting_up' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progreso de configuración</span>
                <span>{setupProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${setupProgress}%` }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* System Status */}
          {systemStatus && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Database size={16} />
                Estado del Sistema
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <span className={`ml-2 ${
                    systemStatus.status === 'ready' ? 'text-green-400' :
                    systemStatus.status === 'partial' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {systemStatus.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Personalidades:</span>
                  <span className="ml-2 text-white">{systemStatus.personality_count || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Companion Info */}
          {companion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30"
            >
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Heart size={16} />
                Tu Compañero Cognitivo
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{companion.mood === 'curious' ? '🤔' : '😊'}</span>
                  <div>
                    <p className="text-white font-medium">{companion.name}</p>
                    <p className="text-purple-200 text-sm">Energía: {companion.energy}%</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {companion.traits?.slice(0, 3).map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {setupStatus === 'setup_required' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={setupDatabase}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Settings size={20} />
                Configurar Sistema
              </motion.button>
            )}

            {setupStatus === 'ready' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSetupComplete && onSetupComplete()}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Play size={20} />
                Continuar
              </motion.button>
            )}

            {setupStatus === 'complete' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSetupComplete && onSetupComplete()}
                className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Sparkles size={20} />
                ¡Empezar a Usar!
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={checkSystemStatus}
              className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={20} />
            </motion.button>
          </div>

          {/* Logs */}
          <div className="bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto">
            <h3 className="text-white font-medium mb-3">Registro de Actividad</h3>
            <div className="space-y-1">
              <AnimatePresence>
                {logs.slice(-10).map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-gray-500 text-xs">{log.timestamp}</span>
                    <span className={`${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      log.type === 'error' ? 'text-red-400' :
                      'text-gray-300'
                    }`}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CompanionSetup;
