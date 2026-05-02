import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload_memory.js";
import { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, deleteDeliveryNote, signDeliveryNote, getDeliveryNotePdf
} from "../controllers/deliverynote.controller.js";
import { createDeliveryNoteSchema, deliveryNoteIdSchema, listDeliveryNotesSchema,
} from "../validators/deliverynote.validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createDeliveryNoteSchema), createDeliveryNote);
router.get("/", validate(listDeliveryNotesSchema), getDeliveryNotes);
router.get("/pdf/:id", validate(deliveryNoteIdSchema), getDeliveryNotePdf);
router.get("/:id", validate(deliveryNoteIdSchema), getDeliveryNoteById);
router.patch("/:id/sign", validate(deliveryNoteIdSchema), upload.single("signature"), signDeliveryNote);
router.delete("/:id", validate(deliveryNoteIdSchema), deleteDeliveryNote);

export default router;