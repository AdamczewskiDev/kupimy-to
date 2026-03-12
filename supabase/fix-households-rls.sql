-- Tworzenie gospodarstwa przez RPC (SECURITY DEFINER omija RLS).
-- Uruchom w Supabase → SQL Editor → Run.

CREATE OR REPLACE FUNCTION create_household(p_invite_code text)
RETURNS TABLE(id uuid, invite_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_household_id uuid;
  v_invite_code text := trim(p_invite_code);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_invite_code = '' THEN
    RAISE EXCEPTION 'invite_code cannot be empty';
  END IF;

  INSERT INTO households (invite_code)
  VALUES (v_invite_code)
  RETURNING households.id, households.invite_code INTO v_household_id, v_invite_code;

  INSERT INTO household_members (household_id, user_id, role)
  VALUES (v_household_id, auth.uid(), 'owner');

  RETURN QUERY SELECT v_household_id, v_invite_code;
END;
$$;

-- Tylko zalogowani użytkownicy mogą wywołać
GRANT EXECUTE ON FUNCTION create_household(text) TO authenticated;
