import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { hashPassword, comparePasswords } from '../helpers/bcryptHelpers.js';

export const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
            name: 'username_unique',
            msg: 'El username ya está en uso'
        },
        validate: {
            len: {
                args: [3, 50],
                msg: 'Username debe tener entre 3 y 50 caracteres'
            },
            notEmpty: {
                msg: 'Username no puede estar vacío'
            },
            isAlphanumeric: {
                msg: 'Username solo puede contener letras y números'
            }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            name: 'email_unique', 
            msg: 'El email ya está registrado'
        },
        validate: {
            isEmail: {
                msg: 'Debe ser un email válido'
            },
            notEmpty: {
                msg: 'Email no puede estar vacío'
            }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: {
                args: [6, 255],
                msg: 'Password debe tener entre 6 y 255 caracteres'
            },
            notEmpty: {
                msg: 'Password no puede estar vacío'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false,
        validate: {
            isIn: {
                args: [['user', 'admin']],
                msg: 'Rol debe ser user o admin'
            }
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            // 🔐 Hashear password antes de crear
            user.password = await hashPassword(user.password);
        },
        beforeUpdate: async (user) => {
            // 🔐 Hashear password solo si cambió
            if (user.changed('password')) {
                user.password = await hashPassword(user.password);
            }
        }
    }
});

// 🔐 Método de instancia para comparar passwords
User.prototype.comparePassword = async function(candidatePassword) {
    return await comparePasswords(candidatePassword, this.password);
};

// 🔐 Método de instancia para generar token
User.prototype.generateAuthToken = function() {
    const { generateToken } = require('../helpers/jwtHelpers.js');
    return generateToken(this);
};

// 🔐 Método para sanitizar datos sensibles del usuario
User.prototype.toSafeJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.deleted_at;
    return values;
};