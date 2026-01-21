import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface AlertData {
  id?: string;
  type: 'price' | 'percent_change';
  asset: string;
  asset_name: string;
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
  last_triggered?: string | null;
  created_at?: string;
}

/**
 * GET /api/alerts
 * Returns all alerts for the authenticated user
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Alerts API] Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }

  return NextResponse.json(alerts || []);
}

/**
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, asset, assetName, condition, threshold, enabled = true } = body;

    // Validation
    if (!type || !asset || !condition || threshold === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['price', 'percent_change'].includes(type)) {
      return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 });
    }

    if (!['above', 'below'].includes(condition)) {
      return NextResponse.json({ error: 'Invalid condition' }, { status: 400 });
    }

    if (typeof threshold !== 'number' || threshold <= 0) {
      return NextResponse.json({ error: 'Invalid threshold' }, { status: 400 });
    }

    const { data: alert, error: insertError } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        type,
        asset,
        asset_name: assetName || asset,
        condition,
        threshold,
        enabled,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Alerts API] Error creating alert:', insertError);
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('[Alerts API] Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

/**
 * DELETE /api/alerts?id={alertId}
 * Delete an alert
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const alertId = request.nextUrl.searchParams.get('id');
  if (!alertId) {
    return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', user.id); // RLS also enforces this, but be explicit

  if (deleteError) {
    console.error('[Alerts API] Error deleting alert:', deleteError);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * PATCH /api/alerts?id={alertId}
 * Update an alert (toggle enabled, update threshold, etc.)
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const alertId = request.nextUrl.searchParams.get('id');
  if (!alertId) {
    return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const allowedFields = ['type', 'asset', 'asset_name', 'condition', 'threshold', 'enabled'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: alert, error: updateError } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', alertId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Alerts API] Error updating alert:', updateError);
      return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('[Alerts API] Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
