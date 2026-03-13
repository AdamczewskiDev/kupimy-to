/**
 * Pobiera przepisy z WikiKuchnia.org (za zgodą) i zapisuje do seed-pl w partach.
 * Źródło: https://www.wikikuchnia.org/ – przepisy po polsku, jednostki PL → g/ml/l/kg/szt/opak.
 *
 * Działanie:
 * - Pobiera listę przepisów z wybranych kategorii (Śniadania, Zupy, Ciasta, Desery, …).
 * - Dla każdego przepisu: pobiera stronę, wyciąga tytuł, sekcje Składniki i Sposób przyrządzania.
 * - Parsuje składniki (szklanka→ml/g, łyżka→ml, g, kg, l, szt, opak itd.).
 * - Zapisuje SQL do seed-pl/seed-wikikuchnia-part-01.sql, part-02.sql, … (po 25 przepisów).
 *
 * Uwaga: Nie wszystkie strony mają taki sam układ HTML; przepisy bez sekcji Składniki/Sposób
 * są pomijane. Uruchom bez limitu, żeby pobrać maksymalnie dużo pasujących.
 *
 * Uruchom: node scripts/fetch-wikikuchnia.js
 * Limit:   node scripts/fetch-wikikuchnia.js 50
 */

const MAX_RECIPES = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const RECIPES_PER_PART = 25;
const BASE = 'https://www.wikikuchnia.org';
const DELAY_MS = 800;

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEED_PL = path.join(__dirname, '..', 'supabase', 'seed-pl');

/** Kategorie do przeszukania (ścieżki) + mapowanie na meal_type. */
const CATEGORIES = [
  { path: 'Kategoria:%C5%9Aniadania', meal_type: 'breakfast' },
  { path: 'Kategoria:Zupy', meal_type: 'lunch' },
  { path: 'Kategoria:Ciasta', meal_type: 'afternoon_snack' },
  { path: 'Kategoria:Desery', meal_type: 'afternoon_snack' },
  { path: 'Kategoria:Makarony', meal_type: 'lunch' },
  { path: 'Kategoria:Warzywne', meal_type: 'lunch' },
  { path: 'Kategoria:Wo%C5%82owina', meal_type: 'lunch' },
  { path: 'Kategoria:Wieprzowina', meal_type: 'lunch' },
  { path: 'Kategoria:Ptactwo', meal_type: 'lunch' },
  { path: 'Kategoria:Ryby', meal_type: 'lunch' },
  { path: 'Kategoria:Sa%C5%82aty', meal_type: 'lunch' },
  { path: 'Kategoria:Sur%C3%B3wki', meal_type: 'lunch' },
  { path: 'Kategoria:Przek%C4%85ski', meal_type: 'afternoon_snack' },
  { path: 'Kategoria:Napoje_bezalkoholowe', meal_type: 'afternoon_snack' },
];

function slugToUuid(slug) {
  const hex = crypto.createHash('sha256').update('wikikuchnia-' + slug).digest('hex').slice(0, 12);
  return `10000000-0000-4000-8000-${hex}`;
}

function escapeSql(s) {
  if (s == null || s === '') return "''";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

/** Słowa liczebników PL → liczba. */
const NUM_WORDS = {
  jeden: 1, jedna: 1, jedno: 1, dwa: 2, dwie: 2, trzy: 3, cztery: 4, pięć: 5, sześć: 6,
  siedem: 7, osiem: 8, dziewięć: 9, dziesięć: 10, kilkanaście: 12, kilkadziesiąt: 30,
  pół: 0.5, pol: 0.5, ćwiartka: 0.25, cwiartka: 0.25,
};

function parseQuantityFromText(text) {
  const t = text.trim().toLowerCase();
  const numMatch = t.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1].replace(',', '.'));
  for (const [word, n] of Object.entries(NUM_WORDS)) {
    if (t.startsWith(word + ' ') || t.startsWith(word + ',') || t === word) return n;
  }
  return 1;
}

/** Parsuje linię składnika (np. "1 szklanka cukru", "pęczek szczypiorku", "ok. 3,5 litra wody"). */
function parseIngredientLine(line) {
  const raw = line.replace(/^-\s*/, '').trim();
  if (!raw) return null;
  let quantity = 1;
  let unit = 'szt';
  let label = raw;

  const lower = raw.toLowerCase();
  if (/\b(g\b|gram|gramy|gramów)\b/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    const gMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*g\b/i) || raw.match(/\b(\d+(?:[.,]\d+)?)\s*gram/i);
    quantity = gMatch ? parseFloat(gMatch[1].replace(',', '.')) : n;
    unit = 'g';
    label = raw.replace(/^\d+([.,]\d+)?\s*(g\b|gram\w*)\s*/i, '').replace(/\s*\d+([.,]\d+)?\s*(g\b|gram\w*)\s*$/i, '').trim() || raw;
  } else if (/\b(kg|kilogram)\b/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    const kgMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
    quantity = kgMatch ? parseFloat(kgMatch[1].replace(',', '.')) : n;
    unit = 'kg';
    label = raw.replace(/^\d+([.,]\d+)?\s*kg\w*\s*/i, '').trim() || raw;
  } else if (/\b(l\b|litr|litra|litrów|litry)\b/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    const lMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*l\b/i) || raw.match(/(\d+(?:[.,]\d+)?)\s*litr/i);
    quantity = lMatch ? parseFloat(lMatch[1].replace(',', '.')) : n;
    unit = 'l';
    label = raw.replace(/^\d+([.,]\d+)?\s*(l\b|litr\w*)\s*/i, '').replace(/\s*ok\.?\s*/gi, '').trim() || raw;
  } else if (/\b(ml|mililitr)\b/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    const mlMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
    quantity = mlMatch ? parseFloat(mlMatch[1].replace(',', '.')) : n;
    unit = 'ml';
    label = raw.replace(/^\d+([.,]\d+)?\s*ml\w*\s*/i, '').trim() || raw;
  } else if (/\b(szklanka|szklanki|szklanek)\b/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    const liq = /\b(woda|mleko|olej|sok|śmietana|mleko|bulion|rosół|wino)\b/i.test(raw);
    quantity = liq ? Math.round(n * 250) : Math.round(n * 200);
    unit = liq ? 'ml' : 'g';
    label = raw.replace(/^\d+([.,]\d+)?\s*szklan\w*\s+/i, '').replace(/^(pół|pol)\s+szklan\w*\s+/i, '').trim() || raw;
  } else if (/\b(łyżka|łyżki|łyżek|lyzka)\b/i.test(lower) && !/\błyżeczka/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    quantity = Math.round(n * 15);
    unit = 'ml';
    label = raw.replace(/^\d+\s*łyż\w*\s+/i, '').replace(/^(pół|pol)\s+łyż\w*\s+/i, '').trim() || raw;
  } else if (/\b(łyżeczka|łyżeczki|łyżeczek)\b/i.test(lower)) {
    const n = parseQuantityFromText(raw);
    quantity = Math.round(n * 5);
    unit = 'ml';
    label = raw.replace(/^\d+\s*łyżecz\w*\s+/i, '').trim() || raw;
  } else if (/\b(pęczek|pęczki|peczek)\b/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+\s*pęcz\w*\s+/i, '').replace(/^pęczek\s+/i, '').trim() || raw;
  } else if (/\b(plaster|plastry|plastra)\b/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+\s*plastr\w*\s+/i, '').replace(/^(osiem|dwa|trzy)\s+plastr\w*\s+/i, '').trim() || raw;
  } else if (/\b(ząbek|ząbki|ząbków)\s+(czosnku)?/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+\s*żąb\w*\s*(czosnku)?\s*/i, '').trim() || 'czosnek';
  } else if (/\b(opakowanie|opakowania|opak)\b/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'opak';
    label = raw.replace(/^\d+\s*opak\w*\s+/i, '').trim() || raw;
  } else if (/\b(kostka|kostki)\b/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+\s*kost\w*\s+/i, '').trim() || raw;
  } else if (/\b(sztuka|sztuki|sztuk|szt\.?)\b/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+\s*szt\w*\s+/i, '').trim() || raw;
  } else if (/\b(jajko|jajka|jajek)\b/i.test(lower)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+\s*jaj\w*\s+/i, '').replace(/^(dwa|trzy|cztery)\s+ugotowane\s+jaj\w*\s*/i, '').trim() || 'jajko';
  } else if (/^\d+\s+\w+/.test(raw)) {
    quantity = parseQuantityFromText(raw);
    unit = 'szt';
    label = raw.replace(/^\d+([.,]\d+)?\s*/, '').replace(/^(dwa|trzy|cztery|osiem)\s+/, '').trim() || raw;
  } else {
    label = raw;
  }

  if (!label || label.length < 2) return null;
  return { ingredient_label: label.trim(), quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity, unit };
}

function stripHtml(s) {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Wyciąga z HTML strony: tytuł, porcje, składniki, sposób (bezpośrednio z HTML MediaWiki). */
function parseRecipePage(html, url) {
  const full = typeof html === 'string' ? html : '';
  const contentStart = full.indexOf('id="mw-content-text"');
  let raw = full;
  if (contentStart >= 0) {
    const slice = full.slice(contentStart);
    const parserEnd = slice.indexOf('id="mw-data-after-content"');
    raw = parserEnd >= 0 ? slice.slice(0, parserEnd) : slice;
  }
  raw = raw.replace(/<div[^>]+id="toc"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');

  let title = url.split('/').pop()?.replace(/_/g, ' ') || 'Przepis';
  const titleMatch = full.match(/<h1[^>]*>[\s\S]*?<span[^>]*class="fn"[^>]*>([^<]+)<\/span>/i) || full.match(/<title>([^–|<]+)/);
  if (titleMatch) title = stripHtml(titleMatch[1]);

  let servings = 4;
  const porcjeMatch = raw.match(/Ilość porcji[:\s]*(\d+)/i);
  if (porcjeMatch) servings = parseInt(porcjeMatch[1], 10) || 4;

  const ingredients = [];
  let skladnikiHead = raw.search(/<h2[^>]*>[\s\S]*?<span[^>]*class="mw-headline"[^>]*>[\s\S]*?Składniki/i);
  if (skladnikiHead < 0) skladnikiHead = raw.search(/<h2[^>]*>[\s\S]*?Składniki/i);
  if (skladnikiHead >= 0) {
    const after = raw.slice(skladnikiHead);
    const ulRegex = /<ul>([\s\S]*?)<\/ul>/g;
    let ulMatch;
    while ((ulMatch = ulRegex.exec(after)) !== null) {
      const firstLi = ulMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/);
      const firstText = firstLi ? stripHtml(firstLi[1]) : '';
      if (/Orientacyjny koszt|Ilość porcji|Czas przygotowania|Kaloryczność/i.test(firstText)) continue;
      const liAll = ulMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g);
      if (liAll) {
        for (const liBlock of liAll) {
          const m = liBlock.match(/<li[^>]*>([\s\S]*?)<\/li>/);
          if (m) {
            const line = '- ' + stripHtml(m[1]);
            const ing = parseIngredientLine(line);
            if (ing) ingredients.push(ing);
          }
        }
      }
      break;
    }
  }

  const steps = [];
  let sposobHead = raw.search(/<h2[^>]*>[\s\S]*?<span[^>]*class="mw-headline"[^>]*>[\s\S]*?Sposób\s*przyrządzania/i);
  if (sposobHead < 0) sposobHead = raw.search(/<h2[^>]*>[\s\S]*?Sposób\s*przyrządzania/i);
  if (sposobHead >= 0) {
    const after = raw.slice(sposobHead);
    const nextH2 = after.indexOf('<h2', 10);
    const block = (nextH2 > 0 ? after.slice(0, nextH2) : after)
      .replace(/<h2[\s\S]*?<\/h2>/i, '')
      .replace(/<p>/g, '\n')
      .replace(/<\/p>/g, '\n');
    const text = stripHtml(block);
    const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
    if (paragraphs.length > 0) paragraphs.forEach((p) => steps.push(p));
    else if (text.length > 20) steps.push(text);
  }

  return { title, servings, ingredients, steps };
}

/** Z treści strony kategorii wyciąga linki do przepisów (href do /przepisy/... lub pełny URL). */
function extractRecipeLinksFromCategory(html) {
  const links = new Set();
  const hrefRegex = /href="(?:https?:\/\/[^"]*wikikuchnia\.org)?(\/przepisy\/[^"#?]+)/g;
  let m;
  while ((m = hrefRegex.exec(html)) !== null) {
    let path = m[1].replace(/^\/przepisy\//, '').split('/')[0].split('?')[0];
    if (path.includes('Kategoria') || path.includes('Specjalna') || path.includes('Dyskusja') || path.includes('index.php')) continue;
    try {
      path = decodeURIComponent(path);
    } catch (_) {}
    if (path && path.length > 1) links.add(path);
  }
  return Array.from(links);
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'Accept': 'text/html', 'User-Agent': 'WikiKuchnia-Import/1.0' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

async function main() {
  if (!fs.existsSync(SEED_PL)) fs.mkdirSync(SEED_PL, { recursive: true });

  console.log('Zbieranie listy przepisów z kategorii...');
  const urlToCategory = new Map();
  const seenSlugs = new Set();
  const allSlugs = [];

  for (const cat of CATEGORIES) {
    const url = `${BASE}/przepisy/${cat.path}`;
    try {
      const html = await fetchText(url);
      const slugs = extractRecipeLinksFromCategory(html);
      for (const slug of slugs) {
        if (!seenSlugs.has(slug)) {
          seenSlugs.add(slug);
          urlToCategory.set(slug, cat.meal_type);
          allSlugs.push(slug);
        }
      }
      console.log('  ', cat.path.replace('Kategoria:', ''), '→', slugs.length, 'linków');
    } catch (e) {
      console.warn('  Błąd kategorii', cat.path, e.message);
    }
    await sleep(300);
  }

  allSlugs.sort((a, b) => a.localeCompare(b, 'pl'));
  let toFetch = allSlugs;
  if (MAX_RECIPES != null && MAX_RECIPES > 0) {
    toFetch = allSlugs.slice(0, MAX_RECIPES);
    console.log('Limit:', toFetch.length, 'przepisów.');
  } else {
    console.log('Unikalnych przepisów:', toFetch.length);
  }

  const headerLines = [
    '-- Przepisy z WikiKuchnia.org (https://www.wikikuchnia.org/) – za zgodą.',
    '-- Wygenerowano: ' + new Date().toISOString(),
    '-- Jednostki: g, ml, l, kg, szt, opak.',
    '',
    "DELETE FROM recipe_steps WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%WikiKuchnia%');",
    "DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%WikiKuchnia%');",
    "DELETE FROM recipes WHERE description LIKE '%WikiKuchnia%';",
    '',
  ];
  const header = headerLines.join('\n');

  let partIndex = 1;
  let currentPartLines = [];
  let recipesInPart = 0;

  for (let i = 0; i < toFetch.length; i++) {
    const slug = toFetch[i];
    const recipeUrl = `${BASE}/przepisy/${encodeURIComponent(slug).replace(/%2F/g, '/')}`;
    try {
      const html = await fetchText(recipeUrl);
      const parsed = parseRecipePage(html, recipeUrl);
      const mealType = urlToCategory.get(slug) || 'lunch';
      const id = slugToUuid(slug);

      if (parsed.ingredients.length === 0 && parsed.steps.length === 0) {
        console.warn('  Pominięto (brak składników/kroków):', parsed.title);
        continue;
      }

      const desc = 'Źródło: WikiKuchnia.org';
      currentPartLines.push(`INSERT INTO recipes (id, name, description, meal_type, servings) VALUES (${escapeSql(id)}, ${escapeSql(parsed.title)}, ${escapeSql(desc)}, ${escapeSql(mealType)}, ${parsed.servings}) ON CONFLICT (id) DO NOTHING;`);
      parsed.ingredients.forEach((ing, pos) => {
        currentPartLines.push(`INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES (${escapeSql(id)}, ${escapeSql(ing.ingredient_label)}, ${ing.quantity}, ${escapeSql(ing.unit)}, ${pos + 1});`);
      });
      parsed.steps.forEach((step, pos) => {
        currentPartLines.push(`INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES (${escapeSql(id)}, ${pos + 1}, ${escapeSql(step)});`);
      });
      currentPartLines.push('');

      recipesInPart++;
      if (recipesInPart >= RECIPES_PER_PART) {
        const body = currentPartLines.join('\n');
        const content = partIndex === 1 ? header + body : body;
        const outPath = path.join(SEED_PL, `seed-wikikuchnia-part-${String(partIndex).padStart(2, '0')}.sql`);
        fs.writeFileSync(outPath, content.trimEnd() + '\n', 'utf8');
        console.log('  Zapisano', outPath, '(' + recipesInPart, 'przepisów)');
        partIndex++;
        currentPartLines = [];
        recipesInPart = 0;
      }
    } catch (e) {
      console.warn('  Błąd', slug, e.message);
    }
    if ((i + 1) % 30 === 0) console.log('  Pobrano', i + 1, '/', toFetch.length);
    await sleep(DELAY_MS);
  }

  if (currentPartLines.length > 0) {
    const body = currentPartLines.join('\n');
    const content = partIndex === 1 ? header + body : body;
    const outPath = path.join(SEED_PL, `seed-wikikuchnia-part-${String(partIndex).padStart(2, '0')}.sql`);
    fs.writeFileSync(outPath, content.trimEnd() + '\n', 'utf8');
    console.log('  Zapisano', outPath, '(' + recipesInPart, 'przepisów)');
  }

  console.log('Gotowe. Pliki: seed-pl/seed-wikikuchnia-part-01.sql …');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
