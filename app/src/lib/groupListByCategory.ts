import type { ListItem } from '../types/list';
import { SHOPPING_CATEGORIES } from '../data/shoppingCategories';

const OTHER_ID = '_inne';

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Mapowanie: znormalizowana nazwa produktu → kategoria (pierwsze dopasowanie z listy). */
function buildLabelToCategoryMap(): Map<string, { id: string; name: string; icon: string }> {
  const map = new Map<string, { id: string; name: string; icon: string }>();
  for (const cat of SHOPPING_CATEGORIES) {
    for (const product of cat.products) {
      const key = normalize(product);
      if (!map.has(key)) map.set(key, { id: cat.id, name: cat.name, icon: cat.icon });
    }
  }
  return map;
}

export type GroupedList = {
  categoryId: string;
  categoryName: string;
  icon: string;
  items: ListItem[];
}[];

/**
 * Grupuje pozycje listy po kategoriach (na podstawie mapowania label → kategoria z SHOPPING_CATEGORIES).
 * Kolejność: kategorie wg SHOPPING_CATEGORIES, na końcu "Inne" dla niedopasowanych.
 */
export function groupListByCategory(items: ListItem[]): GroupedList {
  const labelToCat = buildLabelToCategoryMap();
  const byCategory = new Map<string, { name: string; icon: string; items: ListItem[] }>();

  for (const item of items) {
    const key = normalize(item.label);
    const cat = labelToCat.get(key);
    const id = cat?.id ?? OTHER_ID;
    const name = cat?.name ?? 'Inne';
    const icon = cat?.icon ?? '📋';
    const entry = byCategory.get(id);
    if (entry) entry.items.push(item);
    else byCategory.set(id, { name, icon, items: [item] });
  }

  const result: GroupedList = [];
  for (const cat of SHOPPING_CATEGORIES) {
    const entry = byCategory.get(cat.id);
    if (entry && entry.items.length > 0) {
      result.push({ categoryId: cat.id, categoryName: entry.name, icon: entry.icon, items: entry.items });
    }
  }
  const other = byCategory.get(OTHER_ID);
  if (other && other.items.length > 0) {
    result.push({ categoryId: OTHER_ID, categoryName: other.name, icon: other.icon, items: other.items });
  }
  return result;
}
