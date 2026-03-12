// Send push notifications to household members when someone starts "W sklepie".
// Invoked from client after startSession(). Requires FCM_SERVER_KEY (legacy) or FCM v1 credentials.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fcmServerKey = Deno.env.get('FCM_SERVER_KEY'); // Legacy server key (Firebase Console → Project settings → Cloud Messaging)

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
    const body = (await req.json()) as InvokeBody;
    const { householdId, shopperUserId, countdownMinutes } = body;
    if (!householdId || !shopperUserId || countdownMinutes == null) {
      return new Response(
        JSON.stringify({ error: 'Missing householdId, shopperUserId or countdownMinutes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: members } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdId)
      .neq('user_id', shopperUserId);

    const userIds = (members ?? []).map((r) => r.user_id);
    if (userIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds);

    const fcmTokens = (tokens ?? []).map((r) => r.token).filter(Boolean);
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
