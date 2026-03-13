import type { ListItem } from '../types/list';

export type GroupedByRecipe = {
  recipeId: string | null;
  recipeName: string;
  icon: string;
  items: ListItem[];
}[];

const OTHER_RECIPE_ID = '_inne';

/**
 * Grupuje pozycje listy po przepisach (recipe_id).
 * recipeIdToName: mapa id przepisu → nazwa (z bazy).
 * Sekcja "Inne" dla pozycji bez recipe_id.
 */
export function groupListByRecipe(
  items: ListItem[],
  recipeIdToName: Map<string, string>
): GroupedByRecipe {
  const byRecipe = new Map<string | null, ListItem[]>();

  for (const item of items) {
    const rid = item.recipe_id ?? null;
    const list = byRecipe.get(rid) ?? [];
    list.push(item);
    byRecipe.set(rid, list);
  }

  const result: GroupedByRecipe = [];
  // Najpierw grupy z przepisem (posortowane po nazwie przepisu)
  const withRecipe: { recipeId: string; recipeName: string; items: ListItem[] }[] = [];
  for (const [rid, list] of byRecipe.entries()) {
    if (rid === null) continue;
    const name = recipeIdToName.get(rid) ?? 'Nieznany przepis';
    withRecipe.push({ recipeId: rid, recipeName: name, items: list });
  }
  withRecipe.sort((a, b) => a.recipeName.localeCompare(b.recipeName));
  for (const g of withRecipe) {
    result.push({ recipeId: g.recipeId, recipeName: g.recipeName, icon: '📖', items: g.items });
  }
  // Na końcu "Inne"
  const other = byRecipe.get(null);
  if (other && other.length > 0) {
    result.push({
      recipeId: null,
      recipeName: 'Inne',
      icon: '📋',
      items: other,
    });
  }
  return result;
}
