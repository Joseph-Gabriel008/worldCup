/**
 * StadiumPulse AI - API Service Layer
 *
 * All HTTP API calls are isolated here. Components never make direct fetch calls.
 * Handles token refresh automatically on 401 responses.
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
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Handle token expiry — attempt refresh
  if (response.status === 401 && token) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = (await refreshRes.json()) as ApiResponse<{
            accessToken: string;
            refreshToken: string;
          }>;
          if (refreshData.data) {
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            localStorage.setItem('refreshToken', refreshData.data.refreshToken);
            // Retry original request
            headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
            return retryRes.json() as Promise<ApiResponse<T>>;
          }
        }
      } catch {
        // Refresh failed — clear auth
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    await response.text();
    return {
      success: false,
      error: 'Received non-JSON response. The backend might be offline or VITE_API_URL is missing.',
    } as unknown as ApiResponse<T>;
  }

  return response.json() as Promise<ApiResponse<T>>;
}

// ── Auth ──────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: string = 'FAN',
) {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

// ── Crowd ─────────────────────────────────────────────────────

export async function getCrowdZones() {
  return request<ZoneDensity[]>('/api/crowd/zones');
}

export async function getCrowdForecast() {
  return request<CrowdForecast>('/api/crowd/forecast');
}

export async function getCrowdAlerts() {
  return request<Array<{ zoneId: string; zoneName: string; density: number; message: string }>>(
    '/api/crowd/alerts',
  );
}

// ── Navigation ────────────────────────────────────────────────

export async function askNavigation(query: string, currentLocation?: string, language = 'en') {
  return request<{ response: string }>('/api/navigation/ask', {
    method: 'POST',
    body: JSON.stringify({ query, currentLocation, language }),
  });
}

export async function getDirections(from: string, to: string) {
  return request<{ path: string[]; totalMinutes: number }>(`/api/navigation/directions?from=${from}&to=${to}`);
}

export async function getVenue() {
  return request<{ info: { name: string; capacity: number }; zones: VenueZone[] }>('/api/navigation/venue');
}

// ── Incidents ─────────────────────────────────────────────────

export async function createIncident(data: {
  title: string;
  description: string;
  zoneId: string;
}) {
  return request<Incident>('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getIncidents(params?: {
  page?: number;
  status?: string;
  category?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);

  return request<Incident[]>(`/api/incidents?${query.toString()}`);
}

export async function updateIncidentStatus(id: string, status: string) {
  return request<Incident>(`/api/incidents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ── Volunteers ────────────────────────────────────────────────

export async function getTasks(status?: string) {
  const query = status ? `?status=${status}` : '';
  return request<Task[]>(`/api/volunteers/tasks${query}`);
}

export async function updateTaskStatus(id: string, status: string) {
  return request<Task>(`/api/volunteers/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function createTask(data: {
  title: string;
  description: string;
  priority?: string;
  zoneId: string;
  assigneeId?: string;
}) {
  return request<Task>('/api/volunteers/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Announcements ─────────────────────────────────────────────

export async function getAnnouncements(language = 'en') {
  return request<Announcement[]>(`/api/announcements?language=${language}`);
}

export async function createAnnouncement(text: string, priority = 'INFO') {
  return request<Announcement>('/api/announcements', {
    method: 'POST',
    body: JSON.stringify({ text, priority }),
  });
}

// ── Decision Support ──────────────────────────────────────────

export async function queryDecisionSupport(query: string) {
  return request<{ query: string; recommendations: string; timestamp: string }>(
    '/api/decisions/query',
    {
      method: 'POST',
      body: JSON.stringify({ query }),
    },
  );
}

export async function getSituationSummary() {
  return request<{ summary: string; timestamp: string }>('/api/decisions/summary');
}
