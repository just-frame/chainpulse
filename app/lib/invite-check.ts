import { cookies } from 'next/headers';
import { createServerSupabaseClient } from './supabase-server';

/**
 * Check if the current user/session has a valid invite.
 * Checks both user metadata (for authenticated users) and httpOnly cookies.
 */
export async function isUserInvited(): Promise<boolean> {
  // Check 1: If user is authenticated, check their metadata
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.user_metadata?.invited) {
    return true;
  }

  // Check 2: Check httpOnly cookie (for users who validated before signing up)
  const cookieStore = await cookies();
  const invitedCookie = cookieStore.get('vault_invited');

  if (invitedCookie?.value === 'true') {
    // If user is now authenticated but doesn't have metadata, update it
    if (user) {
      const inviteCode = cookieStore.get('vault_invite_code')?.value;
      await supabase.auth.updateUser({
        data: {
          invited: true,
          invite_code: inviteCode,
          invited_at: new Date().toISOString()
        }
      });
    }
    return true;
  }

  return false;
}

/**
 * Middleware-style function to require invite for API routes.
 * Returns a Response if invite is required but not present, otherwise null.
 */
export async function requireInvite(): Promise<Response | null> {
  const invited = await isUserInvited();
  if (!invited) {
    return Response.json(
      { error: 'Valid invite code required' },
      { status: 403 }
    );
  }
  return null;
}
