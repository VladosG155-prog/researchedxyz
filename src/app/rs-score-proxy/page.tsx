import type { Metadata } from 'next';
import RsScoreProxyClient from '@/components/rs-score-proxy-client';

const title = 'Researched Proxy Score — честный рейтинг прокси-сервисов';
const description = 'Собственная система оценки прокси-сервисов от researched.xyz. Проверили 50+ прокси в реальных условиях.';
const url = 'https://researched.xyz/rs-score-proxy';
const imageUrl = 'https://researched.xyz/og/og-preview.jpg';

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
        type: 'article',
        images: [
            {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: 'researched.xyz — Researched Proxy Score'
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
    return <RsScoreProxyClient />;
}
