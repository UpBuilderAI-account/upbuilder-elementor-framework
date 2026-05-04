# Grid

## Purpose

`Grid` is the Elementor CSS grid container abstraction. It maps JSX grid tracks, gaps, alignment, spacing, and container styling to Elementor container settings with `container_type: 'grid'`.

Use it when children need two-dimensional placement, equal columns/rows, or responsive grid track changes.

## Import path and export name

```tsx
import { Grid } from '@upbuilder/elementor-framework';
```

Package root export comes from `upbuilder-elementor-framework/src/index.ts`, re-exporting `Grid` from `./builder/abstraction`.

## TypeScript props and fields

```ts
export type GridProps = BaseProps & {
  columns: ResponsiveValue<GridTrackValue>;
  rows: ResponsiveValue<GridTrackValue>;
  gap?: ResponsiveValue<SliderValue>;
  rowGap?: ResponsiveValue<SliderValue>;
  columnGap?: ResponsiveValue<SliderValue>;
  alignItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  alignContent?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'>;
  justifyItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  justifyContent?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>;
  padding?: ResponsiveValue<DimensionsValue>;
  margin?: ResponsiveValue<DimensionsValue>;
  backgroundColor?: string;
  borderRadius?: DimensionsValue;
  minHeight?: ResponsiveValue<SliderValue>;
  width?: ResponsiveValue<SliderValue>;
  contentWidth?: 'full' | 'boxed';
  boxedWidth?: ResponsiveValue<SliderValue>;
  autoFlow?: ResponsiveValue<'row' | 'column'>;
};

type GridTrackValue = number | string;
type ResponsiveValue<T> = T | { desktop?: T; tablet?: T; mobile?: T };
type SliderValue = number | string | { size?: number | string; unit?: string };
```

Inherited `BaseProps` include `id`, `className`, `settings`, `children`, ARIA/data attributes, `role`, `title`, `positioning`, `zIndex`, and `sticky`.

## Defaults and required props

- `columns` is required. Runtime mapping throws `[Grid] Missing required 'columns' prop.` when omitted.
- `rows` is required. Runtime mapping throws `[Grid] Missing required 'rows' prop. Use rows={1} for a single-row grid.` when omitted.
- `container_type` is always set to `grid`.
- `id` defaults to `generateElementId()` in runtime rendering and `generateSequentialId()` in `compileReactPage()`.
- `settings` is merged last and can override generated settings.

Grid track normalization:

- `columns={3}` maps to `{ size: 3, unit: 'fr', sizes: [] }` and previews as `repeat(3, 1fr)`.
- `columns="3"` maps the same.
- `columns="240px 1fr"` maps to `{ size: '240px 1fr', unit: 'custom', sizes: [] }`.
- A track object with `unit: 'custom'` preserves the string `size`.

## Responsive support

Responsive object values map to Elementor suffix keys:

| Input | Elementor key |
| --- | --- |
| `{ desktop: 3 }` | `grid_columns_grid` |
| `{ tablet: 2 }` | `grid_columns_grid_tablet` |
| `{ mobile: 1 }` | `grid_columns_grid_mobile` |

Supported responsive props include `columns`, `rows`, `gap`, `rowGap`, `columnGap`, `alignItems`, `alignContent`, `justifyItems`, `justifyContent`, `padding`, `margin`, `minHeight`, `width`, `boxedWidth`, and `autoFlow`.

Preview breakpoints are:

- tablet: `@media (max-width: 1024px)`
- mobile: `@media (max-width: 767px)`

Use the current responsive object form for generated JSX. Older suffix aliases exist in some backend compatibility paths, but `colsTablet` and `colsMobile` are not reliable public framework props because `cols` is not part of the parser's current public prop whitelist.

## Elementor JSON and settings mapping

| Prop | Elementor setting |
| --- | --- |
| `columns` | `grid_columns_grid` |
| `rows` | `grid_rows_grid` |
| `gap` | `grid_gaps` |
| `rowGap` + `columnGap` | combined `grid_gaps` object |
| only `rowGap` | direct framework mapper can emit `grid_row_gap`; backend framework-v2 prop mapping generally writes combined `grid_gaps*` |
| only `columnGap` | direct framework mapper can emit `grid_column_gap`; backend framework-v2 prop mapping generally writes combined `grid_gaps*` |
| `alignItems` | `grid_align_items` |
| `alignContent` | `grid_align_content` |
| `justifyItems` | `grid_justify_items` |
| `justifyContent` | `grid_justify_content` |
| `padding` | `padding` |
| `margin` | `margin` |
| `backgroundColor` | `background_background: 'classic'`, `background_color` |
| `borderRadius` | `border_radius` |
| `minHeight` | `min_height` |
| `width` | `width` |
| `contentWidth` | `content_width` |
| `boxedWidth` | `boxed_width` |
| `autoFlow` | `grid_auto_flow` |
| `positioning`, `zIndex`, `sticky` | container position, z-index, offset, and sticky settings from `mapSharedLayoutProps` |
| `settings` | merged last |

JSON element shape:

```json
{
  "id": "abc123",
  "elType": "container",
  "settings": {
    "container_type": "grid",
    "grid_columns_grid": { "size": 3, "unit": "fr", "sizes": [] },
    "grid_rows_grid": { "size": 1, "unit": "fr", "sizes": [] }
  },
  "elements": [],
  "isInner": false
}
```

## Preview and render behavior

Preview mode renders an Elementor grid container:

```html
<div
  class="elementor-element elementor-element-{id} e-con e-parent e-grid e-con-full"
  data-id="{id}"
  data-element_type="container"
  data-e-type="container"
  data-up-component="Grid"
>
  ...
</div>
```

Nested grids use `e-child`; root grids use `e-parent`. `contentWidth="boxed"` adds `e-con-boxed` and wraps children in `.e-con-inner`; otherwise the class is `e-con-full`.

Preview CSS is generated by `getContainerPreviewCSS()`. For non-boxed grids it applies `display: grid`, `grid-template-columns`, `grid-template-rows`, `grid-auto-flow`, `gap`, alignment properties, and Elementor CSS variables directly to the container. For boxed grids it makes the outer container block-level and applies the grid layout to `> .e-con-inner`.

## Parser and export notes

Backend parsing maps `<Grid>` to `compType: 'Grid'`. `applyFrameworkPropAliases()` sets `styleProps.containerType = 'grid'` and aliases:

- `columns` to `gridCols`
- `rows` to `gridRows`
- `columnGap` to `colGap`
- `backgroundColor` to `bg`
- `justifyContent` to `justify`
- `alignItems` to `align`

During Elementor build:

- `mergeStylePropsToSettings()` converts current framework props through `mapFrameworkV2Props()`.
- Any presence of `containerType: 'grid'`, `display: 'grid'`, `columns`, `cols`, `gridCols`, `rows`, or `gridRows` makes the container a grid.
- `applyContainerDefaults()` sets `container_type: 'grid'` for `compType: 'Grid'`.
- Raw `settings` inside `styleProps` is applied after generated settings.

## Caveats and inconsistencies

- Runtime `Grid` requires both `columns` and `rows`; backend export can infer grid mode from either columns or rows and does not throw the same authoring error.
- Runtime `GridProps` has a narrower styling surface than `FlexboxProps`: no first-class `backgroundGradient`, `backgroundImage`, `backgroundOverlay`, `borderType`, `borderWidth`, `borderColor`, `boxShadow`, `flexGrow`, `flexShrink`, or `overflow`. Raw `settings` can still set Elementor values.
- Direct framework JSON leaves `content_width` unset unless `contentWidth` is provided. Backend export defaults containers to `content_width: 'full'`.
- Runtime `rowGap` only maps to `grid_row_gap` when `columnGap` is absent; preview also falls back through `grid_gaps` and `grid_gap`.
- Backend generic layout mapping uses `cols` as an alias, but the framework component prop is `columns`.
- Framework `<Grid>` is supported, but raw authored CSS grid declarations are not. Avoid `display: grid`, `grid-template-*`, `grid-row`, `grid-column`, and related grid CSS in classes; use `Grid` props instead.

## Compact TSX example

```tsx
import { Grid, Flexbox, Heading, TextEditor } from '@upbuilder/elementor-framework';

export function FeatureGrid() {
  return (
    <Grid
      columns={{ desktop: 3, tablet: 2, mobile: 1 }}
      rows={1}
      gap={{ desktop: 24, mobile: 16 }}
      padding={{ top: 48, right: 24, bottom: 48, left: 24 }}
      alignItems="stretch"
      contentWidth="boxed"
      boxedWidth={1140}
      backgroundColor="#f7f8fa"
    >
      <Flexbox direction="column" gap={8} padding={24} backgroundColor="#ffffff">
        <Heading title="Fast export" tag="h3" />
        <TextEditor content="Grid props become Elementor grid container settings." />
      </Flexbox>
    </Grid>
  );
}
```
