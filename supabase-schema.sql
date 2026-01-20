-- Supabase Schema for Portfolio Tracker
-- Run this in Supabase SQL Editor (Database → SQL Editor)

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  chain TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS wallets_user_id_idx ON wallets(user_id);

-- Unique constraint: same user can't add same address+chain twice (case-insensitive)
-- We use LOWER(address) so 'ABC' and 'abc' are treated as duplicates
-- but we still store the original case for API calls
CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_address_chain_idx 
  ON wallets(user_id, LOWER(address), chain);

-- Row Level Security (RLS) - users can only see their own wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets" ON wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Alerts table (for Phase 1.5)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'price', 'portfolio_value', 'percent_change'
  asset TEXT,
  condition TEXT NOT NULL, -- 'above', 'below'
  threshold NUMERIC NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alerts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Portfolio Snapshots (for historical tracking & sparklines)
-- ============================================================
-- Stores hourly portfolio value snapshots for each user
-- Used to calculate 24h change, draw sparklines, and track performance

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0,
  -- Optional: store breakdown by chain for more granular analytics
  value_by_chain JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast time-range queries
CREATE INDEX IF NOT EXISTS portfolio_snapshots_user_id_idx 
  ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS portfolio_snapshots_user_created_idx 
  ON portfolio_snapshots(user_id, created_at DESC);

-- RLS policies
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots" ON portfolio_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert snapshots" ON portfolio_snapshots
  FOR INSERT WITH CHECK (true);  -- Cron job uses service role key

-- Cleanup old snapshots (keep 1 year of hourly data)
-- Run this periodically: DELETE FROM portfolio_snapshots 
-- WHERE created_at < NOW() - INTERVAL '1 year';

-- ============================================================
-- Aggregated daily snapshots (for long-term charts)
-- ============================================================
-- Materialized from hourly snapshots, one row per user per day

CREATE TABLE IF NOT EXISTS portfolio_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  open_value NUMERIC NOT NULL,    -- First snapshot of the day
  close_value NUMERIC NOT NULL,   -- Last snapshot of the day
  high_value NUMERIC NOT NULL,    -- Max value during the day
  low_value NUMERIC NOT NULL,     -- Min value during the day
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS portfolio_daily_user_date_idx 
  ON portfolio_daily(user_id, date DESC);

ALTER TABLE portfolio_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily" ON portfolio_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert daily" ON portfolio_daily
  FOR INSERT WITH CHECK (true);
