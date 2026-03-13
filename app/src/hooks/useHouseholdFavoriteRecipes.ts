import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useHouseholdFavoriteRecipes(householdId: string | null): {
  favoriteRecipeIds: Set<string>;
  isLoading: boolean;
  toggleFavorite: (recipeId: string) => Promise<{ error: string | null }>;
  refetch: () => Promise<void>;
} {
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!householdId) {
      setFavoriteRecipeIds(new Set());
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('household_favorite_recipes')
      .select('recipe_id')
      .eq('household_id', householdId);

    if (error) {
      setFavoriteRecipeIds(new Set());
      setIsLoading(false);
      return;
    }
    setFavoriteRecipeIds(new Set((data ?? []).map((r) => r.recipe_id as string)));
    setIsLoading(false);
  }, [householdId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (recipeId: string): Promise<{ error: string | null }> => {
      if (!householdId) return { error: 'Brak gospodarstwa' };
      const isFav = favoriteRecipeIds.has(recipeId);
      if (isFav) {
        const { error } = await supabase
          .from('household_favorite_recipes')
          .delete()
          .eq('household_id', householdId)
          .eq('recipe_id', recipeId);
        if (error) return { error: error.message };
        setFavoriteRecipeIds((prev) => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('household_favorite_recipes')
          .insert({ household_id: householdId, recipe_id: recipeId });
        if (error) return { error: error.message };
        setFavoriteRecipeIds((prev) => new Set(prev).add(recipeId));
      }
      return { error: null };
    },
    [householdId, favoriteRecipeIds]
  );

  return { favoriteRecipeIds, isLoading, toggleFavorite, refetch: fetchFavorites };
}
