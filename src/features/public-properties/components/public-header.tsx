import Link from "next/link";
import { Building2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

// Encabezado del sitio público: logo/nombre, link a propiedades/contacto e inicio de sesión
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </span>
          RentFlow
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Propiedades</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/contacto">Contacto</Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/login">
              <LogIn className="h-3.5 w-3.5" /> Iniciar sesión
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
