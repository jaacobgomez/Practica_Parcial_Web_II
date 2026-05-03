import DeliveryNote from "../models/DeliveryNote.js";
import Client from "../models/Client.js";
import Project from "../models/Project.js";
import AppError from "../utils/AppError.js";
import PDFDocument from "pdfkit";
import { PassThrough } from "node:stream";
import cloudinaryService from "../services/cloudinary.service.js";
import { getIo } from "../services/socket.service.js";

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

    const io = getIo();

    if (io) {
      io.emit("deliverynote:created", {
        id: deliveryNote._id,
        format: deliveryNote.format,
        project: deliveryNote.project,
        client: deliveryNote.client,
        signed: deliveryNote.signed,
      });
    }

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

function generateDeliveryNotePdfBuffer(deliveryNote) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks = [];

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);

    doc.pipe(stream);

    doc.fontSize(18).text("Albarán - BildyApp", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`ID: ${deliveryNote._id}`);
    doc.text(`Fecha de trabajo: ${new Date(deliveryNote.workDate).toLocaleDateString("es-ES")}`);
    doc.text(`Formato: ${deliveryNote.format}`);
    doc.text(`Descripción: ${deliveryNote.description || "-"}`);
    doc.moveDown();

    doc.text(`Usuario: ${deliveryNote.user?.fullName || deliveryNote.user?.email || "-"}`);
    doc.text(`Cliente: ${deliveryNote.client?.name || "-"}`);
    doc.text(`Proyecto: ${deliveryNote.project?.name || "-"}`);
    doc.moveDown();

    if (deliveryNote.format === "material") {
      doc.text("Datos de material", { underline: true });
      doc.text(`Material: ${deliveryNote.material || "-"}`);
      doc.text(`Cantidad: ${deliveryNote.quantity ?? 0}`);
      doc.text(`Unidad: ${deliveryNote.unit || "-"}`);
    }

    if (deliveryNote.format === "hours") {
      doc.text("Datos de horas", { underline: true });
      doc.text(`Horas totales: ${deliveryNote.hours ?? 0}`);
      doc.moveDown();

      if (deliveryNote.workers?.length) {
        doc.text("Trabajadores:");
        deliveryNote.workers.forEach((worker, index) => {
          doc.text(`${index + 1}. ${worker.name} - ${worker.hours}h`);
        });
      }
    }

    doc.moveDown();
    doc.text(`Firmado: ${deliveryNote.signed ? "Sí" : "No"}`);

    if (deliveryNote.signed && deliveryNote.signedAt) {
      doc.text(
        `Fecha de firma: ${new Date(deliveryNote.signedAt).toLocaleString("es-ES")}`
      );
    }

    if (deliveryNote.signatureUrl) {
      doc.moveDown();
      doc.text(`Firma: ${deliveryNote.signatureUrl}`);
    }

    doc.end();
  });
}

export async function signDeliveryNote(req, res, next) {
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

    if (deliveryNote.signed) {
      return next(AppError.badRequest("El albarán ya está firmado"));
    }

    if (!req.file) {
      return next(AppError.badRequest("Debes subir una imagen de firma"));
    }

    const signatureUpload = await cloudinaryService.uploadBuffer(req.file.buffer, {
      folder: "bildyapp/signatures",
      publicId: `signature-${deliveryNote._id}-${Date.now()}`,
      resourceType: "image",
    });

    deliveryNote.signed = true;
    deliveryNote.signedAt = new Date();
    deliveryNote.signatureUrl = signatureUpload.secure_url;

    const pdfBuffer = await generateDeliveryNotePdfBuffer(deliveryNote);

    const pdfUpload = await cloudinaryService.uploadBuffer(pdfBuffer, {
      folder: "bildyapp/pdfs",
      publicId: `deliverynote-${deliveryNote._id}-${Date.now()}`,
      resourceType: "raw",
    });

    deliveryNote.pdfUrl = pdfUpload.secure_url || pdfUpload.url || "";
    await deliveryNote.save();

    const io = getIo();

    if (io) {
      io.emit("deliverynote:signed", {
        id: deliveryNote._id,
        signed: deliveryNote.signed,
        signedAt: deliveryNote.signedAt,
        pdfUrl: deliveryNote.pdfUrl,
      });
    }

    res.json({
      message: "Albarán firmado correctamente",
      deliveryNote,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeliveryNotePdf(req, res, next) {
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

    if (deliveryNote.signed && deliveryNote.pdfUrl) {
      return res.json({
        message: "PDF disponible",
        pdfUrl: deliveryNote.pdfUrl,
      });
    }

    const pdfBuffer = await generateDeliveryNotePdfBuffer(deliveryNote);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=deliverynote-${deliveryNote._id}.pdf`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}