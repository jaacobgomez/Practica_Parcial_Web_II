# JGR-BildyApp

**Programación Web II – Práctica Final Backend**.

## Idea general

Este proyecto consiste en desarrollar una **API REST con Node.js, Express y MongoDB** para la gestión de albaranes de obra en BildyApp.

La aplicación permite:

1. Gestionar usuarios y autenticación.
2. Gestionar compañías.
3. Gestionar clientes.
4. Gestionar proyectos.
5. Gestionar albaranes.
6. Firmar albaranes y generar PDFs.
7. Documentar la API con Swagger.
8. Ejecutar tests de integración.
9. Emitir eventos en tiempo real con Socket.IO.
10. Preparar el proyecto para Docker y GitHub Actions.

---

## Organización del código
```bash

src/
├── config/
│   ├── cloudinary.js            # Configuración de Cloudinary
│   └── index.js                 # Variables de entorno y configuración general
│
├── controllers/
│   ├── user.controller.js           # Lógica de usuarios y autenticación
│   ├── client.controller.js         # Lógica del módulo de clientes
│   ├── project.controller.js        # Lógica del módulo de proyectos
│   └── deliverynote.controller.js   # Lógica del módulo de albaranes
│
├── docs/
│   └── swagger.js               # Configuración Swagger / OpenAPI
│
├── middleware/
│   ├── auth.middleware.js       # Verificación del JWT
│   ├── error-handler.js         # Middleware global de errores
│   ├── role.middleware.js       # Comprobación de roles
│   ├── upload.js                # Multer en disco
│   ├── upload_memory.js         # Multer en memoria
│   └── validate.js              # Validación con Zod
│
├── models/
│   ├── User.js                  # Modelo de usuario
│   ├── Company.js               # Modelo de compañía
│   ├── Client.js                # Modelo de cliente
│   ├── Project.js               # Modelo de proyecto
│   └── DeliveryNote.js          # Modelo de albarán
│
├── routes/
│   ├── user.routes.js           # Rutas del módulo user
│   ├── client.routes.js         # Rutas del módulo client
│   ├── project.routes.js        # Rutas del módulo project
│   └── deliverynote.routes.js   # Rutas del módulo deliverynote
│
├── services/
│   ├── notification.service.js  # EventEmitter de usuarios
│   ├── cloudinary.service.js    # Subida de archivos a Cloudinary
│   ├── socket.service.js        # Gestión de la instancia de Socket.IO
│   └── slack.service.js         # Notificaciones de errores a Slack
│
├── utils/
│   └── AppError.js              # Clase de error personalizada
│
├── validators/
│   ├── user.validator.js            # Schemas Zod de usuario
│   ├── client.validator.js          # Schemas Zod de cliente
│   ├── project.validator.js         # Schemas Zod de proyecto
│   └── deliverynote.validator.js    # Schemas Zod de albarán
│
├── app.js                       # Configuración principal de Express
└── index.js                     # Arranque del servidor + MongoDB + Socket.IO

tests/
├── auth.test.js
├── client.test.js
├── project.test.js
├── deliverynote.test.js
├── setup.js
└── helpers/
    └── auth.helper.js

uploads/                         # Archivos subidos en local
prueba.http                      # Pruebas manuales con REST Client
docker-compose.yml               # Configuración Docker Compose
Dockerfile                       # Imagen Docker del proyecto
.env.example                     # Variables de entorno de ejemplo
JGR_FINAL_README.md              # Documentación del proyecto

```

## Tecnologías usadas

- Node.js
- Express 5
- MongoDB Atlas
- Mongoose
- Zod
- JWT
- bcryptjs
- Multer
- Cloudinary
- PDFKit
- Swagger
- Jest
- Supertest
- mongodb-memory-server
- Socket.IO
- Helmet
- express-rate-limit


## Modelos principales

### User

Contiene la información del usuario y la autenticación:

- email
- password
- name
- lastName
- nif
- role
- status
- company
- refreshToken


### Company

Representa la compañía del usuario:

- owner
- name
- cif
- address
- logo
- isFreelance


### Client

Representa un cliente de una compañía:

- company
- name
- cif
- email
- phone
- address
- deleted


### Project

Representa un proyecto asociado a un cliente:

- company
- client
- name
- projectCode
- address
- email
- notes
- active
- deleted


### DeliveryNote

Representa un albarán:

- user
- company
- client
- project
- format
- description
- workDate
- datos de material u horas
- signed
- signatureUrl
- pdfUrl


## Autenticación

La autenticación se basa en:

- Access token de corta duración
- Refresh token de larga duración

Las rutas protegidas usan middleware JWT y control de roles.

## Funcionalidades implementadas

### Usuarios

- Registro
- Validación de email
- Login
- Refresh
- Logout
- Cambio de contraseña
- Invitación de usuarios
- Eliminación lógica y definitiva

### Compañías

- Crear o unirse a compañía
- Gestión de autónomos
- Subida de logo

### Clientes

- Crear
- Listar
- Obtener por ID
- Actualizar
- Archivar
- Restaurar
- Borrado definitivo

### Proyectos

- Crear
- Listar
- Obtener por ID
- Actualizar
- Archivar
- Restaurar
- Borrado definitivo

### Albaranes

- Crear albaranes de material y horas
- Listar con filtros
- Obtener por ID con populate
- Firmar albaranes
- Generar PDF
- Consultar PDF
- Bloquear borrado si está firmado

## Eventos y tiempo real

### EventEmitter

Se usan eventos para el ciclo de vida del usuario:

- `user:registered`
- `user:verified`
- `user:invited`
- `user:deleted`

### Socket.IO

Se emiten eventos en tiempo real:

- `deliverynote:created`
- `deliverynote:signed`

## Seguridad

Se han añadido medidas como:

- `helmet()`
- `express-rate-limit`
- Contraseñas cifradas con `bcryptjs`
- JWT para autenticación
- Middleware de roles

## Subida de archivos y PDF

El proyecto usa:

- Multer para archivos
- Cloudinary para almacenar imágenes y firmas
- PDFKit para generar PDFs de albaranes

## Documentación Swagger

La API incluye documentación Swagger en:

```text
/api-docs
```

## Testing

Se han implementado tests de integración con:

- Jest
- Supertest
- mongodb-memory-server

Comandos:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Docker y CI

El proyecto incluye:

- `Dockerfile`
- `docker-compose.yml`
- GitHub Actions en `.github/workflows/ci.yml`



## Variables de entorno

El proyecto necesita un archivo `.env` basado en `.env.example`:

```env
PORT=3000
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BASE_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SLACK_WEBHOOK_URL=
```

## Endpoints principales

### Usuario / auth

- `POST /api/user/register`
- `PUT /api/user/validation`
- `POST /api/user/login`
- `POST /api/user/refresh`
- `POST /api/user/logout`
- `PUT /api/user/password`
- `DELETE /api/user`
- `POST /api/user/invite`

### Company

- `PATCH /api/user/company`
- `PATCH /api/user/logo`

### Client

- `POST /api/client`
- `GET /api/client`
- `GET /api/client/:id`
- `PUT /api/client/:id`
- `DELETE /api/client/:id`
- `GET /api/client/archived`
- `PATCH /api/client/:id/restore`

### Project

- `POST /api/project`
- `GET /api/project`
- `GET /api/project/:id`
- `PUT /api/project/:id`
- `DELETE /api/project/:id`
- `GET /api/project/archived`
- `PATCH /api/project/:id/restore`

### DeliveryNote

- `POST /api/deliverynote`
- `GET /api/deliverynote`
- `GET /api/deliverynote/:id`
- `DELETE /api/deliverynote/:id`
- `PATCH /api/deliverynote/:id/sign`
- `GET /api/deliverynote/pdf/:id`

---

## Pruebas manuales

Las pruebas manuales se han realizado con el archivo:

```txt
prueba.http
```

## Notas finales

- La API sigue estructura MVC
- La validación se hace con Zod
- Los errores se centralizan con `AppError` y `error-handler`
- La documentación está en `/api-docs`
- El proyecto queda preparado para desarrollo, testing y despliegue