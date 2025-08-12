import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { PrefixConfig } from '@/types/call-analysis';
import Tesseract from 'tesseract.js';

interface OcrTariffImporterProps {
  companyConfig: PrefixConfig[];
  onConfigChange: (config: PrefixConfig[]) => void;
}

interface OcrEntry {
  label: string;
  rate: number; // EUR per minute, VAT excluded
}

const OcrTariffImporter: React.FC<OcrTariffImporterProps> = ({ companyConfig, onConfigChange }) => {
  const [entries, setEntries] = useState<OcrEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const nationalEntry = useMemo(() => entries.find(e => /\bnational\b/i.test(e.label)), [entries]);
  const mobileTimEntry = useMemo(() => entries.find(e => /\bmobile\b\s*tim\b/i.test(e.label)), [entries]);

  const parseOcrText = (text: string): OcrEntry[] => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const out: Record<string, number> = {};
    for (const line of lines) {
      // Match: "Label .... 0,0150" or "Label .... 0.0150"
      const m = line.match(/^(.*?)(?:\s|\t)+([0-9]+[.,][0-9]{2,4})\s*$/);
      if (!m) continue;
      const label = m[1].replace(/[:;|]+$/g, '').trim();
      const rateStr = m[2].replace(/\./g, '.').replace(/,/g, '.');
      const rate = parseFloat(rateStr);
      if (!isFinite(rate)) continue;
      // Deduplicate by best (min) rate per label if repeated
      if (!(label in out) || rate < out[label]) out[label] = rate;
    }
    return Object.entries(out).map(([label, rate]) => ({ label, rate }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    const collected: OcrEntry[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const { data } = await Tesseract.recognize(f, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress != null) {
              const base = (i / files.length) * 100;
              setProgress(Math.min(100, Math.round(base + m.progress * (100 / files.length))));
            }
          }
        });
        const parsed = parseOcrText(data.text);
        collected.push(...parsed);
      } catch (err) {
        console.error('OCR error', err);
        toast({ title: 'Errore OCR', description: `Impossibile leggere ${f.name}`, variant: 'destructive' });
      }
    }

    // Merge results by label (keep lowest rate if duplicates)
    const merged: Record<string, number> = {};
    for (const e of collected) {
      if (!(e.label in merged) || e.rate < merged[e.label]) merged[e.label] = e.rate;
    }
    const finalEntries = Object.entries(merged).map(([label, rate]) => ({ label, rate }));
    setEntries(finalEntries);
    setIsProcessing(false);
    setProgress(100);

    toast({ title: 'OCR completato', description: `${finalEntries.length} righe tariffarie estratte` });
  };

  const applyToItalianLandlines = () => {
    if (!nationalEntry) {
      toast({ title: 'Tariffa National non trovata', description: 'Nessuna riga "National" nelle immagini', variant: 'destructive' });
      return;
    }
    const rate = nationalEntry.rate;
    const updated = companyConfig.map((p) =>
      p.category === 'landline' ? { ...p, costPerMinute: rate } : p
    );
    onConfigChange(updated);
    toast({ title: 'Applicato ai fissi italiani', description: `€${rate.toFixed(4)}/min (60/60, IVA escl.)` });
  };

  const applyToItalianMobiles = () => {
    const entry = mobileTimEntry || entries.find(e => /\bmobile\b/i.test(e.label));
    if (!entry) {
      toast({ title: 'Tariffa Mobile non trovata', description: 'Nessuna riga "Mobile TIM" o "Mobile"', variant: 'destructive' });
      return;
    }
    const rate = entry.rate;
    const updated = companyConfig.map((p) =>
      p.category === 'mobile' ? { ...p, costPerMinute: rate } : p
    );
    onConfigChange(updated);
    toast({ title: 'Applicato ai mobili italiani', description: `€${rate.toFixed(4)}/min (60/60, IVA escl.)` });
  };

  const copyCSV = async () => {
    const header = 'label,rate_eur_per_min';
    const rows = entries.map(e => `${JSON.stringify(e.label)},${e.rate.toFixed(4)}`).join('\n');
    const csv = `${header}\n${rows}`;
    await navigator.clipboard.writeText(csv);
    toast({ title: 'Copiato negli appunti', description: 'Tariffe OCR in formato CSV' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Importa tariffe da immagini (OCR)</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyCSV} disabled={!entries.length}>Copia CSV</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
          <Button onClick={applyToItalianLandlines} variant="secondary" disabled={!entries.length}>Applica "National" ai fissi IT</Button>
          <Button onClick={applyToItalianMobiles} variant="secondary" disabled={!entries.length}>Applica "Mobile TIM" ai mobili IT</Button>
        </div>
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">Elaborazione OCR… {progress}%</p>
          </div>
        )}

        {!!entries.length && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etichetta</TableHead>
                  <TableHead>Tariffa (€/min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.label}>
                    <TableCell className="whitespace-pre-wrap">{e.label}</TableCell>
                    <TableCell>€{e.rate.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Note: i prezzi importati sono considerati IVA esclusa; arrotondamento 60/60 (minimo 60s, scatti da 60s).</p>
      </CardContent>
    </Card>
  );
};

export default OcrTariffImporter;
