-- Ilości i jednostki przy pozycjach listy (sprint: przepisy + ilości).
-- Jednostki: szt, kg, g, l, ml, opak (opakowanie). Domyślnie 1 szt.

ALTER TABLE list_items
  ADD COLUMN IF NOT EXISTS quantity real NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'szt';

ALTER TABLE list_items
  DROP CONSTRAINT IF EXISTS list_items_unit_check;

ALTER TABLE list_items
  ADD CONSTRAINT list_items_unit_check
  CHECK (unit IN ('szt', 'kg', 'g', 'l', 'ml', 'opak'));

COMMENT ON COLUMN list_items.quantity IS 'Ilość (np. 2, 0.5); domyślnie 1';
COMMENT ON COLUMN list_items.unit IS 'Jednostka: szt, kg, g, l, ml, opak';
