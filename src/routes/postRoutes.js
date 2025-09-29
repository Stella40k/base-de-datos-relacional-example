import { Router } from 'express';
import { 
  createPost, 
  getPosts, 
  getPost, 
  updatePost, 
  deletePost 
} from '../controllers/postController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { ownerOrAdmin } from '../middlewares/ownerOrAdmin.js';
import { handleValidationErrors } from '../middlewares/validator.js';
import { createPostValidation } from '../validations/postValidations.js';
import { Post } from '../models/Post.js';

const router = Router();

// Públicas
router.get('/', getPosts);
router.get('/:id', getPost);

// Protegidas
router.post('/', 
  authenticateToken, 
  createPostValidation, 
  handleValidationErrors, 
  createPost
);

router.put('/:id', 
  authenticateToken, 
  ownerOrAdmin(Post), 
  updatePost
);

router.delete('/:id', 
  authenticateToken, 
  ownerOrAdmin(Post), 
  deletePost
);

export default router;