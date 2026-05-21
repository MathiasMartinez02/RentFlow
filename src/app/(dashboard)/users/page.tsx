import type { Metadata } from "next";
import { UsersView } from "@/features/users";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsersPage() {
  return <UsersView />;
}
