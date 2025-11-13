import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Link2, FileText, Mic, X, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { fetchSavedItems, createSavedItem, deleteSavedItem } from '../../services/savedItemsApi';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'link', label: 'Enlaces', icon: Link2 },
  { key: 'note', label: 'Notas', icon: FileText },
  { key: 'audio', label: 'Notas de voz', icon: Mic }
];

export function SavedItemsDrawer({ isOpen, onClose }) {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('link');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async (tab = activeTab) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchSavedItems(token, tab);
      setItems(data);
    } catch (error) {
      toast.error('No se pudieron cargar tus elementos guardados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadItems();
    }
  }, [isOpen, token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadItems(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await createSavedItem(token, {
        type: activeTab,
        title: form.title,
        url: activeTab === 'link' ? form.url : undefined,
        content: activeTab !== 'link' ? form.content : undefined
      });
      toast.success('Guardado correctamente');
      setForm({ title: '', url: '', content: '' });
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      await deleteSavedItem(token, id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bookmark size={20} className="text-blue-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Colección</p>
                  <h2 className="text-lg font-semibold">Elementos guardados</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                    activeTab === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 p-4 overflow-y-auto">
              <div className="md:w-1/2 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Plus size={16} /> Guardar nuevo
                </h3>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Título"
                    className="input w-full"
                  />
                  {activeTab === 'link' ? (
                    <input
                      type="url"
                      value={form.url}
                      onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                      placeholder="URL"
                      className="input w-full"
                      required
                    />
                  ) : (
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder={activeTab === 'audio' ? 'Descripción o enlace al audio' : 'Escribe tu nota'}
                      className="input w-full min-h-[120px]"
                      required
                    />
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full"
                  >
                    {submitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </form>
              </div>

              <div className="md:flex-1 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                    Tus {tabs.find(t => t.key === activeTab)?.label.toLowerCase()}
                  </h3>
                  {loading && <span className="text-xs text-gray-400">Cargando...</span>}
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {items.length === 0 && !loading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aún no tienes elementos guardados aquí.
                    </p>
                  )}
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="glass flex items-start justify-between p-3 rounded-xl"
                    >
                      <div className="pr-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.title || (activeTab === 'link' ? item.url : 'Sin título')}
                        </p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 break-all"
                          >
                            {item.url}
                          </a>
                        )}
                        {item.content && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                            {item.content}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2">
                          {new Date(item.created_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
