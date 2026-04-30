import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createClient, updateClient, getClients, getClientById, deleteClient, getArchivedClients, restoreClient} 
from "../controllers/client.controller.js";
import { createClientSchema, updateClientSchema, clientIdSchema, listClientsSchema} from "../validators/client.validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createClientSchema), createClient);
router.put("/:id", validate(updateClientSchema), updateClient);
router.get("/archived", getArchivedClients);
router.patch("/:id/restore", validate(clientIdSchema), restoreClient);
router.get("/", validate(listClientsSchema), getClients);
router.get("/:id", validate(clientIdSchema), getClientById);
router.delete("/:id", validate(clientIdSchema), deleteClient);

export default router;