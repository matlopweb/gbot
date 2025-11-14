import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bookmark, Clock, Star, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchMemories, createMemory } from '../../services/memoriesApi';
import toast from 'react-hot-toast';

const ACTION_PRESETS = {
  resume: {
    label: 'Retomar',
    type: 'action_resume',
    tags: ['retomar', 'follow_up'],
    message: (content) => `Retomando: ${content}`
  },
  reminder: {
    label: 'Recordatorio',
    type: 'reminder',
    tags: ['recordatorio'],
    message: (content) => `Recordatorio creado a partir de: ${content}`
  },
  celebrate: {
    label: 'Celebrar',
    type: 'celebration',
    tags: ['celebracion'],
    message: (content) => `Celebrando logro: ${content}`
  }
};

export function KeyMomentsDrawer({ isOpen, onClose }) {
  const { token, user } = useAuthStore();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = user?.id;

  const momentGroups = useMemo(() => {
    const groups = {
      logros: memories.filter((m) => m.type === 'celebration'),
      habitos: memories.filter((m) => m.tags?.includes('habit')),
      reflexiones: memories.filter((m) => !m.type || m.type === 'moment')
    };
    return groups;
  }, [memories]);

  const loadMemories = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const data = await fetchMemories(token, userId, 25);
      setMemories(data);
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los momentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  const handleAction = async (memory, actionKey) => {
    if (!token || !userId) return;
    const preset = ACTION_PRESETS[actionKey];
    if (!preset) return;
    setSaving(true);
    try {
      await createMemory(token, userId, {
        content: preset.message(memory.content),
        type: preset.type,
        tags: preset.tags,
        importance_score: Math.min(100, (memory.importance_score || 60) + 10),
        emotional_context: memory.emotional_context || { mood: 'balanced' }
      });
      toast.success(`${preset.label} enviado a GBot`);
      await loadMemories();
    } catch (error) {
      toast.error(error.message || 'No se pudo registrar la acción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="max-w-3xl w-full bg-gray-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <p className="text-sm text-purple-300 flex items-center gap-2">
                  <Sparkles size={16} />
                  Memoria Viva
                </p>
                <h2 className="text-2xl font-semibold text-white">Momentos clave</h2>
                <p className="text-sm text-white/60">Recuerdos que GBot está usando para conocerte mejor</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors px-3 py-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {loading ? (
                <div className="text-center py-12 text-white/60">
                  Cargando recuerdos...
                </div>
              ) : memories.length === 0 ? (
                <div className="text-center py-12 text-white/60">
                  Aún no tenemos momentos. Habla con GBot y comparte logros o planes para comenzar.
                </div>
              ) : (
                <>
                  <MemorySection
                    title="Reflexiones importantes"
                    icon={Bookmark}
                    memories={momentGroups.reflexiones}
                    onAction={handleAction}
                    saving={saving}
                  />
                  <MemorySection
                    title="Hábitos y proyectos"
                    icon={Clock}
                    memories={momentGroups.habitos}
                    onAction={handleAction}
                    saving={saving}
                  />
                  <MemorySection
                    title="Logros recientes"
                    icon={Star}
                    memories={momentGroups.logros}
                    onAction={handleAction}
                    saving={saving}
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MemorySection({ title, icon: Icon, memories, onAction, saving }) {
  if (!memories || memories.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-purple-300" />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {memories.map((memory) => (
          <div key={memory.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <p className="text-white text-sm leading-relaxed">{memory.content}</p>
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <span key={tag} className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{new Date(memory.timestamp).toLocaleString()}</span>
              <span>Importancia {memory.importance_score}</span>
            </div>
            <div className="flex gap-2">
              {Object.entries(ACTION_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  disabled={saving}
                  onClick={() => onAction(memory, key)}
                  className="flex-1 flex items-center gap-1 text-xs text-white/80 bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 rounded-full"
                >
                  {preset.label}
                  <ArrowRight size={12} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
