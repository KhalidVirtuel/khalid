import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { qdrantService } from '../services/qdrant.service';
import { documentService } from '../services/document.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configuration Multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/knowledge');
    documentService.ensureUploadDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  },
});

class KnowledgeController {
  // Upload et indexer un document dans la base de connaissance
  async uploadDocument(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const { title, description, category } = req.body;

      // Extraire le texte du document
      const text = await documentService.extractTextFromFile(
        file.path,
        file.mimetype
      );

      if (!text || text.trim().length === 0) {
        documentService.deleteFile(file.path);
        return res.status(400).json({ error: 'Impossible d\'extraire le texte du document' });
      }

      // Créer l'entrée dans la base de données
      const knowledgeDoc = await prisma.knowledgeDocument.create({
        data: {
          id: uuidv4(),
          userId,
          title: title || file.originalname,
          description: description || '',
          category: category || 'general',
          filename: file.filename,
          originalName: file.originalname,
          filepath: file.path,
          mimetype: file.mimetype,
          size: file.size,
          textContent: text.substring(0, 50000), // Limiter la taille dans la DB
        },
      });

      // Indexer dans Qdrant
      await qdrantService.indexDocument(knowledgeDoc.id, text, {
        filename: file.originalname,
        userId,
        documentType: category || 'general',
      });

      res.status(201).json({
        message: 'Document ajouté à la base de connaissance',
        document: {
          id: knowledgeDoc.id,
          title: knowledgeDoc.title,
          description: knowledgeDoc.description,
          category: knowledgeDoc.category,
          originalName: knowledgeDoc.originalName,
          size: knowledgeDoc.size,
          createdAt: knowledgeDoc.createdAt,
        },
      });
    } catch (error: any) {
      console.error('❌ Erreur upload document:', error);
      if (req.file) {
        documentService.deleteFile(req.file.path);
      }
      res.status(500).json({ error: error.message || 'Erreur lors de l\'upload' });
    }
  }

  // Rechercher dans la base de connaissance
  async search(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { query, limit = 5, category } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Query requise' });
      }

      // Construire le filtre
      const filter: any = {
        must: [{ key: 'userId', match: { value: userId } }],
      };

      if (category) {
        filter.must.push({ key: 'documentType', match: { value: category } });
      }

      // Rechercher dans Qdrant
      const results = await qdrantService.search(query, parseInt(limit as string), filter);

      res.json({
        query,
        results: results.map((r) => ({
          id: r.id,
          score: r.score,
          text: r.payload?.text,
          documentId: r.payload?.documentId,
          filename: r.payload?.filename,
          chunkIndex: r.payload?.chunkIndex,
        })),
      });
    } catch (error: any) {
      console.error('❌ Erreur recherche:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la recherche' });
    }
  }

  // Lister tous les documents de la base de connaissance
  async listDocuments(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { category } = req.query;

      const where: any = { userId };
      if (category) {
        where.category = category;
      }

      const documents = await prisma.knowledgeDocument.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          originalName: true,
          size: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ documents });
    } catch (error: any) {
      console.error('❌ Erreur liste documents:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération' });
    }
  }

  // Supprimer un document de la base de connaissance
  async deleteDocument(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const document = await prisma.knowledgeDocument.findFirst({
        where: { id, userId },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document non trouvé' });
      }

      // Supprimer de Qdrant
      await qdrantService.deleteDocument(id);

      // Supprimer le fichier
      if (fs.existsSync(document.filepath)) {
        fs.unlinkSync(document.filepath);
      }

      // Supprimer de la DB
      await prisma.knowledgeDocument.delete({ where: { id } });

      res.json({ message: 'Document supprimé' });
    } catch (error: any) {
      console.error('❌ Erreur suppression document:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la suppression' });
    }
  }

  // Récupérer les détails d'un document
  async getDocument(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const document = await prisma.knowledgeDocument.findFirst({
        where: { id, userId },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document non trouvé' });
      }

      res.json({
        document: {
          id: document.id,
          title: document.title,
          description: document.description,
          category: document.category,
          originalName: document.originalName,
          size: document.size,
          textContent: document.textContent,
          createdAt: document.createdAt,
        },
      });
    } catch (error: any) {
      console.error('❌ Erreur récupération document:', error);
      res.status(500).json({ error: error.message || 'Erreur lors de la récupération' });
    }
  }

  // Télécharger un document
  async downloadDocument(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const document = await prisma.knowledgeDocument.findFirst({
        where: { id, userId },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document non trouvé' });
      }

      if (!fs.existsSync(document.filepath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      res.download(document.filepath, document.originalName);
    } catch (error: any) {
      console.error('❌ Erreur téléchargement:', error);
      res.status(500).json({ error: error.message || 'Erreur lors du téléchargement' });
    }
  }
}

export const knowledgeController = new KnowledgeController();
