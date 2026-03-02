

## Correzioni e Implementazioni Mancanti

### PROBLEMI TROVATI

**1. Ricavo clienti sempre zero se non configurati**

In `ClientPricingSummary.tsx` (righe 100-101), quando un cliente non ha tariffe configurate, `mobileRate` e `landlineRate` vengono impostati a 0. Questo significa che il ricavo per chiamate nazionali e' sempre 0 finche' non si configurano manualmente le tariffe per ogni cliente. Dovrebbero usare le tariffe NYBYTE come default di vendita:

```
// Attuale (sbagliato):
const mobileRate = Number(clientRate?.mobile_rate || 0);
const landlineRate = Number(clientRate?.landline_rate || 0);

// Corretto:
const mobileRate = Number(clientRate?.mobile_rate || 0) || NYBYTE_NATIONAL_TARIFFS.mobile;
const landlineRate = Number(clientRate?.landline_rate || 0) || NYBYTE_NATIONAL_TARIFFS.landline;
```

**2. Tariffe internazionali mostrate con solo 2 decimali**

In `ClientsManager.tsx` riga 334-335, le tariffe ALFA sono mostrate con `toFixed(2)` ma molte hanno 4 cifre significative (es. 0.0159). Dovrebbe essere `toFixed(4)`.

**3. Campo `forfait_only` non usato nei calcoli**

Il campo `forfait_only` esiste in `client_pricing` ma non viene considerato in `ClientPricingSummary`. Se `forfait_only=true`, il ricavo dovrebbe essere solo il forfait mensile, ignorando le tariffe a consumo.

**4. Tariffe vendita NYBYTE internazionali non mostrate nella tab Vendita**

La tab "Tariffe Vendita" mostra solo un campo generico `international_rate` globale, ma non il listino NYBYTE per paese. L'utente non puo' vedere/confrontare le tariffe di vendita per paese.

---

### IMPLEMENTAZIONI SUGGERITE

**5. Default tariffe vendita dal listino NYBYTE**

Nella tab "Tariffe Vendita", precompilare i campi con i valori NYBYTE:
- Mobile: 0.09 (default NYBYTE)
- Fisso: 0.01 (default NYBYTE)
- Mostrare tabella tariffe NYBYTE internazionali per consultazione

**6. Confronto margini per paese**

Aggiungere una tabella nella tab "Listino Operatore" che mostra il confronto tra costo ALFA e vendita NYBYTE per ogni paese, con la colonna margine percentuale.

**7. Esportazione report per cliente**

Bottone per generare un Excel/PDF con il dettaglio chiamate di un singolo cliente (per fatturazione mensile).

**8. Assegnazione numeri in bulk**

Nella tab "Gestione Clienti", permettere di selezionare piu' numeri dalla lista e assegnarli tutti insieme al cliente selezionato.

---

### Dettagli tecnici

**File da modificare:**

1. `src/components/ClientPricingSummary.tsx`
   - Importare `NYBYTE_NATIONAL_TARIFFS` e usarle come fallback per `mobileRate`/`landlineRate` quando non configurate
   - Aggiungere logica `forfait_only`: se attivo, revenue = solo forfait

2. `src/components/ClientsManager.tsx`
   - Cambiare `toFixed(2)` a `toFixed(4)` per le tariffe ALFA internazionali
   - Aggiungere tabella NYBYTE nella tab "Tariffe Vendita" per consultazione
   - Aggiungere tabella confronto margini (ALFA vs NYBYTE per paese)
   - Aggiungere selezione multipla numeri per assegnazione bulk

3. `src/hooks/useExcelExport.ts`
   - Aggiungere funzione per esportare report singolo cliente con dettaglio chiamate, durata, costo, ricavo

### Risultato atteso

- I margini saranno calcolati correttamente anche per clienti senza tariffe specifiche (usando NYBYTE come default)
- Le tariffe ALFA saranno mostrate con precisione a 4 decimali
- L'utente potra' confrontare visivamente costi operatore vs tariffe vendita per paese
- Possibilita' di esportare report per singolo cliente
- Assegnazione numeri piu' rapida con selezione multipla
