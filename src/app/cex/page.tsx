import type { Metadata } from 'next';
import CexClient from '@/components/cex-client';

const title = '9 лучших CEX бирж для крипты';
const description = 'CEX биржи для крипты. Ограничения по странам. Способы заработка. Сравнение комиссий вывода монет.';
const url = 'https://researched.xyz/cex';
const imageUrl = 'https://researched.xyz/og/og-cex.jpg';

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

export default function CexPage() {
    return <CexClient />;
}
