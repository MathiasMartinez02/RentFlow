"use client";

import { Plus, RefreshCw, Target, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Can } from "@/components/rbac/can";
import { RoleGuard } from "@/components/rbac/role-guard";
import { usePermissions } from "@/hooks/use-permissions";
import { useUIStore } from "@/store";
import { useLeads } from "./hooks/use-leads";
import { useLeadFilters } from "./hooks/use-lead-filters";
import { LeadsStatsBar } from "./components/leads-stats";
import { LeadsKanban } from "./components/leads-kanban";
import { LeadsDrawer } from "./components/leads-drawer";
import { LeadForm } from "./components/lead-form";
import { LEAD_STATUS_CONFIG } from "./lib/lead-config";

// Vista principal del CRM de leads: kanban con drag & drop, filtros, drawer y formulario
export function LeadsView() {
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    selectedLeadId,
    leadDrawerOpen,
    leadFormOpen,
    editingLeadId,
    openLeadDrawer,
    closeLeadDrawer,
    openLeadForm,
    closeLeadForm,
  } = useUIStore();

  const {
    filters,
    hasActiveFilters,
    setSearch,
    setStatus,
    clearFilters,
  } = useLeadFilters();

  const {
    leads,
    allLeads,
    stats,
    isLoading,
    isMutating,
    refetch,
    createLead,
    updateLead,
    updateStatus,
    deleteLead,
  } = useLeads(filters);

  // Resuelve el lead seleccionado/editado a partir de su id (los leads no viven en el catalog store)
  const selectedLead = selectedLeadId ? allLeads.find((l) => l.id === selectedLeadId) ?? null : null;
  const editingLead = editingLeadId ? allLeads.find((l) => l.id === editingLeadId) ?? null : null;

  // Crea o actualiza según haya un lead en edición
  const handleSubmit = async (data: Parameters<typeof createLead>[0]) => {
    if (editingLeadId) {
      await updateLead(editingLeadId, data);
    } else {
      await createLead(data);
    }
  };

  const descriptionText = isLoading
    ? "Cargando leads..."
    : `${stats.total} leads · ${stats.won} ganados · ${stats.conversionRate.toFixed(0)}% conversión`;

  return (
    <RoleGuard resource="leads" showFallback>
      <>
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Leads"
            description={descriptionText}
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>

                <Can resource="leads" action="create">
                  <Button size="sm" className="gap-1.5" onClick={() => openLeadForm()}>
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo Lead
                  </Button>
                </Can>
              </div>
            }
          />

          <LeadsStatsBar stats={stats} isLoading={isLoading} />

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={filters.search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="h-4 w-4" />}
              className="max-w-xs"
            />
            <Select
              value={filters.status ?? "all"}
              onValueChange={(v) => setStatus(v as Parameters<typeof setStatus>[0])}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {LEAD_STATUS_CONFIG.map((cfg) => (
                  <SelectItem key={cfg.status} value={cfg.status}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {!isLoading && leads.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No se encontraron leads"
              description={
                hasActiveFilters
                  ? "Ningún lead coincide con los filtros aplicados."
                  : "Todavía no hay leads en el pipeline. Los formularios del sitio público generan leads automáticamente."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : canCreate("leads") ? (
                  <Button size="sm" onClick={() => openLeadForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Lead
                  </Button>
                ) : undefined
              }
              className="mt-4"
            />
          ) : (
            <LeadsKanban
              leads={leads}
              isLoading={isLoading}
              onView={openLeadDrawer}
              onEdit={canEdit("leads") ? openLeadForm : undefined}
              onDelete={canDelete("leads") ? deleteLead : undefined}
              onStatusChange={updateStatus}
            />
          )}
        </div>

        <LeadsDrawer
          lead={selectedLead}
          isOpen={leadDrawerOpen}
          onClose={closeLeadDrawer}
          onEdit={canEdit("leads") ? (id) => { closeLeadDrawer(); openLeadForm(id); } : undefined}
          onDelete={canDelete("leads") ? deleteLead : undefined}
        />

        <Can resource="leads" action="create">
          <LeadForm
            isOpen={leadFormOpen}
            editingLead={editingLead}
            isMutating={isMutating}
            onSubmit={handleSubmit}
            onClose={closeLeadForm}
          />
        </Can>
      </>
    </RoleGuard>
  );
}
