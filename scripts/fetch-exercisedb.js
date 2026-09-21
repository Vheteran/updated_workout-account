const fs = require('fs');
const path = require('path');

const HOST = 'exercisedb.p.rapidapi.com';
const CACHE = path.join('scripts', '.exercisedb-cache.json');

function readKey() {
  const line = fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('EXPO_PUBLIC_RAPIDAPI_KEY='));
  return (line ? line.slice('EXPO_PUBLIC_RAPIDAPI_KEY='.length) : '').trim();
}

async function pageAll(urlPath, headers, maxPages = 60) {
  const out = [];
  for (let page = 0; page < maxPages; page += 1) {
    const sep = urlPath.includes('?') ? '&' : '?';
    const res = await fetch(`https://${HOST}${urlPath}${sep}limit=10&offset=${page * 10}`, { headers });
    if (!res.ok) {
      console.log(`stopped at offset ${page * 10}: status ${res.status}`);
      break;
    }
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) break;
    out.push(...list);
    if (list.length < 10) break;
  }
  return out;
}

(async () => {
  const headers = { 'X-RapidAPI-Key': readKey(), 'X-RapidAPI-Host': HOST };
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

  for (const equipment of ['body weight', 'dumbbell']) {
    if (cache[equipment]?.length) {
      console.log(`${equipment}: ${cache[equipment].length} cached`);
      continue;
    }
    const list = await pageAll(`/exercises/equipment/${encodeURIComponent(equipment)}`, headers);
    const seen = new Set();
    cache[equipment] = list
      .filter((i) => (seen.has(String(i.id)) ? false : seen.add(String(i.id))))
      .map((i) => ({ id: String(i.id), name: i.name, equipment: i.equipment, target: i.target, bodyPart: i.bodyPart }));
    console.log(`${equipment}: fetched ${cache[equipment].length}`);
    fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  }

  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  console.log('total cached:', Object.values(cache).reduce((sum, l) => sum + l.length, 0));
})();
