

## Implementazioni da completare

### Stato attuale

Dopo la revisione del codice, le correzioni principali sono gia' state applicate:
- Tariffe ALFA come costo operatore, NYBYTE come vendita
- Logica effective rates (ALFA x 1.5 se ALFA > NYBYTE)
- Tabella confronto margini nella tab Tariffe Vendita
- Logica forfait_only
- Precisione 4 decimali per tariffe internazionali
- Funzione exportClientReport (definita ma non collegata alla UI)

### Cosa manca ancora

**1. Bottone "Esporta Report" per ogni cliente nella tabella Analisi Clienti**

La funzione `exportClientReport` esiste in `useExcelExport.ts` ma non e' mai chiamata dalla UI. Bisogna:
- Passare `records` (CallRecord[]) a `ClientPricingSummary` come prop
- Aggiungere una colonna con un bottone "Esporta" per ogni riga della tabella clienti
- Collegare il bottone a `exportClientReport`

**2. Assegnazione numeri in bulk nella tab Gestione Clienti**

Attualmente si puo' assegnare solo un numero alla volta. Implementare:
- Checkbox per selezionare piu' numeri dalla lista `availableCallerNumbers`
- Bottone "Assegna selezionati" che chiama `assignNumber` per tutti i numeri selezionati

**3. Costo premium configurabile (ora hardcoded a 0.90 EUR/min)**

In `ClientPricingSummary.tsx` riga 114, il costo premium e' fisso a 0.90. Dovrebbe:
- Usare `globalPricing?.premium_rate` come costo operatore premium
- Avere un default ragionevole (0.90) se non configurato

**4. Validazione tariffe (enterprise safety)**

Aggiungere validazione per impedire:
- Tariffe negative
- Tariffe di vendita inferiori al costo operatore (warning, non blocco)
- Toast di conferma quando si salvano tariffe critiche

---

### Dettagli tecnici

**File: `src/components/Dashboard.tsx`**
- Passare `records` a `ClientPricingSummary`: `<ClientPricingSummary callerAnalysis={callerAnalysis} records={records} fileName={fileName} />`

**File: `src/components/ClientPricingSummary.tsx`**
- Aggiungere `records: CallRecord[]` e `fileName: string` all'interfaccia props
- Importare e usare `useExcelExport` 
- Aggiungere colonna "Azioni" con bottone esporta per ogni riga cliente
- Usare `globalPricing?.premium_rate || 0.90` invece di `0.90` hardcoded per il costo premium

**File: `src/components/ClientsManager.tsx`**
- Aggiungere stato `selectedBulkNumbers: Set<string>` per la selezione multipla
- Mostrare lista numeri disponibili con checkbox
- Bottone "Assegna X numeri selezionati" che cicla su `assignNumber`
- Aggiungere validazione: se tariffa vendita < costo ALFA, mostrare warning arancione
- Impedire salvataggio di tariffe negative con toast di errore

### Risultato atteso

- L'utente puo' esportare un report Excel dettagliato per singolo cliente direttamente dalla tabella analisi
- L'utente puo' assegnare piu' numeri contemporaneamente a un cliente
- Il costo premium segue la configurazione globale invece di essere fisso
- Validazione impedisce errori costosi nelle tariffe

