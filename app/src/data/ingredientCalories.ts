/**
 * Szacunkowa kaloryczność (kcal) na 100 g lub 100 ml – do obliczania kcal przepisu.
 * Źródła: typowe tabele wartości odżywczych (średnie dla produktów).
 */

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** kcal na 100g (type 'g') lub na 100ml (type 'ml'). */
const CALORIES: Array<{ key: string; kcalPer100: number; type: 'g' | 'ml' }> = [
  // Owoce i warzywa (na 100g)
  { key: 'pomidory', kcalPer100: 18, type: 'g' },
  { key: 'ogórki', kcalPer100: 15, type: 'g' },
  { key: 'marchew', kcalPer100: 41, type: 'g' },
  { key: 'jabłka', kcalPer100: 52, type: 'g' },
  { key: 'banany', kcalPer100: 89, type: 'g' },
  { key: 'rzodkiewka', kcalPer100: 16, type: 'g' },
  { key: 'awokado', kcalPer100: 160, type: 'g' },
  { key: 'ziemniaki', kcalPer100: 77, type: 'g' },
  { key: 'pietruszka', kcalPer100: 36, type: 'g' },
  { key: 'cebula', kcalPer100: 40, type: 'g' },
  { key: 'czosnek', kcalPer100: 149, type: 'g' },
  { key: 'natka pietruszki', kcalPer100: 36, type: 'g' },
  // Nabiał
  { key: 'mleko', kcalPer100: 42, type: 'ml' },
  { key: 'ser żółty', kcalPer100: 350, type: 'g' },
  { key: 'jogurt naturalny', kcalPer100: 59, type: 'g' },
  { key: 'twaróg', kcalPer100: 98, type: 'g' },
  { key: 'śmietana', kcalPer100: 193, type: 'g' },
  { key: 'masło', kcalPer100: 717, type: 'g' },
  // Mięso i wędliny
  { key: 'kurczak', kcalPer100: 165, type: 'g' },
  { key: 'szynka', kcalPer100: 145, type: 'g' },
  { key: 'kiełbasa', kcalPer100: 301, type: 'g' },
  { key: 'wołowina', kcalPer100: 250, type: 'g' },
  { key: 'indyk', kcalPer100: 135, type: 'g' },
  { key: 'schab wieprzowy', kcalPer100: 242, type: 'g' },
  // Pieczywo
  { key: 'chleb', kcalPer100: 265, type: 'g' },
  { key: 'bułki', kcalPer100: 270, type: 'g' },
  { key: 'bagietka', kcalPer100: 274, type: 'g' },
  { key: 'bułki do hot-dogów', kcalPer100: 267, type: 'g' },
  { key: 'pieczywo tostowe', kcalPer100: 293, type: 'g' },
  // Produkty suche
  { key: 'makaron', kcalPer100: 131, type: 'g' },
  { key: 'ryż', kcalPer100: 130, type: 'g' },
  { key: 'kasza gryczana', kcalPer100: 92, type: 'g' },
  { key: 'mąka', kcalPer100: 364, type: 'g' },
  { key: 'płatki owsiane', kcalPer100: 389, type: 'g' },
  // Napoje
  { key: 'woda mineralna', kcalPer100: 0, type: 'ml' },
  { key: 'sok owocowy', kcalPer100: 45, type: 'ml' },
  { key: 'kawa', kcalPer100: 2, type: 'ml' },
  { key: 'herbata', kcalPer100: 1, type: 'ml' },
  { key: 'napój gazowany', kcalPer100: 42, type: 'ml' },
  // Przyprawy i sosy
  { key: 'sól', kcalPer100: 0, type: 'g' },
  { key: 'olej', kcalPer100: 884, type: 'ml' },
  { key: 'ketchup', kcalPer100: 112, type: 'g' },
  { key: 'musztarda', kcalPer100: 162, type: 'g' },
  { key: 'sos sojowy', kcalPer100: 53, type: 'ml' },
  { key: 'passata', kcalPer100: 32, type: 'g' },
  { key: 'koncentrat pomidorowy', kcalPer100: 82, type: 'g' },
  { key: 'bulion', kcalPer100: 5, type: 'ml' },
  { key: 'bułka tarta', kcalPer100: 395, type: 'g' },
  { key: 'bazylia', kcalPer100: 23, type: 'g' },
  // Słodycze
  { key: 'czekolada', kcalPer100: 546, type: 'g' },
  { key: 'ciastka', kcalPer100: 502, type: 'g' },
  { key: 'chipsy', kcalPer100: 536, type: 'g' },
  { key: 'orzechy', kcalPer100: 607, type: 'g' },
  { key: 'batonik', kcalPer100: 450, type: 'g' },
  // Inne typowe
  { key: 'jajka', kcalPer100: 155, type: 'g' },
];

const CALORIES_MAP = new Map<string, { kcalPer100: number; type: 'g' | 'ml' }>();
for (const c of CALORIES) {
  CALORIES_MAP.set(c.key, { kcalPer100: c.kcalPer100, type: c.type });
}

function getKcalPer100(ingredientLabel: string): { kcalPer100: number; type: 'g' | 'ml' } | null {
  const key = normalize(ingredientLabel);
  const exact = CALORIES_MAP.get(key);
  if (exact) return exact;
  for (const [k, v] of CALORIES_MAP.entries()) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

/**
 * Oblicza szacunkową kaloryczność przepisu (suma po składnikach).
 * Dla szt/opak przyjmuje ok. 80 g na sztukę (szacunek).
 * Zwraca { totalKcal, kcalPerServing } lub null gdy brak danych dla składników.
 */
export function computeRecipeCalories(
  ingredients: Array<{ ingredient_label: string; quantity: number; unit: string }>,
  servings: number
): { totalKcal: number; kcalPerServing: number } | null {
  let total = 0;
  let hasAny = false;
  for (const ing of ingredients) {
    const info = getKcalPer100(ing.ingredient_label);
    if (!info) continue;
    hasAny = true;
    let amount100: number;
    const u = (ing.unit || '').toLowerCase();
    if (info.type === 'g') {
      if (u === 'g') amount100 = ing.quantity / 100;
      else if (u === 'kg') amount100 = (ing.quantity * 1000) / 100;
      else amount100 = (ing.quantity * 80) / 100;
    } else {
      if (u === 'ml') amount100 = ing.quantity / 100;
      else if (u === 'l') amount100 = (ing.quantity * 1000) / 100;
      else amount100 = (ing.quantity * 80) / 100;
    }
    total += amount100 * info.kcalPer100;
  }
  if (!hasAny) return null;
  const totalKcal = Math.round(total);
  const kcalPerServing = servings > 0 ? Math.round(totalKcal / servings) : totalKcal;
  return { totalKcal, kcalPerServing };
}
