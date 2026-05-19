"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Building2, ArrowRight, Loader2,
  TrendingUp, Shield, Zap, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/auth.store";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas/auth.schema";
import { PasswordStrength } from "@/features/auth/components/password-strength";

/* ─── Left branding panel ───────────────────────────────────────── */

const BENEFITS = [
  { icon: TrendingUp, text: "Dashboard con análisis en tiempo real" },
  { icon: Shield, text: "Datos protegidos con cifrado de extremo a extremo" },
  { icon: Zap, text: "Configuración lista en menos de 5 minutos" },
];

const TESTIMONIAL = {
  text: "RentFlow transformó completamente cómo administro mis propiedades. Ahorro horas cada semana.",
  author: "María García",
  role: "Administradora — 40+ propiedades",
};

function BrandingPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[58%] xl:w-[60%] flex-col overflow-hidden bg-zinc-950">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-zinc-950 to-zinc-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      {/* Grid dots */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Glow */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">RentFlow</span>
        </motion.div>

        {/* Hero text */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-4"
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white">
              Empezá gratis.{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-primary bg-clip-text text-transparent">
                Escalá sin límites.
              </span>
            </h1>
            <p className="text-base text-white/50 leading-relaxed max-w-sm">
              Creá tu cuenta en segundos y comenzá a gestionar propiedades,
              inquilinos y pagos desde un solo lugar.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
                  <b.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-white/60">{b.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="rounded-xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm"
        >
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-white/70 italic leading-relaxed">&ldquo;{TESTIMONIAL.text}&rdquo;</p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/30 text-xs font-semibold text-indigo-300">
              MG
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{TESTIMONIAL.author}</p>
              <p className="text-[11px] text-white/40">{TESTIMONIAL.role}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Register form ─────────────────────────────────────────────── */
function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const passwordValue = watch("password", "");
  const acceptTerms = watch("acceptTerms", false);

  const onSubmit = async (data: RegisterFormValues) => {
    setAuthError(null);
    try {
      await registerUser(data);
      router.replace("/dashboard");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error al crear la cuenta");
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

      {/* Heading */}
      <div className="mb-7 space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Creá tu cuenta
        </h2>
        <p className="text-sm text-muted-foreground">
          Gratis para siempre en el plan básico
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre + Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              placeholder="Alex"
              autoComplete="given-name"
              {...register("firstName")}
              className={cn(errors.firstName && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              placeholder="García"
              autoComplete="family-name"
              {...register("lastName")}
              className={cn(errors.lastName && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="alex@empresa.com"
            autoComplete="email"
            {...register("email")}
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Empresa (opcional) */}
        <div className="space-y-1.5">
          <Label htmlFor="company">
            Empresa{" "}
            <span className="text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Input
            id="company"
            placeholder="Inmobiliaria XYZ"
            autoComplete="organization"
            {...register("company")}
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={cn(
                "pr-10",
                errors.password && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
          <PasswordStrength password={passwordValue} />
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
              className={cn(
                "pr-10",
                errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Términos */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setValue("acceptTerms", e.target.checked, { shouldValidate: true })}
              className="mt-0.5"
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-normal text-muted-foreground cursor-pointer leading-relaxed"
            >
              Acepto los{" "}
              <Link href="#" className="text-foreground underline-offset-4 hover:underline">
                Términos de servicio
              </Link>{" "}
              y la{" "}
              <Link href="#" className="text-foreground underline-offset-4 hover:underline">
                Política de privacidad
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
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
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Free plan note */}
      <div className="mt-4 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
        <p className="text-[11px] text-muted-foreground">
          Sin tarjeta de crédito · Sin compromiso · Cancelá cuando quieras
        </p>
      </div>

      {/* Login link */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function RegisterPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandingPanel />
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6 lg:p-12">
        <RegisterForm />
      </div>
    </div>
  );
}
