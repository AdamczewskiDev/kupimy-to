import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { InStoreSession } from '../types/inStore';

function mapRow(row: Record<string, unknown>): InStoreSession {
  return {
    id: row.id as string,
    household_id: row.household_id as string,
    user_id: row.user_id as string,
    countdown_until: row.countdown_until as string,
    created_at: row.created_at as string,
    block_adding: row.block_adding !== false,
  };
}

/** Active session = row with countdown_until > now (one per household in MVP). */
function isActive(session: InStoreSession): boolean {
  return new Date(session.countdown_until).getTime() > Date.now();
}

export type UseInStoreSessionResult = {
  activeSession: InStoreSession | null;
  countdownRemainingSeconds: number;
  startSession: (minutes: number, blockAdding?: boolean) => Promise<{ session: InStoreSession | null; error: string | null }>;
  endSession: () => Promise<{ error: string | null }>;
  isLoading: boolean;
  error: string | null;
};

export function useInStoreSession(
  householdId: string | null,
  userId: string | null
): UseInStoreSessionResult {
  const [activeSession, setActiveSession] = useState<InStoreSession | null>(null);
  const [countdownRemainingSeconds, setCountdownRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSession = useCallback(async () => {
    if (!householdId) {
      setActiveSession(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const { data, error: e } = await supabase
      .from('in_store_sessions')
      .select('id, household_id, user_id, countdown_until, created_at, block_adding')
      .eq('household_id', householdId)
      .gt('countdown_until', now)
      .order('countdown_until', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (e) {
      setError(e.message);
      setActiveSession(null);
      setIsLoading(false);
      return;
    }
    const session = data ? mapRow(data as Record<string, unknown>) : null;
    setActiveSession(session);
    setIsLoading(false);
  }, [householdId]);

  useEffect(() => {
    if (!householdId) {
      setActiveSession(null);
      setIsLoading(false);
      return undefined;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    fetchActiveSession().then(() => {
      channel = supabase
        .channel(`in_store_sessions:${householdId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'in_store_sessions',
            filter: `household_id=eq.${householdId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const session = mapRow(payload.new as Record<string, unknown>);
              setActiveSession(isActive(session) ? session : null);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const session = mapRow(payload.new as Record<string, unknown>);
              setActiveSession(isActive(session) ? session : null);
            } else if (payload.eventType === 'DELETE') {
              setActiveSession(null);
            }
          }
        );
      channel.subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [householdId, fetchActiveSession]);

  // Tick countdown every second when there's an active session
  useEffect(() => {
    if (!activeSession) {
      setCountdownRemainingSeconds(0);
      return undefined;
    }
    const until = new Date(activeSession.countdown_until).getTime();
    const update = () => {
      const remaining = Math.max(0, Math.floor((until - Date.now()) / 1000));
      setCountdownRemainingSeconds(remaining);
      if (remaining <= 0) setActiveSession(null);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = useCallback(
    async (
      minutes: number,
      blockAdding = true
    ): Promise<{ session: InStoreSession | null; error: string | null }> => {
      if (!householdId || !userId) return { session: null, error: 'Brak gospodarstwa lub użytkownika' };
      const countdown_until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const { data, error: e } = await supabase
        .from('in_store_sessions')
        .insert({
          household_id: householdId,
          user_id: userId,
          countdown_until,
          block_adding: blockAdding,
        })
        .select('id, household_id, user_id, countdown_until, created_at, block_adding')
        .single();
      if (e) return { session: null, error: e.message };
      const session = data ? mapRow(data as Record<string, unknown>) : null;
      setActiveSession(session);
      return { session, error: null };
    },
    [householdId, userId]
  );

  const endSession = useCallback(async (): Promise<{ error: string | null }> => {
    if (!activeSession) return { error: 'Brak aktywnej sesji' };
    const { error: e } = await supabase
      .from('in_store_sessions')
      .delete()
      .eq('id', activeSession.id);
    if (e) return { error: e.message };
    setActiveSession(null);
    return { error: null };
  }, [activeSession]);

  return {
    activeSession,
    countdownRemainingSeconds,
    startSession,
    endSession,
    isLoading,
    error,
  };
}
