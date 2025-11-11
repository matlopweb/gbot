import { motion } from 'framer-motion';
import { useBotStore } from '../../store/botStore';
import { Bot, Mic, Brain, MessageSquare, Wrench } from 'lucide-react';

const stateConfig = {
  idle: {
    color: '#94a3b8',
    icon: Bot,
    animation: 'float',
    glow: false
  },
  listening: {
    color: '#3b82f6',
    icon: Mic,
    animation: 'pulse',
    glow: true
  },
  thinking: {
    color: '#8b5cf6',
    icon: Brain,
    animation: 'spin',
    glow: true
  },
  speaking: {
    color: '#10b981',
    icon: MessageSquare,
    animation: 'bounce',
    glow: true
  },
  working: {
    color: '#f59e0b',
    icon: Wrench,
    animation: 'pulse',
    glow: true
  }
};

export default function BotAvatar({ size = 'large' }) {
  const { state } = useBotStore();
  const config = stateConfig[state] || stateConfig.idle;
  const Icon = config.icon;

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const iconSizes = {
    small: 32,
    medium: 64,
    large: 96
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      {config.glow && (
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-50"
          style={{ backgroundColor: config.color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Main avatar */}
      <motion.div
        className={`${sizeClasses[size]} relative rounded-full glass flex items-center justify-center`}
        style={{ borderColor: config.color }}
        animate={
          config.animation === 'float'
            ? { y: [-10, 10, -10] }
            : config.animation === 'pulse'
            ? { scale: [1, 1.1, 1] }
            : config.animation === 'spin'
            ? { rotate: [0, 360] }
            : config.animation === 'bounce'
            ? { y: [0, -20, 0] }
            : {}
        }
        transition={{
          duration: config.animation === 'spin' ? 3 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Icon
          size={iconSizes[size]}
          style={{ color: config.color }}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* State indicator */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full glass text-xs font-semibold"
        style={{ borderColor: config.color, color: config.color }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={state}
      >
        {state.charAt(0).toUpperCase() + state.slice(1)}
      </motion.div>
    </div>
  );
}
