import type { Metadata } from 'next';
import TradingBotsClient from '@/components/tradingbots-client';

const title = 'Лучшие трейдинг боты для мемкоинов';
const description = 'Researched.xyz помогает найти лучшие трейдинг боты. Фильтры по сетям. Сравнение по скорости трейдинга и копитрейдинга.';
    const url = 'https://researched.xyz/tradingbots';
    const imageUrl = 'https://researched.xyz/og/og-tradingbots.jpg';

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
    return <TradingBotsClient />;
}
