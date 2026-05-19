import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

export type CommandItemType =
  | "property"
  | "tenant"
  | "contract"
  | "payment"
  | "maintenance"
  | "navigation"
  | "action";

export interface CommandBadge {
  label: string;
  className: string;
}

export interface CommandItem {
  id: string;
  type: CommandItemType;
  label: string;
  sublabel?: string;
  icon: ComponentType<LucideProps>;
  badge?: CommandBadge;
  shortcut?: string[];
  onSelect: () => void;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface SearchHit {
  type: Exclude<CommandItemType, "navigation" | "action">;
  id: string;
  label: string;
  sublabel?: string;
  badge?: CommandBadge;
}

export interface RecentItem {
  type: string;
  id: string;
  label: string;
  sublabel?: string;
}
