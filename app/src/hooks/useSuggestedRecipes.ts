import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RecipeWithIngredients, RecipeIngredient } from '../types/recipe';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Dla danej listy etykiet (z listy zakupów) zwraca przepisy, których co najmniej minMatches składników pasuje do listy. */
export function useSuggestedRecipes(
  listLabels: string[],
  minMatches: number = 2
): { suggested: RecipeWithIngredients[]; isLoading: boolean; error: string | null } {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setError(null);
    const { data: recipesData, error: e1 } = await supabase
      .from('recipes')
      .select('id, name, description, created_at')
      .order('name');

    if (e1) {
      setError(e1.message);
      setRecipes([]);
      setIsLoading(false);
      return;
    }

    const { data: ingData, error: e2 } = await supabase
      .from('recipe_ingredients')
      .select('id, recipe_id, ingredient_label, quantity, unit, position')
      .order('recipe_id')
      .order('position');

    if (e2) {
      setError(e2.message);
      setRecipes([]);
      setIsLoading(false);
      return;
    }

    const ingredients = (ingData ?? []) as RecipeIngredient[];
    const byRecipe = new Map<string, RecipeIngredient[]>();
    for (const ing of ingredients) {
      const list = byRecipe.get(ing.recipe_id) ?? [];
      list.push(ing);
      byRecipe.set(ing.recipe_id, list);
    }

    const listNormalized = new Set(listLabels.map(normalize));

    const withIngredients: RecipeWithIngredients[] = (recipesData ?? []).map((r) => ({
      ...r,
      description: r.description ?? null,
      ingredients: (byRecipe.get(r.id) ?? []).sort((a, b) => a.position - b.position),
    }));

    const suggested = withIngredients.filter((r) => {
      const matchCount = r.ingredients.filter((ing) =>
        listNormalized.has(normalize(ing.ingredient_label))
      ).length;
      return matchCount >= minMatches;
    });

    setRecipes(suggested);
    setIsLoading(false);
  }, [listLabels.join(','), minMatches]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return { suggested: recipes, isLoading, error };
}
