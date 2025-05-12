import { Metadata } from 'next';
import { Martian_Mono, Press_Start_2P } from 'next/font/google';
import './globals.css';
import { Header } from '../components/header';
import { CategoryProvider } from '@/providers/category-provider';
import { Footer } from '@/components/footer';
import 'swiper/css';
import Script from 'next/script';

import ClientRedirect from '@/components/client-redirect';
import TwinklingStarsGrid from '@/components/starlight-bg';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    metadataBase: new URL('https://researched.xyz'),
    title: {
      template: '%s | researched.xyz',
      default: 'researched.xyz',
    },
    description: 'Агрегатор сервисов для мультиаккаунтинга. Антидетекты, прокси, боты, кошельки, CEX, OTC и т.д. Всё купили, проверили и отсортировали.',
    robots: { index: true, follow: true },
    other: {
        'script:ld+json': JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": "https://researched.xyz/#organization",
                    name: "researched.xyz",
                    url: "https://researched.xyz",
                    logo: {
                        "@type": "ImageObject",
                        url: "https://researched.xyz/phone_icon/android-chrome-512x512.png"
                    }
                },
                {
                    "@type": "WebSite",
                    "@id": "https://researched.xyz/#website",
                    url: "https://researched.xyz",
                    name: "researched.xyz",
                    publisher: {
                        "@id": "https://researched.xyz/#organization"
                    }
                }
            ]
        })
    }
};

const martianMono = Martian_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-martian-mono'
});
const pressStart = Press_Start_2P({
    subsets: ['cyrillic'],
    display: 'swap',
    weight: '400',
    variable: '--font-martian-pressStart'
});

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru-RU" className={`${martianMono.variable} ${pressStart.variable}`}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                {/* Favicons */}
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                 <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                 {/* Preload */}
                 <link rel="preload" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&subset=cyrillic" as="style" />
                 {/* PWA & Mobile */}
                 <link rel="manifest" href="/manifest.json" />
                 <meta name="theme-color" content="#121313" />
                 <link rel="apple-touch-icon" href="/phone_icon/apple-touch-icon.png" />
                 <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#121313" />
                 {/* Analytics Scripts using next/script */}
                 {/* !!! Включаем Umami !!! */}
                 <Script
                    src="https://metric.researched.xyz/script.js"
                    strategy="afterInteractive"
                    data-website-id="a9b97fed-3e50-4ffa-bcff-3e1efc93b33f"
                 />
                 {/* Yandex.Metrika counter - ОСТАВЛЯЕМ БЕЗ ВЕБВИЗОРА */}
                 <Script
                    id="yandex-metrika"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                        m[i].l=1*new Date();
                        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                        ym(101502368, "init", {
                            clickmap:true,
                            trackLinks:true,
                            accurateTrackBounce:true,
                            webvisor:true /* Вебвизор включен */
                        });
                        `,
                    }}
                 />
                 {/* /Yandex.Metrika counter */}
                 {/* Google tag (gtag.js) - ВКЛЮЧАЕМ */}
                 <Script async src="https://www.googletagmanager.com/gtag/js?id=G-QKQRKHTTC7" strategy="afterInteractive" />
                 <Script id="google-analytics" strategy="afterInteractive">
                    {`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', 'G-QKQRKHTTC7');
                    `}
                 </Script>
                 {/* /Google tag (gtag.js) */}
            </head>
            <body className={'bg-[#121212] h-[100vh] sm:p-[15px] md:p-[15px] lg:p-[20px]'}>
                {/* Yandex Metrika noscript должен быть в body */}
                {/* !!! Возвращаем noscript Метрики, он не влияет на JS performance */}
                <noscript>
                    <div>
                        <img src="https://mc.yandex.ru/watch/101502368" style={{position:'absolute', left:'-9999px'}} alt="" />
                    </div>
                </noscript>
                {/* !!! ВОЗВРАЩАЕМ ФОН СО ЗВЕЗДАМИ !!! */}
                <TwinklingStarsGrid />
                <CategoryProvider>
                    <div className="flex flex-col h-[100%]">
                        <Header />
                        <div className="flex-1 justify-self-center self-center max-w-[1260px] flex justify-center items-center mx-auto w-full mt-[20px] md:mt-[30px]">
                            {children}
                        </div>
                        <Footer />
                    </div>
                </CategoryProvider>
            </body>
        </html>
    );
}
