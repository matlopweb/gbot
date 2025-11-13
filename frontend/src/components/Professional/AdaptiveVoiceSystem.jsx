import React, { useState, useEffect } from 'react';
import { VoiceSystemPro } from './VoiceSystemPro';
import { MobileVoiceSystem } from './MobileVoiceSystem';

/**
 * Sistema de Voz Adaptativo
 * Detecta el dispositivo y usa el sistema optimizado correspondiente
 */
export function AdaptiveVoiceSystem() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectDevice = () => {
      // Detección completa de dispositivos móviles
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
        'windows phone', 'mobile', 'tablet', 'webos', 'opera mini'
      ];
      
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileScreen = window.innerWidth <= 768;
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileDevice = isMobileUserAgent || (isMobileScreen && hasTouchScreen);
      
      console.log('🔍 Device Detection:', {
        userAgent: userAgent.substring(0, 50) + '...',
        isMobileUserAgent,
        isMobileScreen,
        hasTouchScreen,
        screenWidth: window.innerWidth,
        maxTouchPoints: navigator.maxTouchPoints,
        finalDecision: isMobileDevice ? 'MOBILE' : 'DESKTOP'
      });

      setIsMobile(isMobileDevice);
      setIsLoading(false);
    };

    detectDevice();
    
    // Re-detectar en cambios de tamaño (rotación, etc.)
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Usar el sistema apropiado según el dispositivo
  return isMobile ? <MobileVoiceSystem /> : <VoiceSystemPro />;
}
