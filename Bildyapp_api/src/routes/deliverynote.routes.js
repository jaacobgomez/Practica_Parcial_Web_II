import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, deleteDeliveryNote,
} from "../controllers/deliverynote.controller.js";
import { createDeliveryNoteSchema, deliveryNoteIdSchema, listDeliveryNotesSchema,
} from "../validators/deliverynote.validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createDeliveryNoteSchema), createDeliveryNote);
router.get("/", validate(listDeliveryNotesSchema), getDeliveryNotes);
router.get("/:id", validate(deliveryNoteIdSchema), getDeliveryNoteById);
router.delete("/:id", validate(deliveryNoteIdSchema), deleteDeliveryNote);

export default router;