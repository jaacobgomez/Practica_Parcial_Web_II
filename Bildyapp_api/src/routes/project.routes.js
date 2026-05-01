import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createProject, updateProject, getProjects, getProjectById, deleteProject, getArchivedProjects,
    restoreProject,} from "../controllers/project.controller.js";
import { createProjectSchema, updateProjectSchema, projectIdSchema, listProjectsSchema,} 
    from "../validators/project.validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createProjectSchema), createProject);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.get("/archived", getArchivedProjects);
router.patch("/:id/restore", validate(projectIdSchema), restoreProject);
router.get("/", validate(listProjectsSchema), getProjects);
router.get("/:id", validate(projectIdSchema), getProjectById);
router.delete("/:id", validate(projectIdSchema), deleteProject);

export default router;