import type { Metadata } from 'next';
import MultiaccountingClient from '@/components/multiaccounting-client';

const title = 'Гайд по мультиаккаунтингу в крипте';
const description = 'Рассказали, как правильно делать мультиаккаунты и не спалиться. Какие сервисы использовать. Что важно для анонимности.';
const url = 'https://researched.xyz/multiaccounting';
const imageUrl = 'https://researched.xyz/og/og-multiaccounting.jpg';

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
                alt: 'researched.xyz — Гайд по мультиаккаунтингу в крипте'
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

export default function MultiaccountingPage() {
    return <MultiaccountingClient />;
}
