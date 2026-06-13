import { clearSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function signOutEverywhere() {
  await supabase.auth.signOut().catch(() => undefined);
  await clearSession();
}
