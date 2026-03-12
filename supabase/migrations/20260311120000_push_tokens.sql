-- Story 4.2: push_tokens for FCM – store per user/device for "W sklepie" push
-- One row per (user_id, token); same user can have multiple devices (different tokens)

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

-- Users can only manage their own tokens
CREATE POLICY "push_tokens_select_own" ON push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_insert_own" ON push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_update_own" ON push_tokens
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_delete_own" ON push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Edge Function will need to read tokens for household members; use service role in Edge Function
-- (RLS does not apply to service role). No policy for other users' tokens from client.
