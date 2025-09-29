import bcrypt from 'bcrypt';

/**
 * 📝 Hashea una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @param {number} saltRounds - Número de rondas de salt (default: 10)
 * @returns {Promise<string>} Contraseña hasheada
 */
export const hashPassword = async (password, saltRounds = 10) => {
    try {
        // 🎯 Validaciones de seguridad de la contraseña
        if (!password || typeof password !== 'string') {
            throw new Error('La contraseña debe ser una cadena de texto válida');
        }
        
        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('❌ Error hasheando contraseña:', error);
        
        // 🎯 Mensajes específicos según el error
        if (error.message.includes('cadena de texto')) {
            throw new Error('Formato de contraseña inválido');
        } else if (error.message.includes('6 caracteres')) {
            throw new Error('La contraseña es demasiado corta');
        } else {
            throw new Error('Error al procesar la contraseña');
        }
    }
};

/**
 * 📝 Compara una contraseña en texto plano con un hash
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {Promise<boolean>} True si coinciden, false si no
 */
export const comparePasswords = async (plainPassword, hashedPassword) => {
    try {
        // 🎯 Validaciones básicas
        if (!plainPassword || !hashedPassword) {
            throw new Error('Ambas contraseñas son requeridas para la comparación');
        }
        
        if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
            throw new Error('Las contraseñas deben ser cadenas de texto');
        }
        
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('❌ Error comparando contraseñas:', error);
        throw new Error('Error al verificar la contraseña');
    }
};

/**
 * 📝 Verifica la fortaleza de una contraseña
 * @param {string} password - Contraseña a verificar
 * @returns {Object} Resultado de la verificación
 */
export const checkPasswordStrength = (password) => {
    const checks = {
        length: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'débil';
    
    if (score >= 4) strength = 'fuerte';
    else if (score >= 3) strength = 'media';
    
    return {
        isValid: password.length >= 6, // Mínimo requerido
        strength: strength,
        score: score,
        checks: checks
    };
};

/**
 * 📝 Genera una contraseña aleatoria segura
 * @param {number} length - Longitud de la contraseña (default: 12)
 * @returns {string} Contraseña generada
 */
export const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // 🔒 Asegurar que tenga al menos un carácter de cada tipo
    password += 'A'; // Mayúscula
    password += 'a'; // Minúscula  
    password += '1'; // Número
    password += '!'; // Especial
    
    // Completar con caracteres aleatorios
    for (let i = 4; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // 🔀 Mezclar los caracteres
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};