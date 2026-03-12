-- Skopiuj całą zawartość do Supabase → SQL Editor → New query → Run
-- Migracja 1/3: schemat (households, household_members, list_items, in_store_sessions, RLS)

-- households: one per "home", unique invite_code for joining
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- household_members: links auth.users to households
CREATE TABLE household_members (
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  PRIMARY KEY (household_id, user_id)
);

CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);

-- list_items: shared grocery list
CREATE TABLE list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'bought')),
  position real NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_list_items_household_id ON list_items(household_id);
CREATE INDEX idx_list_items_household_status ON list_items(household_id, status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER list_items_updated_at
  BEFORE UPDATE ON list_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- in_store_sessions: "W sklepie" mode
CREATE TABLE in_store_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  countdown_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_in_store_sessions_household_id ON in_store_sessions(household_id);

ALTER PUBLICATION supabase_realtime ADD TABLE list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE in_store_sessions;

ALTER TABLE list_items REPLICA IDENTITY FULL;
ALTER TABLE in_store_sessions REPLICA IDENTITY FULL;

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_store_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_household_member(household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM household_members hm
    WHERE hm.household_id = is_household_member.household_id
      AND hm.user_id = auth.uid()
  );
$$;

CREATE POLICY "households_select_member" ON households FOR SELECT USING (is_household_member(id));
CREATE POLICY "households_insert_authenticated" ON households FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "household_members_select" ON household_members FOR SELECT USING (user_id = auth.uid() OR is_household_member(household_id));
CREATE POLICY "household_members_insert_self" ON household_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "household_members_update_own" ON household_members FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "household_members_delete_own" ON household_members FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "list_items_select" ON list_items FOR SELECT USING (is_household_member(household_id));
CREATE POLICY "list_items_insert" ON list_items FOR INSERT WITH CHECK (is_household_member(household_id));
CREATE POLICY "list_items_update" ON list_items FOR UPDATE USING (is_household_member(household_id));
CREATE POLICY "list_items_delete" ON list_items FOR DELETE USING (is_household_member(household_id));

CREATE POLICY "in_store_sessions_select" ON in_store_sessions FOR SELECT USING (is_household_member(household_id));
CREATE POLICY "in_store_sessions_insert" ON in_store_sessions FOR INSERT WITH CHECK (is_household_member(household_id) AND user_id = auth.uid());
CREATE POLICY "in_store_sessions_update" ON in_store_sessions FOR UPDATE USING (is_household_member(household_id) AND user_id = auth.uid());
CREATE POLICY "in_store_sessions_delete" ON in_store_sessions FOR DELETE USING (is_household_member(household_id) AND user_id = auth.uid());

-- ========== Migracja 2/3: funkcja do dołączania po kodzie ==========
CREATE OR REPLACE FUNCTION get_household_id_by_invite_code(code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM households WHERE upper(trim(invite_code)) = upper(trim(code)) LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_household_id_by_invite_code(text) TO authenticated;

-- ========== Migracja 3/3: push_tokens (FCM) ==========
CREATE TABLE push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_select_own" ON push_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_tokens_insert_own" ON push_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_tokens_update_own" ON push_tokens FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_tokens_delete_own" ON push_tokens FOR DELETE USING (auth.uid() = user_id);

