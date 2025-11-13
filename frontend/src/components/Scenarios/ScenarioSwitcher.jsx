import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useScenarioStore, SCENARIO_TONES } from '../../store/scenarioStore';

const toneOptions = Object.keys(SCENARIO_TONES);

export function ScenarioSwitcher({ compact = false }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    tone: 'neutral'
  });
  const hasFetched = useRef(false);

  const {
    scenarios,
    activeScenario,
    loadScenarios,
    createScenario,
    activateScenario,
    isLoading
  } = useScenarioStore((state) => ({
    scenarios: state.scenarios,
    activeScenario: state.activeScenario,
    loadScenarios: state.loadScenarios,
    createScenario: state.createScenario,
    activateScenario: state.activateScenario,
    isLoading: state.isLoading
  }));

  useEffect(() => {
    if (!hasFetched.current) {
      loadScenarios();
      hasFetched.current = true;
    }
  }, [loadScenarios]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Asigna un nombre al escenario');
      return;
    }

    try {
      await createScenario({
        name: form.name.trim(),
        description: form.description.trim(),
        tone: form.tone
      });
      toast.success('Escenario guardado');
      setForm({ name: '', description: '', tone: 'neutral' });
    } catch (error) {
      toast.error(error.message || 'No se pudo crear el escenario');
    }
  };

  const handleActivate = async (scenarioId) => {
    try {
      await activateScenario(scenarioId);
      toast.success('Escenario activado');
      setIsPanelOpen(false);
    } catch (error) {
      toast.error(error.message || 'No se pudo activar');
    }
  };

  const triggerLabel = activeScenario ? activeScenario.name : 'Modo natural';
  const tone = activeScenario?.tone || 'neutral';
  const badgeStyles = SCENARIO_TONES[tone] || SCENARIO_TONES.neutral;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsPanelOpen(true)}
        className={`flex items-center gap-2 rounded-2xl border transition-colors ${
          compact
            ? 'px-3 py-1 text-xs'
            : 'px-4 py-2 text-sm font-medium'
        } ${badgeStyles.badge}`}
      >
        <Sparkles size={compact ? 14 : 16} className="text-white/80" />
        <span className="text-white truncate max-w-[140px]">{triggerLabel}</span>
      </motion.button>

      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md px-4 py-10 overflow-y-auto"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsPanelOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="max-w-5xl mx-auto bg-slate-900/80 border border-white/10 rounded-3xl shadow-2xl p-6 lg:p-8"
            >
              <div className="flex justify-between items-start gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Sparkles size={24} className="text-blue-300" />
                    Escenarios personalizados
                  </h2>
                  <p className="text-white/60 text-sm mt-1">
                    Configura contextos como “Modo trabajo” o “Modo viaje” y cambia la
                    ambientación completa de GBot con un toque.
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {scenarios.length === 0 && (
                    <div className="p-6 border border-dashed border-white/20 rounded-2xl text-white/60 text-sm">
                      Aún no hay escenarios guardados. Crea el primero y activa el ambiente ideal
                      para cada momento.
                    </div>
                  )}

                  {scenarios.map((scenario) => (
                    <motion.button
                      key={scenario.id}
                      whileHover={{ scale: 1.01 }}
                      className={`w-full text-left rounded-2xl border px-4 py-4 transition-colors ${
                        scenario.is_active
                          ? 'border-blue-400/60 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleActivate(scenario.id)}
                      disabled={isLoading}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold">{scenario.name}</p>
                          {scenario.description && (
                            <p className="text-white/60 text-sm mt-1">{scenario.description}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                            <span className="uppercase tracking-wide">{scenario.tone}</span>
                            {scenario.is_active && (
                              <span className="flex items-center gap-1 text-emerald-300 font-medium">
                                <CheckCircle2 size={14} /> Activo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="bg-white/5 rounded-3xl border border-white/10 p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus size={18} />
                    Nuevo escenario
                  </h3>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="text-xs uppercase text-white/40 tracking-wide">Nombre</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                        placeholder="Modo trabajo nocturno"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase text-white/40 tracking-wide">Descripción</label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400/40 resize-none"
                        rows={3}
                        placeholder="Silencia notificaciones y activa widgets de foco"
                      />
                    </div>

                    <div>
                      <label className="text-xs uppercase text-white/40 tracking-wide">
                        Tono & ambiente
                      </label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {toneOptions.map((toneKey) => (
                          <button
                            type="button"
                            key={toneKey}
                            className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                              form.tone === toneKey
                                ? 'border-blue-400 bg-blue-500/10'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                            onClick={() => setForm((prev) => ({ ...prev, tone: toneKey }))}
                          >
                            {toneKey}
                          </button>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      type="submit"
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 font-semibold disabled:opacity-60"
                    >
                      {isLoading ? 'Guardando...' : 'Guardar escenario'}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
