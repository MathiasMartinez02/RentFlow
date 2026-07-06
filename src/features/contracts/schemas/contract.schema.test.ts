import { describe, expect, it } from "vitest";
import { contractSchema, DEFAULT_CONTRACT_VALUES } from "./contract.schema";

// Payload valido base usado como punto de partida para los casos de error por campo
const validPayload = {
  propertyId: "prop-1",
  tenantId: "tenant-1",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  status: "active" as const,
  monthlyRent: 1000,
  deposit: 1000,
  expenses: "",
  annualIncreasePercent: "",
  renewalOption: false,
  noticePeriodDays: 30,
  terms: "",
};

describe("contractSchema", () => {
  it("acepta un payload valido completo", () => {
    const result = contractSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("acepta los valores por defecto del formulario, excepto propertyId/tenantId/fechas vacias", () => {
    const result = contractSchema.safeParse(DEFAULT_CONTRACT_VALUES);
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta propertyId", () => {
    const result = contractSchema.safeParse({ ...validPayload, propertyId: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta tenantId", () => {
    const result = contractSchema.safeParse({ ...validPayload, tenantId: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta startDate", () => {
    const result = contractSchema.safeParse({ ...validPayload, startDate: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta endDate", () => {
    const result = contractSchema.safeParse({ ...validPayload, endDate: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza un status fuera del enum permitido", () => {
    const result = contractSchema.safeParse({ ...validPayload, status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rechaza monthlyRent igual a cero (debe ser positivo)", () => {
    const result = contractSchema.safeParse({ ...validPayload, monthlyRent: 0 });
    expect(result.success).toBe(false);
  });

  it("rechaza monthlyRent negativo", () => {
    const result = contractSchema.safeParse({ ...validPayload, monthlyRent: -100 });
    expect(result.success).toBe(false);
  });

  it("rechaza deposit negativo", () => {
    const result = contractSchema.safeParse({ ...validPayload, deposit: -1 });
    expect(result.success).toBe(false);
  });

  it("acepta deposit igual a cero", () => {
    const result = contractSchema.safeParse({ ...validPayload, deposit: 0 });
    expect(result.success).toBe(true);
  });

  it("acepta expenses vacio (string vacio permitido por el schema)", () => {
    const result = contractSchema.safeParse({ ...validPayload, expenses: "" });
    expect(result.success).toBe(true);
  });

  it("rechaza expenses negativo", () => {
    const result = contractSchema.safeParse({ ...validPayload, expenses: -5 });
    expect(result.success).toBe(false);
  });

  it("rechaza annualIncreasePercent mayor a 100", () => {
    const result = contractSchema.safeParse({ ...validPayload, annualIncreasePercent: 150 });
    expect(result.success).toBe(false);
  });

  it("rechaza annualIncreasePercent negativo", () => {
    const result = contractSchema.safeParse({ ...validPayload, annualIncreasePercent: -10 });
    expect(result.success).toBe(false);
  });

  it("rechaza noticePeriodDays negativo", () => {
    const result = contractSchema.safeParse({ ...validPayload, noticePeriodDays: -1 });
    expect(result.success).toBe(false);
  });

  it("rechaza noticePeriodDays no entero", () => {
    const result = contractSchema.safeParse({ ...validPayload, noticePeriodDays: 1.5 });
    expect(result.success).toBe(false);
  });

  it("aplica el default de noticePeriodDays (30) cuando no se envia", () => {
    const { noticePeriodDays, ...withoutNotice } = validPayload;
    void noticePeriodDays;
    const result = contractSchema.safeParse(withoutNotice);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.noticePeriodDays).toBe(30);
    }
  });

  it("rechaza terms con mas de 2000 caracteres", () => {
    const result = contractSchema.safeParse({ ...validPayload, terms: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("coerciona monthlyRent recibido como string numerico", () => {
    const result = contractSchema.safeParse({ ...validPayload, monthlyRent: "1500" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthlyRent).toBe(1500);
    }
  });
});
