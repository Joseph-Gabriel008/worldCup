/**
 * StadiumPulse AI - Incident Service
 */
import prisma from '../../config/database';
import { categorizeIncident } from '../ai/gemini.service';
import { NotFoundError } from '../../utils/errors';

export async function createIncident(data: {
  title: string;
  description: string;
  zoneId: string;
  reporterId: string;
  photoUrl?: string;
}) {
  // Auto-categorize via GenAI
  const categorization = await categorizeIncident(data.description);

  const incident = await prisma.incident.create({
    data: {
      title: data.title,
      description: data.description,
      category: categorization.category,
      severity: categorization.severity,
      zoneId: data.zoneId,
      reporterId: data.reporterId,
      photoUrl: data.photoUrl,
      aiSummary: categorization.summary,
    },
    include: {
      zone: { select: { name: true, type: true } },
      reporter: { select: { name: true, role: true } },
    },
  });

  return incident;
}

export async function getIncidents(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  zoneId?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;
  if (params.zoneId) where.zoneId = params.zoneId;

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        zone: { select: { name: true } },
        reporter: { select: { name: true, role: true } },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return { incidents, total, page, limit };
}

export async function getIncidentById(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      zone: { select: { name: true, type: true } },
      reporter: { select: { name: true, role: true } },
    },
  });
  if (!incident) throw new NotFoundError('Incident');
  return incident;
}

export async function updateIncidentStatus(id: string, status: string) {
  const incident = await prisma.incident.update({
    where: { id },
    data: { status },
    include: {
      zone: { select: { name: true } },
    },
  });
  return incident;
}

export async function getRecentIncidents(minutesBack = 15) {
  const since = new Date(Date.now() - minutesBack * 60_000);
  return prisma.incident.findMany({
    where: { createdAt: { gte: since } },
    include: { zone: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
