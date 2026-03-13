import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RecipeWithIngredients, RecipeIngredient, RecipeStep } from '../types/recipe';

export function useRecipes(): {
  recipes: RecipeWithIngredients[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setError(null);
    const { data: recipesData, error: e1 } = await supabase
      .from('recipes')
      .select('id, name, description, created_at, meal_type, servings, source, language, calories_per_serving, protein_per_serving_g, fat_per_serving_g, carbs_per_serving_g')
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

    let stepsData: unknown[] = [];
    try {
      const res = await supabase
        .from('recipe_steps')
        .select('id, recipe_id, position, instruction')
        .order('recipe_id')
        .order('position');
      if (!res.error) stepsData = res.data ?? [];
    } catch {
      // Tabela recipe_steps może nie istnieć przed migracją
    }

    const ingredients = (ingData ?? []) as RecipeIngredient[];
    const byRecipe = new Map<string, RecipeIngredient[]>();
    for (const ing of ingredients) {
      const list = byRecipe.get(ing.recipe_id) ?? [];
      list.push(ing);
      byRecipe.set(ing.recipe_id, list);
    }

    const steps = (stepsData ?? []) as RecipeStep[];
    const stepsByRecipe = new Map<string, RecipeStep[]>();
    for (const s of steps) {
      const list = stepsByRecipe.get(s.recipe_id) ?? [];
      list.push(s);
      stepsByRecipe.set(s.recipe_id, list);
    }

    const result: RecipeWithIngredients[] = (recipesData ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      description: r.description ?? null,
      meal_type: r.meal_type === 'breakfast' || r.meal_type === 'lunch' || r.meal_type === 'afternoon_snack' ? r.meal_type : null,
      source: r.source === 'themealdb' || r.source === 'wikikuchnia' ? r.source : null,
      language: r.language === 'en' || r.language === 'pl' ? r.language : null,
      servings: typeof r.servings === 'number' ? r.servings : 4,
      calories_per_serving: r.calories_per_serving != null ? Number(r.calories_per_serving) : null,
      protein_per_serving_g: r.protein_per_serving_g != null ? Number(r.protein_per_serving_g) : null,
      fat_per_serving_g: r.fat_per_serving_g != null ? Number(r.fat_per_serving_g) : null,
      carbs_per_serving_g: r.carbs_per_serving_g != null ? Number(r.carbs_per_serving_g) : null,
      ingredients: (byRecipe.get(r.id as string) ?? []).sort((a, b) => a.position - b.position),
      steps: (stepsByRecipe.get(r.id as string) ?? []).sort((a, b) => a.position - b.position),
    }));

    setRecipes(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return { recipes, isLoading, error, refetch: fetchRecipes };
}
