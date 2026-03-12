// Shared: get FCM tokens for household members except one user.
export async function sendPushToHouseholdExceptUser(
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

  return (tokens ?? []).map((r: { token: string }) => r.token).filter(Boolean);
}
