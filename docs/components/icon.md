# Icon

## Purpose

`Icon` represents Elementor's core `icon` widget. Use it for standalone decorative or linked icons, framed/stacked icon badges, visual affordances, or simple icon-only links that should export as Elementor Icon.

## Import

```tsx
import { Icon } from '@upbuilder/elementor-framework';
import type { IconProps } from '@upbuilder/elementor-framework';
```

Export name: `Icon`

Framework widget key: `icon`

Elementor widget type: `icon`

## TypeScript Props

`IconProps` extends the shared widget base props:

```ts
type BaseProps = {
  id?: string;
  className?: string;
  settings?: Record<string, JsonValue>;
  children?: React.ReactNode;
  role?: string;
  title?: string;
  positioning?: LayoutPositionValue;
  zIndex?: ResponsiveValue<number>;
  sticky?: StickyPositionValue;
  [key: `data-${string}`]: string | number | boolean | undefined;
  [key: `aria-${string}`]: string | number | boolean | undefined;
};
```

Icon-specific fields:

| Prop | Type | Elementor setting |
| --- | --- | --- |
| `icon` | `IconLike` | `selected_icon` |
| `view` | `default`, `stacked`, or `framed` | `view` |
| `shape` | `circle`, `square`, or `rounded` | `shape` |
| `align` | responsive `left`, `center`, or `right` | `align*` |
| `color` | `string` | `primary_color` or `secondary_color` depending on view |
| `backgroundColor` | `string` | `secondary_color` or `primary_color` depending on view |
| `hoverColor` | `string` | `hover_primary_color` or `hover_secondary_color` depending on view in direct framework mapping |
| `hoverBackgroundColor` | `string` | `hover_secondary_color` or `hover_primary_color` depending on view in direct framework mapping |
| `size` | `ResponsiveValue<SliderValue>` | `size*` |
| `padding` | `SliderValue` | `icon_padding` |
| `borderWidth` | `SliderValue` | `border_width` |
| `borderRadius` | `ResponsiveValue<DimensionsValue>` | `border_radius*` |
| `borderColor` | `string` | `border_color` |
| `link` | `LinkLike` | `link` |
| `rotate` | `ResponsiveValue<number>` | `rotate*` as `{ size, unit: 'deg' }` |

`IconLike` accepts an icon class string or `{ value, library }`. String icons infer `eicons`, `fa-brands`, `fa-regular`, or `fa-solid`.

## Responsive Support

Responsive object syntax is supported for `align`, `size`, `borderRadius`, `rotate`, `zIndex`, and advanced position/sticky offsets. `padding` and `borderWidth` are scalar in the direct prop type, but raw `settings` can still provide responsive Elementor keys.

Preview CSS uses tablet and mobile media rules for wrapper alignment, icon font size, SVG dimensions, and rotation.

## Defaults and Required Props

No TypeScript prop is required. Preview mode returns `null` when `icon` is missing or resolves to an empty `selected_icon.value`.

Registry defaults list `view: 'default'`, but the direct framework mapper emits `view` only when provided. Omitted `align` maps as `left` in the direct framework mapper. The preview color mapping treats any non-`stacked` view as default/framed color semantics.

## Elementor JSON Mapping

Direct framework JSON mode creates:

```json
{
  "elType": "widget",
  "widgetType": "icon",
  "settings": {
    "selected_icon": { "value": "fas fa-star", "library": "fa-solid" },
    "view": "stacked",
    "shape": "circle",
    "align": "center",
    "primary_color": "#175cd3",
    "secondary_color": "#ffffff"
  }
}
```

Color mapping depends on `view`:

| View | `color` maps to | `backgroundColor` maps to |
| --- | --- | --- |
| `stacked` | `secondary_color` | `primary_color` |
| `default` or `framed` | `primary_color` | `secondary_color` |

Hover colors follow the same inversion. `link` is normalized to Elementor link shape. Raw `settings` merge last and can provide `hover_animation`, `fit_to_size`, responsive padding/border fields, or other native Icon controls.

Shared base fields map advanced widget settings: `positioning.mode` to `_position`, offsets to `_offset_*`, `zIndex` to `_z_index`, and `sticky` to Elementor sticky settings.

## Preview and Render Behavior

Preview mode renders:

```html
<div class="elementor-element elementor-widget elementor-widget-icon" data-widget_type="icon.default">
  <div class="elementor-icon-wrapper">
    <a class="elementor-icon" href="/target"><i class="fas fa-star" aria-hidden="true"></i></a>
  </div>
</div>
```

Without `link`, the `.elementor-icon` element is a `div`. SVG icons with `library: 'svg'` and inline `<svg` content render through `dangerouslySetInnerHTML`; other icons render as `<i class="{value}" aria-hidden="true" />`.

Preview classes include `elementor-view-*` and, for non-default views, `elementor-shape-*`. Preview CSS covers alignment, font/SVG size, padding, radius, rotation, framed border, stacked/default/framed color behavior, hover colors, optional fit-to-size raw setting, and advanced positioning.

## Parser and Export Notes

Backend React parsing preserves `Icon` props in `styleProps` and aliases `link` to `href`/`linkTarget`. Backend export for `Icon` and `HamburgerIcon` writes `selected_icon`, optional `view`, `shape`, `align`, `size`, `icon_padding`, `border_width`, `border_color`, `rotate`, `link`, and view-dependent color settings. If no icon is supplied, `HamburgerIcon` fallback defaults to `fas fa-bars`.

The backend widget cleanup moves generic advanced padding/border width into `icon_padding` and `border_width`, deletes generic title/text/button colors, and preserves native icon settings. The reverse Elementor parser maps widget type `icon` to UpBuilder comp type `Icon` and extracts `settings.selected_icon.value` as text.

## Caveats and Inconsistencies

- Direct framework preview returns `null` for missing icon, but backend export may default `HamburgerIcon` to `fas fa-bars`.
- `borderColor` is mapped but direct preview only uses `primary_color` as the framed border color; raw CSS/export may preserve `border_color` differently.
- `padding` and `borderWidth` are not responsive first-class props in the direct type.
- For `shape="rounded"`, preview does not synthesize a default radius; pass `borderRadius` for a rounded shape.
- Backend JSX export maps normal `color` and `backgroundColor` with view-aware primary/secondary semantics. Hover color props are less exact in backend export and can pass through generic hover keys such as `title_hover_color` or `background_hover_color`; use raw native icon hover settings when exact Elementor hover controls are required.

## Example

```tsx
import { Icon } from '@upbuilder/elementor-framework';

export function SupportIcon() {
  return (
    <Icon
      icon="fas fa-life-ring"
      view="stacked"
      shape="circle"
      align={{ desktop: 'left', mobile: 'center' }}
      color="#ffffff"
      backgroundColor="#175cd3"
      hoverBackgroundColor="#1849a9"
      size={{ desktop: 28, mobile: 24 }}
      padding={18}
      link={{ url: '/support', is_external: false }}
      rotate={{ desktop: 0, mobile: 0 }}
    />
  );
}
```
