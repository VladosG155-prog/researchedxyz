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
import botsData from '../../data/tradebots.json';
import CategoriesLayout from '../app/categories/layout';
import { ChevronDown, ChevronUp, FilterIcon, Info, SortAsc, SortDesc } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import Image from 'next/image';
import PromoPopup from '@/components/promo-popup';
import { useRouter } from 'next/navigation';
import { Filter } from '@/components/filter';
import { getTradingBotsNetwork } from '@/utils/get-networks-data';
import { getTradingBotsInterface } from '@/utils/get-bot-data';
import { ClearFilters } from '@/components/clear-filters';
import { TopPlace } from '@/components/top-place';
import Modal from '@/components/modal';
import useIsMobile from '@/hooks/useIsMobile';
import Tooltip from '@/components/tooltip';
import { getSpeedNetworks } from '@/utils/get-speedNetworks';

// Define interfaces for better typing
interface NetworkInfo {
  name: string;
  icon: string;
}

interface SpeedInfoItem {
  network: NetworkInfo;
  value: string;
}

interface CopyTradingSpeedItem {
  network: NetworkInfo;
  blocks: string; // Kept as string based on usage
}

interface ChildInfo {
  name: string;
  content: string | string[];
  colSpan: number;
}

interface TradingBotMappedData {
  id: string;
  fees: string;
  sortCommission: number;
  speed: SpeedInfoItem[] | string; // Display value from speedInfo
  speeds: { [key: string]: { sortIndex: number } }; // Actual speeds data for sorting
  copytradingSpeed: CopyTradingSpeedItem[]; // Display value
  copytradingSpeeds: { [key: string]: { sortIndex: number } }; // Actual copytrading speeds data for sorting
  chains: NetworkInfo[];
  children: ChildInfo[];
  icon: string;
  link: string;
  speedCopy: CopyTradingSpeedItem[]; // Always an array
  interface: string[];
  features: string;
}

const dataNew = Object.entries(botsData.Data.tradingBots.tools);
const bullXLink = {
    manager: 'https://t.me/BullXHelpBot?start=access_NRSQ7LRW3D9',
    client: 'https://t.me/BullxBetaBot?start=access_NRSQ7LRW3D9'
};
function getBlockText(blocks) {
    let blockText = '';

    if (+blocks === 1) {
        blockText = 'блок';
    } else if (+blocks >= 2 && blocks <= 4) {
        blockText = 'блока';
    } else {
        blockText = 'блоков';
    }
    return blockText;
}

export default function TradingBotsClient() {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('');
    const [selectedInterface, setSelectedInterface] = useState('');
    const [sorting, setSorting] = useState([]);
    const [sortColumn, setSortColumn] = useState('');
    const isMobile = useIsMobile();
    const [selectedSpeedNetwork, setSelectedSpeedNetwork] = useState<string | undefined>(undefined);
    const [isOpenBullX, setIsOpenBullX] = useState(false);

    const router = useRouter();

    const networks = getTradingBotsNetwork();
    const interfaces = getTradingBotsInterface();
    console.log('@allo');

    const sortColumns = [
        { name: 'Комиссия (сначала больше)', value: 'feeDesc', realValue: 'sortCommission', desc: true },
        { name: 'Комиссия (сначала меньше)', value: 'feeAsc', realValue: 'sortCommission', desc: false },
        { name: 'Скорость (сначала больше)', value: 'speedDesc', realValue: 'speed', desc: true },
        { name: 'Скорость (сначала меньше)', value: 'speedAsc', realValue: 'speed', desc: false },
        { name: 'Скорость копитрейдинга (сначала больше)', value: 'speedCopyDesc', realValue: 'speedCopy', desc: true },
        { name: 'Скорость копитрейдинга (сначала меньше)', value: 'speedCopyAsc', realValue: 'speedCopy', desc: false }
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
        setSelectedFilter('');
        setSelectedInterface('');
        setSortColumn('');
        setSorting([]);
        setSelectedSpeedNetwork(undefined);
    };

    const speedNetworks = getSpeedNetworks();

    // Handler for Blockchain filter change
    const handleBlockchainFilterChange = (value: string) => {
        setSelectedFilter(value);
        if (value) { // If a blockchain is selected
            setSelectedSpeedNetwork(undefined); // Reset speed network filter
        }
    };

    // Handler for Speed Network filter change
    const handleSpeedNetworkFilterChange = (value: string | undefined) => {
        setSelectedSpeedNetwork(value);
        if (value) { // If a speed network is selected
            setSelectedFilter(''); // Reset blockchain filter
        }
    };

    const mappedData = useMemo(() => {
        let data: TradingBotMappedData[] = dataNew.map((elem) => {
            const [key, botData]: [string, any] = elem;
            return {
                id: key,
                fees: botData.commission,
                sortCommission: botData.sortCommission,
                speed: botData.speedInfo && botData.speedInfo.length > 0 ? botData.speedInfo : 'Нет информации',
                speeds: botData.speeds || {},
                copytradingSpeed: botData.copytradingSpeed || [],
                copytradingSpeeds: botData.copytradingSpeeds || {},
                chains: botData.networks,
                children: [
                    { name: 'Реферальная программа', content: botData.referral, colSpan: 2 },
                    { name: 'Функционал', content: botData.features || 'Нет информации', colSpan: 2 },
                    { name: 'Интерфейс', content: botData.interface.join(', '), colSpan: 2 }
                ],
                icon: botData.icon,
                link: botData.link,
                speedCopy: botData.copytradingSpeed || [],
                interface: botData.interface,
                features: botData.features || 'Нет информации'
            };
        });

        if (selectedFilter) {
            data = data.filter((elem) => elem.chains.some((chain) => chain.name === selectedFilter.trim()));
        }
        if (selectedInterface) {
            data = data.filter((elem) => elem.interface.some((interfaces) => interfaces === selectedInterface.trim()));
        }
        if(selectedSpeedNetwork){
             data = data.filter((elem) =>
                 (Array.isArray(elem.speed) && elem.speed.some(item => item.network.name === selectedSpeedNetwork)) ||
                 (elem.speedCopy.some(item => item.network.name === selectedSpeedNetwork))
             );
        }
        return data;
    }, [selectedFilter, selectedInterface, selectedSpeedNetwork]);


    const columnHelper = createColumnHelper<TradingBotMappedData>();

    const toggleModal = () => {
        setIsOpenModal((prev) => !prev);
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'Сервис',
                size: 250,
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            {row.index <= 2 && !sorting.length && !selectedFilter && !selectedInterface && (
                                <TopPlace place={row.index + 1} />
                            )}
                            {row.original.icon && (
                                <Image
                                    width={25}
                                    height={25}
                                    src={row.original.icon}
                                    alt={row.original.id}
                                    className="object-contain rounded-[3px]"
                                />
                            )}
                            <span className="text-white">{row.original.id}</span>
                        </div>
                    </div>
                )
            }),
            columnHelper.accessor('sortCommission', {
                header: 'Комиссия',
                size: 150,
                maxSize: 150,
                cell: ({ row }) => <span className="text-white">{row.original.fees}</span>,
                enableSorting: true,
                sortDescFirst: true
            }),
            columnHelper.accessor('speed', {
                header: 'Скорость',
                size: 150,
                cell: ({ row }) => {
                    const originalSpeedData = row.original.speed;
                    const currentFilter = selectedSpeedNetwork ? selectedSpeedNetwork.trim() : null;
                    let displayContent: React.ReactNode;

                    if (Array.isArray(originalSpeedData)) {
                        const itemsToDisplay = currentFilter
                            ? originalSpeedData.filter(item => item.network.name === currentFilter)
                            : originalSpeedData;

                        if (itemsToDisplay.length > 0) {
                            displayContent = (
                                <div>
                                    {itemsToDisplay.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <p>{item.value}</p>
                                            <Image width={15} height={15} src={item?.network?.icon} alt={item?.network?.name} />
                                        </div>
                                    ))}
                                </div>
                            );
                        } else {
                            displayContent = currentFilter ? (
                                <span className="text-gray-500">-</span>
                            ) : (
                                <span className="text-white">Нет информации</span>
                            );
                        }
                    } else {
                        displayContent = !currentFilter ? (
                            <span className="text-white">{originalSpeedData}</span>
                        ) : (
                            <span className="text-gray-500">-</span>
                        );
                    }
                    return displayContent;
                },
                sortingFn: (rowA, rowB, columnId) => {
                    const speedsA = rowA.original.speeds;
                    const speedsB = rowB.original.speeds;

                    const getSortValue = (speeds) => {
                        if (!speeds || Object.keys(speeds).length === 0) return Infinity;
                        if (speeds.SOL) return speeds.SOL.sortIndex;
                        const firstNetwork = Object.keys(speeds)[0];
                        return speeds[firstNetwork]?.sortIndex ?? Infinity;
                    };

                    const valueA = getSortValue(speedsA);
                    const valueB = getSortValue(speedsB);

                    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                },
                enableSorting: true,
                sortDescFirst: true
            }),
            columnHelper.accessor('speedCopy', {
                header: 'Скорость копитрейдинга',
                size: 150,
                minSize: 150,
                maxSize: 150,
                cell: ({ row }) => {
                    const originalCopySpeedData = row.original.copytradingSpeed;
                    const currentFilter = selectedSpeedNetwork ? selectedSpeedNetwork.trim() : null;
                    let displayContent: React.ReactNode;

                    if (originalCopySpeedData.length === 0) {
                        displayContent = <span className="text-white">Нет копитрейдинга</span>;
                    } else {
                        const itemsToDisplay = currentFilter
                            ? originalCopySpeedData.filter(item => item.network.name === currentFilter)
                            : originalCopySpeedData;

                        if (itemsToDisplay.length > 0) {
                            displayContent = (
                                <div>
                                    {itemsToDisplay.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <p>{item.blocks} {getBlockText(item.blocks.split(' ')[0])}</p>
                                            <Image width={15} height={15} src={item?.network?.icon} alt={item?.network?.name} />
                                        </div>
                                    ))}
                                </div>
                            );
                        } else {
                            displayContent = <span className="text-gray-500">-</span>;
                        }
                    }
                    return <span className="text-white">{displayContent}</span>;
                },
                sortingFn: (rowA, rowB, columnId) => {
                    const speedsA = rowA.original.copytradingSpeeds;
                    const speedsB = rowB.original.copytradingSpeeds;

                    const getSortValue = (speeds) => {
                        if (!speeds || Object.keys(speeds).length === 0) return Infinity;
                        if (speeds.SOL) return speeds.SOL.sortIndex;
                        const firstNetwork = Object.keys(speeds)[0];
                        return speeds[firstNetwork]?.sortIndex ?? Infinity;
                    };

                    const valueA = getSortValue(speedsA);
                    const valueB = getSortValue(speedsB);

                    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                },
                enableSorting: true,
                sortDescFirst: true
            }),
            columnHelper.accessor('chains', {
                header: 'Сети',
                size: 100,
                enableSorting: false,
                cell: (info) => (
                    <div className="flex gap-2 flex-wrap">
                        {info.getValue().map((item, index) => (
                            <Image
                                key={`${item.name} ${index}`}
                                width={20}
                                height={20}
                                alt={item.name}
                                src={item.icon}
                                className="object-contain"
                            />
                        ))}
                    </div>
                )
            }),
            columnHelper.display({
                id: 'expand',
                header: '',
                size: 50,
                cell: ({ row }) => {
                    const canExpand = !!row.original.children;
                    return (
                        <button
                            onClick={() => row.toggleExpanded()}
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
        [sorting, selectedFilter, selectedInterface, selectedSpeedNetwork]
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
        getRowCanExpand: (row) => !!row.original.children,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    return (
        <CategoriesLayout title={botsData.Data.tradingBots.info.title} description={botsData.Data.tradingBots.info.description}>
            <PromoPopup isOpen={isOpenModal} onClose={toggleModal} />
            {isOpenBullX && (
                <Modal title="BullX" isOpen={isOpenBullX} onClose={() => setIsOpenBullX((prev) => !prev)}>
                    <div className="flex justify-center items-center gap-3">
                        <button
                            className="mt-4 text-start bg-[#121212] inline-block max-w-max p-4 cursor-pointer"
                            onClick={() => window.open(bullXLink.client)}
                        >
                            Перейти
                        </button>
                        <button
                            className="mt-4 text-start bg-[#121212] inline-block max-w-max p-4 cursor-pointer"
                            onClick={() => window.open(bullXLink.manager)}
                        >
                            Менеджер
                        </button>
                    </div>
                </Modal>
            )}
            {isMobile ? (
                <div className="flex gap-[8px] justify-between flex-wrap">
                    <div className="w-[42%]">
                        <Filter onChange={handleBlockchainFilterChange} selectedValue={selectedFilter} filters={networks} name="Блокчейн" />
                    </div>
                    <div className="w-[42%]">
                        <Filter onChange={setSelectedInterface} selectedValue={selectedInterface} filters={interfaces} name="Интерфейс" />
                    </div>
                    {isMobile && (
                        <div className="mb-5 w-[9%]">
                            <Filter
                                filters={sortColumns}
                                selectedValue={sortColumn}
                                onChange={handleSortColumnChange}
                                name="Сортировка"
                                showSearch={false}
                                isSorting={true}
                            />
                        </div>
                    )}
                     <Filter onChange={handleSpeedNetworkFilterChange} selectedValue={selectedSpeedNetwork} filters={speedNetworks} name="Скорость сети" />

                    {(selectedFilter || selectedInterface || sortColumn || selectedSpeedNetwork) && (
                        <div className="-mt-3 mb-4 mt-3">
                            <ClearFilters onClear={clearFilters} />{' '}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-3 flex-wrap">
                    <Filter onChange={handleBlockchainFilterChange} selectedValue={selectedFilter} filters={networks} name="Блокчейн" />
                    <Filter onChange={setSelectedInterface} selectedValue={selectedInterface} filters={interfaces} name="Интерфейс" />
                    <Filter onChange={handleSpeedNetworkFilterChange} selectedValue={selectedSpeedNetwork} filters={speedNetworks} name="Скорость сети" />
                    {isMobile && (
                        <div className="mb-5 w-full">
                            <Filter
                                filters={sortColumns}
                                selectedValue={sortColumn}
                                onChange={handleSortColumnChange}
                                name="Сортировка"
                                showSearch={false}
                                isSorting={true}
                            />
                        </div>
                    )}
                    {(selectedFilter || selectedInterface || sortColumn || selectedSpeedNetwork) && <ClearFilters onClear={clearFilters} />}
                </div>
            )}

            <div className="md:py-6 -mt-1">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-[#121212]">
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            style={{ width: header.column.columnDef.size }}
                                            className={`p-3 text-left text-[#7E7E7E] ${
                                                header.column.getCanSort() ? 'cursor-pointer' : ''
                                            }`}
                                            onClick={(e) => {
                                                header.column.getToggleSortingHandler()(e);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span>
                                                        {
                                                            {
                                                                asc: <SortAsc className="w-4 h-4" />,
                                                                desc: <SortDesc className="w-4 h-4" />,
                                                                'false': <FilterIcon className="w-4 h-4" />
                                                            }[String(header.column.getIsSorted() || false)]
                                                        }
                                                    </span>
                                                )}
                                                {header.id === 'speedCopy' && (
                                                    <Tooltip content="Через сколько блоков копируется транзакция">
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
                                    <tr className="hover:bg-[#333333] bg-[#282828]">
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                onClick={!cell.id.includes('expand') ? () => window.open(row.original.link) : null}
                                                key={cell.id}
                                                className="p-3 cursor-pointer"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                    {row.getIsExpanded() && row.original.children && (
                                        <tr key="expanded-row" className="bg-[#303030] align-start relative -top-[11px]">
                                            {row.original.children.map((child, index) => (
                                                <td key={child.name} colSpan={child.colSpan} className="p-3 align-text-top">
                                                    <div className="flex flex-col justify-between">
                                                        <h4 className="font-medium mb-2 text-[#7E7E7E]">
                                                            {child.name}
                                                            {child.name === 'Реферальная программа' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (row.original.id === 'BullX NEO') {
                                                                            setIsOpenBullX(true);
                                                                            return;
                                                                        }
                                                                        window.open(row.original.link);
                                                                    }}
                                                                    className="ml-2 mt-4 text-start bg-[#121212] text-white inline-block max-w-max p-2 text-[14px] cursor-pointer"
                                                                >
                                                                    Вступить
                                                                </button>
                                                            )}
                                                        </h4>
                                                        {child.name === 'Реферальная программа' ? (
                                                            <div
                                                                className="gap-3 text-white"
                                                                dangerouslySetInnerHTML={{ __html: child.content as string }}
                                                            />
                                                        ) : (
                                                             <div className="gap-3 text-white">{child.content}</div>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    )}
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
                            onClick={() => window.open(row.original.link, '_blank')}
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-full">
                                    <div className="relative flex items-center gap-3 justify-between">
                                        <div className="flex gap-2 items-center">
                                            {row.index <= 2 && !sorting.length && !selectedFilter && !selectedInterface && (
                                                <TopPlace place={row.index + 1} />
                                            )}
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
                                    <div className="grid grid-cols-[27%_30%_36%] justify-between w-full mt-3 items-start">
                                        <div className="flex flex-col gap-1 min-h-[60px] p-1">
                                            <span className="text-[#7E7E7E] text-[12px] font-medium">Комиссия:</span>
                                            <div className="text-[12px] mt-2 text-white">{row.original.fees}</div>
                                        </div>
                                        <div className="flex flex-col gap-1 min-h-[60px] p-1">
                                            <span className="text-[#7E7E7E] text-[12px] font-medium">Скорость:</span>
                                            <div className="text-[12px] mt-2 text-white">
                                                {/* Mobile view Speed rendering updated */}
                                                {(() => {
                                                    const originalSpeedData = row.original.speed;
                                                    const currentFilter = selectedSpeedNetwork ? selectedSpeedNetwork.trim() : null;
                                                    let mobileDisplayContent: React.ReactNode;

                                                    if (Array.isArray(originalSpeedData)) {
                                                        const itemsToDisplay = currentFilter
                                                            ? originalSpeedData.filter(item => item.network.name === currentFilter)
                                                            : originalSpeedData;

                                                        if (itemsToDisplay.length > 0) {
                                                            mobileDisplayContent = itemsToDisplay.map((item, index) => (
                                                                <div key={index} className="flex items-center gap-1">
                                                                    <span>{item.value}</span>
                                                                    <Image width={12} height={12} src={item?.network?.icon} alt={item?.network?.name} className="object-contain"/>
                                                                </div>
                                                            ));
                                                        } else {
                                                            mobileDisplayContent = currentFilter ? <span className="text-gray-500">-</span> : <span className="text-white">Нет информации</span>;
                                                        }
                                                    } else {
                                                        mobileDisplayContent = !currentFilter ? <span className="text-white">{originalSpeedData}</span> : <span className="text-gray-500">-</span>;
                                                    }
                                                    return mobileDisplayContent;
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 min-h-[60px] p-1">
                                            <span className="text-[#7E7E7E] text-[12px] font-medium">Скорость копитрейдинга:</span>
                                            <div className="text-[12px] mt-2 text-white">
                                                {/* Mobile view Copy Speed rendering updated */}
                                                {(() => {
                                                     const originalCopySpeedData = row.original.copytradingSpeed;
                                                     const currentFilter = selectedSpeedNetwork ? selectedSpeedNetwork.trim() : null;
                                                     let mobileDisplayContent: React.ReactNode;

                                                     if (originalCopySpeedData.length === 0) {
                                                         mobileDisplayContent = <span className="text-white">Нет копитрейдинга</span>;
                                                     } else {
                                                         const itemsToDisplay = currentFilter
                                                             ? originalCopySpeedData.filter(item => item.network.name === currentFilter)
                                                             : originalCopySpeedData;

                                                         if (itemsToDisplay.length > 0) {
                                                             mobileDisplayContent = itemsToDisplay.map((item, index) => (
                                                                 <div key={index} className="flex items-center gap-1">
                                                                     <span>{item.blocks} {getBlockText(item.blocks.split(' ')[0])}</span>
                                                                     <Image width={12} height={12} src={item?.network?.icon} alt={item?.network?.name} className="object-contain"/>
                                                                 </div>
                                                             ));
                                                         } else {
                                                             // Filter applied, but no data for this network
                                                             mobileDisplayContent = <span className="text-gray-500">-</span>;
                                                         }
                                                     }
                                                     return mobileDisplayContent;
                                                })()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 min-h-[60px] p-1">
                                            <span className="text-[#7E7E7E] text-[12px] font-medium">Сети:</span>
                                            <div className="flex mt-1 gap-1 items-center flex-wrap">
                                                {row.original.chains.map((item, index) => (
                                                    <Image
                                                        key={`${item.name} ${index}`}
                                                        width={15}
                                                        height={15}
                                                        alt={item.name}
                                                        src={item.icon}
                                                        className="object-contain"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {row.getIsExpanded() && row.original.children && (
                                <>
                                    <div
                                        className="mt-4 space-y-4 animate-slideDown grid grid-cols-[50%_50%] justify-between w-full items-start"
                                        style={{
                                            animation: row.getIsExpanded() ? 'slideDown 0.3s ease-in-out' : 'slideUp 0.3s ease-in-out'
                                        }}
                                    >
                                        {row.original.children.map((child) => (
                                            <div key={child.name} className="flex flex-col justify-between">
                                                <h4 className="text-[#7E7E7E] text-[12px] mb-2">{child.name}</h4>
                                                {child.name === 'Реферальная программа' ? (
                                                    <div
                                                        className="text-white text-[12px]"
                                                        dangerouslySetInnerHTML={{ __html: child.content as string }}
                                                    />
                                                ) : (
                                                    <div className="text-white text-[12px]">{child.content}</div>
                                                )}
                                                {child.name === 'Реферальная программа' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (row.original.id === 'BullX NEO') {
                                                                setIsOpenBullX(true);
                                                                return;
                                                            }
                                                            window.open(row.original.link);
                                                        }}
                                                        className="mt-3 text-start bg-[#121212] inline-block max-w-max p-2 cursor-pointer rounded-md text-white text-[12px]"
                                                    >
                                                        Вступить
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </CategoriesLayout>
    );
}