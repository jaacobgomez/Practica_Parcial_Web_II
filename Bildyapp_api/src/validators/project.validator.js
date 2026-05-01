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

export const createProjectSchema = z.object({
  body: z.object({
    client: objectIdSchema,
    name: z.string().trim().min(2, "El nombre es obligatorio"),
    projectCode: z.string().trim().min(2, "El código del proyecto es obligatorio"),
    address: addressSchema.optional(),
    email: emailSchema.optional(),
    notes: z.string().trim().optional(),
    active: z.boolean().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      client: objectIdSchema.optional(),
      name: z.string().trim().min(2).optional(),
      projectCode: z.string().trim().min(2).optional(),
      address: addressSchema.optional(),
      email: emailSchema.optional(),
      notes: z.string().trim().optional(),
      active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "Debes enviar al menos un campo",
    }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    client: objectIdSchema.optional(),
    name: z.string().trim().optional(),
    active: z.enum(["true", "false"]).optional(),
    sort: z.string().trim().optional(),
  }),
});