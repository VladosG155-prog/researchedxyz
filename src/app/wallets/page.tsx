import type { Metadata } from 'next';
import WalletsClient from '@/components/wallets-client';

// const title = 'Лучшие кошельки для крипты | researched.xyz';
const title = 'Лучшие кошельки для крипты';
const description = 'researched.xyz помогает выбрать лучший криптокошелек. Сравнение по поддерживаемым сетям, комиссиям и функционалу.';
const url = 'https://researched.xyz/wallets';
const imageUrl = 'https://researched.xyz/og/og-wallets.jpg';

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
    return <WalletsClient />;
}
