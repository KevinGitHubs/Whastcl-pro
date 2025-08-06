import { createClient } from '@supabase/supabase-jimport { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };
  const { provider } = JSON.parse(event.body || '{}');
  if (provider === 'google' || provider === 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    return { statusCode: 200, body: JSON.stringify({ url: data.url }) };
  }
  return { statusCode: 400, body: JSON.stringify({ error: 'invalid provider' }) };
}
