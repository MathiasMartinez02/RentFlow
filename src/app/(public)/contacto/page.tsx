import type { Metadata } from "next";
import { ContactForm } from "@/features/public-properties/components/contact-form";

export const metadata: Metadata = { title: "Contacto" };

// Página pública de contacto general (genera un lead sin propiedad asociada)
export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Contactanos</h1>
        <p className="text-sm text-muted-foreground">
          ¿Buscás una propiedad o tenés una consulta? Dejanos tus datos y te respondemos.
        </p>
      </div>
      <ContactForm
        title="Escribinos"
        description="Completá el formulario y un asesor se pondrá en contacto."
      />
    </div>
  );
}
