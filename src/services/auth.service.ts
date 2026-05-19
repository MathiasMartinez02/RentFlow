import { simulateDelay } from "./base.service";
import { MOCK_USERS } from "@/mock/users";
import type { AuthSession, AuthUser, LoginCredentials, RegisterData } from "@/types/auth";

let _users = [...MOCK_USERS];

function generateFakeToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  );
  const signature = btoa(`rentflow_fake_${userId}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

function toAuthUser(user: (typeof MOCK_USERS)[0]): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    company: user.company,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await simulateDelay(900);

    const user = _users.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (!user) {
      throw new Error("Email o contraseña incorrectos");
    }

    const token = generateFakeToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return { user: toAuthUser(user), token, expiresAt };
  },

  async register(data: RegisterData): Promise<AuthSession> {
    await simulateDelay(1100);

    const exists = _users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) {
      throw new Error("Ya existe una cuenta con ese email");
    }

    const newUser = {
      id: `user-${String(Date.now()).slice(-6)}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      company: data.company ?? "",
      role: "owner" as const,
      createdAt: new Date().toISOString(),
    };

    _users = [newUser, ..._users];

    const token = generateFakeToken(newUser.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return { user: toAuthUser(newUser), token, expiresAt };
  },

  async sendPasswordReset(email: string): Promise<void> {
    await simulateDelay(800);

    const exists = _users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    // Silently succeed even if user doesn't exist (security best practice)
    if (!exists) return;
  },

  async loginWithProvider(provider: "google" | "github"): Promise<AuthSession> {
    await simulateDelay(1200);
    // Auto-login as demo user for social providers
    const demoUser = _users.find((u) => u.id === "user-002")!;
    const token = generateFakeToken(`${provider}_${demoUser.id}`);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return { user: toAuthUser(demoUser), token, expiresAt };
  },
};
