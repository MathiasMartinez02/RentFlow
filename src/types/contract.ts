export type ContractStatus = "active" | "expired" | "pending" | "terminated";

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  monthlyRent: number;
  deposit: number;
  expenses?: number;
  annualIncreasePercent?: number;
  terms?: string;
  renewalOption: boolean;
  noticePeriodDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWithDetails extends Contract {
  tenant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    name: string;
    address: string;
  };
}

export interface ContractFilters {
  search?: string;
  status?: ContractStatus | "expiring_soon" | "all";
}

export interface ContractStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
  renewalsThisMonth: number;
}
