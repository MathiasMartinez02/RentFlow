import { PublicHeader } from "@/features/public-properties/components/public-header";
import { PublicFooter } from "@/features/public-properties/components/public-footer";

// Layout del sitio público (sin AuthGuard): header + contenido + footer
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}
