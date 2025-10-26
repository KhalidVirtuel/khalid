import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export class FolderController {
  async createFolder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, description, color } = req.body;

      const folder = await prisma.folder.create({
        data: {
          name,
          description,
          color: color || '#3b82f6',
          userId,
        },
      });

      res.status(201).json({
        message: 'Dossier créé avec succès',
        folder,
      });
    } catch (error) {
      throw error;
    }
  }

  async getFolders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const folders = await prisma.folder.findMany({
        where: { userId },
        include: {
          attachments: true,
          timeline: true,
          documents: true,
          deadlines: true,
          conversations: {
            take: 5,
            orderBy: { updatedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ folders });
    } catch (error) {
      throw error;
    }
  }

  async getFolder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;

      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
        },
        include: {
          attachments: {
            orderBy: { uploadedAt: 'desc' },
          },
          timeline: {
            orderBy: { date: 'desc' },
          },
          documents: {
            orderBy: { createdAt: 'desc' },
          },
          deadlines: {
            orderBy: { dueDate: 'asc' },
          },
          conversations: {
            orderBy: { updatedAt: 'desc' },
          },
        },
      });

      if (!folder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      res.status(200).json({ folder });
    } catch (error) {
      throw error;
    }
  }

  async updateFolder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;
      const { name, description, color } = req.body;

      const existingFolder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
        },
      });

      if (!existingFolder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      const folder = await prisma.folder.update({
        where: { id: folderId },
        data: {
          name,
          description,
          color,
        },
      });

      res.status(200).json({
        message: 'Dossier mis à jour avec succès',
        folder,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteFolder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;

      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
        },
      });

      if (!folder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      await prisma.folder.delete({
        where: { id: folderId },
      });

      res.status(200).json({
        message: 'Dossier supprimé avec succès',
      });
    } catch (error) {
      throw error;
    }
  }

  // Attachments
  async addAttachment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;
      const { name, type, url, size } = req.body;

      // Vérifier que le dossier appartient à l'utilisateur
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      const attachment = await prisma.attachment.create({
        data: {
          folderId,
          name,
          type,
          url,
          size,
        },
      });

      res.status(201).json({
        message: 'Pièce jointe ajoutée',
        attachment,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAttachment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { attachmentId } = req.params;

      const attachment = await prisma.attachment.findFirst({
        where: {
          id: attachmentId,
          folder: { userId },
        },
      });

      if (!attachment) {
        throw new AppError('Pièce jointe non trouvée', 404);
      }

      await prisma.attachment.delete({
        where: { id: attachmentId },
      });

      res.status(200).json({
        message: 'Pièce jointe supprimée',
      });
    } catch (error) {
      throw error;
    }
  }

  // Timeline Entries
  async addTimelineEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;
      const { title, description, type, date } = req.body;

      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      const entry = await prisma.timelineEntry.create({
        data: {
          folderId,
          title,
          description,
          type,
          date: new Date(date),
        },
      });

      res.status(201).json({
        message: 'Entrée ajoutée à la chronologie',
        entry,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteTimelineEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { entryId } = req.params;

      const entry = await prisma.timelineEntry.findFirst({
        where: {
          id: entryId,
          folder: { userId },
        },
      });

      if (!entry) {
        throw new AppError('Entrée non trouvée', 404);
      }

      await prisma.timelineEntry.delete({
        where: { id: entryId },
      });

      res.status(200).json({
        message: 'Entrée supprimée',
      });
    } catch (error) {
      throw error;
    }
  }

  // Deadlines
  async addDeadline(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;
      const { title, description, dueDate, priority } = req.body;

      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      const deadline = await prisma.deadline.create({
        data: {
          folderId,
          title,
          description,
          dueDate: new Date(dueDate),
          priority: priority || 'MEDIUM',
        },
      });

      res.status(201).json({
        message: 'Échéance ajoutée',
        deadline,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateDeadlineStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { deadlineId } = req.params;
      const { status } = req.body;

      const deadline = await prisma.deadline.findFirst({
        where: {
          id: deadlineId,
          folder: { userId },
        },
      });

      if (!deadline) {
        throw new AppError('Échéance non trouvée', 404);
      }

      const updated = await prisma.deadline.update({
        where: { id: deadlineId },
        data: { status },
      });

      res.status(200).json({
        message: 'Statut mis à jour',
        deadline: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteDeadline(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { deadlineId } = req.params;

      const deadline = await prisma.deadline.findFirst({
        where: {
          id: deadlineId,
          folder: { userId },
        },
      });

      if (!deadline) {
        throw new AppError('Échéance non trouvée', 404);
      }

      await prisma.deadline.delete({
        where: { id: deadlineId },
      });

      res.status(200).json({
        message: 'Échéance supprimée',
      });
    } catch (error) {
      throw error;
    }
  }

  // Generated Documents
  async generateDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.params;
      const { title, type, content } = req.body;

      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new AppError('Dossier non trouvé', 404);
      }

      const document = await prisma.generatedDocument.create({
        data: {
          folderId,
          title,
          type,
          content,
        },
      });

      res.status(201).json({
        message: 'Document généré',
        document,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentId } = req.params;
      const { title, content } = req.body;

      const document = await prisma.generatedDocument.findFirst({
        where: {
          id: documentId,
          folder: { userId },
        },
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      const updated = await prisma.generatedDocument.update({
        where: { id: documentId },
        data: { title, content },
      });

      res.status(200).json({
        message: 'Document mis à jour',
        document: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { documentId } = req.params;

      const document = await prisma.generatedDocument.findFirst({
        where: {
          id: documentId,
          folder: { userId },
        },
      });

      if (!document) {
        throw new AppError('Document non trouvé', 404);
      }

      await prisma.generatedDocument.delete({
        where: { id: documentId },
      });

      res.status(200).json({
        message: 'Document supprimé',
      });
    } catch (error) {
      throw error;
    }
  }
}
