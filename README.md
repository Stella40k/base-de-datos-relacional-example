CONCEPTOS FUNDAMENTALES
1. ¿Qué es un Middleware?
Definición: Función que intercepta las peticiones HTTP entre el cliente y el servidor.

javascript
// Estructura básica de un middleware
const middleware = (req, res, next) => {
    // 1. Lógica de procesamiento
    // 2. Decidir: next() o res.json()
    next(); // Pasa al siguiente middleware
};
Tipos de Middleware:

Autenticación: validateToken - Verifica JWT

Autorización: ownerOrAdmin - Verifica permisos

Validación: validator - Valida datos de entrada

Logging: Registra peticiones

Errores: Manejo centralizado de errores

2. Autenticación vs Autorización
Concepto	¿Qué hace?	Ejemplo
Autenticación	Verifica QUIÉN eres	validateToken
Autorización	Verifica QUÉ puedes hacer	ownerOrAdmin
javascript
// 🔐 Autenticación: ¿Estás logueado?
router.post('/articles', validateToken, createArticle);

// 🛡️ Autorización: ¿Puedes modificar este recurso?
router.put('/articles/:id', validateToken, ownerOrAdmin, updateArticle);
🗄️ BASE DE DATOS - MongoDB vs SQL
MongoDB (NoSQL) - Mongoose
javascript
// Modelo con documentos embebidos
const UserSchema = new Schema({
    username: String,
    profile: { // ✅ Documento embebido
        firstName: String,
        lastName: String
    }
});

// Referencias con populate
const ArticleSchema = new Schema({
    title: String,
    author: { type: ObjectId, ref: 'User' } // ✅ Referencia
});

// Uso: 
await Article.find().populate('author');
SQL (Relacional) - Sequelize
javascript
// Modelo con relaciones
const User = sequelize.define('User', {
    username: DataTypes.STRING
});

const Article = sequelize.define('Article', {
    title: DataTypes.STRING,
    user_id: DataTypes.INTEGER // ✅ Foreign Key
});

// Relaciones
User.hasMany(Article, { foreignKey: 'user_id' });
Article.belongsTo(User, { foreignKey: 'user_id' });

// Uso:
await Article.findAll({ include: User });
🔐 SISTEMA DE AUTENTICACIÓN JWT
Flujo Completo:
text
1. 📝 REGISTRO:
   Usuario → [Valida datos] → [Hash password] → [Crea usuario] → [Genera JWT] → Respuesta

2. 🔐 LOGIN:  
   Credenciales → [Verifica usuario] → [Compara passwords] → [Genera JWT] → Respuesta

3. 🛡️ ACCESO:
   Request + JWT → [Verifica token] → [Busca usuario] → [Agrega a req.user] → Controlador
Implementación:
javascript
// 1. 📝 GENERAR TOKEN
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, // Payload
        process.env.JWT_SECRET,           // Secreto
        { expiresIn: '7d' }              // Expiración
    );
};

// 2. 🔐 VERIFICAR TOKEN  
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Info del usuario disponible
    next();
};

// 3. 🛡️ USO EN RUTAS
router.get('/profile', validateToken, getProfile);
🛡️ SISTEMA DE AUTORIZACIÓN
Middleware ownerOrAdmin - Patrón Factory
javascript
// 🏭 FÁBRICA que crea middlewares específicos
export const ownerOrAdmin = (model) => {
    return async (req, res, next) => {
        const user = req.user;
        const resourceId = req.params.id;

        // ✅ Admin pasa directo
        if (user.role === 'admin') return next();

        // ✅ Verificar si es el dueño
        const resource = await model.findOne({
            _id: resourceId,
            author: user.id
        });

        if (!resource) return res.status(403).json({ msg: 'Sin permisos' });
        
        next();
    };
};

// 🎯 USO - Crea middleware específico para cada modelo
router.put('/articles/:id', validateToken, ownerOrAdmin(ArticleModel), updateArticle);
router.put('/comments/:id', validateToken, ownerOrAdmin(CommentModel), updateComment);
✅ SISTEMA DE VALIDACIONES
Validaciones con Express-Validator
javascript
import { body, validationResult } from 'express-validator';

// 📋 REGLAS de validación
export const createUserValidation = [
    body('email')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
        .matches(/\d/).withMessage('Debe contener un número'),
    
    body('username')
        .isAlphanumeric().withMessage('Solo letras y números')
        .isLength({ min: 3, max: 20 }).withMessage('3-20 caracteres')
];

// 🔧 MIDDLEWARE que verifica resultados
export const validator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// 🛣️ USO en rutas
router.post('/users', createUserValidation, validator, createUser);
🗂️ ESTRUCTURA DE ARCHIVOS RECOMENDADA
text
src/
├── 📁 config/          # Configuraciones
│   └── database.js     # Conexión a BD
├── 📁 models/          # Modelos de datos
│   ├── User.js
│   ├── Article.js
│   └── index.js        # Relaciones
├── 📁 controllers/     # Lógica de negocio
│   ├── authController.js
│   └── articleController.js
├── 📁 middlewares/     # Interceptores
│   ├── auth.js
│   ├── ownerOrAdmin.js
│   └── validator.js
├── 📁 routes/          # Definición de rutas
│   ├── authRoutes.js
│   └── articleRoutes.js
├── 📁 helpers/         # Utilidades
│   ├── jwtHelpers.js
│   └── bcryptHelpers.js
├── 📁 validations/     # Reglas de validación
│   └── userValidations.js
└── app.js              # Aplicación principal
🔄 FLUJO COMPLETO DE UNA PETICIÓN
Ejemplo: Actualizar un artículo
text
1. 📨 CLIENTE → PUT /api/articles/123
   Headers: Authorization: Bearer <jwt>
   Body: { title: "Nuevo título" }

2. 🛣️ EXPRESS ROUTES
   → validateToken (verifica JWT)
   → ownerOrAdmin(ArticleModel) (verifica permisos)
   → updateArticle (ejecuta lógica)

3. 🗄️ BASE DE DATOS
   → Busca artículo con id=123 y author=user.id
   → Actualiza título
   → Retorna artículo actualizado

4. 📤 RESPUESTA
   → 200 OK { ok: true, data: article }
🎯 PATRONES DE DISEÑO IMPORTANTES
1. Factory Pattern (ownerOrAdmin)
javascript
// 🏭 Fabrica middlewares dinámicamente
const createMiddleware = (config) => {
    return (req, res, next) => {
        // Lógica usando config
        next();
    };
};

// Uso: 
const middleware = createMiddleware({ option: true });
2. MVC (Model-View-Controller)
Model: Datos y lógica de BD (models/)

View: Respuestas JSON (controladores)

Controller: Lógica de negocio (controllers/)

3. Middleware Chain
javascript
app.use(middleware1);
app.use(middleware2);
router.get('/ruta', middleware3, middleware4, controlador);
⚠️ MANEJO DE ERRORES
Errores HTTP Comunes:
Código	Significado	Cuándo usarlo
400	Bad Request	Validaciones fallidas
401	Unauthorized	No autenticado
403	Forbidden	Sin permisos
404	Not Found	Recurso no existe
500	Internal Error	Error del servidor
Estructura de respuesta de error:
javascript
{
    ok: false,
    msg: "Descripción del error",
    errors: [ // Solo en validaciones
        { field: "email", message: "No válido" }
    ]
}
🔐 SEGURIDAD - BUENAS PRÁCTICAS
1. Passwords:
✅ Usar bcrypt para hashing

✅ Mínimo 6 caracteres

✅ No almacenar en texto plano

✅ Excluir de respuestas JSON

2. JWT:
✅ Usar secret fuerte en .env

✅ Establecer expiración

✅ Validar en cada petición protegida

✅ No almacenar data sensible en el payload

3. Validaciones:
✅ Validar en frontend y backend

✅ Sanitizar datos de entrada

✅ Usar express-validator

✅ Validar tipos de datos

💡 PREGUNTAS TÍPICAS DE EXAMEN
1. "¿Cómo proteges una ruta para que solo el dueño pueda modificar?"
javascript
// ✅ RESPUESTA CORRECTA:
router.put('/resource/:id', 
    validateToken,           // 1. ¿Está logueado?
    ownerOrAdmin(Model),     // 2. ¿Es dueño o admin?
    updateController         // 3. Ejecutar acción
);
2. "¿Cuál es la diferencia entre populate y include?"
populate() → MongoDB (Mongoose) - Trae documentos referenciados

include → SQL (Sequelize) - Hace JOIN con tablas relacionadas

3. "¿Cómo manejas passwords de forma segura?"
javascript
// 1. Hash con bcrypt antes de guardar
const hashedPassword = await bcrypt.hash(password, 10);

// 2. Comparar con compare
const isValid = await bcrypt.compare(inputPassword, storedHash);

// 3. Excluir de respuestas
user.select('-password');
4. "¿Qué es un JWT y cómo funciona?"
Es un token que contiene información del usuario. Tiene 3 partes:

Header: Metadatos

Payload: Datos del usuario (id, role)

Signature: Firma digital para verificar

🚀 COMANDOS Y CONFIGURACIÓN RÁPIDA
Package.json básico:
json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",      // MongoDB
    "sequelize": "^6.0.0",     // SQL
    "bcrypt": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "express-validator": "^7.0.0",
    "cors": "^2.8.0",
    "dotenv": "^16.0.0"
  }
}
Variables de entorno (.env):
env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mi-db
JWT_SECRET=mi_secreto_super_seguro
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=mi_db_relacional
📖 GLOSARIO DE TÉRMINOS
Término	Significado
Middleware	Función que intercepta peticiones
JWT	Token de autenticación stateless
ORM/ODM	Mapeo entre objetos y base de datos
Populate	Traer datos relacionados (MongoDB)
Include	Traer datos relacionados (SQL)
Hook	Función que se ejecuta antes/después de una operación
Factory	Patrón que crea objetos dinámicamente
Soft Delete	Eliminación lógica (no física)
✅ CHECKLIST PARA EL EXAMEN
Entiendo middlewares y su flujo de ejecución

Sé proteger rutas con autenticación y autorización

Puedo implementar JWT para login/registro

Manejo validaciones con express-validator

Comprendo relaciones en MongoDB y SQL

Sé usar el patrón Factory para middlewares reutilizables

Puedo estructurar un proyecto de forma organizada

Manejo errores HTTP apropiadamente

Sé hashear passwords con bcrypt

Comprendo la diferencia entre auth y authorization