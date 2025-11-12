import { useState, useRef, useEffect } from 'react';
import { useBotStore } from '../../store/botStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function VoiceControl() {
  const { isRecording, setRecording, state, setCurrentTranscript } = useBotStore();
  const { send, isConnected, connect } = useWebSocket();
  const [isMuted, setIsMuted] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    if (!isConnected) {
      console.warn('WS not connected, attempting to connect...');
      try { connect?.(); } catch {}
      // Esperar hasta 2s a que conecte
      const maxWait = 2000;
      const step = 200;
      let waited = 0;
      while (!useBotStore.getState().connected && waited < maxWait) {
        await new Promise(res => setTimeout(res, step));
        waited += step;
      }
      if (!useBotStore.getState().connected) {
        console.warn('Still not connected');
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // Usar MediaRecorder con configuración optimizada
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      // Reiniciar buffers y transcript actual
      audioChunksRef.current = [];
      setCurrentTranscript('');

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Cuando termine la grabación, enviar todo el audio
      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          // Combinar todos los chunks en un solo blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          console.log('Audio blob size:', audioBlob.size, 'bytes');
          
          // Convertir a base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1];
            console.log('Sending audio, base64 length:', base64Audio.length);
            
            send({
              type: 'audio_chunk',
              audio: base64Audio,
              format: 'webm'
            });
            
            // Enviar señal para procesar
            send({
              type: 'commit_audio'
            });
            // Limpiar buffer después de enviar
            audioChunksRef.current = [];
          };
        }
      };

      mediaRecorderRef.current.start(); // Grabar todo en un solo chunk
      setRecording(true);

      // Iniciar sesión de realtime
      send({
        type: 'start_realtime',
        config: {
          language: 'es'
        }
      });

      // Toast removido - inicio silencioso
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Toast removido - error silencioso
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // El evento onstop se encargará de enviar el audio
      
      // Esperar un poco antes de detener el stream
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      }, 100);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setRecording(false);

    send({
      type: 'stop_realtime'
    });

    // Toast removido - procesamiento silencioso
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Toast removido - mute silencioso
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Mic Button */}
      <motion.button
        onClick={toggleRecording}
        disabled={(!isConnected && !isRecording) || state === 'working'}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isRecording ? (
          <MicOff size={32} className="text-white" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </motion.button>

      {/* Recording Indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-sm text-red-400"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Grabando...</span>
        </motion.div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="p-2 glass rounded-lg hover:bg-white/20 transition-all"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-gray-400" />
        ) : (
          <Volume2 size={20} className="text-white" />
        )}
      </button>
    </div>
  );
}
