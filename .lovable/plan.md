

## Fix: Numeri Premium fatturati a €0.00 + Revisione completa tariffe

### Problema
In 3 file (`CallerAnalysisTable.tsx`, `ClientPricingSummary.tsx`, `Dashboard.tsx`), quando la tariffa premium del cliente (`premium_rate`) non e' configurata (= 0), il ricavo viene calcolato come 0. Questo e' sbagliato: se non c'e' una tariffa premium personalizzata, il sistema deve usare un fallback ragionevole.

I numeri premium (899, 199, 848, ecc.) hanno costi operatore variabili e alti. Con €0.00 di fatturato, si va in perdita netta.

### Soluzione

Applicare la stessa logica gia' usata per le tariffe internazionali: se il costo operatore supera il prezzo di vendita, il prezzo di vendita diventa `costo * 1.5`. Come fallback per i numeri premium senza tariffa configurata, usare `costo operatore * 1.5` (markup 50%).

### Modifiche

**1. `src/components/CallerAnalysisTable.tsx`** (funzione `calculateRevenue`)
- Riga 88: se `clientPremRate` risulta 0, calcolare il fallback dal costo operatore del gruppo
- Passare il `cost` del macro-gruppo nella logica premium
- Quando `catLower` e' premium e la tariffa e' 0: usare `(group.cost / min) * 1.5 * min` = `group.cost * 1.5`

**2. `src/components/ClientPricingSummary.tsx`** (riga 205-206)
- Stessa logica: se `clientPremRate` e' 0 e `isPremium`, usare `catCost * 1.5` come ricavo

**3. `src/components/Dashboard.tsx`** (riga 80)
- Stessa logica: se `premRate` e' 0 e `isPremium`, usare `cat.cost * 1.5` come ricavo

### Dettaglio tecnico

In tutti e 3 i file, la correzione e' la stessa pattern:

```text
PRIMA:  if (isPremium) revenue = min * clientPremRate;  // = 0 se non configurato
DOPO:   if (isPremium) revenue = clientPremRate > 0 ? min * clientPremRate : (catCost * 1.5);
```

Questo garantisce che:
- Se il cliente ha una tariffa premium configurata, viene usata quella
- Se non ce l'ha, il sistema applica un markup del 50% sul costo operatore reale
- Non si va mai in perdita sui numeri premium
- La logica e' coerente in tutte le viste (Chiamanti, Clienti, Dashboard KPI)

### File da modificare
1. `src/components/CallerAnalysisTable.tsx` - funzione `calculateRevenue`, riga 97
2. `src/components/ClientPricingSummary.tsx` - logica premium, riga 205-206
3. `src/components/Dashboard.tsx` - logica premium, riga 80
