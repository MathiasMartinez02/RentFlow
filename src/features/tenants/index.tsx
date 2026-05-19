"use client";

import { Plus, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/store";
import { useTenants } from "./hooks/use-tenants";
import { useTenantFilters } from "./hooks/use-tenant-filters";
import { TenantStatsBar } from "./components/tenant-stats";
import { TenantFiltersBar } from "./components/tenant-filters";
import { TenantTable } from "./components/tenant-table";
import { TenantDrawer } from "./components/tenant-drawer";
import { TenantForm } from "./components/tenant-form";

export function TenantsView() {
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
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
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
              <Button size="sm" className="gap-1.5" onClick={() => openTenantForm()}>
                <Plus className="h-3.5 w-3.5" />
                Agregar Inquilino
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <TenantStatsBar stats={stats} isLoading={isLoading} />

        {/* Filters */}
        <TenantFiltersBar
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPaymentStatusChange={setPaymentStatus}
          onClear={clearFilters}
        />

        {/* Table */}
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
              ) : (
                <Button size="sm" onClick={() => openTenantForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Inquilino
                </Button>
              )
            }
            className="mt-4"
          />
        ) : (
          <TenantTable
            tenants={tenants}
            isLoading={isLoading}
            onView={openTenantDrawer}
            onEdit={openTenantForm}
            onDelete={deleteTenant}
          />
        )}
      </div>

      {/* Drawer */}
      <TenantDrawer
        tenantId={selectedTenantId}
        isOpen={tenantDrawerOpen}
        onClose={closeTenantDrawer}
        onEdit={(id) => {
          closeTenantDrawer();
          openTenantForm(id);
        }}
        onDelete={deleteTenant}
      />

      {/* Form Modal */}
      <TenantForm
        isOpen={tenantFormOpen}
        editingId={editingTenantId}
        isMutating={isMutating}
        onSubmit={handleSubmit}
        onClose={closeTenantForm}
      />
    </>
  );
}
