/**
 * StadiumPulse AI - Shared TypeScript Types
 */

export type UserRole = 'FAN' | 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type DensityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type TrendDirection = 'RISING' | 'STABLE' | 'FALLING';

export interface ZoneDensity {
  zoneId: string;
  zoneName: string;
  zoneType: string;
  currentCount: number;
  capacity: number;
  density: number;
  level: DensityLevel;
  trend: TrendDirection;
  timestamp: string;
}

export interface CrowdAlert {
  zoneId: string;
  zoneName: string;
  density: number;
  level: string;
  message: string;
}

export interface CrowdForecast {
  forecast: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: 'MEDICAL' | 'SECURITY' | 'CROWD' | 'FACILITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  zoneId: string;
  reporterId: string;
  photoUrl?: string;
  aiSummary?: string;
  createdAt: string;
  zone?: { name: string };
  reporter?: { name: string; role: string };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  zoneId: string;
  assigneeId?: string;
  createdAt: string;
  zone?: { name: string };
  assignee?: { name: string };
}

export interface Announcement {
  id: string;
  text: string;
  originalText: string;
  priority: 'INFO' | 'WARNING' | 'EMERGENCY';
  createdAt: string;
  translations: Record<string, string>;
}

export interface VenueZone {
  id: string;
  name: string;
  type: string;
  capacity: number;
  floor: number;
  x: number;
  y: number;
  adjacent: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'hi';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ar: 'العربية',
  hi: 'हिन्दी',
};
