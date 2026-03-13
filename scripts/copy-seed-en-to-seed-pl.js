/**
 * Kopiuje pliki seed-en/seed-themealdb-part-*.sql do seed-pl/seed-themealdb-pl-part-*.sql.
 * Użyj przed tłumaczeniem: najpierw pobierz przepisy (fetch-themealdb.js), potem skopiuj (ten skrypt), na końcu uruchom fix-seed-pl-translation.js.
 *
 * Uruchom: node scripts/copy-seed-en-to-seed-pl.js
 */

const fs = require('fs');
const path = require('path');

const SEED_EN = path.join(__dirname, '..', 'supabase', 'seed-en');
const SEED_PL = path.join(__dirname, '..', 'supabase', 'seed-pl');

const files = fs.readdirSync(SEED_EN)
  .filter((n) => n.startsWith('seed-themealdb-part-') && n.endsWith('.sql'))
  .sort((a, b) => {
    const na = parseInt(a.replace(/^seed-themealdb-part-(\d+)\.sql$/, '$1'), 10);
    const nb = parseInt(b.replace(/^seed-themealdb-part-(\d+)\.sql$/, '$1'), 10);
    return na - nb;
  });

if (files.length === 0) {
  console.error('Brak plików seed-themealdb-part-*.sql w', SEED_EN);
  console.error('Najpierw uruchom: node scripts/fetch-themealdb.js');
  process.exit(1);
}

if (!fs.existsSync(SEED_PL)) fs.mkdirSync(SEED_PL, { recursive: true });

for (const f of files) {
  const partNum = f.replace('seed-themealdb-part-', '').replace('.sql', '');
  const destName = `seed-themealdb-pl-part-${partNum}.sql`;
  fs.copyFileSync(path.join(SEED_EN, f), path.join(SEED_PL, destName));
  console.log('  ', f, '→', destName);
}

console.log('Skopiowano', files.length, 'plików. Teraz uruchom: node scripts/fix-seed-pl-translation.js');
console.log('Opcjonalnie: MYMEMORY_EMAIL=twoj@email.com (większy limit znaków/dzień).');
