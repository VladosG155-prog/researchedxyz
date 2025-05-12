"use client";
import depinData from '../../../data/data-depin.json';
import CategoriesLayout from '@/app/categories/layout';
import { useMemo, useState, Fragment } from 'react';
import Image from 'next/image';
import PromoPopup from '@/components/promo-popup';
import Tooltip from '@/components/tooltip';
import { usePathname, useRouter } from 'next/navigation';
import { Filter } from '@/components/filter';
import { ClearFilters } from '@/components/clear-filters';
import { getProxyCountries } from '@/utils/get-proxy-countries-data';
import { getUniquePayments } from '@/utils/get-payments';
import { MobileProxyFilters } from '@/components/mobile-proxy-filter';
import useIsMobile from '@/hooks/useIsMobile';
import { getResidentialProxy, getStaticProxyPromocodes } from '@/utils/get-promocodes';
import { createColumnHelper, useReactTable, getCoreRowModel, getExpandedRowModel, getSortedRowModel, flexRender, ExpandedState } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, FilterIcon, SortAsc, SortDesc } from 'lucide-react';
import React from 'react';

const PROXY_FILTERS = [
    { name: 'Статические', link: 'proxy-static' },
    { name: 'Резидентские', link: 'proxy-residential' },
    { name: 'Мобильные', link: 'proxy-mobile' },
    { name: 'Для DePIN', link: 'proxy-depin' }
];

const staticProxies = getResidentialProxy();

interface DePINClientProps {
    providers: any[];
    searchParams?: { country?: string };
}

const DePINClient: React.FC<DePINClientProps> = ({ providers }) => {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [sorting, setSorting] = useState([]);
    const [countryFilter, setCountryFilter] = useState('');
    const [openedPromocode, setOpenedPromocode] = useState({});
    const [payment, setPayment] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const [sortColumn, setSortColumn] = useState('');
    const isMobile = useIsMobile();
    const dataStatic = Object.entries(depinData.Data.proxy.tools) as [string, any][];
    const staticPromocodes = getStaticProxyPromocodes()
    const residentialPromocodes = getResidentialProxy()
    const mappedData = useMemo(() => {
        let data = dataStatic.map(([name, newData]) => {
            return {
                id: name,
                price: newData.price,
                dawn: newData.realDawn24hrPoints,
                fraudscore: newData.fraudscore || '',
                grass: newData.realGrass24hrPoints,
                gradient: newData.realGradient24hrPoints,
                promocodeInfo: [...residentialPromocodes, staticPromocodes]?.find((item) => item[0] === name),
                payments: newData.payment,
                countries: newData?.countries,
                icon: newData.icon,
                link: newData.link,
                children: newData.payment || []
            };
        });
        if (countryFilter) {
            data = data.filter((item) => item.countries?.some((country) => country.name === countryFilter));
        }
        if (payment) {
            data = data.filter((item) => item.payments.some((pay) => pay.name === payment));
        }
        return data;
    }, [countryFilter, payment]);

    const columnHelper = createColumnHelper<any>();
    const toggleModal = () => setIsOpenModal((prev) => !prev);
    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'Сервис',
            size: 270,
            enableSorting: false,
            cell: ({ row }) => (
                <div>
                    <div className="flex items-center gap-3">
                        {row.original.icon && (
                            <Image width={25} height={25} src={row.original.icon} alt={row.original.id} className="object-contain rounded-[2px]" />
                        )}
                        <span className="text-white flex-grow">{row.original.id}</span>
                    </div>
                    {row.original?.promocodeInfo && row.original?.promocodeInfo[1] && (
                        <button className="ml-10 flex items-center  bg-[#DEDEDE] mt-3 cursor-pointer p-[3px]">
                            <span
                                className="font-normal text-[12px] text-black "
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleModal();
                                    setOpenedPromocode({ ...row.original.promocodeInfo[1], link: row.original.link });
                                }}
                            >
                                {row.original?.promocodeInfo[1] && row.original.promocodeInfo[1].buttonName}
                            </span>
                        </button>
                    )}
                </div>
            )
        }),
        columnHelper.accessor('price', {
            header: 'Цена',
            size: 200,
            cell: (info) => <span className="text-white">{String(info.getValue())}</span>,
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
        columnHelper.accessor('grass', {
            header: 'Grass',
            size: 250,
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <span className="text-white">{info.getValue()}</span>
                    <Image src="/DePIN/grass.webp" alt="" width={20} height={20} />
                </div>
            ),
            enableSorting: true,
            sortDescFirst: true
        }),
        columnHelper.accessor('gradient', {
            header: 'Gradient',
            size: 250,
            cell: (info) => (
                <div className="flex items-center gap-3 ">
                    <span className="text-white">{info.getValue()}</span>
                    <Image src="/DePIN/gradient.webp" alt="" width={20} height={20} />
                </div>
            ),
            enableSorting: true,
            sortDescFirst: true
        }),
        columnHelper.accessor('dawn', {
            header: 'Dawn',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <span className="text-white">{info.getValue()}</span>
                    <Image src="/DePIN/dawn.webp" alt="" width={20} height={20} />
                </div>
            ),
            enableSorting: true,
            sortDescFirst: true
        })
    ], []);

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
        { name: 'Фарм gradient (сначала больше)', value: 'gradientDesc', realValue: 'gradient', desc: true },
        { name: 'Фарм gradient (сначала меньше)', value: 'gradientAsc', realValue: 'gradient', desc: false },
        { name: 'Фарм grass (сначала больше)', value: 'grassDesc', realValue: 'grass', desc: true },
        { name: 'Фарм grass (сначала меньше)', value: 'grassAsc', realValue: 'grass', desc: false },
        { name: 'Фарм dawn (сначала больше)', value: 'dawnDesc', realValue: 'dawn', desc: true },
        { name: 'Фарм dawn (сначала меньше)', value: 'dawnAsc', realValue: 'dawn', desc: false }
    ];

    const handleSortColumnChange = (value: string) => {
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
    const payments = getUniquePayments(depinData.Data.proxy.tools);

    return (
        <CategoriesLayout title={depinData.Data.proxy.info.title || ''} description={depinData.Data.proxy.info.description || ''}>
            <PromoPopup isOpen={isOpenModal} onClose={toggleModal} info={Object.keys(openedPromocode).length ? (openedPromocode as any) : undefined} />
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
                            {table.getRowModel().rows.map((row: any) => (
                                <Fragment key={row.id}>
                                    <tr
                                        onClick={(e) => {
                                            if (row.original.id === 'YouProxy' || row.original.id === 'BeeProxies') {
                                                e.stopPropagation();
                                                toggleModal();
                                                setOpenedPromocode({ ...row.original.promocodeInfo[1], link: row.original.link });
                                                return;
                                            }
                                            window.open(row.original.link);
                                        }}
                                        className="hover:bg-[#333333] bg-[#282828] -md"
                                    >
                                        {row.getVisibleCells().map((cell: any) => (
                                            <td key={cell.id} className="p-3 first: cursor-pointer last:-r-md">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext() as any)}
                                            </td>
                                        ))}
                                    </tr>
                                    {row.getIsExpanded() && row.original.children && (
                                        <tr className="bg-[#303030] relative -top-[11px] ">
                                            <td colSpan={columns.length} className="p-3 -b-md">
                                                <h4 className="font-medium mb-2 text-white text-sm">Оплата</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {row.original.children.map((child: any) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {table.getRowModel().rows.map((row: any) => (
                        <div
                            key={row.id}
                            className="bg-[#282828] p-4 shadow-sm"
                            onClick={(e) => {
                                if (row.original.id === 'YouProxy' || row.original.id === 'BeeProxies') {
                                    e.stopPropagation();
                                    toggleModal();
                                    setOpenedPromocode({ ...row.original.promocodeInfo[1], link: row.original.link });
                                    return;
                                }
                                window.open(row.original.link);
                            }}
                        >
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-3 pb-[3px]">
                                <div className="flex items-center gap-3">
                                    {row.original.icon && (
                                        <Image
                                            width={24}
                                            height={24}
                                            src={row.original.icon}
                                            alt={row.original.id}
                                            className="object-contain rounded-[2px]"
                                        />
                                    )}
                                    <span className="text-white text-base font-semibold">{row.original.id}</span>
                                </div>
                                {row.original.children && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            row.toggleExpanded();
                                        }}
                                        className="p-2 text-white rounded-full hover:bg-[#3A3A3A] transition-colors"
                                        aria-label={row.getIsExpanded() ? 'Collapse details' : 'Expand details'}
                                    >
                                        {row.getIsExpanded() ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                )}
                            </div>
                            <div>
                                <span className="text-[#7E7E7E] font-medium">Цена:</span>
                                <p className="mt-1">{row.original.price}</p>
                            </div>
                            {/* Details Section */}
                            <div className="text-white text-sm space-y-3 grid grid-cols-3 mt-3">
                                <div>
                                    <span className="text-[#7E7E7E] font-medium">grass:</span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span>{row.original.grass}</span>
                                        <Image src="/DePIN/grass.webp" alt="" width={20} height={20} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[#7E7E7E] font-medium">gradient:</span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span>{row.original.gradient}</span>
                                        <Image src="/DePIN/gradient.webp" alt="" width={20} height={20} />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[#7E7E7E] font-medium">dawn:</span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span>{row.original.dawn}</span>
                                        <Image src="/DePIN/dawn.webp" alt="" width={20} height={20} />
                                    </div>
                                </div>
                                {row.original?.promocodeInfo && row.original?.promocodeInfo[1] && (
                                    <button
                                        className="w-full bg-[#DEDEDE] text-black text-sm font-medium py-2 px-4  mt-3 hover:bg-[#E5E5E5] transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleModal();
                                            setOpenedPromocode({ ...row.original.promocodeInfo[1], link: row.original.link });
                                        }}
                                    >
                                        {row.original.promocodeInfo[1].buttonName}
                                    </button>
                                )}
                            </div>
                            {/* Expanded Payment Section */}
                            {row.getIsExpanded() && row.original.children && (
                                <div className="mt-4 pt-4 border-t border-[#3A3A3A]">
                                    <h4 className="text-white text-sm font-medium mb-2">Оплата</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {row.original.children.map((child: any) => (
                                            <Tooltip key={child.name} position="top" content={child.name}>
                                                <div className="flex items-center justify-center w-8 h-8 bg-[#303030] rounded-md">
                                                    <Image
                                                        width={20}
                                                        height={20}
                                                        alt={child.name}
                                                        src={child.icon}
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </div>
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
                                                setOpenedPromocode({ ...row.original.promocodeInfo[1], link: row.original.link });
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
};

export default DePINClient;
