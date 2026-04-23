#!/bin/bash
set -e

BASE="http://localhost:8080"
PYTHON_BASE="http://localhost:8000"

echo ""
echo "=========================================="
echo "  ZASTRA API END-TO-END TEST"
echo "=========================================="

# ── 1. Check Python scraper health ────────────────────────────────
echo ""
echo "--- [0] Python Scraper health ---"
curl -s "$PYTHON_BASE/" 2>&1 | head -c 300 || echo "❌ Python scraper unreachable"

# ── 2. Register ──────────────────────────────────────────────────
echo ""
echo "--- [1] Register ---"
REG=$(curl -s -X POST "$BASE/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"apitester","email":"apitester@zastra.dev","password":"test123"}')
echo "$REG"
TOKEN=$(echo "$REG" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "--- [1b] Already registered — logging in ---"
  LOGIN=$(curl -s -X POST "$BASE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"apitester@zastra.dev","password":"test123"}')
  echo "$LOGIN"
  TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
fi

echo "TOKEN = ${TOKEN:0:40}..."

# ── 3. Sync GitHub ────────────────────────────────────────────────
echo ""
echo "--- [2] Sync GitHub (torvalds) ---"
curl -s -X POST "$BASE/api/v1/integrations/github/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"torvalds"}'

# ── 4. Sync LeetCode ─────────────────────────────────────────────
echo ""
echo "--- [3] Sync LeetCode (neal_wu) ---"
curl -s -X POST "$BASE/api/v1/integrations/leetcode/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"neal_wu"}'

# ── 5. Trigger sync-all (returns PENDING fast) ───────────────────
echo ""
echo "--- [4] Trigger sync-all (background) ---"
curl -s -X POST "$BASE/api/v1/integrations/sync-all" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "--- Waiting 20s for background scrape to complete ---"
sleep 20

# ── 6. Poll activity endpoints ───────────────────────────────────
echo ""
echo "--- [5] GET /activity/global ---"
curl -s "$BASE/api/v1/activity/global" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "--- [6] GET /activity/github ---"
curl -s "$BASE/api/v1/activity/github" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "--- [7] GET /activity/contest ---"
curl -s "$BASE/api/v1/activity/contest" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "--- [8] GET /activity/heatmap (first 300 chars) ---"
curl -s "$BASE/api/v1/activity/heatmap" \
  -H "Authorization: Bearer $TOKEN" | head -c 400

echo ""
echo "--- [9] GET /api/v1/gamification/summary ---"
curl -s "$BASE/api/v1/gamification/summary" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "=========================================="
echo "  TEST COMPLETE"
echo "=========================================="
