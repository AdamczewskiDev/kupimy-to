/** Wartości odżywcze na jedną porcję. */
export type RecipeNutritionPerServing = {
  calories: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
};

/** Typ posiłku – do filtrowania/sortowania. */
export type MealType = 'breakfast' | 'lunch' | 'afternoon_snack';

/** Źródło przepisu. */
export type RecipeSource = 'themealdb' | 'wikikuchnia';

/** Język przepisu. */
export type RecipeLanguage = 'en' | 'pl';

export type Recipe = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  /** Śniadanie / obiad / podwieczorek; null = bez kategorii. */
  meal_type: MealType | null;
  /** Źródło (TheMealDB, WikiKuchnia); null = inne. */
  source: RecipeSource | null;
  /** Język: en / pl; null = nieustawiony. */
  language: RecipeLanguage | null;
  /** Na ile porcji wystarcza przepis. */
  servings: number;
  /** Wartości odżywcze na 1 porcję (opcjonalne). */
  calories_per_serving: number | null;
  protein_per_serving_g: number | null;
  fat_per_serving_g: number | null;
  carbs_per_serving_g: number | null;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_label: string;
  quantity: number;
  unit: string;
  position: number;
};

export type RecipeStep = {
  id: string;
  recipe_id: string;
  position: number;
  instruction: string;
};

export type RecipeWithIngredients = Recipe & {
  ingredients: RecipeIngredient[];
  steps?: RecipeStep[];
};
