import type { Metadata } from 'next';
import { OtcClient } from '@/components/otc-client';

const title = 'Лучшие OTC для крипты';
const description = 'Нашли все OTC для крипты. Сравнение комиссий и времени ответа гарантов.';
const url = 'https://researched.xyz/otc';
const imageUrl = 'https://researched.xyz/og/og-otc.jpg';

// JSON-LD Markup
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
        // Добавляем JSON-LD в head через <script>
        'script:ld+json': JSON.stringify(jsonLd)
    }
};

// Серверный компонент страницы
export default function OtcPage() {
    // Просто рендерим клиентский компонент
    return <OtcClient />;
}
