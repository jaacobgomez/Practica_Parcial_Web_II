import { z } from "zod";

const emailSchema = z
  .string()
  .email("El email no es válido")
  .trim()
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

const addressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
});

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const validationCodeSchema = z.object({
  body: z.object({
    code: z
      .string()
      .regex(/^\d{6}$/, "El código debe tener exactamente 6 dígitos"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const personalDataSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "El nombre es obligatorio"),
    lastName: z.string().trim().min(2, "Los apellidos son obligatorios"),
    nif: z.string().trim().min(5, "El NIF es obligatorio"),
    address: addressSchema.optional(),
  }),
});

export const companySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "El nombre de la empresa es obligatorio").optional(),
    cif: z.string().trim().min(5, "El CIF es obligatorio").optional(),
    address: addressSchema.optional(),
    isFreelance: z.boolean(),
  }).refine(
    (data) => {
      if (data.isFreelance) return true;
      return Boolean(data.name && data.cif);
    },
    {
      message: "Si no es autónomo, debes indicar nombre y CIF de la empresa",
      path: ["name"],
    }
  ),
});