"use client";

import { Plus, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/rbac/can";
import { RoleGuard } from "@/components/rbac/role-guard";
import { usePermissions } from "@/hooks/use-permissions";
import { useUIStore } from "@/store";
import { useContracts } from "./hooks/use-contracts";
import { useContractFilters } from "./hooks/use-contract-filters";
import { ContractStatsBar } from "./components/contract-stats";
import { ContractFiltersBar } from "./components/contract-filters";
import { ContractAlerts } from "./components/contract-alerts";
import { ContractTable } from "./components/contract-table";
import { ContractDrawer } from "./components/contract-drawer";
import { ContractForm } from "./components/contract-form";

export function ContractsView() {
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    selectedContractId,
    contractDrawerOpen,
    contractFormOpen,
    editingContractId,
    openContractDrawer,
    closeContractDrawer,
    openContractForm,
    closeContractForm,
  } = useUIStore();

  const { filters, hasActiveFilters, setSearch, setStatus, clearFilters } =
    useContractFilters();

  const {
    contracts,
    stats,
    isLoading,
    isMutating,
    refetch,
    createContract,
    updateContract,
    deleteContract,
  } = useContracts(filters);

  const handleSubmit = async (data: Parameters<typeof createContract>[0]) => {
    if (editingContractId) {
      await updateContract(editingContractId, data);
    } else {
      await createContract(data);
    }
  };

  return (
    <RoleGuard resource="contracts" showFallback>
      <>
        <div className="flex flex-col gap-6">
          <PageHeader
            title="Contratos"
            description={
              isLoading
                ? "Cargando contratos..."
                : `${stats.total} contratos · ${stats.active} activos · ${stats.expiringSoon} por vencer`
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
                <Can resource="contracts" action="create">
                  <Button size="sm" className="gap-1.5" onClick={() => openContractForm()}>
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo Contrato
                  </Button>
                </Can>
              </div>
            }
          />

          <ContractStatsBar stats={stats} isLoading={isLoading} />

          {!isLoading && <ContractAlerts contracts={contracts} onView={openContractDrawer} />}

          <ContractFiltersBar
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onClear={clearFilters}
          />

          {!isLoading && contracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No se encontraron contratos"
              description={
                hasActiveFilters
                  ? "Ningún contrato coincide con los filtros. Intentá ajustar tu búsqueda."
                  : "Todavía no registraste contratos. ¡Creá el primero!"
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : canCreate("contracts") ? (
                  <Button size="sm" onClick={() => openContractForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Contrato
                  </Button>
                ) : undefined
              }
              className="mt-4"
            />
          ) : (
            <ContractTable
              contracts={contracts}
              isLoading={isLoading}
              onView={openContractDrawer}
              onEdit={canEdit("contracts") ? openContractForm : undefined}
              onDelete={canDelete("contracts") ? deleteContract : undefined}
            />
          )}
        </div>

        <ContractDrawer
          contractId={selectedContractId}
          isOpen={contractDrawerOpen}
          onClose={closeContractDrawer}
          onEdit={canEdit("contracts") ? (id) => { closeContractDrawer(); openContractForm(id); } : undefined}
          onDelete={canDelete("contracts") ? deleteContract : undefined}
        />

        <Can resource="contracts" action="create">
          <ContractForm
            isOpen={contractFormOpen}
            editingId={editingContractId}
            isMutating={isMutating}
            onSubmit={handleSubmit}
            onClose={closeContractForm}
          />
        </Can>
      </>
    </RoleGuard>
  );
}
