import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Search, AlertTriangle } from "lucide-react";
import { NYBYTE_NATIONAL_TARIFFS, NYBYTE_INTERNATIONAL_TARIFFS, tariffsToFlatMap } from "@/data/nybyte-tariffs";
import { ALFA_NATIONAL_TARIFFS, ALFA_INTERNATIONAL_TARIFFS, alfaTariffsToFlatMap } from "@/data/alfa-operator-tariffs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EFFECTIVE_INTERNATIONAL_RATES, EFFECTIVE_NATIONAL_RATES } from "@/utils/effective-selling-rates";

interface ClientsManagerProps {
  availableCallerNumbers: string[];
}

const ClientsManager: React.FC<ClientsManagerProps> = ({ availableCallerNumbers }) => {
  const { toast } = useToast();
  const {
    clients,
    countsByClientId,
    createClient,
    updateClient,
    deleteClient,
    assignNumber,
    unassignNumber,
    assignments,
    clientPricing,
    globalPricing,
    upsertClientPricing,
    upsertGlobalPricing,
  } = useClients();

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({ name: "", color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'), notes: "" });
  const [assignNumberValue, setAssignNumberValue] = useState("");
  const [selectedBulkNumbers, setSelectedBulkNumbers] = useState<Set<string>>(new Set());
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [tariffSearch, setTariffSearch] = useState("");

  const selectedClient = useMemo(() => clients.find((c) => c.id === selectedClientId) || null, [clients, selectedClientId]);

  // Pricing state: client-specific
  const selectedClientPricing = useMemo(() => clientPricing.find(p => p.client_id === selectedClientId) || null, [clientPricing, selectedClientId]);
  const [clientMobileRate, setClientMobileRate] = useState<number>(0);
  const [clientLandlineRate, setClientLandlineRate] = useState<number>(0);
  const [clientFlatFee, setClientFlatFee] = useState<number>(0);
  const [clientIntlRate, setClientIntlRate] = useState<number>(0);
  const [clientPremiumRate, setClientPremiumRate] = useState<number>(0);

  React.useEffect(() => {
    if (selectedClientPricing) {
      setClientMobileRate(Number(selectedClientPricing.mobile_rate) || 0);
      setClientLandlineRate(Number(selectedClientPricing.landline_rate) || 0);
      setClientFlatFee(Number(selectedClientPricing.monthly_flat_fee) || 0);
      setClientIntlRate(Number(selectedClientPricing.international_rate) || 0);
      setClientPremiumRate(Number(selectedClientPricing.premium_rate) || 0);
    } else {
      setClientMobileRate(0);
      setClientLandlineRate(0);
      setClientFlatFee(0);
      setClientIntlRate(0);
      setClientPremiumRate(0);
    }
  }, [selectedClientPricing]);

  // Pricing state: global (shared)
  const [globalInternationalRate, setGlobalInternationalRate] = useState<number>(0);
  const [globalPremiumRate, setGlobalPremiumRate] = useState<number>(0);
  const [globalMobileCost, setGlobalMobileCost] = useState<number>(ALFA_NATIONAL_TARIFFS.mobile);
  const [globalLandlineCost, setGlobalLandlineCost] = useState<number>(ALFA_NATIONAL_TARIFFS.landline);

  React.useEffect(() => {
    setGlobalInternationalRate(Number(globalPricing?.international_rate) || 0);
    setGlobalPremiumRate(Number(globalPricing?.premium_rate) || 0);
    setGlobalMobileCost(Number(globalPricing?.mobile_cost) || ALFA_NATIONAL_TARIFFS.mobile);
    setGlobalLandlineCost(Number(globalPricing?.landline_cost) || ALFA_NATIONAL_TARIFFS.landline);
  }, [globalPricing]);

  const handleSaveClientPricing = async () => {
    if (!selectedClientId) return;
    // Validation: no negative rates
    const rates = [clientMobileRate, clientLandlineRate, clientFlatFee, clientIntlRate, clientPremiumRate];
    if (rates.some(r => r < 0)) {
      toast({ title: "Errore", description: "Le tariffe non possono essere negative.", variant: "destructive" });
      return;
    }
    // Warning: selling below cost
    if (clientMobileRate > 0 && clientMobileRate < ALFA_NATIONAL_TARIFFS.mobile) {
      toast({ title: "⚠️ Attenzione", description: `Tariffa mobile (${clientMobileRate}) inferiore al costo ALFA (${ALFA_NATIONAL_TARIFFS.mobile}). Stai vendendo in perdita!`, variant: "destructive" });
    }
    if (clientLandlineRate > 0 && clientLandlineRate < ALFA_NATIONAL_TARIFFS.landline) {
      toast({ title: "⚠️ Attenzione", description: `Tariffa fisso (${clientLandlineRate}) inferiore al costo ALFA (${ALFA_NATIONAL_TARIFFS.landline}). Stai vendendo in perdita!`, variant: "destructive" });
    }
    try {
      await upsertClientPricing.mutateAsync({
        clientId: selectedClientId,
        mobile_rate: clientMobileRate,
        landline_rate: clientLandlineRate,
        monthly_flat_fee: clientFlatFee,
        international_rate: clientIntlRate,
        premium_rate: clientPremiumRate,
      });
      toast({ title: "Tariffe cliente salvate" });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveGlobalPricing = async () => {
    const rates = [globalInternationalRate, globalPremiumRate, globalMobileCost, globalLandlineCost];
    if (rates.some(r => r < 0)) {
      toast({ title: "Errore", description: "Le tariffe non possono essere negative.", variant: "destructive" });
      return;
    }
    try {
      await upsertGlobalPricing.mutateAsync({
        international_rate: globalInternationalRate,
        premium_rate: globalPremiumRate,
        mobile_cost: globalMobileCost,
        landline_cost: globalLandlineCost,
      });
      toast({ title: "Tariffe globali salvate" });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const handleResetToAlfa = async () => {
    try {
      await upsertGlobalPricing.mutateAsync({
        international_rate: globalInternationalRate,
        premium_rate: globalPremiumRate,
        mobile_cost: ALFA_NATIONAL_TARIFFS.mobile,
        landline_cost: ALFA_NATIONAL_TARIFFS.landline,
        international_costs: alfaTariffsToFlatMap(),
      });
      setGlobalMobileCost(ALFA_NATIONAL_TARIFFS.mobile);
      setGlobalLandlineCost(ALFA_NATIONAL_TARIFFS.landline);
      toast({ title: "Tariffe resettate al listino ALFA" });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Nome richiesto", description: "Inserisci un nome cliente" });
      return;
    }
    try {
      await createClient.mutateAsync({ name: newClient.name.trim(), color: newClient.color, notes: newClient.notes });
      setNewClient({ name: "", color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'), notes: "" });
      toast({ title: "Cliente creato" });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const handleAssign = async () => {
    const num = assignNumberValue.trim();
    if (!selectedClientId || !num) return;
    try {
      await assignNumber.mutateAsync({ clientId: selectedClientId, callerNumber: num });
      setAssignNumberValue("");
      toast({ title: "Numero assegnato" });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedClientId || selectedBulkNumbers.size === 0) return;
    setBulkAssigning(true);
    try {
      const nums = Array.from(selectedBulkNumbers);
      for (const num of nums) {
        await assignNumber.mutateAsync({ clientId: selectedClientId, callerNumber: num });
      }
      toast({ title: `${nums.length} numeri assegnati`, description: `Assegnati a ${selectedClient?.name}` });
      setSelectedBulkNumbers(new Set());
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setBulkAssigning(false);
    }
  };

  const toggleBulkNumber = (num: string) => {
    setSelectedBulkNumbers(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const assignedNumbers = useMemo(() => {
    if (!selectedClientId) return [] as string[];
    return (assignments || [])
      .filter((a) => a.client_id === selectedClientId)
      .map((a) => a.caller_number)
      .sort();
  }, [assignments, selectedClientId]);

  const filteredTariffs = useMemo(() => {
    if (!tariffSearch.trim()) return ALFA_INTERNATIONAL_TARIFFS;
    const q = tariffSearch.toLowerCase();
    return ALFA_INTERNATIONAL_TARIFFS.filter(t => t.country.toLowerCase().includes(q));
  }, [tariffSearch]);

  const filteredEffectiveRates = useMemo(() => {
    if (!tariffSearch.trim()) return EFFECTIVE_INTERNATIONAL_RATES;
    const q = tariffSearch.toLowerCase();
    return EFFECTIVE_INTERNATIONAL_RATES.filter(r => r.country.toLowerCase().includes(q));
  }, [tariffSearch]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">Gestione Clienti</TabsTrigger>
          <TabsTrigger value="operator">Listino Operatore</TabsTrigger>
          <TabsTrigger value="pricing">Tariffe Vendita</TabsTrigger>
        </TabsList>

        {/* TAB 1: Gestione Clienti */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Clienti</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seleziona cliente</label>
                  <Select value={selectedClientId ?? undefined} onValueChange={(v) => setSelectedClientId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Scegli un cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color || "#64748B" }} />
                            {c.name}
                            <Badge variant="secondary" className="ml-2">{countsByClientId[c.id] || 0}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nuovo cliente</label>
                  <Input placeholder="Nome" value={newClient.name} onChange={(e) => setNewClient((s) => ({ ...s, name: e.target.value }))} />
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Colore</label>
                    <input type="color" value={newClient.color} onChange={(e) => setNewClient((s) => ({ ...s, color: e.target.value }))} className="h-8 w-12 rounded border" />
                  </div>
                  <Textarea placeholder="Note" value={newClient.notes} onChange={(e) => setNewClient((s) => ({ ...s, notes: e.target.value }))} />
                  <Button onClick={handleCreate} disabled={createClient.isPending}>Aggiungi</Button>
                </div>

                {selectedClient && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modifica cliente</label>
                    <Input placeholder="Nome" value={selectedClient.name} onChange={(e) => updateClient.mutate({ id: selectedClient.id, name: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                <Card className="border-dashed">
                  <CardHeader><CardTitle>Assegnazione numeri</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="text-sm font-medium">Numero chiamante</label>
                        <Input placeholder="es. 0558494133" value={assignNumberValue} onChange={(e) => setAssignNumberValue(e.target.value)} />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-sm font-medium">Oppure scegli dai presenti</label>
                        <Select value={assignNumberValue || undefined} onValueChange={setAssignNumberValue}>
                          <SelectTrigger><SelectValue placeholder="Seleziona numero" /></SelectTrigger>
                          <SelectContent className="bg-background max-h-64 overflow-auto">
                            {availableCallerNumbers.map((n) => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-1 flex items-end">
                        <Button onClick={handleAssign} disabled={!selectedClientId || !assignNumberValue || assignNumber.isPending}>Assegna a cliente</Button>
                      </div>
                    </div>

                    {/* Bulk assignment */}
                    {selectedClientId && availableCallerNumbers.length > 0 && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Selezione multipla</label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBulkNumbers(new Set(availableCallerNumbers))}
                            >
                              Seleziona tutti
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBulkNumbers(new Set())}
                            >
                              Deseleziona
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-48 overflow-auto border rounded-md p-2 space-y-1">
                          {availableCallerNumbers.map((num) => (
                            <label key={num} className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer text-sm">
                              <Checkbox
                                checked={selectedBulkNumbers.has(num)}
                                onCheckedChange={() => toggleBulkNumber(num)}
                              />
                              <span className="font-mono">{num}</span>
                            </label>
                          ))}
                        </div>
                        {selectedBulkNumbers.size > 0 && (
                          <Button
                            onClick={handleBulkAssign}
                            disabled={bulkAssigning}
                            className="w-full"
                          >
                            {bulkAssigning ? 'Assegnando...' : `Assegna ${selectedBulkNumbers.size} numeri a ${selectedClient?.name}`}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedClient && (
                  <Card>
                    <CardHeader><CardTitle>Numeri assegnati a {selectedClient.name}</CardTitle></CardHeader>
                    <CardContent>
                      {assignedNumbers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessun numero assegnato.</p>
                      ) : (
                        <Table>
                          <TableHeader><TableRow><TableHead>Numero</TableHead><TableHead className="w-20" /></TableRow></TableHeader>
                          <TableBody>
                            {assignedNumbers.map((num) => (
                              <TableRow key={num}>
                                <TableCell>{num}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={() => unassignNumber.mutate(num)}><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Listino Operatore */}
        <TabsContent value="operator">
          <div className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Costi Operatore ALFA (nazionali)</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleResetToAlfa} disabled={upsertGlobalPricing.isPending}>
                    <RotateCcw className="h-4 w-4 mr-2" />Reset listino ALFA
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Mobile €/min</label>
                  <Input type="number" step="0.0001" value={globalMobileCost} onChange={(e) => setGlobalMobileCost(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground mt-1">Default ALFA: {ALFA_NATIONAL_TARIFFS.mobile} €/min</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fisso €/min</label>
                  <Input type="number" step="0.0001" value={globalLandlineCost} onChange={(e) => setGlobalLandlineCost(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground mt-1">Default ALFA: {ALFA_NATIONAL_TARIFFS.landline} €/min</p>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSaveGlobalPricing} disabled={upsertGlobalPricing.isPending}>Salva tariffe operatore</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Costi Operatore ALFA (internazionali)</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca paese..." value={tariffSearch} onChange={(e) => setTariffSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paese</TableHead>
                        <TableHead className="text-right">Fisso €/min</TableHead>
                        <TableHead className="text-right">Mobile €/min</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTariffs.map((t) => (
                        <TableRow key={t.country}>
                          <TableCell className="font-medium">{t.country}</TableCell>
                          <TableCell className="text-right font-mono">{t.landline.toFixed(4)}</TableCell>
                          <TableCell className="text-right font-mono">{t.mobile.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {ALFA_INTERNATIONAL_TARIFFS.length} paesi • Costi operatore ALFA • Tariffazione al secondo • IVA esclusa
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Tariffe Vendita */}
        <TabsContent value="pricing">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tariffe di vendita globali (per tutti i clienti)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-sm font-medium">Mobile €/min</label>
                    <Input type="number" step="0.001" value={NYBYTE_NATIONAL_TARIFFS.mobile} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Default NYBYTE</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fisso €/min</label>
                    <Input type="number" step="0.001" value={NYBYTE_NATIONAL_TARIFFS.landline} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Default NYBYTE</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Internazionali €/min (vendita)</label>
                    <Input type="number" step="0.001" value={globalInternationalRate} onChange={(e) => setGlobalInternationalRate(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">899/199 €/min (vendita)</label>
                    <Input type="number" step="0.001" value={globalPremiumRate} onChange={(e) => setGlobalPremiumRate(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <Button onClick={handleSaveGlobalPricing} disabled={upsertGlobalPricing.isPending}>Salva tariffe vendita</Button>
              </CardContent>
            </Card>

            {/* Confronto margini ALFA vs Vendita Effettiva */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Confronto Margini: Costo ALFA vs Vendita Effettiva</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca paese..." value={tariffSearch} onChange={(e) => setTariffSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Dove il costo ALFA supera il prezzo NYBYTE, il prezzo di vendita viene alzato a ALFA × 1.5 (evidenziato in arancione)
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="p-3 border-dashed">
                    <p className="text-sm font-medium">Margine Nazionale Mobile</p>
                    <p className="text-lg font-bold text-green-600">
                      {((1 - ALFA_NATIONAL_TARIFFS.mobile / EFFECTIVE_NATIONAL_RATES.mobile) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">ALFA {ALFA_NATIONAL_TARIFFS.mobile} → Vendita {EFFECTIVE_NATIONAL_RATES.mobile} €/min</p>
                  </Card>
                  <Card className="p-3 border-dashed">
                    <p className="text-sm font-medium">Margine Nazionale Fisso</p>
                    <p className="text-lg font-bold text-green-600">
                      {((1 - ALFA_NATIONAL_TARIFFS.landline / EFFECTIVE_NATIONAL_RATES.landline) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">ALFA {ALFA_NATIONAL_TARIFFS.landline} → Vendita {EFFECTIVE_NATIONAL_RATES.landline} €/min</p>
                  </Card>
                </div>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paese</TableHead>
                        <TableHead className="text-right">ALFA Fisso</TableHead>
                        <TableHead className="text-right">Vendita Fisso</TableHead>
                        <TableHead className="text-right">Margine %</TableHead>
                        <TableHead className="text-right">ALFA Mobile</TableHead>
                        <TableHead className="text-right">Vendita Mobile</TableHead>
                        <TableHead className="text-right">Margine %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEffectiveRates.map((eff) => {
                        const marginLandline = eff.landline > 0 ? ((1 - eff.alfaLandline / eff.landline) * 100) : 0;
                        const marginMobile = eff.mobile > 0 ? ((1 - eff.alfaMobile / eff.mobile) * 100) : 0;
                        return (
                          <TableRow key={eff.country}>
                            <TableCell className="font-medium">{eff.country}</TableCell>
                            <TableCell className="text-right font-mono">{eff.alfaLandline.toFixed(4)}</TableCell>
                            <TableCell className={`text-right font-mono ${eff.landlineAdjusted ? 'text-orange-600 font-semibold' : ''}`}>
                              {eff.landline.toFixed(4)}
                              {eff.landlineAdjusted && ' ⚠️'}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${marginLandline >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {marginLandline.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right font-mono">{eff.alfaMobile.toFixed(4)}</TableCell>
                            <TableCell className={`text-right font-mono ${eff.mobileAdjusted ? 'text-orange-600 font-semibold' : ''}`}>
                              {eff.mobile.toFixed(4)}
                              {eff.mobileAdjusted && ' ⚠️'}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${marginMobile >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                              {marginMobile.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ = Prezzo vendita alzato automaticamente (ALFA × 1.5) perché il costo operatore superava il listino NYBYTE
                </p>
              </CardContent>
            </Card>

            {/* Tariffe specifiche cliente */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedClient ? `Tariffe di ${selectedClient.name}` : 'Seleziona un cliente dalla tab "Gestione Clienti"'}
                </CardTitle>
              </CardHeader>
              {selectedClient && (
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="text-sm font-medium">Mobile €/min</label>
                      <Input type="number" step="0.001" min="0" value={clientMobileRate} onChange={(e) => setClientMobileRate(parseFloat(e.target.value) || 0)} />
                      <p className="text-xs text-muted-foreground mt-1">Default: {NYBYTE_NATIONAL_TARIFFS.mobile}</p>
                      {clientMobileRate > 0 && clientMobileRate < ALFA_NATIONAL_TARIFFS.mobile && (
                        <p className="text-xs text-orange-600 flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" />Sotto costo ALFA!</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fisso €/min</label>
                      <Input type="number" step="0.001" min="0" value={clientLandlineRate} onChange={(e) => setClientLandlineRate(parseFloat(e.target.value) || 0)} />
                      <p className="text-xs text-muted-foreground mt-1">Default: {NYBYTE_NATIONAL_TARIFFS.landline}</p>
                      {clientLandlineRate > 0 && clientLandlineRate < ALFA_NATIONAL_TARIFFS.landline && (
                        <p className="text-xs text-orange-600 flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" />Sotto costo ALFA!</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Internaz. €/min</label>
                      <Input type="number" step="0.001" min="0" value={clientIntlRate} onChange={(e) => setClientIntlRate(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Premium €/min</label>
                      <Input type="number" step="0.001" min="0" value={clientPremiumRate} onChange={(e) => setClientPremiumRate(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Forfait €</label>
                      <Input type="number" step="0.01" min="0" value={clientFlatFee} onChange={(e) => setClientFlatFee(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleSaveClientPricing} disabled={upsertClientPricing.isPending || !selectedClientId}>Salva</Button>
                    </div>
                  </div>
                  {(clientMobileRate < 0 || clientLandlineRate < 0 || clientIntlRate < 0 || clientPremiumRate < 0 || clientFlatFee < 0) && (
                    <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      Le tariffe negative non sono permesse e non verranno salvate.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsManager;
