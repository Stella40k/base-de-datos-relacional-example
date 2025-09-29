import jwt from 'jsonwebtoken';

/**
 * 📝 Genera un token JWT para un usuario
 * @param {Object} user - Objeto del usuario
 * @param {number} user.id - ID del usuario
 * @param {string} user.username - Username del usuario  
 * @param {string} user.role - Rol del usuario (user/admin)
 * @returns {string} Token JWT
 */
export const generateToken = (user) => {
    try {
        const token = jwt.sign(
            {
                id: user.id,           // ✅ En SQL usamos 'id' (no '_id' como en MongoDB)
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d', // ⏰ 7 días por defecto
                issuer: 'blog-api',     // 🔧 Quién emite el token
                subject: user.id.toString() // 🔧 Para quién es el token
            }
        );
        return token;
    } catch (error) {
        console.error('❌ Error generando token:', error);
        throw new Error('Error al generar el token de autenticación');
    }
};

/**
 * 📝 Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado del token
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('❌ Error verificando token:', error);
        
        // 🎯 Mensajes específicos según el tipo de error
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido. Formato incorrecto.');
        } else {
            throw new Error('Token inválido o corrupto.');
        }
    }
};

/**
 * 📝 Extrae el token de diferentes fuentes (header, cookie, query)
 * @param {Object} req - Objeto request de Express
 * @returns {string|null} Token encontrado o null
 */
export const extractTokenFromRequest = (req) => {
    // 1. 🍪 De cookies
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    
    // 2. 📨 De headers Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7); // Remueve "Bearer "
    }
    
    // 3. 🔗 De query string ?token=...
    if (req.query && req.query.token) {
        return req.query.token;
    }
    
    // 4. 📝 De body (menos común, pero por si acaso)
    if (req.body && req.body.token) {
        return req.body.token;
    }
    
    return null;
};

/**
 * 📝 Genera un token de refresco (para renovación de sesión)
 * @param {Object} user - Objeto del usuario
 * @returns {string} Token de refresco
 */
export const generateRefreshToken = (user) => {
    try {
        const refreshToken = jwt.sign(
            {
                id: user.id,
                type: 'refresh' // 🔧 Tipo diferente para identificar
            },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
            {
                expiresIn: '30d', // ⏰ 30 días para refresh token
                issuer: 'blog-api'
            }
        );
        return refreshToken;
    } catch (error) {
        console.error('❌ Error generando refresh token:', error);
        throw new Error('Error al generar token de refresco');
    }
};