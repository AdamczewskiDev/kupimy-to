// Send push notifications to household members when someone starts "W sklepie".
// Uses Expo Push API. Verifies JWT: caller must be shopperUserId.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import {
  getHouseholdPushTokensExceptUser,
  sendExpoPushNotifications,
} from '../_shared/push.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
