

## Piano: Listino Operatore + Miglioramenti App

### Analisi del PDF caricato

Il PDF contiene il listino NYBYTE con tariffe per paese. I dati chiave:
- **ITALY (fisso): 0.01 EUR/min** -- ITALY MOB (mobile): **0.09 EUR/min**
- Tariffe internazionali per ogni paese (fisso + mobile separati)
- Tariffazione al minuto, no tariffa di connessione, h24 7/7

### PROBLEMA CRITICO: Tariffe operatore sbagliate

I default attuali nel database sono `mobile_cost=0.0159` e `landline_cost=0.00159`. Ma il listino dice:
- Mobile nazionale: **0.09 EUR/min** (non 0.0159)
- Fisso nazionale: **0.01 EUR/min** (non 0.00159)

Questi valori devono essere corretti e l'utente deve poterli gestire da una sezione dedicata.

### PROBLEMA: Margine internazionale sempre zero

In `ClientPricingSummary.tsx`, le tariffe internazionali vengono usate sia come costo operatore sia come ricavo cliente (`intlRate` e `premiumRate`). Il margine e' sempre zero. Serve separare:
- **Costo operatore internazionale**: dal listino PDF (gia' in `defaultPrefixConfig`)
- **Tariffa vendita al cliente**: dalle `globalPricing` o `clientPricing`

---

### Cosa faremo

**1. Creare sezione dedicata "Listino Operatore"**

Una nuova tab nell'app (o sotto-sezione in Clienti) con:
- Tariffe nazionali editabili (mobile 0.09, fisso 0.01) -- precompilate dal listino NYBYTE
- Tabella tariffe internazionali editabili per paese, importate dal PDF
- Le tariffe internazionali verranno salvate come JSON in un nuovo campo `international_costs` nella tabella `user_global_pricing`
- Possibilita' di resettare ai valori di default del listino

**2. Correggere i default nel database**

Aggiornare i default delle colonne:
- `mobile_cost`: da 0.0159 a **0.09**
- `landline_cost`: da 0.00159 a **0.01**

**3. Separare costo/ricavo per internazionali**

In `ClientPricingSummary.tsx`:
- Il **costo** internazionale usera' le tariffe dal listino operatore (per paese, dal `defaultPrefixConfig` o dal nuovo campo `international_costs`)
- Il **ricavo** internazionale usera' le tariffe di vendita (`international_rate` in `globalPricing` oppure tariffe specifiche per cliente)
- Stesso principio per le chiamate premium/899

**4. Aggiungere tariffe di vendita internazionali per cliente**

Aggiungere campi `international_rate` e `premium_rate` anche a `client_pricing` per poter differenziare le tariffe di vendita per cliente.

---

### Funzionalita' mancanti suggerite

Analizzando l'app per un uso business professionale, mancano queste funzionalita':

1. **Generazione fattura/report per cliente** -- Esportare un PDF/Excel con dettaglio chiamate, durata, costo per singolo cliente (per fatturazione mensile)
2. **Confronto tra periodi** -- Caricare piu' CSV di mesi diversi e confrontare costi/volumi mese su mese
3. **Dashboard riassuntiva multi-sessione** -- Vedere i totali aggregati di tutte le sessioni, non solo una alla volta
4. **Assegnazione numeri in bulk** -- Selezionare piu' numeri dalla lista e assegnarli tutti insieme a un cliente
5. **Alert soglie di costo** -- Notifiche quando un cliente supera una soglia di spesa (il componente `CostAlertsManager` esiste ma non e' integrato)
6. **Limite 1000 record nel salvataggio** -- In `useAnalysisStorage.ts` riga 47, i records vengono troncati a 1000 (`records.slice(0, 1000)`). File grandi perdono dati.

---

### Dettagli tecnici

**Migrazione DB:**
```sql
-- Aggiungere campo per tariffe internazionali personalizzate
ALTER TABLE user_global_pricing
  ADD COLUMN IF NOT EXISTS international_costs jsonb DEFAULT '{}';

-- Aggiornare i default corretti dal listino NYBYTE
ALTER TABLE user_global_pricing
  ALTER COLUMN mobile_cost SET DEFAULT 0.09,
  ALTER COLUMN landline_cost SET DEFAULT 0.01;

-- Aggiungere tariffe internazionali specifiche per cliente
ALTER TABLE client_pricing
  ADD COLUMN IF NOT EXISTS international_rate numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS premium_rate numeric NOT NULL DEFAULT 0;
```

**File da modificare:**
1. `src/components/ClientsManager.tsx` -- Aggiungere sezione "Listino Operatore" con tabella tariffe nazionali + internazionali editabili; aggiungere campi `international_rate` e `premium_rate` nelle tariffe cliente
2. `src/hooks/useClients.ts` -- Aggiornare tipi e mutation per i nuovi campi (`international_costs`, `international_rate`/`premium_rate` per cliente)
3. `src/components/ClientPricingSummary.tsx` -- Separare costo operatore (dal listino) e ricavo (dalle tariffe cliente) per le chiamate internazionali
4. `src/hooks/useAnalysisStorage.ts` -- Rimuovere il limite di 1000 record nel salvataggio (o aumentarlo significativamente)
5. `src/integrations/supabase/types.ts` -- Aggiornamento automatico dopo migrazione

**File nuovo:**
- `src/data/nybyte-tariffs.ts` -- Listino NYBYTE completo come costante TypeScript, usato come default per le tariffe operatore internazionali

### Risultato atteso
- Sezione dedicata per gestire il listino operatore con tutte le tariffe dal PDF NYBYTE
- Tariffe nazionali corrette (0.09 mobile, 0.01 fisso)
- Margine calcolato correttamente anche per chiamate internazionali (costo operatore diverso da ricavo cliente)
- Possibilita' di personalizzare tariffe internazionali per singolo cliente

