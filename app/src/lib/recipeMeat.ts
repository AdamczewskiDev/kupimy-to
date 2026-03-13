import type { RecipeWithIngredients } from '../types/recipe';

/** Słowa kluczowe w nazwie składnika oznaczające mięso/wędliny. */
const MEAT_LABELS = [
  'kurczak', 'szynka', 'kiełbasa', 'wołowina', 'indyk', 'schab', 'mięso',
  'boczek', 'wieprzowina', 'drób', 'bolognese', 'gulasz'
];

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/** Czy przepis zawiera mięso (na podstawie składników). */
export function recipeHasMeat(recipe: RecipeWithIngredients): boolean {
  const normLabels = recipe.ingredients.map((i) => normalize(i.ingredient_label));
  return normLabels.some((label) =>
    MEAT_LABELS.some((meat) => label.includes(meat))
  );
}
