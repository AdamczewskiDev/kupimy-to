// Push: "Za chwilę idę na zakupy! Masz 15 minut na dodanie produktów." – do wszystkich oprócz nadawcy.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

interface InvokeBody {
  householdId: string;
  senderUserId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as InvokeBody;
    const { householdId, senderUserId } = body;
    if (!householdId || !senderUserId) {
      return new Response(JSON.stringify({ error: 'Missing householdId or senderUserId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: members } = await supabase
      .from('household_members')
      .select('user_id')
      .eq('household_id', householdId)
      .neq('user_id', senderUserId);

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

    const title = 'Za chwilę idę na zakupy!';
    const bodyText = 'Masz 15 minut na dodanie produktów.';

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
