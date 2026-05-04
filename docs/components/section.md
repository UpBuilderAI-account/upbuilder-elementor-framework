# Section

## Purpose

`Section` is the semantic/top-level layout component for page sections. In the framework runtime it is implemented as a thin wrapper around `Flexbox`; it exists mainly to make authoring and preview/layers naming clearer while still exporting an Elementor container.

## Import path and export name

```tsx
import { Section } from '@upbuilder/elementor-framework';
```

Package root export comes from `upbuilder-elementor-framework/src/index.ts`, re-exporting `Section` from `./builder/abstraction`.

## TypeScript props and fields

```ts
export type SectionProps = FlexboxProps & {
  /** Section name for layers panel display (e.g., "HeroSection") */
  name?: string;
};
```

`Section` inherits all `FlexboxProps`:

```ts
type FlexboxProps = BaseProps & {
  direction?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
  justify?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>;
  alignItems?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch'>;
  alignContent?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'>;
  gap?: ResponsiveValue<SliderValue>;
  wrap?: ResponsiveValue<'nowrap' | 'wrap'>;
  padding?: ResponsiveValue<DimensionsValue>;
  margin?: ResponsiveValue<DimensionsValue>;
  backgroundColor?: string;
  backgroundGradient?: GradientValue;
  backgroundImage?: BackgroundImageValue;
  backgroundOverlay?: string | GradientValue;
  borderRadius?: DimensionsValue;
  borderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
  borderWidth?: DimensionsValue;
  borderColor?: string;
  boxShadow?: BoxShadowValue;
  minHeight?: ResponsiveValue<SliderValue>;
  width?: ResponsiveValue<SliderValue>;
  contentWidth?: 'full' | 'boxed';
  boxedWidth?: ResponsiveValue<SliderValue>;
  flexGrow?: ResponsiveValue<number>;
  flexShrink?: ResponsiveValue<number>;
  overflow?: 'visible' | 'hidden';
};
```

Inherited `BaseProps` include `id`, `className`, `settings`, `children`, ARIA/data attributes, `role`, `title`, `positioning`, `zIndex`, and `sticky`.

## Defaults and required props

- No `Section` prop is required.
- `direction` defaults to `row` through the `Flexbox` mapping.
- `container_type` is `flex`.
- `name` defaults to `Section` for preview `data-up-component`.
- `settings` is a raw Elementor settings passthrough and is applied last.

## Responsive support

All inherited `ResponsiveValue<T>` props accept either a scalar or:

```ts
{ desktop?: T; tablet?: T; mobile?: T }
```

The framework maps responsive values to Elementor suffixes:

- desktop: base key, for example `flex_direction`
- tablet: `_tablet`, for example `flex_direction_tablet`
- mobile: `_mobile`, for example `flex_direction_mobile`

Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Elementor JSON and settings mapping

Runtime `Section` renders `Flexbox` with an internal `__upComponentName`, so its direct JSON mapping is the `Flexbox` mapping:

| Prop | Elementor setting |
| --- | --- |
| `direction` | `flex_direction` |
| `justify` | `justify_content`, `flex_justify_content` |
| `alignItems` | `align_items`, `flex_align_items` |
| `alignContent` | `flex_align_content` |
| `gap` | `flex_gap` |
| `wrap` | `flex_wrap` |
| `padding` | `padding` |
| `margin` | `margin` |
| `backgroundColor` | `background_background: 'classic'`, `background_color` |
| `backgroundGradient` | `background_background: 'gradient'`, gradient color/type/angle/stop settings |
| `backgroundImage` | `background_background: 'classic'`, `background_image`, position/size/repeat |
| `backgroundOverlay` | `background_overlay_background`, overlay color/gradient settings |
| `borderType` | `border_border` |
| `borderWidth` | `border_width` |
| `borderColor` | `border_color` |
| `borderRadius` | `border_radius` |
| `boxShadow` | `box_shadow_box_shadow_type: 'yes'`, `box_shadow_box_shadow` |
| `overflow` | `overflow` |
| `minHeight` | `min_height` |
| `width` | `width` |
| `contentWidth` | `content_width` |
| `boxedWidth` | `boxed_width` |
| `flexGrow` | `_flex_size: 'custom'`, `_flex_grow` |
| `flexShrink` | `_flex_size: 'custom'`, `_flex_shrink` |
| `positioning`, `zIndex`, `sticky` | container position, z-index, offset, and sticky settings from `mapSharedLayoutProps` |
| `settings` | merged last with `Object.assign` |

The produced element is:

```json
{
  "elType": "container",
  "settings": { "container_type": "flex" },
  "elements": [],
  "isInner": false
}
```

`isInner` is true when the section is nested inside another container.

## Preview and render behavior

Preview mode renders the same markup as `Flexbox`, but with `data-up-component` set from `name`:

```html
<div
  class="elementor-element elementor-element-{id} e-con e-parent e-flex e-con-full"
  data-id="{id}"
  data-element_type="container"
  data-e-type="container"
  data-up-component="HeroSection"
>
  ...
</div>
```

When `contentWidth="boxed"`, children are wrapped in `.e-con-inner`. If `settings.html_tag` is supplied through raw settings, the preview tag can change, and `html_tag: 'a'` plus `link.url` produces link attributes.

In JSON mode, `Section` returns a `Flexbox` element. Registration is still handled by the `Flexbox` component effect.

## Parser and export notes

Backend parsing maps JSX `<Section>` to `compType: 'Section'`. The parser captures Elementor style props such as `direction`, `gap`, `padding`, `backgroundColor`, `contentWidth`, `boxedWidth`, `positioning`, and `settings` into `styleProps`.

During Elementor build:

- `buildElementorElement()` sees `Section` as an Elementor container.
- `mergeStylePropsToSettings()` converts `styleProps` through `mapFrameworkV2Props()`.
- `applyContainerDefaults()` forces `content_width: 'full'`, defaults missing `flex_direction` to `row`, adds missing `boxed_width: { unit: 'px', size: 1200 }`, and deletes `boxed_content_width`.

The parser also uses section file/page structure to order sections. Root parsed sections may get a backend display name derived from the section component/file name, not from the `Section name` prop.

## Caveats and inconsistencies

- Runtime `Section` is just `Flexbox`; backend export treats `compType: 'Section'` specially and adds a default `boxed_width` of 1200. Direct framework JSON and backend-parsed export can differ.
- `name` only affects preview `data-up-component` in runtime rendering. It is ignored by `mapFlexboxProps()` and does not become an Elementor JSON setting.
- `SectionProps` does not expose `html_tag` or `link`, but raw `settings` can still set them for preview/export.
- `borderRadius` and `borderWidth` are not typed as responsive in `FlexboxProps`, but the backend `styleProps` path can handle responsive spacing objects for these keys.
- Omitted `contentWidth` remains unset in direct framework JSON, while backend containers generally default to `full`.

## Compact TSX example

```tsx
import { Section, Flexbox, Heading } from '@upbuilder/elementor-framework';

export function HeroSection() {
  return (
    <Section
      name="HeroSection"
      direction="column"
      alignItems="center"
      justify="center"
      gap={{ desktop: 24, mobile: 16 }}
      padding={{ desktop: 80, tablet: 56, mobile: 32 }}
      backgroundColor="#f5f7fb"
      contentWidth="full"
    >
      <Flexbox direction="column" gap={12} contentWidth="boxed" boxedWidth={960}>
        <Heading title="Elementor section" tag="h1" align="center" />
      </Flexbox>
    </Section>
  );
}
```
