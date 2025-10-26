import express, { Request, Response } from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { qdrantService } from './services/qdrant.service';

// Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import conversationRoutes from './routes/conversation.routes';
import documentRoutes from './routes/document.routes';
import contractRoutes from './routes/contract.routes';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  })
);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Bienvenue sur l\'API Jure AI - Cabinet d\'Avocat',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      conversations: '/api/conversations',
      documents: '/api/documents',
      contracts: '/api/contracts',
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contracts', contractRoutes);

// Error Handler
app.use(errorHandler);

// WebSocket pour les conversations en temps réel
let wss: WebSocketServer | null = null;

if (env.USE_WS === 'true') {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('✅ Nouvelle connexion WebSocket');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📩 Message reçu:', data);

        // Traiter les messages WebSocket ici
        // Par exemple, pour les conversations en temps réel
        ws.send(
          JSON.stringify({
            type: 'ack',
            message: 'Message reçu',
          })
        );
      } catch (error) {
        console.error('❌ Erreur lors du traitement du message WS:', error);
      }
    });

    ws.on('close', () => {
      console.log('👋 Connexion WebSocket fermée');
    });

    ws.on('error', (error) => {
      console.error('❌ Erreur WebSocket:', error);
    });
  });
}

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initialisation des services...');

    // Initialize Qdrant
    await qdrantService.initialize();

    console.log('✅ Tous les services sont initialisés');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();

    const PORT = parseInt(env.PORT, 10);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🏛️  JURE AI - Cabinet d'Avocat                     ║
║                                                       ║
║   🚀 Serveur démarré avec succès!                    ║
║   📡 Port: ${PORT}                                    ║
║   🌐 URL: http://localhost:${PORT}                   ║
║   ${env.USE_WS === 'true' ? '🔌 WebSocket: activé' : '🔌 WebSocket: désactivé'}                          ║
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
