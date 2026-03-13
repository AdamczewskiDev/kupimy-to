-- Porcje i wartości odżywcze na porcję (przy jednej porcji).
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS servings int NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS calories_per_serving real,
  ADD COLUMN IF NOT EXISTS protein_per_serving_g real,
  ADD COLUMN IF NOT EXISTS fat_per_serving_g real,
  ADD COLUMN IF NOT EXISTS carbs_per_serving_g real;

COMMENT ON COLUMN recipes.servings IS 'Na ile porcji wystarcza przepis (domyślnie 4).';
COMMENT ON COLUMN recipes.calories_per_serving IS 'kcal na 1 porcję.';
COMMENT ON COLUMN recipes.protein_per_serving_g IS 'Białko (g) na 1 porcję.';
COMMENT ON COLUMN recipes.fat_per_serving_g IS 'Tłuszcz (g) na 1 porcję.';
COMMENT ON COLUMN recipes.carbs_per_serving_g IS 'Węglowodany (g) na 1 porcję.';
