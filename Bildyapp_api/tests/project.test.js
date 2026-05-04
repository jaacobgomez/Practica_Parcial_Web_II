import request from "supertest";
import app from "../src/app.js";
import Client from "../src/models/Client.js";
import Project from "../src/models/Project.js";
import { createAuthenticatedUser } from "./helpers/auth.helper.js";

describe("Project endpoints", () => {
  describe("POST /api/project", () => {
    it("debería crear un proyecto correctamente", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      const client = await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Proyecto",
        cif: "B22222222",
      });

      const response = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({
          client: client._id.toString(),
          name: "Proyecto Test",
          projectCode: "PRJ-001",
          notes: "Proyecto de prueba",
          active: true,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.name).toBe("Proyecto Test");
      expect(response.body.project.projectCode).toBe("PRJ-001");
    });

    it("no debería permitir repetir projectCode en la misma compañía", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      const client = await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Duplicado",
        cif: "B22222223",
      });

      await Project.create({
        user: user._id,
        company: company._id,
        client: client._id,
        name: "Proyecto Existente",
        projectCode: "PRJ-001",
      });

      const response = await request(app)
        .post("/api/project")
        .set("Authorization", `Bearer ${token}`)
        .send({
          client: client._id.toString(),
          name: "Proyecto Nuevo",
          projectCode: "PRJ-001",
        });

      expect(response.statusCode).toBe(409);
    });
  });

  describe("GET /api/project", () => {
    it("debería listar proyectos de la compañía", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      const client = await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Lista",
        cif: "B22222224",
      });

      await Project.create({
        user: user._id,
        company: company._id,
        client: client._id,
        name: "Proyecto Lista",
        projectCode: "PRJ-002",
      });

      const response = await request(app)
        .get("/api/project")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.totalItems).toBe(1);
    });
  });

  describe("DELETE /api/project/:id", () => {
    it("debería archivar un proyecto con soft=true", async () => {
      const { token, company, user } = await createAuthenticatedUser();

      const client = await Client.create({
        user: user._id,
        company: company._id,
        name: "Cliente Archivo",
        cif: "B22222225",
      });

      const project = await Project.create({
        user: user._id,
        company: company._id,
        client: client._id,
        name: "Proyecto Archivado",
        projectCode: "PRJ-003",
      });

      const response = await request(app)
        .delete(`/api/project/${project._id}?soft=true`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      const updatedProject = await Project.findById(project._id);
      expect(updatedProject.deleted).toBe(true);
    });
  });
});