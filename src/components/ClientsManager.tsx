import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { PrefixConfig } from "@/types/call-analysis";

interface ClientsManagerProps {
  availableCallerNumbers: string[];
  prefixConfig: PrefixConfig[];
}

const ClientsManager: React.FC<ClientsManagerProps> = ({ availableCallerNumbers, prefixConfig }) => {
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

  const selectedClient = useMemo(() => clients.find((c) => c.id === selectedClientId) || null, [clients, selectedClientId]);

// Pricing state: client-specific
const selectedClientPricing = useMemo(() => clientPricing.find(p => p.client_id === selectedClientId) || null, [clientPricing, selectedClientId]);
const [clientMobileRate, setClientMobileRate] = useState<number>(0);
const [clientLandlineRate, setClientLandlineRate] = useState<number>(0);
const [clientFlatFee, setClientFlatFee] = useState<number>(0);
const [clientForfaitOnly, setClientForfaitOnly] = useState<boolean>(false);

React.useEffect(() => {
  if (selectedClientPricing) {
    setClientMobileRate(Number(selectedClientPricing.mobile_rate) || 0);
    setClientLandlineRate(Number(selectedClientPricing.landline_rate) || 0);
    setClientFlatFee(Number(selectedClientPricing.monthly_flat_fee) || 0);
    setClientForfaitOnly(Boolean(selectedClientPricing.forfait_only));
  } else {
    setClientMobileRate(0);
    setClientLandlineRate(0);
    setClientFlatFee(0);
    setClientForfaitOnly(false);
  }
}, [selectedClientPricing]);

  // Pricing state: global (shared)
  const [globalInternationalRate, setGlobalInternationalRate] = useState<number>(0);
  const [globalPremiumRate, setGlobalPremiumRate] = useState<number>(0);

  React.useEffect(() => {
    setGlobalInternationalRate(Number(globalPricing?.international_rate) || 0);
    setGlobalPremiumRate(Number(globalPricing?.premium_rate) || 0);
  }, [globalPricing]);

const handleSaveClientPricing = async () => {
  if (!selectedClientId) return;
  try {
    await upsertClientPricing.mutateAsync({
      clientId: selectedClientId,
      mobile_rate: clientMobileRate,
      landline_rate: clientLandlineRate,
      monthly_flat_fee: clientFlatFee,
      forfait_only: clientForfaitOnly,
    });
    toast({ title: "Tariffe cliente salvate" });
  } catch (e: any) {
    toast({ title: "Errore", description: e.message, variant: "destructive" });
  }
};

  const handleSaveGlobalPricing = async () => {
    try {
      await upsertGlobalPricing.mutateAsync({
        international_rate: globalInternationalRate,
        premium_rate: globalPremiumRate,
      });
      toast({ title: "Tariffe globali salvate" });
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

  const assignedNumbers = useMemo(() => {
    if (!selectedClientId) return [] as string[];
    return (assignments || [])
      .filter((a) => a.client_id === selectedClientId)
      .map((a) => a.caller_number)
      .sort();
  }, [assignments, selectedClientId]);

  return (
    <div className="space-y-6">
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
              <Input
                placeholder="Nome"
                value={newClient.name}
                onChange={(e) => setNewClient((s) => ({ ...s, name: e.target.value }))}
              />
              <div className="flex items-center gap-3">
                <label className="text-sm">Colore</label>
                <input
                  type="color"
                  value={newClient.color}
                  onChange={(e) => setNewClient((s) => ({ ...s, color: e.target.value }))}
                  className="h-8 w-12 rounded border"
                />
              </div>
              <Textarea
                placeholder="Note"
                value={newClient.notes}
                onChange={(e) => setNewClient((s) => ({ ...s, notes: e.target.value }))}
              />
              <Button onClick={handleCreate} disabled={createClient.isPending}>Aggiungi</Button>
            </div>

            {selectedClient && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Modifica cliente</label>
                <Input
                  placeholder="Nome"
                  value={selectedClient.name}
                  onChange={(e) => updateClient.mutate({ id: selectedClient.id, name: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Assegnazione numeri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Numero chiamante</label>
                    <Input placeholder="es. 0558494133" value={assignNumberValue} onChange={(e) => setAssignNumberValue(e.target.value)} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Oppure scegli dai presenti</label>
                    <Select value={assignNumberValue || undefined} onValueChange={setAssignNumberValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona numero" />
                      </SelectTrigger>
                      <SelectContent className="bg-background max-h-64 overflow-auto">
                        {availableCallerNumbers.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-1 flex items-end">
                    <Button onClick={handleAssign} disabled={!selectedClientId || !assignNumberValue || assignNumber.isPending}>
                      Assegna a cliente
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Suggerimento: i numeri assegnati verranno raggruppati per cliente nella sezione "Chiamanti".</p>
              </CardContent>
            </Card>

            {/* Tariffe globali - condivise per tutti i clienti */}
            <Card>
              <CardHeader>
                <CardTitle>Tariffe globali (condivise)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Internazionali €/min</label>
                  <Input type="number" step="0.001" value={globalInternationalRate}
                    onChange={(e) => setGlobalInternationalRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-sm font-medium">899/199 €/min</label>
                  <Input type="number" step="0.001" value={globalPremiumRate}
                    onChange={(e) => setGlobalPremiumRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSaveGlobalPricing} disabled={upsertGlobalPricing.isPending}>
                    Salva tariffe globali
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tariffe specifiche cliente */}
            {selectedClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Tariffe di {selectedClient.name}</CardTitle>
                </CardHeader>
<CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-3">
  <div>
    <label className="text-sm font-medium">Mobile €/min</label>
    <Input type="number" step="0.001" value={clientMobileRate}
      onChange={(e) => setClientMobileRate(parseFloat(e.target.value) || 0)} />
  </div>
  <div>
    <label className="text-sm font-medium">Fisso €/min</label>
    <Input type="number" step="0.001" value={clientLandlineRate}
      onChange={(e) => setClientLandlineRate(parseFloat(e.target.value) || 0)} />
  </div>
  <div>
    <label className="text-sm font-medium">Forfait mensile €</label>
    <Input type="number" step="0.01" value={clientFlatFee}
      onChange={(e) => setClientFlatFee(parseFloat(e.target.value) || 0)} />
  </div>
  <div className="flex items-end gap-3">
    <div className="flex items-center gap-2">
      <input id="forfait-only" type="checkbox" className="h-4 w-4" checked={clientForfaitOnly} onChange={(e) => setClientForfaitOnly(e.target.checked)} />
      <label htmlFor="forfait-only" className="text-sm">Solo forfait (disattiva €/min)</label>
    </div>
    <Button onClick={handleSaveClientPricing} disabled={upsertClientPricing.isPending || !selectedClientId}>
      Salva tariffe cliente
    </Button>
  </div>
</CardContent>
              </Card>
            )}

            {selectedClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Numeri assegnati a {selectedClient.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedNumbers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nessun numero assegnato. Assegna numeri a questo cliente dalla sezione qui sopra.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Numero</TableHead>
                          <TableHead className="w-20" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedNumbers.map((num) => (
                          <TableRow key={num}>
                            <TableCell>{num}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => unassignNumber.mutate(num)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                        }
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsManager;
