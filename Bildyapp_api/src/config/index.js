const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
};

export default config;