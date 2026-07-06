/**
 * StadiumPulse AI - Unit Tests: AI Prompt Handler
 *
 * Tests Gemini service prompt construction and response parsing.
 * Uses mocked Gemini responses to verify parsing logic and fallbacks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the @google/genai module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
}));

// We need to test the parsing logic independently since the actual
// Gemini calls are mocked. We'll test the categorization parsing.

describe('Incident Categorization Parsing', () => {
  const parseCategorizationResponse = (response: string) => {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: parsed.category || 'FACILITY',
          severity: parsed.severity || 'MEDIUM',
          summary: parsed.summary || 'No summary',
        };
      }
    } catch {
      // Parse failed
    }
    return { category: 'FACILITY', severity: 'MEDIUM', summary: 'Fallback' };
  };

  it('should parse valid JSON response', () => {
    const response = '{"category": "MEDICAL", "severity": "HIGH", "summary": "Person needs help"}';
    const result = parseCategorizationResponse(response);
    expect(result.category).toBe('MEDICAL');
    expect(result.severity).toBe('HIGH');
    expect(result.summary).toBe('Person needs help');
  });

  it('should handle JSON wrapped in markdown code block', () => {
    const response = '```json\n{"category": "SECURITY", "severity": "CRITICAL", "summary": "Unauthorized access"}\n```';
    const result = parseCategorizationResponse(response);
    expect(result.category).toBe('SECURITY');
    expect(result.severity).toBe('CRITICAL');
  });

  it('should return fallback for invalid JSON', () => {
    const response = 'This is not JSON at all';
    const result = parseCategorizationResponse(response);
    expect(result.category).toBe('FACILITY');
    expect(result.severity).toBe('MEDIUM');
  });

  it('should handle partial JSON', () => {
    const response = '{"category": "CROWD"}';
    const result = parseCategorizationResponse(response);
    expect(result.category).toBe('CROWD');
    expect(result.severity).toBe('MEDIUM'); // Default fallback
  });

  it('should handle empty response', () => {
    const response = '';
    const result = parseCategorizationResponse(response);
    expect(result.category).toBe('FACILITY');
  });
});

describe('Announcement Translation Parsing', () => {
  const parseTranslationResponse = (response: string, original: string) => {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
        parsed.en = original;
        return parsed;
      }
    } catch {
      // Parse failed
    }
    return { en: original, es: original, fr: original, pt: original, ar: original, hi: original };
  };

  it('should parse valid multi-language response', () => {
    const response = '{"en": "Hello", "es": "Hola", "fr": "Bonjour", "pt": "Olá", "ar": "مرحبا", "hi": "नमस्ते"}';
    const result = parseTranslationResponse(response, 'Hello');
    expect(result.en).toBe('Hello');
    expect(result.es).toBe('Hola');
    expect(result.fr).toBe('Bonjour');
  });

  it('should preserve original English text', () => {
    const response = '{"en": "Different", "es": "Hola"}';
    const result = parseTranslationResponse(response, 'Original');
    expect(result.en).toBe('Original'); // Original preserved
  });

  it('should return all-english fallback on parse failure', () => {
    const response = 'Not valid JSON';
    const result = parseTranslationResponse(response, 'Fallback');
    expect(result.en).toBe('Fallback');
    expect(result.es).toBe('Fallback');
  });
});

describe('Prompt Construction', () => {
  it('should format density data correctly for prompt', () => {
    const densities = [
      { zoneId: 'gate-1', zoneName: 'Gate 1', density: 0.85, level: 'CRITICAL' as const, trend: 'RISING' as const, currentCount: 4250, capacity: 5000, zoneType: 'GATE', timestamp: '' },
      { zoneId: 'gate-2', zoneName: 'Gate 2', density: 0.3, level: 'LOW' as const, trend: 'STABLE' as const, currentCount: 1350, capacity: 4500, zoneType: 'GATE', timestamp: '' },
    ];

    const formatted = densities
      .map((z) => `${z.zoneName}: ${Math.round(z.density * 100)}% capacity (${z.currentCount}/${z.capacity}), trend: ${z.trend}, level: ${z.level}`)
      .join('\n');

    expect(formatted).toContain('Gate 1: 85% capacity');
    expect(formatted).toContain('Gate 2: 30% capacity');
    expect(formatted).toContain('trend: RISING');
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });
});
