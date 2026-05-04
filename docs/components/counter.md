# Counter

## Purpose

`Counter` maps to Elementor's core `counter` widget. It displays a numeric value with optional prefix, suffix, thousands delimiter, title, and number/title typography controls.

## Import

```tsx
import { Counter } from '@upbuilder/elementor-framework';
import type { CounterProps } from '@upbuilder/elementor-framework';
```

Export name: `Counter`

Internal widget key: `counter`

Elementor widget type: `counter`

## TypeScript Props

```ts
type CounterProps = BaseProps & {
  startingNumber?: number;
  endingNumber?: number;
  start?: number;
  end?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: boolean;
  thousandSeparatorChar?: string;
  title?: string;
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  titlePosition?: ResponsiveValue<'before' | 'after' | 'start' | 'end'>;
  titleHorizontalAlignment?: ResponsiveValue<'start' | 'center' | 'end'>;
  titleVerticalAlignment?: ResponsiveValue<'start' | 'center' | 'end'>;
  titleGap?: ResponsiveValue<SliderValue>;
  numberPosition?: ResponsiveValue<'start' | 'center' | 'end'>;
  numberAlignment?: ResponsiveValue<'start' | 'center' | 'end'>;
  numberGap?: ResponsiveValue<SliderValue>;
  numberColor?: string;
  titleColor?: string;
  numberFontSize?: ResponsiveValue<SliderValue>;
  numberFontWeight?: string | number;
  numberFontFamily?: string;
  numberLineHeight?: ResponsiveValue<SliderValue>;
  numberLetterSpacing?: ResponsiveValue<SliderValue>;
  numberTextShadow?: TextShadowValue;
  numberTextStroke?: TextStrokeValue;
  titleFontSize?: ResponsiveValue<SliderValue>;
  titleFontWeight?: string | number;
  titleFontFamily?: string;
  titleLineHeight?: ResponsiveValue<SliderValue>;
  titleLetterSpacing?: ResponsiveValue<SliderValue>;
  titleTextShadow?: TextShadowValue;
  titleTextStroke?: TextStrokeValue;
};
```

`BaseProps` also allows `id`, `className`, raw `settings`, `role`, `title`, `data-*`, `aria-*`, `positioning`, `zIndex`, and `sticky`.

## Responsive Support

Responsive object syntax is supported for `titlePosition`, `titleHorizontalAlignment`, `titleVerticalAlignment`, `titleGap`, `numberPosition`, `numberAlignment`, `numberGap`, `numberFontSize`, `numberLineHeight`, `numberLetterSpacing`, `titleFontSize`, `titleLineHeight`, and `titleLetterSpacing`.

Desktop maps to the base Elementor setting. Tablet and mobile map to `_tablet` and `_mobile` suffixes. The framework abstraction does not emit a laptop suffix for this widget.

## Defaults and Required Props

No props are required.

Defaults:

- `starting_number`: `startingNumber ?? start ?? 0`
- `ending_number`: `endingNumber ?? end ?? 100`
- `duration`: `2000`
- `title_tag`: `div`
- `thousand_separator`: omitted unless `thousandSeparator` is passed.

The widget registry also lists default `starting_number: 0` and `duration: 2000`.

## Elementor Settings Mapping

| Prop | Elementor setting |
| --- | --- |
| `startingNumber` or `start` | `starting_number` |
| `endingNumber` or `end` | `ending_number` |
| `duration` | `duration` |
| `prefix` | `prefix` |
| `suffix` | `suffix` |
| `thousandSeparator` | `thousand_separator` as `yes` or empty string |
| `thousandSeparatorChar` | `thousand_separator_char` |
| `title` | `title` |
| `titleTag` | `title_tag` |
| `titlePosition` | `title_position` plus responsive suffixes |
| `titleHorizontalAlignment` | `title_horizontal_alignment` plus responsive suffixes |
| `titleVerticalAlignment` | `title_vertical_alignment` plus responsive suffixes |
| `titleGap` | `title_gap` plus responsive suffixes |
| `numberPosition` | `number_position` plus responsive suffixes |
| `numberAlignment` | `number_alignment` plus responsive suffixes |
| `numberGap` | `number_gap` plus responsive suffixes |
| `numberColor` | `number_color` |
| `titleColor` | `title_color` |
| number typography props | `typography_number_*`, `number_shadow_*`, `number_stroke_*` |
| title typography props | `typography_title_*`, `title_shadow_*`, `title_stroke_*` |
| `settings` | merged last and overrides generated settings |

## Preview and Render Behavior

Preview mode renders Elementor-compatible markup with `.elementor-widget-counter`, `.elementor-counter`, `.elementor-counter-title`, `.elementor-counter-number-wrapper`, prefix, number, and suffix spans.

Without native Elementor runtime, preview displays the ending number immediately. With `window.__UP_USE_ELEMENTOR_NATIVE_JS === true`, preview displays the starting number and emits `data-duration`, `data-to-value`, `data-from-value`, and `data-delimiter` for Elementor's counter script.

JSON mode registers an `ElementorElement` with `elType: 'widget'`, `widgetType: 'counter'`, and mapped settings.

## Parser and Export Notes

The React parser maps JSX `<Counter>` to compType `Counter` and captures both content props and style props. The Elementor builder maps compType `Counter` to widget type `counter`, supports `startingNumber`/`start` and `endingNumber`/`end`, and falls back to parsed element text for `ending_number` in generic export flows.

Backend validation includes counter numeric settings, responsive title/number placement, typography, text shadow, and text stroke settings.

## Caveats and Inconsistencies

- The framework preview does not animate by itself unless native Elementor runtime is enabled.
- `startingNumber` takes precedence over `start`; `endingNumber` takes precedence over `end`.
- `prefix`, `suffix`, and `title` are escaped by the backend builder, while direct framework JSON mode passes mapped prop strings as settings.
- Alignment values are passed through as `start`, `center`, or `end`; CSS preview uses them directly for flex alignment.

## Example

```tsx
import { Counter } from '@upbuilder/elementor-framework';

export function MetricsCounter() {
  return (
    <Counter
      startingNumber={0}
      endingNumber={12800}
      duration={1800}
      suffix="+"
      thousandSeparator
      title="Projects exported"
      titlePosition={{ desktop: 'after', mobile: 'after' }}
      numberColor="#0f766e"
      titleColor="#475569"
      numberFontSize={{ desktop: 56, mobile: 38 }}
      numberFontWeight={700}
    />
  );
}
```
