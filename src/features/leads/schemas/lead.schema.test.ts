import { describe, expect, it } from "vitest";
import { leadSchema, DEFAULT_LEAD_VALUES } from "./lead.schema";

// Payload valido base usado como punto de partida para los casos de error por campo
const validPayload = {
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "1122334455",
  origin: "WEB" as const,
  status: "NUEVO" as const,
  propertyId: "",
  message: "",
  visitDate: "",
  visitConfirmed: false,
  notes: "",
};

describe("leadSchema", () => {
  it("acepta un payload valido completo", () => {
    const result = leadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rechaza los valores por defecto del formulario (name/email/phone vacios)", () => {
    const result = leadSchema.safeParse(DEFAULT_LEAD_VALUES);
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta el nombre", () => {
    const result = leadSchema.safeParse({ ...validPayload, name: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza un email invalido", () => {
    const result = leadSchema.safeParse({ ...validPayload, email: "no-es-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza un telefono demasiado corto", () => {
    const result = leadSchema.safeParse({ ...validPayload, phone: "12" });
    expect(result.success).toBe(false);
  });

  it("rechaza un origen fuera del enum permitido", () => {
    const result = leadSchema.safeParse({ ...validPayload, origin: "INSTAGRAM" });
    expect(result.success).toBe(false);
  });

  it("rechaza un estado fuera del enum permitido", () => {
    const result = leadSchema.safeParse({ ...validPayload, status: "PENDIENTE" });
    expect(result.success).toBe(false);
  });

  it("acepta todos los estados validos del pipeline", () => {
    const estados = [
      "NUEVO",
      "CONTACTADO",
      "VISITA_AGENDADA",
      "VISITA_REALIZADA",
      "NEGOCIACION",
      "GANADO",
      "PERDIDO",
    ];
    for (const status of estados) {
      const result = leadSchema.safeParse({ ...validPayload, status });
      expect(result.success).toBe(true);
    }
  });

  it("acepta propertyId y mensaje vacios (opcionales)", () => {
    const result = leadSchema.safeParse({ ...validPayload, propertyId: "", message: "" });
    expect(result.success).toBe(true);
  });

  it("rechaza un mensaje con mas de 1000 caracteres", () => {
    const result = leadSchema.safeParse({ ...validPayload, message: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("rechaza notas con mas de 2000 caracteres", () => {
    const result = leadSchema.safeParse({ ...validPayload, notes: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("aplica el default de visitConfirmed (false) cuando no se envia", () => {
    const { visitConfirmed, ...withoutConfirmed } = validPayload;
    void visitConfirmed;
    const result = leadSchema.safeParse(withoutConfirmed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitConfirmed).toBe(false);
    }
  });
});
