"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, CreditCard, Wrench,
  ArrowRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

const FEATURES = [
  {
    icon: Building2,
    title: "Propiedades",
    description: "Administrá toda tu cartera en un solo lugar",
    color: "bg-indigo-500/10 text-indigo-400",
  },
  {
    icon: Users,
    title: "Inquilinos",
    description: "Gestioná relaciones y contratos fácilmente",
    color: "bg-violet-500/10 text-violet-400",
  },
  {
    icon: CreditCard,
    title: "Pagos",
    description: "Control financiero y cobranzas automatizadas",
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: Wrench,
    title: "Mantenimiento",
    description: "Tickets y técnicos centralizados",
    color: "bg-amber-500/10 text-amber-400",
  },
];

export function OnboardingModal() {
  const user = useAuthStore((s) => s.user);
  const isNewUser = useAuthStore((s) => s.isNewUser);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const show = isNewUser && !onboardingCompleted;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
              {/* Header gradient */}
              <div className="relative bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 px-6 pb-8 pt-6">
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="relative">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    ¡Bienvenido a RentFlow{user ? `, ${user.firstName}` : ""}! 🎉
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    Tu plataforma de gestión inmobiliaria está lista. Explorá todo lo que podés hacer.
                  </p>
                </div>
              </div>

              {/* Features grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${f.color}`}>
                        <f.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{f.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                          {f.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Button className="flex-1 gap-2" onClick={completeOnboarding}>
                    Explorar RentFlow
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={completeOnboarding}>
                    Más tarde
                  </Button>
                </div>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Podés volver a este tour desde Configuración → Ayuda
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
