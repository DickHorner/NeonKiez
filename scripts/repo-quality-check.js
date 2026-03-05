#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const mode = process.argv[2];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function assertFileExists(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${relativePath}`);
    return null;
  }
  return fullPath;
}

function readJson(relativePath) {
  const fullPath = assertFileExists(relativePath);
  if (!fullPath) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function runLintChecks() {
  const packageJson = readJson('package.json');
  readJson('pxt.json');
  readJson('tsconfig.json');

  if (packageJson && typeof packageJson.scripts === 'object') {
    const requiredScripts = ['test', 'lint', 'build'];
    for (const scriptName of requiredScripts) {
      if (!packageJson.scripts[scriptName]) {
        fail(`package.json is missing scripts.${scriptName}`);
      }
    }
  } else {
    fail('package.json is missing scripts block');
  }

  const securityPath = assertFileExists('SECURITY.md');
  if (securityPath) {
    const securityContent = fs.readFileSync(securityPath, 'utf8');
    if (!/14\s*day|14-day|14 days/i.test(securityContent)) {
      fail('SECURITY.md must include a 14-day response target');
    }
    if (!/60\s*day|60-day|60 days/i.test(securityContent)) {
      fail('SECURITY.md must include a 60-day fix target');
    }
  }

  const workflowPath = assertFileExists('.github/workflows/ci.yml');
  if (workflowPath) {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const requiredCommands = ['npm run lint', 'npm run test', 'npm run build'];
    for (const command of requiredCommands) {
      if (!workflowContent.includes(command)) {
        fail(`ci workflow is missing step: ${command}`);
      }
    }
  }
}

function runBuildChecks() {
  const pxtJson = readJson('pxt.json');
  if (!pxtJson || !Array.isArray(pxtJson.files)) {
    fail('pxt.json must include a files array');
    return;
  }

  const seen = new Set();
  for (const projectFile of pxtJson.files) {
    if (seen.has(projectFile)) {
      fail(`Duplicate entry in pxt.json files: ${projectFile}`);
      continue;
    }
    seen.add(projectFile);

    const fullPath = assertFileExists(projectFile);
    if (!fullPath) {
      continue;
    }

    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      fail(`Project file is empty: ${projectFile}`);
    }
  }
}

if (mode === 'lint') {
  runLintChecks();
} else if (mode === 'build') {
  runBuildChecks();
} else {
  console.error('Usage: node scripts/repo-quality-check.js <lint|build>');
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(`Repository ${mode} checks passed.`);
}
