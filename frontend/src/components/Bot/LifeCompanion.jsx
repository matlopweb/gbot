import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarLifeStore } from '../../store/avatarLifeStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useBotStore } from '../../store/botStore';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Smartphone, 
  Heart, 
  Target, 
  TrendingUp,
  Coffee,
  Moon,
  Sun,
  Zap,
  Brain,
  Lightbulb
} from 'lucide-react';

export function LifeCompanion() {
  const { 
    vitalStats, 
    friendship,
    createMemory,
    learnAboutUser,
    recordHelp
  } = useAvatarLifeStore();
  
  const { send } = useWebSocket();
  const { addMessage } = useBotStore();
  const [currentContext, setCurrentContext] = useState(null);
  const [lifeInsights, setLifeInsights] = useState([]);
  const [proactiveActions, setProactiveActions] = useState([]);

  // Detectar contexto de vida real
  const detectLifeContext = () => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Detectar ubicación aproximada basada en hora (simulado)
    let location = 'unknown';
    if (hour >= 7 && hour <= 9) location = 'morning_routine';
    else if (hour >= 9 && hour <= 17 && !isWeekend) location = 'work';
    else if (hour >= 17 && hour <= 19) location = 'commute_home';
    else if (hour >= 19 && hour <= 22) location = 'home_evening';
    else if (hour >= 22 || hour <= 6) location = 'sleep_time';
    else if (isWeekend) location = 'weekend_leisure';

    // Detectar actividad probable
    let activity = 'unknown';
    if (hour >= 6 && hour <= 8) activity = 'waking_up';
    else if (hour >= 8 && hour <= 9) activity = 'breakfast_prep';
    else if (hour >= 9 && hour <= 12) activity = 'morning_work';
    else if (hour >= 12 && hour <= 13) activity = 'lunch_time';
    else if (hour >= 13 && hour <= 17) activity = 'afternoon_work';
    else if (hour >= 17 && hour <= 19) activity = 'evening_transition';
    else if (hour >= 19 && hour <= 21) activity = 'dinner_relaxation';
    else if (hour >= 21 && hour <= 23) activity = 'wind_down';
    else activity = 'sleep_rest';

    return { location, activity, hour, dayOfWeek, isWeekend };
  };

  // Generar insights de vida inteligentes
  const generateLifeInsights = (context) => {
    const insights = [];
    const { location, activity, hour, isWeekend } = context;

    // Insights por momento del día
    if (activity === 'waking_up') {
      insights.push({
        type: 'morning_optimization',
        title: 'Optimización Matutina',
        message: 'Detecté que te levantas a esta hora. ¿Te ayudo a crear una rutina matutina perfecta?',
        action: 'create_morning_routine',
        icon: Sun,
        priority: 'high',
        helpOffer: 'Puedo sugerir una secuencia de actividades que maximice tu energía y productividad'
      });
    }

    if (activity === 'morning_work' && !isWeekend) {
      insights.push({
        type: 'productivity_boost',
        title: 'Impulso de Productividad',
        message: 'Es tu momento más productivo del día. ¿Priorizamos las tareas más importantes?',
        action: 'prioritize_tasks',
        icon: Target,
        priority: 'high',
        helpOffer: 'Te ayudo a identificar las 3 tareas más impactantes para hoy'
      });
    }

    if (activity === 'lunch_time') {
      insights.push({
        type: 'midday_recharge',
        title: 'Recarga de Mediodía',
        message: 'Momento perfecto para recargar energías. ¿Cómo aprovechamos esta pausa?',
        action: 'optimize_lunch_break',
        icon: Coffee,
        priority: 'medium',
        helpOffer: 'Puedo sugerir actividades que te den energía para la tarde'
      });
    }

    if (activity === 'evening_transition') {
      insights.push({
        type: 'day_reflection',
        title: 'Reflexión del Día',
        message: 'Momento ideal para reflexionar sobre el día. ¿Celebramos los logros?',
        action: 'daily_reflection',
        icon: Heart,
        priority: 'medium',
        helpOffer: 'Te ayudo a procesar el día y prepararte emocionalmente para mañana'
      });
    }

    if (activity === 'wind_down') {
      insights.push({
        type: 'sleep_preparation',
        title: 'Preparación para Descansar',
        message: 'Tu mente necesita desconectar. ¿Creamos una rutina de relajación?',
        action: 'create_sleep_routine',
        icon: Moon,
        priority: 'high',
        helpOffer: 'Puedo guiarte en técnicas de relajación para un mejor descanso'
      });
    }

    // Insights por día de la semana
    if (context.dayOfWeek === 1) { // Lunes
      insights.push({
        type: 'week_planning',
        title: 'Planificación Semanal',
        message: '¡Nuevo lunes, nuevas oportunidades! ¿Planificamos una semana increíble?',
        action: 'plan_week',
        icon: Calendar,
        priority: 'high',
        helpOffer: 'Te ayudo a establecer metas y prioridades para esta semana'
      });
    }

    if (context.dayOfWeek === 5) { // Viernes
      insights.push({
        type: 'week_celebration',
        title: 'Celebración Semanal',
        message: '¡Llegaste al viernes! ¿Celebramos los logros de la semana?',
        action: 'celebrate_week',
        icon: TrendingUp,
        priority: 'medium',
        helpOffer: 'Revisemos todo lo que lograste y planifiquemos un fin de semana genial'
      });
    }

    return insights;
  };

  // Generar acciones proactivas contextuales
  const generateProactiveActions = (context) => {
    const actions = [];
    const { activity, hour, isWeekend } = context;

    // Acciones por contexto
    if (activity === 'morning_work') {
      actions.push({
        id: 'focus_session',
        title: 'Sesión de Enfoque',
        description: '¿Hacemos una sesión de trabajo profundo de 90 minutos?',
        benefit: 'Aprovecha tu pico de concentración matutina',
        action: () => startFocusSession(90),
        icon: Brain,
        urgency: 'high'
      });
    }

    if (activity === 'lunch_time') {
      actions.push({
        id: 'energy_boost',
        title: 'Impulso de Energía',
        description: '¿Te guío en una caminata energizante de 10 minutos?',
        benefit: 'Recargarás energía para la tarde',
        action: () => startEnergyBoost(),
        icon: Zap,
        urgency: 'medium'
      });
    }

    if (activity === 'evening_transition') {
      actions.push({
        id: 'gratitude_practice',
        title: 'Práctica de Gratitud',
        description: '¿Compartimos 3 cosas por las que estás agradecido hoy?',
        benefit: 'Mejora tu bienestar emocional y perspectiva',
        action: () => startGratitudePractice(),
        icon: Heart,
        urgency: 'low'
      });
    }

    if (hour >= 21 && hour <= 23) {
      actions.push({
        id: 'tomorrow_prep',
        title: 'Preparación para Mañana',
        description: '¿Preparamos todo para que mañana sea increíble?',
        benefit: 'Empezarás el día sin estrés y con claridad',
        action: () => prepareTomorrow(),
        icon: Lightbulb,
        urgency: 'medium'
      });
    }

    return actions;
  };

  // Funciones de acción
  const startFocusSession = (minutes) => {
    const message = `¡Perfecto! Iniciemos una sesión de enfoque de ${minutes} minutos. Te acompañaré en silencio y te avisaré cuando termine. ¿En qué vas a trabajar?`;
    sendProactiveMessage(message, 'focus_session');
    recordHelp('productivity', `Sesión de enfoque de ${minutes} minutos`, 5);
  };

  const startEnergyBoost = () => {
    const message = "¡Genial! Te guiaré en una caminata energizante. Sal al aire libre si puedes, respira profundo y camina con energía. Te haré compañía con consejos motivacionales.";
    sendProactiveMessage(message, 'energy_boost');
    recordHelp('wellness', 'Impulso de energía con caminata', 4);
  };

  const startGratitudePractice = () => {
    const message = "Perfecto. La gratitud transforma el día. Cuéntame: ¿Cuáles son 3 cosas, grandes o pequeñas, por las que te sientes agradecido hoy?";
    sendProactiveMessage(message, 'gratitude_practice');
    recordHelp('emotional', 'Práctica de gratitud', 5);
  };

  const prepareTomorrow = () => {
    const message = "¡Excelente idea! Preparar el mañana es un regalo para tu yo futuro. ¿Revisamos tu agenda, preparamos tu ropa, o planificamos las prioridades del día?";
    sendProactiveMessage(message, 'tomorrow_prep');
    recordHelp('organization', 'Preparación para mañana', 4);
  };

  // Enviar mensaje proactivo
  const sendProactiveMessage = (message, actionType) => {
    send({
      type: 'text_message',
      text: message,
      id: crypto.randomUUID(),
      metadata: {
        proactive_action: {
          type: actionType,
          context: currentContext,
          is_life_companion: true
        }
      }
    });

    addMessage({
      role: 'assistant',
      content: message,
      id: crypto.randomUUID(),
      metadata: { 
        proactive_action: true,
        life_companion: true
      }
    });

    createMemory(
      `Ofrecí ayuda proactiva: ${actionType} en contexto ${currentContext?.activity}`,
      'proactive_help',
      0.8
    );
  };

  // Actualizar contexto y generar insights
  useEffect(() => {
    const updateLifeContext = () => {
      const context = detectLifeContext();
      setCurrentContext(context);
      
      const insights = generateLifeInsights(context);
      setLifeInsights(insights);
      
      const actions = generateProactiveActions(context);
      setProactiveActions(actions);

      // Aprender sobre patrones del usuario
      learnAboutUser(`activity_${context.hour}`, context.activity);
      learnAboutUser(`location_${context.hour}`, context.location);
    };

    updateLifeContext();
    
    // Actualizar cada 30 minutos
    const contextInterval = setInterval(updateLifeContext, 30 * 60 * 1000);
    
    return () => clearInterval(contextInterval);
  }, []);

  return (
    <AnimatePresence>
      {lifeInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 right-4 z-30 max-w-xs"
        >
          <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-2xl rounded-2xl border border-indigo-400/30 p-4 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain size={14} className="text-white" />
              </motion.div>
              <div>
                <p className="text-white font-medium text-xs">Compañero de Vida</p>
                <p className="text-indigo-200 text-xs">{currentContext?.activity?.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {/* Insight principal */}
            {lifeInsights[0] && (
              <motion.div
                className="mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(lifeInsights[0].icon, { size: 12, className: "text-indigo-300" })}
                  <span className="text-white text-xs font-medium">{lifeInsights[0].title}</span>
                </div>
                <p className="text-indigo-100 text-xs leading-relaxed mb-2">
                  {lifeInsights[0].message}
                </p>
                <p className="text-indigo-200 text-xs italic">
                  {lifeInsights[0].helpOffer}
                </p>
              </motion.div>
            )}

            {/* Acciones proactivas */}
            {proactiveActions.length > 0 && (
              <div className="space-y-2">
                {proactiveActions.slice(0, 2).map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-left transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {React.createElement(action.icon, { size: 10, className: "text-indigo-300" })}
                      <span className="text-white text-xs font-medium">{action.title}</span>
                    </div>
                    <p className="text-indigo-100 text-xs">{action.description}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
