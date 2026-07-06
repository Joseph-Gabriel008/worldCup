# StadiumPulse AI — Test Suite

## Overview

This test suite covers unit tests, integration tests, and E2E smoke tests for the StadiumPulse AI platform.

## Test Structure

```
tests/
├── unit/
│   ├── crowd-algorithm.test.ts      # Mock sensor generator & density classification
│   └── ai-prompt-handler.test.ts    # GenAI prompt construction & response parsing
├── integration/
│   └── crowd-alert-pipeline.test.ts # Full pipeline: sensor → density → alert
├── e2e/
│   └── fan-navigation-chat.spec.ts  # E2E smoke test for fan chat flow (Playwright)
└── README.md                        # This file
```

## Running Tests

### Prerequisites
```bash
# Install dependencies
cd server && npm install
```

### Unit & Integration Tests (Vitest)
```bash
# From the project root
cd server
npm test

# Or with watch mode
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Install Playwright browsers first
npx playwright install

# Run E2E tests
npx playwright test tests/e2e/

# With UI mode
npx playwright test tests/e2e/ --ui
```

## Test Coverage

| Module | Tests | Type |
|--------|-------|------|
| Crowd sensor data generation | 8 tests | Unit |
| Density level classification | 2 tests | Unit |
| AI categorization parsing | 5 tests | Unit |
| Translation parsing | 3 tests | Unit |
| Prompt construction | 1 test | Unit |
| Crowd alert pipeline | 5 tests | Integration |
| Fan navigation chat | 1 test | E2E (smoke) |

## Mock Strategy

- **Gemini API**: Mocked via `vi.mock('@google/genai')` — tests verify prompt construction and response parsing independently
- **Database**: Tests use the mock sensor generator directly (no DB needed for unit/integration)
- **WebSocket**: E2E tests interact with the full running server
