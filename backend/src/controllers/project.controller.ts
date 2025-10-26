import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ProjectController {
  async createProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title, description, status, priority } = req.body;

      const project = await prisma.project.create({
        data: {
          title,
          description,
          status: status || 'OPEN',
          priority: priority || 'MEDIUM',
          userId,
        },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'PROJECT',
          entityId: project.id,
          description: `Projet créé: ${title}`,
        },
      });

      res.status(201).json({
        message: 'Projet créé avec succès',
        project,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProjects(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      const projects = await prisma.project.findMany({
        where: {
          userId,
          ...(status && { status: status as any }),
        },
        include: {
          _count: {
            select: {
              documents: true,
              conversationSessions: true,
              contracts: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.status(200).json({ projects });
    } catch (error) {
      throw error;
    }
  }

  async getProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.params;

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId,
        },
        include: {
          documents: {
            orderBy: { createdAt: 'desc' },
          },
          conversationSessions: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
          },
          contracts: {
            orderBy: { updatedAt: 'desc' },
          },
        },
      });

      if (!project) {
        throw new AppError('Projet non trouvé', 404);
      }

      res.status(200).json({ project });
    } catch (error) {
      throw error;
    }
  }

  async updateProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.params;
      const { title, description, status, priority } = req.body;

      const existingProject = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId,
        },
      });

      if (!existingProject) {
        throw new AppError('Projet non trouvé', 404);
      }

      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          title,
          description,
          status,
          priority,
        },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entityType: 'PROJECT',
          entityId: project.id,
          description: `Projet mis à jour: ${title}`,
        },
      });

      res.status(200).json({
        message: 'Projet mis à jour avec succès',
        project,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.params;

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId,
        },
      });

      if (!project) {
        throw new AppError('Projet non trouvé', 404);
      }

      await prisma.project.delete({
        where: { id: projectId },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'PROJECT',
          entityId: projectId,
          description: `Projet supprimé: ${project.title}`,
        },
      });

      res.status(200).json({
        message: 'Projet supprimé avec succès',
      });
    } catch (error) {
      throw error;
    }
  }

  async getActivityLog(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.params;

      const logs = await prisma.activityLog.findMany({
        where: {
          userId,
          entityType: 'PROJECT',
          entityId: projectId,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.status(200).json({ logs });
    } catch (error) {
      throw error;
    }
  }
}
