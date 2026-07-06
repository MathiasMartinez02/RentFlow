import Module from "node:module";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// El modulo real (api-client.ts) resuelve "@/store/auth.store" con un require() dinamico
// dentro de getAuthState() para evitar un import circular. Ese require usa Module.createRequire
// de Node (resolucion real del sistema de archivos), por lo que vi.mock (que solo intercepta el
// grafo de modulos de Vite/ESM) no lo alcanza. Se intercepta a mas bajo nivel, parcheando
// Module._load -- el primitivo del que createRequire depende internamente -- para devolver el
// mock cuando el request coincide exactamente con el especificador usado en el codigo real.
const mockGetState = vi.fn();

type ModuleLoader = (request: string, ...rest: unknown[]) => unknown;
const ModuleWithLoad = Module as unknown as { _load: ModuleLoader };
const originalLoad = ModuleWithLoad._load;

ModuleWithLoad._load = function (this: unknown, request: string, ...rest: unknown[]) {
  if (request === "@/store/auth.store") {
    return { useAuthStore: { getState: () => mockGetState() } };
  }
  return originalLoad.apply(this, [request, ...rest]);
} as ModuleLoader;

describe("api-client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetState.mockReset();
  });

  afterAll(() => {
    // Restaura la resolucion original de Node para no afectar a otros archivos de test
    ModuleWithLoad._load = originalLoad;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("realiza un request exitoso y desenvuelve la propiedad data de la respuesta", async () => {
    mockGetState.mockReturnValue({
      token: "abc",
      refreshToken: "r1",
      setTokens: vi.fn(),
      logout: vi.fn(),
    });

    const fetchMock = vi.fn().mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ data: { id: "1", name: "Contrato 1" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { api } = await import("@/lib/api-client");
    const result = await api.get<{ id: string; name: string }>("/contracts/1");

    expect(result).toEqual({ id: "1", name: "Contrato 1" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/contracts/1"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer abc" }),
      })
    );
  });

  it("ante un 401 refresca el token una sola vez y reintenta el request original", async () => {
    const setTokens = vi.fn();
    mockGetState.mockReturnValue({
      token: "expired-token",
      refreshToken: "refresh-token",
      setTokens,
      logout: vi.fn(),
    });

    const fetchMock = vi
      .fn()
      // 1) request original -> 401
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: async () => ({ message: "Unauthorized" }),
      })
      // 2) POST /auth/refresh -> ok, devuelve tokens nuevos
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ data: { accessToken: "new-access", refreshToken: "new-refresh" } }),
      })
      // 3) reintento del request original -> ok
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ data: { id: "1" } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { api } = await import("@/lib/api-client");
    const result = await api.get<{ id: string }>("/contracts/1");

    expect(result).toEqual({ id: "1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(setTokens).toHaveBeenCalledWith("new-access", "new-refresh");
  });

  it("lanza ApiError y desloguea si el refresh del token falla", async () => {
    const logout = vi.fn();
    mockGetState.mockReturnValue({
      token: "expired-token",
      refreshToken: "refresh-token",
      setTokens: vi.fn(),
      logout,
    });

    const fetchMock = vi
      .fn()
      // 1) request original -> 401
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: async () => ({ message: "Unauthorized" }),
      })
      // 2) POST /auth/refresh -> falla
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: async () => ({ message: "Refresh token invalido" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { api, ApiError } = await import("@/lib/api-client");

    await expect(api.get("/contracts/1")).rejects.toBeInstanceOf(ApiError);
    expect(logout).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
