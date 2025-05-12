import React from 'react';

interface ProxyDePinClientProps {
  providers: any[];
}

export default function ProxyDePinClient({ providers }: ProxyDePinClientProps) {
  // Удаляю useState и useEffect для клиентской загрузки данных
  // ... existing code ...
  return (
    <div>
      {/* Здесь будет рендеринг таблицы с использованием providers из props */}
      {/* ... existing code using providers ... */}
    </div>
  );
} 