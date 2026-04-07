# 🧾 JGR-Bilyapp

**Programación Web II Practica Parcial - Backend**.

## Idea general

Este proyecto consiste en desarrollar una **API REST con Node.js, Express y MongoDB** para la gestión de usuarios de BildyApp.

La aplicación permite:

1. Registrar usuarios.
2. Validar su email mediante un código de verificación.
3. Iniciar sesión con JWT.
4. Completar datos personales.
5. Crear o unirse a una compañía.
6. Subir el logo de la compañía.
7. Gestionar sesión con access token y refresh token.
8. Cambiar contraseña.
9. Eliminar usuarios con borrado lógico o definitivo.
10. Invitar compañeros a la misma compañía.

---

## Organización del código

```text
src/
├── config/
│   └── index.js                 # Variables de entorno y configuración general
│
├── controllers/
│   └── user.controller.js       # Lógica de usuarios y autenticación
│
├── middleware/
│   ├── auth.middleware.js       # Verificación del JWT
│   ├── error-handler.js         # Middleware global de errores
│   ├── role.middleware.js       # Comprobación de roles
│   ├── upload.js                # Configuración de Multer
│   └── validate.js              # Validación con Zod
│
├── models/
│   ├── Company.js               # Modelo de compañía
│   └── User.js                  # Modelo de usuario
│
├── routes/
│   └── user.routes.js           # Rutas del módulo user
│
├── services/
│   └── notification.service.js  # EventEmitter para eventos del usuario
│
├── utils/
│   └── AppError.js              # Clase de error personalizada
│
├── validators/
│   └── user.validator.js        # Schemas Zod
│
├── app.js                       # Configuración principal de Express
└── index.js                     # Arranque del servidor y conexión a MongoDB

uploads/                         # Carpeta de logos subidos
prueba.http                      # Archivo para probar endpoints con REST Client
.env                             # Variables de entorno de ejemplo
JGR_README.md                    # Documentación del proyecto
```

## 📦 Tecnologías usadas

- Node.js  
- Express  
- MongoDB Atlas  
- Mongoose  
- Zod  
- jsonwebtoken  
- bcryptjs  
- Multer  
- Helmet  
- express-rate-limit  

---

## 🧩 Modelos principales

### 👤 User

El modelo **User** contiene la información del usuario:

- email  
- password  
- name  
- lastName  
- nif  
- role (admin o guest)  
- status (pending o verified)  
- verificationCode  
- verificationAttempts  
- company  
- address  
- deleted  
- refreshToken  

Además:

- tiene índices en los campos más consultados  
- incluye el virtual `fullName`  

---

### 🏢 Company

El modelo **Company** contiene:

- owner  
- name  
- cif  
- address  
- logo  
- isFreelance  
- deleted  

---

## 🔐 Autenticación

La autenticación se basa en:

- access token de corta duración  
- refresh token de larga duración  

Cuando un usuario se registra o hace login:

- recibe ambos tokens  
- el refresh token se guarda en base de datos  

Las rutas protegidas usan middleware de autenticación con JWT.

---

## ⚙️ Funcionalidades implementadas

### 📝 Registro y validación

- Registro de usuario  
- Generación de código de verificación  
- Validación del email con código  

### 🔑 Login y sesión

- Login de usuario  
- Refresh de access token  
- Logout  

### 👤 Perfil de usuario

- Actualización de datos personales  
- Cambio de contraseña  
- Obtener usuario autenticado con `populate`  

### 🏢 Compañías

- Crear compañía si el CIF no existe  
- Unirse a compañía existente si el CIF ya está registrado  
- Gestión de autónomo con `isFreelance`  
- Subida de logo de compañía  

### 👥 Gestión de usuarios

- Invitar compañeros  
- Borrado lógico  
- Borrado definitivo  

---

## 🔔 Eventos

Se ha implementado un servicio con **EventEmitter** para lanzar eventos del ciclo de vida del usuario:

- `user:registered`  
- `user:verified`  
- `user:invited`  
- `user:deleted`  

De momento estos eventos se muestran por consola.

---

## 🛡️ Seguridad

En `app.js` se han añadido medidas de seguridad como:

- `helmet()` para cabeceras HTTP seguras  
- `express-rate-limit` para limitar peticiones  

`express-mongo-sanitize` se probó, pero dio conflicto con la versión actual usada en el proyecto, así que quedó desactivado para no romper el funcionamiento general.

## ⚙️ Variables de entorno

El proyecto necesita un archivo `.env` basado en `.env.example`:

```text
PORT=3000
MONGODB_URI=mongodb+srv://jacob:bildyapp12345@cluster0.yyll1iu.mongodb.net/bildyapp?retryWrites=true&w=majority&appName=Cluster0
JWT_ACCESS_SECRET=39d62bb57a5a7439271a7d3f8bc23267c77ccd7f1baecf8b84fd300f8e6fd876
JWT_REFRESH_SECRET=2179c6ff064bedd91c2bbb95fb528e5b05e4c2fd422233e055bc62d7f8bb8240
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BASE_URL=http://localhost:3000
```

## 📦 Instalación

npm install

## ▶️ Ejecución

npm run dev

## 🌐 Endpoints principales

### 🔐 Auth / usuario

- POST /api/user/register
- PUT /api/user/validation
- POST /api/user/login
- POST /api/user/refresh
- POST /api/user/logout

### 👤 Perfil

- PUT /api/user/register
- PUT /api/user/password
- GET /api/user

### 🏢 Company

- PATCH /api/user/company
- PATCH /api/user/logo

### 👥 Gestión

- DELETE /api/user
- POST /api/user/invite

## 🧪 Pruebas

Las pruebas de los endpoints se han realizado con REST Client mediante el archivo ```text prueba.http ```

En ese archivo se incluyen ejemplos de:

- registro
- login
- validación
- onboarding
- compañía
- refresh
- logout
- cambio de contraseña
- borrado
- invitaciones
- subida de logo

## 📝 Notas finales

- Los logos subidos se guardan en la carpeta uploads/  
- La base de datos usada es MongoDB Atlas  
- La API sigue una estructura MVC  
- La validación de datos se hace con Zod  
- El manejo de errores se centraliza con AppError y error-handler  