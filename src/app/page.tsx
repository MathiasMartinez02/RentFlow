"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { PublicHeader } from "@/features/public-properties/components/public-header";
import { PublicFooter } from "@/features/public-properties/components/public-footer";
import { PublicPropertiesView } from "@/features/public-properties";

// MODIFICADO: antes redirigía siempre a /dashboard o /login. Ahora, si el usuario
// no está autenticado, renderiza el sitio público de propiedades en vez de ir a /login.
export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Redirige al dashboard solo cuando ya hidrató y el usuario está autenticado
  useEffect(() => {
    if (!_hasHydrated) return;
    if (isAuthenticated) router.replace("/dashboard");
  }, [_hasHydrated, isAuthenticated, router]);

  // Mientras hidrata o si está autenticado (a punto de redirigir), no mostramos el sitio público
  if (!_hasHydrated || isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
          <PublicPropertiesView />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
