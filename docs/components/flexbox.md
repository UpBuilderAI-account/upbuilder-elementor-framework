# Flexbox

## Purpose

`Flexbox` is the primary Elementor flex container abstraction. It maps JSX layout props to Elementor container settings and renders Elementor-compatible preview markup/CSS.

Use it for horizontal or vertical layout groups, section internals, boxed content wrappers, and flex children that need grow/shrink/width behavior.

## Import path and export name

```tsx
import { Flexbox } from '@upbuilder/elementor-framework';
```

Package root export comes from `upbuilder-elementor-framework/src/index.ts`, re-exporting `Flexbox` from `./builder/abstraction`.

## TypeScript props and fields

```ts
export type FlexboxProps = BaseProps & {
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

Important shared value types:

```ts
type ResponsiveValue<T> = T | { desktop?: T; tablet?: T; mobile?: T };
type SliderValue = number | string | { size?: number | string; unit?: string };
type DimensionsValue =
  | number
  | { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string; unit?: string };
```

Inherited `BaseProps` include:

- `id`, `className`, `settings`, `children`
- `role`, `title`, `data-*`, `aria-*`
- `positioning`, `zIndex`, `sticky`

## Defaults and required props

- No prop is required.
- `direction` defaults to `row`.
- `container_type` is always set to `flex`.
- `id` defaults to `generateElementId()` in runtime rendering and `generateSequentialId()` in `compileReactPage()`.
- `settings` is merged last and can override generated settings.

## Responsive support

Responsive object values map to Elementor suffix keys:

| Input | Elementor key |
| --- | --- |
| `{ desktop: 'column' }` | `flex_direction` |
| `{ tablet: 'column' }` | `flex_direction_tablet` |
| `{ mobile: 'column' }` | `flex_direction_mobile` |

Supported responsive props include `direction`, `justify`, `alignItems`, `alignContent`, `gap`, `wrap`, `padding`, `margin`, `minHeight`, `width`, `boxedWidth`, `flexGrow`, and `flexShrink`.

Preview breakpoints are:

- tablet: `@media (max-width: 1024px)`
- mobile: `@media (max-width: 767px)`

The backend parser/export path also supports prop suffix forms like `gapTablet` and `gapMobile` for some generic style props, but the framework component API is the object form above.

## Elementor JSON and settings mapping

| Prop | Elementor setting |
| --- | --- |
| `direction` | `flex_direction` |
| `justify` | `justify_content` with `flex-start`/`flex-end` shortened to `start`/`end`; also `flex_justify_content` with original CSS value |
| `alignItems` | `align_items` shortened to `start`/`end`; also `flex_align_items` with original CSS value |
| `alignContent` | `flex_align_content` |
| `gap` | `flex_gap` |
| `wrap` | `flex_wrap` |
| `padding` | `padding` |
| `margin` | `margin` |
| `backgroundColor` | `background_background: 'classic'`, `background_color` |
| `backgroundGradient` | `background_background: 'gradient'`, `background_color`, `background_color_b`, gradient type/angle/position/stops |
| `backgroundImage` | `background_background: 'classic'`, `background_image`, `background_position`, `background_size`, `background_repeat` |
| `backgroundOverlay` | `background_overlay_background` plus overlay color/gradient settings |
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
| `positioning.mode` | `position` |
| `positioning.zIndex` or `zIndex` | `z_index` |
| `positioning.horizontal` | `_offset_orientation_h`, `_offset_x` or `_offset_x_end` |
| `positioning.vertical` | `_offset_orientation_v`, `_offset_y` or `_offset_y_end` |
| `sticky` | `sticky`, `sticky_on`, `sticky_offset`, `sticky_effects_offset`, `sticky_anchor_link_offset`, `sticky_parent` |
| `settings` | merged last |

JSON element shape:

```json
{
  "id": "abc123",
  "elType": "container",
  "settings": {
    "container_type": "flex",
    "flex_direction": "row"
  },
  "elements": [],
  "isInner": false
}
```

## Preview and render behavior

Preview mode renders an Elementor container:

```html
<div
  class="elementor-element elementor-element-{id} e-con e-parent e-flex e-con-full"
  data-id="{id}"
  data-element_type="container"
  data-e-type="container"
  data-up-component="Flexbox"
>
  ...
</div>
```

Nested containers use `e-child`; root containers use `e-parent`. `contentWidth="boxed"` adds `e-con-boxed` and wraps children in `.e-con-inner`; otherwise the class is `e-con-full`.

Preview CSS is generated by `getContainerPreviewCSS()`. It sets CSS variables like `--display`, `--flex-direction`, `--align-items`, `--justify-content`, `--gap`, `--row-gap`, and `--column-gap`, then applies real flex properties either to the container or to `.e-con-inner` for boxed containers.

JSON mode registers the element with `useDocument().addElement(element, parent?.parentId)` and renders an `ElementContext.Provider` for children.

## Parser and export notes

Backend parsing maps `<Flexbox>` to `compType: 'Flexbox'`. Recognized props are copied to `styleProps`, then `buildElementorElement()` converts them to Elementor settings via `mergeStylePropsToSettings()`.

Relevant backend behavior:

- `applyFrameworkPropAliases()` aliases `justifyContent` to `justify`, `alignItems` to `align`, `backgroundColor` to `bg`, `backgroundImage` to `bgImage`, `columnGap` to `colGap`, and `borderType` to `borderStyle`.
- `mapFrameworkV2Props()` handles current framework props directly and maps object responsive values to base/tablet/mobile settings.
- `applyContainerDefaults()` defaults `Flexbox` `flex_direction` to `row` if missing and defaults all containers to `content_width: 'full'` when no content width is set.
- Raw `settings` inside `styleProps` is applied after generated settings.

## Caveats and inconsistencies

- Direct framework JSON leaves `content_width` unset unless `contentWidth` is provided. Backend export adds `content_width: 'full'` for containers.
- Direct framework mapping writes both short alignment keys (`justify_content`, `align_items`) and `flex_*` keys. Backend conversion also does this for current framework props, but older generic layout mapping may only write `flex_*`.
- `backgroundOverlay` preview creates a `::before` overlay, but no explicit stacking wrapper is inserted for child content. Complex overlays may need z-index review.
- `borderWidth` is typed as `DimensionsValue`, not `ResponsiveValue<DimensionsValue>`, in the framework props.
- Raw `settings.html_tag` and `settings.link` can affect preview tag/link output even though they are not typed first-class `FlexboxProps`.

## Compact TSX example

```tsx
import { Flexbox, Heading, Button } from '@upbuilder/elementor-framework';

export function CardRow() {
  return (
    <Flexbox
      direction={{ desktop: 'row', mobile: 'column' }}
      justify="space-between"
      alignItems="center"
      gap={{ desktop: 24, mobile: 16 }}
      padding={{ top: 32, right: 40, bottom: 32, left: 40 }}
      backgroundColor="#ffffff"
      borderRadius={8}
      boxShadow={{ vertical: 8, blur: 24, color: 'rgba(0,0,0,0.12)' }}
      contentWidth="boxed"
      boxedWidth={1140}
    >
      <Heading title="Flexible container" tag="h2" />
      <Button text="Learn more" link="/learn" />
    </Flexbox>
  );
}
```
