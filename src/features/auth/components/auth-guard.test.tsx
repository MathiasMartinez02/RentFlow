import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthGuard } from "./auth-guard";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

// Estado mutable del store de auth: cada test lo pisa antes de renderizar
const authState: { isAuthenticated: boolean; _hasHydrated: boolean } = {
  isAuthenticated: false,
  _hasHydrated: false,
};

vi.mock("@/store/auth.store", () => ({
  useAuthStore: (selector: (s: typeof authState) => unknown) => selector(authState),
}));

const mockRefresh = vi.fn();

vi.mock("@/store/catalog.store", () => ({
  useCatalogStore: (selector: (s: { refresh: () => void }) => unknown) =>
    selector({ refresh: mockRefresh }),
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    authState.isAuthenticated = false;
    authState._hasHydrated = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("no redirige mientras el store de auth no termino de hidratarse", async () => {
    authState._hasHydrated = false;
    authState.isAuthenticated = false;

    render(
      <AuthGuard>
        <div>contenido protegido</div>
      </AuthGuard>
    );

    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirige a /login cuando ya hidrato y el usuario no esta autenticado", async () => {
    authState._hasHydrated = true;
    authState.isAuthenticated = false;

    render(
      <AuthGuard>
        <div>contenido protegido</div>
      </AuthGuard>
    );

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });

  it("renderiza el contenido y refresca el catalogo cuando hidrato y esta autenticado", async () => {
    authState._hasHydrated = true;
    authState.isAuthenticated = true;

    render(
      <AuthGuard>
        <div>contenido protegido</div>
      </AuthGuard>
    );

    expect(await screen.findByText("contenido protegido")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });
});
