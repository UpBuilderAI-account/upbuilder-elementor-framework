#!/usr/bin/env node
/**
 * Drift advisory for WIDGET_REGISTRY.defaultProps.
 *
 * The Styles Panel inspector relies on `defaultProps` to know which authored
 * props match a default and should be hidden. If a registry default doesn't
 * correspond to anything in components.tsx (neither a destructured default
 * nor a `props.X ?? Y` fallback), the panel will incorrectly mark the prop
 * as non-default whenever it's set to that value.
 *
 * NOTE: this script is **advisory** — many defaults are applied indirectly
 * via mappers (mapWidgetProps), in props-to-settings, or at the Elementor
 * setting level. Those are valid even though they don't appear textually in
 * components.tsx. Treat warnings as a prompt to review, not as a failure.
 *
 * Run: `node scripts/check-default-props-drift.cjs`
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'src/widgets/registry.ts');
const COMPONENTS_PATH = path.join(ROOT, 'src/builder/abstraction/components.tsx');

const registrySrc = fs.readFileSync(REGISTRY_PATH, 'utf8');
const componentsSrc = fs.readFileSync(COMPONENTS_PATH, 'utf8');

// =============================================================================
// PARSE REGISTRY: walk per-entry by tracking brace depth
// =============================================================================

function parseRegistry(src) {
  const startMatch = src.match(/WIDGET_REGISTRY[^=]*=\s*\{/);
  if (!startMatch) throw new Error('Could not find WIDGET_REGISTRY = {');
  let i = startMatch.index + startMatch[0].length;

  const entries = [];
  let depth = 1; // we're inside the outer {

  while (i < src.length && depth > 0) {
    // Skip whitespace + comments
    while (i < src.length && /[\s,]/.test(src[i])) i++;
    if (src[i] === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (src[i] === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (src[i] === '}') { depth--; i++; continue; }

    // Match KEY: { ... } at depth 1
    if (depth === 1) {
      const keyMatch = src.slice(i).match(/^['"]?([\w-]+)['"]?\s*:\s*\{/);
      if (!keyMatch) { i++; continue; }
      const widgetKey = keyMatch[1];
      i += keyMatch[0].length;
      // Walk until matching close brace
      const start = i;
      let entryDepth = 1;
      while (i < src.length && entryDepth > 0) {
        if (src[i] === '{') entryDepth++;
        else if (src[i] === '}') entryDepth--;
        if (entryDepth > 0) i++;
      }
      const body = src.slice(start, i);
      i++; // consume closing }
      entries.push({ widgetKey, body });
    } else {
      i++;
    }
  }
  return entries;
}

function extractDefaultPropsBlock(entryBody) {
  const m = entryBody.match(/defaultProps\s*:\s*\{([\s\S]*?)\n\s*\}/);
  if (!m) return null;
  const inner = m[1];
  const props = [];
  for (const pm of inner.matchAll(/(\w+):\s*([^,\n]+)/g)) {
    const name = pm[1];
    let raw = pm[2].trim();
    raw = raw.replace(/,$/, '').trim();
    // Strip quotes for string literals
    let value = raw;
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    props.push({ name, value, raw });
  }
  return props;
}

function extractUpbuilderType(entryBody) {
  const m = entryBody.match(/upbuilderType:\s*'([^']+)'/);
  return m ? m[1] : null;
}

// =============================================================================
// CHECK
// =============================================================================

function isPresentInSource(src, propName, value) {
  const escValue = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // (a) destructured default: `propName = 'value'` or `propName = value`
  const destructuredRe = new RegExp(`\\b${propName}\\s*=\\s*['"\`]?${escValue}['"\`]?`);
  // (b) fallback: `props.propName ?? 'value'` or `props.propName ?? value`
  const fallbackRe = new RegExp(`props\\.${propName}\\s*\\?\\?\\s*['"\`]?${escValue}['"\`]?`);
  return destructuredRe.test(src) || fallbackRe.test(src);
}

const entries = parseRegistry(registrySrc);
let total = 0;
const warnings = [];

for (const { widgetKey, body } of entries) {
  const props = extractDefaultPropsBlock(body);
  if (!props) continue;
  const upbuilderType = extractUpbuilderType(body) || '?';
  for (const { name, value } of props) {
    total++;
    if (!isPresentInSource(componentsSrc, name, value)) {
      warnings.push({ widgetKey, upbuilderType, name, value });
    }
  }
}

if (warnings.length === 0) {
  console.log(`OK: all ${total} defaultProps entries match a destructured default or props.X ?? Y in components.tsx`);
  process.exit(0);
}

console.log(`Advisory: ${warnings.length}/${total} defaultProps entries could not be traced to components.tsx`);
console.log(`(many of these are valid — defaults applied via mappers, props-to-settings, or Elementor itself)\n`);
for (const w of warnings) {
  console.log(`  - ${w.widgetKey} <${w.upbuilderType}>.${w.name} = ${JSON.stringify(w.value)}`);
}
console.log(`\nReview manually. Update components.tsx to make defaults explicit, or accept that`);
console.log(`the registry default is the canonical source for the inspector panel.`);
process.exit(0); // Advisory only — never blocks
