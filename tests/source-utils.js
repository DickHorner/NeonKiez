"use strict";

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function findMatchingIndex(source, startIndex, openChar, closeChar) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let i = startIndex; i < source.length; i++) {
    const current = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (current === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (current === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inSingle || inDouble || inTemplate) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (current === "\\") {
        escaped = true;
        continue;
      }
      if (inSingle && current === "'") {
        inSingle = false;
      } else if (inDouble && current === "\"") {
        inDouble = false;
      } else if (inTemplate && current === "`") {
        inTemplate = false;
      }
      continue;
    }

    if (current === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (current === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (current === "'") {
      inSingle = true;
      continue;
    }
    if (current === "\"") {
      inDouble = true;
      continue;
    }
    if (current === "`") {
      inTemplate = true;
      continue;
    }

    if (current === openChar) {
      depth += 1;
      continue;
    }

    if (current === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  throw new Error("No matching token found");
}

function extractFunctionSource(source, functionName) {
  const sourceFile = ts.createSourceFile(
    "source.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  let foundNode = null;

  function visit(node) {
    if (foundNode) {
      return;
    }
    if (ts.isFunctionDeclaration(node) && node.name && node.name.text === functionName) {
      foundNode = node;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (!foundNode) {
    throw new Error("Function not found: " + functionName);
  }

  return source.slice(foundNode.getStart(sourceFile), foundNode.getEnd());
}

function extractConstArraySource(source, constName) {
  const pattern = new RegExp("const\\s+" + constName + "[^=]*=\\s*\\[");
  const match = pattern.exec(source);
  if (!match) {
    throw new Error("Const array not found: " + constName);
  }

  const start = source.indexOf("[", source.indexOf("=", match.index));
  const end = findMatchingIndex(source, start, "[", "]");
  return source.slice(start, end + 1);
}

function loadFunctionsFromFile(relativePath, functionNames, context = {}) {
  const source = readRepoFile(relativePath);
  const snippets = functionNames.map((name) => extractFunctionSource(source, name));
  const script = snippets.join("\n\n") + "\nmodule.exports = {" + functionNames.join(", ") + "};";
  const transpiled = ts.transpileModule(script, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  }).outputText;
  const sandbox = {
    module: { exports: {} },
    exports: {},
    require,
    console,
    JSON,
    Math,
    Object,
    Array,
    Number,
    String,
    Boolean,
    isFinite,
    ...context,
  };

  vm.runInNewContext(transpiled, sandbox, { filename: relativePath });
  return sandbox.module.exports;
}

module.exports = {
  extractConstArraySource,
  extractFunctionSource,
  loadFunctionsFromFile,
  readRepoFile,
};
