import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if code exists and is valid
    const { data: inviteCode, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (error || !inviteCode) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    // Check if code has uses remaining
    if (inviteCode.current_uses >= inviteCode.max_uses) {
      return NextResponse.json({ error: 'This invite code has already been used' }, { status: 400 });
    }

    // Increment usage count
    await supabase
      .from('invite_codes')
      .update({ 
        current_uses: inviteCode.current_uses + 1,
        used_at: new Date().toISOString()
      })
      .eq('id', inviteCode.id);

    return NextResponse.json({
      success: true,
      message: 'Welcome to vault!'
    });
  } catch (err) {
    console.error('Error validating invite code:', err);
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
  }
}

// Generate new invite codes (admin only - you can call this manually)
export async function PUT(request: Request) {
  try {
    const { count = 1, maxUses = 1, adminKey } = await request.json();
    
    // Simple admin key check (you can make this more secure)
    if (adminKey !== process.env.ADMIN_KEY) {
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
    console.error('Error generating invite codes:', err);
    return NextResponse.json({ error: 'Failed to generate codes' }, { status: 500 });
  }
}
