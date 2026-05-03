import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Company from "../../src/models/Company.js";

export async function createAuthenticatedUser() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const user = await User.create({
    email: "testuser@test.com",
    password: hashedPassword,
    name: "Jacob",
    lastName: "Gomez",
    nif: "12345678A",
    role: "admin",
    status: "verified",
    verificationCode: "",
    verificationAttempts: 3,
  });

  const company = await Company.create({
    owner: user._id,
    name: "Empresa Test",
    cif: "B12345678",
    address: {
      street: "Calle Test",
      number: "1",
      postal: "28001",
      city: "Madrid",
      province: "Madrid",
    },
    isFreelance: false,
  });

  user.company = company._id;
  await user.save();

  const loginResponse = await request(app).post("/api/user/login").send({
    email: "testuser@test.com",
    password: "12345678",
  });

  return {
    token: loginResponse.body.accessToken,
    user,
    company,
  };
}