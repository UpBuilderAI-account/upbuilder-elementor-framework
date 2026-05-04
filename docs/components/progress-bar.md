# ProgressBar

## Purpose

`ProgressBar` is an exported alias of `Progress`. It maps to the same Elementor core `progress` widget and uses the same props, settings, preview markup, and backend export behavior.

## Import

```tsx
import { ProgressBar } from '@upbuilder/elementor-framework';
import type { ProgressProps } from '@upbuilder/elementor-framework';
```

Export name: `ProgressBar`

Internal widget key: `progress`

Elementor widget type: `progress`

Implementation:

```ts
export const ProgressBar = Progress;
```

## TypeScript Props

`ProgressBar` uses `ProgressProps`.

```ts
type ProgressProps = BaseProps & {
  title?: string;
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  titleDisplay?: boolean;
  percent?: number | { size?: number | string; unit?: '%' };
  progressType?: '' | 'default' | 'info' | 'success' | 'warning' | 'danger';
  displayPercentage?: boolean;
  innerText?: string;
  titleColor?: string;
  titleFontSize?: ResponsiveValue<SliderValue>;
  titleFontWeight?: string | number;
  titleFontFamily?: string;
  titleLineHeight?: ResponsiveValue<SliderValue>;
  titleLetterSpacing?: ResponsiveValue<SliderValue>;
  titleTextShadow?: TextShadowValue;
  barColor?: string;
  barBgColor?: string;
  barHeight?: ResponsiveValue<SliderValue>;
  barBorderRadius?: ResponsiveValue<DimensionsValue>;
  barInlineColor?: string;
  innerTextFontSize?: ResponsiveValue<SliderValue>;
  innerTextFontWeight?: string | number;
  innerTextFontFamily?: string;
  innerTextLineHeight?: ResponsiveValue<SliderValue>;
  innerTextLetterSpacing?: ResponsiveValue<SliderValue>;
  innerTextShadow?: TextShadowValue;
};
```

`BaseProps` also allows `id`, `className`, raw `settings`, `role`, `title`, `data-*`, `aria-*`, `positioning`, `zIndex`, and `sticky`.

## Responsive Support

Responsive object syntax is supported for `titleFontSize`, `titleLineHeight`, `titleLetterSpacing`, `barHeight`, `barBorderRadius`, `innerTextFontSize`, `innerTextLineHeight`, and `innerTextLetterSpacing`.

Desktop maps to the base Elementor setting. Tablet and mobile map to `_tablet` and `_mobile` suffixes. The framework abstraction does not emit a laptop suffix for this widget.

## Defaults and Required Props

No props are required.

Defaults are identical to `Progress`:

- `title_tag`: `span`
- `percent`: `50`
- `display_percentage`: `show` unless `displayPercentage={false}`
- `progress_type`: omitted unless `progressType` is passed; `default` maps to an empty string.

## Elementor Settings Mapping

`ProgressBar` uses the exact `Progress` mapping.

| Prop | Elementor setting |
| --- | --- |
| `title` | `title` |
| `titleTag` | `title_tag` |
| `titleDisplay` | `title_display` as `yes` or empty string |
| `percent` | `percent` as `{ unit: '%', size }`, clamped to `0..100` |
| `progressType` | `progress_type`; `default` becomes empty string |
| `displayPercentage` | `display_percentage` as `show` or empty string |
| `innerText` | `inner_text` |
| `titleColor` | `title_color` |
| title typography props | `typography_*`, `title_shadow_*` |
| `barColor` | `bar_color` |
| `barBgColor` | `bar_bg_color` |
| `barHeight` | `bar_height` plus responsive suffixes |
| `barBorderRadius` | `bar_border_radius` plus responsive suffixes |
| `barInlineColor` | `bar_inline_color` |
| inner text typography props | `bar_inner_typography_*`, `bar_inner_shadow_*` |
| `settings` | merged last and overrides generated settings |

## Preview and Render Behavior

Because `ProgressBar` is the same function object as `Progress`, preview mode renders `.elementor-widget-progress` and the same progress markup. The component metadata name is set to `ProgressBar`, but `widgetKey` remains `progress`.

The preview clamps `percent` to `0..100`. Without native Elementor runtime it writes the bar width inline. With `window.__UP_USE_ELEMENTOR_NATIVE_JS === true`, Elementor runtime is expected to handle the width from `data-max`.

JSON mode registers an `ElementorElement` with `elType: 'widget'`, `widgetType: 'progress'`, and mapped settings.

## Parser and Export Notes

The React parser maps JSX `<ProgressBar>` to compType `ProgressBar`. Backend Elementor type mappings map both `Progress` and `ProgressBar` to widget type `progress`. The Elementor builder handles `case 'Progress'` and `case 'ProgressBar'` together.

Use `ProgressBar` when the design vocabulary calls for a bar component; use `Progress` when matching Elementor's widget name. Export output is the same.

## Caveats and Inconsistencies

- `ProgressBar` has no distinct prop type export; import `ProgressProps`.
- The alias shares all `Progress` caveats, including `percent` defaulting to `50` and `titleDisplay` affecting preview visibility but not removing the title setting.
- Since `ProgressBar` is assigned from `Progress`, any runtime behavior changes to `Progress` apply here automatically.
- Because both exports reference the same function object, the `ProgressBar` metadata assignment can also affect the metadata name observed through `Progress`; the widget key remains `progress`.

## Example

```tsx
import { ProgressBar } from '@upbuilder/elementor-framework';

export function CapacityBar() {
  return (
    <ProgressBar
      title="Capacity used"
      percent={{ size: 38, unit: '%' }}
      displayPercentage
      barColor="#2563eb"
      barBgColor="#dbeafe"
      barHeight={16}
      barBorderRadius={8}
      innerText="Storage"
    />
  );
}
```
