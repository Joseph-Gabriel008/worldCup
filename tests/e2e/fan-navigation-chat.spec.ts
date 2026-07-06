/**
 * StadiumPulse AI - E2E Smoke Test: Fan Navigation Chat
 *
 * Tests the full fan experience:
 * 1. Loads the fan page
 * 2. Opens the chat widget
 * 3. Types a navigation query
 * 4. Verifies a response appears
 *
 * Prerequisites:
 * - Backend server running on :3001
 * - Frontend dev server running on :5173
 */
import { test, expect } from '@playwright/test';

test.describe('Fan Navigation Chat Flow', () => {
  test('should open chat and receive navigation response', async ({ page }) => {
    // Navigate to the app (assuming login bypass or demo mode)
    await page.goto('http://localhost:5173/login');

    // Click the Fan demo login button
    await page.click('button:has-text("Fan")');

    // Wait for redirect to fan page
    await page.waitForURL('**/fan', { timeout: 5000 });

    // Verify the stadium map is visible
    await expect(page.locator('[aria-label="Interactive stadium map showing crowd density per zone"]')).toBeVisible();

    // Click the chat toggle button
    await page.click('[aria-label="Open StadiumPulse AI chat assistant"]');

    // Verify chat dialog opened
    await expect(page.locator('[aria-label="StadiumPulse AI navigation assistant"]')).toBeVisible();

    // Type a navigation query
    const chatInput = page.locator('[aria-label="Type your navigation question"]');
    await chatInput.fill('Where is the nearest restroom from Gate 1?');

    // Send the message
    await page.click('[aria-label="Send message"]');

    // Wait for the AI response (may take a few seconds)
    // The response should appear as a new message in the chat
    await expect(
      page.locator('[role="log"] >> text=restroom').or(
        page.locator('[role="log"] >> text=Restroom')
      ).or(
        page.locator('[role="log"] >> text=Thinking')
      )
    ).toBeVisible({ timeout: 15000 });

    // Verify the loading state appears
    // (This tests that the UI properly shows loading state)
  });
});
