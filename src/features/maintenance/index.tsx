"use client";

import { Plus, RefreshCw, Wrench, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/rbac/can";
import { RoleGuard } from "@/components/rbac/role-guard";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/store/auth.store";
import { useCatalogStore } from "@/store/catalog.store";
import { useUIStore } from "@/store";
import { useMaintenances } from "./hooks/use-maintenances";
import { useMaintenanceFilters } from "./hooks/use-maintenance-filters";
import { MaintenanceStatsBar } from "./components/maintenance-stats";
import { MaintenanceFiltersBar } from "./components/maintenance-filters";
import { MaintenanceKanban } from "./components/maintenance-kanban";
import { MaintenanceTable } from "./components/maintenance-table";
import { MaintenanceDrawer } from "./components/maintenance-drawer";
import { MaintenanceForm } from "./components/maintenance-form";
import { MaintenanceFormInquilino } from "./components/maintenance-form-inquilino";

export function MaintenanceView() {
  const { canCreate, canEdit, canDelete, is } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const allTenants = useCatalogStore((s) => s.tenants);
  const isInquilino = is("INQUILINO");

  const {
    maintenanceView,
    setMaintenanceView,
    selectedMaintenanceId,
    maintenanceDrawerOpen,
    maintenanceFormOpen,
    editingMaintenanceId,
    openMaintenanceDrawer,
    closeMaintenanceDrawer,
    openMaintenanceForm,
    closeMaintenanceForm,
  } = useUIStore();

  const {
    filters,
    hasActiveFilters,
    setSearch,
    setStatus,
    setPriority,
    setCategory,
    clearFilters,
  } = useMaintenanceFilters();

  const {
    tickets,
    stats,
    isLoading,
    isMutating,
    refetch,
    createTicket,
    updateTicket,
    updateStatus,
    deleteTicket,
  } = useMaintenances(filters);

  const handleSubmit = async (data: Parameters<typeof createTicket>[0]) => {
    if (editingMaintenanceId) {
      await updateTicket(editingMaintenanceId, data);
    } else {
      await createTicket(data);
    }
  };

  // Auto-fill propertyId for INQUILINO from their linked tenant
  const inquilinoTenant = isInquilino
    ? allTenants.find((t) => t.id === user?.linkedTenantId)
    : null;
  const inquilinoPropertyId = inquilinoTenant?.propertyId ?? "";

  const urgentCount = stats.urgent;
  const descriptionText = isLoading
    ? "Cargando tickets..."
    : [
        `${stats.open + stats.inProgress + stats.waitingParts} activos`,
        urgentCount > 0 && `${urgentCount} urgente${urgentCount !== 1 ? "s" : ""}`,
        `${stats.resolved} resueltos`,
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <RoleGuard resource="maintenance" showFallback>
      <>
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Mantenimiento"
            description={descriptionText}
            action={
              <div className="flex items-center gap-2">
                {!isInquilino && (
                  <div className="flex items-center rounded-md border border-border bg-muted/30 p-0.5">
                    <Button
                      variant={maintenanceView === "kanban" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setMaintenanceView("kanban")}
                      title="Vista Kanban"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={maintenanceView === "table" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setMaintenanceView("table")}
                      title="Vista Tabla"
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

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

                <Can resource="maintenance" action="create">
                  <Button size="sm" className="gap-1.5" onClick={() => openMaintenanceForm()}>
                    <Plus className="h-3.5 w-3.5" />
                    {isInquilino ? "Reportar Problema" : "Nuevo Ticket"}
                  </Button>
                </Can>
              </div>
            }
          />

          {!isInquilino && <MaintenanceStatsBar stats={stats} isLoading={isLoading} />}

          {!isInquilino && (
            <MaintenanceFiltersBar
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
              onCategoryChange={setCategory}
              onClear={clearFilters}
            />
          )}

          {!isLoading && tickets.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No se encontraron tickets"
              description={
                hasActiveFilters
                  ? "Ningún ticket coincide con los filtros aplicados."
                  : isInquilino
                  ? "No reportaste ningún problema todavía."
                  : "No hay tickets de mantenimiento. ¡Creá el primero!"
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : canCreate("maintenance") ? (
                  <Button size="sm" onClick={() => openMaintenanceForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isInquilino ? "Reportar Problema" : "Nuevo Ticket"}
                  </Button>
                ) : undefined
              }
              className="mt-4"
            />
          ) : maintenanceView === "kanban" && !isInquilino ? (
            <MaintenanceKanban
              tickets={tickets}
              isLoading={isLoading}
              onView={openMaintenanceDrawer}
              onEdit={canEdit("maintenance") ? openMaintenanceForm : undefined}
              onDelete={canDelete("maintenance") ? deleteTicket : undefined}
              onStatusChange={updateStatus}
            />
          ) : (
            <MaintenanceTable
              tickets={tickets}
              isLoading={isLoading}
              onView={openMaintenanceDrawer}
              onEdit={canEdit("maintenance") ? openMaintenanceForm : undefined}
              onDelete={canDelete("maintenance") ? deleteTicket : undefined}
            />
          )}
        </div>

        <MaintenanceDrawer
          ticketId={selectedMaintenanceId}
          isOpen={maintenanceDrawerOpen}
          onClose={closeMaintenanceDrawer}
          onEdit={canEdit("maintenance") ? (id) => { closeMaintenanceDrawer(); openMaintenanceForm(id); } : undefined}
          onDelete={canDelete("maintenance") ? deleteTicket : undefined}
        />

        {isInquilino ? (
          <MaintenanceFormInquilino
            isOpen={maintenanceFormOpen}
            isMutating={isMutating}
            propertyId={inquilinoPropertyId}
            tenantId={user?.linkedTenantId ?? ""}
            onSubmit={async (data) => {
              await createTicket(data);
              closeMaintenanceForm();
            }}
            onClose={closeMaintenanceForm}
          />
        ) : (
          <Can resource="maintenance" action="create">
            <MaintenanceForm
              isOpen={maintenanceFormOpen}
              editingId={editingMaintenanceId}
              isMutating={isMutating}
              onSubmit={handleSubmit}
              onClose={closeMaintenanceForm}
            />
          </Can>
        )}
      </>
    </RoleGuard>
  );
}
