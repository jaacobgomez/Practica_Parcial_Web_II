import Client from "../models/Client.js";
import AppError from "../utils/AppError.js";

export async function createClient(req, res, next) {
  try {
    const { name, cif, email, phone, address } = req.body;

    if (!req.user.company) {
      return next(
        AppError.badRequest("El usuario no tiene una compañía asociada")
      );
    }

    const existingClient = await Client.findOne({
      company: req.user.company,
      cif,
    });

    if (existingClient) {
      return next(
        AppError.conflict("Ya existe un cliente con ese CIF en tu compañía")
      );
    }

    const client = await Client.create({
      user: req.user._id,
      company: req.user.company,
      name,
      cif,
      email: email || "",
      phone: phone || "",
      address: address || {},
    });

    res.status(201).json({
      message: "Cliente creado correctamente",
      client,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateClient(req, res, next) {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company,
    });

    if (!client) {
      return next(AppError.notFound("Cliente no encontrado"));
    }

    if (req.body.cif && req.body.cif !== client.cif) {
      const existingClient = await Client.findOne({
        company: req.user.company,
        cif: req.body.cif,
        _id: { $ne: id },
      });

      if (existingClient) {
        return next(
          AppError.conflict("Ya existe otro cliente con ese CIF en tu compañía")
        );
      }
    }

    Object.assign(client, req.body);
    await client.save();

    res.json({
      message: "Cliente actualizado correctamente",
      client,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClients(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const filter = {
      company: req.user.company,
      deleted: false,
    };

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
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

    const [clients, totalItems] = await Promise.all([
      Client.find(filter).sort(sort).skip(skip).limit(limit),
      Client.countDocuments(filter),
    ]);

    res.json({
      items: clients,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
}

export async function getClientById(req, res, next) {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company,
      deleted: false,
    });

    if (!client) {
      return next(AppError.notFound("Cliente no encontrado"));
    }

    res.json({ client });
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req, res, next) {
  try {
    const { id } = req.params;
    const { soft } = req.query;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company,
    });

    if (!client) {
      return next(AppError.notFound("Cliente no encontrado"));
    }

    if (soft === "true") {
      client.deleted = true;
      await client.save();

      return res.json({
        message: "Cliente archivado correctamente",
      });
    }

    await Client.findByIdAndDelete(id);

    res.json({
      message: "Cliente eliminado definitivamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function getArchivedClients(req, res, next) {
  try {
    const clients = await Client.find({
      company: req.user.company,
      deleted: true,
    }).sort({ updatedAt: -1 });

    res.json({
      items: clients,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreClient(req, res, next) {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      company: req.user.company,
      deleted: true,
    });

    if (!client) {
      return next(AppError.notFound("Cliente archivado no encontrado"));
    }

    client.deleted = false;
    await client.save();

    res.json({
      message: "Cliente restaurado correctamente",
      client,
    });
  } catch (error) {
    next(error);
  }
}