import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginCredentials, RegisterData } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;           // accessToken
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  onboardingCompleted: boolean;
  _hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  setTokens: (access: string, refresh: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithProvider: (provider: "google" | "github") => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isNewUser: false,
      onboardingCompleted: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setTokens: (access, refresh) =>
        set({ token: access, refreshToken: refresh }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const session = await authService.login(credentials);
          set({
            user: session.user,
            token: session.accessToken,
            refreshToken: session.refreshToken,
            isAuthenticated: true,
            isNewUser: false,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      loginWithProvider: async (_provider) => {
        throw new Error("El inicio de sesión con proveedores no está disponible actualmente.");
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const session = await authService.register(data);
          set({
            user: session.user,
            token: session.accessToken,
            refreshToken: session.refreshToken,
            isAuthenticated: true,
            isNewUser: true,
            onboardingCompleted: false,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        const rt = get().refreshToken;
        if (rt) authService.logout(rt).catch(() => {});
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isNewUser: false,
        });
      },

      sendPasswordReset: async (email) => {
        set({ isLoading: true });
        try {
          await authService.sendPasswordReset(email);
        } finally {
          set({ isLoading: false });
        }
      },

      completeOnboarding: () => set({ onboardingCompleted: true, isNewUser: false }),

      updateUser: (data) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...data } : null,
        })),
    }),
    {
      name: "rentflow-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
