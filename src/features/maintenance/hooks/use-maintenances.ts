"use client";

import { useState, useEffect, useCallback } from "react";
import { maintenanceService } from "@/services/maintenance.service";
import { useUIStore } from "@/store";
import type { MaintenanceTicket, MaintenanceFilters, MaintenanceStats, MaintenanceStatus } from "@/types/maintenance";
import type { MaintenanceFormValues } from "../schemas/maintenance.schema";

function computeStats(tickets: MaintenanceTicket[]): MaintenanceStats {
  const open = tickets.filter((t) => t.status === "pending").length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const waitingParts = tickets.filter((t) => t.status === "waiting_parts").length;
  const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const urgent = tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length;

  const resolvedTickets = tickets.filter((t) => t.resolvedAt && t.reportedAt);
  const avgResolutionDays =
    resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
          const days =
            (new Date(t.resolvedAt!).getTime() - new Date(t.reportedAt).getTime()) / 86400000;
          return sum + days;
        }, 0) / resolvedTickets.length
      : 0;

  const totalEstimatedCost = tickets
    .filter((t) => t.status !== "closed")
    .reduce((sum, t) => sum + (t.estimatedCost ?? 0), 0);

  return { open, inProgress, waitingParts, resolved, urgent, avgResolutionDays, totalEstimatedCost };
}

interface UseMaintenancesReturn {
  tickets: MaintenanceTicket[];
  allTickets: MaintenanceTicket[];
  stats: MaintenanceStats;
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => void;
  createTicket: (data: MaintenanceFormValues) => Promise<void>;
  updateTicket: (id: string, data: MaintenanceFormValues) => Promise<void>;
  updateStatus: (id: string, status: MaintenanceStatus) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
}

export function useMaintenances(filters?: MaintenanceFilters): UseMaintenancesReturn {
  const [allTickets, setAllTickets] = useState<MaintenanceTicket[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { closeMaintenanceForm, closeMaintenanceDrawer } = useUIStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [all, filtered] = await Promise.all([
        maintenanceService.getAll(),
        maintenanceService.getAll(filters),
      ]);
      setAllTickets(all.data);
      setTickets(filtered.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar los tickets"));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.priority, filters?.category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTicket = async (data: MaintenanceFormValues) => {
    setIsMutating(true);
    try {
      const now = new Date().toISOString();
      const newTicket = await maintenanceService.create({
        title: data.title,
        description: data.description,
        propertyId: data.propertyId,
        tenantId: data.tenantId || undefined,
        category: data.category,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assignedTo || undefined,
        estimatedCost: data.estimatedCost != null && data.estimatedCost !== "" ? Number(data.estimatedCost) : undefined,
        finalCost: data.finalCost != null && data.finalCost !== "" ? Number(data.finalCost) : undefined,
        reportedAt: data.reportedAt ? new Date(data.reportedAt).toISOString() : now,
        notes: data.notes || undefined,
      });
      setTickets((prev) => [newTicket, ...prev]);
      setAllTickets((prev) => [newTicket, ...prev]);
      closeMaintenanceForm();
    } finally {
      setIsMutating(false);
    }
  };

  const updateTicket = async (id: string, data: MaintenanceFormValues) => {
    setIsMutating(true);
    try {
      const updated = await maintenanceService.update(id, {
        title: data.title,
        description: data.description,
        propertyId: data.propertyId,
        tenantId: data.tenantId || undefined,
        category: data.category,
        priority: data.priority,
        status: data.status,
        assignedTo: data.assignedTo || undefined,
        estimatedCost: data.estimatedCost != null && data.estimatedCost !== "" ? Number(data.estimatedCost) : undefined,
        finalCost: data.finalCost != null && data.finalCost !== "" ? Number(data.finalCost) : undefined,
        notes: data.notes || undefined,
      });
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setAllTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      closeMaintenanceForm();
    } finally {
      setIsMutating(false);
    }
  };

  const updateStatus = async (id: string, status: MaintenanceStatus) => {
    const prev = tickets.find((t) => t.id === id);
    if (!prev) return;
    const optimistic = { ...prev, status, updatedAt: new Date().toISOString() };
    setTickets((ts) => ts.map((t) => (t.id === id ? optimistic : t)));
    setAllTickets((ts) => ts.map((t) => (t.id === id ? optimistic : t)));
    try {
      const updated = await maintenanceService.updateStatus(id, status);
      setTickets((ts) => ts.map((t) => (t.id === id ? updated : t)));
      setAllTickets((ts) => ts.map((t) => (t.id === id ? updated : t)));
    } catch {
      setTickets((ts) => ts.map((t) => (t.id === id ? prev : t)));
      setAllTickets((ts) => ts.map((t) => (t.id === id ? prev : t)));
    }
  };

  const deleteTicket = async (id: string) => {
    setIsMutating(true);
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setAllTickets((prev) => prev.filter((t) => t.id !== id));
    closeMaintenanceDrawer();
    try {
      await maintenanceService.delete(id);
    } catch {
      await fetchData();
    } finally {
      setIsMutating(false);
    }
  };

  return {
    tickets,
    allTickets,
    stats: computeStats(allTickets),
    isLoading,
    isMutating,
    error,
    refetch: fetchData,
    createTicket,
    updateTicket,
    updateStatus,
    deleteTicket,
  };
}
