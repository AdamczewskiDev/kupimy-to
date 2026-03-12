import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

/** EAS Project ID – required for getExpoPushTokenAsync. Set in app.json extra.eas.projectId or EXPO_PUBLIC_EAS_PROJECT_ID. */
function getExpoProjectId(): string | undefined {
  const fromConfig = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (fromConfig) return fromConfig;
  return typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_EAS_PROJECT_ID != null
    ? process.env.EXPO_PUBLIC_EAS_PROJECT_ID
    : undefined;
}

/**
 * Registers the Expo push token with Supabase (push_tokens) when user is logged in.
 * Uses Expo Push Service (getExpoPushTokenAsync) so notifications work on both iOS and Android.
 * Call when user is available (e.g. on HomeScreen). Safe to call repeatedly; uses upsert.
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
      const projectId = getExpoProjectId();
      if (!projectId) return; // EAS projectId required for Expo push token
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenData?.data;
        if (!token || cancelled) return;
        if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
        const platform = Platform.OS;

        const { error } = await supabase.from('push_tokens').upsert(
          { user_id: userId, token, platform },
          { onConflict: 'user_id,token' }
        );
        if (!cancelled && !error) registered.current = token;
      } catch {
        // e.g. Expo Go without projectId, or permissions denied
      }
    }

    register();
    return () => {
      cancelled = true;
    };
  }, [userId]);
}
