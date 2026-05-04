# Progress

## Purpose

`Progress` maps to Elementor's core `progress` widget. It renders a progress bar with optional title, inner text, percentage label, semantic progress type, and bar/title typography controls.

## Import

```tsx
import { Progress } from '@upbuilder/elementor-framework';
import type { ProgressProps } from '@upbuilder/elementor-framework';
```

Export name: `Progress`

Internal widget key: `progress`

Elementor widget type: `progress`

## TypeScript Props

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

Defaults:

- `title_tag`: `span`
- `percent`: `50`
- `display_percentage`: `show` unless `displayPercentage={false}`
- `progress_type`: omitted unless `progressType` is passed; `default` maps to an empty string.

The widget registry also lists default `progress_type: 'default'` and `display_percentage: 'show'`.

## Elementor Settings Mapping

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

Preview mode renders Elementor-compatible markup with `.elementor-widget-progress`, `.elementor-progress`, `.elementor-title`, `.elementor-progress-wrapper`, `.elementor-progress-bar`, `.elementor-progress-text`, and `.elementor-progress-percentage`.

`percent` is clamped from `0` to `100` for preview. Without native Elementor runtime, the inner bar gets an inline `width: ${percent}%`. With `window.__UP_USE_ELEMENTOR_NATIVE_JS === true`, width is left to Elementor and `data-max` carries the value.

The wrapper has `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. It uses `aria-labelledby` when the title is visible, otherwise an `aria-label`.

JSON mode registers an `ElementorElement` with `elType: 'widget'`, `widgetType: 'progress'`, and mapped settings.

## Parser and Export Notes

The React parser maps JSX `<Progress>` to compType `Progress`. The Elementor builder maps compType `Progress` to widget type `progress`, accepts `percent` and the alias `percentage`, defaults the title to parsed element text or `Progress`, and escapes title/inner text in generic export flows.

Backend validation includes title, percent, progress type, display percentage, bar colors, responsive bar dimensions, title typography/shadow, and inner text typography/shadow.

## Caveats and Inconsistencies

- `titleDisplay={false}` hides the title in preview but the `title` setting can still be exported.
- The framework direct mapping defaults `percent` to `50`; generic backend export also falls back to `50`.
- `barBorderRadius` is typed as dimensions in the framework, while older backend style-prop aliases may parse some progress radius values as a single size.
- `ProgressBar` is assigned to the same function object as `Progress`. Its metadata assignment can make the shared abstraction metadata name read as `ProgressBar`, but both exports still use widget key `progress`.
- `ProgressBar` is only an alias of this component; see `progress-bar.md`.

## Example

```tsx
import { Progress } from '@upbuilder/elementor-framework';

export function BuildProgress() {
  return (
    <Progress
      title="Migration coverage"
      percent={72}
      progressType="success"
      innerText="Complete"
      barColor="#0f766e"
      barBgColor="#e2e8f0"
      barInlineColor="#ffffff"
      barHeight={{ desktop: 18, mobile: 14 }}
      titleColor="#1f2937"
    />
  );
}
```
