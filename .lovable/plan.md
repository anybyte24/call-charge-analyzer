

## Revisione Completa dell'App - Piano di Intervento

Ho analizzato a fondo tutto il codice. Ecco tutti i problemi trovati e le soluzioni proposte, organizzati per priorita'.

---

### PROBLEMA CRITICO 1: Lo storico si perde al refresh della pagina

**Causa:** In `Index.tsx` (riga 22), `sessions` e' un semplice `useState<AnalysisSession[]>([])`. Non viene mai caricato da Supabase. Inoltre, il salvataggio (riga 76-78) ha un bug: salva `currentSession` (la sessione vecchia) invece della nuova appena creata.

**Soluzione:**
- All'avvio della pagina, chiamare `loadSessions()` da `useAnalysisStorage` per caricare le sessioni salvate in Supabase
- Correggere il bug del salvataggio: salvare `session` (la nuova) invece di `currentSession` (la precedente)
- Quando si seleziona una sessione dallo storico, ricaricare anche i `records` dal campo `file_data.records` salvato in Supabase
- Aggiungere un pulsante "Elimina" nello storico per rimuovere sessioni vecchie

---

### PROBLEMA CRITICO 2: La sezione "Clienti" richiede un CSV caricato per essere accessibile

**Causa:** In `Index.tsx` (riga 291-303), la tab "Clienti" mostra "Nessun cliente da gestire" se non c'e' `currentSession`. Ma la gestione clienti (creare clienti, assegnare numeri, configurare tariffe) e' indipendente dai dati CSV.

**Soluzione:**
- Rendere la tab "Clienti" sempre accessibile, senza il gate `currentSession`
- La lista `availableCallerNumbers` puo' essere vuota se non c'e' un CSV caricato, ma il form per creare clienti e configurare tariffe deve funzionare sempre

---

### PROBLEMA 3: Componente `ClientAnalytics.tsx` duplicato e inutilizzato

**Causa:** Esiste `ClientAnalytics.tsx` con logica di pricing locale (state con `ratePerMinuteMobile`, `markupPercentMobile` ecc.) che non usa il database. Non e' referenziato da nessuna parte. E' stato sostituito da `ClientPricingSummary.tsx`.

**Soluzione:**
- Eliminare `ClientAnalytics.tsx` per evitare confusione

---

### PROBLEMA 4: Il tab "Numeri" nella Dashboard non mostra nulla

**Causa:** In `Dashboard.tsx`, il tab "numbers" esiste nel `TabsList` ma non c'e' il corrispondente `TabsContent`. Il componente `TopNumbersAnalysis` e' importato ma non usato.

**Soluzione:**
- Aggiungere il `TabsContent` mancante per il tab "numbers" con `TopNumbersAnalysis`

---

### PROBLEMA 5: Console.log eccessivi in produzione

**Causa:** `call-analyzer.ts` ha decine di `console.log` su ogni riga processata. Con file di migliaia di record, rallenta enormemente il browser.

**Soluzione:**
- Rimuovere tutti i `console.log` di debug dal parsing CSV e dal calcolo costi (mantenere solo quelli di errore)

---

### PROBLEMA 6: La sezione "Clienti" nella Dashboard mostra dati solo con CSV caricato

**Causa:** In `Dashboard.tsx` (riga 199), la tab "clients" mostra `ClientPricingSummary` che dipende da `callerAnalysis`. Questo e' corretto (servono dati da analizzare). Ma i dati del tab non persistono tra sessioni perche' dipendono dai dati in memoria.

**Soluzione:**
- Quando si carica una sessione dallo storico, i records devono essere caricati in modo che anche la tab "Clienti" nella Dashboard funzioni

---

### PROBLEMA 7: Tariffe internazionali usano il costo dell'operatore per il calcolo del ricavo

**Causa:** In `ClientPricingSummary.tsx` (righe 91, 103), sia il costo che il ricavo per le chiamate internazionali e premium usano le stesse tariffe globali (`intlRate`, `premiumRate`). Il margine per queste categorie e' sempre zero.

**Soluzione:**
- Aggiungere campi separati in `client_pricing` o `user_global_pricing` per le tariffe di vendita internazionali/premium
- Oppure, piu' semplice: per ora, usare le tariffe internazionali dal `defaultPrefixConfig` come costo operatore e le `globalPricing` come prezzo di vendita al cliente

---

### PROBLEMA 8: CostAlertsManager non e' integrato

**Causa:** Il componente `CostAlertsManager.tsx` esiste ma non e' usato in nessuna pagina. Inoltre salva gli alert solo in stato locale (non nel database).

**Soluzione:**
- Integrarlo come tab o sotto-sezione. Oppure rimuoverlo se non necessario per ora

---

### Riepilogo delle modifiche da implementare

**File da modificare:**
1. `src/pages/Index.tsx` - Caricare sessioni da Supabase all'avvio, correggere bug salvataggio, rendere "Clienti" sempre accessibile
2. `src/components/HistoryPanel.tsx` - Aggiungere pulsante elimina, mostrare stato "caricamento"
3. `src/components/Dashboard.tsx` - Aggiungere TabsContent mancante per "numbers"
4. `src/utils/call-analyzer.ts` - Rimuovere console.log di debug
5. `src/utils/cost-recalculator.ts` - Rimuovere console.log di debug
6. `src/components/ClientAnalytics.tsx` - Eliminare file duplicato
7. `src/components/CallerAnalysisTable.tsx` - Rimuovere console.log di debug

**Priorita' di implementazione:**
1. Fix storico (persistenza + caricamento sessioni) -- il piu' importante
2. Fix salvataggio sessione (bug currentSession)
3. Clienti sempre accessibili
4. Tab "Numeri" mancante nella Dashboard
5. Pulizia console.log
6. Eliminazione componente duplicato

