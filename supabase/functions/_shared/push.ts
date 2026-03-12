const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function isExpoPushToken(token: string): boolean {
  return typeof token === 'string' && token.startsWith('ExponentPushToken[') && token.endsWith(']');
}

/** Get push tokens (Expo format) for household members except one user. */
export async function getHouseholdPushTokensExceptUser(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  householdId: string,
  excludeUserId: string
): Promise<string[]> {
  const { data: members } = await supabase
    .from('household_members')
    .select('user_id')
    .eq('household_id', householdId)
    .neq('user_id', excludeUserId);

  const userIds = (members ?? []).map((r: { user_id: string }) => r.user_id);
  if (userIds.length === 0) return [];

  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token')
    .in('user_id', userIds);

  return (tokens ?? [])
    .map((r: { token: string }) => r.token)
    .filter((t): t is string => Boolean(t) && isExpoPushToken(t));
}

/** Send push notifications via Expo Push API. Returns number of messages accepted. */
export async function sendExpoPushNotifications(
  messages: { to: string; title: string; body: string }[]
): Promise<number> {
  if (messages.length === 0) return 0;
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Expo Push API error', res.status, text);
    return 0;
  }
  const data = await res.json();
  const tickets = Array.isArray(data) ? data : (data?.data as { status?: string }[] | undefined);
  return Array.isArray(tickets) ? tickets.filter((t) => t?.status === 'ok').length : 0;
}
