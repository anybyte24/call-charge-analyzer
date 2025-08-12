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

export interface ClientPricing {
  id: string;
  user_id: string;
  client_id: string;
  mobile_rate: number;
  landline_rate: number;
  monthly_flat_fee: number;
  forfait_only?: boolean; // new flag
  currency?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserGlobalPricing {
  id: string;
  user_id: string;
  international_rate: number;
  premium_rate: number;
  currency?: string | null;
  created_at?: string;
  updated_at?: string;
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

  const clientPricingQuery = useQuery({
    queryKey: ["client_pricing"],
    queryFn: async (): Promise<ClientPricing[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("client_pricing")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ClientPricing[];
    },
  });

  const globalPricingQuery = useQuery({
    queryKey: ["user_global_pricing"],
    queryFn: async (): Promise<UserGlobalPricing | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_global_pricing")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserGlobalPricing | null;
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

const upsertClientPricing = useMutation({
  mutationFn: async ({ clientId, mobile_rate, landline_rate, monthly_flat_fee, forfait_only }: { clientId: string; mobile_rate: number; landline_rate: number; monthly_flat_fee: number; forfait_only: boolean; }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Devi effettuare l'accesso");
    const { error } = await supabase
      .from("client_pricing")
      .upsert({
        user_id: user.id,
        client_id: clientId,
        mobile_rate,
        landline_rate,
        monthly_flat_fee,
        forfait_only,
      }, { onConflict: "user_id,client_id" });
    if (error) throw error;
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ["client_pricing"] }),
});

  const upsertGlobalPricing = useMutation({
    mutationFn: async ({ international_rate, premium_rate }: { international_rate: number; premium_rate: number; }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi effettuare l'accesso");
      const { error } = await supabase
        .from("user_global_pricing")
        .upsert({
          user_id: user.id,
          international_rate,
          premium_rate,
        }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_global_pricing"] }),
  });

  useEffect(() => {
    // Subscribe to realtime changes on related tables
    const channel = supabase
      .channel('realtime-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        qc.invalidateQueries({ queryKey: ['clients'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_numbers' }, () => {
        qc.invalidateQueries({ queryKey: ['client_numbers'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_pricing' }, () => {
        qc.invalidateQueries({ queryKey: ['client_pricing'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_global_pricing' }, () => {
        qc.invalidateQueries({ queryKey: ['user_global_pricing'] });
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
    clientPricing: clientPricingQuery.data ?? [],
    globalPricing: globalPricingQuery.data ?? null,
    numberToClientMap,
    countsByClientId,
    isLoading: clientsQuery.isLoading || assignmentsQuery.isLoading,
    createClient,
    updateClient,
    deleteClient,
    assignNumber,
    unassignNumber,
    upsertClientPricing,
    upsertGlobalPricing,
  };
};
