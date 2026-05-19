"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth.store";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/schemas/auth.schema";

/* ─── Success state ─────────────────────────────────────────────── */
function SuccessView({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-sm text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring", bounce: 0.4 }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
      >
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-2 mb-6"
      >
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          ¡Revisá tu email!
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enviamos un enlace de recuperación a
        </p>
        <p className="text-sm font-semibold text-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border">
          {email}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Si existe una cuenta con ese email, vas a recibir las instrucciones
          en los próximos minutos.
        </p>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mb-7 rounded-xl border border-border bg-muted/20 px-4 py-3 text-left space-y-1.5"
      >
        <p className="text-xs font-semibold text-foreground">¿No lo encontrás?</p>
        {[
          "Revisá la carpeta de spam o correo no deseado",
          "Asegurate de haber ingresado el email correcto",
          "El enlace expira en 30 minutos",
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-2">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">{tip}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <Link href="/login">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ─── Forgot password form ──────────────────────────────────────── */
function ForgotPasswordForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const { sendPasswordReset, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setAuthError(null);
    try {
      await sendPasswordReset(data.email);
      onSuccess(data.email);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error al enviar el email");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-sm"
    >
      {/* Logo mobile */}
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">RentFlow</span>
      </div>

      {/* Icon + Heading */}
      <div className="mb-7 space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="alex@empresa.com"
            autoComplete="email"
            autoFocus
            {...register("email")}
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Auth error */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-2.5"
          >
            <p className="text-xs font-medium text-destructive">{authError}</p>
          </motion.div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Enviar enlace de recuperación
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Back to login */}
      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-64 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -right-64 bottom-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo desktop */}
      <div className="absolute left-8 top-6 hidden lg:flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-bold">RentFlow</span>
      </div>

      <AnimatePresence mode="wait">
        {sentTo ? (
          <SuccessView key="success" email={sentTo} />
        ) : (
          <ForgotPasswordForm key="form" onSuccess={setSentTo} />
        )}
      </AnimatePresence>
    </div>
  );
}
