/* global console, setTimeout */
// fetch-battle-kings-items.mjs
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://battlekings.club/items_info.php';
const OUTPUT_FILE = 'battle-kings-items-database.json';

// Rate limiting to be respectful to the server
const DELAY_MS = 500;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchItem(id) {
  try {
    const url = `${BASE_URL}?id=${id}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract item name (usually in h1 or title)
    const name = $('h1').first().text().trim() ||
                 $('title').text().split('/')[0].trim();

    if (!name || name.includes('Выберите')) return null;

    // Extract all stat lines
    const stats = {};
    $('*').each((i, elem) => {
      const text = $(elem).text().trim();

      // Match stat patterns like "+3" or "-2"
      const matches = text.match(/([A-Za-zА-Яа-я\s]+):\s*([+-]?\d+(?:\.\d+)?)/g);
      if (matches) {
        matches.forEach(match => {
          const [key, value] = match.split(':').map(s => s.trim());
          if (key && value) stats[key] = parseFloat(value) || value;
        });
      }
    });

    // Extract metadata
    const price = $('*').text().match(/Цена:\s*([\d.]+)\s*кр/)?.[1];
    const weight = $('*').text().match(/Масса:\s*([\d.]+)/)?.[1];
    const durability = $('*').text().match(/Долговечность:\s*([\d.]+)/)?.[1];

    return {
      id,
      name,
      price: price ? parseFloat(price) : null,
      weight: weight ? parseFloat(weight) : null,
      durability: durability ? parseFloat(durability) : null,
      stats,
      url
    };
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error.message);
    return null;
  }
}

async function fetchAllItems() {
  console.log('Starting Battle Kings item database fetch...');
  console.log(`Base URL: ${BASE_URL}`);

  const items = {};
  const validIds = [];

  // Start with a reasonable range - adjust based on needs
  // Most games have 500-5000 items; we'll try up to 1000 first
  const maxId = 1000;

  console.log(`Scanning for items (ID range 1-${maxId})...`);

  for (let id = 1; id <= maxId; id++) {
    if (id % 100 === 0) {
      console.log(`Progress: ${id}/${maxId} (Valid items: ${Object.keys(items).length})`);
    }

    const item = await fetchItem(id);

    if (item) {
      items[id] = item;
      validIds.push(id);
      console.log(`✓ Found item #${id}: ${item.name}`);
    }

    await sleep(DELAY_MS);
  }

  // Expand search if we're finding items near the end
  if (validIds[validIds.length - 1] > maxId - 50) {
    console.log('Found items near the limit, expanding search...');
    for (let id = maxId + 1; id <= maxId + 500; id++) {
      const item = await fetchItem(id);
      if (item) {
        items[id] = item;
        validIds.push(id);
        console.log(`✓ Found item #${id}: ${item.name}`);
      }
      await sleep(DELAY_MS);
    }
  }

  return items;
}

async function main() {
  const items = await fetchAllItems();

  const database = {
    metadata: {
      name: 'Battle Kings Item Database',
      url: 'https://battlekings.club/items_info.php',
      fetchedAt: new Date().toISOString(),
      totalItems: Object.keys(items).length,
      lastId: Math.max(...Object.keys(items).map(Number))
    },
    items
  };

  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));
  console.log(`\n✓ Database saved to ${OUTPUT_FILE}`);
  console.log(`Total items fetched: ${Object.keys(items).length}`);
}

main().catch(console.error);
