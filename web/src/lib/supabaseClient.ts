import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthProvider = 'facebook' | 'google' | 'instagram';

/**
 * Trigger OAuth login with Facebook, Google, or Instagram
 */
export async function signInWithSocial(provider: AuthProvider) {
  // Catatan: Instagram Login di Supabase Auth menggunakan Facebook provider
  const targetProvider = provider === 'instagram' ? 'facebook' : provider;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUrl = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: targetProvider as any,
    options: {
      redirectTo: redirectUrl,
      queryParams: provider === 'google'
        ? { access_type: 'offline', prompt: 'consent' }
        : undefined,
      scopes: provider === 'google'
        ? 'profile email'
        : 'public_profile email'
    }
  });

  if (error) {
    console.error(`Login with ${provider} error:`, error.message);
    throw error;
  }

  return data;
}

/**
 * 1-Click Instant Demo Login for Hackathon Judges
 */
export async function signInAsDemoJudge() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'judge@owly.ai',
    password: 'OwlyJudge2026!'
  });
  if (error) {
    console.error('Demo judge sign in failed:', error.message);
    throw error;
  }
  return data;
}

/**
 * Sign out user
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current user profile from public.profiles
 */
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, auth_provider')
    .eq('id', user.id)
    .maybeSingle();

  // Jika profile belum tersinkron, ambil dari user metadata
  if (!profile) {
    const rawMeta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email || rawMeta.email || '',
      full_name: rawMeta.full_name || rawMeta.name || 'Pengguna Owly',
      avatar_url: rawMeta.avatar_url || rawMeta.picture || rawMeta.picture?.data?.url || '',
      auth_provider: user.app_metadata?.provider || 'oauth'
    };
  }

  return profile;
}
