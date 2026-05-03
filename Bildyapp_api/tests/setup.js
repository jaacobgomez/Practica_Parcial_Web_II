import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "test-access-secret-super-seguro-123456789";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh-secret-super-seguro-123456789";
process.env.JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN || "15m";
process.env.JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || "7d";
process.env.BASE_URL =
  process.env.BASE_URL || "http://localhost:3000";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});