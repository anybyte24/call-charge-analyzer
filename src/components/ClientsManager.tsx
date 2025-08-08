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
  } = useClients();

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({ name: "", color: "#3B82F6", notes: "" });
  const [assignNumberValue, setAssignNumberValue] = useState("");

  const selectedClient = useMemo(() => clients.find((c) => c.id === selectedClientId) || null, [clients, selectedClientId]);

  const handleCreate = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Nome richiesto", description: "Inserisci un nome cliente" });
      return;
    }
    try {
      await createClient.mutateAsync({ name: newClient.name.trim(), color: newClient.color, notes: newClient.notes });
      setNewClient({ name: "", color: "#3B82F6", notes: "" });
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

            {selectedClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Numeri assegnati a {selectedClient.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedNumbers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Non disponibile in questa vista. Vedi raggruppamento in "Chiamanti" o rimuovi assegnazioni cercando per numero.</p>
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
