export type TenantStatus = "active" | "inactive" | "pending";
export type TenantPaymentStatus = "al_dia" | "atrasado" | "pendiente";

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: TenantStatus;
  paymentStatus?: TenantPaymentStatus;
  propertyId?: string;
  contractId?: string;
  avatar?: string;
  nationalId: string;
  address?: string;
  moveInDate?: string;
  moveOutDate?: string;
  observations?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type TenantWithProperty = Tenant & {
  property?: {
    name: string;
    address: string;
    rent: number;
  };
};

export interface TenantFilters {
  search?: string;
  status?: TenantStatus | "all";
  paymentStatus?: TenantPaymentStatus | "all";
}

export interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  alDia: number;
  atrasados: number;
}
