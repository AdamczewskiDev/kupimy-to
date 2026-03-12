import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

/**
 * Registers the device push token with Supabase (push_tokens) when user is logged in.
 * Call when user and household are available (e.g. on HomeScreen). Safe to call repeatedly;
 * uses upsert so the same token is updated.
 */
export function usePushTokenRegistration(userId: string | null) {
  const registered = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      registered.current = null;
      return;
    }

    let cancelled = false;

    async function register() {
      if (!Device.isDevice) return;
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const tokenData = await Notifications.getDevicePushTokenAsync();
        const token = tokenData?.data;
        if (!token || cancelled) return;
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';

        const { error } = await supabase.from('push_tokens').upsert(
          { user_id: userId, token, platform },
          { onConflict: 'user_id,token' }
        );
        if (!cancelled && !error) registered.current = token;
      } catch {
        // e.g. getDevicePushTokenAsync not available in Expo Go – ignore
      }
    }

    register();
    return () => {
      cancelled = true;
    };
  }, [userId]);
}
