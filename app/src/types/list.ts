export type ListItem = {
  id: string;
  household_id: string;
  label: string;
  status: 'todo' | 'bought';
  position: number;
  updated_at: string;
};
