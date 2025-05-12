import { Metadata } from 'next';
import DePINClient from '../../components/depin-table';

const title = 'Лучшие прокси для DePIN проектов';
const description = 'В researched.xyz мы купили, проверили и сравнили 30+ прокси в Grass, Gradient и Dawn и знаем, где лучший фарм поинтов.';
const pageUrl = 'https://researched.xyz/proxy-depin';
const imageUrl = 'https://researched.xyz/og/og-depin.jpg';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'url': pageUrl,
  'name': title,
};

export const metadata: Metadata = {
  title: title,
  description: description,
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: title,
    description: description,
    url: pageUrl,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: 'DePIN Proxy Services',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [imageUrl],
  },
  other: {
    'script:ld+json': JSON.stringify(jsonLd),
  },
};

export default function ProxyDePinPage() {
  return <DePINClient providers={[]} />;
}

// Указываю, что страница динамическая
export const dynamic = 'force-dynamic';
export const revalidate = 0;
