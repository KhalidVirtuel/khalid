import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { llmService } from '../services/llm.service';

export class ChatController {
  async createConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title, folderId } = req.body;

      const conversation = await prisma.conversation.create({
        data: {
          title: title || 'Nouvelle conversation',
          userId,
          folderId: folderId || null,
        },
      });

      res.status(201).json({
        message: 'Conversation créée',
        conversation,
      });
    } catch (error) {
      throw error;
    }
  }

  async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { folderId } = req.query;

      const conversations = await prisma.conversation.findMany({
        where: {
          userId,
          ...(folderId && { folderId: folderId as string }),
        },
        include: {
          folder: true,
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.status(200).json({ conversations });
    } catch (error) {
      throw error;
    }
  }

  async getConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          folder: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      res.status(200).json({ conversation });
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      const { content } = req.body;

      // Vérifier que la conversation existe
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      // Sauvegarder le message de l'utilisateur
      const userMessage = await prisma.message.create({
        data: {
          conversationId,
          userId,
          role: 'USER',
          content,
        },
      });

      // Récupérer l'historique des messages
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });

      // Préparer les messages pour l'IA
      const conversationMessages = messages.map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
      }));

      // Générer la réponse avec l'IA
      const aiResponse = await llmService.chat(conversationMessages, '');

      // Sauvegarder la réponse de l'assistant
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId,
          userId,
          role: 'ASSISTANT',
          content: aiResponse,
        },
      });

      // Mettre à jour la date de modification
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      res.status(200).json({
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      throw error;
    }
  }

  async moveConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      const { folderId } = req.body;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      const updated = await prisma.conversation.update({
        where: { id: conversationId },
        data: { folderId: folderId || null },
      });

      res.status(200).json({
        message: 'Conversation déplacée',
        conversation: updated,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteConversation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw new AppError('Conversation non trouvée', 404);
      }

      await prisma.conversation.delete({
        where: { id: conversationId },
      });

      res.status(200).json({
        message: 'Conversation supprimée',
      });
    } catch (error) {
      throw error;
    }
  }
}
