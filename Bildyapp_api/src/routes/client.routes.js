import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createClient, updateClient, getClients, getClientById, deleteClient, getArchivedClients, restoreClient} 
from "../controllers/client.controller.js";
import { createClientSchema, updateClientSchema, clientIdSchema, listClientsSchema} from "../validators/client.validator.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/client:
 *   post:
 *     tags:
 *       - Client
 *     summary: Crear un cliente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cliente Demo
 *               cif:
 *                 type: string
 *                 example: B11111111
 *               email:
 *                 type: string
 *                 example: cliente@demo.com
 *               phone:
 *                 type: string
 *                 example: 600123123
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *       409:
 *         description: Cliente duplicado
 *       401:
 *         description: No autorizado
 */
router.post("/", validate(createClientSchema), createClient);

/**
 * @openapi
 * /api/client:
 *   get:
 *     tags:
 *       - Client
 *     summary: Listar clientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       401:
 *         description: No autorizado
 */
router.get("/", validate(listClientsSchema), getClients);

/**
 * @openapi
 * /api/client/archived:
 *   get:
 *     tags:
 *       - Client
 *     summary: Listar clientes archivados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clientes archivados
 */
router.get("/archived", getArchivedClients);

/**
 * @openapi
 * /api/client/{id}:
 *   get:
 *     tags:
 *       - Client
 *     summary: Obtener un cliente por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", validate(clientIdSchema), getClientById);

/**
 * @openapi
 * /api/client/{id}:
 *   put:
 *     tags:
 *       - Client
 *     summary: Actualizar un cliente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put("/:id", validate(updateClientSchema), updateClient);

/**
 * @openapi
 * /api/client/{id}:
 *   delete:
 *     tags:
 *       - Client
 *     summary: Eliminar o archivar un cliente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         schema:
 *           type: string
 *           example: "true"
 *     responses:
 *       200:
 *         description: Cliente eliminado o archivado
 */
router.delete("/:id", validate(clientIdSchema), deleteClient);

/**
 * @openapi
 * /api/client/{id}/restore:
 *   patch:
 *     tags:
 *       - Client
 *     summary: Restaurar un cliente archivado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente restaurado
 */
router.patch("/:id/restore", validate(clientIdSchema), restoreClient);

export default router;