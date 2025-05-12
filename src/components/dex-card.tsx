'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useCallback } from 'react';
import { memo } from 'react';
import { trackUmamiEvent } from '@/lib/umami'; // Добавляем импорт для трекинга

interface DexTool {
    icon: string;
    url: string;
    networks: { name: string; icon: string }[];
}

interface DexCardProps {
    name: string;
    dex: DexTool;
    index: number; // Добавляем индекс для определения приоритета
}

const DexCard = memo(function DexCard({ name, dex, index }: DexCardProps) {
    const classes = useMemo(
        () => ({
            container: 'bg-[#1a1a1a] border border-[#333333] shadow-md hover:shadow-lg transition-all duration-200 flex flex-col',
            innerContainer: 'p-2 sm:p-4 flex flex-col items-center text-center flex-grow',
            iconContainer: 'w-10 h-10 sm:w-16 sm:h-16 mb-2 sm:mb-4 relative flex-shrink-0',
            icon: 'object-contain rounded-full',
            title: 'text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2 flex-grow line-clamp-2',
            button: 'mt-auto w-full bg-white text-black py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0',
            networksContainer: 'mt-1 sm:mt-3 mb-2 sm:mb-4 flex flex-wrap justify-center gap-1 text-[10px] sm:text-xs text-gray-400',
            networkTag: 'bg-[#2C2C2C] px-1.5 sm:px-2 py-0.5 rounded'
        }),
        []
    );

    const handleClick = useCallback(() => {
        trackUmamiEvent('service_click', {
            service_id: name, // Используем имя DEX как ID
            category: 'dexs',   // Новая категория
            url: dex.url
        });
        window.open(dex.url, '_blank', 'noopener,noreferrer');
    }, [name, dex.url]);

    // Определяем, нужно ли устанавливать приоритет (для первых ~10 карточек)
    const isPriority = index < 15;

    return (
        <motion.div
            className={classes.container}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -15px rgba(255, 255, 255, 0.1)' }}
            onClick={handleClick} // Используем общий обработчик для всей карточки
            style={{ cursor: 'pointer' }} // Показываем, что карточка кликабельна
        >
            <div className={classes.innerContainer}>
                <div className={classes.iconContainer}>
                    <Image
                        src={dex.icon || '/placeholder.svg'}
                        alt={name}
                        width={64}
                        height={64}
                        sizes="(max-width: 640px) 40px, 64px"
                        className={classes.icon}
                        priority={isPriority}
                        loading={isPriority ? undefined : 'lazy'}
                    />
                </div>
                <h3 className={classes.title}>{name}</h3>
                {dex.networks && dex.networks.length > 0 && (
                    <div className={classes.networksContainer}>
                        {dex.networks.slice(0, 3).map((network) => (
                            <span key={network.name} className={classes.networkTag}>
                                {network.name}
                            </span>
                        ))}
                        {dex.networks.length > 3 && (
                            <span 
                                className={classes.networkTag}
                                title={dex.networks.slice(3).map(network => network.name).join(', ')}
                            >
                                ...
                            </span>
                        )}
                    </div>
                )}
            </div>
             {/* Убрали кнопку, вся карточка стала ссылкой */}
        </motion.div>
    );
});

DexCard.displayName = 'DexCard';

export default DexCard; 