import { User } from '../models/User.js';
import { generateToken, extractTokenFromRequest } from '../helpers/jwtHelpers.js';
import { successResponse, errorResponse } from '../helpers/responseHelpers.js';

export const register = async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;

        // 🎯 Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return errorResponse(
                res, 
                'El email o username ya están registrados', 
                400
            );
        }

        // 🔐 Crear usuario (el hook se encarga de hashear el password)
        const user = await User.create({
            username,
            email,
            password, // Se hashea automáticamente en el hook
            role
        });

        // 🎯 Generar token JWT
        const token = generateToken(user);

        // 📝 Preparar respuesta sin datos sensibles
        const userResponse = user.toSafeJSON();

        return successResponse(
            res,
            {
                user: userResponse,
                token: token
            },
            'Usuario registrado exitosamente',
            201
        );

    } catch (error) {
        console.error('❌ Error en registro:', error);
        return errorResponse(
            res,
            'Error al registrar usuario',
            500,
            process.env.NODE_ENV === 'development' ? error.message : null
        );
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔍 Buscar usuario incluyendo el password (normalmente excluido)
        const user = await User.findOne({
            where: { 
                email,
                is_active: true 
            }
        });

        if (!user) {
            return errorResponse(res, 'Credenciales inválidas', 401);
        }

        // 🔐 Verificar contraseña usando el método del modelo
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResponse(res, 'Credenciales inválidas', 401);
        }

        // ⏰ Actualizar último login
        await user.update({ last_login: new Date() });

        // 🎯 Generar token JWT
        const token = generateToken(user);

        // 🍪 Opcional: Setear cookie (si usas cookies)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            sameSite: 'strict'
        });

        return successResponse(
            res,
            {
                user: user.toSafeJSON(),
                token: token
            },
            'Login exitoso'
        );

    } catch (error) {
        console.error('❌ Error en login:', error);
        return errorResponse(res, 'Error en el proceso de login', 500);
    }
};

export const getProfile = async (req, res) => {
    try {
        // 🎯 req.user viene del middleware de autenticación
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'deleted_at'] }
        });

        if (!user) {
            return errorResponse(res, 'Usuario no encontrado', 404);
        }

        return successResponse(
            res,
            { user: user.toSafeJSON() },
            'Perfil obtenido exitosamente'
        );

    } catch (error) {
        console.error('❌ Error obteniendo perfil:', error);
        return errorResponse(res, 'Error al obtener el perfil', 500);
    }
};

export const logout = async (req, res) => {
    try {
        // 🍪 Limpiar cookie si existe
        res.clearCookie('token');
        
        return successResponse(
            res,
            null,
            'Logout exitoso'
        );

    } catch (error) {
        console.error('❌ Error en logout:', error);
        return errorResponse(res, 'Error al cerrar sesión', 500);
    }
};