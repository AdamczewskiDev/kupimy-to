-- Źródło przepisu (themealdb, wikikuchnia) oraz język (en, pl) – do sortowania i filtrowania.
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS source text CHECK (source IN ('themealdb', 'wikikuchnia'));

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS language text CHECK (language IN ('en', 'pl'));

COMMENT ON COLUMN recipes.source IS 'themealdb | wikikuchnia. NULL = inne.';
COMMENT ON COLUMN recipes.language IS 'en=angielski, pl=polski. NULL = nieustawiony.';

-- Uzupełnienie z description (znane źródła).
UPDATE recipes SET source = 'themealdb', language = 'en' WHERE description LIKE '%TheMealDB%';
UPDATE recipes SET source = 'wikikuchnia', language = 'pl' WHERE description LIKE '%WikiKuchnia%';
