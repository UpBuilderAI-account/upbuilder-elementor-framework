const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function registerTypeScriptExtension(extension) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    module._compile(output, filename);
  };
}

registerTypeScriptExtension('.ts');
registerTypeScriptExtension('.tsx');

const { Container } = require(path.resolve(
  __dirname,
  '../src/builder/abstraction/components.tsx',
));
const { PreviewModeProvider } = require(path.resolve(
  __dirname,
  '../src/lib/render-mode.tsx',
));
const { resetIdCounter } = require(path.resolve(
  __dirname,
  '../src/lib/id-generator.ts',
));

function fail(message) {
  console.error(`Container render contract failed: ${message}`);
  process.exit(1);
}

function renderContainer(props) {
  resetIdCounter();
  return renderToStaticMarkup(
    React.createElement(
      PreviewModeProvider,
      null,
      React.createElement(
        Container,
        props,
        React.createElement('div', null, 'Content'),
      ),
    ),
  );
}

const namedGrid = renderContainer({
  name: 'CardGrid',
  layout: 'grid',
  cols: 3,
  rows: 2,
  gap: 16,
});
if (!namedGrid.includes('data-up-container-layout="grid"')) {
  fail('named grid did not render with grid semantics');
}
if (!namedGrid.includes('data-up-container-name="CardGrid"')) {
  fail('named grid did not preserve its layers-panel name');
}
if (!namedGrid.includes('e-grid')) {
  fail('named grid did not render the Elementor grid class');
}
if (namedGrid.includes('data-up-container-layout="row"')) {
  fail('named grid was downgraded to a flex row');
}

const unnamedGrid = renderContainer({ layout: 'grid', cols: 2 });
if (!unnamedGrid.includes('data-up-container-layout="grid"')) {
  fail('unnamed grid did not render with grid semantics');
}
if (unnamedGrid.includes('data-up-container-name=')) {
  fail('unnamed grid received a synthetic layers-panel name');
}

const namedColumn = renderContainer({ name: 'HeroSection', layout: 'column' });
if (!namedColumn.includes('data-up-container-layout="column"')) {
  fail('named column no longer uses the flex-column path');
}
if (!namedColumn.includes('data-up-container-name="HeroSection"')) {
  fail('named column no longer preserves its layers-panel name');
}
if (!namedColumn.includes('e-flex')) {
  fail('named column no longer renders the Elementor flex class');
}

console.log('Container runtime render contract passed');
