import { User } from './User.js';
import { Post } from './Post.js';
import { Comment } from './Comment.js';
import { Tag } from './Tag.js';

// 🔗 RELACIÓN 1:N - User → Posts
User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts'
});
Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// 🔗 RELACIÓN 1:N - Post → Comments
Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments',
  onDelete: 'CASCADE' // ⚠️ Eliminación en cascada
});
Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

// 🔗 RELACIÓN 1:N - User → Comments
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// 🔗 RELACIÓN N:M - Posts ↔ Tags (a través de Post_Tags)
Post.belongsToMany(Tag, {
  through: 'post_tags',
  foreignKey: 'post_id',
  otherKey: 'tag_id',
  as: 'tags',
  onDelete: 'CASCADE'
});
Tag.belongsToMany(Post, {
  through: 'post_tags',
  foreignKey: 'tag_id',
  otherKey: 'post_id',
  as: 'posts',
  onDelete: 'CASCADE'
});

export {
  User,
  Post,
  Comment,
  Tag
};