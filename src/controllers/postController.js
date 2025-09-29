import { Post, User, Tag, Comment } from '../models/index.js';

export const createPost = async (req, res) => {
  try {
    const { title, content, status, tagIds } = req.body;
    
    const post = await Post.create({
      title,
      content,
      status,
      user_id: req.user.id
    });

    // Asociar tags si se proporcionaron
    if (tagIds && tagIds.length > 0) {
      await post.setTags(tagIds);
    }

    // Recargar con relaciones
    const postWithDetails = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });

    res.status(201).json({
      ok: true,
      msg: 'Post creado exitosamente',
      data: postWithDetails
    });
  } catch (error) {
    console.error('Error creando post:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor'
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { is_active: true },
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'username'],
          where: { is_active: true },
          required: false
        },
        { 
          model: Tag, 
          as: 'tags', 
          through: { attributes: [] },
          where: { is_active: true },
          required: false
        },
        {
          model: Comment,
          as: 'comments',
          where: { is_active: true },
          required: false,
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username'],
            where: { is_active: true },
            required: false
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      ok: true,
      data: posts
    });
  } catch (error) {
    console.error('Error obteniendo posts:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor'
    });
  }
};

// ⚠️ ELIMINACIÓN LÓGICA (SOFT DELETE)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        ok: false,
        msg: 'Post no encontrado'
      });
    }

    // Soft delete
    await post.update({ is_active: false });
    
    // Los comentarios se eliminan en cascada (lógicamente)
    await Comment.update(
      { is_active: false },
      { where: { post_id: post.id } }
    );

    res.json({
      ok: true,
      msg: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error interno del servidor'
    });
  }
};