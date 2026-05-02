import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createProject, updateProject, getProjects, getProjectById, deleteProject, getArchivedProjects,
    restoreProject,} from "../controllers/project.controller.js";
import { createProjectSchema, updateProjectSchema, projectIdSchema, listProjectsSchema,} 
    from "../validators/project.validator.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/project:
 *   post:
 *     tags:
 *       - Project
 *     summary: Crear un proyecto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 */
router.post("/", validate(createProjectSchema), createProject);

/**
 * @openapi
 * /api/project:
 *   get:
 *     tags:
 *       - Project
 *     summary: Listar proyectos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get("/", validate(listProjectsSchema), getProjects);

/**
 * @openapi
 * /api/project/archived:
 *   get:
 *     tags:
 *       - Project
 *     summary: Listar proyectos archivados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyectos archivados
 */
router.get("/archived", getArchivedProjects);

/**
 * @openapi
 * /api/project/{id}:
 *   get:
 *     tags:
 *       - Project
 *     summary: Obtener un proyecto por id
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
 *         description: Proyecto encontrado
 */
router.get("/:id", validate(projectIdSchema), getProjectById);

/**
 * @openapi
 * /api/project/{id}:
 *   put:
 *     tags:
 *       - Project
 *     summary: Actualizar un proyecto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 */
router.put("/:id", validate(updateProjectSchema), updateProject);

/**
 * @openapi
 * /api/project/{id}:
 *   delete:
 *     tags:
 *       - Project
 *     summary: Eliminar o archivar un proyecto
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyecto eliminado o archivado
 */
router.delete("/:id", validate(projectIdSchema), deleteProject);

/**
 * @openapi
 * /api/project/{id}/restore:
 *   patch:
 *     tags:
 *       - Project
 *     summary: Restaurar un proyecto archivado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyecto restaurado
 */
router.patch("/:id/restore", validate(projectIdSchema), restoreProject);

export default router;