import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "ID no válido");

const workerSchema = z.object({
  name: z.string().trim().min(2, "El nombre del trabajador es obligatorio"),
  hours: z.number().min(0, "Las horas deben ser mayores o iguales a 0"),
});

export const createDeliveryNoteSchema = z.object({
  body: z
    .object({
      client: objectIdSchema,
      project: objectIdSchema,
      format: z.enum(["material", "hours"]),
      description: z.string().trim().optional(),
      workDate: z.coerce.date(),

      material: z.string().trim().optional(),
      quantity: z.number().min(0).optional(),
      unit: z.string().trim().optional(),

      hours: z.number().min(0).optional(),
      workers: z.array(workerSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.format === "material") {
        if (!data.material || data.material.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["material"],
            message: "El material es obligatorio para albaranes de material",
          });
        }

        if (data.quantity === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["quantity"],
            message: "La cantidad es obligatoria para albaranes de material",
          });
        }

        if (!data.unit || data.unit.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["unit"],
            message: "La unidad es obligatoria para albaranes de material",
          });
        }
      }

      if (data.format === "hours") {
        const hasHours = data.hours !== undefined;
        const hasWorkers = data.workers && data.workers.length > 0;

        if (!hasHours && !hasWorkers) {
          ctx.addIssue({
            code: "custom",
            path: ["hours"],
            message:
              "Debes indicar horas o trabajadores para albaranes de horas",
          });
        }
      }
    }),
});

export const deliveryNoteIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listDeliveryNotesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    project: objectIdSchema.optional(),
    client: objectIdSchema.optional(),
    format: z.enum(["material", "hours"]).optional(),
    signed: z.enum(["true", "false"]).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.string().trim().optional(),
  }),
});