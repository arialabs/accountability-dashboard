#!/usr/bin/env bash
# Refresh all data sources for the accountability dashboard
# Usage: ./scripts/refresh-all-data.sh [--quick]
#
# --quick: Only fetch members + votes (skip slow scrapers)
#
# Requires: CONGRESS_API_KEY, FEC_API_KEY in environment
# Run: source ~/.secrets && ./scripts/refresh-all-data.sh

set -euo pipefail
cd "$(dirname "$0")/.."

QUICK=false
[[ "${1:-}" == "--quick" ]] && QUICK=true

echo "=================================================="
echo "🔄 Full Data Refresh — $(date)"
echo "=================================================="

# Check API keys
if [ -z "${CONGRESS_API_KEY:-}" ]; then
  echo "⚠️ CONGRESS_API_KEY not set. Trying 1Password..."
  export CONGRESS_API_KEY=$(op read "op://Aria Labs/Congress.Gov/credential" 2>/dev/null || echo "")
fi
if [ -z "${FEC_API_KEY:-}" ]; then
  echo "⚠️ FEC_API_KEY not set. Trying 1Password..."
  export FEC_API_KEY=$(op read "op://Aria Labs/OpenFEC/credential" 2>/dev/null || echo "")
fi

[ -z "$CONGRESS_API_KEY" ] && echo "❌ CONGRESS_API_KEY required" && exit 1

echo ""
echo "📥 Step 1/6: Fetching members from Congress.gov..."
npx tsx scripts/fetch-members.ts
echo ""

echo "📥 Step 2/6: Fetching House votes from Congress.gov..."
npx tsx scripts/fetch-votes.ts
echo ""

echo "📥 Step 3/6: Fetching VoteView ideology scores..."
npx tsx scripts/fetch-voteview.ts
echo ""

echo "📥 Step 4/6: Fetching committee assignments..."
npx tsx scripts/fetch-committees.ts
echo ""

if [ "$QUICK" = false ]; then
  echo "📥 Step 5/6: Fetching campaign finance from OpenFEC..."
  if [ -n "${FEC_API_KEY:-}" ]; then
    npx tsx scripts/fetch-finance.ts
  else
    echo "  ⚠️ FEC_API_KEY not set, skipping finance data"
  fi
  echo ""

  echo "📥 Step 6/6: Recalculating alignment scores..."
  npx tsx scripts/compute-scores.ts
  echo ""
else
  echo "⏩ Skipping finance + alignment (--quick mode)"
fi

echo ""
echo "=================================================="
echo "✅ Data refresh complete — $(date)"
echo "=================================================="
echo ""
echo "Data files updated:"
ls -la src/data/members.json src/data/key-votes.json src/data/committees.json 2>/dev/null | awk '{print "  " $6, $7, $8, $9}'
echo ""
echo "Next: Run 'npm run build' to verify, then commit + push."
