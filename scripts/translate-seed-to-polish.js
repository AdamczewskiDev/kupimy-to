/**
 * Tłumaczy plik seed-themealdb.sql (EN → PL) i zapisuje seed-themealdb-pl.sql.
 * Wymaga: npm install google-translate-api-x (w katalogu głównym projektu).
 *
 * Uruchom: node scripts/translate-seed-to-polish.js
 * Opcjonalnie limit przepisów (do testów): node scripts/translate-seed-to-polish.js 10
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'supabase', 'seed-en', 'seed-themealdb.sql');
const OUTPUT = path.join(__dirname, '..', 'supabase', 'seed-pl', 'seed-themealdb-pl.sql');
const LIMIT_RECIPES = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const BATCH_SIZE = 15;
const DELAY_MS = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function unescapeSql(s) {
  return s.replace(/''/g, "'");
}
function escapeSql(s) {
  if (s == null || s === '') return "''";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function looksEnglish(text) {
  if (!text || text.length < 2) return false;
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) return false;
  return /\b(the|and|with|for|into|from|over|until|about|your|heat|stir|add|cook|serve|salt|pepper)\b/i.test(text) || /[a-zA-Z]{3,}/.test(text.slice(0, 100));
}

async function main() {
  let translate;
  try {
    const mod = await import('google-translate-api-x');
    translate = mod.default || mod.translate;
  } catch (e) {
    console.error('Zainstaluj pakiet w katalogu głównym: npm install google-translate-api-x');
    process.exit(1);
  }

  const cache = new Map();
  async function trOne(text) {
    const key = text.trim();
    if (!key) return text;
    if (cache.has(key)) return cache.get(key);
    if (!looksEnglish(key)) {
      cache.set(key, text);
      return text;
    }
    try {
      const res = await translate(key, { to: 'pl', client: 'gtx' });
      const out = (res && res.text) ? String(res.text).trim() : key;
      cache.set(key, out);
      return out;
    } catch (e) {
      cache.set(key, key);
      return key;
    }
  }

  async function translateBatch(keys) {
    const todo = keys.filter((k) => k && looksEnglish(k.trim()) && !cache.has(k.trim()));
    if (todo.length === 0) return;
    for (let i = 0; i < todo.length; i += BATCH_SIZE) {
      const chunk = todo.slice(i, i + BATCH_SIZE);
      await Promise.all(chunk.map(async (text) => {
        const key = text.trim();
        if (cache.has(key)) return;
        try {
          const res = await translate(key, { to: 'pl', client: 'gtx' });
          cache.set(key, (res && res.text) ? String(res.text).trim() : key);
        } catch {
          cache.set(key, key);
        }
      }));
      await sleep(DELAY_MS);
    }
  }

  const outDir = path.dirname(OUTPUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  console.log('Wczytywanie pliku...');
  const content = fs.readFileSync(INPUT, 'utf8');
  const lines = content.split('\n');

  const reRecipe = /^INSERT INTO recipes \(id, name, description, meal_type, servings\) VALUES \('([^']*)', '((?:[^']|'')*)', '((?:[^']|'')*)', '(breakfast|lunch|afternoon_snack)', (\d+)\)/;
  const reIng = /^INSERT INTO recipe_ingredients \(recipe_id, ingredient_label, quantity, unit, position\) VALUES \('([^']*)', '((?:[^']|'')*)', ([\d.]+), '(szt|g|kg|ml|l|opak)', (\d+)\);/;
  const reStep = /^INSERT INTO recipe_steps \(recipe_id, position, instruction\) VALUES \('([^']*)', (\d+), '((?:[^']|'')*)'\);/;

  const headerEnd = lines.findIndex((l) => l.startsWith('INSERT INTO recipes '));
  const header = lines.slice(0, headerEnd).join('\n');

  const blocks = [];
  let i = headerEnd;
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

  const recipeBlocks = [];
  let current = [];
  for (const b of blocks) {
    if (b.type === 'recipe') {
      if (current.length) recipeBlocks.push(current);
      current = [b];
    } else {
      current.push(b);
    }
  }
  if (current.length) recipeBlocks.push(current);

  let toProcess = recipeBlocks;
  if (LIMIT_RECIPES != null && !isNaN(LIMIT_RECIPES)) {
    toProcess = recipeBlocks.slice(0, LIMIT_RECIPES);
    console.log('Limit: tylko pierwsze', toProcess.length, 'przepisów.');
  }

  const uniqueStrings = new Set();
  for (const block of toProcess) {
    for (const row of block) {
      if (row.type === 'recipe' && row.name) uniqueStrings.add(row.name);
      if (row.type === 'recipe' && row.description) uniqueStrings.add(row.description);
      if (row.type === 'ingredient' && row.ingredient_label) uniqueStrings.add(row.ingredient_label);
      if (row.type === 'step' && row.instruction) uniqueStrings.add(row.instruction);
    }
  }
  const arr = Array.from(uniqueStrings);
  console.log('Unikalnych tekstów do tłumaczenia:', arr.length);
  console.log('Tłumaczenie batchami (EN → PL)...');
  await translateBatch(arr);

  function tr(text) {
    if (!text || !text.trim()) return text;
    const key = text.trim();
    return cache.get(key) || text;
  }

  const outLines = [header, ''];
  for (const block of toProcess) {
    for (const row of block) {
      if (row.type === 'recipe') {
        outLines.push(`INSERT INTO recipes (id, name, description, meal_type, servings) VALUES (${escapeSql(row.id)}, ${escapeSql(tr(row.name))}, ${escapeSql(tr(row.description))}, ${escapeSql(row.meal_type)}, ${row.servings}) ON CONFLICT (id) DO NOTHING;`);
      } else if (row.type === 'ingredient') {
        outLines.push(`INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES (${escapeSql(row.recipe_id)}, ${escapeSql(tr(row.ingredient_label))}, ${row.quantity}, ${escapeSql(row.unit)}, ${row.position});`);
      } else if (row.type === 'step') {
        outLines.push(`INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES (${escapeSql(row.recipe_id)}, ${row.position}, ${escapeSql(tr(row.instruction))});`);
      } else {
        outLines.push(row.line);
      }
    }
    outLines.push('');
  }

  fs.writeFileSync(OUTPUT, outLines.join('\n'), 'utf8');
  console.log('Zapisano:', OUTPUT);
  console.log('Cache tłumaczeń:', cache.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
