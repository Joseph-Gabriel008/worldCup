/**
 * StadiumPulse AI - Announcement Service
 */
import prisma from '../../config/database';
import { generateAnnouncementTranslations } from '../ai/gemini.service';

export async function createAnnouncement(data: {
  text: string;
  priority?: string;
  expiresAt?: string;
}) {
  // Generate all language versions simultaneously via GenAI
  const translations = await generateAnnouncementTranslations(data.text);

  return prisma.announcement.create({
    data: {
      originalText: data.text,
      translations: JSON.stringify(translations),
      priority: data.priority || 'INFO',
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
}

export async function getActiveAnnouncements(language = 'en') {
  const announcements = await prisma.announcement.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return announcements.map((a: any) => {
    let translations: Record<string, string> = {};
    try {
      translations = JSON.parse(a.translations);
    } catch {
      translations = { en: a.originalText };
    }

    return {
      id: a.id,
      text: translations[language] || translations.en || a.originalText,
      originalText: a.originalText,
      priority: a.priority,
      createdAt: a.createdAt,
      translations,
    };
  });
}

export async function deactivateAnnouncement(id: string) {
  return prisma.announcement.update({
    where: { id },
    data: { active: false },
  });
}
