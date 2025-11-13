import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';
import { Activity, Wifi, Mic, Volume2, MessageSquare, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Monitor del Sistema en Tiempo Real
 * Diagnóstica y muestra el estado de todos los componentes críticos
 */
export function SystemMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [systemHealth, setSystemHealth] = useState({});
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  
  const { isConnected, messages } = useBotStore();
  const { send } = useWebSocket();
  const { token, user } = useAuthStore();
  
  const intervalRef = useRef(null);
  const logRef = useRef(null);

  // Función de logging centralizada
  const addLog = (level, component, message, data = {}) => {
    const logEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level,
      component,
      message,
      data
    };
    
    setLogs(prev => [...prev.slice(-99), logEntry]); // Mantener últimos 100 logs
    
    // También loggear en consola
    const prefix = `[${component}]`;
    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  };

  // Verificar salud del sistema
  const checkSystemHealth = async () => {
    const health = {
      timestamp: Date.now(),
      overall: 'healthy', // healthy, warning, critical
      components: {}
    };

    try {
      // 1. Autenticación
      health.components.auth = {
        status: token && user ? 'healthy' : 'critical',
        details: {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          hasUser: !!user,
          userId: user?.id
        }
      };

      // 2. WebSocket
      health.components.websocket = {
        status: isConnected ? 'healthy' : 'critical',
        details: {
          connected: isConnected,
          url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
        }
      };

      // 3. Speech Recognition
      const speechRecognitionSupported = 'webkitSpeechRecognition' in window;
      health.components.speechRecognition = {
        status: speechRecognitionSupported ? 'healthy' : 'critical',
        details: {
          supported: speechRecognitionSupported,
          available: speechRecognitionSupported
        }
      };

      // 4. Speech Synthesis
      const speechSynthesisSupported = 'speechSynthesis' in window;
      const voices = speechSynthesisSupported ? speechSynthesis.getVoices() : [];
      const spanishVoices = voices.filter(v => v.lang.includes('es'));
      
      health.components.speechSynthesis = {
        status: speechSynthesisSupported && voices.length > 0 ? 'healthy' : 
               speechSynthesisSupported ? 'warning' : 'critical',
        details: {
          supported: speechSynthesisSupported,
          voicesCount: voices.length,
          spanishVoices: spanishVoices.length,
          voicesLoaded: voices.length > 0
        }
      };

      // 5. Micrófono
      let microphoneStatus = 'unknown';
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStatus = 'healthy';
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        microphoneStatus = error.name === 'NotAllowedError' ? 'warning' : 'critical';
      }

      health.components.microphone = {
        status: microphoneStatus,
        details: {
          supported: 'mediaDevices' in navigator,
          permission: microphoneStatus === 'healthy' ? 'granted' : 'denied'
        }
      };

      // 6. Mensajes
      const lastMessage = messages[messages.length - 1];
      const hasRecentActivity = lastMessage && (Date.now() - (lastMessage.timestamp || 0)) < 60000;
      
      health.components.messaging = {
        status: messages.length > 0 ? 'healthy' : 'warning',
        details: {
          messageCount: messages.length,
          lastMessageAge: lastMessage ? Date.now() - (lastMessage.timestamp || 0) : null,
          hasRecentActivity
        }
      };

      // Determinar estado general
      const componentStatuses = Object.values(health.components).map(c => c.status);
      if (componentStatuses.includes('critical')) {
        health.overall = 'critical';
      } else if (componentStatuses.includes('warning')) {
        health.overall = 'warning';
      }

      setSystemHealth(health);
      
      // Log cambios de estado
      const prevHealth = systemHealth.overall;
      if (prevHealth && prevHealth !== health.overall) {
        addLog('warn', 'SystemMonitor', `System health changed: ${prevHealth} → ${health.overall}`);
      }

    } catch (error) {
      addLog('error', 'SystemMonitor', 'Error checking system health', error);
      health.overall = 'critical';
      setSystemHealth(health);
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 300000;
    
    const recentMessages = messages.filter(m => (m.timestamp || 0) > oneMinuteAgo);
    const recentErrors = logs.filter(l => l.level === 'error' && l.timestamp > fiveMinutesAgo);
    
    setStats({
      totalMessages: messages.length,
      recentMessages: recentMessages.length,
      recentErrors: recentErrors.length,
      uptime: now - (logs[0]?.timestamp || now),
      lastActivity: messages.length > 0 ? now - (messages[messages.length - 1].timestamp || 0) : null
    });
  };

  // Test de conectividad
  const testConnectivity = () => {
    addLog('info', 'SystemMonitor', 'Testing connectivity...');
    
    if (isConnected) {
      send({
        type: 'test_message',
        text: 'Test de conectividad desde monitor del sistema',
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
      addLog('info', 'SystemMonitor', 'Test message sent');
    } else {
      addLog('error', 'SystemMonitor', 'Cannot test: WebSocket not connected');
    }
  };

  // Test de voz
  const testVoice = () => {
    addLog('info', 'SystemMonitor', 'Testing voice synthesis...');
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Test del sistema de voz. Todo funciona correctamente.');
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      
      const voices = speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.includes('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        addLog('info', 'SystemMonitor', `Using voice: ${spanishVoice.name}`);
      }
      
      utterance.onstart = () => addLog('info', 'SystemMonitor', 'Voice test started');
      utterance.onend = () => addLog('info', 'SystemMonitor', 'Voice test completed');
      utterance.onerror = (error) => addLog('error', 'SystemMonitor', 'Voice test failed', error);
      
      speechSynthesis.speak(utterance);
    } else {
      addLog('error', 'SystemMonitor', 'Speech synthesis not supported');
    }
  };

  // Inicialización
  useEffect(() => {
    addLog('info', 'SystemMonitor', 'System monitor initialized');
    
    // Check inicial
    checkSystemHealth();
    calculateStats();
    
    // Interval para checks periódicos
    intervalRef.current = setInterval(() => {
      checkSystemHealth();
      calculateStats();
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg border border-white/20 hover:bg-black/90 transition-colors"
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center gap-2">
          <Activity size={14} />
          Monitor
          <div className={`w-2 h-2 rounded-full ${
            systemHealth.overall === 'healthy' ? 'bg-green-400' :
            systemHealth.overall === 'warning' ? 'bg-yellow-400' :
            systemHealth.overall === 'critical' ? 'bg-red-400' :
            'bg-gray-400'
          }`} />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed top-4 right-4 z-50 bg-black/95 backdrop-blur-sm text-white rounded-lg border border-white/20 w-96 max-h-[80vh] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity size={16} />
          <span className="font-bold">System Monitor</span>
          <div className={`w-2 h-2 rounded-full ${
            systemHealth.overall === 'healthy' ? 'bg-green-400' :
            systemHealth.overall === 'warning' ? 'bg-yellow-400' :
            systemHealth.overall === 'critical' ? 'bg-red-400' :
            'bg-gray-400'
          }`} />
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* System Health */}
        <div className="p-4 border-b border-white/10">
          <h3 className="font-medium mb-3 text-blue-400">System Health</h3>
          <div className="space-y-2">
            {Object.entries(systemHealth.components || {}).map(([name, component]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(component.status)}
                  <span className="capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                <span className={`text-xs ${getStatusColor(component.status)}`}>
                  {component.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-white/10">
          <h3 className="font-medium mb-3 text-purple-400">Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Messages: {stats.totalMessages}</div>
            <div>Recent: {stats.recentMessages}</div>
            <div>Errors: {stats.recentErrors}</div>
            <div>Uptime: {Math.floor((stats.uptime || 0) / 1000)}s</div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-white/10">
          <h3 className="font-medium mb-3 text-green-400">Actions</h3>
          <div className="flex gap-2">
            <button
              onClick={testConnectivity}
              className="flex-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
            >
              Test WS
            </button>
            <button
              onClick={testVoice}
              className="flex-1 bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs transition-colors"
            >
              Test Voice
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="p-4">
          <h3 className="font-medium mb-3 text-orange-400">Live Logs</h3>
          <div 
            ref={logRef}
            className="bg-black/50 rounded p-2 text-xs font-mono max-h-40 overflow-y-auto space-y-1"
          >
            {logs.slice(-20).map(log => (
              <div key={log.id} className="flex gap-2">
                <span className="text-gray-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`shrink-0 ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-yellow-400' :
                  log.level === 'info' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-gray-300 shrink-0">[{log.component}]</span>
                <span className="text-white">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
