import DeliveryNote from "../models/DeliveryNote.js";
import Client from "../models/Client.js";
import Project from "../models/Project.js";
import AppError from "../utils/AppError.js";

export async function createDeliveryNote(req, res, next) {
  try {
    const {
      client,
      project,
      format,
      description,
      workDate,
      material,
      quantity,
      unit,
      hours,
      workers,
    } = req.body;

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
      _id: project,
      company: req.user.company,
      deleted: false,
    });

    if (!existingProject) {
      return next(
        AppError.badRequest("El proyecto no existe o no pertenece a tu compañía")
      );
    }

    if (String(existingProject.client) !== String(client)) {
      return next(
        AppError.badRequest("El proyecto no pertenece al cliente indicado")
      );
    }

    const deliveryNote = await DeliveryNote.create({
      user: req.user._id,
      company: req.user.company,
      client,
      project,
      format,
      description: description || "",
      workDate,

      material: material || "",
      quantity: quantity ?? 0,
      unit: unit || "",

      hours: hours ?? 0,
      workers: workers || [],
    });

    res.status(201).json({
      message: "Albarán creado correctamente",
      deliveryNote,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeliveryNotes(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: req.user.company,
      deleted: false,
    };

    if (req.query.project) {
      filter.project = req.query.project;
    }

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.format) {
      filter.format = req.query.format;
    }

    if (req.query.signed) {
      filter.signed = req.query.signed === "true";
    }

    if (req.query.from || req.query.to) {
      filter.workDate = {};

      if (req.query.from) {
        filter.workDate.$gte = new Date(req.query.from);
      }

      if (req.query.to) {
        filter.workDate.$lte = new Date(req.query.to);
      }
    }

    let sort = { workDate: -1 };

    if (req.query.sort) {
      const sortField = req.query.sort;
      if (sortField.startsWith("-")) {
        sort = { [sortField.slice(1)]: -1 };
      } else {
        sort = { [sortField]: 1 };
      }
    }

    const [deliveryNotes, totalItems] = await Promise.all([
      DeliveryNote.find(filter)
        .populate("client")
        .populate("project")
        .populate("user", "email name lastName")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      DeliveryNote.countDocuments(filter),
    ]);

    res.json({
      items: deliveryNotes,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeliveryNoteById(req, res, next) {
  try {
    const { id } = req.params;

    const deliveryNote = await DeliveryNote.findOne({
      _id: id,
      company: req.user.company,
      deleted: false,
    })
      .populate("user", "email name lastName fullName")
      .populate("client")
      .populate("project");

    if (!deliveryNote) {
      return next(AppError.notFound("Albarán no encontrado"));
    }

    res.json({ deliveryNote });
  } catch (error) {
    next(error);
  }
}

export async function deleteDeliveryNote(req, res, next) {
  try {
    const { id } = req.params;

    const deliveryNote = await DeliveryNote.findOne({
      _id: id,
      company: req.user.company,
      deleted: false,
    });

    if (!deliveryNote) {
      return next(AppError.notFound("Albarán no encontrado"));
    }

    if (deliveryNote.signed) {
      return next(
        AppError.badRequest("No se puede eliminar un albarán firmado")
      );
    }

    await DeliveryNote.findByIdAndDelete(id);

    res.json({
      message: "Albarán eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
}