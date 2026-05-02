import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import uploadMemory from "../middleware/upload_memory.js";
import { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, deleteDeliveryNote, signDeliveryNote, getDeliveryNotePdf
} from "../controllers/deliverynote.controller.js";
import { createDeliveryNoteSchema, deliveryNoteIdSchema, listDeliveryNotesSchema,
} from "../validators/deliverynote.validator.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/deliverynote:
 *   post:
 *     tags:
 *       - DeliveryNote
 *     summary: Crear un albarán
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 */
router.post("/", validate(createDeliveryNoteSchema), createDeliveryNote);

/**
 * @openapi
 * /api/deliverynote:
 *   get:
 *     tags:
 *       - DeliveryNote
 *     summary: Listar albaranes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get("/", validate(listDeliveryNotesSchema), getDeliveryNotes);

/**
 * @openapi
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     tags:
 *       - DeliveryNote
 *     summary: Obtener PDF del albarán
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF del albarán o URL del PDF
 */
router.get("/pdf/:id", validate(deliveryNoteIdSchema), getDeliveryNotePdf);

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   get:
 *     tags:
 *       - DeliveryNote
 *     summary: Obtener un albarán por id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Albarán encontrado
 */
router.get("/:id", validate(deliveryNoteIdSchema), getDeliveryNoteById);

/**
 * @openapi
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     tags:
 *       - DeliveryNote
 *     summary: Firmar un albarán
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 */
router.patch("/:id/sign", validate(deliveryNoteIdSchema), uploadMemory.single("signature"), signDeliveryNote);

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   delete:
 *     tags:
 *       - DeliveryNote
 *     summary: Eliminar un albarán no firmado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Albarán eliminado correctamente
 */
router.delete("/:id", validate(deliveryNoteIdSchema), deleteDeliveryNote);

export default router;