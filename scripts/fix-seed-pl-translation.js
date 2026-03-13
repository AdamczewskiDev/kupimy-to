/**
 * Sprawdza pliki part-* w supabase/seed-pl/, wykrywa nieprzetłumaczone (angielskie) fragmenty,
 * tłumaczy je na polski i zapisuje każdy part po kolei (part-01, part-02, …).
 *
 * Dwa providery (env TRANSLATE_PROVIDER):
 *   mymemory (domyślny) – MyMemory API, bez klucza, łagodne limity; bez 429.
 *   google   – Google (google-translate-api-x), często 429; skrypt wysyła 1 żądanie na raz, 12 s przerwy.
 *
 * Opcjonalnie: MYMEMORY_EMAIL=twoj@email.com (zwiększa limit MyMemory do 50k znaków/dzień).
 * Cache: .translation-cache.json (wznawianie przy ponownym uruchomieniu).
 *
 * Uruchom: node scripts/fix-seed-pl-translation.js
 * Opcjonalnie: LIMIT_PARTS=3, LIMIT_TRANSLATE=50
 */

const fs = require('fs');
const path = require('path');

const SEED_PL_DIR = path.join(__dirname, '..', 'supabase', 'seed-pl');
const CACHE_FILE = path.join(SEED_PL_DIR, '.translation-cache.json');
const MYMEMORY_MAX_BYTES = 500;
const MYMEMORY_DELAY_MS = 1800;
const GOOGLE_DELAY_MS = 12000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function unescapeSql(s) {
  return s.replace(/''/g, "'");
}
function escapeSql(s) {
  if (s == null || s === '') return "''";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

/** Tekst wygląda na angielski (powinien być przetłumaczony). */
function looksEnglish(text) {
  if (!text || text.length < 2) return false;
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) return false;
  const enWords = /\b(the|and|with|for|into|from|over|until|about|your|heat|stir|add|cook|serve|salt|pepper|step|put|mix|fry|boil|water|pan|bowl|minutes|cheese|eggs|garlic|pasta|sauce|discard|sprinkle|ready|lift|don't|when|while|leave|take|keep|drop|tip|finely|grate|beat|season|set|remove|chop|squash|peeled|cloves|blade|knife|bruise|unsalted|butter|melted|slotted|spoon|impart|flavour|crisp|golden|often|medium|low|fork|tongs|throw|away|worry|little|happen|want|handful|back|later|quickly|pour|thickens|scramble|coated|extra|moist|wet|tablespoons|needed|long-pronged|twist|serving|plate|immediately|grating|dish|dry|before|splash|glossy|revived)\b/i;
  if (enWords.test(text)) return true;
  if (/\bSTEP\s*\d+\b/i.test(text)) return true;
  if (/^[A-Za-z0-9\s\.,;:'"\-\(\)]+$/.test(text) && /[a-zA-Z]{4,}/.test(text)) return true;
  return false;
}

const reRecipe = /^INSERT INTO recipes \(id, name, description, meal_type, servings\) VALUES \('([^']*)', '((?:[^']|'')*)', '((?:[^']|'')*)', '(breakfast|lunch|afternoon_snack)', (\d+)\)/;
const reIng = /^INSERT INTO recipe_ingredients \(recipe_id, ingredient_label, quantity, unit, position\) VALUES \('([^']*)', '((?:[^']|'')*)', ([\d.]+), '(szt|g|kg|ml|l|opak)', (\d+)\);/;
const reStep = /^INSERT INTO recipe_steps \(recipe_id, position, instruction\) VALUES \('([^']*)', (\d+), '((?:[^']|'')*)'\);/;

/** Parsuje zawartość pliku part → { header, blocks }. */
function parsePartContent(content) {
  const lines = content.split('\n');
  const headerEnd = lines.findIndex((l) => l.startsWith('INSERT INTO recipes '));
  const header = headerEnd >= 0 ? lines.slice(0, headerEnd).join('\n') : content;
  const start = headerEnd >= 0 ? headerEnd : 0;
  const blocks = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    const mRecipe = line.match(reRecipe);
    if (mRecipe) {
      const [, id, name, desc, meal, servings] = mRecipe;
      blocks.push({ type: 'recipe', id, name: unescapeSql(name), description: unescapeSql(desc), meal_type: meal, servings });
      i++;
      continue;
    }
    const mIng = line.match(reIng);
    if (mIng) {
      const [, rid, label, qty, unit, pos] = mIng;
      blocks.push({ type: 'ingredient', recipe_id: rid, ingredient_label: unescapeSql(label), quantity: qty, unit, position: pos });
      i++;
      continue;
    }
    const mStep = line.match(reStep);
    if (mStep) {
      const [, rid, pos, instruction] = mStep;
      blocks.push({ type: 'step', recipe_id: rid, position: pos, instruction: unescapeSql(instruction) });
      i++;
      continue;
    }
    blocks.push({ type: 'raw', line });
    i++;
  }
  return { header: headerEnd >= 0 ? header : '', blocks };
}

/** Zbiera z bloków fragmenty do tłumaczenia. */
function collectToTranslate(blocks) {
  const set = new Set();
  for (const b of blocks) {
    if (b.type === 'recipe' && b.name && looksEnglish(b.name)) set.add(b.name);
    if (b.type === 'recipe' && b.description && looksEnglish(b.description)) set.add(b.description);
    if (b.type === 'ingredient' && b.ingredient_label && looksEnglish(b.ingredient_label)) set.add(b.ingredient_label);
    if (b.type === 'step' && b.instruction && looksEnglish(b.instruction)) set.add(b.instruction);
  }
  return Array.from(set);
}

function sliceByBytes(str, maxBytes) {
  const buf = Buffer.from(str, 'utf8');
  if (buf.length <= maxBytes) return str;
  let end = maxBytes;
  while (end > 0 && (buf[end] & 0xc0) === 0x80) end--;
  return buf.slice(0, end).toString('utf8');
}

/** MyMemory API: GET, max 500 bajtów na żądanie. Dłuższe teksty dzielone po słowach. */
async function translateWithMyMemory(text) {
  const email = process.env.MYMEMORY_EMAIL || '';
  const enc = (s) => encodeURIComponent(s);
  const chunks = [];
  let rest = text.trim();
  while (Buffer.byteLength(rest, 'utf8') > MYMEMORY_MAX_BYTES) {
    let cut = sliceByBytes(rest, MYMEMORY_MAX_BYTES);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 80) cut = cut.slice(0, lastSpace + 1);
    rest = rest.slice(cut.length).trim();
    const url = `https://api.mymemory.translated.net/get?q=${enc(cut)}&langpair=en|pl${email ? '&de=' + enc(email) : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    const t = data?.responseData?.translatedText;
    chunks.push(t != null ? t : cut);
    await sleep(400);
  }
  if (rest.length > 0) {
    const url = `https://api.mymemory.translated.net/get?q=${enc(rest)}&langpair=en|pl${email ? '&de=' + enc(email) : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    const t = data?.responseData?.translatedText;
    chunks.push(t != null ? t : rest);
  }
  return chunks.join(chunks.length > 1 ? ' ' : '').trim();
}

/** Tłumaczy listę tekstów (tylko brakujące w cache), aktualizuje cache. */
async function translateBatch(arr, cache, translateFn, limitTranslate) {
  let list = arr.filter((k) => !cache.has(k));
  if (limitTranslate != null && limitTranslate > 0) list = list.slice(0, limitTranslate);
  const provider = (process.env.TRANSLATE_PROVIDER || 'mymemory').toLowerCase();
  const isGoogle = provider === 'google';

  for (let i = 0; i < list.length; i++) {
    const key = list[i].trim();
    if (cache.has(key)) continue;
    let out = key;
    if (isGoogle) {
      const maxRetries = 3;
      const backoffMs = [5000, 15000, 45000];
      for (let r = 0; r <= maxRetries; r++) {
        try {
          const res = await translateFn(key, { from: 'en', to: 'pl', client: 'gtx' });
          out = (res && res.text) ? String(res.text).trim() : key;
          break;
        } catch (e) {
          const is429 = (e && e.cause && e.cause.response && e.cause.response.status === 429) || (e.message && e.message.includes('Too Many Requests'));
          const wait = is429 ? (backoffMs[r] || 60000) : 3000 * (r + 1);
          if (r < maxRetries) {
            console.warn('    Retry za', Math.round(wait / 1000), 's:', e.message || e);
            await sleep(wait);
          }
        }
      }
    } else {
      try {
        out = await translateWithMyMemory(key);
      } catch (e) {
        console.warn('    MyMemory błąd:', e.message || e);
      }
    }
    cache.set(key, out);
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache), null, 0), 'utf8');
    } catch (_) {}
    await sleep(isGoogle ? GOOGLE_DELAY_MS : MYMEMORY_DELAY_MS);
    if ((i + 1) % 10 === 0 || i === list.length - 1) console.log('    Przetłumaczono', i + 1, '/', list.length);
  }
}

/** Buduje wynikową treść partu z użyciem cache. */
function buildPartContent(header, blocks, cache) {
  function tr(text) {
    if (!text || !text.trim()) return text;
    return cache.get(text.trim()) || text;
  }
  let out = header ? header + '\n\n' : '';
  for (const row of blocks) {
    if (row.type === 'recipe') {
      out += `INSERT INTO recipes (id, name, description, meal_type, servings) VALUES (${escapeSql(row.id)}, ${escapeSql(tr(row.name))}, ${escapeSql(tr(row.description))}, ${escapeSql(row.meal_type)}, ${row.servings}) ON CONFLICT (id) DO NOTHING;\n`;
    } else if (row.type === 'ingredient') {
      out += `INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES (${escapeSql(row.recipe_id)}, ${escapeSql(tr(row.ingredient_label))}, ${row.quantity}, ${escapeSql(row.unit)}, ${row.position});\n`;
    } else if (row.type === 'step') {
      out += `INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES (${escapeSql(row.recipe_id)}, ${row.position}, ${escapeSql(tr(row.instruction))});\n`;
    } else {
      out += row.line + '\n';
    }
  }
  const replacements = [];
  for (const [key, value] of cache) {
    if (value !== key) replacements.push({ key, value });
  }
  replacements.sort((a, b) => b.key.length - a.key.length);
  for (const { key, value } of replacements) {
    const from = escapeSql(key);
    const to = escapeSql(value);
    if (from !== to && out.includes(from)) out = out.split(from).join(to);
  }
  return out.trimEnd() + '\n';
}

async function main() {
  const provider = (process.env.TRANSLATE_PROVIDER || 'mymemory').toLowerCase();
  let translateFn = null;
  if (provider === 'google') {
    try {
      const mod = await import('google-translate-api-x');
      translateFn = mod.default || mod.translate;
    } catch (e) {
      console.error('Zainstaluj: npm install google-translate-api-x');
      process.exit(1);
    }
  }
  console.log('Provider tłumaczeń:', provider === 'google' ? 'Google (1 żądanie / 12 s)' : 'MyMemory (1 żądanie / 1.8 s)');
  if (provider !== 'google' && !process.env.MYMEMORY_EMAIL) {
    console.log('Tip: MYMEMORY_EMAIL=twoj@email.com zwiększa limit do 50k znaków/dzień.\n');
  }

  const partFiles = fs.readdirSync(SEED_PL_DIR)
    .filter((n) => n.startsWith('seed-themealdb-pl-part-') && n.endsWith('.sql'))
    .sort((a, b) => {
      const na = parseInt(a.replace(/^seed-themealdb-pl-part-(\d+)\.sql$/, '$1'), 10);
      const nb = parseInt(b.replace(/^seed-themealdb-pl-part-(\d+)\.sql$/, '$1'), 10);
      return na - nb;
    });

  if (partFiles.length === 0) {
    console.error('Brak plików seed-themealdb-pl-part-*.sql w', SEED_PL_DIR);
    process.exit(1);
  }

  const limitParts = process.env.LIMIT_PARTS ? parseInt(process.env.LIMIT_PARTS, 10) : null;
  const limitTranslate = process.env.LIMIT_TRANSLATE ? parseInt(process.env.LIMIT_TRANSLATE, 10) : null;
  const partsToRun = limitParts != null && limitParts > 0 ? partFiles.slice(0, limitParts) : partFiles;

  console.log('Pliki part do przetworzenia (po kolei):', partsToRun.length, limitParts ? `(limit: ${limitParts})` : '');

  const cache = new Map();
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      for (const [k, v] of Object.entries(data)) cache.set(k, v);
      console.log('Wczytano cache tłumaczeń:', cache.size, 'wpisów\n');
    } catch (e) {
      console.warn('Nie udało się wczytać cache:', e.message, '\n');
    }
  }

  for (let idx = 0; idx < partsToRun.length; idx++) {
    const partName = partsToRun[idx];
    const partPath = path.join(SEED_PL_DIR, partName);
    const partNum = idx + 1;
    console.log(`--- Part ${String(partNum).padStart(2, '0')}: ${partName} ---`);

    const content = fs.readFileSync(partPath, 'utf8');
    const { header, blocks } = parsePartContent(content);
    const toTranslate = collectToTranslate(blocks);

    if (toTranslate.length === 0) {
      console.log('  Brak nieprzetłumaczonych fragmentów. Pomijam.\n');
      continue;
    }

    console.log('  Nieprzetłumaczone fragmenty:', toTranslate.length);
    await translateBatch(toTranslate, cache, translateFn, limitTranslate);
    const newContent = buildPartContent(header, blocks, cache);
    fs.writeFileSync(partPath, newContent, 'utf8');
    console.log('  Zapisano:', partPath, '\n');
  }

  console.log('Gotowe.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
