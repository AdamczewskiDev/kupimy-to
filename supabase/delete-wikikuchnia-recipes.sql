-- Usuwa wszystkie przepisy ze źródła WikiKuchnia.org.
-- Uruchom w Supabase SQL Editor. Kolejność: najpierw tabele zależne (recipe_steps, recipe_ingredients), potem recipes.

DELETE FROM recipe_steps
WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%WikiKuchnia%');

DELETE FROM recipe_ingredients
WHERE recipe_id IN (SELECT id FROM recipes WHERE description LIKE '%WikiKuchnia%');

DELETE FROM recipes
WHERE description LIKE '%WikiKuchnia%';

-- Alternatywnie, po dodaniu kolumny source (migracja 20260317100000):
-- DELETE FROM recipe_steps WHERE recipe_id IN (SELECT id FROM recipes WHERE source = 'wikikuchnia');
-- DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE source = 'wikikuchnia');
-- DELETE FROM recipes WHERE source = 'wikikuchnia';
