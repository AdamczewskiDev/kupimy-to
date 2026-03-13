-- list_items.recipe_id: powiązanie pozycji z przepisem (dla grupowania "po przepisach")
ALTER TABLE list_items
  ADD COLUMN IF NOT EXISTS recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_list_items_recipe_id ON list_items(recipe_id);
COMMENT ON COLUMN list_items.recipe_id IS 'Przepis, z którego dodano pozycję; NULL = dodane ręcznie';

-- Ulubione przepisy per gospodarstwo
CREATE TABLE household_favorite_recipes (
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, recipe_id)
);
CREATE INDEX idx_household_favorite_recipes_household_id ON household_favorite_recipes(household_id);

ALTER TABLE household_favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Członkowie gospodarstwa mogą dodawać/usuwać ulubione
CREATE POLICY "household_favorite_recipes_select" ON household_favorite_recipes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM household_members hm WHERE hm.household_id = household_favorite_recipes.household_id AND hm.user_id = auth.uid())
  );
CREATE POLICY "household_favorite_recipes_insert" ON household_favorite_recipes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM household_members hm WHERE hm.household_id = household_favorite_recipes.household_id AND hm.user_id = auth.uid())
  );
CREATE POLICY "household_favorite_recipes_delete" ON household_favorite_recipes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM household_members hm WHERE hm.household_id = household_favorite_recipes.household_id AND hm.user_id = auth.uid())
  );
