const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('package.json defines repository automation scripts', () => {
  const packageJson = JSON.parse(readFile('package.json'));

  assert.equal(packageJson.scripts.test, 'node --test tests/repo-governance.test.js');
  assert.equal(packageJson.scripts.lint, 'node scripts/repo-quality-check.js lint');
  assert.equal(packageJson.scripts.build, 'node scripts/repo-quality-check.js build');
});

test('security policy has private disclosure path with response and fix targets', () => {
  const securityPolicy = readFile('SECURITY.md');

  assert.match(securityPolicy, /private/i);
  assert.match(securityPolicy, /14\s*day|14-day|14 days/i);
  assert.match(securityPolicy, /60\s*day|60-day|60 days/i);
});

test('ci workflow enforces lint, test, and build execution', () => {
  const ciWorkflow = readFile('.github/workflows/ci.yml');

  assert.match(ciWorkflow, /npm run lint/);
  assert.match(ciWorkflow, /npm run test/);
  assert.match(ciWorkflow, /npm run build/);
});

test('lint and build automation scripts execute successfully', () => {
  execFileSync('node', ['scripts/repo-quality-check.js', 'lint'], {
    cwd: repoRoot,
    stdio: 'pipe'
  });

  execFileSync('node', ['scripts/repo-quality-check.js', 'build'], {
    cwd: repoRoot,
    stdio: 'pipe'
  });
});
