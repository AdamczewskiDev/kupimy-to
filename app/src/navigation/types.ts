import type { RecipeWithIngredients } from '../types/recipe';

export type MainStackParamList = {
  Home: undefined;
  JoinByCode: undefined;
  Recipes: undefined;
  RecipeDetail: { recipe: RecipeWithIngredients };
};
