import { useEffect, useRef } from 'react';

const useRealtimeSync = (callback, events = [], pollingInterval = 10000) => {
  const callbackRef = useRef(callback);
  const lastPollRef = useRef(0);
  
  // Actualizar la referencia del callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // 👇 Función de polling con throttling
    const poll = () => {
      const now = Date.now();
      if (now - lastPollRef.current >= pollingInterval) {
        console.log('🔄 Polling: Sincronizando datos...');
        callbackRef.current();
        lastPollRef.current = now;
      }
    };

    // 👇 Configurar polling automático
    const pollIntervalId = setInterval(poll, pollingInterval);

    // 👇 Escuchar eventos de ventana
    const eventHandlers = events.map(eventName => {
      const handler = () => {
        console.log(`📢 Evento recibido: ${eventName}`);
        callbackRef.current();
      };
      window.addEventListener(eventName, handler);
      return { eventName, handler };
    });

    // 👇 Escuchar cambios en localStorage (para otros navegadores)
    const handleStorageChange = (e) => {
      if (e.key === 'productChanged' && e.newValue !== e.oldValue) {
        console.log('📢 Storage event: Datos cambiados en otra sesión');
        callbackRef.current();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 👇 Cleanup
    return () => {
      clearInterval(pollIntervalId);
      eventHandlers.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [events.join(','), pollingInterval]);
};

export default useRealtimeSync;