import { verifyToken, extractTokenFromRequest } from '../helpers/jwtHelpers.js';
import { User } from '../models/User.js';
import { errorResponse } from '../helpers/responseHelpers.js';

export const authenticateToken = async (req, res, next) => {
    try {
        // 📨 Extraer token de la request
        const token = extractTokenFromRequest(req);
        
        if (!token) {
            return errorResponse(res, 'Token de autenticación requerido', 401);
        }

        // 🔐 Verificar y decodificar token
        const decoded = verifyToken(token);

        // 🔍 Buscar usuario en la base de datos
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] } // 🚫 Excluir password
        });

        if (!user || !user.is_active) {
            return errorResponse(res, 'Usuario no válido o inactivo', 401);
        }

        // ✅ Usuario autenticado - agregar a la request
        req.user = user;
        next();

    } catch (error) {
        console.error('❌ Error en autenticación:', error.message);
        return errorResponse(res, error.message, 401);
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return errorResponse(res, 'Usuario no autenticado', 401);
    }

    if (req.user.role !== 'admin') {
        return errorResponse(res, 'Se requieren permisos de administrador', 403);
    }

    next();
};