import { useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  color?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientNumber {
  id: string;
  user_id: string;
  client_id: string;
  caller_number: string;
  created_at?: string;
}

export const useClients = () => {
  const qc = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Client[];
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["client_numbers"],
    queryFn: async (): Promise<ClientNumber[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("client_numbers")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ClientNumber[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (payload: { name: string; color?: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi effettuare l'accesso");
      const { error } = await supabase.from("clients").insert({
        user_id: user.id,
        name: payload.name,
        color: payload.color ?? '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'),
        notes: payload.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name?: string; color?: string; notes?: string }) => {
      const { error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client_numbers"] });
    },
  });

  const assignNumber = useMutation({
    mutationFn: async ({ clientId, callerNumber }: { clientId: string; callerNumber: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi effettuare l'accesso");
      // Try upsert based on (user_id, caller_number)
      const { error } = await supabase
        .from("client_numbers")
        .upsert({
          user_id: user.id,
          client_id: clientId,
          caller_number: callerNumber,
        }, { onConflict: "user_id,caller_number" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["client_numbers"] }),
  });

  const unassignNumber = useMutation({
    mutationFn: async (callerNumber: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi effettuare l'accesso");
      const { error } = await supabase
        .from("client_numbers")
        .delete()
        .eq("caller_number", callerNumber)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["client_numbers"] }),
  });

  useEffect(() => {
    // Subscribe to realtime changes on clients and client_numbers
    const channel = supabase
      .channel('realtime-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        qc.invalidateQueries({ queryKey: ['clients'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_numbers' }, () => {
        qc.invalidateQueries({ queryKey: ['client_numbers'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const numberToClientMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; color?: string | null }> = {};
    const clients = clientsQuery.data ?? [];
    const assignments = assignmentsQuery.data ?? [];
    assignments.forEach((a) => {
      const c = clients.find((cl) => cl.id === a.client_id);
      if (c) map[a.caller_number] = { id: c.id, name: c.name, color: c.color };
    });
    return map;
  }, [clientsQuery.data, assignmentsQuery.data]);

  const countsByClientId = useMemo(() => {
    const counts: Record<string, number> = {};
    (assignmentsQuery.data ?? []).forEach((a) => {
      counts[a.client_id] = (counts[a.client_id] || 0) + 1;
    });
    return counts;
  }, [assignmentsQuery.data]);

  return {
    clients: clientsQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    numberToClientMap,
    countsByClientId,
    isLoading: clientsQuery.isLoading || assignmentsQuery.isLoading,
    createClient,
    updateClient,
    deleteClient,
    assignNumber,
    unassignNumber,
  };
};
