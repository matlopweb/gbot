import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Bookmark, History, MessageCircle } from 'lucide-react';

export function FloatingActionButton({ onHistoryClick, onSavedItemsClick, onChatClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      icon: History,
      label: 'Historial',
      onClick: () => {
        onHistoryClick?.();
        setIsExpanded(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Bookmark,
      label: 'Guardados',
      onClick: () => {
        onSavedItemsClick?.();
        setIsExpanded(false);
      },
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: MessageCircle,
      label: 'Chat rápido',
      onClick: () => {
        onChatClick?.();
        setIsExpanded(false);
      },
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {/* Botones de acción */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-3 mb-4"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20,
                  transition: { delay: (actions.length - index - 1) * 0.05 }
                }}
                className="flex items-center gap-3"
              >
                <span className="bg-black/80 text-white text-sm px-3 py-1 rounded-lg backdrop-blur-sm">
                  {action.label}
                </span>
                <button
                  onClick={action.onClick}
                  className={`${action.color} p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-white`}
                  title={action.label}
                >
                  <action.icon size={20} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón principal */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        {isExpanded ? <X size={24} /> : <Plus size={24} />}
      </motion.button>

      {/* Overlay para cerrar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
