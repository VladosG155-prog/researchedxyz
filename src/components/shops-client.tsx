'use client';
import { createColumnHelper, ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import shopsData from '../../data/accshop.json'; // Обновленный путь
import CategoriesLayout from '../app/categories/layout'; // Обновленный путь
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import Image from 'next/image';
import PromoPopup from '@/components/promo-popup';
import Tooltip from '@/components/tooltip';
import { useRouter, usePathname } from 'next/navigation';
import { TopPlace } from '@/components/top-place';
import { getAccShopsPromocodes } from '@/utils/get-promocodes';
import { getCategoriesFilter, getCategoriesItemsFilter } from '@/utils/get-accShops-filters';
import { Filter } from '@/components/filter';
import { ClearFilters } from '@/components/clear-filters';
import { getUniquePayments } from '@/utils/get-payments';
import { ProductsModal } from '@/components/products-modal';
import useIsMobile from '@/hooks/useIsMobile';
import { trackUmamiEvent } from '@/lib/umami';

const dataNew = Object.entries(shopsData.Data.accountStores.tools);
const accShops = getAccShopsPromocodes();

// Определяем тип для промокода, совпадающий с ожидаемым типом в PromoPopup
type PromocodeInfoType = {
    popupText: string; // Сделаем обязательным
    buttonName: string; // Сделаем обязательным
    promoCode: string; // Сделаем обязательным
    link: string; // Сделаем обязательным
};

// Определяем базовый тип для данных магазина аккаунтов
// (основываясь на использовании и ошибках линтера)
interface ShopData {
    productsByCategory: { [key: string]: string };
    support: string;
    sell: string;
    payment: { name: string; icon: string }[];
    referral?: string; // Допущение, что может отсутствовать
    link: string;
    icon: string;
    bestPrice?: string; // Допущение, что может отсутствовать
}

export function ShopsClient() {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    // Инициализируем пустым объектом, но приводим к Partial для безопасности
    const [openedPromocode, setOpenedPromocode] = useState<Partial<PromocodeInfoType>>({});
    const [activeCategory, setActiveCategory] = useState('');
    const [activeCategoryItem, setActiveCategoryItem] = useState('');
    const [payment, setPayment] = useState('');

    const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // Уточняем тип
    const [isOpenProductModal, setIsOpenProductModal] = useState(false);

    const isMobile = useIsMobile();

    const router = useRouter();
    const pathname = usePathname();

    const mappedData = useMemo(() => {
        let data = dataNew.map((elem) => {
            const [key, shopData] = elem as [string, ShopData]; // Применяем тип ShopData
            return {
                id: key,
                bestPrice: shopData.bestPrice || '', // Обрабатываем возможное отсутствие bestPrice
                support: shopData.support,
                icon: shopData.icon,
                link: shopData.link,
                categories: Object.keys(shopData.productsByCategory || {}), // Добавляем проверку на null/undefined
                payments: shopData.payment || [], // Добавляем проверку
                products: shopData.productsByCategory && typeof shopData.productsByCategory === 'object'
                    ? Object.values(shopData.productsByCategory).flatMap((item: any) => typeof item === 'string' ? item.trim().split(',').map(s => s.trim()).filter(Boolean) : []) // Добавим trim и filter
                    : [],
                promocodeInfo: accShops?.find((item) => item[0] === key),
                // children: [...(shopData.payment || [])], // Похоже, children не используется, payments достаточно?
                sell: shopData.sell
            };
        });

        if (activeCategory) {
            data = data.filter((elem) => elem.categories.includes(activeCategory));
        }

        if (activeCategoryItem) {
            data = data.filter((elem) => elem.products.includes(activeCategoryItem));
        }

        if (payment) {
            data = data.filter((item) => Array.isArray(item.payments) && item.payments.some((pay) => pay.name === payment)); // Проверка на массив
        }

        return data;
    }, [activeCategory, activeCategoryItem, payment]);

    const columnHelper = createColumnHelper<any>();

    const toggleModal = () => {
        setIsOpenModal((prev) => !prev);
    };

    const handleVisitClick = (link: string, serviceId: string) => {
        trackUmamiEvent('service_click', {
            service: serviceId,
            category: 'shops',
            url: link,
            pagePath: pathname
        });
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Сервис',
                size: 250,
                cell: ({ row }) => {
                    return (
                        <div>
                            {row.original.id === 'Dark Store' && (
                                <p className="text-[10px] mb-4 bg-[#D06E31] text-center px-2 absolute left-0 top-0">
                                    Лучший магазин для всех целей
                                </p>
                            )}
                            {row.original.id === 'Discord-accounts' && (
                                <p className="text-[10px] mb-4 bg-[#D06E31] text-center px-2 absolute left-0 top-0">
                                    Лучший магазин для Discord&apos;ов
                                </p>
                            )}
                            <div className={`flex items-center gap-3 ${row.original.id === 'Discord-accounts' ? 'pt-5' : ''}`}>
                                {row.original.icon && (
                                    <Image
                                        width={25}
                                        height={25}
                                        src={row.original.icon}
                                        alt={row.original.id}
                                        className="object-contain rounded-[3px]"
                                        unoptimized={true}
                                    />
                                )}
                                <span className="text-white flex-grow">{row.original.id}</span>
                            </div>

                            {/* Проверяем наличие promocodeInfo и его второго элемента */}
                            {row.original?.promocodeInfo && row.original.promocodeInfo[1] && (
                                <button className="ml-10 flex items-center  bg-[#DEDEDE] mt-3 cursor-pointer p-[3px]">
                                    <span
                                        className="font-normal text-[12px] text-black "
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleModal();
                                            // Приводим тип при установке состояния, убедившись что все поля есть
                                            const promo = row.original.promocodeInfo[1];
                                            if (promo.popupText && promo.buttonName && promo.promoCode) { // Доп. проверка
                                                 setOpenedPromocode({ ...promo, link: row.original.link } as PromocodeInfoType);
                                            }
                                        }}
                                    >
                                         {/* Доступ к buttonName */}
                                        {row.original.promocodeInfo[1].buttonName}
                                    </span>
                                </button>
                            )}
                        </div>
                    );
                }
            }),
            columnHelper.accessor('sell', {
                header: 'Товары',
                size: 250,
                cell: (info) => (
                    <div className="flex flex-col">
                        {info.getValue()}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const products = Array.isArray(info.row.original.products) ? info.row.original.products : [];
                                setSelectedProducts(products);
                                setIsOpenProductModal(true);
                            }}
                            className="bg-[#121212] p-2 mt-3 cursor-pointer text-[14px] inline-block max-w-max"
                        >
                            Все товары
                        </button>
                    </div>
                )
            }),
            columnHelper.accessor('support', {
                header: 'Тех.поддержка',
                size: 100,
                cell: (info) => <span className="text-white">{info.getValue()}</span>
            }),
            columnHelper.accessor('payments', {
                header: 'Оплата',
                size: 200,
                cell: (info) => (
                    <div className="flex items-center flex-wrap">
                        {Array.isArray(info.row.original.payments) && info.row.original.payments.map((child) => (
                            <Tooltip key={child.name} position="top" content={child.name}>
                                <div className="flex items-center justify-center w-8 h-8">
                                    <Image
                                        width={20}
                                        height={20}
                                        alt={child.name}
                                        src={child.icon}
                                        className="object-contain max-w-full max-h-full"
                                    />
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                )
            })
        ],
        []
    );

    const table = useReactTable({
        data: mappedData,
        columns,
        state: {
            expanded
        },
        onExpandedChange: (newExpanded) => {
            setExpanded(newExpanded);
        },
        getRowCanExpand: () => false, // Делаем строку нерасширяемой, если children не используется
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel()
    });

    const categories = getCategoriesFilter();
    const categoriesItems = getCategoriesItemsFilter(activeCategory);

    const clearAll = () => {
        setActiveCategory('');
        setActiveCategoryItem('');
        setPayment('');
    };

    const payments = getUniquePayments(shopsData.Data.accountStores.tools);

    return (
        <CategoriesLayout title={shopsData.Data.accountStores.info.title} description={shopsData.Data.accountStores.info.description}>
            <ProductsModal
                isOpen={isOpenProductModal}
                onClose={() => setIsOpenProductModal(false)}
                products={selectedProducts}
                title="Товары"
            />
             {/* Рендерим PromoPopup только если все данные есть */}
             {isOpenModal && openedPromocode.popupText && openedPromocode.buttonName && openedPromocode.promoCode && openedPromocode.link && (
                 <PromoPopup isOpen={isOpenModal} onClose={toggleModal} info={openedPromocode as PromocodeInfoType} />
             )}

            {isMobile ? (
                <div className="flex gap-2 justify-between flex-wrap">
                    <div className="w-[48%]">
                        <Filter
                            name="Категория"
                            filters={categories}
                            selectedValue={activeCategory}
                            onChange={(val) => {
                                setActiveCategoryItem('');
                                setActiveCategory(val);
                            }}
                        />
                    </div>
                    <div className="w-[48%]">
                        <Filter filters={payments} selectedValue={payment} onChange={setPayment} name="Оплата" />
                    </div>
                    {activeCategory &&  <div className="w-[100%]">
                        <Filter
                            name="Товар"
                            filters={categoriesItems || []}
                            selectedValue={activeCategoryItem}
                            onChange={setActiveCategoryItem}
                            disabled={!activeCategory} // Блокируем, если категория не выбрана
                        />
                    </div>
                    }

                </div>
            ) : (
                 <div className="flex gap-2 flex-wrap">
                    <Filter
                        name="Категория"
                        filters={categories}
                        selectedValue={activeCategory}
                        onChange={(val) => {
                            setActiveCategoryItem('');
                            setActiveCategory(val);
                        }}
                    />
                    {activeCategory && (
                        <Filter
                            name="Товар"
                            filters={categoriesItems || []}
                            selectedValue={activeCategoryItem}
                            onChange={setActiveCategoryItem}
                        />
                    )}
                     <Filter filters={payments} selectedValue={payment} onChange={setPayment} name="Оплата" />
                 </div>
             )}
            {(activeCategory || activeCategoryItem || payment) && (
                <div className="mt-2">
                    <ClearFilters onClear={clearAll} />
                </div>
            )}
            <div className="py-2 md:py-6">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-[#121212]">
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="p-3 text-left text-[#7E7E7E] first: last:-r-md"
                                            style={{ width: header.getSize() }}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <tr className="hover:bg-[#333333] cursor-pointer bg-[#282828] -md relative">
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                onClick={() => {
                                                    if (cell.column.id !== 'id' && cell.column.id !== 'sell' && row.original.link) {
                                                         handleVisitClick(row.original.link, row.original.id);
                                                    }
                                                }}
                                                key={cell.id}
                                                className="p-3 first: last:-r-md"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {table.getRowModel().rows.map((row) => (
                        <div
                            key={row.id}
                            className="bg-[#282828] p-4 cursor-pointer hover:bg-[#333333] transition-colors"
                            onClick={() => {
                                if (row.original.link) {
                                     handleVisitClick(row.original.link, row.original.id);
                                }
                            }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    {row.original.icon && (
                                        <Image
                                            width={30} // Slightly larger for mobile
                                            height={30}
                                            src={row.original.icon}
                                            alt={row.original.id}
                                            className="object-contain rounded"
                                            unoptimized={true}
                                        />
                                    )}
                                    <span className="text-white text-lg font-medium">{row.original.id}</span>
                                </div>
                                {/* Optional: Add expand button if needed later */}
                            </div>

                             <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div>
                                     <h4 className="text-[#7E7E7E] text-sm mb-1">Товары</h4>
                                     <p className="text-white text-sm truncate">{row.original.sell}</p>
                                     <button
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             const products = Array.isArray(row.original.products) ? row.original.products : [];
                                             setSelectedProducts(products);
                                             setIsOpenProductModal(true);
                                         }}
                                         className="text-[#DEDEDE] text-xs mt-1 hover:underline flex items-center gap-1"
                                     >
                                          <Eye size={14}/> Все товары
                                     </button>
                                 </div>
                                 <div>
                                     <h4 className="text-[#7E7E7E] text-sm mb-1">Тех.поддержка</h4>
                                     <p className="text-white text-sm">{row.original.support}</p>
                                 </div>
                             </div>

                            <div>
                                <h4 className="text-[#7E7E7E] text-sm mb-2">Оплата</h4>
                                <div className="flex items-center flex-wrap gap-2">
                                     {Array.isArray(row.original.payments) && row.original.payments.map((child) => (
                                        <Tooltip key={child.name} position="top" content={child.name}>
                                             <div className="flex items-center justify-center w-6 h-6">
                                                <Image
                                                    width={18}
                                                    height={18}
                                                    alt={child.name}
                                                    src={child.icon}
                                                    className="object-contain max-w-full max-h-full"
                                                />
                                            </div>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>

                             {row.original?.promocodeInfo && row.original.promocodeInfo[1] && (
                                <button className="flex items-center bg-[#DEDEDE] mt-4 cursor-pointer p-2 w-full justify-center">
                                    <span
                                        className="font-medium text-sm text-black"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleModal();
                                            // Приводим тип при установке состояния
                                            const promo = row.original.promocodeInfo[1];
                                            if (promo.popupText && promo.buttonName && promo.promoCode) {
                                                 setOpenedPromocode({ ...promo, link: row.original.link } as PromocodeInfoType);
                                            }
                                        }}
                                    >
                                         {/* Используем buttonName или дефолтное значение */}
                                         {row.original.promocodeInfo[1].buttonName || 'Промокод'}
                                     </span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </CategoriesLayout>
    );
}