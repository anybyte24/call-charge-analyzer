

## Correzione Tariffe: Invertire Costi Operatore e Tariffe di Vendita

### Il problema scoperto

Analizzando i PDF appena caricati, ho capito che le tariffe sono attualmente **invertite** nell'app:

| | Attualmente nell'app | Corretto |
|---|---|---|
| **Costo operatore (quello che paghi tu)** | NYBYTE: mobile 0.09, fisso 0.01 | ALFA: mobile **0.0159**, fisso **0.0059** |
| **Tariffa di vendita (quello che addebiti ai clienti)** | Non definito chiaramente | NYBYTE: mobile **0.09**, fisso **0.01** |

I PDF ALFA contengono il tuo **vero costo operatore** -- molto piu' basso delle tariffe NYBYTE. Le tariffe NYBYTE sono quelle che addebiti ai clienti.

### Esempio concreto del margine corretto

Una chiamata mobile nazionale di 10 minuti:
- **Costo tuo (ALFA)**: 10 x 0.0159 = **0.159 EUR**
- **Addebito al cliente (NYBYTE)**: 10 x 0.09 = **0.90 EUR**
- **Margine**: 0.90 - 0.159 = **0.741 EUR** (82% margine)

---

### Cosa faremo

**1. Aggiornare i default del costo operatore nel database**

Nuova migrazione per correggere i default:
- `mobile_cost`: da 0.09 a **0.0159** (costo ALFA reale)
- `landline_cost`: da 0.01 a **0.0059** (costo ALFA reale)
- Aggiornare anche i record esistenti ai valori corretti

**2. Creare il file tariffe ALFA (costi operatore reali)**

Nuovo file `src/data/alfa-operator-tariffs.ts` con:
- Tariffe nazionali: fisso 0.0059, mobile 0.0159 (per operatore)
- Tariffe internazionali dettagliate per paese dal PDF ALFA (con sotto-tariffe per operatore mobile)

**3. Rinominare correttamente il file tariffe NYBYTE**

Aggiornare `src/data/nybyte-tariffs.ts`:
- Cambiare i commenti: da "Tariffe operatore" a "Tariffe di vendita ai clienti"
- `NYBYTE_NATIONAL_TARIFFS` diventa il default per le tariffe di VENDITA

**4. Aggiornare le tariffe internazionali nel number-categorizer**

Il file `src/utils/number-categorizer.ts` (973 righe) attualmente usa le tariffe NYBYTE come `costPerMinute` per ogni prefisso internazionale. Questi valori devono essere sostituiti con le tariffe ALFA (il costo reale dell'operatore), perche' vengono usati per calcolare il **costo** di ogni chiamata nel CSV.

Esempio: Albania landline attualmente 0.13 (NYBYTE), dovrebbe essere 0.157 (ALFA).

**5. Aggiornare la UI in ClientsManager**

Nella tab "Listino Operatore":
- Mostrare le tariffe ALFA come "I tuoi costi operatore" (editabili)
- Mostrare le tariffe NYBYTE nella tab "Tariffe Vendita" come default di vendita ai clienti

**6. Aggiornare la logica di ClientPricingSummary**

- **Costo**: usa tariffe ALFA (dal number-categorizer per internazionali, da `mobile_cost`/`landline_cost` per nazionali)
- **Ricavo**: usa tariffe NYBYTE come default di vendita, sovrascrivibili per cliente

---

### Dettagli tecnici

**Migrazione DB:**
```sql
-- Correggere i default ai costi ALFA reali
ALTER TABLE user_global_pricing
  ALTER COLUMN mobile_cost SET DEFAULT 0.0159,
  ALTER COLUMN landline_cost SET DEFAULT 0.0059;

-- Aggiornare i record esistenti che avevano i valori NYBYTE errati
UPDATE user_global_pricing
SET mobile_cost = 0.0159, landline_cost = 0.0059
WHERE mobile_cost = 0.09 AND landline_cost = 0.01;
```

**File da creare:**
- `src/data/alfa-operator-tariffs.ts` -- Tariffe ALFA complete (nazionali + internazionali) come costanti TypeScript

**File da modificare:**
1. `src/data/nybyte-tariffs.ts` -- Aggiornare commenti/nomi: queste sono tariffe di VENDITA
2. `src/utils/number-categorizer.ts` -- Aggiornare tutti i `costPerMinute` internazionali con i valori ALFA reali
3. `src/components/ClientsManager.tsx` -- Aggiornare le label: "Costi Operatore ALFA" vs "Tariffe Vendita NYBYTE"
4. `src/components/ClientPricingSummary.tsx` -- Usare i default corretti per i calcoli

