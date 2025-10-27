import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la base de données...');

  // Créer un utilisateur avocat de test
  const lawyerEmail = 'avocat@jure-ai.com';
  const existingLawyer = await prisma.user.findUnique({
    where: { email: lawyerEmail },
  });

  if (!existingLawyer) {
    const hashedPassword = await bcrypt.hash('Avocat123!', 12);

    const lawyer = await prisma.user.create({
      data: {
        email: lawyerEmail,
        password: hashedPassword,
        firstName: 'Jean',
        lastName: 'Dupont',
        lawFirm: 'Cabinet Dupont & Associés',
        legalSpecialty: 'droit_commercial',
      },
    });

    console.log('✅ Utilisateur avocat créé:', lawyer.email);
    console.log('   Email:', lawyer.email);
    console.log('   Mot de passe: Avocat123!');

    // Créer un dossier de démonstration
    const folder = await prisma.folder.create({
      data: {
        name: 'Dossier Démo - Litige Commercial',
        description:
          'Dossier de démonstration pour tester les fonctionnalités du système.',
        color: '#3b82f6',
        userId: lawyer.id,
      },
    });

    console.log('✅ Dossier de démonstration créé:', folder.name);

    // Créer une conversation de test
    const conversation = await prisma.conversation.create({
      data: {
        title: 'Consultation initiale',
        userId: lawyer.id,
        folderId: folder.id,
      },
    });

    // Créer quelques messages de test
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          userId: lawyer.id,
          role: 'USER',
          content: "Bonjour, j'ai besoin de conseils pour un litige commercial.",
        },
        {
          conversationId: conversation.id,
          userId: lawyer.id,
          role: 'ASSISTANT',
          content:
            'Bonjour ! Je suis là pour vous aider. Pouvez-vous me donner plus de détails sur ce litige commercial ?',
        },
      ],
    });

    console.log('✅ Conversation créée avec des messages de test');

    // Créer une pièce jointe de test
    await prisma.attachment.create({
      data: {
        folderId: folder.id,
        name: 'Contrat Commercial.pdf',
        type: 'CONTRACT',
        url: '/uploads/demo/contrat.pdf',
        size: 245760, // 240 KB
      },
    });

    // Créer un événement de chronologie
    await prisma.timelineEntry.create({
      data: {
        folderId: folder.id,
        title: 'Signature du contrat',
        description: 'Signature du contrat commercial initial',
        type: 'EVENT',
        date: new Date('2024-01-15'),
      },
    });

    // Créer une échéance
    await prisma.deadline.create({
      data: {
        folderId: folder.id,
        title: 'Réponse à la mise en demeure',
        description: 'Date limite pour répondre à la mise en demeure',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        priority: 'HIGH',
        status: 'PENDING',
      },
    });

    console.log('✅ Pièce jointe, chronologie et échéance créées');

  } else {
    console.log('ℹ️  Utilisateur avocat existe déjà');
  }

  console.log('\n✅ Initialisation terminée !');
  console.log('\n📝 Identifiants de test:');
  console.log('   Email: avocat@jure-ai.com');
  console.log('   Mot de passe: Avocat123!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
