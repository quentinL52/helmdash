/**
 * Helmdash — PostHog Analytics (cookieless)
 *
 * Suivi d'événements sans cookie, compatible RGPD.
 * Utilise posthog-js côté client uniquement.
 */
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';

let initialized = false;

/**
 * Initialise PostHog (à appeler une fois côté client)
 */
export function initPostHog() {
  if (initialized || typeof window === 'undefined' || !POSTHOG_KEY) return;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // On gère les pageviews manuellement
      capture_pageleave: false,
      loaded: () => {
        initialized = true;
      },
      autocapture: false, // Pas de capture auto — on veut être explicite
      persistence: 'memory', // Pas de cookie — session only
    });
  } catch {
    // Silently fail — analytics non-bloquant
  }
}

/**
 * Track un événement utilisateur.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // Silently fail
  }
}

/**
 * Identifie l'utilisateur (après login).
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  try {
    posthog.identify(userId, traits);
  } catch {
    // Silently fail
  }
}

/**
 * Track une page vue.
 */
export function trackPageView(pageName: string) {
  trackEvent('$pageview', { page: pageName });
}

/**
 * Track un appel agent IA.
 */
export function trackAgentCall(agentId: string, duration: number, status: 'success' | 'error') {
  trackEvent('agent_call', {
    agent_id: agentId,
    duration_ms: Math.round(duration),
    status,
  });
}

/**
 * Track un tool call agent.
 */
export function trackToolCall(toolName: string, status: 'success' | 'error') {
  trackEvent('tool_call', {
    tool: toolName,
    status,
  });
}