'use client';
import {
    createColumnHelper,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import antikiData from '../../data/antiki.json'; // Обновленный путь
import rsScoreData from '../../data/RS_Score_Antidetect.json'; // Обновленный путь
import CategoriesLayout from '../app/categories/layout'; // Обновленный путь
import { ChevronDown, ChevronUp, FilterIcon, Gift, Info, Smartphone, SortAsc, SortDesc } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import Image from 'next/image';
import PromoPopup from '@/components/promo-popup';
import Tooltip from '@/components/tooltip';
import { useRouter, usePathname } from 'next/navigation';
import Score from '@/components/score';
import { getAntikPromocodes } from '@/utils/get-promocodes';
import { TopPlace } from '@/components/top-place';
import { Filter } from '@/components/filter';
import { getUniquePayments } from '@/utils/get-payments';
import Modal from '@/components/modal';
import useIsMobile from '@/hooks/useIsMobile';
import { ClearFilters } from '@/components/clear-filters';
import { trackUmamiEvent } from '@/lib/umami';

const dataNew = Object.entries(antikiData.Data.antiki.tools);
const antiikiCodes = getAntikPromocodes();

// Определяем тип для infoPromocode, чтобы исправить ошибку TS
type PromocodeInfo = {
    popupText: string;
    buttonName: string;
    promoCode: string;
    link: string;
};

interface AntidetectClientProps {
    data: any[];
}

export function AntidetectClient({ data }: AntidetectClientProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [sorting, setSorting] = useState<any[]>([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [infoPromocode, setInfoPromocode] = useState<Partial<PromocodeInfo>>({});
    const [payment, setPayment] = useState('');
    const [sortColumn, setSortColumn] = useState('');
    const isMobile = useIsMobile();
    const [isOpenSPWYModal, setIsOpenSPWYModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const mappedData = useMemo(() => {
        let processedData = data.map((elem) => {
            const [key, data] = elem;
            const breachDescription = data.breachHistory && data.breachHistory.length > 0 ? data.breachHistory[0].description : '';
            return {
                id: key,
                pricePerProfile: data.pricePerProfile,
                price: data.price,
                support: data.support,
                priceSortIndex: data.priceSortIndex,
                fraudscore: rsScoreData.find((item) => item.name === key)?.overall || '-',
                fraudData: rsScoreData.find((item) => item.name === key) || {},
                freeProfiles: data.freeProfiles,
                children: isMobile
                    ? [
                          { name: 'Оплата', content: [...data.payment], colSpan: 1 },
                          { name: 'Бесплатные профиля', content: data.freeProfiles, colSpan: 1 },
                          { name: 'Случаи взломов', colSpan: 1, content: breachDescription },
                          { name: 'Фичи', content: data.browserFeatures, colSpan: 2 }
                      ]
                    : [
                          { name: 'Оплата', content: [...data.payment], colSpan: 1 },
                          { name: 'Фичи', content: data.browserFeatures, colSpan: 1 },
                          { name: 'Случаи взломов', colSpan: 1, content: breachDescription },
                          { name: 'Бесплатные профиля', content: data.freeProfiles, colSpan: 2 }
                      ],
                payment: data.payment,
                promocodeInfo: antiikiCodes?.find((item) => item[0] === key),
                icon: data.icon,
                link: data.link
            };
        });

        if (payment) {
            processedData = processedData.filter((elem) => elem.payment.some((pay) => pay.name === payment));
        }
        return processedData;
    }, [data, payment, isMobile]);

    const columnHelper = createColumnHelper<any>();

    const toggleModal = () => {
        setIsOpenModal((prev) => !prev);
    };

    // Функция для трекинга и открытия ссылки
    const handleVisitClick = (link: string, serviceId: string) => {
        trackUmamiEvent('service_click', {
            service: serviceId,
            category: 'antidetect',
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
                enableSorting: false,
                cell: ({ row }) => {
                    return (
                        <div className="relative">
                            <div className="flex items-center gap-3">
                                {!sorting?.length && row.index <= 2 && <TopPlace place={row.index + 1} />}
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
                                <span className="text-white">{row.original.id}</span>
                                {row.original.id === 'GeeLark' && (
                                    <Tooltip content="облачные телефоны">
                                        <Smartphone />
                                    </Tooltip>
                                )}
                            </div>
                            {row.original?.promocodeInfo && row.original?.promocodeInfo[1] && (
                                <button className="ml-10 flex items-center  bg-[#DEDEDE] mt-3 cursor-pointer p-[3px]">
                                    <span
                                        className="font-normal text-[12px] text-black "
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleModal();
                                            setInfoPromocode({ ...row.original.promocodeInfo[1], link: row.original.link } as PromocodeInfo);
                                        }}
                                    >
                                        {row.original?.promocodeInfo[1] && row.original.promocodeInfo[1].buttonName}
                                    </span>
                                </button>
                            )}
                        </div>
                    );
                }
            }),
            columnHelper.accessor('price', {
                header: 'Цена',
                size: 200,
                enableSorting: true,
                sortDescFirst: true,
                cell: (info) => <span className="text-white">{info.getValue()}</span>,
                sortingFn: (rowA, rowB) => {

                    const parsePrice = (val: any) => {
                        const cleaned = String(val).replace(/[^\d.-]/g, '');
                        return parseFloat(cleaned);
                    };

                    const a = parsePrice(rowA.original.priceSortIndex);
                    const b = parsePrice(rowB.original.priceSortIndex);

                    if (isNaN(a) && isNaN(b)) return 0;
                    if (isNaN(a)) return -1;
                    if (isNaN(b)) return 1;

                    return a - b;
                }
            }),
            columnHelper.accessor('pricePerProfile', {
                header: 'Цена за профиль',
                size: 200,
                enableSorting: true,
                sortDescFirst: true,
                cell: (info) => <span className="text-white">{info.getValue()}</span>,
                sortingFn: (rowA, rowB) => {
                    const parsePrice = (val: any) => {
                        const cleaned = String(val).replace(/[^\d.-]/g, '');
                        return parseFloat(cleaned);
                    };

                    const a = parsePrice(rowA.original.priceSortIndex);
                    const b = parsePrice(rowB.original.priceSortIndex);

                    if (isNaN(a) && isNaN(b)) return 0;
                    if (isNaN(a)) return -1;
                    if (isNaN(b)) return 1;

                    return a - b;
                }
            }),


            columnHelper.accessor('fraudscore', {
                header: 'Researched score',
                size: 200,
                cell: ({ row }) => (
                    <div className="w-full">
                        {row.original.id === 'GeeLark' ? (
                            <Tooltip content="На облачные телефоны researched score не распространяется">
                                <Smartphone />
                            </Tooltip>
                        ) : (
                            <Score totalScore={row.original.fraudscore} data={row.original.fraudData} />
                        )}
                    </div>
                ),
                enableSorting: true,
                sortDescFirst: true
            }),
            columnHelper.display({
                id: 'expand',
                header: '',
                size: 50,
                cell: ({ row }) => {
                    const canExpand = !!row.original.children;
                    return (
                        <button
                            onClick={(e) => {
                                row.toggleExpanded();
                                e.stopPropagation();
                            }}
                            disabled={!canExpand}
                            className={`p-1 text-white h-[50px] w-[50px] ${
                                canExpand ? 'cursor-pointer hover:text-gray-300' : 'cursor-default opacity-50'
                            }`}
                        >
                            {row.getIsExpanded() ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    );
                }
            })
        ],
        [sorting]
    );

    const table = useReactTable({
        data: mappedData,
        columns,
        state: {
            expanded,
            sorting
        },
        onExpandedChange: (newExpanded) => {
            setExpanded(newExpanded);
        },
        onSortingChange: setSorting,
        getRowCanExpand: (row) => !!row.original.children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    // ВОЗВРАЩАЕМ оригинальный вызов getUniquePayments без преобразования
    const paymentsFilters = getUniquePayments(antikiData.Data.antiki.tools);

    // ВОЗВРАЩАЕМ оригинальное определение sortColumns без типа FilterOption и с оригинальными realValue
    const sortColumns = [
        { name: 'Цена (сначала дорогая)', value: 'priceDesc', realValue: 'price', desc: true },
        { name: 'Цена (сначала дешевая)', value: 'priceAsc', realValue: 'price', desc: false },
        { name: 'Цена за профиль (сначала дорогая)', value: 'pricePerProfileDesc', realValue: 'price', desc: true }, // Оригинальный realValue
        { name: 'Цена за профиль (сначала дешевая)', value: 'pricePerProfileAsc', realValue: 'price', desc: false }, // Оригинальный realValue
        { name: 'Researched score (сначала больше)', value: 'fraudscoreDesc', realValue: 'fraudscore', desc: true },
        { name: 'Researched score (сначала меньше)', value: 'fraudscoreAsc', realValue: 'fraudscore', desc: false }
    ];

    const handleSortColumnChange = (value) => {
        setSortColumn(value);

        const val = sortColumns.find((sort) => sort.name === value);
        if (val) {
            setSorting([{ id: val.realValue, desc: val.desc }]);
        } else {
            setSorting([]);
        }
    };

    const clearFilters = () => {
        setPayment('');
        setSorting([]);
        setSortColumn('');
    };

    // Исправляем ошибку линтера с индексом 'false'
    const getSortIcon = (isSorted: 'asc' | 'desc' | false) => {
        if (isSorted === 'asc') return <SortAsc className="w-4 h-4" />;
        if (isSorted === 'desc') return <SortDesc className="w-4 h-4" />;
        return <FilterIcon className="w-4 h-4" />;
    };


    return (
        <CategoriesLayout title={antikiData.Data.antiki.info.title} description={antikiData.Data.antiki.info.description}>
            {
                <Modal isOpen={isOpenSPWYModal} title="swSpyBrowser" onClose={() => setIsOpenSPWYModal(false)}>
                    <p>Нужно оплачивать по одной ссылке</p>

                    <div className="flex justify-center items-center gap-3">
                        <button
                            className="mt-4 text-start bg-[#121212] inline-block max-w-max p-4 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVisitClick('Оплата со скидкой', 'swSpyBrowser-payment');
                            }}
                        >
                            Перейти
                        </button>
                        <button
                            className="mt-4 text-start bg-[#121212] inline-block max-w-max p-4 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVisitClick('Сайт антика', 'swSpyBrowser-manager');
                            }}
                        >
                            Менеджер
                        </button>
                    </div>
                </Modal>
            }

            {isOpenModal && infoPromocode.link && <PromoPopup isOpen={isOpenModal} onClose={toggleModal} info={infoPromocode as PromocodeInfo} />}
            {!isMobile && <Filter filters={paymentsFilters} selectedValue={payment} onChange={setPayment} name="Оплата" />}

            {isMobile && (
                <div className="mt-2 flex items-center gap-2">
                    <Filter filters={paymentsFilters} selectedValue={payment} onChange={setPayment} name="Оплата" />
                    <Filter
                        filters={sortColumns}
                        selectedValue={sortColumn}
                        onChange={handleSortColumnChange}
                        name="Сортировка"
                        isSorting={true}
                        showSearch={false}
                    />
                </div>
            )}
            <div className="mt-2">{(payment || sortColumn.length > 0) && <ClearFilters onClear={clearFilters} />}</div>
            <div className="py-2 md:py-6">
                <div className="hidden md:block">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-[#121212]">
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`p-3 text-left text-[#7E7E7E] first: last:-r-md ${
                                                header.column.getCanSort() ? 'cursor-pointer' : ''
                                            }`}
                                            style={{ width: header.getSize() }}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span>{getSortIcon(header.column.getIsSorted())}</span>
                                                )}
                                                {header.id === 'price' && (
                                                    <Tooltip content="Мы взяли цену на тариф с 10 профилями. Если такого нет, то другой мин. тариф.">
                                                        <Info />
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <tr
                                        className="hover:bg-[#333333] cursor-pointer bg-[#282828] -md"
                                        onClick={() => {
                                            if (row.original.id === 'swSpyBrowser') {
                                                setIsOpenSPWYModal(true);
                                                return;
                                            }
                                            if (row.original.link) {
                                                handleVisitClick(row.original.link, row.original.id);
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="p-3 first: last:-r-md align-middle"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                    {row.getIsExpanded() && row.original.children && (
                                        <tr className="bg-[#303030] align-start relative -top-[11px]">
                                            {row.original.children.map((child, index) => {
                                                if (!child.name) return null;
                                                const content = child.content || '';
                                                const data = child.content;
                                                const finalData = Array.isArray(content)
                                                    ? data.map((item) => (
                                                          <Tooltip key={item.name} content={item.name}>
                                                              <Image
                                                                  className="w-[20px] h-[20px]"
                                                                  alt={item.name}
                                                                  width={20}
                                                                  height={20}
                                                                  src={item.icon}
                                                              />
                                                          </Tooltip>
                                                      ))
                                                    : data;
                                                return (
                                                    <td
                                                        key={child.name}
                                                        colSpan={child.colSpan}
                                                        className="p-3 align-top"
                                                    >
                                                        <div key={index} className="flex flex-col">
                                                            <h4 className="font-medium mb-2 text-[#7E7E7E]">{child.name}</h4>
                                                            {Array.isArray(child.content) ? (
                                                                <div className="flex gap-3 flex-wrap">{finalData}</div>
                                                            ) : (
                                                                <div className="gap-3 text-white" dangerouslySetInnerHTML={{ __html: data || '—' }}></div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-4">
                    {table.getRowModel().rows.map((row) => (
                        <div
                            key={row.id}
                            className="bg-[#282828] p-4 cursor-pointer hover:bg-[#333333] transition-colors"
                            onClick={() => {
                                if (row.original.id === 'swSpyBrowser') {
                                    setIsOpenSPWYModal(true);
                                    return;
                                }
                                if (row.original.link) {
                                    handleVisitClick(row.original.link, row.original.id);
                                }
                            }}
                        >
                            <div className="flex justify-between items-center pb-[3px]">
                                <div className="w-full">
                                    <div className="relative flex items-center gap-3 justify-between">
                                        <div className="flex gap-2 items-center">
                                            {!sorting?.length && row.index <= 2 && <TopPlace place={row.index + 1} />}
                                            {row.original.icon && (
                                                <Image
                                                    width={20}
                                                    height={20}
                                                    src={row.original.icon}
                                                    alt={row.original.id}
                                                    className="object-contain rounded-[3px]"
                                                />
                                            )}
                                            <span className="text-white text-base">{row.original.id}</span>
                                            {row.original.id === 'GeeLark' && (
                                                <Tooltip content="облачные телефоны">
                                                    <Smartphone className="w-5 h-5 text-white" />
                                                </Tooltip>
                                            )}
                                        </div>
                                        {row.original.children && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    row.toggleExpanded();
                                                }}
                                                className="p-2 text-white hover:text-gray-300 transition-colors"
                                                aria-label={row.getIsExpanded() ? 'Свернуть' : 'Развернуть'}
                                                aria-expanded={row.getIsExpanded()}
                                            >
                                                {row.getIsExpanded() ? (
                                                    <ChevronUp className="w-6 h-6" />
                                                ) : (
                                                    <ChevronDown className="w-6 h-6" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-[30%_30%_30%] justify-between w-full mt-3 items-center">
                                        <div className="flex flex-col gap-1 min-h-[60px]">
                                            <span className="text-[#7E7E7E] text-[12px]">RS score:</span>
                                            <div className="mt-2">
                                                {row.original.id === 'GeeLark' || row.original.id === 'MoreLogin' ? (
                                                    <Tooltip content="На облачные телефоны researched score не распространяется">
                                                        <Smartphone className="w-5 h-5 text-white" />
                                                    </Tooltip>
                                                ) : (
                                                    <Score totalScore={row.original.fraudscore} data={row.original.fraudData} />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 min-h-[60px]">
                                            <span className="text-[#7E7E7E] text-[12px]">Цена:</span>
                                            <span className="text-[12px] mt-2">{row.original.price}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 min-h-[60px]">
                                            <span className="text-[#7E7E7E] text-[12px]">Цена за профиль:</span>
                                            <span className="text-[12px] mt-2">{row.original.pricePerProfile}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {row.getIsExpanded() && row.original.children && (
                                <div
                                    className="mt-4 space-y-4 animate-slideDown grid grid-cols-[48%_48%] justify-between w-full items-start"
                                    style={{
                                        animation: row.getIsExpanded() ? 'slideDown 0.3s ease-in-out' : 'slideUp 0.3s ease-in-out'
                                    }}
                                >
                                    {row.original.children.map((child, index) => {
                                        if (!child.name) return null;
                                        const content = child.content || '';
                                        const finalData = Array.isArray(content) ? (
                                            content.map((item) => (
                                                <Tooltip key={item.name} content={item.name}>
                                                    <Image
                                                        className="w-5 h-5 object-contain"
                                                        alt={item.name}
                                                        width={20}
                                                        height={20}
                                                        src={item.icon}
                                                    />
                                                </Tooltip>
                                            ))
                                        ) : (
                                            <span className="text-white text-[12px] break-after-auto" dangerouslySetInnerHTML={{ __html: content }}></span>
                                        );
                                        return (
                                            <div key={index} className="flex flex-col justify-between">
                                                <h4 className="text-[#7E7E7E] text-[12px] mb-2">{child.name}</h4>
                                                <div className="flex gap-3 flex-wrap">{finalData}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {row.getIsExpanded() && row.original?.promocodeInfo && row.original?.promocodeInfo[1] && (
                                <div className="flex items-center gap-[20px] mt-3">
                                    <span className="text-[14px]">
                                        {' '}
                                        {row.original?.promocodeInfo[1] && row.original.promocodeInfo[1].buttonName}
                                    </span>
                                    <button className="flex items-center bg-[#DEDEDE] cursor-pointer p-[6px]">
                                        <span
                                            className="font-normal text-[12px] text-black"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleModal();
                                                setInfoPromocode({ ...row.original.promocodeInfo[1], link: row.original.link } as PromocodeInfo);
                                            }}
                                        >
                                            ПОКАЗАТЬ
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </CategoriesLayout>
    );
}

// Оставляем экспорт по умолчанию, если он где-то используется, но основной экспорт теперь именованный
// export default AntidetectClient; // Можно убрать, если не используется