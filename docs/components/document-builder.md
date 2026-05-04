# DocumentBuilder

## Purpose

`DocumentBuilder` is the runtime document context for the Elementor JSX abstraction. In JSON mode, child containers and widgets register `ElementorElement` objects into the document context. In preview mode, it also wraps the tree in Elementor-compatible preview markup and a `CSSProvider`.

This component is for React rendering/runtime collection. For static JSX compilation, use the exported compiler path (`compileReactPage` from `src/builder/abstraction/index.tsx`, currently not re-exported from the package root).

## Import path and export name

```tsx
import { DocumentBuilder, useDocument } from '@upbuilder/elementor-framework';
```

Package root export comes from `upbuilder-elementor-framework/src/index.ts`, re-exporting `DocumentBuilder` and `useDocument` from `./builder/abstraction`.

## TypeScript props and fields

```ts
interface DocumentBuilderProps {
  title?: string;
  children: React.ReactNode;
  onBuild?: (doc: ElementorDocument) => void;
}

interface ElementorDocument {
  title?: string;
  status?: string;
  type?: string;
  version?: string;
  settings?: Record<string, unknown>;
  page_settings?: Record<string, unknown>;
  elements: ElementorElement[];
}

interface ElementorElement {
  id: string;
  elType: 'container' | 'widget';
  widgetType?: string;
  settings: Record<string, unknown>;
  elements?: ElementorElement[];
  isInner?: boolean;
}
```

`DocumentBuilderProps` is local to the abstraction file and is not exported as a named type from the root package.

## Defaults and required props

- `children` is required.
- `title` defaults to `Untitled`.
- `onBuild` is optional. Without it, JSON mode still provides context, but callers do not receive the collected document.
- Runtime output from `onBuild` uses `status: 'publish'`, `type: 'page'`, `version: '0.4'`, empty `settings`, empty `page_settings`, and collected root `elements`.
- `documentId` is generated once with `generateElementId()`.

## Responsive support

`DocumentBuilder` itself has no responsive props. Responsive behavior is provided by child components through `ResponsiveValue<T>` objects (`{ desktop, tablet, mobile }`) and preview CSS media queries at `max-width: 1024px` and `max-width: 767px`.

## Elementor JSON and settings mapping

`DocumentBuilder` does not map visual settings. It builds this document shape:

```json
{
  "title": "Page title",
  "status": "publish",
  "type": "page",
  "version": "0.4",
  "settings": {},
  "page_settings": {},
  "elements": []
}
```

Child registration happens through `useDocument().addElement(element, parentId)`.

- Root elements are tracked in insertion order in `rootElementsRef`.
- Nested elements are pushed into the parent element's `elements` array when `parentId` is present.
- `getElements()` returns the root element objects by root id.

Generator utilities use a similar document shape but with small differences:

- `buildDocument()` defaults `page_settings.hide_title` to `yes`.
- `compileReactPage()` returns `type: 'wp-page'`.
- `createDocument()` returns `type: 'page'`.

## Preview and render behavior

In preview mode (`useIsPreviewMode()` returns true), `DocumentBuilder` renders:

```html
<div class="elementor elementor-{documentId}">
  ...
</div>
```

The wrapper is inside `CSSProvider`, allowing descendant `StyleTag` components to collect and render generated CSS. In JSON mode, it renders only `DocumentContext.Provider` and lets child components register themselves via `useEffect`.

`useDocument()` throws `useDocument must be used within a DocumentBuilder` if called outside this context.

## Parser and export notes

The backend parser (`backendv2/src/generators/react/react-parser.ts`) does not use `DocumentBuilder` as the source of export structure. It scans section files, page files, JSX component names, props, CSS classes, and page order. Important related behavior:

- Section-like files under `/sections/`, `/shared/`, or `/global-components/` are parsed into `ParsedSection` records.
- Page files are parsed separately to determine section order and page wrapper metadata.
- `getAllElements()` creates a synthetic `page_wrapper` root, then `buildElementorTree()` unwraps `page_wrapper` so sections become direct Elementor template content.
- JSX props recognized as Elementor style or widget data are copied into `StructureElement.styleProps` and later converted by `mergeStylePropsToSettings()`.

The static abstraction compiler in the framework (`compileReactPage`) is separate from backend parsing. It traverses React elements with `__elementorAbstraction` metadata and compiles them directly to `ElementorDocument`.

## Caveats and inconsistencies

- `DocumentBuilder` calls `onBuild` in a `useEffect`. Child components also register via effects, so an early callback can observe incomplete elements depending on React effect ordering and render timing.
- `addElement()` appends to parent/root arrays without deduplication. Repeated mounts or React Strict Mode double effects can duplicate entries.
- The runtime document uses `type: 'page'`; `compileReactPage()` uses `type: 'wp-page'`; template builder metadata defaults to Elementor canvas and `hide_title: 'yes'`.
- `DocumentBuilderProps` and `compileReactPage` are not exported from the root package type export list, although `DocumentBuilder` itself is exported.
- Backend export does not require `DocumentBuilder`; it reads project files directly.

## Compact TSX example

```tsx
import {
  DocumentBuilder,
  Section,
  Flexbox,
  Heading,
  Button,
} from '@upbuilder/elementor-framework';

export function ExamplePage() {
  return (
    <DocumentBuilder
      title="Landing Page"
      onBuild={(doc) => console.log(JSON.stringify(doc, null, 2))}
    >
      <Section direction="column" gap={24} padding={48} contentWidth="full">
        <Flexbox direction="column" gap={12} boxedWidth={960}>
          <Heading title="Build with Elementor JSON" tag="h1" />
          <Button text="Start" link="/start" />
        </Flexbox>
      </Section>
    </DocumentBuilder>
  );
}
```
