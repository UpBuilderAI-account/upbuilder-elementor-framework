# IconBox

## Purpose

`IconBox` maps to Elementor's `icon-box` widget. It renders an icon with a title, description, optional link, and Elementor-compatible icon/title/description styling.

## Import

```tsx
import { IconBox } from '@upbuilder/elementor-framework';
import type { IconBoxProps } from '@upbuilder/elementor-framework';
```

Framework source export: `IconBox` from `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`.

## Props and fields

`IconBoxProps = BaseProps & BoxContentStyleProps & { ... }`.

Base props supported by all widgets:

```ts
{
  id?: string;
  className?: string;
  settings?: Record<string, JsonValue>;
  children?: ReactNode;
  role?: string;
  title?: string;
  positioning?: LayoutPositionValue;
  zIndex?: ResponsiveValue<number>;
  sticky?: StickyPositionValue;
  [key: `data-${string}`]: string | number | boolean | undefined;
  [key: `aria-${string}`]: string | number | boolean | undefined;
}
```

Widget props:

```ts
{
  icon?: IconLike;
  selected_icon?: IconLike;
  title?: string;
  description?: string;
  link?: LinkLike;
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  view?: 'default' | 'stacked' | 'framed';
  shape?: 'circle' | 'square' | 'rounded';
  position?: ResponsiveValue<
    'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' |
    'block-start' | 'block-end' | 'inline-start' | 'inline-end'
  >;
  verticalAlign?: ResponsiveValue<'top' | 'middle' | 'bottom'>;
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right' | 'justify'>;
  iconSpace?: ResponsiveValue<SliderValue>;
  titleBottomSpace?: ResponsiveValue<SliderValue>;
  primaryColor?: string;
  secondaryColor?: string;
  hoverPrimaryColor?: string;
  hoverSecondaryColor?: string;
  hoverIconTransition?: SliderValue;
  hoverAnimation?: string;
  iconSize?: ResponsiveValue<SliderValue>;
  iconPadding?: ResponsiveValue<SliderValue>;
  rotate?: ResponsiveValue<number>;
  borderWidth?: ResponsiveValue<DimensionsValue>;
  borderRadius?: ResponsiveValue<DimensionsValue>;
}
```

Shared title/description style props from `BoxContentStyleProps`:

```ts
{
  titleColor?: string;
  titleHoverColor?: string;
  titleHoverTransition?: SliderValue;
  titleFontSize?: ResponsiveValue<SliderValue>;
  titleFontWeight?: string | number;
  titleFontFamily?: string;
  titleFontStyle?: 'normal' | 'italic' | 'oblique';
  titleTextDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  titleLineHeight?: ResponsiveValue<SliderValue>;
  titleLetterSpacing?: ResponsiveValue<SliderValue>;
  titleTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  titleTextShadow?: TextShadowValue;
  titleTextStroke?: TextStrokeValue;
  descriptionColor?: string;
  descriptionFontSize?: ResponsiveValue<SliderValue>;
  descriptionFontWeight?: string | number;
  descriptionFontFamily?: string;
  descriptionFontStyle?: 'normal' | 'italic' | 'oblique';
  descriptionTextDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  descriptionLineHeight?: ResponsiveValue<SliderValue>;
  descriptionLetterSpacing?: ResponsiveValue<SliderValue>;
  descriptionTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  descriptionTextShadow?: TextShadowValue;
}
```

`IconLike` accepts a Font Awesome/eicons class string or `{ value?: string; library?: string }`. `LinkLike` accepts a URL string or Elementor link object `{ url, is_external?, nofollow? }`.

## Responsive support

The framework writes Elementor responsive keys for:

- `position` -> `position`, `position_tablet`, `position_mobile`
- `verticalAlign` -> `content_vertical_alignment*`
- `align` -> `text_align*`
- `iconSpace` -> `icon_space*`
- `titleBottomSpace` -> `title_bottom_space*`
- `iconSize` -> `icon_size*`
- `iconPadding` -> `icon_padding*`
- `rotate` -> `rotate*`
- `borderWidth` -> `border_width*`
- `borderRadius` -> `border_radius*`
- title and description font size, line height, and letter spacing
- shared widget layout props such as `zIndex`, `positioning`, and `sticky`

`ResponsiveValue<T>` uses `{ desktop?: T; tablet?: T; mobile?: T }`. Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Defaults and required props

No prop is TypeScript-required.

Framework defaults:

- `selected_icon`: `{ value: 'fas fa-star', library: 'fa-solid' }` when `icon`/`selected_icon` is missing.
- `titleSize`: `h3`.
- `view`: `default`.
- `position`: `block-start`. Scalar `position` is also copied to tablet and mobile settings.

Backend builder defaults differ slightly:

- `title_text` defaults to `Icon Box` when built from a generic `StructureElement`.
- `position` also defaults to `block-start`.

## Elementor JSON/settings mapping

Primary mapping:

| TSX prop | Elementor setting |
| --- | --- |
| `icon` / `selected_icon` | `selected_icon` |
| `title` | `title_text` |
| `description` | `description_text` |
| `link` | `link` |
| `titleSize` | `title_size` |
| `view` | `view` |
| `shape` | `shape` |
| `position` | `position*` |
| `verticalAlign` | `content_vertical_alignment*` |
| `align` | `text_align*` |
| `iconSpace` | `icon_space*` |
| `titleBottomSpace` | `title_bottom_space*` |
| `primaryColor` | `primary_color` |
| `secondaryColor` | `secondary_color` |
| `hoverPrimaryColor` | `hover_primary_color` |
| `hoverSecondaryColor` | `hover_secondary_color` |
| `hoverIconTransition` | `hover_icon_colors_transition_duration` |
| `hoverAnimation` | `hover_animation` |
| `iconSize` | `icon_size*` |
| `iconPadding` | `icon_padding*` |
| `rotate` | `rotate*` as `{ size, unit: 'deg' }` |
| `borderWidth` | `border_width*` |
| `borderRadius` | `border_radius*` |
| `titleColor` | `title_color` |
| `titleHoverColor` | `hover_title_color` |
| `titleHoverTransition` | `hover_title_color_transition_duration` |
| `descriptionColor` | `description_color` |
| title typography props | `title_typography_*` |
| `titleTextShadow` | `title_shadow_*` |
| `titleTextStroke` | `text_stroke_*` |
| description typography props | `description_typography_*` |
| `descriptionTextShadow` | `description_shadow_*` |

Position aliases are normalized:

- `top` -> `block-start`
- `bottom` -> `block-end`
- `left` / `start` -> `inline-start`
- `right` / `end` -> `inline-end`

`settings` is merged last, so raw Elementor settings can override normalized props.

Generated widget element:

```json
{
  "elType": "widget",
  "widgetType": "icon-box",
  "settings": {}
}
```

## Preview/render behavior

Preview mode renders an Elementor-like wrapper:

- Outer classes include `elementor-widget-icon-box`, `elementor-view-*`, `elementor-shape-*`, and `elementor-position-*`.
- The icon renders in `.elementor-icon-box-icon .elementor-icon`.
- The title renders using `title_size` and `.elementor-icon-box-title`.
- The description renders as `.elementor-icon-box-description`.
- If `link` is present, both icon and title are linked. The icon link has `tabIndex={-1}`.
- CSS is generated by `getIconBoxCSS`, including flex direction, icon color modes, hover colors, title/description typography, text stroke, and responsive overrides.

## Parser/export notes

- `src/index.ts` re-exports `IconBox` and `IconBoxProps`.
- React parser maps the `IconBox` component to itself so Elementor export recognizes it.
- Elementor type mapping maps `IconBox` to widget type `icon-box`.
- Backend `element-builder.ts` has a dedicated `case 'IconBox'` mapping and accepts aliases such as `iconPosition`, `viewType`, `iconView`, `iconPrimaryColor`, `iconSecondaryColor`, and `iconRotate`.
- Backend validator allows the `ICON_BOX_SETTINGS` set for `icon-box`.
- `props-to-settings.ts` contains older generic mappings for icon/icon-box props, but the dedicated framework abstraction mapping is more complete.

## Caveats and inconsistencies

- Widget registry lists `icon-box` default `position: 'top'`, while the framework abstraction normalizes the default to `block-start`.
- Framework JSON mode does not default `title_text`; backend generic builder may default it to `Icon Box`.
- `titleTextStroke` maps to `text_stroke_*` for IconBox, while ImageBox uses `title_stroke_*`.
- CSS preview handles the visible HTML/CSS structure, not Elementor's live JS runtime.

## Example

```tsx
import { IconBox } from '@upbuilder/elementor-framework';

export function FeatureIconBox() {
  return (
    <IconBox
      icon="fas fa-shield-alt"
      title="Protected checkout"
      description="Payments stay encrypted from form submit through receipt."
      link={{ url: '/security', is_external: false }}
      view="stacked"
      shape="circle"
      position={{ desktop: 'left', mobile: 'top' }}
      align={{ desktop: 'start', mobile: 'center' }}
      iconSize={{ desktop: 32, mobile: 24 }}
      iconPadding={18}
      iconSpace={20}
      primaryColor="#0f766e"
      secondaryColor="#ffffff"
      titleColor="#111827"
      descriptionColor="#4b5563"
      titleFontSize={{ desktop: 24, mobile: 20 }}
      titleFontWeight={700}
    />
  );
}
```
