import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la base de données...');

  // Créer un utilisateur admin par défaut
  const adminEmail = 'admin@jure-ai.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrateur',
        role: 'ADMIN',
      },
    });

    console.log('✅ Utilisateur admin créé:', admin.email);
  } else {
    console.log('ℹ️  Utilisateur admin existe déjà');
  }

  // Créer un avocat de test
  const lawyerEmail = 'avocat@jure-ai.com';
  const existingLawyer = await prisma.user.findUnique({
    where: { email: lawyerEmail },
  });

  if (!existingLawyer) {
    const hashedPassword = await bcrypt.hash('Lawyer123!', 12);

    const lawyer = await prisma.user.create({
      data: {
        email: lawyerEmail,
        password: hashedPassword,
        name: 'Jean Dupont',
        role: 'LAWYER',
        phone: '+33612345678',
        address: '123 Rue de la Loi, 75001 Paris',
      },
    });

    console.log('✅ Utilisateur avocat créé:', lawyer.email);

    // Créer un projet de démonstration
    const project = await prisma.project.create({
      data: {
        title: 'Affaire Démo - Litige Commercial',
        description:
          'Projet de démonstration pour tester les fonctionnalités du système.',
        status: 'OPEN',
        priority: 'MEDIUM',
        userId: lawyer.id,
      },
    });

    console.log('✅ Projet de démonstration créé:', project.title);

    // Créer une session de conversation de test
    const session = await prisma.conversationSession.create({
      data: {
        title: 'Consultation initiale',
        userId: lawyer.id,
        projectId: project.id,
      },
    });

    // Créer quelques messages de test
    await prisma.message.createMany({
      data: [
        {
          sessionId: session.id,
          userId: lawyer.id,
          role: 'USER',
          content: 'Bonjour, j\'ai besoin de conseils pour un litige commercial.',
          messageType: 'TEXT',
        },
        {
          sessionId: session.id,
          userId: lawyer.id,
          role: 'ASSISTANT',
          content:
            'Bonjour ! Je suis là pour vous aider. Pouvez-vous me donner plus de détails sur ce litige commercial ?',
          messageType: 'TEXT',
        },
      ],
    });

    console.log('✅ Session de conversation créée avec des messages de test');
  } else {
    console.log('ℹ️  Utilisateur avocat existe déjà');
  }

  console.log('✅ Initialisation terminée !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
