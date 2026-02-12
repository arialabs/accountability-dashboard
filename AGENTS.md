# Agent Instructions for accountability-dashboard

## ⚠️ CRITICAL: Large Data Files
DO NOT read these files directly - they are too large and will blow your context:
- `src/data/trades-by-member.json` (75MB)
- `src/data/positions.json` (2MB)
- `src/data/key-votes.json` (1.4MB)
- `src/data/house-disclosures.json` (728KB)
- `src/data/alignment-scores.json` (380KB)
- `src/data/members.json` (261KB)

Instead:
- Read the TypeScript files that IMPORT these (e.g., `src/lib/data.ts`)
- Use `head -50` or `jq` to sample a few records
- Check types in `src/lib/types.ts`

## Project Structure
- `src/app/` — Next.js app router pages
- `src/components/` — React components
- `src/lib/` — Data utilities, types, helpers
- `src/data/` — Static JSON data files (DO NOT read directly)
- `pipeline/` — Data collection scripts
- `scripts/` — Build/utility scripts
