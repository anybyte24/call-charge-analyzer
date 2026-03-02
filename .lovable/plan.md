

## Piano: Forfait con Limite Minuti, Prefissi Mancanti, Numeri Non Riconosciuti

### Analisi del CSV

Il CSV contiene dati dal 01-09-2025 al 29-12-2025 (4 mesi). I numeri chiamati hanno formato `39XXXX#`. Dopo l'analisi:
- Numeri `390575xxx` (Arezzo), `390586xxx` (Livorno), `390583xxx` (Lucca) - gia' coperti
- Numeri `397xxxx` (es. `397473333525#`) - strippato 39, diventa `747xxx` - catturato dal generico `7` come "Mobile"
- Numeri `39800xxx` (Numero Verde) e `39199xxx` (Numero Premium) - coperti
- Numeri `3908118491#` - diventa `08118491` (Napoli) - catturato dal generico `0` come "Fisso" ma SENZA il nome citta'

### Problemi trovati

**1. Prefissi italiani fissi MANCANTI (tutto il Centro-Sud)**
L'elenco copre solo Nord e Toscana. Mancano circa 80 prefissi tra cui:
- 081 Napoli, 089 Salerno, 0823 Caserta, 0824 Benevento, 0825 Avellino
- 085 Pescara, 0861 Teramo, 0862 L'Aquila, 0863 Avezzano
- 091 Palermo, 090 Messina, 095 Catania, 092x Agrigento/Trapani
- 070 Cagliari, 079 Sassari, 071 Ancona, 075 Perugia
- 096x Calabria, 097x Basilicata, 099 Taranto, 080 Bari
- 074x Lazio sud (Viterbo, Rieti, Frosinone, Latina)
- 073x Macerata, Ascoli, Fermo

I numeri vengono comunque tariffati correttamente (generico `0` = 0.0059 EUR/min) ma con descrizione "Fisso" invece del nome citta'.

**2. Prefissi mobili mancanti**
- `397` (Iliad nuove assegnazioni) - catturato dal generico `7` ma senza operatore
- `377`, `378`, `379` sono assegnati a Fastweb ma `397` no

**3. Forfait senza limite minuti**
Il campo `forfait_only` esiste ma non c'e' un campo `forfait_minutes` per impostare un tetto. Se un cliente sfora, l'esubero dovrebbe essere fatturato a tariffe di vendita.

**4. Nessun filtro per mese**
Il CSV contiene piu' mesi ma l'analisi li aggrega tutti insieme. Per i clienti forfait serve analizzare mese per mese.

---

### Implementazioni

**A. Aggiungere ~80 prefissi italiani mancanti in `number-categorizer.ts`**
Aggiungere tutti i prefissi delle province italiane mancanti (Centro, Sud, Isole) con il costo operatore ALFA 0.0059 EUR/min. Questo migliorera' la descrizione nelle analisi senza impattare i costi.

**B. Aggiungere campo `forfait_minutes` al DB e alla logica**
- Aggiungere colonna `forfait_minutes` (integer, default 0) alla tabella `client_pricing`
- Aggiornare `ClientPricing` interface in `useClients.ts`
- Aggiornare `upsertClientPricing` per salvare il valore
- In `ClientsManager.tsx`: aggiungere input "Minuti inclusi" quando forfait_only e' attivo
- In `ClientPricingSummary.tsx`: se forfait_only=true E totalMinutes > forfait_minutes, calcolare l'esubero come `(totalMinutes - forfait_minutes) * tariffe_vendita`

**C. Filtro per mese nell'analisi clienti**
- In `ClientPricingSummary.tsx`: aggiungere un selettore mese basato sulle date presenti nei records
- Filtrare i record per mese prima di calcolare costi/ricavi
- Fondamentale per il calcolo corretto del forfait (che e' mensile)

**D. Aggiornare prefissi mobili `397` (Iliad nuove assegnazioni)**
Aggiungere `397` come prefisso mobile Iliad a 0.0159 EUR/min.

---

### Dettagli tecnici

**File: `supabase/migrations/` (nuova migrazione)**
```sql
ALTER TABLE client_pricing ADD COLUMN IF NOT EXISTS forfait_minutes integer NOT NULL DEFAULT 0;
```

**File: `src/utils/number-categorizer.ts`**
Aggiungere tutti i prefissi italiani mancanti prima del generico `0`:
- 070-079 (Sardegna, Marche, Umbria, Lazio)
- 080-089 (Puglia, Campania, Abruzzo, Molise)
- 090-099 (Sicilia, Calabria, Basilicata)
- Aggiungere `397` come Iliad mobile

**File: `src/hooks/useClients.ts`**
- Aggiungere `forfait_minutes: number` a `ClientPricing` interface
- Aggiornare `upsertClientPricing` per includere `forfait_minutes`

**File: `src/components/ClientsManager.tsx`**
- Aggiungere input "Minuti inclusi nel forfait" visibile quando `forfait_only` e' attivo
- Salvare il valore con `upsertClientPricing`

**File: `src/components/ClientPricingSummary.tsx`**
- Aggiungere selettore mese (dropdown con mesi estratti dai record)
- Filtrare `callerAnalysis` per mese selezionato
- Logica forfait con esubero: se `forfait_only` e `forfait_minutes > 0`, calcolare i minuti totali del mese. Se eccedono `forfait_minutes`, i minuti in esubero generano ricavo a tariffe di vendita.
- Mostrare nella riga cliente: "Forfait: X min usati / Y inclusi" con warning se in esubero

### Risultato atteso

- Tutti i numeri italiani avranno la citta' corretta invece di "Fisso" generico
- I clienti forfait potranno avere un tetto mensile di minuti
- L'esubero forfait sara' fatturato automaticamente a tariffe di vendita
- L'analisi potra' essere filtrata mese per mese per un controllo accurato

