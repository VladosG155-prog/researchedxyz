import { Metadata } from 'next';
import ProxyResidentialClient from '@/components/proxy-residential-client';

const title = 'Лучшие резидентские прокси для мультиаккаунтинга';
const description = 'researched.xyz помогает найти лучшие резидентские прокси. Фильтры по нужным странам и цене. Проверили и сравнили в реальных условиях.';
const url = 'https://researched.xyz/proxy-residential';
const imageUrl = 'https://researched.xyz/og/og-proxy-residential.jpg';

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

export default function ProxyResidentialPage() {
  return <ProxyResidentialClient providers={[]} />;
}

// Указываю, что страница динамическая
export const dynamic = 'force-dynamic';
export const revalidate = 0;
