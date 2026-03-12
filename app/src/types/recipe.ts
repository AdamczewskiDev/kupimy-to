export type Recipe = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_label: string;
  quantity: number;
  unit: string;
  position: number;
};

export type RecipeWithIngredients = Recipe & {
  ingredients: RecipeIngredient[];
};
