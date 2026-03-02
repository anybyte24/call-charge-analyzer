

## Piano: Aggiungere tariffe operatore + Revisione app

### Problema principale
La colonna "Costo" nella sezione Clienti usa le tariffe hardcoded dal file `defaultPrefixConfig` (es. mobile 0.015 euro/min, fisso 0.0019 euro/min) invece delle tue tariffe reali di operatore (mobile 0.0159 euro/min, fisso 0.00159 euro/min). Serve una sezione per modificare queste tariffe e usarle nei calcoli.

### Cosa faremo

**1. Aggiungere campi "costo operatore" al database**
- Aggiungere colonne `mobile_cost` e `landline_cost` alla tabella `user_global_pricing` (dove gia' ci sono `international_rate` e `premium_rate`)
- Questi rappresentano il tuo costo reale di operatore per le chiamate nazionali

**2. Creare sezione "Le mie tariffe operatore" nell'UI**
- Nella tab "Clienti" del `ClientsManager`, aggiungere un pannello per modificare:
  - Costo mobile (euro/min) - default 0.0159
  - Costo fisso (euro/min) - default 0.00159
- Questi valori si salvano in `user_global_pricing` accanto a international_rate e premium_rate

**3. Usare le tariffe operatore nel calcolo costi**
- In `ClientPricingSummary`, la colonna "Costo" (il tuo costo sostenuto) usera' le tariffe operatore salvate invece di quelle dal CSV
- Mobile: minuti x tariffa mobile operatore
- Fisso: minuti x tariffa fisso operatore
- Internazionale: minuti x tariffa internazionale (gia' presente)
- Premium/899: minuti x tariffa premium (gia' presente)

**4. Correzione bug critico nel salvataggio sessioni**
- La tabella `analysis_sessions` ha colonne `file_data` (jsonb) e `analysis_results` (jsonb), ma il codice prova a inserire colonne inesistenti (`file_name`, `total_records`, `summary_data`, ecc.)
- Il salvataggio su Supabase probabilmente fallisce sempre. Correggeremo mappando i dati nelle colonne JSONB esistenti.

### Dettagli tecnici

**Migrazione DB:**
```sql
ALTER TABLE user_global_pricing 
  ADD COLUMN mobile_cost numeric NOT NULL DEFAULT 0.0159,
  ADD COLUMN landline_cost numeric NOT NULL DEFAULT 0.00159;
```

**File modificati:**
- `user_global_pricing` (migrazione SQL) - nuove colonne
- `src/hooks/useClients.ts` - aggiungere `mobile_cost` e `landline_cost` al tipo `UserGlobalPricing` e alla mutation `upsertGlobalPricing`
- `src/components/ClientsManager.tsx` - aggiungere campi per costi operatore nella sezione tariffe globali
- `src/components/ClientPricingSummary.tsx` - usare `mobile_cost` e `landline_cost` dal DB per calcolare la colonna "Costo" invece dei dati CSV
- `src/hooks/useAnalysisStorage.ts` - correggere i nomi colonna per `analysis_sessions` (usare `file_data`, `analysis_results`, `session_name`)
- `src/integrations/supabase/types.ts` - aggiornamento automatico dopo migrazione

### Risultato atteso
- Potrai impostare le tue tariffe operatore (0.0159 mobile, 0.00159 fisso) da UI
- La colonna "Costo" in analisi clienti mostrera' il costo reale basato sulle tue tariffe
- Il margine sara' calcolato correttamente: Ricavo (tariffa cliente) - Costo (tariffa operatore)
- Il salvataggio sessioni su Supabase funzionera' correttamente

