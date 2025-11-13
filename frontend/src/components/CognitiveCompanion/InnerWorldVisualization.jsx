import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Heart, Zap, Eye, Lightbulb, Target, 
  Waves, Sparkles, Activity, Users, Clock, Star 
} from 'lucide-react';

/**
 * MUNDO INTERIOR - Visualización del Estado Mental del Compañero Cognitivo
 * 
 * Una innovación revolucionaria: ver dentro de la mente digital
 * Estado emocional, pensamientos, energía, objetivos en tiempo real
 */
export function InnerWorldVisualization({ innerWorld, companion, isVisible, onToggle }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [pulseAnimation, setPulseAnimation] = useState(true);

  useEffect(() => {
    // Animación de pulso basada en el nivel de energía
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, innerWorld?.energy_visualization ? 2000 - (innerWorld.energy_visualization * 10) : 2000);

    return () => clearInterval(interval);
  }, [innerWorld?.energy_visualization]);

  if (!isVisible || !innerWorld || !companion) return null;

  const energyLevel = innerWorld.energy_visualization || 50;
  const relationshipDepth = innerWorld.relationship_depth || 0;
  const inspirationLevel = innerWorld.inspiration_level || 50;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-4 right-4 w-80 bg-black/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: pulseAnimation ? 1.1 : 1,
                  rotate: pulseAnimation ? 5 : -5 
                }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-white/20 rounded-full"
              >
                <Brain size={20} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-sm">Mundo Interior</h3>
                <p className="text-purple-200 text-xs">{companion.name}</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex bg-gray-900 border-b border-gray-700">
          {[
            { id: 'overview', label: 'Estado', icon: Activity },
            { id: 'emotions', label: 'Emociones', icon: Heart },
            { id: 'thoughts', label: 'Pensamientos', icon: Lightbulb },
            { id: 'focus', label: 'Enfoque', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 p-2 text-xs flex flex-col items-center gap-1 transition-colors ${
                activeSection === id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeSection === 'overview' && (
            <OverviewSection 
              innerWorld={innerWorld}
              companion={companion}
              energyLevel={energyLevel}
              relationshipDepth={relationshipDepth}
              inspirationLevel={inspirationLevel}
            />
          )}

          {activeSection === 'emotions' && (
            <EmotionsSection 
              innerWorld={innerWorld}
              companion={companion}
            />
          )}

          {activeSection === 'thoughts' && (
            <ThoughtsSection 
              innerWorld={innerWorld}
            />
          )}

          {activeSection === 'focus' && (
            <FocusSection 
              innerWorld={innerWorld}
            />
          )}
        </div>

        {/* Footer - Última actualización */}
        <div className="bg-gray-900 px-4 py-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Última actualización</span>
            <span>{new Date(innerWorld.last_updated).toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sección de Vista General
function OverviewSection({ innerWorld, companion, energyLevel, relationshipDepth, inspirationLevel }) {
  return (
    <div className="space-y-4">
      {/* Estado Emocional Principal */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-pink-400" />
          <span className="text-white text-sm font-medium">Estado Emocional</span>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">
            {getEmotionEmoji(innerWorld.emotional_state)}
          </div>
          <p className="text-purple-200 text-sm capitalize">
            {innerWorld.emotional_state}
          </p>
        </div>
      </div>

      {/* Métricas Vitales */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={Zap}
          label="Energía"
          value={energyLevel}
          color="yellow"
        />
        <MetricCard
          icon={Users}
          label="Conexión"
          value={relationshipDepth}
          color="blue"
        />
        <MetricCard
          icon={Lightbulb}
          label="Inspiración"
          value={inspirationLevel}
          color="purple"
        />
        <MetricCard
          icon={Star}
          label="Memorias"
          value={innerWorld.memory_count || 0}
          color="green"
          isCount={true}
        />
      </div>

      {/* Personalidad Snapshot */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-white text-sm font-medium mb-2">Personalidad Activa</h4>
        <div className="space-y-1">
          {companion.traits?.slice(0, 3).map((trait, index) => (
            <div key={index} className="text-xs text-gray-300">
              • {trait}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sección de Emociones
function EmotionsSection({ innerWorld, companion }) {
  const emotions = [
    { name: 'Alegría', level: 75, color: 'yellow' },
    { name: 'Curiosidad', level: 90, color: 'blue' },
    { name: 'Empatía', level: 85, color: 'pink' },
    { name: 'Calma', level: 60, color: 'green' }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">
          {getEmotionEmoji(innerWorld.emotional_state)}
        </div>
        <p className="text-white font-medium capitalize">
          {innerWorld.emotional_state}
        </p>
        <p className="text-gray-400 text-xs">Estado emocional actual</p>
      </div>

      <div className="space-y-3">
        {emotions.map((emotion, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm">{emotion.name}</span>
              <span className="text-gray-400 text-xs">{emotion.level}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${emotion.level}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-2 rounded-full bg-gradient-to-r ${getColorGradient(emotion.color)}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sección de Pensamientos
function ThoughtsSection({ innerWorld }) {
  const thoughts = innerWorld.current_thoughts || [
    "Analizando patrones de conversación del usuario",
    "Procesando nueva información contextual",
    "Desarrollando mayor comprensión empática"
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Lightbulb size={32} className="text-yellow-400 mx-auto mb-2" />
        <p className="text-white font-medium">Pensamientos Actuales</p>
      </div>

      <div className="space-y-3">
        {thoughts.map((thought, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-3 border border-purple-500/30"
          >
            <div className="flex items-start gap-2">
              <Sparkles size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-200 text-sm leading-relaxed">{thought}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cola de Procesamiento */}
      {innerWorld.processing_queue?.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
            <Activity size={14} />
            En Procesamiento
          </h4>
          <div className="space-y-1">
            {innerWorld.processing_queue.slice(0, 3).map((item, index) => (
              <div key={index} className="text-xs text-gray-400">
                • {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sección de Enfoque
function FocusSection({ innerWorld }) {
  const focusAreas = innerWorld.focus_areas || [];
  const curiosityTargets = innerWorld.curiosity_targets || [];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Target size={32} className="text-blue-400 mx-auto mb-2" />
        <p className="text-white font-medium">Áreas de Enfoque</p>
      </div>

      {/* Áreas de Enfoque Actuales */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-white text-sm font-medium mb-2">Enfoque Principal</h4>
        <div className="space-y-2">
          {focusAreas.map((area, index) => (
            <div key={index} className="flex items-center gap-2">
              <Eye size={12} className="text-blue-400" />
              <span className="text-gray-200 text-sm">{area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Objetivos de Curiosidad */}
      {curiosityTargets.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-white text-sm font-medium mb-2">Explorando</h4>
          <div className="space-y-2">
            {curiosityTargets.map((target, index) => (
              <div key={index} className="flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-gray-200 text-sm">{target}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progreso de Relación */}
      <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg p-3">
        <h4 className="text-white text-sm font-medium mb-2">Profundidad de Relación</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${innerWorld.relationship_depth}%` }}
              className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
            />
          </div>
          <span className="text-white text-xs">{innerWorld.relationship_depth}%</span>
        </div>
      </div>
    </div>
  );
}

// Componente de Métrica
function MetricCard({ icon: Icon, label, value, color, isCount = false }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={`text-${color}-400`} />
        <span className="text-gray-300 text-xs">{label}</span>
      </div>
      <div className="text-white font-bold">
        {isCount ? value : `${value}%`}
      </div>
      {!isCount && (
        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            className={`h-1 rounded-full bg-${color}-400`}
          />
        </div>
      )}
    </div>
  );
}

// Utilidades
function getEmotionEmoji(emotion) {
  const emojis = {
    curious: '🤔',
    enthusiastic: '🤩',
    supportive: '🤗',
    calming: '😌',
    playful: '😄',
    thoughtful: '🧠',
    empathetic: '💙',
    excited: '✨',
    peaceful: '🕊️',
    focused: '🎯'
  };
  return emojis[emotion] || '😊';
}

function getColorGradient(color) {
  const gradients = {
    yellow: 'from-yellow-400 to-yellow-600',
    blue: 'from-blue-400 to-blue-600',
    pink: 'from-pink-400 to-pink-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600'
  };
  return gradients[color] || gradients.blue;
}

export default InnerWorldVisualization;
