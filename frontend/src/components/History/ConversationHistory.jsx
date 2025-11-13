import { useState } from 'react';
import { useBotStore } from '../../store/botStore';
import { motion, AnimatePresence } from 'framer-motion';

export function ConversationHistory() {
  const { messages, clearMessages } = useBotStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar mensajes por búsqueda
  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar mensajes por fecha
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const handleClearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
      clearMessages();
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón para abrir historial */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 z-40 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        title="Ver historial"
      >
        <svg 
          className="w-6 h-6 text-gray-700 dark:text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </button>

      {/* Panel de historial */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full md:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Historial
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-600 dark:text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                </div>

                {/* Buscador */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar en historial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                  <svg 
                    className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>

                {/* Estadísticas */}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{filteredMessages.length} mensajes</span>
                  <button
                    onClick={handleClearHistory}
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Borrar todo
                  </button>
                </div>
              </div>

              {/* Lista de mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No se encontraron mensajes' : 'No hay historial aún'}
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Fecha */}
                      <div className="sticky top-0 bg-white dark:bg-gray-900 py-2 mb-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {date}
                        </p>
                      </div>

                      {/* Mensajes del día */}
                      <div className="space-y-3">
                        {msgs.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                                : message.role === 'assistant'
                                ? 'bg-gray-50 dark:bg-gray-800 mr-4'
                                : 'bg-yellow-50 dark:bg-yellow-900/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-lg">
                                {message.role === 'user' ? '👤' : 
                                 message.role === 'assistant' ? '🤖' : 'ℹ️'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white break-words">
                                  {message.content}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
