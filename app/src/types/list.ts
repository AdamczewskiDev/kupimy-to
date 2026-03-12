export type ListItem = {
  id: string;
  household_id: string;
  label: string;
  status: 'todo' | 'bought';
  position: number;
  quantity: number;
  unit: string;
  updated_at: string;
};
