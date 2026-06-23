# 🚀 IgniteHQ - Founder Dashboard

IgniteHQ est le tableau de bord ultime pour les fondateurs en phase de préparation (Pre-MVP). Conçu avec un design rétro-pixel captivant et un moteur de gamification puissant, il vous aide à structurer vos idées, suivre votre trésorerie, vos stratégies Go-To-Market et interagir avec des agents IA spécialisés.

## ✨ Fonctionnalités Principales

- **🎮 Moteur de Gamification complet** : Système de points d'expérience (XP), niveaux (Dreamer à Unicorn), quêtes hebdomadaires, "streaks" (assiduité) et succès (Achievements).
- **🤖 IA Multi-Providers** : Des agents spécialisés (Coach, Content Creator, CRM Manager) alimentés par le modèle de votre choix (Mistral, Anthropic, OpenAI, Gemini).
- **📊 14 Widgets dynamiques** : Finance (Runway), OKR, CRM, Lean Canvas, etc. Tous personnalisables avec drag & drop sur une grille adaptative.
- **📱 Responsive & Dark Mode** : Interface rétro (fonts pixel art, palette dark-mode) fluide sur mobile et desktop.

## ⚙️ Installation & Lancement

1. **Cloner ou télécharger le projet.**
2. **Installer les dépendances** :
   ```bash
   npm install
   ```
3. **Configurer les variables d'environnement** :
   Copiez le fichier d'exemple et renseignez vos clés d'API. Vous n'avez besoin que d'une seule clé pour que l'IA fonctionne, mais vous pouvez configurer les 4.
   ```bash
   cp .env.example .env.local
   ```
4. **Lancer l'application en développement** :
   ```bash
   npm run dev
   ```
5. **Accéder à l'application** via `http://localhost:3000`.

## 🧠 Architecture des Agents IA

IgniteHQ utilise une architecture hybride. Le `AgentOrchestrator` gère le routage vers le bon adaptateur en fonction des clés d'API fournies.

- **Adaptateurs** : `/src/lib/ai/adapters/` (OpenAI, Mistral, Anthropic, Gemini).
- **Store** : Les clés peuvent être renseignées de manière dynamique dans l'application (via les paramètres de l'UI), ce qui override les variables du `.env.local`.

## 🏗️ Build de Production

Le projet compile à 100% avec TypeScript Strict :
```bash
npm run build
npm start
```
