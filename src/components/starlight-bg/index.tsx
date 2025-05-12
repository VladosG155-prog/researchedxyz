'use client';

import { useEffect, useRef } from 'react';
// import './animation.css'; // CSS больше не нужен
import { usePathname } from 'next/navigation';

// Интерфейс для хранения состояния звезды
interface Star {
    x: number;
    y: number;
    size: number;
    delay: number; // Задержка (сдвиг фазы) анимации в мс
    opacity: number; // Текущая прозрачность
    animationDuration: number; // Длительность полного цикла
}

const TwinklingStarsGrid = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // Изменили ref на canvas
    const animationFrameId = useRef<number | null>(null);
    const starsRef = useRef<Star[]>([]);
    const pathname = usePathname();
    // !!! НОВЫЙ REF: Для общей прозрачности при старте
    const globalOpacityRef = useRef(0);
    const fadeInStartTimeRef = useRef<number | null>(null);
    const fadeInDuration = 1000; // Длительность fade-in в мс (1 секунда)

    useEffect(() => {
        // Анимация только на главной
        if (pathname !== '/') {
            // Очищаем предыдущую анимацию, если ушли со страницы
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
            starsRef.current = []; // Очищаем массив звезд
            globalOpacityRef.current = 0; // Сбрасываем прозрачность
            fadeInStartTimeRef.current = null;
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            console.error('Canvas context is not available');
            return;
        }

        // !!! ИЗМЕНЕНИЕ 1: Увеличиваем размер ячейки
        const cellSize = 22;
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        canvas.width = windowWidth;
        canvas.height = windowHeight;
        // Сбрасываем при инициализации эффекта на главной
        globalOpacityRef.current = 0;
        fadeInStartTimeRef.current = null;

        const setupStars = () => {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
            canvas.width = windowWidth;
            canvas.height = windowHeight;

        const cols = Math.ceil(windowWidth / cellSize);
        const rows = Math.ceil(windowHeight / cellSize);
        const totalCells = rows * cols;
            starsRef.current = []; // Очищаем перед созданием

        const numberOfStars = Math.floor(totalCells * 0.03125);
        const insideEllipseStars = Math.floor(numberOfStars * 0.7);
        const outsideEllipseStars = numberOfStars - insideEllipseStars;

        const centerX = windowWidth / 2;
        const centerY = windowHeight / 2;
        const radiusX = windowWidth / 3;
        const radiusY = windowHeight / 3;

        const isInsideEllipse = (x: number, y: number) => (x - centerX) ** 2 / radiusX ** 2 + (y - centerY) ** 2 / radiusY ** 2 <= 1;

        const insideEllipseIndices: number[] = [];
        const outsideEllipseIndices: number[] = [];

        for (let i = 0; i < totalCells; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
                const x = col * cellSize; // Координата X для fillRect
                const y = row * cellSize; // Координата Y для fillRect

                if (isInsideEllipse(x + cellSize / 2, y + cellSize / 2)) {
                insideEllipseIndices.push(i);
            } else {
                outsideEllipseIndices.push(i);
            }
        }

        const shuffle = (array: number[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        };

        shuffle(insideEllipseIndices);
        shuffle(outsideEllipseIndices);

            const createStar = (index: number): Star => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                return {
                    x: col * cellSize,
                    y: row * cellSize,
                    size: cellSize,
                    delay: Math.random() * 6000, // Задержка 0-6 сек
                    opacity: 0,
                    animationDuration: 6000 // 6 секунд на цикл
                };
        };

        for (let i = 0; i < Math.min(insideEllipseStars, insideEllipseIndices.length); i++) {
                starsRef.current.push(createStar(insideEllipseIndices[i]));
        }

        for (let i = 0; i < Math.min(outsideEllipseStars, outsideEllipseIndices.length); i++) {
                starsRef.current.push(createStar(outsideEllipseIndices[i]));
            }
        };

        const animate = (timestamp: number) => {
            if (!ctx || !canvas) return; // Добавим проверку на всякий случай

            // !!! ИЗМЕНЕНИЕ 3: Логика глобального fade-in
            if (fadeInStartTimeRef.current === null) {
                fadeInStartTimeRef.current = timestamp; // Запоминаем время старта fade-in
            }
            const fadeInElapsed = timestamp - fadeInStartTimeRef.current;
            globalOpacityRef.current = Math.min(1, fadeInElapsed / fadeInDuration);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#212121'; // Цвет квадратов

            starsRef.current.forEach(star => {
                const effectiveTime = (timestamp + star.delay) % star.animationDuration;
                const halfDuration = star.animationDuration / 2;
                let individualOpacity = 0;

                if (effectiveTime < halfDuration) {
                    individualOpacity = effectiveTime / halfDuration;
                } else {
                    individualOpacity = 1 - (effectiveTime - halfDuration) / halfDuration;
                }
                star.opacity = Math.max(0, Math.min(1, individualOpacity));

                // Применяем и индивидуальную, и глобальную прозрачность
                const finalOpacity = star.opacity * globalOpacityRef.current;

                if (finalOpacity > 0) {
                    ctx.globalAlpha = finalOpacity;
                    ctx.fillRect(star.x, star.y, star.size, star.size);
                }
            });

            ctx.globalAlpha = 1; // Сбрасываем прозрачность для следующих кадров
            animationFrameId.current = requestAnimationFrame(animate);
        };

        // --- Инициализация и ресайз ---
        setupStars(); // Первичная настройка
        animationFrameId.current = requestAnimationFrame(animate);

        const handleResize = () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
        }
            // Сбрасываем fade-in при ресайзе, чтобы он начался заново
            globalOpacityRef.current = 0;
            fadeInStartTimeRef.current = null;
            setupStars(); // Перенастраиваем звезды при ресайзе
            // Сразу запускаем новый цикл анимации
            animationFrameId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);

        // --- Очистка --- 
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            starsRef.current = []; // Очищаем массив при размонтировании
        };
    }, [pathname]); // Перезапускаем эффект при смене страницы

    // Не рендерим canvas, если не на главной
    if (pathname !== '/') return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full bg-black z-0"
            // Ширина и высота задаются в useEffect
        />
        // Удален скрытый div, он больше не нужен
    );
};

export default TwinklingStarsGrid;
