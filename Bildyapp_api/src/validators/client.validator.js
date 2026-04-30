import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "ID no válido");

const addressSchema = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
});

const emailSchema = z
  .string()
  .email("El email no es válido")
  .trim()
  .transform((value) => value.toLowerCase());

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "El nombre es obligatorio"),
    cif: z.string().trim().min(5, "El CIF es obligatorio"),
    email: emailSchema.optional(),
    phone: z.string().trim().optional(),
    address: addressSchema.optional(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z.string().trim().min(2).optional(),
      cif: z.string().trim().min(5).optional(),
      email: emailSchema.optional(),
      phone: z.string().trim().optional(),
      address: addressSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Debes enviar al menos un campo",
    }),
});

export const clientIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    name: z.string().trim().optional(),
    sort: z.string().trim().optional(),
  }),
});