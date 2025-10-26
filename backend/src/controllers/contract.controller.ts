import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { llmService } from '../services/llm.service';

export class ContractController {
  async generateContract(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId, title, contractType, details } = req.body;

      // Vérifier que le projet existe
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId,
        },
      });

      if (!project) {
        throw new AppError('Projet non trouvé', 404);
      }

      // Générer le contrat avec l'IA
      const content = await llmService.generateContractDraft(contractType, details);

      // Créer le contrat
      const contract = await prisma.contract.create({
        data: {
          title,
          content,
          projectId,
          status: 'DRAFT',
          version: 1,
          generatedBy: 'AI',
        },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'CREATE',
          entityType: 'CONTRACT',
          entityId: contract.id,
          description: `Contrat généré: ${title}`,
        },
      });

      res.status(201).json({
        message: 'Contrat généré avec succès',
        contract,
      });
    } catch (error) {
      throw error;
    }
  }

  async getContracts(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId, status } = req.query;

      const contracts = await prisma.contract.findMany({
        where: {
          project: {
            userId,
          },
          ...(projectId && { projectId: projectId as string }),
          ...(status && { status: status as any }),
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.status(200).json({ contracts });
    } catch (error) {
      throw error;
    }
  }

  async getContract(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { contractId } = req.params;

      const contract = await prisma.contract.findFirst({
        where: {
          id: contractId,
          project: {
            userId,
          },
        },
        include: {
          project: true,
        },
      });

      if (!contract) {
        throw new AppError('Contrat non trouvé', 404);
      }

      res.status(200).json({ contract });
    } catch (error) {
      throw error;
    }
  }

  async updateContract(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { contractId } = req.params;
      const { title, content, status } = req.body;

      const existingContract = await prisma.contract.findFirst({
        where: {
          id: contractId,
          project: {
            userId,
          },
        },
      });

      if (!existingContract) {
        throw new AppError('Contrat non trouvé', 404);
      }

      // Si le contenu change, créer une nouvelle version
      const newVersion =
        content && content !== existingContract.content
          ? existingContract.version + 1
          : existingContract.version;

      const contract = await prisma.contract.update({
        where: { id: contractId },
        data: {
          title,
          content,
          status,
          version: newVersion,
        },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entityType: 'CONTRACT',
          entityId: contract.id,
          description: `Contrat mis à jour: ${title}`,
          metadata: JSON.stringify({ version: newVersion }),
        },
      });

      res.status(200).json({
        message: 'Contrat mis à jour avec succès',
        contract,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteContract(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { contractId } = req.params;

      const contract = await prisma.contract.findFirst({
        where: {
          id: contractId,
          project: {
            userId,
          },
        },
      });

      if (!contract) {
        throw new AppError('Contrat non trouvé', 404);
      }

      await prisma.contract.delete({
        where: { id: contractId },
      });

      // Log l'activité
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'DELETE',
          entityType: 'CONTRACT',
          entityId: contractId,
          description: `Contrat supprimé: ${contract.title}`,
        },
      });

      res.status(200).json({
        message: 'Contrat supprimé avec succès',
      });
    } catch (error) {
      throw error;
    }
  }
}
