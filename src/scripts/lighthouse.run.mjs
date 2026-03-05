import { execSync } from 'node:child_process';

const baseRef = process.env.LHCI_BASE_REF ?? 'origin/main';

function getChangedFiles() {
  try {
    const out = execSync(`git diff --name-only ${baseRef}...HEAD`, { encoding: 'utf8' }).trim();
    return out ? out.split('\n') : [];
  } catch {
    const out = execSync(`git diff --name-only HEAD~1..HEAD`, { encoding: 'utf8' }).trim();
    return out ? out.split('\n') : [];
  }
}

const RELEVANT_PATTERNS = [
  /^src\//,
  /^public\//,
  /^next\.config\.(js|mjs|ts)$/,
  /^middleware\.(js|ts)$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^pnpm-lock\.yaml$/,
  /^yarn\.lock$/,
];

const changed = getChangedFiles();
const relevant = changed.filter((f) => RELEVANT_PATTERNS.some((rx) => rx.test(f)));

if (relevant.length === 0) {
  console.log('LHCI skipped: no relevant files changed.');
  process.exit(1);
}

console.log('LHCI will run. Relevant changes:');
for (const f of relevant) console.log(`- ${f}`);
process.exit(0);
