import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const changelogPath = resolve(root, 'CHANGELOG.md');
const statePath = resolve(root, '.changelog-last-commit');

const today = new Date().toISOString().slice(0, 10);

const getLastCommit = () => {
  if (existsSync(statePath)) {
    return readFileSync(statePath, 'utf-8').trim();
  }
  return '';
};

const getHeadCommit = () => execSync('git rev-parse HEAD').toString().trim();

const getCommitSubjects = (range) => {
  const cmd = range ? `git log ${range} --pretty=format:%s` : 'git log -n 25 --pretty=format:%s';
  const output = execSync(cmd).toString().trim();
  return output ? output.split('\n').filter(Boolean) : [];
};

const lastCommit = getLastCommit();
const headCommit = getHeadCommit();

if (lastCommit && lastCommit === headCommit) {
  console.log('No new commits since last changelog update.');
  process.exit(0);
}

const range = lastCommit ? `${lastCommit}..HEAD` : '';
const subjects = getCommitSubjects(range);

if (subjects.length === 0) {
  console.log('No commit subjects found.');
  process.exit(0);
}

const header = `## ${today}`;
const bullets = subjects.map((s) => `- ${s}`).join('\n');
const entry = `${header}\n${bullets}\n\n`;

const existing = existsSync(changelogPath) ? readFileSync(changelogPath, 'utf-8') : '# Changelog\n\n';
const updated = existing.startsWith('# Changelog')
  ? `${existing.trim()}\n\n${entry}`
  : `# Changelog\n\n${entry}${existing}`;

writeFileSync(changelogPath, updated);
writeFileSync(statePath, headCommit + '\n');

console.log('Changelog updated.');
