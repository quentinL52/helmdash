#!/usr/bin/env bash
# ============================================================
# Helmdash — Auth Check Script
# ============================================================
# Vérifie que toutes les routes IA retournent 401 sans cookie.
# Usage: ./scripts/check-auth.sh
# Branché CI pour garantir que les routes sont protégées.
# ============================================================
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}"

echo "==> Vérification des routes IA (attente 401 sans auth)..."

ROUTES=(
  "/api/ai"
  "/api/ai/chat/stream"
  "/api/ai/models"
  "/api/ai/weekly-report"
  "/api/ai/agents/coach"
  "/api/ai/agents/crm"
  "/api/ai/agents/content"
  "/api/ai/market-scan"
  "/api/ai/competitor-profile"
  "/api/ai/competitive-intelligence"
  "/api/ai/strategic-recommendations"
  "/api/billing/stripe/sync"
  "/api/memory/extract-entities"
)

FAILED=0
for route in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}${route}" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null || echo "000")
  
  # GET routes
  if [ "$STATUS" = "000" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${route}?provider=openai" 2>/dev/null || echo "000")
  fi

  if [ "$STATUS" = "401" ]; then
    echo "  ✓ 401 ${route}"
  else
    echo "  ✗ ${STATUS} ${route} (expected 401)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "==> ✅ Toutes les routes sont protégées (${#ROUTES[@]} vérifiées)"
else
  echo "==> ❌ ${FAILED} route(s) non protégée(s)"
  exit 1
fi