import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type Household = {
  id: string;
  invite_code: string;
  name: string;
};

type UseHouseholdResult = {
  household: Household | null;
  isLoading: boolean;
  error: string | null;
  createHousehold: (name: string, inviteCode: string) => Promise<{ household: Household | null; error: string | null }>;
  updateHouseholdName: (name: string) => Promise<{ error: string | null }>;
  joinHouseholdByCode: (code: string) => Promise<{ household: Household | null; error: string | null }>;
  refetch: () => Promise<void>;
};

export function useHousehold(user: User | null): UseHouseholdResult {
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHousehold = useCallback(async (): Promise<Household | null> => {
    if (!user) {
      setHousehold(null);
      setIsLoading(false);
      return null;
    }
    setError(null);
    const { data, error: e } = await supabase
      .from('household_members')
      .select('household_id, households(id, invite_code, name)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (e) {
      setError(e.message);
      setHousehold(null);
      setIsLoading(false);
      return null;
    }

    const h = (data as { households: { id: string; invite_code: string; name: string | null } | null } | null)?.households;
    const next = h ? { id: h.id, invite_code: h.invite_code, name: h.name ?? '' } : null;
    setHousehold(next);
    setIsLoading(false);
    return next;
  }, [user?.id]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  const createHousehold = useCallback(async (
    name: string,
    inviteCode: string
  ): Promise<{
    household: Household | null;
    error: string | null;
  }> => {
    if (!user) return { household: null, error: 'Brak użytkownika.' };
    setError(null);
    const code = inviteCode.trim().toUpperCase();
    if (!code) return { household: null, error: 'Podaj kod zaproszenia (np. ADAM).' };

    const { data: householdData, error: rpcError } = await supabase.rpc('create_household', {
      p_invite_code: code,
      p_name: name.trim() || '',
    });

    if (rpcError) {
      if (rpcError.code === '23505') {
        const msg = 'Ten kod jest już zajęty. Wybierz inny.';
        setError(msg);
        return { household: null, error: msg };
      }
      setError(rpcError.message);
      return { household: null, error: rpcError.message };
    }

    const row = Array.isArray(householdData) ? householdData[0] : householdData;
    if (!row || !row.id) {
      setError('Nie udało się utworzyć gospodarstwa.');
      return { household: null, error: 'Nie udało się utworzyć gospodarstwa.' };
    }

    const newHousehold: Household = {
      id: row.id,
      invite_code: row.invite_code,
      name: (row as { name?: string }).name ?? '',
    };
    setHousehold(newHousehold);
    return { household: newHousehold, error: null };
  }, [user]);

  const updateHouseholdName = useCallback(async (name: string): Promise<{ error: string | null }> => {
    if (!user || !household) return { error: 'Brak gospodarstwa.' };
    setError(null);
    const { error: rpcError } = await supabase.rpc('update_household_name', {
      p_household_id: household.id,
      p_name: name.trim(),
    });
    if (rpcError) {
      setError(rpcError.message);
      return { error: rpcError.message };
    }
    setHousehold((prev) => (prev ? { ...prev, name: name.trim() } : null));
    return { error: null };
  }, [user, household]);

  const joinHouseholdByCode = useCallback(async (
    code: string
  ): Promise<{ household: Household | null; error: string | null }> => {
    if (!user) return { household: null, error: 'Brak użytkownika.' };
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return { household: null, error: 'Wpisz kod zaproszenia.' };
    setError(null);

    const { data: householdId, error: rpcError } = await supabase.rpc('get_household_id_by_invite_code', {
      code: trimmed,
    });

    if (rpcError) {
      setError(rpcError.message);
      return { household: null, error: rpcError.message };
    }
    if (!householdId) {
      const msg = 'Nieprawidłowy kod zaproszenia.';
      setError(msg);
      return { household: null, error: msg };
    }

    const { error: insertError } = await supabase.from('household_members').insert({
      household_id: householdId,
      user_id: user.id,
      role: 'member',
    });

    if (insertError) {
      if (insertError.code === '23505') {
        const msg = 'Już jesteś członkiem tego gospodarstwa.';
        setError(msg);
        return { household: null, error: msg };
      }
      setError(insertError.message);
      return { household: null, error: insertError.message };
    }

    const h = await fetchHousehold();
    return { household: h, error: null };
  }, [user, fetchHousehold]);

  return {
    household,
    isLoading,
    error,
    createHousehold,
    updateHouseholdName,
    joinHouseholdByCode,
    refetch: async () => {
      await fetchHousehold();
    },
  };
}
