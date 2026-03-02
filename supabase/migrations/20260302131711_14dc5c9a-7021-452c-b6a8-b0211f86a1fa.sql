-- Add international_costs JSONB field for operator tariffs per country
ALTER TABLE user_global_pricing
  ADD COLUMN IF NOT EXISTS international_costs jsonb DEFAULT '{}';

-- Fix default values to match NYBYTE price list
ALTER TABLE user_global_pricing
  ALTER COLUMN mobile_cost SET DEFAULT 0.09,
  ALTER COLUMN landline_cost SET DEFAULT 0.01;

-- Add international and premium selling rates per client
ALTER TABLE client_pricing
  ADD COLUMN IF NOT EXISTS international_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS premium_rate numeric NOT NULL DEFAULT 0;