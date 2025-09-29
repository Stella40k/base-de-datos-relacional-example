import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,        // created_at, updated_at
      paranoid: true,          // deleted_at (soft delete)
      underscored: true,       // snake_case en BD
    }
  }
);

// Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la BD establecida');
  } catch (error) {
    console.error('❌ Error conectando a la BD:', error);
  }
};