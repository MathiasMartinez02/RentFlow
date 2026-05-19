import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { OnboardingModal } from "@/features/auth/components/onboarding-modal";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <MobileSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-7xl px-4 py-6 md:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <OnboardingModal />
    </AuthGuard>
  );
}
