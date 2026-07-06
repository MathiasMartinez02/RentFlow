import {
  Sparkles,
  PhoneCall,
  CalendarClock,
  MapPinCheck,
  Handshake,
  Trophy,
  XCircle,
  Globe,
  MessageCircle,
  Building,
  UserRoundPlus,
  CircleHelp,
} from "lucide-react";
import type { LeadStatus, LeadOrigin } from "@/types/lead";

export interface LeadStatusConfig {
  status: LeadStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  badgeClass: string;
}

// Configuración visual de cada columna/estado del pipeline de leads
export const LEAD_STATUS_CONFIG: LeadStatusConfig[] = [
  { status: "NUEVO", label: "Nuevo", icon: Sparkles, color: "text-primary", badgeClass: "bg-primary/10 text-primary border-primary/20" },
  { status: "CONTACTADO", label: "Contactado", icon: PhoneCall, color: "text-sky-500", badgeClass: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  { status: "VISITA_AGENDADA", label: "Visita Agendada", icon: CalendarClock, color: "text-warning", badgeClass: "bg-warning/10 text-warning border-warning/20" },
  { status: "VISITA_REALIZADA", label: "Visita Realizada", icon: MapPinCheck, color: "text-indigo-500", badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { status: "NEGOCIACION", label: "Negociación", icon: Handshake, color: "text-orange-500", badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { status: "GANADO", label: "Ganado", icon: Trophy, color: "text-success", badgeClass: "bg-success/10 text-success border-success/20" },
  { status: "PERDIDO", label: "Perdido", icon: XCircle, color: "text-destructive", badgeClass: "bg-destructive/10 text-destructive border-destructive/20" },
];

// Acceso rápido a la config de un estado puntual
export const LEAD_STATUS_MAP: Record<LeadStatus, LeadStatusConfig> = Object.fromEntries(
  LEAD_STATUS_CONFIG.map((c) => [c.status, c])
) as Record<LeadStatus, LeadStatusConfig>;

export interface LeadOriginConfig {
  label: string;
  icon: React.ElementType;
}

// Configuración visual de cada origen de lead
export const LEAD_ORIGIN_MAP: Record<LeadOrigin, LeadOriginConfig> = {
  WEB: { label: "Web", icon: Globe },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle },
  PORTAL: { label: "Portal", icon: Building },
  REFERIDO: { label: "Referido", icon: UserRoundPlus },
  OTRO: { label: "Otro", icon: CircleHelp },
};
