/**
 * StadiumPulse AI - Gemini AI Service
 *
 * Centralized wrapper for all Google Gemini API interactions.
 * Handles prompt construction, context injection (RAG-style),
 * response parsing, debouncing, and graceful fallbacks.
 *
 * All GenAI features route through this service:
 * 1. Crowd Forecast — generates plain-language predictions from density data
 * 2. Navigation Chat — step-by-step directions using venue graph as context
 * 3. Decision Support — ranked action recommendations for organizers
 * 4. Multi-Language — translation and multi-language announcements
 * 5. Incident Categorization — auto-classifies incident reports
 * 6. Situation Summary — periodic 3-bullet operational summaries
 */
import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';
import { createLogger } from '../../utils/logger';
import venueData from '../../data/venueGraph.json';
import { ZoneDensity } from '../../data/mockSensorGenerator';

const logger = createLogger('GeminiService');

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash';

// Debounce tracking for forecast requests
let lastForecastTime = 0;
let cachedForecast: string | null = null;
const FORECAST_COOLDOWN_MS = 30_000; // 30 second minimum between forecast calls

/**
 * Base Gemini call with error handling, timeout (8s), and fallback.
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI request timed out')), 8000)
  );

  try {
    const apiCallPromise = ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]);
    const text = response.text;
    
    if (!text) {
      logger.warn('Gemini returned empty response');
      return 'I apologize, but I was unable to generate a response at this time. Please try again.';
    }

    return text;
  } catch (error: any) {
    logger.error('Gemini API error or timeout:', error);
    return `AI service is temporarily unavailable (${error.message || 'Error'}). Please try again shortly.`;
  }
}

/**
 * MODULE 1: Crowd Forecast
 *
 * Feeds current density data + zone info to Gemini to generate
 * a plain-language crowd prediction for organizers.
 *
 * Debounced: won't call Gemini more than once per 30 seconds.
 */
export async function generateCrowdForecast(
  currentDensities: ZoneDensity[],
): Promise<string> {
  const now = Date.now();
  if (now - lastForecastTime < FORECAST_COOLDOWN_MS && cachedForecast) {
    return cachedForecast;
  }

  const systemInstruction = `You are StadiumPulse AI, an expert crowd management system for FIFA World Cup 2026 at MetLife Stadium (capacity 82,500). You analyze real-time crowd density data and provide actionable forecasts.

Your responses should be:
- Concise (3-5 sentences max)
- Action-oriented with specific gate/zone references
- Include time estimates when predicting congestion
- Use professional but urgent tone for critical situations
- Always suggest specific alternatives when flagging congestion`;

  const densityContext = currentDensities
    .map(
      (z) =>
        `${z.zoneName}: ${Math.round(z.density * 100)}% capacity (${z.currentCount}/${z.capacity}), trend: ${z.trend}, level: ${z.level}`,
    )
    .join('\n');

  const criticalZones = currentDensities.filter((z) => z.level === 'CRITICAL' || z.level === 'HIGH');
  const risingZones = currentDensities.filter((z) => z.trend === 'RISING' && z.density > 0.5);

  const prompt = `Analyze the following real-time crowd density data and generate a brief operational forecast.

CURRENT CROWD STATUS:
${densityContext}

${criticalZones.length > 0 ? `⚠️ CRITICAL/HIGH ZONES: ${criticalZones.map((z) => z.zoneName).join(', ')}` : 'No critical zones currently.'}
${risingZones.length > 0 ? `📈 RISING TREND ZONES: ${risingZones.map((z) => z.zoneName).join(', ')}` : ''}

Generate a crowd forecast including:
1. Which zones will hit critical density in the next 10-15 minutes
2. Specific redirect recommendations (which gates/routes to use instead)
3. Any immediate actions needed`;

  const forecast = await callGemini(prompt, systemInstruction);
  
  if (forecast.includes('temporarily unavailable') && cachedForecast) {
    logger.info('Returning cached crowd forecast due to Gemini failure/timeout');
    return cachedForecast;
  }

  lastForecastTime = now;
  cachedForecast = forecast;
  return forecast;
}

/**
 * MODULE 2: Navigation Chat (RAG-style)
 *
 * Receives a natural-language query from a fan and uses the venue graph
 * as context to generate step-by-step directions.
 */
export async function generateNavigationResponse(
  query: string,
  currentLocation?: string,
  language: string = 'en',
): Promise<string> {
  const systemInstruction = `You are StadiumPulse AI, a friendly stadium wayfinding assistant at MetLife Stadium for the FIFA World Cup 2026. You help fans navigate the stadium with step-by-step directions.

Rules:
- Give clear, numbered step-by-step directions
- Include estimated walk times
- Reference specific zone names and landmarks
- If the query is unclear, ask for clarification
- Be warm and helpful — fans are excited!
- If asked about something outside the stadium, politely redirect
${language !== 'en' ? `- Respond in the language with code: ${language}` : ''}`;

  // RAG-style context injection: pass the full venue graph as context
  const venueContext = JSON.stringify({
    stadium: venueData.stadium,
    zones: venueData.zones.map((z) => ({
      id: z.id,
      name: z.name,
      type: z.type,
      adjacent: z.adjacent,
    })),
    walkTimes: venueData.edges,
  });

  const prompt = `VENUE LAYOUT (use this to navigate):
${venueContext}

${currentLocation ? `Fan's current location: ${currentLocation}` : 'Fan has not specified their current location.'}

Fan's question: "${query}"

Provide step-by-step directions with estimated walk time. If the fan hasn't shared their location, ask where they are first.`;

  return callGemini(prompt, systemInstruction);
}

/**
 * MODULE 3: Decision Support for Organizers
 *
 * Generates ranked action recommendations based on operational context.
 */
export async function generateDecisionSupport(
  query: string,
  currentDensities: ZoneDensity[],
  recentIncidents: Array<{ category: string; severity: string; zoneName: string; status: string }>,
): Promise<string> {
  const systemInstruction = `You are StadiumPulse AI, an advanced operational decision support system for FIFA World Cup 2026 organizers. You provide ranked, actionable recommendations based on real-time stadium conditions.

Rules:
- Number your recommendations by priority (1 = most urgent)
- Each recommendation must be specific and actionable
- Include resource requirements (staff count, equipment)
- Reference specific zones, gates, and teams
- Consider crowd safety, medical readiness, and evacuation protocols
- Be data-driven — reference the actual density numbers`;

  const densitySummary = currentDensities
    .filter((z) => z.density > 0.4)
    .map((z) => `${z.zoneName}: ${Math.round(z.density * 100)}% (${z.level}, ${z.trend})`)
    .join('\n');

  const incidentSummary =
    recentIncidents.length > 0
      ? recentIncidents
          .map((i) => `[${i.category}/${i.severity}] at ${i.zoneName} — ${i.status}`)
          .join('\n')
      : 'No recent incidents.';

  const prompt = `OPERATIONAL CONTEXT:

CROWD STATUS (zones above 40% capacity):
${densitySummary || 'All zones below 40% capacity.'}

RECENT INCIDENTS:
${incidentSummary}

ORGANIZER QUERY: "${query}"

Provide a ranked list of 3-5 action recommendations with priority levels and estimated implementation time.`;

  return callGemini(prompt, systemInstruction);
}

/**
 * MODULE 4: Multi-Language Translation
 *
 * Translates text into the specified target language using Gemini.
 */
export async function translateText(
  text: string,
  targetLanguage: string,
): Promise<string> {
  if (targetLanguage === 'en') return text;

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    pt: 'Portuguese',
    ar: 'Arabic',
    hi: 'Hindi',
  };

  const langName = languageNames[targetLanguage] || targetLanguage;

  const prompt = `Translate the following text to ${langName}. Return ONLY the translated text, no explanations or annotations.

Text to translate:
${text}`;

  return callGemini(prompt);
}

/**
 * MODULE 4B: Multi-Language Announcement Broadcast
 *
 * Takes English text and generates translations for all supported languages simultaneously.
 * Returns a JSON object with all translations.
 */
export async function generateAnnouncementTranslations(
  englishText: string,
): Promise<Record<string, string>> {
  const prompt = `Translate the following announcement into all these languages. Return a valid JSON object with language codes as keys and translations as values. No markdown formatting, just raw JSON.

Languages: English (en), Spanish (es), French (fr), Portuguese (pt), Arabic (ar), Hindi (hi)

Announcement: "${englishText}"

Return format:
{"en": "...", "es": "...", "fr": "...", "pt": "...", "ar": "...", "hi": "..."}`;

  const response = await callGemini(prompt);

  try {
    // Try to parse JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
      // Ensure English original is preserved
      parsed.en = englishText;
      return parsed;
    }
  } catch (parseError) {
    logger.warn('Failed to parse announcement translations', parseError);
  }

  // Fallback: return English only
  return { en: englishText, es: englishText, fr: englishText, pt: englishText, ar: englishText, hi: englishText };
}

/**
 * MODULE 5: Incident Auto-Categorization
 *
 * Takes an incident description and classifies it into one of:
 * MEDICAL, SECURITY, CROWD, FACILITY
 */
export async function categorizeIncident(
  description: string,
): Promise<{ category: string; severity: string; summary: string }> {
  const prompt = `Categorize the following stadium incident report. Return a valid JSON object with exactly these fields:
- "category": one of "MEDICAL", "SECURITY", "CROWD", "FACILITY"
- "severity": one of "LOW", "MEDIUM", "HIGH", "CRITICAL"
- "summary": a brief 1-sentence summary of the incident for the ops dashboard

Incident report: "${description}"

Return format (raw JSON only, no markdown):
{"category": "...", "severity": "...", "summary": "..."}`;

  const response = await callGemini(prompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category || 'FACILITY',
        severity: parsed.severity || 'MEDIUM',
        summary: parsed.summary || description.substring(0, 100),
      };
    }
  } catch (parseError) {
    logger.warn('Failed to parse incident categorization', parseError);
  }

  // Fallback: default categorization
  return {
    category: 'FACILITY',
    severity: 'MEDIUM',
    summary: description.substring(0, 100),
  };
}

/**
 * MODULE 6: Situation Summary
 *
 * Generates a 3-bullet operational summary for shift-change handovers.
 * Called every 15 minutes automatically.
 */
export async function generateSituationSummary(
  currentDensities: ZoneDensity[],
  recentIncidents: Array<{ category: string; severity: string; zoneName: string; time: string }>,
  activeAlerts: string[],
): Promise<string> {
  const systemInstruction = `You are StadiumPulse AI generating a shift-change handover summary. Be extremely concise — exactly 3 bullet points covering the most critical information an incoming shift lead needs to know.`;

  const prompt = `Generate a 3-bullet situation summary for the last 15 minutes.

CROWD DATA:
- Total zones at HIGH/CRITICAL: ${currentDensities.filter((z) => z.level === 'HIGH' || z.level === 'CRITICAL').length}
- Highest density: ${currentDensities.sort((a, b) => b.density - a.density)[0]?.zoneName} at ${Math.round((currentDensities.sort((a, b) => b.density - a.density)[0]?.density || 0) * 100)}%

INCIDENTS (last 15 min): ${recentIncidents.length > 0 ? recentIncidents.map((i) => `${i.category} at ${i.zoneName}`).join(', ') : 'None'}

ACTIVE ALERTS: ${activeAlerts.length > 0 ? activeAlerts.join('; ') : 'None'}

Return exactly 3 bullet points starting with "•"`;

  const summary = await callGemini(prompt, systemInstruction);

  if (summary.includes('temporarily unavailable')) {
    logger.info('Generating manual operational fallback situation summary');
    const totalHigh = currentDensities.filter((z) => z.level === 'HIGH' || z.level === 'CRITICAL').length;
    const highest = [...currentDensities].sort((a, b) => b.density - a.density)[0];
    const highestPct = highest ? Math.round(highest.density * 100) : 0;
    
    return `• Live Crowd Status: ${totalHigh} zones are currently at HIGH or CRITICAL capacity. Peak congestion is in ${highest ? highest.zoneName : 'N/A'} at ${highestPct}%.
• Incident Log: ${recentIncidents.length} active incidents reported in the last 15 minutes.
• Active Warnings: ${activeAlerts.length} operational alerts currently active in the venue.`;
  }

  return summary;
}
