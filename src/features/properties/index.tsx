"use client";

import { useMemo } from "react";
import { Plus, RefreshCw, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/rbac/can";
import { RoleGuard } from "@/components/rbac/role-guard";
import { usePermissions } from "@/hooks/use-permissions";
import { useUIStore } from "@/store";
import { useCatalogStore } from "@/store/catalog.store";
import { useProperties } from "./hooks/use-properties";
import { usePropertyFilters } from "./hooks/use-property-filters";
import { PropertyStatsBar } from "./components/property-stats";
import { PropertyFiltersBar } from "./components/property-filters";
import { ViewToggle } from "./components/view-toggle";
import { PropertyCard, PropertyCardSkeleton } from "./components/property-card";
import { PropertyTable } from "./components/property-table";
import { PropertyDrawer } from "./components/property-drawer";
import { PropertyForm } from "./components/property-form";

export function PropertiesView() {
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    propertiesView,
    selectedPropertyId,
    propertyDrawerOpen,
    propertyFormOpen,
    editingPropertyId,
    setPropertiesView,
    openPropertyDrawer,
    closePropertyDrawer,
    openPropertyForm,
    closePropertyForm,
  } = useUIStore();

  const { filters, hasActiveFilters, setSearch, setStatus, setType, clearFilters } =
    usePropertyFilters();

  const { properties, stats, isLoading, isMutating, refetch, createProperty, updateProperty, deleteProperty } =
    useProperties(filters);

  const allTenants = useCatalogStore((s) => s.tenants);
  const allContracts = useCatalogStore((s) => s.contracts);

  const tenantMap = useMemo(
    () => new Map(allTenants.map((t) => [t.id, t])),
    [allTenants]
  );

  const handleSubmit = async (data: Parameters<typeof createProperty>[0]) => {
    if (editingPropertyId) {
      await updateProperty(editingPropertyId, data);
    } else {
      await createProperty(data);
    }
  };

  return (
    <RoleGuard resource="properties" showFallback>
      <>
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Propiedades"
            description={
              isLoading
                ? "Cargando tu cartera..."
                : `${stats.total} propiedades · ${stats.occupied} ocupadas · ${stats.available} disponibles`
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
                <Can resource="properties" action="create">
                  <Button size="sm" className="gap-1.5" onClick={() => openPropertyForm()}>
                    <Plus className="h-3.5 w-3.5" />
                    Agregar Propiedad
                  </Button>
                </Can>
              </div>
            }
          />

          <PropertyStatsBar stats={stats} isLoading={isLoading} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <PropertyFiltersBar
              filters={filters}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onTypeChange={setType}
              onClear={clearFilters}
            />
            <ViewToggle view={propertiesView} onChange={setPropertiesView} />
          </div>

          <AnimatePresence mode="wait">
            {propertiesView === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="No se encontraron propiedades"
                    description={
                      hasActiveFilters
                        ? "Ninguna propiedad coincide con los filtros. Intentá ajustar tu búsqueda."
                        : "Todavía no agregaste propiedades. ¡Agregá la primera!"
                    }
                    action={
                      hasActiveFilters ? (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Limpiar filtros
                        </Button>
                      ) : canCreate("properties") ? (
                        <Button size="sm" onClick={() => openPropertyForm()}>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Propiedad
                        </Button>
                      ) : undefined
                    }
                    className="mt-4"
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {properties.map((property, index) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        tenant={property.tenantId ? tenantMap.get(property.tenantId) ?? null : null}
                        index={index}
                        onView={openPropertyDrawer}
                        onEdit={canEdit("properties") ? openPropertyForm : undefined}
                        onDelete={canDelete("properties") ? deleteProperty : undefined}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <PropertyTable
                  properties={properties}
                  tenants={allTenants}
                  contracts={allContracts}
                  isLoading={isLoading}
                  onView={openPropertyDrawer}
                  onEdit={canEdit("properties") ? openPropertyForm : undefined}
                  onDelete={canDelete("properties") ? deleteProperty : undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PropertyDrawer
          propertyId={selectedPropertyId}
          isOpen={propertyDrawerOpen}
          onClose={closePropertyDrawer}
          onEdit={canEdit("properties") ? (id) => { closePropertyDrawer(); openPropertyForm(id); } : undefined}
          onDelete={canDelete("properties") ? deleteProperty : undefined}
        />

        <Can resource="properties" action="create">
          <PropertyForm
            isOpen={propertyFormOpen}
            editingId={editingPropertyId}
            isMutating={isMutating}
            onSubmit={handleSubmit}
            onClose={closePropertyForm}
          />
        </Can>
      </>
    </RoleGuard>
  );
}
