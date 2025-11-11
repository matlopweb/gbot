import { useRef, useEffect, useState } from 'react';
import { useBotStore } from '../../store/botStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ChatInterface() {
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

    send({
      type: 'text_message',
      text: input
    });

    useBotStore.getState().addMessage({
      role: 'user',
      content: input
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
    <div className="card h-[600px] flex flex-col">
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
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="input flex-1"
            disabled={state === 'thinking' || state === 'working'}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || state === 'thinking' || state === 'working'}
            className="btn-primary px-4"
          >
            <Send size={20} />
          </button>
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
        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
            : isSystem
            ? 'glass border border-yellow-500/30'
            : 'glass'
        }`}
      >
        {!isUser && !isSystem && (
          <div className="text-xs text-gray-400 mb-1">GBot</div>
        )}
        {isSystem && (
          <div className="text-xs text-yellow-400 mb-1">Sistema</div>
        )}
        
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.timestamp && (
          <div className="text-xs text-gray-400 mt-1">
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
