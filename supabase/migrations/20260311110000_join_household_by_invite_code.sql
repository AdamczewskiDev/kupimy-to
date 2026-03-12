-- Story 2.3: Allow authenticated users to resolve household id by invite_code (to join).
-- Returns household id when code exists; null otherwise. SECURITY DEFINER so it can read households despite RLS.

CREATE OR REPLACE FUNCTION get_household_id_by_invite_code(code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM households WHERE upper(trim(invite_code)) = upper(trim(code)) LIMIT 1;
$$;

-- Allow authenticated users to call this (anon cannot join; they must sign in first)
GRANT EXECUTE ON FUNCTION get_household_id_by_invite_code(text) TO authenticated;
