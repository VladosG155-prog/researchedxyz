import type { Metadata } from 'next';
import DexsClient from '@/components/dexs-client';
import dexsData from '../../../data/dexs.json';

const title = 'Лучшие децентрализованные биржи (DEX)';
const description = 'researched.xyz помогает выбрать лучший DEX. Сравнение по поддерживаемым сетям и возможностям.';
const url = 'https://researched.xyz/dexs';
const imageUrl = 'https://researched.xyz/og/og-default.jpg'; // TODO: Create specific OG image

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: url,
    name: title,
    description: description
};

export const metadata: Metadata = {
    title: title,
    description: description,
    alternates: {
        canonical: url
    },
    openGraph: {
        title: title,
        description: description,
        url: url,
        type: 'website',
        images: [
            {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: title
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl]
    },
    other: {
        'script:ld+json': JSON.stringify(jsonLd)
    }
};

export default function Page() {
    const dexs = Object.entries(dexsData.Data.dexs.tools);
    const info = dexsData.Data.dexs.info;
    const networkIconsMap = info.networkIcons || {}; // Карта иконок
    const uniqueNetworkNames = info.allNetworks || []; // Массив имен сетей

    // Подготовка данных для фильтра
    const allNetworksForFilter = [
        // Добавляем опцию сброса
        { name: 'Все сети', icon: undefined }, // Используем undefined, если иконки нет
        // Остальные сети с иконками
        ...uniqueNetworkNames.map((networkName) => ({
            name: networkName,
            icon: networkIconsMap[networkName] || undefined // Берем URL из карты, или undefined если нет
        }))
    ];

    return <DexsClient dexs={dexs} allNetworks={allNetworksForFilter} />;
} 