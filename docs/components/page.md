# Page

## Purpose

`Page` is a lightweight internal/public page wrapper used by the abstraction compiler. It is exported from the framework but is not part of the normal prompt-authoring surface. Most generated Elementor projects use `DocumentBuilder` plus layout components instead.

## Import

```tsx
import { Page } from '@upbuilder/elementor-framework';
import type { PageProps } from '@upbuilder/elementor-framework';
```

Export name: `Page`

## TypeScript Props

```ts
export type PageProps = {
  title?: string;
  children?: React.ReactNode;
};
```

## Behavior

`Page` renders its children directly in React preview mode. It carries abstraction metadata with `type: 'page'` and widget key `page`, so compiler helpers can identify a page wrapper when converting a React tree into an Elementor document.

## Parser And Export Notes

The backend React project parser primarily works from page modules and parsed JSX elements. `Page` is not the normal generated component for backend export. Use `DocumentBuilder` when a React tree needs to compile directly through the framework abstraction API.

## Caveats

- `Page` is exported as a utility/runtime wrapper, not a first-choice authoring component.
- `title` is metadata only. It does not render visible text.
- It does not map to an Elementor widget or container by itself.

## Example

```tsx
import { Page, Section, Heading } from '@upbuilder/elementor-framework';

export function SimplePage() {
  return (
    <Page title="Example">
      <Section name="Hero" contentWidth="full" wrap="wrap">
        <Heading title="Hello" tag="h1" />
      </Section>
    </Page>
  );
}
```
