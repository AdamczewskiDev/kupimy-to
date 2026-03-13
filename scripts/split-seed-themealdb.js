/**
 * Dzieli duży plik seed na mniejsze części (Supabase SQL Editor ma limit rozmiaru).
 *
 * Domyślnie: node scripts/split-seed-themealdb.js  → czyta seed-en/seed-themealdb.sql, zapisuje part-* w seed-en/.
 * Polski:    node scripts/split-seed-themealdb.js seed-pl/seed-themealdb-pl.sql  → part-* w seed-pl/.
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = process.argv[2] || 'seed-en/seed-themealdb.sql';
const INPUT = path.join(__dirname, '..', 'supabase', INPUT_FILE);
const RECIPES_PER_PART = 25;

const content = fs.readFileSync(INPUT, 'utf8');
const lines = content.split('\n');

// Znajdź linię pierwszego "INSERT INTO recipes" (bez spacji na początku w pliku)
let firstRecipeIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('INSERT INTO recipes ')) {
    firstRecipeIdx = i;
    break;
  }
}

if (firstRecipeIdx < 0) {
  console.error('Nie znaleziono INSERT INTO recipes w pliku.');
  process.exit(1);
}

const headerLines = lines.slice(0, firstRecipeIdx);
const header = headerLines.join('\n');

// Bloki: każdy zaczyna się od "INSERT INTO recipes"
const blocks = [];
let current = [];
for (let i = firstRecipeIdx; i < lines.length; i++) {
  if (lines[i].startsWith('INSERT INTO recipes ')) {
    if (current.length) {
      blocks.push(current);
      current = [];
    }
  }
  current.push(lines[i]);
}
if (current.length) blocks.push(current);

console.log(`Przepisów: ${blocks.length}. Dzielę na części po ${RECIPES_PER_PART}...`);

const outDir = path.dirname(INPUT);
let part = 1;
for (let start = 0; start < blocks.length; start += RECIPES_PER_PART) {
  const chunk = blocks.slice(start, start + RECIPES_PER_PART);
  const body = chunk.map((b) => b.join('\n')).join('\n\n');
  const full = part === 1 ? header + '\n\n' + body : body;
  const baseName = path.basename(INPUT_FILE, '.sql');
  const outPath = path.join(outDir, `${baseName}-part-${String(part).padStart(2, '0')}.sql`);
  fs.writeFileSync(outPath, full, 'utf8');
  console.log(`  ${outPath} (${chunk.length} przepisów)`);
  part++;
}

console.log(`Gotowe. Uruchom pliki part-01, part-02, ... po kolei w Supabase SQL Editor.`);
