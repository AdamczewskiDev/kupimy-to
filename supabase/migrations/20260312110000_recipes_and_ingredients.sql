-- Baza przepisów: tabele recipes, recipe_ingredients + seed (sprint: sugestie przepisów).
-- Przepisy globalne; dopasowanie do listy po znormalizowanej nazwie składnika.

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_label text NOT NULL,
  quantity real NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'szt' CHECK (unit IN ('szt', 'kg', 'g', 'l', 'ml', 'opak')),
  position int NOT NULL DEFAULT 0
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- RLS: przepisy są publiczne (read-only dla wszystkich); bez INSERT/UPDATE/DELETE z aplikacji na start.
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_select_all" ON recipes FOR SELECT USING (true);
CREATE POLICY "recipe_ingredients_select_all" ON recipe_ingredients FOR SELECT USING (true);

-- Seed: kilka prostych przepisów (składniki spójne z kategoriami w app).
INSERT INTO recipes (id, name, description) VALUES
  ('a0000001-0001-4000-8000-000000000001', 'Zupa pomidorowa', 'Prosta zupa pomidorowa z makaronem.'),
  ('a0000001-0001-4000-8000-000000000002', 'Kanapki z szynką i serem', 'Szybkie kanapki na śniadanie.'),
  ('a0000001-0001-4000-8000-000000000003', 'Sałatka warzywna', 'Świeża sałatka z warzyw i oleju.'),
  ('a0000001-0001-4000-8000-000000000004', 'Makaron z serem', 'Makaron zapiekany z serem i mlekiem.'),
  ('a0000001-0001-4000-8000-000000000005', 'Jogurt z owocami', 'Jogurt naturalny z jabłkiem i bananem.');

INSERT INTO recipe_ingredients (recipe_id, ingredient_label, quantity, unit, position) VALUES
  ('a0000001-0001-4000-8000-000000000001', 'Pomidory', 4, 'szt', 1),
  ('a0000001-0001-4000-8000-000000000001', 'Makaron', 200, 'g', 2),
  ('a0000001-0001-4000-8000-000000000001', 'Sól', 1, 'szt', 3),
  ('a0000001-0001-4000-8000-000000000001', 'Olej', 2, 'szt', 4),
  ('a0000001-0001-4000-8000-000000000002', 'Chleb', 1, 'szt', 1),
  ('a0000001-0001-4000-8000-000000000002', 'Masło', 1, 'szt', 2),
  ('a0000001-0001-4000-8000-000000000002', 'Szynka', 4, 'szt', 3),
  ('a0000001-0001-4000-8000-000000000002', 'Ser żółty', 2, 'szt', 4),
  ('a0000001-0001-4000-8000-000000000003', 'Pomidory', 2, 'szt', 1),
  ('a0000001-0001-4000-8000-000000000003', 'Ogórki', 2, 'szt', 2),
  ('a0000001-0001-4000-8000-000000000003', 'Marchew', 1, 'szt', 3),
  ('a0000001-0001-4000-8000-000000000003', 'Olej', 1, 'szt', 4),
  ('a0000001-0001-4000-8000-000000000003', 'Sól', 1, 'szt', 5),
  ('a0000001-0001-4000-8000-000000000004', 'Makaron', 250, 'g', 1),
  ('a0000001-0001-4000-8000-000000000004', 'Ser żółty', 100, 'g', 2),
  ('a0000001-0001-4000-8000-000000000004', 'Mleko', 100, 'ml', 3),
  ('a0000001-0001-4000-8000-000000000004', 'Masło', 1, 'szt', 4),
  ('a0000001-0001-4000-8000-000000000004', 'Sól', 1, 'szt', 5),
  ('a0000001-0001-4000-8000-000000000005', 'Jogurt naturalny', 1, 'szt', 1),
  ('a0000001-0001-4000-8000-000000000005', 'Jabłka', 1, 'szt', 2),
  ('a0000001-0001-4000-8000-000000000005', 'Banany', 1, 'szt', 3);
