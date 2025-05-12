import { Metadata } from 'next';
import { ShopsClient } from '@/components/shops-client';

// Определяем JSON-LD разметку для этой страницы
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: 'https://researched.xyz/shops',
    name: 'Магазины аккаунтов для мультиаккаунтинга'
    // Можно добавить description и isPartOf, если нужно
};

// Экспорт метаданных
export const metadata: Metadata = {
    title: 'Магазины аккаунтов для мультиаккаунтинга.', // Title из списка
    description:
        'Лучшие магазины аккаунтов для мультиаккаунтинга. Фильтры по способам оплаты и нужным товарам.', // Description из списка
    openGraph: {
        title: 'Магазины аккаунтов для мультиаккаунтинга.',
        description: 'Лучшие магазины аккаунтов для мультиаккаунтинга. Фильтры по способам оплаты и нужным товарам.',
        url: 'https://researched.xyz/shops', // URL страницы
        siteName: 'researched.xyz',
        images: [
            {
                url: '/og/og-shops.jpg', // Путь к OG изображению
                width: 1200, // Укажите корректную ширину, если знаете
                height: 630, // Укажите корректную высоту, если знаете
                alt: 'Превью страницы магазинов аккаунтов researched.xyz'
            }
        ],
        locale: 'ru_RU',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Магазины аккаунтов для мультиаккаунтинга | researched.xyz',
        description: 'Лучшие магазины аккаунтов для мультиаккаунтинга. Фильтры по способам оплаты и нужным товарам.',
        images: ['https://researched.xyz/og/og-shops.jpg'], // Путь к изображению для Twitter
        creator: '@researchedxyz'
    },
    alternates: {
        canonical: 'https://researched.xyz/shops' // Канонический URL
    },
    // Добавляем скрипт JSON-LD
    other: {
         'script:ld+json': JSON.stringify(jsonLd)
    }
};

// Серверный компонент страницы
export default function ShopsPage() {
    return <ShopsClient />;
}
