import { NextResponse } from 'next/server';
import { isUserInvited } from '@/lib/invite-check';

/**
 * GET /api/invite/status
 * Check if the current user/session has a valid invite.
 * Used by frontend to verify server-side invite status on load.
 */
export async function GET() {
  const invited = await isUserInvited();
  return NextResponse.json({ invited });
}
