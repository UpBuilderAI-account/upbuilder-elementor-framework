# Heading

## Purpose

`Heading` represents Elementor's core `heading` widget. Use it for standalone titles, subtitles, short linked headings, or styled text that should export as an Elementor Heading widget rather than rich text.

## Import

```tsx
import { Heading } from '@upbuilder/elementor-framework';
import type { HeadingProps } from '@upbuilder/elementor-framework';
```

Export name: `Heading`

Framework widget key: `heading`

Elementor widget type: `heading`

## TypeScript Props

`HeadingProps` extends the shared widget base props:

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

Heading-specific fields:

| Prop | Type | Elementor setting |
| --- | --- | --- |
| `title` | `string` | `title` |
| `tag` | `h1`...`h6`, `p`, `span`, or `div` | `header_size` |
| `size` | `default`, `small`, `medium`, `large`, `xl`, or `xxl` | `size` |
| `align` | responsive `left`, `center`, `right`, or `justify` | `align`, `align_tablet`, `align_mobile` |
| `color` | `string` | `title_color` |
| `fontSize` | `ResponsiveValue<SliderValue>` | `typography_font_size*` |
| `fontWeight` | `string` or `number` | `typography_font_weight` |
| `fontFamily` | `string` | `typography_font_family` |
| `fontStyle` | `normal`, `italic`, or `oblique` | `typography_font_style` |
| `textDecoration` | `none`, `underline`, `overline`, or `line-through` | `typography_text_decoration` |
| `lineHeight` | `ResponsiveValue<SliderValue>` | `typography_line_height*` |
| `letterSpacing` | `ResponsiveValue<SliderValue>` | `typography_letter_spacing*` |
| `textTransform` | `none`, `uppercase`, `lowercase`, or `capitalize` | `typography_text_transform` |
| `textShadow` | `TextShadowValue` | `text_shadow_text_shadow_type`, `text_shadow_text_shadow` |
| `link` | `LinkLike` | `link` |
| `blendMode` | Elementor blend mode string union | `blend_mode` |

`SliderValue` accepts a number, CSS-like size string, or `{ size, unit }`. `LinkLike` accepts a URL string or `{ url, is_external, nofollow }`.

## Responsive Support

The framework object syntax is supported for `align`, `fontSize`, `lineHeight`, `letterSpacing`, `zIndex`, and advanced position/sticky offsets:

```tsx
<Heading
  title="Responsive title"
  align={{ desktop: 'left', tablet: 'center', mobile: 'center' }}
  fontSize={{ desktop: 64, tablet: 44, mobile: 32 }}
/>
```

Responsive settings are emitted with Elementor's `_tablet` and `_mobile` suffixes. Preview CSS uses `@media (max-width: 1024px)` and `@media (max-width: 767px)`.

## Defaults and Required Props

No prop is required at the TypeScript level. In preview mode, the component returns `null` when `title` is missing or empty.

Registry defaults list `header_size: 'h2'` and `size: 'default'`, but the direct JSX mapper does not merge registry defaults into JSON. If `tag` is omitted, the preview render falls back to a `div` tag while the exported settings omit `header_size`. Set `tag` explicitly when semantic heading level matters.

## Elementor JSON Mapping

Direct framework JSON mode creates:

```json
{
  "elType": "widget",
  "widgetType": "heading",
  "settings": {
    "title": "Hello",
    "header_size": "h2",
    "size": "large",
    "align": "center",
    "title_color": "#111111"
  }
}
```

Typography props set `typography_typography: 'custom'` and then write the matching `typography_*` fields. `textShadow` writes Elementor's text-shadow group with default shadow parts when omitted. `link` is normalized to Elementor link object shape. `settings` is merged last, so raw Elementor settings can override mapped values.

Shared base fields map advanced widget settings: `positioning.mode` to `_position`, offsets to `_offset_*`, `zIndex` to `_z_index`, and `sticky` to Elementor sticky settings.

## Preview and Render Behavior

Preview mode renders:

```html
<div class="elementor-element elementor-widget elementor-widget-heading" data-widget_type="heading.default">
  <h2 class="elementor-heading-title elementor-size-large">Hello</h2>
</div>
```

When `link` is present the title content is wrapped in an anchor. If the title contains simple inline HTML tags (`span`, `strong`, `em`, `b`, `i`, `u`, `br`), preview uses `dangerouslySetInnerHTML` for that content. Preview CSS targets `.elementor-heading-title` for color, typography, text shadow, blend mode, hover color if provided through raw settings, and responsive alignment.

## Parser and Export Notes

Backend React parsing aliases framework props: `title` becomes structure `text`, `tag` becomes structure `tag`, and `link` becomes `href`/`linkTarget`. The Elementor builder then emits `title`, `header_size`, optional `align`, `link`, `fontStyle`, `blendMode`, and `textShadow`.

The reverse Elementor parser maps widget type `heading` to UpBuilder comp type `Heading` and extracts `settings.title` as text and `settings.header_size` as tag.

## Caveats and Inconsistencies

- The registry default `header_size: 'h2'` is not applied by the direct framework mapper; set `tag="h2"` explicitly.
- Preview falls back to `div` when `tag` is not set, while backend export may infer a heading level from the parsed element tag.
- The backend cleanup path may delete generic layout alignment settings for widgets, so prefer the widget's own `align` prop rather than flex/grid layout props on `Heading`.
- `fontFamily` is supported by the direct mapper, but the backend builder's Heading-specific block mainly relies on merged style props for typography.

## Example

```tsx
import { Heading } from '@upbuilder/elementor-framework';

export function HeroTitle() {
  return (
    <Heading
      title="Launch faster"
      tag="h1"
      size="xl"
      align={{ desktop: 'left', mobile: 'center' }}
      color="#101828"
      fontSize={{ desktop: 64, tablet: 48, mobile: 36 }}
      fontWeight={700}
      lineHeight={1.05}
      link={{ url: '/features', is_external: false }}
    />
  );
}
```
