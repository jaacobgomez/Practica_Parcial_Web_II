import request from "supertest";
import app from "../src/app.js";
import { createAuthenticatedUser } from "./helpers/auth.helper.js";

describe("Auth smoke tests", () => {
  it("debería obtener token válido", async () => {
    const { token } = await createAuthenticatedUser();
    expect(token).toBeDefined();
  });

  it("debería acceder a /api/user con token válido", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });
});