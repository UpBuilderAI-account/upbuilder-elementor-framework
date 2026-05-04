# Factory Utilities

## Purpose

The abstraction factory utilities create Elementor JSON objects directly without rendering JSX components. They are useful for tests, low-level builders, migrations, and code paths that already have settings objects and child element arrays.

The assigned utilities are:

- `createElement`
- `createDocument`

Related utilities exported from the package root include `generateElementId`, `generateSequentialId`, `resetIdCounter`, `buildTemplate`, `buildDocument`, and serialization helpers, but those live in separate lib/generator modules.

## Import path and export names

```tsx
import { createElement, createDocument } from '@upbuilder/elementor-framework';
```

Package root export comes from `upbuilder-elementor-framework/src/index.ts`, re-exporting both names from `./builder/abstraction`.

## TypeScript signatures and fields

```ts
export function createElement(
  type: 'container' | 'widget',
  widgetType: string | undefined,
  settings: Record<string, any>,
  children?: ElementorElement[]
): ElementorElement;

export function createDocument(
  elements: ElementorElement[],
  options?: {
    title?: string;
    pageSettings?: Record<string, any>;
  }
): ElementorDocument;
```

Returned element shape:

```ts
interface ElementorElement {
  id: string;
  elType: 'container' | 'widget';
  widgetType?: string;
  settings: Record<string, unknown>;
  elements?: ElementorElement[];
  isInner?: boolean;
}
```

Returned document shape:

```ts
interface ElementorDocument {
  title?: string;
  status?: string;
  type?: string;
  version?: string;
  settings?: Record<string, unknown>;
  page_settings?: Record<string, unknown>;
  elements: ElementorElement[];
}
```

## Defaults and required props

`createElement`:

- Requires `type`, `settings`, and an explicit `widgetType` argument.
- `widgetType` may be `undefined` for containers.
- Generates `id` with `generateElementId()`.
- Does not set `isInner`.
- Does not normalize settings.
- Sets `elements` to the provided `children` argument, including `undefined` if omitted.

`createDocument`:

- Requires an `elements` array.
- `title` defaults to `Untitled`.
- `status` is `publish`.
- `type` is `page`.
- `version` is `0.4`.
- `settings` is `{}`.
- `page_settings` defaults to `{}` or `options.pageSettings`.

## Responsive support

The factory utilities do not interpret responsive values. Any responsive support must already be encoded in the supplied `settings` object using Elementor setting keys, for example:

```ts
{
  flex_direction: 'row',
  flex_direction_tablet: 'column',
  flex_direction_mobile: 'column'
}
```

If you need JSX-style responsive prop objects (`{ desktop, tablet, mobile }`) converted to settings, use the component abstraction path or the backend `styleProps` conversion path instead.

## Elementor JSON and settings mapping

`createElement()` is a structural factory only:

```ts
return {
  id: generateElementId(),
  elType: type,
  widgetType,
  settings,
  elements: children,
};
```

It does not know about component-specific mappings like `direction -> flex_direction`, `columns -> grid_columns_grid`, or widget prop names. Callers must pass native Elementor settings.

`createDocument()` wraps an element array:

```ts
return {
  title: options?.title || 'Untitled',
  status: 'publish',
  type: 'page',
  version: '0.4',
  settings: {},
  page_settings: options?.pageSettings || {},
  elements,
};
```

For template metadata, normalization, `hide_title`, or Elementor Pro detection, use generator utilities such as `buildTemplate()` or `buildDocument()`.

## Preview and render behavior

Factory utilities do not render React and do not participate in preview mode. They return plain objects only.

They also do not add `StyleTag`, `CSSProvider`, `DocumentContext`, or `ElementContext` behavior. If the resulting JSON is later rendered by another preview renderer, that renderer must provide CSS generation and DOM output.

## Parser and export notes

The backend parser/export path generally does not call these factories. It builds a `StructureElement` tree from parsed React files, then `backendv2/src/generators/elementor/elementor-builder/element-builder.ts` converts each structure node with `buildElementorElement()`.

Related backend behavior that differs from factories:

- `buildElementorElement()` generates ids through `context.generateId()`.
- It merges class-derived settings, `styleProps`, and widget-specific settings.
- It applies container defaults such as `content_width: 'full'`.
- It resolves `asset://` URLs.
- It computes `isInner` for child containers.
- `buildElementorTree()` unwraps the synthetic `page_wrapper` root so sections become direct template content.

The framework static compiler (`compileReactPage`) also bypasses `createElement()` and directly constructs `ElementorElement` objects from component metadata and mapped props.

## Caveats and inconsistencies

- `createElement()` can create invalid combinations, such as `elType: 'container'` with a `widgetType`, or `elType: 'widget'` without one. There is no validation in the factory.
- `children` maps directly to `elements`; if omitted, `elements` is `undefined`, while component-generated containers usually include `elements: []`.
- No settings normalization is performed. `buildTemplate()` and `buildDocument()` can call `normalizeElements()`; factories do not.
- `createDocument()` does not set `page_settings.hide_title`, while generator `buildDocument()` does.
- `createDocument()` uses `type: 'page'`; `compileReactPage()` uses `type: 'wp-page'`.
- `isInner` must be supplied manually if needed.

## Compact TSX example

```tsx
import {
  createDocument,
  createElement,
  serializeDocument,
} from '@upbuilder/elementor-framework';

const heading = createElement('widget', 'heading', {
  title: 'Factory-built heading',
  header_size: 'h2',
  align: 'center',
});

const container = createElement('container', undefined, {
  container_type: 'flex',
  flex_direction: 'column',
  justify_content: 'center',
  align_items: 'center',
  flex_gap: { row: 16, column: 16, unit: 'px' },
  content_width: 'full',
}, [heading]);

const document = createDocument([container], {
  title: 'Factory Page',
  pageSettings: { hide_title: 'yes' },
});

console.log(serializeDocument(document, true));
```
