-- Kroki przepisu (instrukcja krok po kroku).
CREATE TABLE recipe_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  instruction text NOT NULL
);

CREATE INDEX idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_steps_select_all" ON recipe_steps FOR SELECT USING (true);

COMMENT ON TABLE recipe_steps IS 'Kroki przepisu w kolejności (position).';
