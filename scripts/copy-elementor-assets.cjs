const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'elementor-defaults');
const target = path.join(root, 'dist', 'elementor-defaults');

function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
      continue;
    }

    if (entry.name.endsWith('.ts')) continue;
    fs.copyFileSync(srcPath, dstPath);
  }
}

copyDir(source, target);
console.log(`Copied Elementor defaults to ${path.relative(root, target)}`);
