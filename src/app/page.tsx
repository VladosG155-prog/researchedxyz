//'use client'; // Убрали директиву

import React from 'react'; // Оставили React
import type { Metadata } from 'next';
import { Welcome } from '@/components/welcome-client'; // Импортируем новый компонент

// Определяем JSON-LD для главной страницы
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: 'https://researched.xyz/',
    name: 'Купить расходники для мультиаккаунтинга и крипты дёшево | researched.xyz',
    description:
        'Агрегатор сервисов для мультиаккаунтинга. Антидетекты, прокси, боты, кошельки, CEX, OTC и т.д. Всё купили, проверили и отсортировали.',
};

// Экспортируем метаданные
export const metadata = {
    title: 'Проверенные расходники для мультиаккаунтинга и крипты | researched.xyz',
    description:
        'Агрегатор сервисов для мультиаккаунтинга. Антидетекты, прокси, боты, кошельки, CEX, OTC и т.д. Всё купили, проверили и отсортировали.',
    openGraph: {
        title: 'Купить расходники для мультиаккаунтинга и крипты дёшево | researched.xyz',
        description: 'researched.xyz — агрегатор сервисов для мультиаккаунтинга. Антидетекты, прокси, боты, кошельки, CEX, OTC и т.д. Всё купили, проверили и отсортировали',
        url: 'https://researched.xyz/',
        siteName: 'researched.xyz',
        images: [
            {
                url: '/og/og-preview.jpg',
                width: 1200,
                height: 630,
                alt: 'OG image for /'
            }
        ],
        locale: 'ru_RU',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Купить расходники для мультиаккаунтинга и крипты дёшево | researched.xyz',
        description: 'researched.xyz — агрегатор сервисов для мультиаккаунтинга. Антидетекты, прокси, боты, кошельки, CEX, OTC и т.д. Всё купили, проверили и отсортировали.',
        images: ['/og/og-preview.jpg'],
        creator: '@researchedxyz'
    },
    alternates: {
        canonical: 'https://researched.xyz/'
    },
    other: {
        'script:ld+json': JSON.stringify(jsonLd)
    }
};

// Основной компонент страницы (серверный)
export default function HomePage() {
    // Возвращаем клиентский компонент
    // Проп onMultiaccountingClick больше не нужен
    return <Welcome />;
}

// Удалили весь код компонента Welcome, который был перенесен
