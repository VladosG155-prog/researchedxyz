'use client';
import { useState } from 'react';
import WalletCard from '@/components/wallet-card';
import { Filter } from '@/components/filter';
import walletsData from '../../data/wallet.json';

export default function WalletsClient() {
    const [selectedNetwork, setSelectedNetwork] = useState('');

    // Extract all networks from wallet.json
    const networks = walletsData.Data.wallets.info.allNetworks.map((network) => ({
        name: network,
        icon: '' // Icons not provided in allNetworks, can be added if available
    }));

    // Add "All Networks" option at the start
    const filterNetworks = [...networks];

    // Get wallet entries
    const wallets = Object.entries(walletsData.Data.wallets.tools);

    // Filter and sort wallets
    const filteredWallets = wallets
        .filter(([_, walletData]) => {
            // Корректно обрабатываем отсутствие fullSupportedNetworks
            const hasFullSupported =
                'fullSupportedNetworks' in walletData &&
                Array.isArray((walletData as any).fullSupportedNetworks) &&
                (walletData as any).fullSupportedNetworks.includes(selectedNetwork);
            return (
                walletData.networks?.some((net) => net.fullName === selectedNetwork) ||
                hasFullSupported
            );
        })
        .sort(([walletNameA], [walletNameB]) => {
            // Trust Wallet always at the end
            if (walletNameA === 'Trust Wallet') return 1;
            if (walletNameB === 'Trust Wallet') return -1;

            // Backpack at the top for Solana
            if (selectedNetwork === 'Solana') {
                if (walletNameA === 'Backpack') return -1;
                if (walletNameB === 'Backpack') return 1;
            }

            return 0; // Maintain original order for others
        });

    const finalData = selectedNetwork ? filteredWallets : wallets;
    return (
        <div className="w-full max-w-[1260px] pr-4 py-8 pb-[250px]">
            {/* Network Filter */}
            <div className="mb-6">
                <Filter
                    name="Сеть"
                    selectedValue={selectedNetwork}
                    onChange={setSelectedNetwork}
                    filters={filterNetworks}
                    showSearch={true}
                />
            </div>

            {/* Wallet Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {finalData.map(([walletName, walletData]) => (
                    <WalletCard key={walletName} name={walletName} wallet={walletData} />
                ))}
            </div>
        </div>
    );
} 