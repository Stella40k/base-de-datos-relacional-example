/**
 * 📝 Formatea respuestas exitosas de manera consistente
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos a enviar
 * @param {string} message - Mensaje descriptivo
 * @param {number} statusCode - Código HTTP (default: 200)
 */
export const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
    return res.status(statusCode).json({
        ok: true,
        message: message,
        data: data,
        timestamp: new Date().toISOString()
    });
};

/**
 * 📝 Formatea respuestas de error de manera consistente
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP (default: 500)
 * @param {*} details - Detalles adicionales del error
 */
export const errorResponse = (res, message = 'Error interno del servidor', statusCode = 500, details = null) => {
    const response = {
        ok: false,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // 🎯 Solo incluir detalles en desarrollo
    if (process.env.NODE_ENV === 'development' && details) {
        response.details = details;
    }
    
    return res.status(statusCode).json(response);
};

/**
 * 📝 Formatea respuestas de validación fallida
 * @param {Object} res - Objeto response de Express
 * @param {Array} errors - Array de errores de validación
 */
export const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        ok: false,
        message: 'Errores de validación',
        errors: errors.map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        })),
        timestamp: new Date().toISOString()
    });
};