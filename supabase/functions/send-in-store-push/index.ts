// Send push notifications to household members when someone starts "W sklepie".
// Invoked from client after startSession(). Requires FCM_SERVER_KEY. Verifies JWT: caller must be shopperUserId.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import { sendPushToHouseholdExceptUser } from '../_shared/push.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

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
    const fcmTokens = await sendPushToHouseholdExceptUser(supabase, householdId, shopperUserId);
    if (fcmTokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!fcmServerKey) {
      console.warn('FCM_SERVER_KEY not set – skipping push send');
      return new Response(JSON.stringify({ sent: 0, skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'W sklepie';
    const bodyText =
      countdownMinutes === 1
        ? 'Masz 1 minutę na dopisanie do listy.'
        : `Masz ${countdownMinutes} minut na dopisanie do listy.`;

    let sent = 0;
    for (const token of fcmTokens) {
      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Authorization: `key=${fcmServerKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          notification: { title, body: bodyText },
          priority: 'high',
        }),
      });
      if (res.ok) sent++;
    }

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
