// Импортируем функцию redirect
import { redirect } from 'next/navigation';
import type { Metadata } from 'next'; // Добавляем импорт Metadata

// Экспортируем метаданные, скопированные с главной, но с noindex и канонической на главную
export const metadata: Metadata = {
    title: 'Расходники для мультиаккаунтинга и крипты | researched.xyz', // От главной
    description:
        'researched.xyz — агрегатор сервисов для мультиаккаунтинга. Антидетекты, прокси, боты, кошельки, CEX, OTC и т.д. Всё купили, проверили и отсортировали.', // От главной
    robots: { index: false, follow: false }, // Явный запрет индексации
    twitter: {
        card: 'summary_large_image',
        title: 'Купить расходники для мультиаккаунтинга и крипты дёшево | researched.xyz',
        description: 'researched.xyz — агрегатор сервисов для мультиаккаунтинга...',
        images: ['/og/og-preview.jpg'],
        creator: '@researchedxyz'
    },
    alternates: {
        canonical: 'https://researched.xyz/' // Канонический URL - главная страница
    },
    // Поле other с JSON-LD не копируем
};

// Основной компонент страницы (серверный)
export default function WaitPage() {
    // Выполняем немедленный редирект на главную
    redirect('/');

    // Возвращаем null или простой элемент, т.к. редирект произойдет до рендера
    // return null;
}
