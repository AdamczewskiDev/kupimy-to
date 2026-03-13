-- Typ posiłku: śniadanie, obiad, podwieczorek (do sortowania/filtrowania przepisów).
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'afternoon_snack'));

COMMENT ON COLUMN recipes.meal_type IS 'breakfast=śniadanie, lunch=obiad, afternoon_snack=podwieczorek. NULL = bez kategorii.';

-- Przypisanie dla znanych przepisów (z przepisy-20): śniadanie / obiad / podwieczorek
UPDATE recipes SET meal_type = 'breakfast' WHERE id IN (
  'd00244f1-6096-4115-830d-5613e8be412c',  -- Owsianka z jabłkiem i cynamonem
  'dc5bc776-901b-42e4-a7b1-b492dbd105ef',  -- Jajecznica z pomidorami
  'a0685c9a-765c-4c9f-989e-a877601928c9',  -- Kanapki z twarogiem i rzodkiewką
  'eb8b7bbd-e8c4-460b-a3ef-6bdd9d37803c',  -- Smoothie bananowo-jogurtowe
  'faec0a09-1627-47af-9554-d0004980a917',  -- Tosty z serem i szynką
  'f05bf1c4-6ab9-4b13-9480-c4e8dee5e523',  -- Omlet z warzywami
  '9cccfe31-2b92-43d2-9623-c25c42fe5f0c',  -- Jogurt z owocami i musli
  '7797cfcd-d034-4e48-b99a-844c971ec08e'   -- Kanapki z pastą jajeczną
);
UPDATE recipes SET meal_type = 'lunch' WHERE id IN (
  'fed71d75-4e00-4400-9d3c-17c652c18066',  -- Zupa pomidorowa z makaronem
  '02e59416-47a0-4ecd-82c7-26ae1b8d00f0',  -- Kurczak z ryżem i warzywami
  '4235f476-7c09-4c67-9b5a-0f9a19836c90',  -- Spaghetti bolognese
  'a7fbb639-07d9-4ae2-a6d9-eadc9cb01d06',  -- Zupa jarzynowa
  '234f49dc-d9af-49e4-951a-02e2e248b3d0',  -- Kotlet schabowy z ziemniakami
  '6a424d7c-d526-4497-b804-17f1254641d3',  -- Sałatka z kurczakiem i warzywami
  '2d9eb6ae-e5d7-46cc-a140-a2e8311faaa5',  -- Makaron z serem i mlekiem
  '6236b2e2-79b5-4ad8-9956-20d8dbaca556',  -- Kasza gryczana z gulaszem
  'bc213803-b783-4c6d-af23-720c5609ecdb',  -- Sałatka warzywna z olejem
  'd76a1f63-dc35-4fb1-9ad7-07e1e3292d48'   -- Zapiekanka z kiełbasą i serem
);
UPDATE recipes SET meal_type = 'afternoon_snack' WHERE id IN (
  '7bad03a3-086c-4edf-b85f-a6e151abe305',  -- Omlet na kolację
  '1a5888bb-bc69-48bb-ba67-ec961bbf39a4',  -- Twaróg na słodko z owocami
  'a4ab6176-c4c8-4341-8a27-4710ca1d3f1a'   -- Tosty z awokado i jajkiem
);
