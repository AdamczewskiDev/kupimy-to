-- Usuwa wszystkie przepisy ze źródła TheMealDB (żeby móc dodać je ponownie np. w języku angielskim).
-- Uruchom w Supabase SQL Editor. Kolejność: najpierw tabele zależne (recipe_steps, recipe_ingredients), potem recipes.

DELETE FROM recipe_steps
WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%TheMealDB%');

DELETE FROM recipe_ingredients
WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%TheMealDB%');

DELETE FROM recipes
WHERE description LIKE '%TheMealDB%';

-- Alternatywnie, po dodaniu kolumny source (migracja 20260317100000):
-- DELETE FROM recipe_steps WHERE recipe_id IN (SELECT id FROM recipes WHERE source = 'themealdb');
-- DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE source = 'themealdb');
-- DELETE FROM recipes WHERE source = 'themealdb';
