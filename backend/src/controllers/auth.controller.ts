import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import env from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, lawFirm, legalSpecialty } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('Un utilisateur avec cet email existe déjà', 400);
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          lawFirm,
          legalSpecialty,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          lawFirm: true,
          legalSpecialty: true,
          createdAt: true,
        },
      });

      // Générer le token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user,
        token,
      });
    } catch (error) {
      throw error;
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Générer le token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          lawFirm: user.lawFirm,
          legalSpecialty: user.legalSpecialty,
        },
        token,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          lawFirm: true,
          legalSpecialty: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
      }

      res.status(200).json({ user });
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, lawFirm, legalSpecialty } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          lawFirm,
          legalSpecialty,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          lawFirm: true,
          legalSpecialty: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        user,
      });
    } catch (error) {
      throw error;
    }
  }
}
