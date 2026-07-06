/**
 * StadiumPulse AI - Volunteer/Task Service
 */
import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export async function getTasks(params: {
  assigneeId?: string;
  status?: string;
  zoneId?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.assigneeId) where.assigneeId = params.assigneeId;
  if (params.status) where.status = params.status;
  if (params.zoneId) where.zoneId = params.zoneId;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        zone: { select: { name: true } },
        assignee: { select: { name: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, page, limit };
}

export async function createTask(data: {
  title: string;
  description: string;
  priority?: string;
  zoneId: string;
  assigneeId?: string;
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      zoneId: data.zoneId,
      assigneeId: data.assigneeId,
      status: data.assigneeId ? 'ASSIGNED' : 'PENDING',
    },
    include: {
      zone: { select: { name: true } },
      assignee: { select: { name: true } },
    },
  });
}

export async function updateTaskStatus(id: string, status: string, assigneeId?: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new NotFoundError('Task');

  return prisma.task.update({
    where: { id },
    data: {
      status,
      ...(assigneeId ? { assigneeId } : {}),
    },
    include: {
      zone: { select: { name: true } },
      assignee: { select: { name: true } },
    },
  });
}

export async function getVolunteers() {
  return prisma.user.findMany({
    where: { role: 'VOLUNTEER' },
    select: { id: true, name: true, email: true },
  });
}
