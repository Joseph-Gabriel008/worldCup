# 🏟️ StadiumPulse AI

**GenAI-Enabled Smart Stadium & Tournament Operations Platform for FIFA World Cup 2026**

> A full-stack web application that leverages Google Gemini AI to power crowd management, indoor navigation, real-time decision support, multi-language assistance, and volunteer coordination for FIFA World Cup 2026 stadium operations.

---

## 🎯 How This Solves the Problem Statement

| Challenge Track | Feature | Implementation |
|---|---|---|
| **Crowd Management** | Live crowd density heatmap + AI forecast | Mock IoT sensors emit density per zone via WebSocket every 5s. Gemini analyzes trends and generates plain-language predictions ("Gate 4 will hit critical in ~12 mins"). Auto-alert banners redirect fans. |
| **Indoor Navigation** | "Ask StadiumPulse" AI chat | RAG-style: venue graph (32 zones, walk times) is injected as context into Gemini prompts. Fans ask natural-language questions; AI returns step-by-step directions with walk-time estimates. |
| **Real-Time Decision Support** | Organizer AI query panel + auto-summaries | Organizers type operational queries ("what if Gate 3 overflows during rain?"). Gemini generates ranked action recommendations. Every 15 min, a 3-bullet situation summary is auto-generated for shift handovers. |
| **Multi-Language Assistance** | 6-language support + broadcast translation | Language selector (EN/ES/FR/PT/AR/HI). All AI responses auto-translated. Admins type announcements once in English; Gemini generates all language versions simultaneously. |
| **Volunteer Coordination** | Task queue + AI incident categorization | One-tap incident reporting with AI auto-categorization (medical/security/crowd/facility) and severity assessment. Task queue with accept/start/complete workflow. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React 18 + Vite)                    │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Fan View │ │ Organizer  │ │Volunteer │ │ Security Panel  │  │
│  │ Map+Chat │ │ Dashboard  │ │ TaskQueue│ │ Monitoring      │  │
│  └────┬─────┘ └─────┬──────┘ └────┬─────┘ └────────┬────────┘  │
│       └──────────────┴─────────────┴────────────────┘           │
│  [TailwindCSS v4] [shadcn/ui] [Zustand] [Socket.io Client]     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API + WebSocket
┌───────────────────────────┼─────────────────────────────────────┐
│                   BACKEND (Express + TypeScript)                │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │Auth/RBAC│  │Crowd Sim │  │AI Service│  │Navigation/Path │   │
│  │JWT+Roles│  │WebSocket │  │Gemini API│  │  Dijkstra Algo │   │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────────┬───────┘   │
│       └─────────────┴─────────────┴─────────────────┘           │
│  [Prisma ORM] → SQLite (dev) / PostgreSQL (prod)               │
│  [In-Memory Cache] → Redis (prod)                               │
│  [Zod Validation] [Rate Limiting] [Helmet Security]             │
└─────────────────────────────────────────────────────────────────┘
                            │
               [Gemini 2.5 Flash API]
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 1. Clone & Install
```bash
git clone <repo-url>
cd worldCup

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Setup
```bash
# From the project root, copy and edit the env file
cp .env.example .env
# Edit .env with your Gemini API key
```

### 3. Database Setup
```bash
cd server

# Push schema to SQLite (creates dev.db)
npx prisma db push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Start backend (port 3001)
cd server && npm run dev

# Terminal 2: Start frontend (port 5173)
cd client && npm run dev
```

### 5. Open the App
Navigate to `http://localhost:5173`

#### Demo Accounts:
| Role | Email | Password |
|------|-------|----------|
| 🎉 Fan | fan@demo.com | password123 |
| 📊 Organizer | organizer@demo.com | password123 |
| 🤝 Volunteer | volunteer@demo.com | password123 |
| 🛡️ Admin | admin@demo.com | password123 |

---

## 📁 Project Structure

```
worldCup/
├── client/                     # React 18 + Vite frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── chat/          # ChatWidget
│       │   ├── crowd/         # AlertBanner, CrowdForecastCard
│       │   ├── layout/        # Header
│       │   └── maps/          # StadiumMap (SVG + heatmap)
│       ├── hooks/             # Custom React hooks (useSocket)
│       ├── pages/             # Route pages (lazy-loaded)
│       ├── services/          # API service layer
│       ├── stores/            # Zustand state stores
│       └── types/             # Shared TypeScript types
├── server/                     # Express + TypeScript backend
│   ├── prisma/                # Prisma schema + migrations
│   └── src/
│       ├── config/            # Env, database, cache config
│       ├── data/              # Venue graph, mock sensor generator, seed
│       ├── features/          # Feature-based modules
│       │   ├── ai/           # Gemini AI service (all prompts)
│       │   ├── auth/         # JWT auth + registration
│       │   ├── crowd/        # Density engine + WebSocket
│       │   ├── decisions/    # AI decision support
│       │   ├── incidents/    # Incident reporting + categorization
│       │   ├── navigation/   # Pathfinding + AI chat
│       │   ├── announcements/# Multi-language broadcasts
│       │   └── volunteers/   # Task management
│       ├── middleware/        # Auth, RBAC, validation, rate limiter
│       └── utils/             # Logger, errors, API response helpers
├── tests/                      # Test suite
│   ├── unit/                  # Unit tests (Vitest)
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests (Playwright)
├── .env.example               # Environment variables template
└── README.md                  # This file
```

---

## 🔧 Tech Stack Rationale

| Technology | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Instant HMR, tree-shaking, optimized dev experience |
| Styling | TailwindCSS v4 + shadcn/ui | CSS-first config, accessible components, rapid iteration |
| State | Zustand | Lightweight, no boilerplate, perfect for real-time data |
| Real-time | Socket.io | Bidirectional WebSocket with fallback, rooms support |
| Backend | Express + TypeScript | Industry standard, rich middleware ecosystem |
| Database | Prisma + SQLite/PostgreSQL | Type-safe ORM, zero-config dev, production-ready schema |
| AI | Gemini 2.5 Flash | Fast inference, large context window for RAG, multi-language |
| Validation | Zod | Runtime + compile-time type safety, composable schemas |
| Auth | JWT + bcrypt | Stateless, refresh token rotation, role-based access |

---

## 🔒 Security Features

- ✅ JWT access tokens (15min) + refresh token rotation (7d)
- ✅ Role-based route guards (frontend + backend)
- ✅ Zod input validation on every API endpoint
- ✅ Rate limiting on AI endpoints (20 req/min)
- ✅ Helmet security headers
- ✅ CORS configured for known origins
- ✅ SQL injection protection via Prisma parameterized queries
- ✅ Environment variables for all secrets (never hardcoded)
- ✅ bcrypt password hashing (12 salt rounds)

---

## ♿ Accessibility

- ✅ Semantic HTML throughout (`<nav>`, `<main>`, `<header>`, etc.)
- ✅ ARIA labels on all interactive elements (map zones, chat, alerts)
- ✅ `aria-live="assertive"` on alert banners for screen readers
- ✅ Full keyboard navigation (tab order, focus states, Enter/Space activation)
- ✅ Color + icon + text labels for density (not color-only — WCAG compliant)
- ✅ rem-based sizing (no fixed px for text)
- ✅ Visible focus rings on interactive elements
- ✅ High contrast dark theme meeting WCAG AA

---

## 🧪 Testing

```bash
# Unit + Integration tests
cd server && npm test

# E2E smoke test
npx playwright test tests/e2e/
```

See [tests/README.md](tests/README.md) for detailed test documentation.

---

## 🔮 Future Scale Notes

### Real Stadium Integration Points

1. **IoT Sensor Feeds**: Replace `mockSensorGenerator.ts` with Kafka/MQTT consumers reading from:
   - Turnstile counter APIs (FIFA ticketing system)
   - Computer vision crowd counting from CCTV
   - WiFi/BLE device density sensors
   - LiDAR people-counting sensors

2. **Database**: Swap SQLite → PostgreSQL. Add Redis for:
   - Cross-instance cache sharing
   - Socket.io Redis adapter for multi-server WebSocket
   - Atomic crowd counter operations

3. **Maps**: Replace SVG map with Mapbox GL JS + indoor floor plans (GeoJSON):
   - Real venue GIS data from stadium operators
   - GPS/BLE indoor positioning for real-time fan location

4. **FIFA Integration**:
   - Official schedule API for match times, team data
   - Ticketing API for seat assignment lookup
   - Broadcast feed for live score integration

5. **Scale Architecture**:
   - Kubernetes deployment for horizontal scaling
   - CDN for static assets (Cloudflare/Vercel Edge)
   - Message queue (Kafka) for event-driven crowd processing
   - Time-series DB (TimescaleDB) for historical density data

6. **Enhanced AI**:
   - Fine-tuned models for crowd prediction accuracy
   - Computer vision integration for real-time crowd counting
   - Predictive analytics for pre-event planning

---

## 📜 License

Built for the FIFA World Cup 2026 Hackathon. All rights reserved.