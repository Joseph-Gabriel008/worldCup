import { describe, it, expect } from 'vitest';
import { getCrowdZones, getIncidents, login } from './api';

describe('API Mock Services', () => {
  it('login returns mock token', async () => {
    const res = await login('fan@demo.com', 'password123');
    expect(res.success).toBe(true);
    expect(res.data?.accessToken).toBe('mock-access-token');
    expect(res.data?.user.role).toBe('FAN');
  });

  it('getCrowdZones returns initial mock zones', async () => {
    const res = await getCrowdZones();
    expect(res.success).toBe(true);
    expect(res.data?.length).toBeGreaterThan(0);
    expect(res.data?.[0].zoneId).toBe('north-gate');
  });

  it('getIncidents returns mock incidents', async () => {
    const res = await getIncidents();
    expect(res.success).toBe(true);
    expect(res.data?.length).toBeGreaterThan(0);
  });
});
