'use client';
import type React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function RsScoreProxyClient() {
    useEffect(() => {
        window.scroll(0, 0);
    }, []);
    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen text-white p-4 sm:p-6 md:p-8 relative pb-[200px]"
        >
            <div className="bg-[#232323] shadow-xl mt-4 mb-12 max-w-5xl mx-auto p-0 md:px-8 md:py-10">
                <div
                    className="max-w-[760px] mx-auto px-4 sm:px-0 py-4 antialiased font-normal break-words leading-relaxed"
                    style={{
                        color: '#f5f5f5',
                        fontFamily: 'Inter, \"Helvetica Neue\", Helvetica, sans-serif',
                        fontSize: '17px',
                        fontWeight: 400,
                        minHeight: '100vh'
                    }}
                >
                    <h1 className="mb-8 leading-tight no-wrap" style={{ fontSize: '38px', fontWeight: 700, fontFamily: 'Inter, \"Helvetica Neue\", Helvetica, sans-serif' }}>Researched Proxy Score</h1>
                    <p className="mb-6">Привет, друг. Мы давно работаем с мультиаккаунтингом и отлично понимаем, насколько важно использовать качественные прокси. Поэтому мы разработали собственную систему оценки — Researched Proxy Score.</p>
                    <p className="mb-6">Эту систему мы разработали в коллаборации с 40+ экспертами по анонимности — среди них фаундеры и технические специалисты ведущих прокси-сервисов. После десятков итераций и улучшений Researched Proxy Score стал точным и прикладным инструментом.</p>

                    <h2 className="mt-10 mb-5 no-wrap" style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'Inter, \"Helvetica Neue\", Helvetica, sans-serif' }}>Типы прокси</h2>
                    <p className="mb-4">На нашем сайте предоставлено 3 типа прокси:</p>
                    <ul className="list-disc list-inside space-y-2 mb-6 text-gray-200 marker:text-gray-400">
                        <li><strong>Статичные</strong> — закреплены за конкретным устройством или сервером и не меняются при перезапуске сессии. Чаще всего это IP из дата-центров или от провайдеров с постоянной связью. Идеальны, когда важно сохранить стабильный IP на долгий срок. Оплата происходит за время пользования, чаще всего продаются по тарифу 1 IP / 1 месяц.</li>
                        <li><strong>Мобильные</strong> — выданы сотовым операторам и используются через мобильную сеть. Особенно отличаются частой сменой IP (каждые N минут или через отправление запроса). Идеальны, когда нужно сделать множество действий через 1 поток.</li>
                        <li><strong>Резидентские</strong> — принадлежат реальным пользователям и выходят в интернет через их домашние устройства (роутеры, компьютеры, телевизоры и т.д.). Особенностью является возможность сгенерировать тысячи уникальных прокси, а оплата происходит за потраченный трафик. Такие IP выглядят максимально естественно и хорошо подходят для обхода.</li>
                    </ul>
                    <p className="mb-6">Для резидентских и статичных прокси мы используем 7 проверок, для мобильных — 5. Каждая из них оценивается по шкале до 10 баллов. То есть "сырое" максимальное значение составляет 70 баллов для статичных и резидентских, и 50 баллов для мобильных.</p>
                    <p className="mb-6">Чтобы не путать пользователей разными шкалами, мы привели все оценки к единой системе с максимумом 90 баллов — вне зависимости от количества проверок.</p>
                    <div className="border-l-4 border-yellow-400 bg-white/10 p-4 sm:p-6 my-8 text-base sm:text-lg mb-8" style={{ fontSize: '17px', fontFamily: 'Inter, \"Helvetica Neue\", Helvetica, sans-serif', fontWeight: 400 }}>
                        <strong className="block mb-2 no-wrap" style={{ fontSize: '20px', fontWeight: 600 }}>Важно</strong>
                        <span>Не стоит напрямую сравнивать баллы между разными типами (например, мобильный прокси с 84 баллами и статичный с 82) — это разные условия, разные требования и разные формулы.</span>
                    </div>
                    <p className="mb-6">Также стоит учитывать, что часть проверок отличается по логике начисления баллов — в зависимости от того, о каком типе прокси идёт речь. Эти отличия мы подробно указали в каждом разделе.</p>

                    <h2 className="mt-10 mb-5 no-wrap" style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'Inter, \"Helvetica Neue\", Helvetica, sans-serif' }}>Критерии оценки</h2>
                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>1. Fraud Score</h3>
                    <p className="mb-2">Проверяем через <a href="https://www.ipqualityscore.com" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">ipqualityscore.com</a>, который оценивает надёжность IP-адреса по десяткам параметров: был ли замечен в спаме, автоматизации, использовании прокси, TOR, или других подозрительных действиях. Мы используем именно Fraud Score — это ключевой показатель, отражающий общий уровень риска IP.</p>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Статичные прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>Fraud Score от 0 до 20 — 10 баллов</li>
                        <li>От 21 до 50 — 7 баллов</li>
                        <li>От 51 до 74 — 4 балла</li>
                        <li>От 75 до 84 — 2 балла</li>
                        <li>От 85 до 100 — 1 балл</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Резидентские прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>Fraud Score от 0 до 29 — 10 баллов</li>
                        <li>От 30 до 60 — 4 балла</li>
                        <li>Выше 60 — 1 балл</li>
                    </ul>
                    <p className="mb-2">Шкала отличается, потому что у статичных прокси выше требования к "чистоте" IP — они чаще используются в стабильных задачах. А у резидентских допустим больший фоновый шум, так как это IP обычных пользователей, и лёгкий "мусор" в истории считается нормой.</p>
                    <p className="mb-2"><strong>Мобильные прокси:</strong> Этот параметр не используется, так как IP часто меняются, и оценка теряет смысл.</p>

                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>2. Risk Score</h3>
                    <p className="mb-2">Проверяем через <a href="https://pixelscan.net" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">pixelscan.net</a>, который выдает итоговую оценку от 0 до 100. Можно сравнить с Fraud Score, но это не совсем одно и то же.</p>
                    <ul className="list-disc list-inside space-y-2 mb-2 text-gray-200 marker:text-gray-400">
                        <li>Fraud Score — это история IP (спам, TOR, abuse).</li>
                        <li>Risk Score — это поведение трафика здесь и сейчас: фингерпринт, DNS, WebRTC, Canvas, таймзона, следы автоматизации.</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Статичные прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>0–20 — 10 баллов</li>
                        <li>21–50 — 7 баллов</li>
                        <li>51–80 — 4 балла</li>
                        <li>81–100 — 1 балл</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Резидентские прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>0–29 — 10 баллов</li>
                        <li>30–50 — 3 балла</li>
                        <li>51+ — 1 балл</li>
                    </ul>
                    <p className="mb-2">Шкала опять немного различает по той же причине: статичные прокси должны быть максимально "чистыми", а резидентским допустим больший шум — это норма для их среды.</p>
                    <p className="mb-2"><strong>Мобильные прокси:</strong> Этот параметр не используется, так как IP часто меняются, и оценка теряет смысл.</p>

                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>3. Утечки DNS</h3>
                    <p className="mb-2">Проверяем на <a href="https://dnsleaktest.com" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">dnsleaktest.com</a>. Смотрим, совпадают ли IP прокси и DNS-серверов по стране и количеству.</p>
                    <p className="mb-2">Если IP из одной страны, а DNS из другой — сайты (особенно банки, биржи и дропы) это легко фиксируют как несоответствие и могут снизить траст или выдать капчу.</p>
                    <p className="mb-2"><strong>Баллы для всех типов прокси:</strong></p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>Один DNS, полностью совпадает с IP — 10 баллов</li>
                        <li>DNS из той же страны, но провайдер отличается — 6 баллов</li>
                        <li>DNS из другой страны или микс из нескольких — 1 балл</li>
                    </ul>

                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>4. Надежность типа сети</h3>
                    <p className="mb-2">Проверяем через <a href="https://ipinfo.io" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">ipinfo.io</a>. Смотрим, какому типу провайдера принадлежит IP:</p>
                    <ul className="list-disc list-inside space-y-2 mb-2 text-gray-200 marker:text-gray-400">
                        <li><strong>ISP</strong> — обычный провайдер (домашний интернет, мобильная сеть). Считается максимально надёжным.</li>
                        <li><strong>Residential</strong> — реальный пользовательский IP, но доступ через P2P или SDK. Выглядит естественно, допускается лёгкий "шум".</li>
                        <li><strong>Hosting</strong> — дата-центр или облачный сервер. Часто ассоциируется с ботами и автоматизацией, антифродом воспринимается с подозрением.</li>
                        <li><strong>Business</strong> — корпоративные сети. Не так токсично, как хостинг, но для мультиаккаунтинга — слабый вариант.</li>
                        <li><strong>Edu</strong> — университетские сети. В реальных юзер-сценариях почти не встречаются, выглядят странно.</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Статичные прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>ISP — 10 баллов</li>
                        <li>Residential — 9 баллов</li>
                        <li>Business — 7 баллов</li>
                        <li>Edu — 6 баллов</li>
                        <li>Hosting — 5 баллов</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Резидентские прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>ISP / Residential — 10 баллов</li>
                        <li>Business / Edu — 2 балла</li>
                        <li>Hosting — 1 балл</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Мобильные прокси</h4>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>ISP — 10 баллов</li>
                        <li>Residential — 9 баллов</li>
                        <li>Hosting / Business / Edu — 1 балл</li>
                    </ul>
                    <p className="mb-2">Hosting / Business / Edu снижает траст везде. Но для статичных это приемлемый риск, а для резидентских и мобильных — критическая ошибка, потому что они пытаются маскироваться под реального пользователя, и несоответствие типа сети ломает всю маскировку.</p>

                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>5. Пинг</h3>
                    <p className="mb-2">Проверяем через <a href="https://speedtest.net" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">speedtest.net</a>. Смотрим задержку до ближайшего сервера. Чем ниже пинг — тем быстрее загружаются страницы, авторизуются аккаунты и обрабатываются запросы. Высокий пинг может выдать нестабильное соединение или отдалённость IP от гео-цели.</p>
                    <p className="mb-2"><strong>Баллы для всех типов прокси:</strong></p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>Менее 50 мс — 10 баллов</li>
                        <li>От 50 до 100 мс — 7 баллов</li>
                        <li>Более 100 мс — 4 балла</li>
                    </ul>

                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>6. Потеря пакетов</h3>
                    <p className="mb-2">Проверяем через <a href="https://browserleaks.com/ip" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">browserleaks.com/ip</a>, в разделе MTU. Анализируем, какой максимальный размер IP-пакета передаётся без фрагментации. Слишком низкое или нестандартное значение может говорить о кривом туннеле, нестабильной сети или неправильной настройке прокси.</p>
                    <p className="mb-2">MTU — это максимальный размер "пакета" данных, который может пройти через интернет без потерь. Представь, что ты отправляешь письмо:</p>
                    <ul className="list-disc list-inside space-y-2 mb-2 text-gray-200 marker:text-gray-400">
                        <li>обычная сеть может передать целое письмо — это MTU = 1500</li>
                        <li>а если где-то стоит плохой роутер, туннель или узкое место — письмо приходится рвать пополам — MTU снижается до 1400, 1300 и т.д.</li>
                    </ul>
                    <p className="mb-2">У нормального пользователя (дома или с телефона) — MTU почти всегда в пределах нормы (например, 1500 или 1492). А если MTU меньше обычного, сайт может заподозрить что-либо.</p>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Статичные прокси</h4>
                    <p className="mb-2">Они работают через дата-центры, где стандарт — 1500 байт. Если меньше — это уже "ломаная" настройка, туннель или нестабильная сеть. А если больше — это вообще техническая аномалия. Поэтому у статиков жёсткое требование: только 1500 = норма.</p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>Ровно 1500 байт — 10 баллов</li>
                        <li>Менее 1500 — 4 балла</li>
                        <li>Более 1500 — 2 балла</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Резидентские прокси</h4>
                    <p className="mb-2">Они подключаются через домашние устройства, где стандарт варьируется от 1492 до 1500 в зависимости от провайдера. Поэтому этот диапазон считается нормой, и мы принимаем его как максимальный балл.</p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>От 1492 до 1500 байт — 10 баллов</li>
                        <li>Остальное — 4 балла</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Мобильные прокси</h4>
                    <p className="mb-2">Работают через сотовые сети, где MTU часто ограничен операторами связи. Значения 1400–1460 — это типичный "здоровый" диапазон. У некоторых сетей он может быть чуть выше, поэтому мы делаем поблажку до 1500. Всё вне диапазона — либо нестабильность, либо кривой туннель.</p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>От 1400 до 1460 байт — 10 баллов</li>
                        <li>От 1461 до 1500 байт — 9 баллов</li>
                        <li>Вне этих диапазонов — 4 балла</li>
                    </ul>

                    <h3 className="mt-8 mb-3" style={{ fontSize: '22px', fontWeight: 600 }}>7. Скорость скачивания</h3>
                    <p className="mb-2">Проверяем через <a href="https://speedtest.net" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">speedtest.net</a>. Этот показатель отражает, насколько быстро прокси передаёт данные. Влияет на загрузку сайтов, капч, форм, видео, NFT-дропов и особенно важен при работе с антидетектом.</p>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Статичные прокси</h4>
                    <p className="mb-2">Работают через дата-центры и обязаны быть самыми быстрыми. 70+ Мбит/с — стандарт.</p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>≥70 Мбит/с — 10 баллов</li>
                        <li>50–69.9 — 9 баллов</li>
                        <li>30–49.9 — 7 баллов</li>
                        <li>20–29.9 — 6 баллов</li>
                        <li>15–19.9 — 5 баллов</li>
                        <li>10–14.9 — 3 балла</li>
                        <li>5.1–9.9 — 4 балла</li>
                        <li>≤5 — 1 балл</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Резидентские прокси</h4>
                    <p className="mb-2">Работают через домашние устройства, скорость ниже, но стабильность важнее.</p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>≥20 Мбит/с — 10 баллов</li>
                        <li>10–19.9 — 7 баллов</li>
                        <li>1.1–9.9 — 4 балла</li>
                        <li>≤1 — 1 балл</li>
                    </ul>
                    <h4 className="text-lg font-semibold mt-4 mb-2">Мобильные прокси</h4>
                    <p className="mb-2">Работают через 4G/5G, где скорость может "скакать", и 5–10 Мбит/с уже считается нормой.</p>
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-200 marker:text-gray-400">
                        <li>&gt;9.5 Мбит/с — 10 баллов</li>
                        <li>5.0–9.5 — 7 баллов</li>
                        <li>2.0–4.9 — 4 балла</li>
                        <li>&lt;2.0 — 2 балла</li>
                    </ul>

                    <h2 className="mt-10 mb-5 no-wrap" style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'Inter, \"Helvetica Neue\", Helvetica, sans-serif' }}>Рекомендации по соотношению цена/качество</h2>
                    <p className="mb-6">Для статичных прокси мы рекомендуем <a href="https://proxy-seller.io/?partner=3BYUCPMA7PLHF4" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Proxy-Seller</a>, <a href="https://px6.me/ru/?r=716957" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Proxy6</a> и <a href="https://proxys.io/?refid=244362" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Proxys.io</a> — у всех достойный Researched Score и отличные тарифы.</p>
                    <p className="mb-6">Среди резидентских прокси лучшее соотношение цены и качества снова показывает <a href="https://proxy-seller.io/?partner=3BYUCPMA7PLHF4" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Proxy-Seller</a>.</p>
                    <p className="mb-6">А для мобильных прокси лидируют <a href="https://proxy-seller.io/?partner=3BYUCPMA7PLHF4" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Proxy-Seller</a> и <a href="https://proxys.io/?refid=244362" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">Proxys.io</a>.</p>
                    <p className="mb-8">Сравнение расходников для крипты и мультиаккаунтинга — <a href="https://researched.xyz" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">researched.xyz</a>.</p>
                    <div className="w-full flex justify-center mt-12 mb-8">
                        <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-all text-base sm:text-lg rounded-none">
                            <ArrowLeft /> Сравнить другие прокси сервисы
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
} 