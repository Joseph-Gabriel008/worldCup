/**
 * StadiumPulse AI - Mock API Service Layer
 *
 * Provides mock data for Netlify frontend-only deployments.
 */
import type {
  ApiResponse,
  AuthResponse,
  ZoneDensity,
  CrowdForecast,
  Incident,
  Task,
  Announcement,
  VenueZone,
  User,
} from '@/types';

function delay<T>(data: T, ms = 500): Promise<ApiResponse<T>> {
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, data }), ms));
}

// ── Auth ──────────────────────────────────────────────────────

export async function login(email: string, _password: string) {
  const role = email.includes('admin') ? 'ADMIN' : email.includes('organizer') ? 'ORGANIZER' : email.includes('volunteer') ? 'VOLUNTEER' : 'FAN';
  const user: User = { id: 'mock-user-1', email, name: email.split('@')[0], role, createdAt: new Date().toISOString() };
  return delay<AuthResponse>({
    user,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  });
}

export async function register(
  email: string,
  _password: string,
  name: string,
  role: string = 'FAN',
) {
  const user: User = { id: 'mock-user-2', email, name, role: role as User['role'], createdAt: new Date().toISOString() };
  return delay<AuthResponse>({
    user,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  });
}

// ── Crowd ─────────────────────────────────────────────────────

const mockZones: ZoneDensity[] = [
  { zoneId: 'north-gate', zoneName: 'North Gate', zoneType: 'GATE', currentCount: 850, capacity: 1000, density: 85, level: 'HIGH', trend: 'RISING', timestamp: new Date().toISOString() },
  { zoneId: 'food-court', zoneName: 'Food Court', zoneType: 'CONCESSION', currentCount: 200, capacity: 500, density: 40, level: 'LOW', trend: 'STABLE', timestamp: new Date().toISOString() },
  { zoneId: 'merch-stand', zoneName: 'Merchandise Stand', zoneType: 'RETAIL', currentCount: 190, capacity: 200, density: 95, level: 'CRITICAL', trend: 'RISING', timestamp: new Date().toISOString() },
];

export async function getCrowdZones() {
  return delay<ZoneDensity[]>(mockZones);
}

export async function getCrowdForecast() {
  return delay<CrowdForecast>({
    forecast: JSON.stringify({
      timestamps: ['12:00', '13:00', '14:00', '15:00', '16:00'],
      series: [
        { name: 'North Gate', data: [30, 45, 85, 90, 60] },
        { name: 'Food Court', data: [10, 20, 40, 80, 50] },
      ]
    }),
    timestamp: new Date().toISOString()
  });
}

export async function getCrowdAlerts() {
  return delay<Array<{ zoneId: string; zoneName: string; density: number; message: string; level: string }>>([
    { zoneId: 'north-gate', zoneName: 'North Gate', density: 85, message: 'High density at North Gate', level: 'HIGH' },
    { zoneId: 'merch-stand', zoneName: 'Merchandise Stand', density: 95, message: 'Critical density at Merchandise Stand. Deploy staff.', level: 'CRITICAL' }
  ]);
}

// ── Navigation ────────────────────────────────────────────────

export async function askNavigation(_query: string, _currentLocation?: string, _language = 'en') {
  return delay<{ response: string }>({ response: "You can find the nearest restroom by heading straight and turning left at Section A." });
}

export async function getDirections(from: string, to: string) {
  return delay<{ path: string[]; totalMinutes: number }>({
    path: ['Start at ' + from, 'Walk past Food Court', 'Arrive at ' + to],
    totalMinutes: 5
  });
}

export async function getVenue() {
  return delay<{ info: { name: string; capacity: number }; zones: VenueZone[] }>({
    info: { name: 'Lusail Stadium', capacity: 80000 },
    zones: [
      { id: 'north-gate', name: 'North Gate', type: 'GATE', capacity: 1000, floor: 1, x: 0, y: 0, adjacent: [] },
      { id: 'food-court', name: 'Food Court', type: 'CONCESSION', capacity: 500, floor: 1, x: 10, y: 10, adjacent: [] }
    ]
  });
}

// ── Incidents ─────────────────────────────────────────────────

const mockIncidents: Incident[] = [
  { id: 'inc-1', title: 'Medical emergency', description: 'Spectator requires medical assistance', status: 'OPEN', severity: 'HIGH', category: 'MEDICAL', zoneId: 'north-gate', reporterId: 'user-1', createdAt: new Date().toISOString() },
  { id: 'inc-2', title: 'Spill', description: 'Soda spill', status: 'RESOLVED', severity: 'LOW', category: 'FACILITY', zoneId: 'food-court', reporterId: 'user-2', createdAt: new Date().toISOString() }
];

export async function createIncident(data: {
  title: string;
  description: string;
  zoneId: string;
}) {
  const newInc: Incident = { id: `inc-${Date.now()}`, title: data.title, description: data.description, status: 'OPEN', severity: 'MEDIUM', category: 'CROWD', zoneId: data.zoneId, reporterId: 'me', createdAt: new Date().toISOString() };
  mockIncidents.push(newInc);
  return delay<Incident>(newInc);
}

export async function getIncidents(params?: {
  page?: number;
  status?: string;
  category?: string;
}) {
  return delay<Incident[]>(mockIncidents.filter(i => (!params?.status || params.status === 'ALL' || i.status === params.status)));
}

export async function updateIncidentStatus(id: string, status: string) {
  const inc = mockIncidents.find(i => i.id === id);
  if (inc) inc.status = status as any;
  return delay<Incident>(inc!);
}

// ── Volunteers ────────────────────────────────────────────────

const mockTasks: Task[] = [
  { id: 'task-1', title: 'Direct crowd', description: 'Help direct the crowd at the north gate', status: 'PENDING', priority: 'HIGH', zoneId: 'north-gate', createdAt: new Date().toISOString() }
];

export async function getTasks(status?: string) {
  return delay<Task[]>(mockTasks.filter(t => (!status || status === 'ALL' || t.status === status)));
}

export async function updateTaskStatus(id: string, status: string) {
  const task = mockTasks.find(t => t.id === id);
  if (task) task.status = status as any;
  return delay<Task>(task!);
}

export async function createTask(data: {
  title: string;
  description: string;
  priority?: string;
  zoneId: string;
  assigneeId?: string;
}) {
  const newTask: Task = { id: `task-${Date.now()}`, title: data.title, description: data.description, status: 'PENDING', priority: (data.priority as any) || 'MEDIUM', zoneId: data.zoneId, assigneeId: data.assigneeId, createdAt: new Date().toISOString() };
  mockTasks.push(newTask);
  return delay<Task>(newTask);
}

// ── Announcements ─────────────────────────────────────────────

const mockAnnouncements: Announcement[] = [
  { id: 'ann-1', text: 'Welcome to StadiumPulse!', originalText: 'Welcome to StadiumPulse!', priority: 'INFO', createdAt: new Date().toISOString(), translations: {} }
];

export async function getAnnouncements(_language = 'en') {
  return delay<Announcement[]>(mockAnnouncements);
}

export async function createAnnouncement(text: string, priority = 'INFO') {
  const newAnn: Announcement = { id: `ann-${Date.now()}`, text, originalText: text, priority: priority as any, createdAt: new Date().toISOString(), translations: {} };
  mockAnnouncements.unshift(newAnn);
  return delay<Announcement>(newAnn);
}

// ── Decision Support ──────────────────────────────────────────

export async function queryDecisionSupport(query: string) {
  return delay<{ query: string; recommendations: string; timestamp: string }>({ query, recommendations: "Based on the mock data, recommend sending 3 volunteers to the merchandise stand to handle the crowd.", timestamp: new Date().toISOString() });
}

export async function getSituationSummary() {
  return delay<{ summary: string; timestamp: string }>({ summary: "Overall situation is stable. High density observed at the merchandise stand.", timestamp: new Date().toISOString() });
}
