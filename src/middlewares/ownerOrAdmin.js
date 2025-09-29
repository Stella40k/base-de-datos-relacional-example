export const ownerOrAdmin = (model, ownerField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      // Shortcut para admin
      if (user.role === 'admin') {
        return next();
      }

      // Buscar recurso y verificar propiedad
      const resource = await model.findOne({
        where: {
          id,
          [ownerField]: user.id,
          is_active: true
        }
      });

      if (!resource) {
        return res.status(403).json({
          ok: false,
          msg: 'No tienes permisos para modificar este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Error en ownerOrAdmin:', error);
      return res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
      });
    }
  };
};