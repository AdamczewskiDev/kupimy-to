// Push: "Za chwilę idę na zakupy! Masz 15 minut na dodanie produktów." – do wszystkich oprócz nadawcy.
// Uses Expo Push API. Verifies JWT: caller must be senderUserId.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUserId } from '../_shared/auth.ts';
import {
  getHouseholdPushTokensExceptUser,
  sendExpoPushNotifications,
} from '../_shared/push.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const WARNING_MINUTES = 15;

interface InvokeBody {
  householdId: string;
  senderUserId: string;
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
    const { householdId, senderUserId } = body;
    if (!householdId || !senderUserId) {
      return new Response(JSON.stringify({ error: 'Missing householdId or senderUserId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (userId !== senderUserId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const tokens = await getHouseholdPushTokensExceptUser(supabase, householdId, senderUserId);
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = 'Za chwilę idę na zakupy!';
    const bodyText = `Masz ${WARNING_MINUTES} minut na dodanie produktów.`;

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
