-- Correggere i default ai costi ALFA reali
ALTER TABLE user_global_pricing
  ALTER COLUMN mobile_cost SET DEFAULT 0.0159,
  ALTER COLUMN landline_cost SET DEFAULT 0.0059;

-- Aggiornare i record esistenti che avevano i valori NYBYTE errati
UPDATE user_global_pricing
SET mobile_cost = 0.0159, landline_cost = 0.0059
WHERE mobile_cost = 0.09 AND landline_cost = 0.01;