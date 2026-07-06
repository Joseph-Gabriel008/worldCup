/**
 * StadiumPulse AI - Navigation Service
 *
 * Provides indoor wayfinding using Dijkstra's algorithm on the venue graph
 * and GenAI-powered natural-language direction generation.
 */
import venueData from '../../data/venueGraph.json';
import { generateNavigationResponse } from '../ai/gemini.service';
import { NotFoundError } from '../../utils/errors';

interface PathResult {
  path: string[];
  totalMinutes: number;
  steps: Array<{
    from: string;
    to: string;
    walkMinutes: number;
  }>;
}

/**
 * Dijkstra's shortest path algorithm on the venue graph.
 *
 * Uses edge weights (walk times in minutes) to find the optimal route
 * between any two zones in the stadium.
 */
export function findShortestPath(fromId: string, toId: string): PathResult {
  const zones = venueData.zones;
  const edges = venueData.edges;

  // Validate zone IDs
  if (!zones.find((z) => z.id === fromId)) throw new NotFoundError(`Zone: ${fromId}`);
  if (!zones.find((z) => z.id === toId)) throw new NotFoundError(`Zone: ${toId}`);

  if (fromId === toId) {
    return { path: [fromId], totalMinutes: 0, steps: [] };
  }

  // Build adjacency list (bidirectional)
  const adj: Map<string, Array<{ to: string; weight: number }>> = new Map();
  for (const zone of zones) {
    adj.set(zone.id, []);
  }
  for (const edge of edges) {
    adj.get(edge.from)?.push({ to: edge.to, weight: edge.walkMinutes });
    adj.get(edge.to)?.push({ to: edge.from, weight: edge.walkMinutes });
  }

  // Dijkstra
  const dist: Map<string, number> = new Map();
  const prev: Map<string, string | null> = new Map();
  const visited: Set<string> = new Set();

  for (const zone of zones) {
    dist.set(zone.id, Infinity);
    prev.set(zone.id, null);
  }
  dist.set(fromId, 0);

  while (true) {
    // Find unvisited node with smallest distance
    let minDist = Infinity;
    let minNode: string | null = null;
    for (const [node, d] of dist) {
      if (!visited.has(node) && d < minDist) {
        minDist = d;
        minNode = node;
      }
    }

    if (!minNode || minNode === toId) break;
    visited.add(minNode);

    // Relax neighbors
    const neighbors = adj.get(minNode) || [];
    for (const { to, weight } of neighbors) {
      const newDist = minDist + weight;
      if (newDist < (dist.get(to) || Infinity)) {
        dist.set(to, newDist);
        prev.set(to, minNode);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = toId;
  while (current) {
    path.unshift(current);
    current = prev.get(current) || null;
  }

  // Build step-by-step
  const steps: PathResult['steps'] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = edges.find(
      (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from),
    );
    steps.push({
      from: zones.find((z) => z.id === from)?.name || from,
      to: zones.find((z) => z.id === to)?.name || to,
      walkMinutes: edge?.walkMinutes || 2,
    });
  }

  return {
    path,
    totalMinutes: dist.get(toId) || 0,
    steps,
  };
}

/**
 * Handles natural-language navigation queries via GenAI.
 * Passes the venue graph as RAG context to Gemini.
 */
export async function askNavigation(
  query: string,
  currentLocation?: string,
  language: string = 'en',
): Promise<{ response: string; suggestedPath?: PathResult }> {
  const aiResponse = await generateNavigationResponse(query, currentLocation, language);

  // Try to extract source/destination for path calculation
  let suggestedPath: PathResult | undefined;
  if (currentLocation) {
    // Attempt to find destination from the query
    const zoneMatch = venueData.zones.find((z) =>
      query.toLowerCase().includes(z.name.toLowerCase()) ||
      query.toLowerCase().includes(z.id.toLowerCase()),
    );
    if (zoneMatch) {
      try {
        suggestedPath = findShortestPath(currentLocation, zoneMatch.id);
      } catch {
        // Path calculation failed — AI response is still valid
      }
    }
  }

  return { response: aiResponse, suggestedPath };
}

/**
 * Returns all venue zones for the map display.
 */
export function getVenueZones() {
  return venueData.zones;
}

/**
 * Returns venue metadata.
 */
export function getVenueInfo() {
  return venueData.stadium;
}
