-- Nazwa gospodarstwa + opcje „W sklepie” (5/10/20 min, bez blokowania).
-- Uruchom w Supabase → SQL Editor → Run.

-- 1. Nazwa gospodarstwa
ALTER TABLE households
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';

-- 2. „W sklepie” – opcja bez blokowania dopisywania
ALTER TABLE in_store_sessions
  ADD COLUMN IF NOT EXISTS block_adding boolean NOT NULL DEFAULT true;

-- 3. create_household z nazwą (zachowaj kompatybilność: p_name opcjonalny)
CREATE OR REPLACE FUNCTION create_household(p_invite_code text, p_name text DEFAULT '')
RETURNS TABLE(id uuid, invite_code text, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_household_id uuid;
  v_invite_code text := upper(trim(p_invite_code));
  v_name text := nullif(trim(p_name), '');
  v_household_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_invite_code = '' THEN
    RAISE EXCEPTION 'invite_code cannot be empty';
  END IF;

  INSERT INTO households (invite_code, name)
  VALUES (v_invite_code, COALESCE(v_name, ''))
  RETURNING households.id, households.invite_code, households.name INTO v_household_id, v_invite_code, v_household_name;

  INSERT INTO household_members (household_id, user_id, role)
  VALUES (v_household_id, auth.uid(), 'owner');

  RETURN QUERY SELECT v_household_id, v_invite_code, COALESCE(v_household_name, '');
END;
$$;

-- 4. Aktualizacja nazwy gospodarstwa (tylko członek)
CREATE OR REPLACE FUNCTION update_household_name(p_household_id uuid, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT is_household_member(p_household_id) THEN
    RAISE EXCEPTION 'Not a member';
  END IF;
  UPDATE households
  SET name = coalesce(nullif(trim(p_name), ''), '')
  WHERE id = p_household_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_household(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_household_name(uuid, text) TO authenticated;
