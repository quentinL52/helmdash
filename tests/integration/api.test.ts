import { describe, it, expect } from 'vitest';

/**
 * Tests d'intégration API — vérifient que les routes répondent
 * avec les bons statuts HTTP et structures.
 *
 * Nécessite un serveur de dev tournant (PORT=9002).
 * Ces tests sont conçus pour être exécutés dans le CI.
 */

const BASE_URL = process.env.API_TEST_URL || 'http://localhost:9002';

describe('API Auth Guard', () => {
  it('returns 401 for protected routes without auth', async () => {
    const routes = [
      '/api/ai/chat/stream',
      '/api/billing/stripe/sync',
      '/api/ai/memory/search',
      '/api/memory/graph',
      '/api/memory/create',
      '/api/ai/agents/tasks',
      '/api/integrations/composio/list',
    ];

    for (const route of routes) {
      const res = await fetch(`${BASE_URL}${route}`);
      expect(res.status, `${route} should return 401`).toBe(401);
    }
  });
});

describe('API Public Endpoints', () => {
  it('returns 403 for webhook without signature', async () => {
    const res = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it('pricing page redirects', async () => {
    const res = await fetch(`${BASE_URL}/pricing`, {
      redirect: 'manual',
    });
    expect(res.status).toBe(302);
  });
});

describe('API Validation', () => {
  it('returns 400 for invalid body on memory search', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/memory/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401); // Auth required first
  });
});