"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publicLeadsService } from "@/services/public-leads.service";
import {
  contactLeadSchema,
  DEFAULT_CONTACT_LEAD_VALUES,
  type ContactLeadFormValues,
} from "../schemas/contact-lead.schema";

// Muestra el mensaje de error de un campo del formulario
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

interface ContactFormProps {
  propertyId?: string;
  propertyName?: string;
  title?: string;
  description?: string;
}

// Formulario público de contacto que genera un lead (con o sin propiedad asociada)
export function ContactForm({ propertyId, propertyName, title, description }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactLeadFormValues>({
    resolver: zodResolver(contactLeadSchema),
    defaultValues: {
      ...DEFAULT_CONTACT_LEAD_VALUES,
      propertyId: propertyId ?? "",
      mensaje: propertyName ? `Hola, me interesa la propiedad "${propertyName}".` : "",
    },
  });

  // Envía el lead al backend público y muestra el estado de éxito o error
  const onSubmit = async (data: ContactLeadFormValues) => {
    setServerError(null);
    try {
      await publicLeadsService.create({ ...data, propertyId: propertyId ?? data.propertyId });
      setSubmitted(true);
    } catch {
      setServerError("No pudimos enviar tu consulta. Intentá nuevamente en unos minutos.");
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">¡Consulta enviada!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Un asesor se pondrá en contacto con vos a la brevedad.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? "Contactanos"}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" placeholder="Tu nombre" className="mt-1.5" {...register("nombre")} />
            <FieldError message={errors.nombre?.message} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" className="mt-1.5" {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" placeholder="Tu teléfono" className="mt-1.5" {...register("telefono")} />
              <FieldError message={errors.telefono?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="mensaje">Mensaje</Label>
            <Textarea id="mensaje" rows={4} placeholder="Contanos qué estás buscando..." className="mt-1.5" {...register("mensaje")} />
            <FieldError message={errors.mensaje?.message} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar consulta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
