import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { useAuthStore } from '../../store/authStore';
import { useWebSocket } from '../../hooks/useWebSocket';

export function SystemStatus() {
  const [showDebug, setShowDebug] = useState(false);
  const [systemInfo, setSystemInfo] = useState({});
  
  const { isConnected, messages } = useBotStore();
  const { token, user } = useAuthStore();
  const { send } = useWebSocket();

  useEffect(() => {
    const checkSystem = () => {
      const info = {
        // Autenticación
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        hasUser: !!user,
        
        // WebSocket
        isConnected: isConnected,
        wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
        
        // Navegador
        hasSpeechRecognition: 'webkitSpeechRecognition' in window,
        hasSpeechSynthesis: 'speechSynthesis' in window,
        hasMediaDevices: 'mediaDevices' in navigator,
        
        // Mensajes
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1],
        
        // Tiempo
        timestamp: new Date().toISOString(),
        
        // Variables de entorno
        env: {
          VITE_WS_URL: import.meta.env.VITE_WS_URL,
          VITE_API_URL: import.meta.env.VITE_API_URL,
          MODE: import.meta.env.MODE,
          DEV: import.meta.env.DEV
        }
      };
      
      setSystemInfo(info);
    };

    checkSystem();
    const interval = setInterval(checkSystem, 2000);
    return () => clearInterval(interval);
  }, [token, user, isConnected, messages]);

  const testConnection = () => {
    console.log('🧪 Testing connection...');
    send({
      type: 'test_message',
      text: 'Test de conexión desde debug',
      id: crypto.randomUUID()
    });
  };

  const getStatusColor = (status) => {
    return status ? 'text-green-400' : 'text-red-400';
  };

  if (!showDebug) {
    return (
      <motion.button
        onClick={() => setShowDebug(true)}
        className="fixed top-4 left-4 z-50 bg-black/50 text-white text-xs px-2 py-1 rounded"
        whileHover={{ scale: 1.05 }}
      >
        Debug
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 left-4 z-50 bg-black/90 backdrop-blur-sm text-white text-xs p-4 rounded-lg border border-white/20 max-w-sm max-h-96 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">System Status</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {/* Autenticación */}
        <div>
          <div className="font-medium text-yellow-400 mb-1">Authentication</div>
          <div className={getStatusColor(systemInfo.hasToken)}>
            Token: {systemInfo.hasToken ? `✓ (${systemInfo.tokenLength} chars)` : '✗ Missing'}
          </div>
          <div className={getStatusColor(systemInfo.hasUser)}>
            User: {systemInfo.hasUser ? '✓ Logged in' : '✗ Not logged in'}
          </div>
        </div>

        {/* WebSocket */}
        <div>
          <div className="font-medium text-blue-400 mb-1">WebSocket</div>
          <div className={getStatusColor(systemInfo.isConnected)}>
            Status: {systemInfo.isConnected ? '✓ Connected' : '✗ Disconnected'}
          </div>
          <div className="text-gray-300">
            URL: {systemInfo.wsUrl}
          </div>
          <button
            onClick={testConnection}
            className="mt-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Test Connection
          </button>
        </div>

        {/* Navegador */}
        <div>
          <div className="font-medium text-green-400 mb-1">Browser Support</div>
          <div className={getStatusColor(systemInfo.hasSpeechRecognition)}>
            Speech Recognition: {systemInfo.hasSpeechRecognition ? '✓' : '✗'}
          </div>
          <div className={getStatusColor(systemInfo.hasSpeechSynthesis)}>
            Speech Synthesis: {systemInfo.hasSpeechSynthesis ? '✓' : '✗'}
          </div>
          <div className={getStatusColor(systemInfo.hasMediaDevices)}>
            Media Devices: {systemInfo.hasMediaDevices ? '✓' : '✗'}
          </div>
        </div>

        {/* Mensajes */}
        <div>
          <div className="font-medium text-purple-400 mb-1">Messages</div>
          <div className="text-gray-300">
            Count: {systemInfo.messageCount}
          </div>
          {systemInfo.lastMessage && (
            <div className="text-gray-400 text-xs mt-1">
              Last: {systemInfo.lastMessage.role} - {systemInfo.lastMessage.content?.substring(0, 30)}...
            </div>
          )}
        </div>

        {/* Variables de entorno */}
        <div>
          <div className="font-medium text-orange-400 mb-1">Environment</div>
          <div className="text-gray-300 text-xs space-y-1">
            <div>Mode: {systemInfo.env?.MODE}</div>
            <div>Dev: {systemInfo.env?.DEV ? 'Yes' : 'No'}</div>
            <div>WS URL: {systemInfo.env?.VITE_WS_URL || 'Default'}</div>
            <div>API URL: {systemInfo.env?.VITE_API_URL || 'Default'}</div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-gray-500 text-xs pt-2 border-t border-white/10">
          Updated: {new Date(systemInfo.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
