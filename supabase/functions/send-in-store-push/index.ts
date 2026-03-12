// Send push notifications to household members when someone starts "W sklepie".
// Uses Expo Push API. Verifies JWT: caller must be shopperUserId.
// Inlined shared code so deploy works when _shared is not bundled (e.g. Dashboard deploy).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const jwt = authHeader.slice(7);
  if (!jwt) return null;
  if (!supabaseAnonKey) return null;
  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await client.auth.getUser(jwt);
  if (error || !user?.id) return null;
  return user.id;
}

function isExpoPushToken(token: string): boolean {
  return typeof token === 'string' && token.startsWith('ExponentPushToken[') && token.endsWith(']');
}

async function getHouseholdPushTokensExceptUser(
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

async function sendExpoPushNotifications(
  messages: { to: string; title: string; body: string }[]
): Promise<number> {
  if (messages.length === 0) return 0;
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
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

interface InvokeBody {
  householdId: string;
  shopperUserId: string;
  countdownMinutes: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const body = (await req.json()) as InvokeBody;
    const { householdId, shopperUserId, countdownMinutes } = body;
    if (!householdId || !shopperUserId || countdownMinutes == null) {
      return new Response(
        JSON.stringify({ error: 'Missing householdId, shopperUserId or countdownMinutes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (userId !== shopperUserId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const tokens = await getHouseholdPushTokensExceptUser(supabase, householdId, shopperUserId);
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'W sklepie';
    const bodyText =
      countdownMinutes === 1
        ? 'Masz 1 minutę na dopisanie do listy.'
        : `Masz ${countdownMinutes} minut na dopisanie do listy.`;

    const messages = tokens.map((to) => ({ to, title, body: bodyText }));
    const sent = await sendExpoPushNotifications(messages);

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
