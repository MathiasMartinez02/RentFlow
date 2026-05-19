import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginCredentials, RegisterData } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  onboardingCompleted: boolean;
  _hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
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
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isNewUser: false,
      onboardingCompleted: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const session = await authService.login(credentials);
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isNewUser: false,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      loginWithProvider: async (provider) => {
        set({ isLoading: true });
        try {
          const session = await authService.loginWithProvider(provider);
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isNewUser: false,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const session = await authService.register(data);
          set({
            user: session.user,
            token: session.token,
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
        set({
          user: null,
          token: null,
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
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
