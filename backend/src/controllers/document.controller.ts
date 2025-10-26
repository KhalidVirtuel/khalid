import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { documentService } from '../services/document.service';
import { qdrantService } from '../services/qdrant.service';
import { llmService } from '../services/llm.service';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

export class DocumentController {
  async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId, documentType, title } = req.body;

      if (!req.files || !req.files.document) {
        throw new AppError('Fichier manquant', 400);
      }

      const file = Array.isArray(req.files.document)
        ? req.files.document[0]
        : req.files.document;

      // Créer le dossier d'upload si nécessaire
      documentService.ensureUploadDirectory(UPLOADS_DIR);

      // Générer un nom de fichier unique
      const filename = `${Date.now()}_${file.name}`;
      const filepath = path.join(UPLOADS_DIR, filename);

      // Déplacer le fichier
      await file.mv(filepath);

      // Créer l'entrée dans la base de données
      const document = await prisma.document.create({
        data: {
          title: title || file.name,
          filename: file.name,
          filepath,
          filesize: file.size,
          mimetype: file.mimetype,
          documentType: documentType || 'OTHER',
          projectId,
          userId,
        },
      });

      // Extraire le texte et indexer dans Qdrant en arrière-plan
      this.indexDocumentAsync(document.id, filepath, file.mimetype, {
        filename: file.name,
        userId,
        projectId,
        documentType,
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'UPLOAD',
          entityType: 'DOCUMENT',
          entityId: document.id,
          description: `Document uploadé: ${file.name}`,
        },
      });

      res.status(201).json({
        message: 'Document uploadé avec succès',
        document,
      });
    } catch (error) {
      throw error;
    }
  }

  private async indexDocumentAsync(
    documentId: string,
    filepath: string,
    mimetype: string,
    metadata: any
  ) {
    try {
      const text = await documentService.extractTextFromFile(filepath, mimetype);

      if (text && text.length > 50) {
        await qdrantService.indexDocument(documentId, text, metadata);

        await prisma.document.update({
          where: { id: documentId },
          data: { isIndexed: true, qdrantId: documentId },
        });

        console.log(`✅ Document ${documentId} indexé avec succès`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'indexation du document ${documentId}:`, error);
    }
  }

  async getDocuments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId, documentType } = req.query;

      const documents = await prisma.document.findMany({
        where: {
          userId,
          ...(projectId && { projectId: projectId as string }),
          ...(documentType && { documentType: documentType as any }),
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ documents });
    } catch (error) {
      throw error;
    }
  }

  async getDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentId } = req.params;

      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId,
        },
        include: {
          project: true,
        },
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      res.status(200).json({ document });
    } catch (error) {
      throw error;
    }
  }

  async downloadDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentId } = req.params;

      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      if (!fs.existsSync(document.filepath)) {
        throw new AppError('Fichier introuvable sur le serveur', 404);
      }

      res.download(document.filepath, document.filename);
    } catch (error) {
      throw error;
    }
  }

  async analyzeDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentId } = req.params;
      const { question } = req.body;

      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      // Extraire le texte
      const text = await documentService.extractTextFromFile(
        document.filepath,
        document.mimetype
      );

      // Analyser avec l'IA
      const analysis = await llmService.analyzeDocument(text, question);

      res.status(200).json({
        document: {
          id: document.id,
          title: document.title,
          filename: document.filename,
        },
        analysis,
      });
    } catch (error) {
      throw error;
    }
  }

  async searchDocuments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { query, projectId, limit = 5 } = req.body;

      if (!query) {
        throw new AppError('Requête de recherche manquante', 400);
      }

      // Construire le filtre
      const filter: any = {
        must: [
          {
            key: 'userId',
            match: { value: userId },
          },
        ],
      };

      if (projectId) {
        filter.must.push({
          key: 'projectId',
          match: { value: projectId },
        });
      }

      // Rechercher dans Qdrant
      const results = await qdrantService.search(query, Number(limit), filter);

      res.status(200).json({
        query,
        results,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentId } = req.params;

      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      // Supprimer de Qdrant si indexé
      if (document.isIndexed && document.qdrantId) {
        await qdrantService.deleteDocument(document.qdrantId);
      }

      // Supprimer le fichier physique
      documentService.deleteFile(document.filepath);

      // Supprimer de la base de données
      await prisma.document.delete({
        where: { id: documentId },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'DOCUMENT',
          entityId: documentId,
          description: `Document supprimé: ${document.filename}`,
        },
      });

      res.status(200).json({
        message: 'Document supprimé avec succès',
      });
    } catch (error) {
      throw error;
    }
  }
}
