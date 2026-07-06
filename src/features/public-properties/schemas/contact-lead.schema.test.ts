import { describe, expect, it } from "vitest";
import { contactLeadSchema, DEFAULT_CONTACT_LEAD_VALUES } from "./contact-lead.schema";

// Payload valido base usado como punto de partida para los casos de error por campo
const validPayload = {
  nombre: "María Gómez",
  email: "maria@example.com",
  telefono: "1122334455",
  mensaje: "Me interesa esta propiedad",
  propertyId: "prop-1",
};

describe("contactLeadSchema", () => {
  it("acepta un payload valido completo", () => {
    const result = contactLeadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rechaza los valores por defecto del formulario (nombre/email/telefono vacios)", () => {
    const result = contactLeadSchema.safeParse(DEFAULT_CONTACT_LEAD_VALUES);
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta el nombre", () => {
    const result = contactLeadSchema.safeParse({ ...validPayload, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza un email invalido", () => {
    const result = contactLeadSchema.safeParse({ ...validPayload, email: "no-es-email" });
    expect(result.success).toBe(false);
  });

  it("rechaza un telefono demasiado corto", () => {
    const result = contactLeadSchema.safeParse({ ...validPayload, telefono: "12" });
    expect(result.success).toBe(false);
  });

  it("acepta mensaje y propertyId vacios (opcionales)", () => {
    const result = contactLeadSchema.safeParse({ ...validPayload, mensaje: "", propertyId: "" });
    expect(result.success).toBe(true);
  });

  it("rechaza un mensaje con mas de 1000 caracteres", () => {
    const result = contactLeadSchema.safeParse({ ...validPayload, mensaje: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("acepta un formulario de contacto general sin propertyId", () => {
    const { propertyId, ...withoutProperty } = validPayload;
    void propertyId;
    const result = contactLeadSchema.safeParse(withoutProperty);
    expect(result.success).toBe(true);
  });
});
