# Documentation : Veille Stratégique (Intelligence Stratégique)

Le module **Veille Stratégique** (Strategic Intelligence) est conçu pour offrir aux fondateurs une vue à 360° sur leur environnement concurrentiel, leur permettant de prendre des décisions basées sur des données quantitatives et des analyses IA.

## 1. Concepts et Indicateurs Clés

L'application utilise des algorithmes pour quantifier votre positionnement par rapport au marché.

### Health Score (Score de Santé)
Le **Health Score** est une note globale sur 100 qui représente la solidité de votre position concurrentielle. Il est calculé selon une pondération précise de cinq dimensions :

*   **Parité des Fonctionnalités (25%)** : Mesure la couverture de vos fonctionnalités par rapport au meilleur concurrent du marché.
*   **Positionnement Tarifaire (15%)** : Évalue si votre prix est compétitif par rapport à la valeur offerte.
*   **Momentum du Marché (20%)** : Analysé via les signaux récents (actualités, levées de fonds, lancements) des 30 derniers jours.
*   **Force de Différenciation (25%)** : Basé sur le nombre d'avantages uniques et les axes où vous dominez la concurrence (Radar).
*   **Exposition aux Menaces (15%)** : Inverse du niveau de menace moyen des concurrents actifs.

### Classement Compétitif (Competitive Rank)
Détermine votre rang (ex: 1er sur 5) en calculant la moyenne de tous les scores du Radar (Prix, Features, UX, Marché, Innovation, Support) pour chaque entité.

---

## 2. Exploration des Fonctionnalités par Onglet

### [Dashboard](file:///c:/Users/quent/Documents/Projets/airhfounderdashboard/src/app/%28app%29/competitive-watch/components/intelligence-dashboard-tab.tsx)
Le centre de pilotage offrant :
*   **KPIs Temps Réel** : Health Score, Rang, Couverture Features.
*   **Alertes Stratégiques** : Flux de notifications classées par sévérité (Critique, Haute, Moyenne).
*   **Actions Prioritaires** : Recommandations IA directement transformables en tâches de Roadmap ou Hypothèses.
*   **Résumé des Tendances** : Analyse textuelle de l'évolution du marché.

### [Analyse](file:///c:/Users/quent/Documents/Projets/airhfounderdashboard/src/app/%28app%29/competitive-watch/components/analysis-tab.tsx)
Une suite de sous-onglets pour approfondir l'étude :
*   **Matrice de Fonctionnalités** : Comparaison point par point de vos services vs concurrents.
*   **Carte de Positionnement** : Visualisation 2D de la valeur perçue vs le prix.
*   **Pricing** : Analyse détaillée des modèles tarifaires (SaaS, Freemium, Enterprise).
*   **Timeline** : Historique des mouvements stratégiques des acteurs.

### [Radar Compétitif](file:///c:/Users/quent/Documents/Projets/airhfounderdashboard/src/app/%28app%29/competitive-watch/components/radar-tab.tsx)
Un graphique en "toile d'araignée" visualisant 6 axes stratégiques :
1.  **Prix** : Avantage coût.
2.  **Fonctionnalités** : Richesse fonctionnelle.
3.  **UX** : Qualité de l'expérience utilisateur.
4.  **Marché** : Présence et notoriété.
5.  **Innovation** : Capacité à disrupter.
6.  **Support** : Service client et accompagnement.

### [Analyse SWOT](file:///c:/Users/quent/Documents/Projets/airhfounderdashboard/src/app/%28app%29/competitive-watch/components/swot-tab.tsx)
Permet d'analyser chaque concurrent individuellement selon ses **Forces**, **Faiblesses**, **Opportunités** et **Menaces**. Un outil indispensable pour préparer un argumentaire de vente (Kill Sheet).

### [Signaux du Marché](file:///c:/Users/quent/Documents/Projets/airhfounderdashboard/src/app/%28app%29/competitive-watch/components/market-signals-tab.tsx)
Un flux d'actualités structuré collectant les événements impactants :
*   Levées de fonds, changements de prix, recrutements clés, régulations.
*   Filtrage par catégorie et niveau d'urgence.

### [Stratégie IA](file:///c:/Users/quent/Documents/Projets/airhfounderdashboard/src/app/%28app%29/competitive-watch/components/ai-insights-tab.tsx)
L'intelligence artificielle génère des rapports de benchmark "Face-à-Face" :
*   Identification des **Win/Loss** points.
*   Recommandations de pivot ou de focus stratégique.
*   Analyse des vulnérabilités.

---

## 3. Guide d'Utilisation

### Ajouter un concurrent
1.  Allez dans le Dashboard ou l'Analyse.
2.  Cliquez sur **"Ajouter Concurrent"**.
3.  **Astuce** : Utilisez la fonction "Auto-remplir depuis l'URL" pour laisser l'IA extraire automatiquement les données (features, pricing, forces) depuis le site web du concurrent.

### Interpréter le Health Score
*   **> 70 (Vert)** : Vous dominez votre segment ou avez une différenciation très forte.
*   **40 - 70 (Jaune)** : Le marché est saturé ou vous manquez de fonctionnalités clés par rapport aux leaders.
*   **< 40 (Rouge)** : Danger immédiat. Votre solution est soit trop chère, soit technologiquement dépassée.

### Transformer l'intelligence en action
Depuis l'onglet "Dashboard", utilisez le panneau **"Actions Prioritaires"**. Cliquer sur le bouton "+" à côté d'une recommandation permet de l'envoyer directement dans votre **Roadmap** ou de créer une **Hypothèse** de test.
