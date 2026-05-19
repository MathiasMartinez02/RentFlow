"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function RootPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [_hasHydrated, isAuthenticated, router]);

  return null;
}
