export type InStoreSession = {
  id: string;
  household_id: string;
  user_id: string;
  countdown_until: string; // ISO timestamptz
  created_at: string;
  block_adding: boolean;
};
