// scripts/updateDexs.js

const fetch = require('node-fetch');    // yarn add node-fetch@2
const fs    = require('fs').promises;
const path  = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // 2 секунды

async function fetchOverview() {
  console.log('Fetching DEX overview...');
  const res = await fetch('https://api.llama.fi/overview/dexs');
  if (!res.ok) {
    console.error(`Overview fetch failed: ${res.status} ${res.statusText}`);
    throw new Error(`Overview fetch failed: ${res.status}`);
  }
  const data = await res.json();
  console.log(`Fetched ${data.protocols.length} potential DEX protocols from overview.`);
  return data.protocols;
}

async function fetchProtocol(slug, attempt = 1) {
  try {
    const res = await fetch(`https://api.llama.fi/protocol/${slug}`);

    if (res.status === 404) {
      console.warn(`Protocol ${slug} not found (404).`);
      return { logo: null, url: null, name: slug, chains: [] };
    }

    if (res.status === 429) { // Too Many Requests
      if (attempt <= MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Rate limit for ${slug}. Retrying attempt ${attempt}/${MAX_RETRIES} after ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProtocol(slug, attempt + 1);
      }
      console.error(`Rate limit exceeded for ${slug} after ${MAX_RETRIES} attempts.`);
      return { logo: null, url: null, name: slug, chains: [] };
    }

    if (!res.ok) { // Other non-404 errors (e.g., 5xx)
      console.warn(`Warning: Fetching protocol ${slug} returned status ${res.status} ${res.statusText}.`);
      if (attempt <= MAX_RETRIES && res.status >= 500) { // Retry for server errors
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Server error for ${slug}. Retrying attempt ${attempt}/${MAX_RETRIES} after ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProtocol(slug, attempt + 1);
      }
      console.error(`Failed to fetch ${slug} with status ${res.status} after potential retries.`);
      return { logo: null, url: null, name: slug, chains: [] };
    }
    
    const data = await res.json();
    // Убедимся, что chains существует, если нет, то пустой массив
    return { ...data, chains: data.chains || [] }; 

  } catch (error) {
    console.error(`Network or other error fetching protocol ${slug} (attempt ${attempt}):`, error.message);
    if (attempt <= MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`Retrying ${slug} (attempt ${attempt}/${MAX_RETRIES}) due to error after ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchProtocol(slug, attempt + 1);
    }
    console.error(`Failed to fetch ${slug} after ${MAX_RETRIES} attempts due to error: ${error.message}`);
    return { logo: null, url: null, name: slug, chains: [] };
  }
}

async function build() {
  const protocols = await fetchOverview();
  console.log(`Fetched ${protocols.length} protocols from overview.`);

  // Начальная сортировка по total7d, чтобы "первый встреченный" часто был самым крупным
  protocols.sort((a, b) => (b.total7d || 0) - (a.total7d || 0));

  const seenBaseNames = new Set();
  const dexQueue = []; // Очередь для запроса деталей

  for (const p of protocols) {
    const baseName = p.name.replace(/\s+V\d+(\.\d+)*$/i, '');
    if (seenBaseNames.has(baseName)) {
      // console.log(`Skipping duplicate baseName from overview: ${p.name} (base: ${baseName})`);
      continue;
    }
    seenBaseNames.add(baseName);

    let slug = p.protocol || p.slug;
    let slugSource = p.protocol ? 'protocol_field' : (p.slug ? 'slug_field' : 'generated');
    if (!slug) {
      slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    dexQueue.push({
      name: baseName, // Используем baseName как основной идентификатор до финальной обработки
      originalFullName: p.name, // Сохраняем полное имя для возможной отладки
      slug: slug,
      slugSource: slugSource,
      chains: p.chains || [],
      overviewIcon: p.logo,
      overviewUrl: p.url,
      overviewTotal7d: p.total7d || 0, // Важно для сортировки и выбора
    });
  }
  console.log(`Prepared ${dexQueue.length} unique DEXes for detail fetching.`);

  const batchSize = 15;
  const delayBetweenBatches = 3000;
  const delayBetweenRequests = 200;
  const detailsMap = new Map(); // name (baseName) -> detailResult

  for (let i = 0; i < dexQueue.length; i += batchSize) {
    const batch = dexQueue.slice(i, i + batchSize);
    console.log(`Fetching details for batch ${i / batchSize + 1}/${Math.ceil(dexQueue.length / batchSize)} (size: ${batch.length})`);
    
    const batchPromises = batch.map(async (dexInfo) => {
      // console.log(`  Attempting fetch for ${dexInfo.name} using slug: '${dexInfo.slug}' (source: ${dexInfo.slugSource})`);
      const detail = await fetchProtocol(dexInfo.slug);
      if (detail) {
        detailsMap.set(dexInfo.name, detail);
      }
      await delay(delayBetweenRequests); // Маленькая задержка между запросами в пакете
    });
    await Promise.all(batchPromises);

    if (i + batchSize < dexQueue.length) {
      console.log(`Waiting ${delayBetweenBatches / 1000}s before next batch...`);
      await delay(delayBetweenBatches);
    }
  }
  console.log(`Fetched details for ${detailsMap.size} DEXes.`);

  const allNetworks = new Set();
  const networkIconsMap = {}; // { [chainName]: iconUrl }

  // Промежуточное хранилище перед основной фильтрацией. Ключ - baseName.
  let intermediateToolsData = {}; 

  for (const dexInfo of dexQueue) {
    const detailResult = detailsMap.get(dexInfo.name);

    let dexIcon = dexInfo.overviewIcon;
    let dexUrl = dexInfo.overviewUrl;
    let currentDexChains = dexInfo.chains || [];

    if (detailResult) {
      if (detailResult.logo) dexIcon = detailResult.logo;
      if (detailResult.url) dexUrl = detailResult.url;
      // Цепочки из details более приоритетны, если есть, иначе из overview
      if (detailResult.chains && Array.isArray(detailResult.chains) && detailResult.chains.length > 0) {
        currentDexChains = detailResult.chains;
      } else if (detailResult.chain && typeof detailResult.chain === 'string') { // Случай, если chains нет, но есть одиночное поле chain
         currentDexChains = [detailResult.chain];
      }
    }
    
    currentDexChains = Array.isArray(currentDexChains) ? currentDexChains : [];
    const networksForDex = currentDexChains.map(chainName => {
      allNetworks.add(chainName);
      const encoded = encodeURIComponent(chainName.toLowerCase());
      const iconUrl = `https://icons.llamao.fi/icons/chains/rsz_${encoded}?w=48&h=48`;
      if (!networkIconsMap[chainName]) {
        networkIconsMap[chainName] = iconUrl;
      }
      return { name: chainName, icon: iconUrl };
    });

    intermediateToolsData[dexInfo.name] = {
      icon: dexIcon,
      url: dexUrl,
      networks: networksForDex,
      total7d: dexInfo.overviewTotal7d, // Это важно для всех последующих шагов сортировки/выбора
      originalFullName: dexInfo.originalFullName,
      slug: dexInfo.slug,
      slugSource: dexInfo.slugSource
    };
  }
  
  const sortedAllNetworks = Array.from(allNetworks).sort();
  console.log(`Total unique networks found: ${sortedAllNetworks.length}`);

  // --- Начало блока фильтрации и обработки ---
  console.log(`\nStarting filtering & processing. Initial count: ${Object.keys(intermediateToolsData).length}`);

  // 1. Отфильтровать DEXы без URL
  let stage1_UrlNotNull = {};
  for (const name in intermediateToolsData) {
    if (intermediateToolsData[name].url) {
      stage1_UrlNotNull[name] = intermediateToolsData[name];
    } else {
      console.log(`  [Filter URL]: Removing ${name} (URL is null/undefined)`);
    }
  }
  console.log(`  Count after URL !null filter: ${Object.keys(stage1_UrlNotNull).length}`);

  // 2. Слияние записей с одинаковым URL.
  //    Приоритет отдается записи, которая была выше в отсортированном по total7d списке.
  //    Сети объединяются. Имя, иконка, total7d берутся от "первой" (более приоритетной) записи.
  const urlMergeMap = {}; // url -> { name, icon, networksSet, total7d, slug, slugSource, url }
  // Сортируем записи по total7d перед слиянием по URL, чтобы "первая" была самой объемной
  let arrayForUrlMerge = Object.entries(stage1_UrlNotNull).sort(([,a],[,b]) => (b.total7d || 0) - (a.total7d || 0));

  for (const [name, data] of arrayForUrlMerge) {
    if (!urlMergeMap[data.url]) { // Если URL еще не встречался
      urlMergeMap[data.url] = {
        name: name, // Имя от самой "важной" записи для этого URL
        icon: data.icon,
        networksSet: new Set(data.networks.map(n => n.name)),
        total7d: data.total7d || 0,
        slug: data.slug,
        slugSource: data.slugSource,
        url: data.url
      };
    } else { // URL уже есть, объединяем сети
      console.log(`  [Merge URL]: Merging networks for URL ${data.url} (new: ${name}, existing: ${urlMergeMap[data.url].name})`);
      data.networks.forEach(n => urlMergeMap[data.url].networksSet.add(n.name));
      // Данные (имя, total7d, icon) уже от более приоритетной записи
    }
  }
  let stage2_MergedByUrl = {};
  for (const urlValue in urlMergeMap) { // Ключ - сам URL
    const data = urlMergeMap[urlValue];
    stage2_MergedByUrl[data.name] = { // Используем сохраненное имя (от приоритетной записи) как ключ
      icon: data.icon,
      url: data.url, // url здесь это urlValue
      networks: Array.from(data.networksSet).sort().map(netName => ({ name: netName, icon: networkIconsMap[netName] || null })),
      total7d: data.total7d,
      slug: data.slug,
      slugSource: data.slugSource
    };
  }
  console.log(`  Count after merging by URL: ${Object.keys(stage2_MergedByUrl).length}`);

  // 3. Дедупликация по первому слову в имени.
  //    Если имена начинаются с одного слова, оставляем ту запись, что выше в списке (больший total7d).
  const firstWordDedupMap = {}; // firstWord.toLowerCase() -> nameToKeep
  let stage3_DeduplicatedByFirstName = {};
  // Сортируем снова по total7d для этого шага
  let arrayForFirstNameDedupe = Object.entries(stage2_MergedByUrl).sort(([,a],[,b]) => (b.total7d || 0) - (a.total7d || 0));

  for (const [name, data] of arrayForFirstNameDedupe) {
    const firstWord = name.split(' ')[0].toLowerCase();
    if (!firstWordDedupMap[firstWord]) {
      firstWordDedupMap[firstWord] = name;
      stage3_DeduplicatedByFirstName[name] = data;
    } else {
      console.log(`  [Dedupe First Word]: Removing '${name}' (vol: ${data.total7d}) in favor of '${firstWordDedupMap[firstWord]}'`);
    }
  }
  console.log(`  Count after first-word name deduplication: ${Object.keys(stage3_DeduplicatedByFirstName).length}`);

  // Преобразуем в массив объектов для дальнейших операций
  let finalToolsWorkingList = Object.values(stage3_DeduplicatedByFirstName).map(data => ({
      name: Object.keys(stage3_DeduplicatedByFirstName).find(key => stage3_DeduplicatedByFirstName[key] === data), // Получаем имя обратно
      ...data
  }));

  // --- Специальные правки перед записью ---
  console.log('\nApplying final specific adjustments...');

  // 1. Переименования
  console.log('  Applying renames...');
  finalToolsWorkingList.forEach(item => {
    if (item.name === 'Hyperliquid Spot Orderbook') {
      console.log(`    Renaming '${item.name}' to 'Hyperliquid' (vol: ${item.total7d})`);
      item.name = 'Hyperliquid';
    }
    if (item.name === 'Aerodrome Slipstream') {
      console.log(`    Renaming '${item.name}' to 'Aerodrome' (vol: ${item.total7d})`);
      item.name = 'Aerodrome';
    }
    if (item.name === 'PancakeSwap AMM') {
      console.log(`    Renaming '${item.name}' to 'PancakeSwap' (vol: ${item.total7d})`);
      item.name = 'PancakeSwap';
    }
    if (item.name === 'Reservoir Tools AMM') {
      console.log(`    Renaming '${item.name}' to 'Reservoir' (vol: ${item.total7d})`);
      item.name = 'Reservoir';
    }
  });

  // 1.5. Добавление пробела перед 'Swap' если префикс >= 6 символов
  console.log('  Formatting *Swap names...');
  const swapRegex = /^(.{6,})(Swap)$/i;
  finalToolsWorkingList.forEach(item => {
      const match = item.name.match(swapRegex);
      if (match) {
          const newName = `${match[1]} ${match[2]}`;
          console.log(`    Formatting '${item.name}' to '${newName}'`);
          item.name = newName;
      }
  });

  // 2. Обработка Plume / Plume Mainnet
  console.log('  Processing Plume/Plume Mainnet...');
  // ... (Логика Plume остается как есть)

  // 2.5 Обработка BSC / Binance
  console.log('  Processing BSC/Binance merge...');
  const bscName = 'BSC';
  const binanceName = 'Binance';

  // Глобальные списки: Удаляем BSC, если Binance есть
  if (sortedAllNetworks.includes(bscName) && sortedAllNetworks.includes(binanceName)) {
      const index = sortedAllNetworks.indexOf(bscName);
      if (index > -1) {
          sortedAllNetworks.splice(index, 1);
          console.log(`    Removed '${bscName}' from global network list, keeping '${binanceName}'.`);
      }
  }
  // Иконки: Переносим иконку BSC на Binance, если у Binance нет, затем удаляем BSC
  if (networkIconsMap.hasOwnProperty(bscName) && !networkIconsMap.hasOwnProperty(binanceName)) {
      networkIconsMap[binanceName] = networkIconsMap[bscName];
      console.log(`    Copied icon from '${bscName}' to '${binanceName}'.`);
  }
  if (networkIconsMap.hasOwnProperty(bscName)) {
      delete networkIconsMap[bscName];
      console.log(`    Deleted icon entry for '${bscName}'.`);
  }

  // Сети у DEX: Заменяем BSC на Binance и удаляем дубликаты
  finalToolsWorkingList.forEach(item => {
      let hasBsc = item.networks.some(network => network.name === bscName);
      if (hasBsc) {
          item.networks = item.networks.map(network => {
              if (network.name === bscName) {
                  console.log(`    DEX '${item.name}': Replacing network '${bscName}' with '${binanceName}'.`);
                  return { ...network, name: binanceName, icon: networkIconsMap[binanceName] || null };
              }
              return network;
          });
          // Удаляем дубликаты Binance
          const uniqueNetworksByName = new Map();
          item.networks.forEach(network => {
              if (!uniqueNetworksByName.has(network.name)) {
                  uniqueNetworksByName.set(network.name, network);
              }
          });
          item.networks = Array.from(uniqueNetworksByName.values());
      }
  });

  // 3. Фильтрация "Pump.fun", "PolyMarket", "Sushi Trident" и "LaunchLab"
  console.log('  Filtering specific DEX names...');
  const namesToExclude = ['pump.fun', 'polymarket', 'sushi trident', 'launchlab'];
  const initialFilterCount = finalToolsWorkingList.length;
  finalToolsWorkingList = finalToolsWorkingList.filter(item => {
    const lowerName = item.name.toLowerCase();
    if (namesToExclude.includes(lowerName)) {
      console.log(`    [Filter Specific]: Removing '${item.name}' (vol: ${item.total7d})`);
      return false;
    }
    return true;
  });
  if (finalToolsWorkingList.length < initialFilterCount) {
      console.log(`    Removed ${initialFilterCount - finalToolsWorkingList.length} specific DEXs.`);
  }
  console.log(`  Count after specific name exclusions: ${finalToolsWorkingList.length}`);
  
  // 4. Удаление сети 'zkSync'
  console.log('  Processing zkSync removal...');
  const zksyncName = 'zkSync';
  const zksyncIndex = sortedAllNetworks.indexOf(zksyncName);
  if (zksyncIndex > -1) {
    sortedAllNetworks.splice(zksyncIndex, 1);
    console.log(`    Removed '${zksyncName}' from global network list.`);
  }
  if (networkIconsMap.hasOwnProperty(zksyncName)) {
    delete networkIconsMap[zksyncName];
    console.log(`    Deleted icon entry for '${zksyncName}'.`);
  }
  finalToolsWorkingList.forEach(item => {
    const initialLength = item.networks.length;
    item.networks = item.networks.filter(network => network.name !== zksyncName);
    if (item.networks.length < initialLength) {
      console.log(`    DEX '${item.name}': Removed '${zksyncName}' network.`);
    }
  });

  // 5. Фильтрация DEX-ов, у которых не осталось сетей
  console.log('  Filtering DEXs with no remaining networks...');
  const initialDexCount = finalToolsWorkingList.length;
  finalToolsWorkingList = finalToolsWorkingList.filter(item => {
      if (item.networks.length === 0) {
          console.log(`    Removing DEX '${item.name}' as it has no remaining networks after filtering.`);
          return false;
      }
      return true;
  });
  if (finalToolsWorkingList.length < initialDexCount) {
      console.log(`    Removed ${initialDexCount - finalToolsWorkingList.length} DEXs with empty networks.`);
  }

  // 6. Повторная дедупликация/слияние DEX-ов после всех модификаций
  console.log('\nRe-running merge/deduplication after all adjustments...');
  let tempToolsForRededupe = {};
  finalToolsWorkingList.forEach(item => { tempToolsForRededupe[item.name] = item; });
  // Повторное слияние по URL (аналог stage2_MergedByUrl)
  const remergeUrlMap = {};
  let arrayForReUrlMerge = Object.entries(tempToolsForRededupe).sort(([,a],[,b]) => (b.total7d || 0) - (a.total7d || 0));
  for (const [name, data] of arrayForReUrlMerge) {
      if (!remergeUrlMap[data.url]) {
          remergeUrlMap[data.url] = { name: name, icon: data.icon, networksSet: new Set(data.networks.map(n => n.name)), total7d: data.total7d || 0, url: data.url };
      } else {
          data.networks.forEach(n => remergeUrlMap[data.url].networksSet.add(n.name));
      }
  }
  let stageRe2 = {};
  for (const urlValue in remergeUrlMap) {
      const data = remergeUrlMap[urlValue];
      stageRe2[data.name] = { icon: data.icon, url: data.url, networks: Array.from(data.networksSet).sort().map(netName => ({ name: netName, icon: networkIconsMap[netName] || null })), total7d: data.total7d };
  }
  console.log(`  Count after Re-Merge by URL: ${Object.keys(stageRe2).length}`);
  // Повторная дедупликация по первому слову (аналог stage3_DeduplicatedByFirstName)
  const reFirstWordDedupMap = {};
  let stageRe3 = {};
  let arrayForReFirstNameDedupe = Object.entries(stageRe2).sort(([,a],[,b]) => (b.total7d || 0) - (a.total7d || 0));
  for (const [name, data] of arrayForReFirstNameDedupe) {
      const firstWord = name.split(' ')[0].toLowerCase();
      if (!reFirstWordDedupMap[firstWord]) {
          reFirstWordDedupMap[firstWord] = name;
          stageRe3[name] = data;
      }
  }
  console.log(`  Count after Re-Dedupe First Word: ${Object.keys(stageRe3).length}`);
  // Повторное слияние после возможного переименования (аналог mergedAfterRenameMap, но без самого переименования, т.к. оно уже было)
  const reMergedAfterRenameMap = new Map();
  finalToolsWorkingList.forEach(item => {
      if (reMergedAfterRenameMap.has(item.name)) {
          const existingItem = reMergedAfterRenameMap.get(item.name);
          let itemToKeep = existingItem;
          let itemToDiscard = item;
          if ((item.total7d || 0) > (existingItem.total7d || 0)) { itemToKeep = item; itemToDiscard = existingItem; }
          const combinedNetworksSet = new Set([...itemToKeep.networks.map(n => n.name), ...itemToDiscard.networks.map(n => n.name)]);
          itemToKeep.networks = Array.from(combinedNetworksSet).sort().map(netName => ({ name: netName, icon: networkIconsMap[netName] || null }));
          reMergedAfterRenameMap.set(item.name, itemToKeep);
      } else {
          reMergedAfterRenameMap.set(item.name, item);
      }
  });
  finalToolsWorkingList = Array.from(reMergedAfterRenameMap.values());
  console.log(`  Count after final Re-Merge by Name: ${finalToolsWorkingList.length}`);

  // --- НАЧАЛО ОБНОВЛЕННОГО БЛОКА ИКОНОК ---
  // 7. Принудительные иконки для сетей
  console.log('  Applying specific network icon overrides...');
  
  // Bitkub
  const bitkubChainName = 'Bitkub';
  const bitkubIconUrl = 'https://icons.llamao.fi/icons/chains/rsz_kub?w=48&h=48';
  if (networkIconsMap.hasOwnProperty(bitkubChainName) || sortedAllNetworks.includes(bitkubChainName)) {
    networkIconsMap[bitkubChainName] = bitkubIconUrl;
    console.log(`    Forced icon for ${bitkubChainName}.`);
  }

  // Orai
  const oraiChainName = 'Orai'; // Имя сети
  const oraiIconUrl = 'https://icons.llamao.fi/icons/chains/rsz_oraichain?w=48&h=48'; // Новый URL
  if (networkIconsMap.hasOwnProperty(oraiChainName) || sortedAllNetworks.includes(oraiChainName)) {
      networkIconsMap[oraiChainName] = oraiIconUrl;
      console.log(`    Forced icon for ${oraiChainName}.`);
  }

  // Обновляем иконки Bitkub и Orai во всех DEX-ах, где они есть
  finalToolsWorkingList.forEach(item => {
    item.networks.forEach(network => {
      if (network.name === bitkubChainName) {
        network.icon = bitkubIconUrl;
      }
      if (network.name === oraiChainName) { // Добавлено для Orai
          network.icon = oraiIconUrl;
      }
    });
  });

  // NEW: Принудительная иконка для Bluefin Spot
  console.log('  Applying specific icon for Bluefin Spot...');
  const bluefinName = 'Bluefin Spot';
  const bluefinIconUrl = 'https://icons.llama.fi/bluefin.png';
  finalToolsWorkingList.forEach(item => {
      if (item.name === bluefinName) {
          item.icon = bluefinIconUrl;
          console.log(`    Forced icon for ${bluefinName}.`);
      }
  });

  // NEW: Принудительная иконка для Uniswap
  console.log('  Applying specific icon for Uniswap...');
  const uniswapName = 'Uniswap'; // Убедимся, что имя точное, возможно понадобится Uniswap V2/V3?
  const uniswapIconUrl = 'https://icons.llama.fi/uniswap.png';
  finalToolsWorkingList.forEach(item => {
      // Простое сравнение имени. Возможно, нужно учесть Uniswap V2, V3 и т.д.?
      if (item.name === uniswapName) {
          item.icon = uniswapIconUrl;
          console.log(`    Forced icon for ${uniswapName}.`);
      }
  });

  // 8. И финальная сортировка
  console.log('  Performing final sort by volume...');
  finalToolsWorkingList.sort((a, b) => (b.total7d || 0) - (a.total7d || 0));
  console.log(`Final sorting complete. Total DEXs: ${finalToolsWorkingList.length}`);

  // 9. Формирование итогового объекта `tools` для JSON
  console.log('  Preparing final JSON structure...');
  const finalToolsForJson = {};
  for (const item of finalToolsWorkingList) {
    finalToolsForJson[item.name] = {
      icon: item.icon,
      url: item.url,
      networks: item.networks
    };
  }
  // --- Конец специальных правок ---

  const output = {
    Data: {
      dexs: {
        info: {
          title: "DEXs",
          allNetworks: sortedAllNetworks, // Глобальный список сетей (обновленный)
          networkIcons: networkIconsMap    // Карта иконок (обновленная)
        },
        tools: finalToolsForJson // Финальный объект DEX-ов
      }
    }
  };

  const outputPath = path.join(__dirname, '..', 'data', 'dexs.json');
  try {
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nSuccessfully wrote ${Object.keys(finalToolsForJson).length} DEXs to ${outputPath}`);
  } catch (error) {
    console.error(`Error writing file ${outputPath}:`, error);
  }
}

build().catch(console.error);