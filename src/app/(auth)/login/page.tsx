"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Building2, ArrowRight, Loader2,
  TrendingUp, Shield, Zap, Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/auth.store";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";

/* ─── Left branding panel ───────────────────────────────────────── */

const STATS = [
  { value: "150+", label: "Propiedades" },
  { value: "2.5K", label: "Inquilinos" },
  { value: "98%", label: "Tasa de cobro" },
];

const FEATURES = [
  { icon: TrendingUp, text: "Dashboard con análisis en tiempo real" },
  { icon: Shield, text: "Contratos y documentación segura" },
  { icon: Zap, text: "Gestión de pagos y mantenimiento" },
];

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
              Gestión inmobiliaria{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-primary bg-clip-text text-transparent">
                del futuro, hoy.
              </span>
            </h1>
            <p className="text-base text-white/50 leading-relaxed max-w-sm">
              La plataforma premium para administrar propiedades, contratos,
              inquilinos y pagos en un solo lugar.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
                  <f.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-white/60">{f.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="grid grid-cols-3 gap-3"
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Google icon ───────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ─── Login form ─────────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const { login, loginWithProvider, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      await login(data);
      router.replace("/dashboard");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleSocial = async (provider: "google" | "github") => {
    setAuthError(null);
    setSocialLoading(provider);
    try {
      await loginWithProvider(provider);
      router.replace("/dashboard");
    } catch {
      setAuthError("Error al conectar con el proveedor");
    } finally {
      setSocialLoading(null);
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
          Bienvenido de vuelta
        </h2>
        <p className="text-sm text-muted-foreground">
          Ingresá a tu cuenta para continuar
        </p>
      </div>

      {/* Social buttons */}
      <div className="mb-5 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="gap-2 text-sm font-normal"
          disabled={isLoading || !!socialLoading}
          onClick={() => handleSocial("google")}
        >
          {socialLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2 text-sm font-normal"
          disabled={isLoading || !!socialLoading}
          onClick={() => handleSocial("github")}
        >
          {socialLoading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[11px] text-muted-foreground">
            o continuá con email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <Checkbox id="rememberMe" {...register("rememberMe")} />
          <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
            Recordarme en este dispositivo
          </Label>
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
          disabled={isLoading || !!socialLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Registrate gratis
        </Link>
      </p>

      {/* Demo hint */}
      <div className="mt-5 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Modo demo:</span>{" "}
          admin@rentflow.com · Admin123*
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandingPanel />
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
