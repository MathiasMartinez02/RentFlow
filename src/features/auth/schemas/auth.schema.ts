import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("El email no tiene un formato válido"),
  password: z
    .string()
    .min(1, "Ingresá tu contraseña")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ingresá tu nombre")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z
      .string()
      .min(1, "Ingresá tu apellido")
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z
      .string()
      .min(1, "Ingresá tu email")
      .email("El email no tiene un formato válido"),
    company: z.string().optional(),
    password: z
      .string()
      .min(1, "Ingresá una contraseña")
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "Debés aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("El email no tiene un formato válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
