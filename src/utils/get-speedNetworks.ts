import tradeBots from '../../data/tradebots.json';

export const getSpeedNetworks = () => {
    const networks = new Map();

    const array = Object.entries(tradeBots.Data.tradingBots.tools);

    array.forEach(([_, data]) => {
        data.speedInfo.forEach(item => {
            if (!networks.has(item.network.name)) {
                networks.set(item.network.name, { name: item.network.name, icon: item.network.icon });
            }
        });
        data.copytradingSpeed.forEach(item => {
            if (!networks.has(item.network.name)) {
                networks.set(item.network.name, { name: item.network.name, icon: item.network.icon });
            }
        });
    });

    // Преобразуем итератор entries в массив и мапим его
    return Array.from(networks.entries()).map(item => item[1]);
};