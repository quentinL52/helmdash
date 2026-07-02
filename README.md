# 🚀 Helmdash — AI Co-Founder for Solo Founders

**Helmdash** is the ultimate dashboard for pre-MVP founders. Designed with a captivating retro-pixel theme and a powerful gamification engine, it helps you structure ideas, track runway, manage GTM strategies, and interact with specialized AI agents.

## ✨ Key Features

- **🎮 Full Gamification Engine**: XP system, levels (Dreamer → Unicorn), weekly quests, streaks, and achievements.
- **🤖 Multi-Provider AI**: Specialized agents (Co-Founder, CFO, Growth, Research, Content) powered by your choice of model (Mistral, Anthropic, OpenAI, Gemini).
- **📊 Dynamic Dashboard**: Finance (Runway), OKR, CRM, Lean Canvas, and more — all customizable with drag & drop on an adaptive grid.
- **📱 Responsive & Dark Mode**: Retro pixel-art fonts, dark-mode palette, fluid on mobile and desktop.

## ⚙️ Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in at least one AI provider key and your Supabase credentials.

3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. **Access the app** at `http://localhost:3000`.

## 🧠 AI Agent Architecture

Helmdash uses a hybrid agent architecture. The `AgentOrchestrator` routes requests to the right adapter based on configured API keys.

- **Adapters**: `/src/lib/ai/adapters/` (OpenAI, Mistral, Anthropic, Gemini).
- **BYOK**: API keys can be configured dynamically in-app (Settings → AI & API Keys), overriding `.env.local` values.

## 🏗️ Production Build

```bash
npm run build
npm start
```

Built with Next.js 14, TypeScript Strict, Tailwind CSS, Prisma + Supabase.
