import request from "supertest";
import app from "../src/app.js";
import Client from "../src/models/Client.js";
import Project from "../src/models/Project.js";
import DeliveryNote from "../src/models/DeliveryNote.js";
import { createAuthenticatedUser } from "./helpers/auth.helper.js";

describe("DeliveryNote endpoints", () => {
  async function createBaseData() {
    const { token, company, user } = await createAuthenticatedUser();

    const client = await Client.create({
      user: user._id,
      company: company._id,
      name: "Cliente Albarán",
      cif: "B33333333",
    });

    const project = await Project.create({
      user: user._id,
      company: company._id,
      client: client._id,
      name: "Proyecto Albarán",
      projectCode: "ALB-001",
    });

    return { token, company, user, client, project };
  }

  describe("POST /api/deliverynote", () => {
    it("debería crear un albarán de material", async () => {
      const { token, client, project } = await createBaseData();

      const response = await request(app)
        .post("/api/deliverynote")
        .set("Authorization", `Bearer ${token}`)
        .send({
          client: client._id.toString(),
          project: project._id.toString(),
          format: "material",
          description: "Entrega de material",
          workDate: "2026-05-10",
          material: "Cemento",
          quantity: 10,
          unit: "sacos",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.deliveryNote).toBeDefined();
      expect(response.body.deliveryNote.format).toBe("material");
    });

    it("debería crear un albarán de horas", async () => {
      const { token, client, project } = await createBaseData();

      const response = await request(app)
        .post("/api/deliverynote")
        .set("Authorization", `Bearer ${token}`)
        .send({
          client: client._id.toString(),
          project: project._id.toString(),
          format: "hours",
          description: "Jornada de trabajo",
          workDate: "2026-05-11",
          hours: 8,
          workers: [
            { name: "Pedro", hours: 4 },
            { name: "Luis", hours: 4 },
          ],
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.deliveryNote).toBeDefined();
      expect(response.body.deliveryNote.format).toBe("hours");
    });
  });

  describe("GET /api/deliverynote/:id", () => {
    it("debería obtener un albarán por id", async () => {
      const { token, company, user, client, project } = await createBaseData();

      const deliveryNote = await DeliveryNote.create({
        user: user._id,
        company: company._id,
        client: client._id,
        project: project._id,
        format: "material",
        description: "Prueba",
        workDate: new Date(),
        material: "Yeso",
        quantity: 5,
        unit: "bolsas",
      });

      const response = await request(app)
        .get(`/api/deliverynote/${deliveryNote._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.deliveryNote).toBeDefined();
    });
  });

  describe("DELETE /api/deliverynote/:id", () => {
    it("no debería permitir borrar un albarán firmado", async () => {
      const { token, company, user, client, project } = await createBaseData();

      const deliveryNote = await DeliveryNote.create({
        user: user._id,
        company: company._id,
        client: client._id,
        project: project._id,
        format: "material",
        description: "Firmado",
        workDate: new Date(),
        material: "Ladrillos",
        quantity: 50,
        unit: "uds",
        signed: true,
      });

      const response = await request(app)
        .delete(`/api/deliverynote/${deliveryNote._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });
  });
});