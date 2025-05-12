// Убираем клиентский рендеринг
// 'use client';

import { Metadata } from 'next';
import { AntidetectClient } from '@/components/antidetect-client';
import antidetectData from '../../../data/antiki.json';

const title = 'Лучшие антидетекты для мультиаккаунтинга';
const description = 'researched.xyz помогает найти лучшие антидетект браузеры. Сравнение по цене. Проверили в реальных условиях.';
const url = 'https://researched.xyz/antidetect';
const imageUrl = 'https://researched.xyz/og/og-antidetect.jpg'; // Убедимся, что путь корректный

// Определяем JSON-LD
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: url,
    name: title,
    description: description
};

// Экспорт метаданных (остается здесь)
export const metadata: Metadata = {
    // metadataBase: new URL('https://researched.xyz'), // Убедимся, что его нет
    title: title,
    description: description,
    openGraph: {
        title: title,
        description: description,
        url: url, // Используем antidetect согласно структуре папок
        siteName: 'researched.xyz',
        images: [
            {
                url: imageUrl, // Путь к OG изображению
                width: 1200, // Укажите корректную ширину, если знаете
                height: 630, // Укажите корректную высоту, если знаете
                alt: 'Превью страницы антидетектов researched.xyz'
            }
        ],
        locale: 'ru_RU',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl], // Путь к изображению для Twitter
        creator: '@researchedxyz' // Если есть аккаунт в Twitter
    },
    alternates: {
        canonical: url // Канонический URL
    },
    // Добавляем JSON-LD сюда
    other: {
        'script:ld+json': JSON.stringify(jsonLd)
    }
};

// Серверный компонент страницы, который рендерит клиентский компонент
export default function AntidetectPage() {
  const fallbackData = Object.entries(antidetectData.Data.antiki.tools);
  return <AntidetectClient data={fallbackData} />;
}

// Указываю, что страница динамическая
export const dynamic = 'force-dynamic';
export const revalidate = 0;
