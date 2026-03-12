import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { ListItem } from '../types/list';

type UseListItemsResult = {
  items: ListItem[];
  todoItems: ListItem[];
  boughtItems: ListItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addItem: (label: string) => Promise<{ item: ListItem | null; error: string | null }>;
  removeItem: (id: string) => Promise<{ error: string | null }>;
  markAsBought: (id: string) => Promise<{ error: string | null }>;
  markAsTodo: (id: string) => Promise<{ error: string | null }>;
};

function mapRow(row: Record<string, unknown>): ListItem {
  return {
    id: row.id as string,
    household_id: row.household_id as string,
    label: row.label as string,
    status: row.status as 'todo' | 'bought',
    position: (row.position as number) ?? 0,
    updated_at: row.updated_at as string,
  };
}

export function useListItems(householdId: string | null): UseListItemsResult {
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!householdId) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setError(null);
    const { data, error: e } = await supabase
      .from('list_items')
      .select('id, household_id, label, status, position, updated_at')
      .eq('household_id', householdId)
      .order('position', { ascending: true })
      .order('updated_at', { ascending: true });

    if (e) {
      setError(e.message);
      setItems([]);
      setIsLoading(false);
      return;
    }
    setItems((data ?? []).map(mapRow));
    setIsLoading(false);
  }, [householdId]);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!householdId) {
      setItems([]);
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;

    fetchItems().then(() => {
      if (cancelled) return;
      const ch = supabase
        .channel(`list_items:${householdId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'list_items',
            filter: `household_id=eq.${householdId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              setItems((prev) => [...prev, mapRow(payload.new as Record<string, unknown>)]);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              setItems((prev) =>
                prev.map((item) =>
                  item.id === (payload.new as Record<string, unknown>).id
                    ? mapRow(payload.new as Record<string, unknown>)
                    : item
                )
              );
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const id = (payload.old as Record<string, unknown>).id as string;
              setItems((prev) => prev.filter((item) => item.id !== id));
            }
          }
        );
      channelRef.current = ch;
      ch.subscribe();
    });

    return () => {
      cancelled = true;
      const ch = channelRef.current;
      if (ch) {
        supabase.removeChannel(ch);
        channelRef.current = null;
      }
    };
  }, [householdId, fetchItems]);

  const todoItems = items.filter((i) => i.status === 'todo');
  const boughtItems = items.filter((i) => i.status === 'bought');

  const refetch = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(
    async (label: string): Promise<{ item: ListItem | null; error: string | null }> => {
      if (!householdId) return { item: null, error: 'Brak gospodarstwa' };
      const trimmed = label.trim();
      if (!trimmed) return { item: null, error: 'Wpisz nazwę pozycji' };
      const { data, error: e } = await supabase
        .from('list_items')
        .insert({ household_id: householdId, label: trimmed, status: 'todo' })
        .select('id, household_id, label, status, position, updated_at')
        .single();
      if (e) return { item: null, error: e.message };
      return { item: data ? mapRow(data as Record<string, unknown>) : null, error: null };
    },
    [householdId]
  );

  const removeItem = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error: e } = await supabase.from('list_items').delete().eq('id', id);
    return { error: e?.message ?? null };
  }, []);

  const markAsBought = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error: e } = await supabase.from('list_items').update({ status: 'bought' }).eq('id', id);
    return { error: e?.message ?? null };
  }, []);

  const markAsTodo = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const { error: e } = await supabase.from('list_items').update({ status: 'todo' }).eq('id', id);
    return { error: e?.message ?? null };
  }, []);

  return { items, todoItems, boughtItems, isLoading, error, refetch, addItem, removeItem, markAsBought, markAsTodo };
}
