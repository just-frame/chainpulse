import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL';

interface SnapshotPoint {
  timestamp: string;
  value: number;
}

interface HistoryResponse {
  range: TimeRange;
  dataPoints: SnapshotPoint[];
  startValue: number;
  endValue: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
}

/**
 * GET /api/portfolio/history?range=1W
 * 
 * Returns historical portfolio snapshots for the authenticated user.
 * Used for sparklines and % change calculations.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = (searchParams.get('range') || '1W') as TimeRange;

  // Get authenticated user
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let useDaily = false; // Use daily aggregates for longer ranges

    switch (range) {
      case '1D':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        useDaily = true;
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        useDaily = true;
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1); // Jan 1st
        useDaily = true;
        break;
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        useDaily = true;
        break;
      case 'ALL':
        startDate = new Date(0); // Beginning of time
        useDaily = true;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let dataPoints: SnapshotPoint[] = [];

    if (useDaily) {
      // Use daily aggregate table for longer ranges (faster, less data)
      const { data: dailyData, error: dailyError } = await supabase
        .from('portfolio_daily')
        .select('date, close_value')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (dailyError) {
        console.error('[History] Error fetching daily data:', dailyError);
        // Fall back to hourly snapshots
      } else if (dailyData?.length) {
        dataPoints = dailyData.map(d => ({
          timestamp: d.date,
          value: Number(d.close_value),
        }));
      }
    }

    // If no daily data or short range, use hourly snapshots
    if (dataPoints.length === 0) {
      const { data: snapshots, error: snapError } = await supabase
        .from('portfolio_snapshots')
        .select('created_at, total_value')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (snapError) {
        console.error('[History] Error fetching snapshots:', snapError);
        return NextResponse.json(
          { error: 'Failed to fetch history' },
          { status: 500 }
        );
      }

      if (snapshots?.length) {
        // Downsample if too many points (max ~100 for sparkline)
        const maxPoints = 100;
        const step = Math.max(1, Math.floor(snapshots.length / maxPoints));
        
        dataPoints = snapshots
          .filter((_, i) => i % step === 0 || i === snapshots.length - 1)
          .map(s => ({
            timestamp: s.created_at,
            value: Number(s.total_value),
          }));
      }
    }

    // If no historical data, return empty with zeros
    if (dataPoints.length === 0) {
      return NextResponse.json({
        range,
        dataPoints: [],
        startValue: 0,
        endValue: 0,
        change: 0,
        changePercent: 0,
        high: 0,
        low: 0,
      } as HistoryResponse);
    }

    // Calculate stats
    const values = dataPoints.map(d => d.value);
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const change = endValue - startValue;
    const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;
    const high = Math.max(...values);
    const low = Math.min(...values);

    return NextResponse.json({
      range,
      dataPoints,
      startValue,
      endValue,
      change,
      changePercent,
      high,
      low,
    } as HistoryResponse);
  } catch (error) {
    console.error('[History] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio history' },
      { status: 500 }
    );
  }
}
