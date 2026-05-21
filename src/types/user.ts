import type { UserRole } from "@/types/auth";

export interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  organizationId?: string;
  linkedTenantId?: string;
  createdAt: string;
}
