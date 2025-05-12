'use client';
import { useState, useEffect } from 'react';

const useIsMobile = () => {
    // Инициализируем состояние значением по умолчанию (например, false)
    // Это значение будет использоваться во время SSR
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Функция для проверки и установки состояния
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Устанавливаем начальное значение после монтирования на клиенте
        checkDevice();

        // Добавляем слушатель изменения размера окна
        window.addEventListener('resize', checkDevice);

        // Очищаем слушатель при размонтировании компонента
        return () => window.removeEventListener('resize', checkDevice);
    }, []); // Пустой массив зависимостей гарантирует выполнение только при монтировании/размонтировании

    return isMobile;
};

export default useIsMobile;
