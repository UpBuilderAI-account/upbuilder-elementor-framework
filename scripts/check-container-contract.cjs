const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const sourcePath = path.resolve(__dirname, '../src/builder/abstraction/components.tsx');
const sourceText = fs.readFileSync(sourcePath, 'utf8');
const sourceFile = ts.createSourceFile(
  sourcePath,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

function findVariable(name) {
  let match = null;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === name
    ) {
      match = node;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return match;
}

function fail(message) {
  console.error(`Container contract failed: ${message}`);
  process.exit(1);
}

const container = findVariable('Container');
const grid = findVariable('Grid');
if (!container?.initializer) fail('Container implementation was not found');
if (!grid?.initializer) fail('Grid implementation was not found');

const containerText = container.initializer.getText(sourceFile);
const gridText = grid.initializer.getText(sourceFile);
const gridBranchMatch = containerText.match(/if \(layout === 'grid'\) \{[\s\S]*?\n  \}/);
if (!gridBranchMatch) fail('Container grid branch was not found');

const gridBranch = gridBranchMatch[0];
if (!gridBranch.includes('React.createElement(Grid as React.FC<InternalGridProps>')) {
  fail('named grid containers must render through Grid');
}
if (!gridBranch.includes('__upComponentName: name')) {
  fail('named grid containers must preserve their layers-panel name');
}
if (gridBranch.includes('React.createElement(Section')) {
  fail('grid containers must never downgrade to the flex Section component');
}
if (!gridText.includes("'data-up-container-name': sectionName")) {
  fail('Grid preview must expose the preserved container name');
}
if (!gridText.includes('data-up-container-layout="grid"')) {
  fail('Grid preview must identify itself as a grid layout');
}

console.log('Container named-grid contract passed');
