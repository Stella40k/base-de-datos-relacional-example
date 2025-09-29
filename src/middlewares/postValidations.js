import { body, param } from 'express-validator';
import { Tag } from '../models/Tag.js';

export const createPostValidation = [
  body('title')
    .isLength({ min: 3, max: 200 }).withMessage('Título debe tener 3-200 caracteres'),
  
  body('content')
    .isLength({ min: 10 }).withMessage('Contenido debe tener al menos 10 caracteres'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Estado inválido'),
  
  body('tagIds')
    .optional()
    .isArray().withMessage('tagIds debe ser un array')
    .custom(async (tagIds) => {
      if (tagIds && tagIds.length > 0) {
        const tags = await Tag.findAll({ 
          where: { id: tagIds, is_active: true } 
        });
        if (tags.length !== tagIds.length) {
          throw new Error('Alguna etiqueta no existe o está inactiva');
        }
      }
    })
];