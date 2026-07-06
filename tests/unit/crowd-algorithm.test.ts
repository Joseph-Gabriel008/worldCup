/**
 * StadiumPulse AI - Unit Tests: Crowd Algorithm
 *
 * Tests the mock sensor data generator and density level calculations.
 */
import { describe, it, expect } from 'vitest';
import { generateCrowdSnapshot, getZoneDensity } from '../server/src/data/mockSensorGenerator';

describe('Mock Sensor Generator', () => {
  it('should generate density data for all zones', () => {
    const snapshot = generateCrowdSnapshot();
    expect(snapshot.length).toBeGreaterThan(0);
    // Venue has 32 zones
    expect(snapshot.length).toBe(32);
  });

  it('should produce valid density values (0 to 1)', () => {
    const snapshot = generateCrowdSnapshot();
    for (const zone of snapshot) {
      expect(zone.density).toBeGreaterThanOrEqual(0);
      expect(zone.density).toBeLessThanOrEqual(1);
    }
  });

  it('should produce correct count based on density * capacity', () => {
    const snapshot = generateCrowdSnapshot();
    for (const zone of snapshot) {
      const expectedCount = Math.round(zone.density * zone.capacity);
      expect(zone.currentCount).toBe(expectedCount);
    }
  });

  it('should assign valid density levels', () => {
    const snapshot = generateCrowdSnapshot();
    const validLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    for (const zone of snapshot) {
      expect(validLevels).toContain(zone.level);
    }
  });

  it('should assign valid trend directions', () => {
    const snapshot = generateCrowdSnapshot();
    const validTrends = ['RISING', 'STABLE', 'FALLING'];
    for (const zone of snapshot) {
      expect(validTrends).toContain(zone.trend);
    }
  });

  it('should have valid timestamps', () => {
    const snapshot = generateCrowdSnapshot();
    for (const zone of snapshot) {
      const date = new Date(zone.timestamp);
      expect(date.getTime()).not.toBeNaN();
    }
  });

  it('should return null for non-existent zone', () => {
    const result = getZoneDensity('non-existent-zone');
    expect(result).toBeNull();
  });

  it('should return valid data for existing zone', () => {
    const result = getZoneDensity('gate-1');
    expect(result).not.toBeNull();
    expect(result!.zoneId).toBe('gate-1');
    expect(result!.zoneName).toContain('Gate 1');
  });
});

describe('Density Level Classification', () => {
  it('should map low density correctly', () => {
    const snapshot = generateCrowdSnapshot();
    const lowZones = snapshot.filter((z) => z.density < 0.4);
    for (const zone of lowZones) {
      expect(zone.level).toBe('LOW');
    }
  });

  it('should map moderate density correctly', () => {
    // Generate multiple snapshots to increase chance of hitting all ranges
    for (let i = 0; i < 5; i++) {
      const snapshot = generateCrowdSnapshot();
      const moderateZones = snapshot.filter((z) => z.density >= 0.4 && z.density < 0.65);
      for (const zone of moderateZones) {
        expect(zone.level).toBe('MODERATE');
      }
    }
  });
});
