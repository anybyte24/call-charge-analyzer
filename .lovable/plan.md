

## Stato delle 8 Priorita' e Fix Scheda "Chiamanti"

### Stato attuale delle 8 priorita'

| # | Task | Stato |
|---|------|-------|
| 1 | Rimuovere console.log di debug | FATTO |
| 2 | Rimuovere `as any` per forfait_minutes | PARZIALE - resta un `as any` in `useClients.ts` riga 198 nell'upsert |
| 3 | Rimuovere `window.location.reload()` | FATTO |
| 4 | Export Excel con margini | FATTO - colonne Ricavo/Margine presenti |
| 5 | KPI margine nella dashboard | DA FARE |
| 6 | Confronto multi-mese | DA FARE |
| 7 | Esubero forfait per categoria | FATTO - media ponderata implementata |
| 8 | Collegare CostAlertsManager | DA FARE |

---

### Problema critico: Scheda "Chiamanti"

La scheda "Chiamanti" (`CallerAnalysisTable.tsx`) mostra attualmente `cat.cost` che e' il **costo operatore ALFA** dal CSV. Il cliente vuole invece vedere il **costo al cliente finale** (cioe' il ricavo/fatturato). Questa e' la scheda usata per la fatturazione, quindi deve mostrare quanto addebitare al cliente.

---

### Piano di implementazione

**1. Fix `CallerAnalysisTable` - Mostrare costo al cliente finale**

Modificare `CallerAnalysisTable.tsx` per:
- Accettare nuove props: `clientPricing`, `globalPricing`, `records` (per accedere al tipo di categoria di ogni record)
- Rinominare la colonna "Costo" in "Da Fatturare"
- Calcolare il ricavo per categoria usando le tariffe di vendita del cliente (mobile_rate, landline_rate, international_rate, premium_rate) invece del costo operatore
- Per clienti forfait: mostrare il canone mensile + eventuale esubero
- Aggiungere una colonna "Costo Operatore" piu' piccola per confronto rapido

Logica di calcolo ricavo per ogni macro-gruppo:
- Mobile: `minuti * client.mobile_rate`
- Fisso: `minuti * client.landline_rate`
- Internazionale: `minuti * client.international_rate` (o effective rate per paese)
- Premium: `minuti * client.premium_rate`
- Numero Verde: 0

**2. Aggiornare `Index.tsx`**

Passare le props aggiuntive a `CallerAnalysisTable`:
- `clientPricing` e `globalPricing` dal hook `useClients`
- `records` dalla sessione corrente

**3. Fix residuo `as any` in `useClients.ts`**

Rimuovere il cast `as any` alla riga 198 dell'upsert in `upsertClientPricing`, allineando il tipo del payload con lo schema Supabase.

**4. KPI Margine nella Dashboard principale**

Aggiungere 2 card KPI nella griglia esistente del `Dashboard.tsx`:
- **Margine Totale**: ricavo totale - costo totale, con colore verde/rosso
- **Margine %**: percentuale margine complessiva

Questo richiede calcolare il ricavo anche nella dashboard, usando le stesse tariffe di vendita usate in `ClientPricingSummary`.

---

### Dettagli tecnici

**File: `src/components/CallerAnalysisTable.tsx`**
- Aggiungere props: `clientPricing: ClientPricing[]`, `globalPricing: UserGlobalPricing | null`, `records: CallRecord[]`
- Importare i tipi da `useClients.ts` e le tariffe effective
- Per ogni caller, cercare il cliente associato tramite `numberToClient`, poi la sua tariffa in `clientPricing`
- Calcolare il ricavo per ogni macro-gruppo usando `cat.totalSeconds / 60 * tariffa_vendita`
- Colonne tabella: Categoria | Chiamate | Durata | Da Fatturare | Costo Operatore | % del Totale
- Nel riepilogo collassabile di ogni numero: mostrare il totale da fatturare

**File: `src/pages/Index.tsx`**
- Passare `clientPricing`, `globalPricing`, e `records` al componente `CallerAnalysisTable`

**File: `src/hooks/useClients.ts`**
- Riga 198: sostituire `as any` con il tipo corretto dell'insert di `client_pricing`

**File: `src/components/Dashboard.tsx`**
- Aggiungere 2 KPI card per margine totale e margine percentuale nella griglia KPI esistente
- Calcolare il ricavo aggregato usando `clientPricing` + `EFFECTIVE_NATIONAL_RATES`

