/**
 * Configuración específica para dispositivos móviles
 * Optimizaciones y ajustes para mejorar la experiencia en smartphones
 */

export const MOBILE_CONFIG = {
  // Configuración de reconocimiento de voz
  speech: {
    recognition: {
      continuous: false, // Mejor para móviles
      interimResults: false, // Evita problemas en móviles
      maxAlternatives: 1,
      lang: 'es-ES'
    },
    synthesis: {
      rate: 0.8, // Más lento para móviles
      pitch: 1.0,
      volume: 1.0, // Volumen máximo
      lang: 'es-ES'
    }
  },

  // Timeouts específicos para móviles
  timeouts: {
    voiceLoading: 5000, // 5 segundos para cargar voces
    processing: 20000, // 20 segundos para procesar (conexión más lenta)
    recognition: 10000, // 10 segundos máximo de escucha
    synthesis: 30000 // 30 segundos máximo para hablar
  },

  // Configuración de WebSocket para móviles
  websocket: {
    reconnectDelay: 2000, // 2 segundos entre reconexiones
    maxReconnectAttempts: 5,
    pingInterval: 30000, // 30 segundos entre pings
    messageQueueSize: 50
  },

  // Configuración de UI para móviles
  ui: {
    buttonSize: 80, // Botón más grande para touch
    touchFeedback: true,
    hapticFeedback: true,
    visualFeedback: {
      pulseIntensity: 1.2,
      animationDuration: 300
    }
  },

  // Detección de dispositivos móviles
  detection: {
    userAgentKeywords: [
      'android', 'iphone', 'ipad', 'ipod', 'blackberry',
      'windows phone', 'mobile', 'tablet', 'webos', 'opera mini'
    ],
    maxScreenWidth: 768,
    touchRequired: true
  },

  // Configuración de permisos
  permissions: {
    microphone: {
      requestOnInteraction: true,
      showInstructions: true,
      retryAttempts: 3
    }
  },

  // Optimizaciones de rendimiento
  performance: {
    reducedAnimations: false, // Mantener animaciones en móviles modernos
    lowPowerMode: false,
    backgroundProcessing: false
  }
};

/**
 * Detecta si el dispositivo es móvil
 */
export function isMobileDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUserAgent = MOBILE_CONFIG.detection.userAgentKeywords.some(
    keyword => userAgent.includes(keyword)
  );
  const isMobileScreen = window.innerWidth <= MOBILE_CONFIG.detection.maxScreenWidth;
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUserAgent || (isMobileScreen && hasTouchScreen);
}

/**
 * Obtiene la configuración optimizada según el dispositivo
 */
export function getDeviceConfig() {
  const mobile = isMobileDevice();
  
  return {
    isMobile: mobile,
    speech: mobile ? MOBILE_CONFIG.speech : {
      recognition: {
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        lang: 'es-ES'
      },
      synthesis: {
        rate: 0.9,
        pitch: 1.0,
        volume: 0.9,
        lang: 'es-ES'
      }
    },
    timeouts: mobile ? MOBILE_CONFIG.timeouts : {
      voiceLoading: 3000,
      processing: 15000,
      recognition: 30000,
      synthesis: 20000
    },
    ui: mobile ? MOBILE_CONFIG.ui : {
      buttonSize: 80,
      touchFeedback: false,
      hapticFeedback: false,
      visualFeedback: {
        pulseIntensity: 1.0,
        animationDuration: 200
      }
    }
  };
}

/**
 * Verifica si el navegador soporta las APIs necesarias en móviles
 */
export function checkMobileBrowserSupport() {
  const support = {
    speechRecognition: 'webkitSpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window,
    mediaDevices: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    webSocket: 'WebSocket' in window,
    audioContext: 'AudioContext' in window || 'webkitAudioContext' in window
  };

  const isSupported = Object.values(support).every(Boolean);
  
  return {
    ...support,
    isFullySupported: isSupported,
    missingFeatures: Object.entries(support)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature)
  };
}

/**
 * Obtiene información detallada del dispositivo móvil
 */
export function getMobileDeviceInfo() {
  const userAgent = navigator.userAgent;
  
  return {
    userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    touchPoints: navigator.maxTouchPoints,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : null,
    isOnline: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack
  };
}

/**
 * Aplica optimizaciones específicas para móviles
 */
export function applyMobileOptimizations() {
  if (!isMobileDevice()) return;

  // Prevenir zoom en inputs
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }

  // Optimizar scroll en iOS
  document.body.style.webkitOverflowScrolling = 'touch';
  
  // Prevenir selección de texto accidental
  document.body.style.webkitUserSelect = 'none';
  document.body.style.userSelect = 'none';
  
  // Optimizar touch events
  document.body.style.touchAction = 'manipulation';
  
  console.log('📱 Mobile optimizations applied');
}
