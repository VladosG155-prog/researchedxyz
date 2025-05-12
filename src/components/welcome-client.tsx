'use client';

//@ts-nocheck
import React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion'; // <<< Оставляем импорт motion
import { useRouter, usePathname } from 'next/navigation';
import { GuidePopup } from '@/components/guide-popup';
import { ChevronRight } from 'lucide-react';
import { useCategoryContext } from '@/providers/category-provider';
// !!! Импортируем useIsMobile
import useIsMobile from '@/hooks/useIsMobile';
/* import { GuidePopup } from "./popups/guide-popup" */

export function Welcome() {
    const [clickCount, setClickCount] = useState(0);
    const [showCat, setShowCat] = useState(false);

    const { setIsShowGuideModal, isShowGuideModal } = useCategoryContext();
    // !!! Используем хук
    const isMobile = useIsMobile();

    // Using useMemo to prevent recreating the array of categories on each render
    const categories = useMemo(
        () => [
            { text: 'антики', color: 'text-purple-500' },
            { text: 'шопы', color: 'text-blue-500' },
            { text: 'CEX', color: 'text-green-500' },
            { text: 'кошельки', color: 'text-yellow-500' },
            { text: 'трейдинг боты', color: 'text-red-500' },
            { text: 'OTC', color: 'text-pink-500' },
            { text: 'прокси', color: 'text-cyan-500' }
        ],
        []
    );

    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [displayText, setDisplayText] = useState(categories[0].text);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [isAnimationReady, setIsAnimationReady] = useState(false);

    // Refs for timing control
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const catTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Animation constants
    const constants = useMemo(
        () => ({
            typingSpeed: 100,
            deletingSpeed: 33,
            pauseDelay: 1300,
            cursorBlinkInterval: 530
        }),
        []
    );

    // Add event listener for the guide popup
    useEffect(() => {
        const handleOpenGuidePopup = () => {
            setIsShowGuideModal();
        };

        document.addEventListener('openGuidePopup', handleOpenGuidePopup);

        return () => {
            document.removeEventListener('openGuidePopup', handleOpenGuidePopup);
        };
    }, [setIsShowGuideModal]);

    // !!! НОВЫЙ useEffect: Запускаем анимацию с задержкой
    useEffect(() => {
        // !!! Убираем проверку isMobile, чтобы задержка работала и на мобильных
        // if (isMobile) return;

        const startDelay = 500;
        const readyTimer = setTimeout(() => {
            setIsAnimationReady(true);
            setIsDeleting(true);
        }, startDelay);

        return () => clearTimeout(readyTimer);
        // Убираем isMobile из зависимостей, т.к. он больше не используется здесь
    }, []);

    // Optimized text animation effect
    useEffect(() => {
        // !!! Убираем проверку isMobile, чтобы анимация работала и на мобильных
        // if (isMobile || !isAnimationReady) return;
        // !!! Но проверка isAnimationReady остается!
        if (!isAnimationReady) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        const currentCategory = categories[currentCategoryIndex].text;
        const isCompleted = !isDeleting && displayText === currentCategory;
        const isEmpty = isDeleting && displayText === '';
        const delay = isDeleting ? constants.deletingSpeed : isCompleted ? constants.pauseDelay : constants.typingSpeed;
        const nextAnimationStep = () => {
            if (!isDeleting) {
                // Typing
                if (!isCompleted) {
                    setDisplayText(currentCategory.substring(0, displayText.length + 1));
                } else {
                    // Pause, then start deleting
                    setIsDeleting(true);
                }
            } else {
                // Deleting
                if (!isEmpty) {
                    setDisplayText(displayText.substring(0, displayText.length - 1));
                } else {
                    // Finished deleting - move to next word and start typing
                    setIsDeleting(false);
                    const nextIndex = (currentCategoryIndex + 1) % categories.length;
                    setCurrentCategoryIndex(nextIndex);
                }
            }
        };
        timerRef.current = setTimeout(nextAnimationStep, delay);
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
        // Убираем isMobile из зависимостей
    }, [displayText, isDeleting, currentCategoryIndex, categories, constants, isAnimationReady]);

    // Optimized cursor blinking effect with RAF
    useEffect(() => {
        // !!! Убираем проверку isMobile, чтобы курсор мигал и на мобильных
        // if (isMobile) {
        //     setShowCursor(false);
        //     return;
        // }

        let animationFrameId: number;
        let lastToggleTime = 0;

        const blinkCursor = (timestamp: number) => {
            if (timestamp - lastToggleTime >= constants.cursorBlinkInterval) {
                setShowCursor((prev) => !prev);
                lastToggleTime = timestamp;
            }
            animationFrameId = requestAnimationFrame(blinkCursor);
        };
        animationFrameId = requestAnimationFrame(blinkCursor);

        return () => cancelAnimationFrame(animationFrameId);
        // Убираем isMobile из зависимостей
    }, [constants.cursorBlinkInterval]);

    // Optimized logo click handler with useCallback
    const handleLogoClick = useCallback(() => {
        setClickCount((prev) => {
            const newCount = prev + 1;

            if (newCount >= 5) {
                // Clear any existing cat timer
                if (catTimerRef.current) {
                    clearTimeout(catTimerRef.current);
                }

                setShowCat(true);
                catTimerRef.current = setTimeout(() => {
                    setShowCat(false);
                    catTimerRef.current = null;
                }, 2000);

                return 0;
            }

            return newCount;
        });
    }, []);

    const iconSourcesRef = useRef<HTMLImageElement[]>([]);

    // Preload icon images for better performance
    useEffect(() => {
        // Pre-define icon sources and preload them
        const sources = [
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/handpie-krMyEJUWwsr5fjT1AB8oPllk03Kil9.webp',
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/green-heart-cVae3IoBP0nzLUn04gX8FOdY0pFZzn.webp'
        ];

        // Preload images
        sources.forEach((src, index) => {
            const img = new Image();
            img.src = src;
            iconSourcesRef.current[index] = img;
        });

        // Cleanup function
        return () => {
            // Clear any timers
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (catTimerRef.current) {
                clearTimeout(catTimerRef.current);
            }
        };
    }, []);

    return (
        <>
            <GuidePopup isOpen={isShowGuideModal} onClose={setIsShowGuideModal} />
            {/* !!! Анимируем ТОЛЬКО внешний контейнер !!! */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }} // Добавим явную длительность
                className="flex flex-col items-center overflow-hidden relative z-10"
            >
                {/* !!! Вложенные элементы - обычные div/button !!! */}
                <div
                    className="flex flex-col items-center mb-[150px]"
                >
                    <div
                        className="text-center mb-3 md:mb-10"
                    >
                        <h1 className="welcome-title  text-[24px] md:text-[48px]" onClick={handleLogoClick}>
                            Лучшие
                            <span className={`${categories[currentCategoryIndex].color} inline-flex ml-2.5 text-[24px] md:text-[48px]`}>
                                {displayText}
                                <span
                                    className={`${
                                        showCursor ? 'opacity-100' : 'opacity-0'
                                    } transition-opacity duration-100 ml-0.5 welcome-cursor`}
                                >
                                    |
                                </span>
                            </span>
                            <br />
                            для мультиаккаунтинга
                        </h1>
                    </div>

                    <button
                        className="group flex justify-center items-center bg-[#D06E31] text-white font-['Martian_Mono'] font-normal text-[18px]  w-[255px] h-[30px] md:w-[805px] md:h-[86px]  border-none cursor-pointer  transition-transform duration-300"
                        onClick={setIsShowGuideModal}
                    >
                        <div
                            onClick={setIsShowGuideModal}
                            className="flex items-center justify-center relative z-10 cursor-pointer transition-transform duration-300 hover:scale-105"
                        >
                            <span onClick={setIsShowGuideModal} className="hidden md:flex items-center gap-2 text-[20px] ">
                                Бесплатный гайд по заработку через мультиаккаунтинг
                                <ChevronRight />
                            </span>
                            <span onClick={setIsShowGuideModal} className="md:hidden items-center flex text-[12px]">
                                Гайд по мультиаккаунтингу
                                <ChevronRight />
                            </span>
                        </div>
                    </button>
                </div>
            </motion.div>

            {showCat && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
                >
                    <img src="https://cataas.com/cat/cute" alt="Cute cat" className="max-w-full max-h-full object-contain" />
                </motion.div>
            )}
            {/*  {showGuidePopup && <GuidePopup onClose={handleGuideClose} />} */}
        </>
    );
}

// Optimize with React.memo
export default React.memo(Welcome);
