#!/bin/bash
set -e

# Source secrets
source ~/.secrets

# Run the summary generator
cd ~/repos/accountability-dashboard
npx tsx scripts/generate-summaries.ts
