import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { testConnection, sequelize } from './config/database.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import tagRoutes from './routes/tagRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: '🚀 Servidor funcionando correctamente',
    database: 'Conectado a MySQL'
  });
});

// Sincronizar modelos y iniciar servidor
const startServer = async () => {
  await testConnection();
  
  // ⚠️ CUIDADO: force: true solo en desarrollo
  await sequelize.sync({ force: false, alter: true });
  console.log('✅ Modelos sincronizados con la BD');
  
  app.listen(PORT, () => {
    console.log(`🎯 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
  });
};

startServer().catch(console.error);