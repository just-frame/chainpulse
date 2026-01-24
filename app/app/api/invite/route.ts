import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

// Validate an invite code
export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Normalize: uppercase and remove dashes/spaces
    const normalizedCode = code.toUpperCase().replace(/[-\s]/g, '');

    if (normalizedCode.length !== 6) {
      return NextResponse.json({ error: 'Code must be 6 characters' }, { status: 400 });
    }

    // Use anon key - the RPC function handles security via SECURITY DEFINER
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Atomic redemption - prevents TOCTOU race condition
    // The database function does check + update in a single atomic operation
    const { data, error } = await supabase.rpc('redeem_invite_code', {
      code_input: code
    });

    if (error) {
      logger.error('[Invite API] Database error during redemption', error);
      return NextResponse.json(
        { error: 'Failed to validate invite code' },
        { status: 500 }
      );
    }

    if (!data?.success) {
      // Map database error messages to user-friendly responses
      const errorMessage = data?.error === 'Code has been fully redeemed'
        ? 'This invite code has already been used'
        : 'Invalid invite code';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // If user is authenticated, update their metadata
    const authSupabase = await createServerSupabaseClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (user) {
      await authSupabase.auth.updateUser({
        data: {
          invited: true,
          invite_code: normalizedCode,
          invited_at: new Date().toISOString()
        }
      });
    }

    // Set httpOnly cookies for server-side tracking (works even for anon users)
    const response = NextResponse.json({
      success: true,
      message: 'Welcome to vault!'
    });

    response.cookies.set('vault_invited', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    response.cookies.set('vault_invite_code', normalizedCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return response;
  } catch (err) {
    logger.error('[Invite API] Error validating invite code', err);
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
  }
}

// Generate new invite codes (admin only - you can call this manually)
export async function PUT(request: Request) {
  const ADMIN_KEY = process.env.ADMIN_KEY;

  // Fail closed: require ADMIN_KEY to be configured
  if (!ADMIN_KEY) {
    logger.error('[Invite API] ADMIN_KEY not configured');
    return NextResponse.json(
      { error: 'Admin functionality not configured' },
      { status: 503 }
    );
  }

  try {
    const { count = 1, maxUses = 1, adminKey } = await request.json();

    // Require adminKey to be a non-empty string
    if (!adminKey || typeof adminKey !== 'string') {
      return NextResponse.json({ error: 'Admin key required' }, { status: 401 });
    }

    // Constant-time comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const adminKeyBytes = encoder.encode(adminKey);
    const expectedKeyBytes = encoder.encode(ADMIN_KEY);

    if (adminKeyBytes.length !== expectedKeyBytes.length) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let isValid = true;
    for (let i = 0; i < adminKeyBytes.length; i++) {
      if (adminKeyBytes[i] !== expectedKeyBytes[i]) {
        isValid = false;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate random 6-char alphanumeric code
      const code = Array.from({ length: 6 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');

      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code,
          max_uses: maxUses,
          current_uses: 0
        });

      if (!error) {
        codes.push(code);
      }
    }

    return NextResponse.json({ codes });
  } catch (err) {
    logger.error('[Invite API] Error generating invite codes', err);
    return NextResponse.json({ error: 'Failed to generate codes' }, { status: 500 });
  }
}
