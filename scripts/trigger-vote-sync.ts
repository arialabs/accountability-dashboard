#!/usr/bin/env tsx
/**
 * Manual vote-sync trigger via GitHub Actions workflow_dispatch endpoint.
 *
 * Required env:
 * - GITHUB_OWNER
 * - GITHUB_REPO
 * - GITHUB_TOKEN (repo/actions permission)
 *
 * Optional env:
 * - LOOKBACK_DAYS (defaults to 7)
 */

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const token = process.env.GITHUB_TOKEN;
const lookbackDays = process.env.LOOKBACK_DAYS || '7';

if (!owner || !repo || !token) {
  console.error('Missing required env vars: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN');
  process.exit(1);
}

const endpoint = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/vote-sync.yml/dispatches`;

async function main() {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        lookback_days: lookbackDays,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Trigger failed: ${response.status} ${response.statusText}`);
    console.error(text);
    process.exit(1);
  }

  console.log('Vote sync workflow dispatch sent successfully.');
}

main().catch((error) => {
  console.error('Failed to trigger vote sync workflow:', error);
  process.exit(1);
});
