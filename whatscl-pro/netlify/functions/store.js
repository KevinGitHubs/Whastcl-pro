import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };
  const { channel, cipher } = JSON.parse(event.body);
  const { error } = await supabase.from('messages').insert([{ channel, cipher }]);
  return error ? { statusCode: 500 } : { statusCode: 200 };
}
