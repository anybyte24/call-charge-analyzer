ALTER TABLE user_global_pricing 
  ADD COLUMN mobile_cost numeric NOT NULL DEFAULT 0.0159,
  ADD COLUMN landline_cost numeric NOT NULL DEFAULT 0.00159;