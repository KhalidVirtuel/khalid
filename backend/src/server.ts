import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import folderRoutes from './routes/folder.routes';
import chatRoutes from './routes/chat.routes';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Bienvenue sur l\'API Jure AI - Cabinet d\'Avocat',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      folders: '/api/folders',
      chat: '/api/chat',
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/chat', chatRoutes);

// Error Handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    const PORT = parseInt(env.PORT, 10);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏛️  JURE AI - Cabinet d'Avocat (Adapté Frontend)  ║
║                                                       ║
║   🚀 Serveur démarré avec succès!                    ║
║   📡 Port: ${PORT}                                    ║
║   🌐 URL: http://localhost:${PORT}                   ║
║                                                       ║
║   📚 Documentation API: http://localhost:${PORT}/     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu, fermeture gracieuse...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT reçu, fermeture gracieuse...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

startServer();
