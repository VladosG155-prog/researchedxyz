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
import proxyData from '../../data/mobileproxy.json';
import proxyScoreData from '../../data/RS_Score_Proxy.json';
import CategoriesLayout from '../app/categories/layout';
import { ChevronDown, ChevronUp, Eye, FilterIcon, Gift, SortAsc, SortDesc } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import Image from 'next/image';
import PromoPopup from '@/components/promo-popup';
import Tooltip from '@/components/tooltip';
import { getProxyCountries } from '@/utils/get-proxy-countries-data';
import { Filter } from '@/components/filter';
import { ClearFilters } from '@/components/clear-filters';
import { usePathname, useRouter } from 'next/navigation';
import Score from '@/components/score';
import { getMobileProxyPromocodes, getResidentialProxy } from '@/utils/get-promocodes';
import { TopPlace } from '@/components/top-place';
import { CountryPopup } from '@/components/contry-popup/country-popup';
import { getUniquePayments } from '@/utils/get-payments';
import useIsMobile from '@/hooks/useIsMobile';
import { MobileProxyFilters } from '@/components/mobile-proxy-filter';
import React from 'react';

const PROXY_FILTERS = [
    { name: 'Статические', link: 'proxy-static' },
    { name: 'Резидентские', link: 'proxy-residential' },
    { name: 'Мобильные', link: 'proxy-mobile' },
    { name: 'Для DePIN', link: 'proxy-depin' }
];

interface ProxyMobileClientProps {
    providers: any[];
}

export default function ProxyMobileClient({ providers }: ProxyMobileClientProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [openedPromocode, setOpenedPromocode] = useState({});
    const [countryFilter, setCountryFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [isOpenCountriesModal, setIsOpenCoutriesModal] = useState(false);
    const [payment, setPayment] = useState('');
    const mobileProxies = getMobileProxyPromocodes();
    const dataStatic = Object?.entries(proxyData.Data.proxy.mobileProxy.tools) as [string, any][];
    const [sortColumn, setSortColumn] = useState('');
    const isMobile = useIsMobile();
    const router = useRouter();
    const pathname = usePathname();
    const mappedData = useMemo(() => {
        let data = dataStatic?.map(([name, newData]) => {
            return {
                id: name,
                price: newData.price,
                support: newData.support || '',
                promocodeInfo: mobileProxies?.find((item) => item[0] === name),
                fraudscore: proxyScoreData.mobileProxy.find((item) => item.name === name)?.overall || '-',
                fraudData: proxyScoreData.mobileProxy.find((item) => item.name === name) || {},
                children: [...newData.payment] || [],
                payments: newData.payment,
                countries: newData?.countries,
                icon: newData.icon,
                link: newData.link,
                demo: newData?.demo
            };
        });

        if (countryFilter) {
            data = data.filter((item) => item.countries.some((country) => country.name === countryFilter));
        }

        if (payment) {
            data = data.filter((item) => item.payments.some((pay) => pay.name === payment));
        }

        return data;
    }, [countryFilter, payment]);

    const columnHelper = createColumnHelper();

    const toggleModal = () => {
        setIsOpenModal((prev) => !prev);
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Сервис',
                size: 310,
                enableSorting: false,
                cell: ({ row }) => {
                    const original: any = row.original;
                    return (
                        <div>
                            <div className="flex items-center gap-3">
                                {row.index <= 2 && !sorting?.length && !countryFilter && <TopPlace place={row.index + 1} />}
                                {original.icon && (
                                    <Image
                                        width={25}
                                        height={25}
                                        src={original.icon}
                                        alt={original.id}
                                        className="object-contain rounded-[3px]"
                                        unoptimized={true}
                                    />
                                )}
                                <span className="text-white">{original.id}</span>
                            </div>
                            {original?.promocodeInfo && original?.promocodeInfo[1] && (
                                <button className="ml-10 flex items-center bg-[#DEDEDE] mt-3 cursor-pointer p-[3px]">
                                    <span
                                        className="font-normal text-[12px] text-black"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleModal();
                                            setOpenedPromocode({ ...original.promocodeInfo[1], link: original.link });
                                        }}
                                    >
                                        {original?.promocodeInfo[1] && original.promocodeInfo[1].buttonName}
                                    </span>
                                </button>
                            )}
                        </div>
                    );
                }
            }),
            columnHelper.accessor('price', {
                header: 'Цена за день',
                size: 400,
                cell: (info) => {
                    const original: any = info.row.original;
                    return <span className="text-white">{String(info.getValue())}</span>;
                },
                enableSorting: true,
                sortDescFirst: true,
                sortingFn: (rowA, rowB, columnId) => {
                    const parsePrice = (val: any) => {
                        const cleaned = String(val).replace(/[^\d.-]/g, '');
                        return parseFloat(cleaned);
                    };

                    const a = parsePrice(rowA.getValue(columnId));
                    const b = parsePrice(rowB.getValue(columnId));

                    if (isNaN(a) && isNaN(b)) return 0;
                    if (isNaN(a)) return -1;
                    if (isNaN(b)) return 1;

                    return a - b;
                }
            }),

            columnHelper.accessor('countries', {
                header: 'Кол-во стран',
                size: 200,
                cell: ({ row }) => {
                    const original: any = row.original;
                    return (
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-center">{original.countries.length}</span>{' '}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCountries(original.countries);
                                    toggleCountriesModal();
                                }}
                                className="text-[14px] cursor-pointer flex items-center gap-3  bg-[#303030] p-2"
                            >
                                <Eye />
                            </button>
                        </div>
                    );
                },
                enableSorting: false
            }),
            columnHelper.accessor('fraudscore', {
                header: 'Researched score',
                size: 300,
                cell: ({ row }) => {
                    const original: any = row.original;
                    return (
                        <div className="w-[96px]">
                            <Score totalScore={original.fraudscore} data={original.fraudData} />
                        </div>
                    );
                },
                enableSorting: true,
                sortDescFirst: true
            }),
            columnHelper.accessor('demo', {
                header: 'Демо',
                size: 200,
                cell: (info) => {
                    const original: any = info.row.original;
                    return <span className="text-white">{String(info.getValue())}</span>;
                },
                enableSorting: false
            }),
            columnHelper.accessor('support', {
                header: 'Тех.поддержка',
                cell: (info) => {
                    const original: any = info.row.original;
                    return <span className="text-white">{String(info.getValue())}</span>;
                },
                enableSorting: false,
                sortDescFirst: true
            }),
            columnHelper.display({
                id: 'expand',
                header: '',
                cell: ({ row }) => {
                    const original: any = row.original;
                    const canExpand = !!original.children;
                    return (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                row.toggleExpanded();
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
        [sorting, countryFilter]
    );

    const table = useReactTable({
        data: mappedData,
        columns,
        state: {
            expanded,
            sorting
        },
        onExpandedChange: setExpanded,
        onSortingChange: setSorting,
        getRowCanExpand: (row) => !!(row.original as any).children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableColumnResizing: false
    });

    const handleClickFilter = (link: string) => {
        router.push(link);
    };

    const sortColumns = [
        { name: 'Цена (сначала дорогая)', value: 'priceDesc', realValue: 'price', desc: true },
        { name: 'Цена (сначала дешевая)', value: 'priceAsc', realValue: 'price', desc: false },
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

    const countries = useMemo(() => getProxyCountries(), []);

    const clearFilters = () => {
        setCountryFilter('');
        setPayment('');
        setSorting([]);
        setSortColumn('');
    };

    const toggleCountriesModal = () => {
        setIsOpenCoutriesModal((prev) => !prev);
    };

    const payments = getUniquePayments(proxyData.Data.proxy.mobileProxy.tools);

    return (
        <CategoriesLayout
            title={proxyData.Data.proxy.mobileProxy.info.title || ''}
            description={proxyData.Data.proxy.mobileProxy.info.description || ''}
        >
            <CountryPopup isOpen={isOpenCountriesModal} onClose={toggleCountriesModal} countries={selectedCountries} />
            <PromoPopup isOpen={isOpenModal} onClose={toggleModal} info={openedPromocode as any} />
            {isMobile && <MobileProxyFilters filters={PROXY_FILTERS} pathname={pathname} handleClickFilter={handleClickFilter} />}
            <div className="flex gap-3 mb-4 items-center flex-wrap w-full">
                {isMobile ? (
                    <>
                        <div className="w-full flex justify-between gap-[8px]">
                            <div className="w-[45%]">
                                <Filter
                                    className="w-full"
                                    selectedValue={countryFilter}
                                    onChange={setCountryFilter}
                                    name="Страна"
                                    filters={countries}
                                    showSearch={true}
                                />
                            </div>
                            <div className="w-[45%]">
                                <Filter className="w-full" filters={payments} selectedValue={payment} onChange={setPayment} name="Оплата" />
                            </div>
                            <div className="w-[10%]">
                                <Filter
                                    filters={sortColumns}
                                    className="w-full"
                                    selectedValue={sortColumn}
                                    onChange={handleSortColumnChange}
                                    name="Сортировка"
                                    isSorting={true}
                                    showSearch={false}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Filter
                            selectedValue={countryFilter}
                            onChange={setCountryFilter}
                            name="Страна"
                            filters={countries}
                            showSearch={true}
                        />
                        <Filter filters={payments} selectedValue={payment} onChange={setPayment} name="Оплата" />
                    </>
                )}

                {(countryFilter || payment || sortColumn) && <ClearFilters onClear={clearFilters} />}
            </div>
            {!isMobile && (
                <div className="flex justify items-center gap-4 flex-wrap">
                    {PROXY_FILTERS.map((proxy) => (
                        <button
                            onClick={() => handleClickFilter(proxy.link)}
                            className={`h-[50px] cursor-pointer hover:bg-[#DEDEDE] hover:text-black relative w-full max-w-[150px] ${
                                '/' + proxy.link === pathname ? 'bg-[#DEDEDE] text-black' : 'bg-[#2C2C2C] text-white'
                            }`}
                            key={proxy.name}
                        >
                            {proxy.name}
                            {proxy.link === 'proxy-depin' && (
                                <Image
                                    className="absolute top-0 h-[85px] w-full"
                                    alt="grass"
                                    width={10}
                                    height={10}
                                    src="/grasstobutton.webp"
                                    unoptimized={true}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="md:py-4">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="w-full border-separate border-spacing-y-2 ">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup: any) => (
                                <tr key={headerGroup.id} className="bg-[#121212] ">
                                    {headerGroup.headers.map((header: any) => (
                                        <th
                                            key={header.id}
                                            className={`p-3 text-left text-[#7E7E7E] first: last:-r-md ${
                                                header.column.getCanSort() ? 'cursor-pointer' : ''
                                            }`}
                                            style={{ width: header.getSize() }}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext() as any)}
                                                {header.column.getCanSort() && (
                                                    <span>
                                                        {{
                                                            asc: <SortAsc className="w-4 h-4" />,
                                                            desc: <SortDesc className="w-4 h-4" />,
                                                            false: <FilterIcon className="w-4 h-4" />
                                                        }[header.column.getIsSorted() as any || false]}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row: any) => {
                                const original: any = row.original;
                                return (
                                    <Fragment key={row.id}>
                                        <tr
                                            onClick={(e) => {
                                                if (original.id === 'YouProxy' || original.id === 'BeeProxies') {
                                                    e.stopPropagation();
                                                    toggleModal();
                                                    setOpenedPromocode(original.promocodeInfo[1]);
                                                    return;
                                                }
                                                window.open(original.link);
                                            }}
                                            className="hover:bg-[#333333] bg-[#282828] -md"
                                        >
                                            {row.getVisibleCells().map((cell: any) => (
                                                <td key={cell.id} className="p-3 first: cursor-pointer last:-r-md">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext() as any)}
                                                </td>
                                            ))}
                                        </tr>
                                        {row.getIsExpanded() && original.children && (
                                            <tr className="bg-[#303030] relative -top-[11px] ">
                                                <td colSpan={columns.length} className="p-3 -b-md">
                                                    <h4 className="font-medium mb-2 text-white text-sm">Оплата</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {original.children.map((child: any) => (
                                                            <Tooltip key={child.name} position="top" content={child.name}>
                                                                <div className="flex items-center justify-center w-6 h-6">
                                                                    <Image
                                                                        width={16}
                                                                        height={16}
                                                                        alt={child.name}
                                                                        src={child.icon}
                                                                        className="object-contain max-w-full max-h-full"
                                                                    />
                                                                </div>
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {table.getRowModel().rows.map((row: any) => {
                        const original: any = row.original;
                        return (
                            <div
                                key={row.id}
                                className="bg-[#282828] p-4 cursor-pointer hover:bg-[#333333] transition-colors"
                                onClick={(e) => {
                                    if (original.id === 'YouProxy' || original.id === 'BeeProxies') {
                                        e.stopPropagation();
                                        toggleModal();
                                        setOpenedPromocode(original.promocodeInfo[1]);
                                        return;
                                    }
                                    window.open(original.link);
                                }}
                            >
                                <div className="flex justify-between items-start pb-[3px]">
                                    <div className="w-full">
                                        <div className="relative flex items-center gap-3 justify-between">
                                            <div className="flex gap-2">
                                                {' '}
                                                {!sorting?.length && !countryFilter && !payment && row.index <= 2 && (
                                                    <TopPlace place={row.index + 1} />
                                                )}
                                                {original.icon && (
                                                    <Image
                                                        width={20}
                                                        height={20}
                                                        src={original.icon}
                                                        alt={original.id}
                                                        className="object-contain rounded-[3px]"
                                                    />
                                                )}
                                                <span className="text-white text-base">{original.id}</span>
                                            </div>
                                            {original.children && (
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
                                        <div className="grid grid-cols-[30%_30%_30%] justify-between w-full">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[#7E7E7E] text-[12px]">RS score:</span>
                                                <Score totalScore={original.fraudscore} data={original.fraudData} />
                                            </div>

                                            <p className="text-[14px]">
                                                <span className="text-[#7E7E7E] text-[12px]">Цена за день:</span> <br />
                                                <span className="text-[12px]">{original.price}</span>
                                            </p>

                                            <p className="text-[14px]">
                                                <span className="text-[#7E7E7E] text-[12px]">Демо:</span> <br />
                                                <span style={{ wordBreak: 'break-word' }} className="text-[12px]">
                                                    {original.demo || '—'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {row.getIsExpanded() && original.children && (
                                    <div
                                        className="mt-4 space-y-4 animate-slideDown grid grid-cols-[15%_30%_20%] justify-between w-full"
                                        style={{
                                            animation: row.getIsExpanded() ? 'slideDown 0.3s ease-in-out' : 'slideUp 0.3s ease-in-out'
                                        }}
                                    >
                                        <div className="text-white text-sm space-y-3">
                                            <div className="flex flex-col gap-3">
                                                <span className="text-[#7E7E7E] text-[12px]">Кол-во стран:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px]">{original.countries.length}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCountries(original.countries);
                                                            toggleCountriesModal();
                                                        }}
                                                        className="text-[12px] cursor-pointer flex items-center gap-2 bg-[#303030] p-2 rounded-md"
                                                        aria-label="Посмотреть страны"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[#7E7E7E]  text-[12px]">Тех.поддержка:</span>
                                            <span className="text-[12px]"> {original.support || '—'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[12px] mb-1 text-[#7E7E7E]">Оплата</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {original.children.map((child: any) => (
                                                    <Tooltip key={child.name} position="top" content={child.name}>
                                                        <div className="flex items-center justify-center w-5 h-5">
                                                            <Image
                                                                width={16}
                                                                height={16}
                                                                alt={child.name}
                                                                src={child.icon}
                                                                className="object-contain max-w-full max-h-full"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {row.getIsExpanded() && original?.promocodeInfo && original?.promocodeInfo[1] && (
                                    <div className="flex items-center gap-[20px] mt-3">
                                        <span className="text-[14px]">
                                            {' '}
                                            {original?.promocodeInfo[1] && original.promocodeInfo[1].buttonName}
                                        </span>
                                        <button className="flex items-center bg-[#DEDEDE] cursor-pointer p-[6px]">
                                            <span
                                                className="font-normal text-[12px] text-black"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleModal();
                                                    setOpenedPromocode({ ...original.promocodeInfo[1], link: original.link });
                                                }}
                                            >
                                                ПОКАЗАТЬ
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </CategoriesLayout>
    );
}