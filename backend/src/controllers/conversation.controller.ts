import { Response } from 'express';
import path from 'path';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { llmService } from '../services/llm.service';
import { speechService } from '../services/speech.service';
import { qdrantService } from '../services/qdrant.service';

export class ConversationController {
  async createSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title, projectId } = req.body;

      const session = await prisma.conversationSession.create({
        data: {
          title: title || 'Nouvelle conversation',
          userId,
          projectId,
        },
        include: {
          project: true,
        },
      });

      res.status(201).json({
        message: 'Session de conversation créée',
        session,
      });
    } catch (error) {
      throw error;
    }
  }

  async getSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { projectId } = req.query;

      const sessions = await prisma.conversationSession.findMany({
        where: {
          userId,
          ...(projectId && { projectId: projectId as string }),
        },
        include: {
          project: true,
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      res.status(200).json({ sessions });
    } catch (error) {
      throw error;
    }
  }

  async getSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;

      const session = await prisma.conversationSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          project: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!session) {
        throw new AppError('Session non trouvée', 404);
      }

      res.status(200).json({ session });
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const { content, useRAG } = req.body;

      // Vérifier que la session existe et appartient à l'utilisateur
      const session = await prisma.conversationSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          project: true,
        },
      });

      if (!session) {
        throw new AppError('Session non trouvée', 404);
      }

      // Sauvegarder le message de l'utilisateur
      const userMessage = await prisma.message.create({
        data: {
          sessionId,
          userId,
          role: 'USER',
          content,
          messageType: 'TEXT',
        },
      });

      // Récupérer l'historique des messages
      const messages = await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20, // Limiter à 20 derniers messages
      });

      // Préparer le contexte RAG si demandé
      let ragContext = '';
      if (useRAG && session.projectId) {
        const searchResults = await qdrantService.search(content, 3, {
          must: [
            {
              key: 'projectId',
              match: { value: session.projectId },
            },
          ],
        });

        if (searchResults.length > 0) {
          ragContext = searchResults
            .filter((result) => result.payload && result.payload.text)
            .map((result) => result.payload!.text as string)
            .join('\n\n');
        }
      }

      // Générer la réponse avec l'IA
      const conversationMessages = messages.map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      const aiResponse = await llmService.chat(conversationMessages, ragContext);

      // Sauvegarder la réponse de l'assistant
      const assistantMessage = await prisma.message.create({
        data: {
          sessionId,
          userId,
          role: 'ASSISTANT',
          content: aiResponse,
          messageType: 'TEXT',
        },
      });

      // Mettre à jour la date de modification de la session
      await prisma.conversationSession.update({
        where: { id: sessionId },
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

  async sendAudioMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;

      if (!req.files || !req.files.audio) {
        throw new AppError('Fichier audio manquant', 400);
      }

      const audioFile = Array.isArray(req.files.audio)
        ? req.files.audio[0]
        : req.files.audio;

      // Transcrire l'audio
      const transcription = await speechService.transcribeAudio(audioFile.tempFilePath);

      // Traiter le message comme un message texte
      req.body.content = transcription;
      await this.sendMessage(req, res);
    } catch (error) {
      throw error;
    }
  }

  async deleteSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;

      const session = await prisma.conversationSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
      });

      if (!session) {
        throw new AppError('Session non trouvée', 404);
      }

      await prisma.conversationSession.delete({
        where: { id: sessionId },
      });

      res.status(200).json({
        message: 'Session supprimée avec succès',
      });
    } catch (error) {
      throw error;
    }
  }
}
