"use client";

import { Plus, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/rbac/can";
import { RoleGuard } from "@/components/rbac/role-guard";
import { usePermissions } from "@/hooks/use-permissions";
import { useUIStore } from "@/store";
import { useTenants } from "./hooks/use-tenants";
import { useTenantFilters } from "./hooks/use-tenant-filters";
import { TenantStatsBar } from "./components/tenant-stats";
import { TenantFiltersBar } from "./components/tenant-filters";
import { TenantTable } from "./components/tenant-table";
import { TenantDrawer } from "./components/tenant-drawer";
import { TenantForm } from "./components/tenant-form";

export function TenantsView() {
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    selectedTenantId,
    tenantDrawerOpen,
    tenantFormOpen,
    editingTenantId,
    openTenantDrawer,
    closeTenantDrawer,
    openTenantForm,
    closeTenantForm,
  } = useUIStore();

  const { filters, hasActiveFilters, setSearch, setStatus, setPaymentStatus, clearFilters } =
    useTenantFilters();

  const { tenants, stats, isLoading, isMutating, refetch, createTenant, updateTenant, deleteTenant } =
    useTenants(filters);

  const handleSubmit = async (data: Parameters<typeof createTenant>[0]) => {
    if (editingTenantId) {
      await updateTenant(editingTenantId, data);
    } else {
      await createTenant(data);
    }
  };

  return (
    <RoleGuard resource="tenants" showFallback>
      <>
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Inquilinos"
            description={
              isLoading
                ? "Cargando inquilinos..."
                : `${stats.total} inquilinos · ${stats.active} activos · ${stats.atrasados} con atrasos`
            }
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
                <Can resource="tenants" action="create">
                  <Button size="sm" className="gap-1.5" onClick={() => openTenantForm()}>
                    <Plus className="h-3.5 w-3.5" />
                    Agregar Inquilino
                  </Button>
                </Can>
              </div>
            }
          />

          <TenantStatsBar stats={stats} isLoading={isLoading} />

          <TenantFiltersBar
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onPaymentStatusChange={setPaymentStatus}
            onClear={clearFilters}
          />

          {!isLoading && tenants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No se encontraron inquilinos"
              description={
                hasActiveFilters
                  ? "Ningún inquilino coincide con los filtros. Intentá ajustar tu búsqueda."
                  : "Todavía no registraste inquilinos. ¡Agregá el primero!"
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : canCreate("tenants") ? (
                  <Button size="sm" onClick={() => openTenantForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Inquilino
                  </Button>
                ) : undefined
              }
              className="mt-4"
            />
          ) : (
            <TenantTable
              tenants={tenants}
              isLoading={isLoading}
              onView={openTenantDrawer}
              onEdit={canEdit("tenants") ? openTenantForm : undefined}
              onDelete={canDelete("tenants") ? deleteTenant : undefined}
            />
          )}
        </div>

        <TenantDrawer
          tenantId={selectedTenantId}
          isOpen={tenantDrawerOpen}
          onClose={closeTenantDrawer}
          onEdit={canEdit("tenants") ? (id) => { closeTenantDrawer(); openTenantForm(id); } : undefined}
          onDelete={canDelete("tenants") ? deleteTenant : undefined}
        />

        <Can resource="tenants" action="create">
          <TenantForm
            isOpen={tenantFormOpen}
            editingId={editingTenantId}
            isMutating={isMutating}
            onSubmit={handleSubmit}
            onClose={closeTenantForm}
          />
        </Can>
      </>
    </RoleGuard>
  );
}
