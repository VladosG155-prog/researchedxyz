/**
 * Отправляет пользовательское событие в Umami Analytics.
 * Убедитесь, что скрипт Umami уже загружен и window.umami доступен.
 *
 * @param eventName - Название события (например, 'service_click').
 * @param eventData - Необязательный объект с дополнительными данными о событии.
 */
export const trackUmamiEvent = (
  eventName: string,
  eventData?: Record<string, string | number | boolean>
): void => {
  if (typeof window !== 'undefined' && window.umami) {
    try {
      window.umami.track(eventName, eventData);
      console.log(`Umami event tracked: ${eventName}`, eventData || ''); // Для отладки
    } catch (error) {
      console.error('Error tracking Umami event:', error);
    }
  } else {
    console.warn('Umami tracker (window.umami) not found.');
  }
};

// TypeScript должен знать о глобальной переменной umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
} 