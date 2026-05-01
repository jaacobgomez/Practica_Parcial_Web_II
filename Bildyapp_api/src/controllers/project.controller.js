import Project from "../models/Project.js";
import Client from "../models/Client.js";
import AppError from "../utils/AppError.js";

export async function createProject(req, res, next) {
  try {
    const { client, name, projectCode, address, email, notes, active } = req.body;

    if (!req.user.company) {
      return next(
        AppError.badRequest("El usuario no tiene una compañía asociada")
      );
    }

    const existingClient = await Client.findOne({
      _id: client,
      company: req.user.company,
      deleted: false,
    });

    if (!existingClient) {
      return next(
        AppError.badRequest("El cliente no existe o no pertenece a tu compañía")
      );
    }

    const existingProject = await Project.findOne({
      company: req.user.company,
      projectCode,
    });

    if (existingProject) {
      return next(
        AppError.conflict("Ya existe un proyecto con ese código en tu compañía")
      );
    }

    const project = await Project.create({
      user: req.user._id,
      company: req.user.company,
      client,
      name,
      projectCode,
      address: address || {},
      email: email || "",
      notes: notes || "",
      active: active ?? true,
    });

    res.status(201).json({
      message: "Proyecto creado correctamente",
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
    });

    if (!project) {
      return next(AppError.notFound("Proyecto no encontrado"));
    }

    if (req.body.client) {
      const existingClient = await Client.findOne({
        _id: req.body.client,
        company: req.user.company,
        deleted: false,
      });

      if (!existingClient) {
        return next(
          AppError.badRequest("El cliente no existe o no pertenece a tu compañía")
        );
      }
    }

    if (req.body.projectCode && req.body.projectCode !== project.projectCode) {
      const existingProject = await Project.findOne({
        company: req.user.company,
        projectCode: req.body.projectCode,
        _id: { $ne: id },
      });

      if (existingProject) {
        return next(
          AppError.conflict("Ya existe otro proyecto con ese código en tu compañía")
        );
      }
    }

    Object.assign(project, req.body);
    await project.save();

    res.json({
      message: "Proyecto actualizado correctamente",
      project,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: req.user.company,
      deleted: false,
    };

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }

    if (req.query.active) {
      filter.active = req.query.active === "true";
    }

    let sort = { createdAt: -1 };

    if (req.query.sort) {
      const sortField = req.query.sort;
      if (sortField.startsWith("-")) {
        sort = { [sortField.slice(1)]: -1 };
      } else {
        sort = { [sortField]: 1 };
      }
    }

    const [projects, totalItems] = await Promise.all([
      Project.find(filter)
        .populate("client")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    res.json({
      items: projects,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
      deleted: false,
    }).populate("client");

    if (!project) {
      return next(AppError.notFound("Proyecto no encontrado"));
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const { soft } = req.query;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
    });

    if (!project) {
      return next(AppError.notFound("Proyecto no encontrado"));
    }

    if (soft === "true") {
      project.deleted = true;
      await project.save();

      return res.json({
        message: "Proyecto archivado correctamente",
      });
    }

    await Project.findByIdAndDelete(id);

    res.json({
      message: "Proyecto eliminado definitivamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function getArchivedProjects(req, res, next) {
  try {
    const projects = await Project.find({
      company: req.user.company,
      deleted: true,
    })
      .populate("client")
      .sort({ updatedAt: -1 });

    res.json({
      items: projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreProject(req, res, next) {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
      deleted: true,
    });

    if (!project) {
      return next(AppError.notFound("Proyecto archivado no encontrado"));
    }

    project.deleted = false;
    await project.save();

    res.json({
      message: "Proyecto restaurado correctamente",
      project,
    });
  } catch (error) {
    next(error);
  }
}