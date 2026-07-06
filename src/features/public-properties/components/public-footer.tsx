import Link from "next/link";

// Pie de página del sitio público con enlaces básicos
export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row md:px-6">
        <p>© {new Date().getFullYear()} RentFlow. Todos los derechos reservados.</p>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">Propiedades</Link>
          <Link href="/contacto" className="hover:text-foreground transition-colors">Contacto</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
        </nav>
      </div>
    </footer>
  );
}
