import { useState, useEffect } from 'react';
import { useBotStore } from '../../store/botStore';
import { motion } from 'framer-motion';

export function InfoWidgets() {
  const { connectedServices, messages } = useBotStore();
  const [weather, setWeather] = useState(null);
  const [stats, setStats] = useState({
    emails: 0,
    tasks: 0,
    events: 0
  });

  // Simular obtención de datos (en producción vendría del backend)
  useEffect(() => {
    // Clima simulado
    setWeather({
      temp: 22,
      condition: 'Soleado',
      icon: '☀️'
    });

    // Estadísticas simuladas
    setStats({
      emails: 3,
      tasks: 5,
      events: 2
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Widget de Clima */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Buenos Aires</p>
            <p className="text-3xl font-bold">{weather?.temp}°C</p>
            <p className="text-sm opacity-90">{weather?.condition}</p>
          </div>
          <div className="text-5xl">{weather?.icon}</div>
        </div>
      </motion.div>

      {/* Widget de Emails */}
      {connectedServices.google && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Emails</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.emails}
              </p>
              <p className="text-xs text-gray-500">No leídos</p>
            </div>
            <div className="text-3xl">📧</div>
          </div>
        </motion.div>
      )}

      {/* Widget de Tareas */}
      {connectedServices.google && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tareas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.tasks}
              </p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </motion.div>
      )}

      {/* Widget de Eventos */}
      {connectedServices.google && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.events}
              </p>
              <p className="text-xs text-gray-500">Hoy</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </motion.div>
      )}

      {/* Widget de Música */}
      {connectedServices.spotify && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm opacity-90">Reproduciendo</p>
              <p className="text-sm font-semibold truncate">Música de concentración</p>
              <p className="text-xs opacity-75">Lo-Fi Beats</p>
            </div>
            <div className="text-2xl">🎵</div>
          </div>
        </motion.div>
      )}

      {/* Widget de Servicios Conectados */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Servicios
        </p>
        <div className="space-y-2">
          <ServiceStatus 
            name="Google" 
            connected={connectedServices.google}
            icon="🔵"
          />
          <ServiceStatus 
            name="Spotify" 
            connected={connectedServices.spotify}
            icon="🟢"
          />
          <ServiceStatus 
            name="Notion" 
            connected={connectedServices.notion}
            icon="⚫"
          />
          <ServiceStatus 
            name="Trello" 
            connected={connectedServices.trello}
            icon="🔷"
          />
          <ServiceStatus 
            name="Asana" 
            connected={connectedServices.asana}
            icon="🔴"
          />
        </div>
      </motion.div>

      {/* Widget de Estadísticas de Conversación */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Conversación
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Mensajes</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {messages.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Hoy</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {messages.filter(m => {
                const today = new Date().toDateString();
                return new Date(m.timestamp).toDateString() === today;
              }).length}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ServiceStatus({ name, connected, icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500">
          {connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
    </div>
  );
}
