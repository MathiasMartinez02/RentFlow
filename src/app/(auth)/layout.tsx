import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Autenticación",
    template: "%s · RentFlow",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
