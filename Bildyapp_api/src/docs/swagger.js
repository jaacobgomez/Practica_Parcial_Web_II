import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "JGR-BildyApp API",
      version: "1.0.0",
      description: "API REST para gestión de usuarios, clientes, proyectos y albaranes en BildyApp",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Mensaje de error",
            },
          },
        },
        Address: {
          type: "object",
          properties: {
            street: { type: "string", example: "Calle Mayor" },
            number: { type: "string", example: "10" },
            postal: { type: "string", example: "28001" },
            city: { type: "string", example: "Madrid" },
            province: { type: "string", example: "Madrid" },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "681f1234567890abcdef1234" },
            email: { type: "string", example: "usuario@test.com" },
            name: { type: "string", example: "Jacob" },
            lastName: { type: "string", example: "Gomez" },
            nif: { type: "string", example: "12345678A" },
            role: { type: "string", enum: ["admin", "guest"] },
            status: { type: "string", enum: ["pending", "verified"] },
            company: { type: "string", example: "681f1234567890abcdef9999" },
          },
        },
        Company: {
          type: "object",
          properties: {
            _id: { type: "string", example: "681f1234567890abcdef9999" },
            name: { type: "string", example: "Bildy Company" },
            cif: { type: "string", example: "B12345678" },
            address: { $ref: "#/components/schemas/Address" },
            logo: { type: "string", example: "https://res.cloudinary.com/demo/logo.png" },
            isFreelance: { type: "boolean", example: false },
          },
        },
        Client: {
          type: "object",
          properties: {
            _id: { type: "string", example: "681f1234567890abcdef2222" },
            name: { type: "string", example: "Cliente Demo" },
            cif: { type: "string", example: "B11111111" },
            email: { type: "string", example: "cliente@demo.com" },
            phone: { type: "string", example: "600123123" },
            address: { $ref: "#/components/schemas/Address" },
            deleted: { type: "boolean", example: false },
          },
        },
        Project: {
          type: "object",
          properties: {
            _id: { type: "string", example: "681f1234567890abcdef3333" },
            client: { type: "string", example: "681f1234567890abcdef2222" },
            name: { type: "string", example: "Reforma Cocina" },
            projectCode: { type: "string", example: "PRJ-001" },
            address: { $ref: "#/components/schemas/Address" },
            email: { type: "string", example: "obra@demo.com" },
            notes: { type: "string", example: "Proyecto inicial" },
            active: { type: "boolean", example: true },
            deleted: { type: "boolean", example: false },
          },
        },
        Worker: {
          type: "object",
          properties: {
            name: { type: "string", example: "Pedro" },
            hours: { type: "number", example: 4 },
          },
        },
        DeliveryNote: {
          type: "object",
          properties: {
            _id: { type: "string", example: "681f1234567890abcdef4444" },
            client: { type: "string", example: "681f1234567890abcdef2222" },
            project: { type: "string", example: "681f1234567890abcdef3333" },
            format: { type: "string", enum: ["material", "hours"] },
            description: { type: "string", example: "Entrega de materiales" },
            workDate: { type: "string", format: "date", example: "2026-05-10" },
            material: { type: "string", example: "Cemento" },
            quantity: { type: "number", example: 20 },
            unit: { type: "string", example: "sacos" },
            hours: { type: "number", example: 8 },
            workers: {
              type: "array",
              items: { $ref: "#/components/schemas/Worker" },
            },
            signed: { type: "boolean", example: false },
            signedAt: { type: "string", nullable: true, example: null },
            signatureUrl: { type: "string", example: "" },
            pdfUrl: { type: "string", example: "" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;