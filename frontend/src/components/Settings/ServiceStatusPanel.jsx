import { motion } from 'framer-motion';
import { X, Wifi, Music, Book, Layout } from 'lucide-react';
import { useBotStore } from '../../store/botStore';

const services = [
  { key: 'google', label: 'Google Workspace', icon: Wifi },
  { key: 'spotify', label: 'Spotify', icon: Music },
  { key: 'notion', label: 'Notion', icon: Book },
  { key: 'trello', label: 'Trello', icon: Layout },
  { key: 'asana', label: 'Asana', icon: Layout }
];

export function ServiceStatusPanel({ onClose }) {
  const { connectedServices } = useBotStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 text-gray-900 dark:text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Configuración
          </p>
          <h2 className="text-2xl font-semibold">Servicios conectados</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Cerrar panel de servicios"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Desde aquí podrás revisar el estado de cada integración. Algunas aún
        están en preparación y se habilitarán en futuras versiones.
      </p>

      <div className="space-y-3">
        {services.map(({ key, label, icon: Icon }) => {
          const connected = connectedServices[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    connected
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {connected ? 'Sincronizado' : 'Disponible pronto'}
                  </p>
                </div>
              </div>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  connected
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {connected ? 'Conectado' : 'Pendiente'}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
