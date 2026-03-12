-- Story 1.2: Initial schema for households, household_members, list_items, in_store_sessions
-- RLS: access only for users who are members of the household (household_members)

-- households: one per "home", unique invite_code for joining
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- household_members: links auth.users to households (many-to-many; MVP: one household per user)
CREATE TABLE household_members (
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  PRIMARY KEY (household_id, user_id)
);

CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);

-- list_items: shared grocery list; status todo | bought; position for ordering
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

-- updated_at: set on every UPDATE (for sync/last-write-wins)
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

-- in_store_sessions: "W sklepie" mode – one active per household; countdown_until locks adding for others
CREATE TABLE in_store_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  countdown_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_in_store_sessions_household_id ON in_store_sessions(household_id);

-- Enable Realtime for list_items and in_store_sessions (required for FR8, Story 4.x)
-- Publication supabase_realtime is created by Supabase (hosted or local).
ALTER PUBLICATION supabase_realtime ADD TABLE list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE in_store_sessions;

-- Realtime needs REPLICA IDENTITY FULL so UPDATE/DELETE broadcast full row (e.g. for DELETE events)
ALTER TABLE list_items REPLICA IDENTITY FULL;
ALTER TABLE in_store_sessions REPLICA IDENTITY FULL;

-- ========== ROW LEVEL SECURITY ==========
-- Rule: user can read/write only rows for households where they are in household_members.

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_store_sessions ENABLE ROW LEVEL SECURITY;

-- Helper: true if current user is member of the given household
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

-- households: members can read; authenticated users can insert (create household in app)
CREATE POLICY "households_select_member" ON households
  FOR SELECT USING (is_household_member(id));

CREATE POLICY "households_insert_authenticated" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- household_members: members can read same household; user can insert self (join by invite); user can update/delete own row
-- Note: INSERT allows user_id = auth.uid() for any household_id. App must only pass household_id from "create household"
-- (new household) or "join by invite_code" lookup (Story 2.2, 2.3). Consider invite_tokens table later for stricter RLS.
CREATE POLICY "household_members_select" ON household_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_household_member(household_id)
  );

CREATE POLICY "household_members_insert_self" ON household_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "household_members_update_own" ON household_members
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "household_members_delete_own" ON household_members
  FOR DELETE USING (user_id = auth.uid());

-- list_items: full CRUD for household members
CREATE POLICY "list_items_select" ON list_items
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "list_items_insert" ON list_items
  FOR INSERT WITH CHECK (is_household_member(household_id));

CREATE POLICY "list_items_update" ON list_items
  FOR UPDATE USING (is_household_member(household_id));

CREATE POLICY "list_items_delete" ON list_items
  FOR DELETE USING (is_household_member(household_id));

-- in_store_sessions: same pattern; only session owner can update/delete (shopper ends session)
CREATE POLICY "in_store_sessions_select" ON in_store_sessions
  FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "in_store_sessions_insert" ON in_store_sessions
  FOR INSERT WITH CHECK (is_household_member(household_id) AND user_id = auth.uid());

CREATE POLICY "in_store_sessions_update" ON in_store_sessions
  FOR UPDATE USING (is_household_member(household_id) AND user_id = auth.uid());

CREATE POLICY "in_store_sessions_delete" ON in_store_sessions
  FOR DELETE USING (is_household_member(household_id) AND user_id = auth.uid());
