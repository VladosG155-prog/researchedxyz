import type { Metadata } from 'next';
// import RsScoreAntidetectClient from '../../components/rs-score-antidetect-client'; // Неверный путь
import RsScoreAntidetectClient from '@/components/rs-score-antidetect-client'; // Исправленный путь

// const title = 'Researched Antidetect Score — честный рейтинг антидетект-браузеров';
const title = 'RS Antidetect Score: Рейтинг антидетект-браузеров'; // Сокращенный вариант
const description = 'Собственная система оценки антидетект-браузеров от researched.xyz. 9 независимых критериев, реальные тесты, советы по выбору.';
const url = 'https://researched.xyz/rs-score-antidetect';
const imageUrl = 'https://researched.xyz/og/og-antidetect.jpg';

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
                alt: 'researched.xyz — Researched Antidetect Score'
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
    return <RsScoreAntidetectClient />;
}
