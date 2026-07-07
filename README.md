# 🏟️ StadiumPulse AI

**Frontend Mockup: Smart Stadium & Tournament Operations Platform for FIFA World Cup 2026**

> A pure frontend React/TypeScript application with simulated real-time data and mock APIs that demonstrates crowd management, indoor navigation, decision support, multi-language assistance, and volunteer coordination for FIFA World Cup 2026 stadium operations.

---

## 🎯 How This Solves the Problem Statement

| Challenge Track | Feature | Implementation |
|---|---|---|
| **Crowd Management** | Live crowd density heatmap + AI forecast | Simulated IoT sensors emit density per zone via local mock timers. AI analyzes trends and generates plain-language predictions ("Gate 4 will hit critical in ~12 mins"). Auto-alert banners redirect fans. |
| **Indoor Navigation** | "Ask StadiumPulse" AI chat | Simulated AI chat uses venue graph metadata (32 zones, walk times) to return step-by-step directions with walk-time estimates. |
| **Real-Time Decision Support** | Organizer AI query panel + auto-summaries | Organizers query operations and receive ranked action recommendations. A situation summary is auto-generated periodically for shift handovers. |
| **Multi-Language Assistance** | 6-language support + broadcast translation | Language selector (EN/ES/FR/PT/AR/HI). All simulated AI responses support multi-language translation. |
| **Volunteer Coordination** | Task queue + AI incident categorization | One-tap incident reporting with simulated AI auto-categorization (medical/security/crowd/facility) and severity assessment. Task queue with accept/start/complete workflow. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND ONLY (React 18 + Vite)                   │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │ Fan View │ │ Organizer  │ │Volunteer │ │ Security Panel  │  │
│  │ Map+Chat │ │ Dashboard  │ │ TaskQueue│ │ Monitoring      │  │
│  └────┬─────┘ └─────┬──────┘ └────┬─────┘ └────────┬────────┘  │
│       └──────────────┴─────────────┴────────────────┘           │
│  [TailwindCSS v4] [shadcn/ui] [Zustand State]                  │
│                                                                 │
│  [Simulated WebSocket Engine]   [Local Mock API Services]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### 1. Install dependencies
From the project root directory:
```bash
cd client
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open the App
Navigate to `http://localhost:5173`

#### Demo Accounts:
Use any email and password to log in (fake login), or click one of the demo buttons for quick role access:

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
│       ├── hooks/             # Custom React hooks (useSocket mock)
│       ├── pages/             # Route pages (lazy-loaded)
│       ├── services/          # Local mockup API & socket services
│       ├── stores/            # Zustand state stores (auth, crowd)
│       └── types/             # Shared TypeScript types
├── netlify.toml                # Netlify deployment configuration
└── README.md                  # This file
```

---

## 🔧 Tech Stack Rationale

| Technology | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Instant HMR, tree-shaking, optimized dev experience |
| Styling | TailwindCSS v4 + shadcn/ui | CSS-first config, accessible components, rapid iteration |
| State | Zustand | Lightweight, no-boilerplate state store |
| Simulated Real-time | Local intervals & stores | Fully client-side real-time data updates without server dependency |

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

## 📜 License

Built for the FIFA World Cup 2026 Hackathon. All rights reserved.