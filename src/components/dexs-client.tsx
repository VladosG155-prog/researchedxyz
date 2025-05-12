'use client';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import DexCard from '@/components/dex-card';
import { Filter } from '@/components/filter';

interface Network {
    name: string;
    icon?: string;
}

interface DexTool {
    icon: string;
    url: string;
    networks: { name: string; icon: string }[];
}

interface DexsClientProps {
    dexs: [string, DexTool][];
    allNetworks: Network[];
}

const ITEMS_PER_PAGE = 30; // Количество элементов, подгружаемых за раз

export default function DexsClient({ dexs, allNetworks }: DexsClientProps) {
    const [selectedNetwork, setSelectedNetwork] = useState('');
    // Состояние для отображаемых DEX
    const [displayedDexs, setDisplayedDexs] = useState<[string, DexTool][]>([]); 
    // Состояние для отслеживания загрузки
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // Состояние, чтобы знать, есть ли еще элементы для загрузки
    const [hasMore, setHasMore] = useState(true);
    // Ref для отслеживания, чтобы избежать двойной загрузки в React 18 StrictMode
    const loadingRef = useRef(false);

    // Полный отфильтрованный список DEX
    const filteredDexs = useMemo(() => {
        console.log('Filtering DEXs...');
        return dexs.filter(([_, dexData]) => {
            if (!selectedNetwork) return true;
            return dexData.networks?.some(network => network.name === selectedNetwork);
        });
    }, [dexs, selectedNetwork]);

    // Инициализация и сброс при изменении фильтра
    useEffect(() => {
        console.log('Filter changed, resetting displayed DEXs');
        const initialDexs = filteredDexs.slice(0, ITEMS_PER_PAGE);
        setDisplayedDexs(initialDexs);
        setHasMore(filteredDexs.length > ITEMS_PER_PAGE);
        // Сбрасываем ref загрузки при смене фильтра
        loadingRef.current = false; 
    }, [filteredDexs]);

    const loadMoreItems = useCallback(async () => {
        // Проверяем ref и состояние загрузки
        if (isLoadingMore || loadingRef.current) {
            console.log('Already loading or ref locked');
            return;
        }
        console.log('Attempting to load more items...');
        setIsLoadingMore(true);
        loadingRef.current = true; // Блокируем ref

        // Имитация задержки сети (можно убрать)
        // await new Promise(resolve => setTimeout(resolve, 500)); 

        const currentLength = displayedDexs.length;
        const nextItems = filteredDexs.slice(currentLength, currentLength + ITEMS_PER_PAGE);

        if (nextItems.length > 0) {
            console.log(`Loading ${nextItems.length} more items`);
            setDisplayedDexs(prev => [...prev, ...nextItems]);
        } 
        
        setHasMore(currentLength + nextItems.length < filteredDexs.length);
        setIsLoadingMore(false);
        // Разблокируем ref немного позже, чтобы точно избежать двойного срабатывания
        setTimeout(() => { loadingRef.current = false; }, 100); 
        console.log('Finished loading more items');

    }, [isLoadingMore, displayedDexs, filteredDexs]);

    // Обработчик скролла
    useEffect(() => {
        const handleScroll = () => {
            // Условие для загрузки: близко к низу, есть что грузить, не в процессе загрузки
            const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500; // За 500px до конца
            
            if (nearBottom && hasMore && !isLoadingMore && !loadingRef.current) {
                console.log('Near bottom detected, calling loadMoreItems');
                loadMoreItems();
            }
        };

        window.addEventListener('scroll', handleScroll);
        console.log('Scroll listener added');

        // Очистка слушателя
        return () => {
            window.removeEventListener('scroll', handleScroll);
            console.log('Scroll listener removed');
        };
    }, [hasMore, isLoadingMore, loadMoreItems]); // Добавили loadMoreItems в зависимости

    const handleFilterChange = (value: string) => {
        console.log('Filter changed to:', value);
        if (value === 'Все сети') {
            setSelectedNetwork('');
        } else {
            setSelectedNetwork(value);
        }
        // Сброс отображаемых DEX и состояния hasMore/isLoadingMore произойдет в useEffect [filteredDexs]
    };

    return (
        <div className="w-full max-w-[1260px] pr-4 py-8 pb-[250px] min-h-screen"> 
            <div className="mb-6">
                <Filter
                    name="Сеть"
                    selectedValue={selectedNetwork}
                    onChange={handleFilterChange}
                    filters={allNetworks}
                    showSearch={true}
                    isNetworkFilterOnDexPage={true}
                />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {/* Используем displayedDexs */}
                {displayedDexs.map(([dexName, dexData], index) => (
                    // index здесь теперь глобальный для отображенных элементов
                    <DexCard key={dexName} name={dexName} dex={dexData} index={index} /> 
                ))}
            </div>

            {/* Индикатор загрузки */}
            {isLoadingMore && (
                <div className="mt-8 text-center text-white">
                    Загрузка...
                </div>
            )}
            
            {/* Сообщение, если больше нет элементов (опционально) */}
            {!hasMore && displayedDexs.length > 0 && (
                 <div className="mt-8 text-center text-gray-500">
                    Больше DEX нет.
                 </div>
            )}

            {/* Убрали кнопки пагинации */}
        </div>
    );
} 