import request from "supertest";
import app from "../src/app.js";
import Client from "../src/models/Client.js";
import { createAuthenticatedUser } from "./helpers/auth.helper.js";

describe("Client endpoints", () => {
  describe("POST /api/client", () => {
    it("debería crear un cliente correctamente", async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Cliente Test",
          cif: "B11111111",
          email: "cliente@test.com",
          phone: "600000000",
          address: {
            street: "Calle Cliente",
            number: "10",
            postal: "28010",
            city: "Madrid",
            province: "Madrid",
          },
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.client).toBeDefined();
      expect(response.body.client.name).toBe("Cliente Test");
      expect(response.body.client.cif).toBe("B11111111");
    });

    it("no debería permitir duplicar CIF en la misma compañía", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Existente",
        cif: "B11111111",
      });

      const response = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Cliente Duplicado",
          cif: "B11111111",
        });

      expect(response.statusCode).toBe(409);
    });
  });

  describe("GET /api/client", () => {
    it("debería listar clientes de la compañía", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Uno",
        cif: "B11111112",
      });

      const response = await request(app)
        .get("/api/client")
        .set("Authorization", `Bearer ${token}`);


      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.totalItems).toBe(1);
    });
  });

  describe("DELETE /api/client/:id", () => {
    it("debería archivar un cliente con soft=true", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      const client = await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Archivable",
        cif: "B11111113",
      });

      const response = await request(app)
        .delete(`/api/client/${client._id}?soft=true`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      const updatedClient = await Client.findById(client._id);
      expect(updatedClient.deleted).toBe(true);
    });
  });
});