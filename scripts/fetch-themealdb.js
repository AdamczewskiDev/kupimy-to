/**
 * Pobiera przepisy z TheMealDB (darmowe API) i zapisuje je od razu do wielu plików
 * seed-en/seed-themealdb-part-01.sql, part-02.sql, … (rozmiary dopasowane do Supabase SQL Editor).
 *
 * Jednostki: tylko europejskie (g, ml, l, kg, szt, opak). Amerykańskie są przeliczane:
 * cup → ml, tbsp/tsp → ml, oz → g, lb → g (w SQL nie ma cup/oz/lb).
 *
 * Źródło: https://www.themealdb.com/
 * Uruchom: node scripts/fetch-themealdb.js
 * Limit:   node scripts/fetch-themealdb.js 100
 */

const MAX_RECIPES = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const RECIPES_PER_PART = 25;
const BASE = 'https://www.themealdb.com/api/json/v1/1';
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SEED_EN = path.join(__dirname, '..', 'supabase', 'seed-en');

function idToUuid(id) {
  const n = parseInt(id, 10);
  const hex = n.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

function escapeSql(s) {
  if (s == null || s === '') return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function mapCategoryToMealType(strCategory) {
  if (strCategory === 'Breakfast') return 'breakfast';
  if (strCategory === 'Dessert') return 'afternoon_snack';
  return 'lunch';
}

/** Słowa sugerujące płyn (→ ml gdy brak jednostki). */
const LIQUID_WORDS = /\b(water|milk|oil|broth|stock|sauce|juice|cream|wine|beer|vinegar|soup|syrup)\b/i;

/**
 * Parsuje strMeasure z API (np. "3/4 cup", "4 Tablespoons", "500g", "2", "12 oz")
 * i zwraca { quantity, unit } w jednostkach: g, kg, ml, l, szt, opak.
 */
function parseQuantityAndUnit(measure, ingredientLabel) {
  if (!measure || !measure.trim()) return { quantity: 1, unit: 'szt' };
  const m = measure.trim();
  const lower = m.toLowerCase();
  const label = (ingredientLabel || '').toLowerCase();

  let num = 1;
  const fracMatch = m.match(/(\d+)\s*\/\s*(\d+)/);
  if (fracMatch) {
    num = parseInt(fracMatch[1], 10) / parseInt(fracMatch[2], 10);
  } else {
    const numMatch = m.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) num = parseFloat(numMatch[1].replace(',', '.'));
  }
  if (isNaN(num) || num <= 0) num = 1;

  if (/\b(g|gram|grams)\b/i.test(m)) return { quantity: num, unit: 'g' };
  if (/\b(kg|kilogram)\b/i.test(m)) return { quantity: num, unit: 'kg' };
  if (/\b(ml|millilitre|milliliter)\b/i.test(m)) return { quantity: num, unit: 'ml' };
  if (/\b(l|litre|liter)\b/i.test(m)) return { quantity: num, unit: 'l' };

  if (/\b(cup|cups)\b/i.test(m)) return { quantity: Math.round(num * 240), unit: 'ml' };
  if (/\b(tablespoon|tablespoons|tbsp)\b/i.test(m)) return { quantity: Math.round(num * 15), unit: 'ml' };
  if (/\b(teaspoon|teaspoons|tsp)\b/i.test(m)) return { quantity: Math.round(num * 5), unit: 'ml' };
  const ozMatch = m.match(/(\d+(?:[.,]\d+)?)\s*oz/i);
  if (ozMatch) return { quantity: Math.round(parseFloat(ozMatch[1].replace(',', '.')) * 28), unit: 'g' };
  if (/\b(fl\.?\s*oz|fluid\s*oz)\b/i.test(m)) return { quantity: Math.round(num * 30), unit: 'ml' };
  if (/\b(oz|ounce|ounces)\b/i.test(m)) return { quantity: Math.round(num * 28), unit: 'g' };
  if (/\b(lb|lbs|pound|pounds)\b/i.test(m)) return { quantity: Math.round(num * 453), unit: 'g' };

  if (/\b(pinch|pinches|dash)\b/i.test(m)) return { quantity: 1, unit: 'szt' };
  if (/\b(packet|packets|pack)\b/i.test(m)) return { quantity: num, unit: 'opak' };
  if (/\b(slice|slices)\b/i.test(m)) return { quantity: num, unit: 'szt' };
  if (/\b(clove|cloves)\b/i.test(m)) return { quantity: num, unit: 'szt' };
  if (/\b(can|cans)\b/i.test(m)) return { quantity: num, unit: 'szt' };
  if (/\b(bunch|bunches)\b/i.test(m)) return { quantity: num, unit: 'szt' };
  if (/\b(handful|piece|pieces)\b/i.test(m)) return { quantity: num, unit: 'szt' };

  if (/^\d+$/.test(m.trim()) && num >= 1 && num <= 20) return { quantity: num, unit: 'szt' };

  if (num >= 10 || (num > 1 && num !== Math.floor(num))) {
    return { quantity: Math.round(num), unit: LIQUID_WORDS.test(label) ? 'ml' : 'g' };
  }
  return { quantity: num, unit: 'szt' };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

async function main() {
  if (!fs.existsSync(SEED_EN)) fs.mkdirSync(SEED_EN, { recursive: true });

  console.log('Pobieranie kategorii...');
  const { categories } = await fetchJson(`${BASE}/categories.php`);
  const mealById = new Map();

  for (const cat of categories) {
    const name = cat.strCategory;
    console.log('  Kategoria:', name);
    const { meals } = await fetchJson(`${BASE}/filter.php?c=${encodeURIComponent(name)}`);
    if (!meals) continue;
    for (const m of meals) {
      if (!mealById.has(m.idMeal)) {
        mealById.set(m.idMeal, { idMeal: m.idMeal, strMeal: m.strMeal, strCategory: name });
      }
    }
    await sleep(200);
  }

  let ids = Array.from(mealById.keys());
  if (MAX_RECIPES != null && !isNaN(MAX_RECIPES)) {
    ids = ids.slice(0, MAX_RECIPES);
    console.log('Limit: tylko', ids.length, 'przepisów.');
  } else {
    console.log('Unikalnych przepisów:', ids.length);
  }
  console.log('Pobieranie szczegółów...');

  const headerLines = [
    '-- Przepisy z TheMealDB (https://www.themealdb.com/) – darmowe API.',
    '-- Wygenerowano: ' + new Date().toISOString(),
    '-- Jednostki: g, ml, l, kg, szt, opak (pod kalkulację kalorii).',
    '-- Uruchom w Supabase SQL Editor (po migracjach).',
    '',
    "-- Usuń poprzedni import TheMealDB (żeby móc uruchomić ponownie).",
    "DELETE FROM recipe_steps WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%TheMealDB%');",
    "DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%TheMealDB%');",
    "DELETE FROM recipes WHERE description LIKE '%TheMealDB%';",
    '',
  ];
  const header = headerLines.join('\n');

  let partIndex = 1;
  let currentPartLines = [];
  let recipesInPart = 0;
  const allRecipes = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const { meals: detail } = await fetchJson(`${BASE}/lookup.php?i=${id}`);
      if (!detail || !detail[0]) continue;
      const d = detail[0];
      const meta = mealById.get(id);
      const mealType = mapCategoryToMealType(meta.strCategory);

      const ingredients = [];
      for (let k = 1; k <= 20; k++) {
        const ing = d[`strIngredient${k}`];
        const measure = d[`strMeasure${k}`] || '';
        if (!ing || !ing.trim()) break;
        const { quantity, unit } = parseQuantityAndUnit(measure, ing.trim());
        ingredients.push({
          ingredient_label: ing.trim(),
          quantity,
          unit: unit || 'szt',
        });
      }

      const instructions = (d.strInstructions || '').split(/\r\n|\n/).map((s) => s.trim()).filter(Boolean);
      const recipe = {
        id: idToUuid(id),
        name: (d.strMeal || '').trim(),
        description: d.strArea ? `Danie: ${d.strArea}. Źródło: TheMealDB` : 'Źródło: TheMealDB',
        meal_type: mealType,
        servings: 4,
        ingredients,
        steps: instructions,
      };
      allRecipes.push(recipe);

      currentPartLines.push(`INSERT INTO recipes (id, name, description, meal_type, servings) VALUES (${escapeSql(recipe.id)}, ${escapeSql(recipe.name)}, ${escapeSql(recipe.description)}, ${escapeSql(recipe.meal_type)}, ${recipe.servings}) ON CONFLICT (id) DO NOTHING;`);
      recipe.ingredients.forEach((ing, pos) => {
        currentPartLines.push(`INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES (${escapeSql(recipe.id)}, ${escapeSql(ing.ingredient_label)}, ${ing.quantity}, ${escapeSql(ing.unit)}, ${pos + 1});`);
      });
      (recipe.steps || []).forEach((step, pos) => {
        currentPartLines.push(`INSERT INTO recipe_steps (recipe_id, position, instruction) VALUES (${escapeSql(recipe.id)}, ${pos + 1}, ${escapeSql(step)});`);
      });
      currentPartLines.push('');

      recipesInPart++;
      if (recipesInPart >= RECIPES_PER_PART) {
        const body = currentPartLines.join('\n');
        const content = partIndex === 1 ? header + body : body;
        const outPath = path.join(SEED_EN, `seed-themealdb-part-${String(partIndex).padStart(2, '0')}.sql`);
        fs.writeFileSync(outPath, content.trimEnd() + '\n', 'utf8');
        console.log('  Zapisano', outPath, '(' + recipesInPart, 'przepisów)');
        partIndex++;
        currentPartLines = [];
        recipesInPart = 0;
      }
    } catch (e) {
      console.warn('  Błąd id=' + id + ':', e.message);
    }
    if ((i + 1) % 50 === 0) console.log('  Pobrano', i + 1, '/', ids.length);
    await sleep(300);
  }

  if (currentPartLines.length > 0) {
    const body = currentPartLines.join('\n');
    const content = partIndex === 1 ? header + body : body;
    const outPath = path.join(SEED_EN, `seed-themealdb-part-${String(partIndex).padStart(2, '0')}.sql`);
    fs.writeFileSync(outPath, content.trimEnd() + '\n', 'utf8');
    console.log('  Zapisano', outPath, '(' + recipesInPart, 'przepisów)');
  }

  console.log('Gotowe. Pliki:', path.join(SEED_EN, 'seed-themealdb-part-01.sql'), '…');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
