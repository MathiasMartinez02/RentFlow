"use client";

import { Plus, RefreshCw, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/store";
import { usePayments } from "./hooks/use-payments";
import { usePaymentFilters } from "./hooks/use-payment-filters";
import { PaymentStatsBar } from "./components/payment-stats";
import { PaymentFiltersBar } from "./components/payment-filters";
import { PaymentTable } from "./components/payment-table";
import { PaymentDrawer } from "./components/payment-drawer";
import { PaymentForm } from "./components/payment-form";
import { PaymentRevenueChart } from "./components/payment-revenue-chart";
import { PaymentUpcoming } from "./components/payment-upcoming";

export function PaymentsView() {
  const {
    selectedPaymentId,
    paymentDrawerOpen,
    paymentFormOpen,
    editingPaymentId,
    openPaymentDrawer,
    closePaymentDrawer,
    openPaymentForm,
    closePaymentForm,
  } = useUIStore();

  const { filters, hasActiveFilters, setSearch, setStatus, setPeriod, clearFilters } =
    usePaymentFilters();

  const {
    payments,
    stats,
    monthlyRevenue,
    isLoading,
    isMutating,
    refetch,
    createPayment,
    updatePayment,
    deletePayment,
  } = usePayments(filters);

  const handleSubmit = async (data: Parameters<typeof createPayment>[0]) => {
    if (editingPaymentId) {
      await updatePayment(editingPaymentId, data);
    } else {
      await createPayment(data);
    }
  };

  const currentMonthPayments = payments.filter((p) => {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return p.period === period;
  });

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <PageHeader
          title="Pagos"
          description={
            isLoading
              ? "Cargando pagos..."
              : `${stats.totalExpected > 0 ? `$${(stats.collectedThisMonth / 1000).toFixed(0)}k cobrado` : "Sin datos"} · Tasa ${stats.collectionRate.toFixed(0)}% · ${stats.overdueCount > 0 ? `${stats.overdueCount} vencido${stats.overdueCount !== 1 ? "s" : ""}` : "Sin vencidos"}`
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
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {}}
              >
                <Download className="h-3.5 w-3.5" />
                Exportar
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => openPaymentForm()}>
                <Plus className="h-3.5 w-3.5" />
                Registrar Pago
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <PaymentStatsBar stats={stats} isLoading={isLoading} />

        {/* Charts + Upcoming */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PaymentRevenueChart data={monthlyRevenue} isLoading={isLoading} />
          </div>
          <div>
            <PaymentUpcoming
              payments={currentMonthPayments}
              isLoading={isLoading}
              onView={openPaymentDrawer}
              onViewAll={clearFilters}
            />
          </div>
        </div>

        {/* Filters */}
        <PaymentFiltersBar
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPeriodChange={setPeriod}
          onClear={clearFilters}
        />

        {/* Table */}
        {!isLoading && payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No se encontraron pagos"
            description={
              hasActiveFilters
                ? "Ningún pago coincide con los filtros aplicados."
                : "Todavía no registraste pagos. ¡Comenzá registrando el primero!"
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={() => openPaymentForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Pago
                </Button>
              )
            }
            className="mt-4"
          />
        ) : (
          <PaymentTable
            payments={payments}
            isLoading={isLoading}
            onView={openPaymentDrawer}
            onEdit={openPaymentForm}
            onDelete={deletePayment}
          />
        )}
      </div>

      {/* Drawer */}
      <PaymentDrawer
        paymentId={selectedPaymentId}
        isOpen={paymentDrawerOpen}
        onClose={closePaymentDrawer}
        onEdit={(id) => {
          closePaymentDrawer();
          openPaymentForm(id);
        }}
        onDelete={deletePayment}
      />

      {/* Form Modal */}
      <PaymentForm
        isOpen={paymentFormOpen}
        editingId={editingPaymentId}
        isMutating={isMutating}
        onSubmit={handleSubmit}
        onClose={closePaymentForm}
      />
    </>
  );
}
