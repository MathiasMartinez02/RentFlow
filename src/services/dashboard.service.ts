import { mockFetch } from "./base.service";
import { MOCK_DASHBOARD_DATA } from "@/mock/dashboard";
import type { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    return mockFetch(MOCK_DASHBOARD_DATA, 800);
  },
};
