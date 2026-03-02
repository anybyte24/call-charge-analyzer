

## Revisione Completa - Miglioramenti e Implementazioni Possibili

### Stato Attuale
L'app e' un sistema maturo di analisi/fatturazione chiamate con: upload CSV, categorizzazione prefissi (nazionali + internazionali), gestione clienti con pricing, forfait con esubero, filtro mensile, export Excel, e confronto margini ALFA vs NYBYTE.

---

### BUG DA CORREGGERE

**1. Console.log di debug ovunque (Produzione)**
`number-categorizer.ts` ha decine di `console.log` con emoji (righe 927, 928, 931, 936, 941, 945, 948, 952-965, 976, 984, 993, 998, 1009, 1013, 1022). Questi rallentano significativamente l'analisi di CSV grandi (migliaia di record) e sporcano la console. Vanno rimossi o sostituiti con un flag `DEBUG`.

**2. `CostAlertsManager` non collegato**
Il componente esiste ma non e' usato da nessuna parte nell'app. Gli alert sono solo in-memory (stato locale), non persistiti su Supabase.

**3. Esubero forfait usa solo tariffa mobile**
In `ClientPricingSummary.tsx` riga 238-239, l'esubero forfait viene calcolato usando solo `clientMobileRate`. Dovrebbe distinguere tra minuti mobile, fisso e internazionale nell'esubero per un calcolo accurato.

**4. `forfait_minutes` castato con `as any`**
In `ClientPricingSummary.tsx` riga 165 e `ClientsManager.tsx` riga 65, `forfait_minutes` viene acceduto con `(clientRate as any)?.forfait_minutes`. Il tipo `ClientPricing` in `useClients.ts` ha gia' il campo ma il cast suggerisce un disallineamento.

---

### MIGLIORAMENTI FUNZIONALI

**5. Report Excel cliente: includere ricavo e margine**
Il report Excel per cliente (`exportClientReport`) esporta solo costo operatore. Manca:
- Colonna "Ricavo" calcolata con le tariffe di vendita del cliente
- Colonna "Margine" (ricavo - costo)
- Foglio riepilogo con totali margine
- Info forfait (minuti usati, inclusi, esubero)

**6. Dashboard riepilogo margini globale**
Non esiste un riepilogo immediato dei margini totali nella dashboard principale. Aggiungere:
- KPI card "Margine Totale" nel header con colore verde/rosso
- KPI card "Clienti in Perdita" con conteggio
- Mini-grafico trend margine per mese

**7. Confronto multi-mese nella tab Clienti**
Il filtro mese mostra un mese alla volta. Sarebbe utile:
- Vista comparativa: tabella con colonne mese-per-mese per ogni cliente
- Trend: grafico a linee del costo/ricavo per cliente nei mesi

**8. Esportazione fattura/preventivo per cliente**
Oltre al report Excel dettagliato, generare un documento di fatturazione con:
- Riepilogo: forfait + esubero + totale
- Dettaglio per categoria (mobile, fisso, internazionale)
- Formato stampabile

---

### MIGLIORAMENTI TECNICI

**9. Rimuovere il `window.location.reload()` dopo ricalcolo**
In `Dashboard.tsx` riga 49, dopo il ricalcolo costi viene fatto un reload della pagina. Bisognerebbe invalidare le query React Query e aggiornare lo stato senza ricaricare.

**10. Persistenza alert costi su Supabase**
`CostAlertsManager` usa stato locale. Per essere utile dovrebbe:
- Salvare gli alert su una tabella `cost_alerts` in Supabase
- Verificare automaticamente le soglie quando si carica un CSV
- Mostrare notifiche quando una soglia viene superata

**11. Limite 1000 righe Supabase**
`loadSessions` non gestisce il limite di 1000 righe di Supabase. Per utenti con molte sessioni, alcune potrebbero non essere caricate.

---

### PRIORITA' CONSIGLIATA

1. **Rimuovere console.log di debug** - Impatto immediato sulle performance
2. **Rimuovere `as any` per forfait_minutes** - Pulizia tipo
3. **Rimuovere `window.location.reload()`** - UX migliore
4. **Migliorare export Excel cliente con margini** - Valore business alto
5. **KPI margine nella dashboard principale** - Visibilita' immediata
6. **Confronto multi-mese** - Analisi avanzata
7. **Esubero forfait per categoria** - Accuratezza fatturazione
8. **Collegare CostAlertsManager** - Feature completata

