import { body, param } from 'express-validator';
import { User } from '../models/User.js';

export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 }).withMessage('Username debe tener 3-50 caracteres')
    .custom(async (username) => {
      const user = await User.findOne({ where: { username } });
      if (user) throw new Error('Username ya está en uso');
    }),
  
  body('email')
    .isEmail().withMessage('Email debe ser válido')
    .custom(async (email) => {
      const user = await User.findOne({ where: { email } });
      if (user) throw new Error('Email ya está registrado');
    }),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
];

export const loginValidation = [
  body('username')
    .notEmpty().withMessage('Username es requerido'),
  
  body('password')
    .notEmpty().withMessage('Password es requerido')
];