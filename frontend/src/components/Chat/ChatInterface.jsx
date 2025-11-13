import { useRef, useEffect, useState } from 'react';
import { useBotStore } from '../../store/botStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ChatInterface({ className = '' }) {
  const { messages, currentTranscript, state } = useBotStore();
  const { send } = useWebSocket();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTranscript]);

  const handleSend = () => {
    if (!input.trim()) return;

    const messageId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

    send({
      type: 'text_message',
      text: input,
      id: messageId
    });

    useBotStore.getState().addMessage({
      role: 'user',
      content: input,
      id: messageId
    });

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Current transcript (while bot is speaking) */}
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 size={14} className="animate-spin text-blue-400" />
                <span className="text-xs text-gray-400">GBot está escribiendo...</span>
              </div>
              <p className="text-sm">{currentTranscript}</p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent resize-none min-h-[44px] max-h-32"
              disabled={state === 'thinking' || state === 'working'}
              rows={1}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.3) transparent'
              }}
            />
            {(state === 'thinking' || state === 'working') && (
              <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Loader2 size={16} className="animate-spin text-white/60" />
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || state === 'thinking' || state === 'working'}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Send size={20} />
          </motion.button>
        </div>
        <div className="mt-2 text-xs text-white/40 text-center">
          Presiona Enter para enviar • Shift+Enter para nueva línea
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-2xl px-5 py-4 max-w-[85%] shadow-lg ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            : isSystem
            ? 'bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 text-yellow-200'
            : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
        }`}
      >
        {!isUser && !isSystem && (
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-2 font-medium">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            GBot
          </div>
        )}
        {isSystem && (
          <div className="flex items-center gap-2 text-xs text-yellow-300 mb-2 font-medium">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Sistema
          </div>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        
        {message.timestamp && (
          <div className="text-xs opacity-70 mt-2 text-right">
            {format(new Date(message.timestamp), 'HH:mm')}
          </div>
        )}

        {message.metadata && (
          <div className="mt-2 text-xs glass rounded p-2">
            <pre className="text-gray-400">
              {JSON.stringify(message.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}
