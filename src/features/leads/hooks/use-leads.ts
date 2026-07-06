"use client";

import { useState, useEffect, useCallback } from "react";
import { leadsService } from "@/services/leads.service";
import { useUIStore } from "@/store";
import type { Lead, LeadFilters, LeadStats, LeadStatus } from "@/types/lead";
import type { LeadFormValues } from "../schemas/lead.schema";

const STATUS_KEYS: LeadStatus[] = [
  "NUEVO",
  "CONTACTADO",
  "VISITA_AGENDADA",
  "VISITA_REALIZADA",
  "NEGOCIACION",
  "GANADO",
  "PERDIDO",
];

// Calcula las métricas del pipeline a partir del listado completo de leads
function computeStats(leads: Lead[]): LeadStats {
  const byStatus = STATUS_KEYS.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {} as Record<LeadStatus, number>);

  for (const lead of leads) byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1;

  const won = byStatus.GANADO;
  const lost = byStatus.PERDIDO;
  const closed = won + lost;
  const conversionRate = closed > 0 ? (won / closed) * 100 : 0;

  return { total: leads.length, byStatus, won, lost, conversionRate };
}

// Mapea los valores del formulario al modelo Lead parcial que consume el servicio
function formToLead(data: LeadFormValues): Partial<Lead> {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    origin: data.origin,
    status: data.status,
    propertyId: data.propertyId || undefined,
    message: data.message || undefined,
    visitDate: data.visitDate || undefined,
    visitConfirmed: data.visitConfirmed,
    notes: data.notes || undefined,
  };
}

interface UseLeadsReturn {
  leads: Lead[];
  allLeads: Lead[];
  stats: LeadStats;
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => void;
  createLead: (data: LeadFormValues) => Promise<void>;
  updateLead: (id: string, data: LeadFormValues) => Promise<void>;
  updateStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

export function useLeads(filters?: LeadFilters): UseLeadsReturn {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { closeLeadForm, closeLeadDrawer } = useUIStore();

  // Trae en paralelo el listado completo (para stats) y el filtrado (para el kanban)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [all, filtered] = await Promise.all([
        leadsService.getAll(),
        leadsService.getAll(filters),
      ]);
      setAllLeads(all.data);
      setLeads(filtered.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar los leads"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.propertyId, filters?.vendedorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Crea un lead y lo agrega optimísticamente a las listas
  const createLead = async (data: LeadFormValues) => {
    setIsMutating(true);
    try {
      const newLead = await leadsService.create(formToLead(data));
      setLeads((prev) => [newLead, ...prev]);
      setAllLeads((prev) => [newLead, ...prev]);
      closeLeadForm();
    } finally {
      setIsMutating(false);
    }
  };

  // Actualiza un lead existente y refleja el cambio en ambas listas
  const updateLead = async (id: string, data: LeadFormValues) => {
    setIsMutating(true);
    try {
      const updated = await leadsService.update(id, formToLead(data));
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setAllLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      closeLeadForm();
    } finally {
      setIsMutating(false);
    }
  };

  // Cambia el estado del lead con actualización optimista (drag & drop del kanban)
  const updateStatus = async (id: string, status: LeadStatus) => {
    const prev = leads.find((l) => l.id === id) ?? allLeads.find((l) => l.id === id);
    if (!prev) return;
    const optimistic = { ...prev, status, updatedAt: new Date().toISOString() };
    setLeads((ls) => ls.map((l) => (l.id === id ? optimistic : l)));
    setAllLeads((ls) => ls.map((l) => (l.id === id ? optimistic : l)));
    try {
      const updated = await leadsService.updateStatus(id, status);
      setLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
      setAllLeads((ls) => ls.map((l) => (l.id === id ? updated : l)));
    } catch {
      setLeads((ls) => ls.map((l) => (l.id === id ? prev : l)));
      setAllLeads((ls) => ls.map((l) => (l.id === id ? prev : l)));
    }
  };

  // Elimina un lead (soft delete) con actualización optimista
  const deleteLead = async (id: string) => {
    setIsMutating(true);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setAllLeads((prev) => prev.filter((l) => l.id !== id));
    closeLeadDrawer();
    try {
      await leadsService.delete(id);
    } catch {
      await fetchData();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    leads,
    allLeads,
    stats: computeStats(allLeads),
    isLoading,
    isMutating,
    error,
    refetch: fetchData,
    createLead,
    updateLead,
    updateStatus,
    deleteLead,
  };
}
