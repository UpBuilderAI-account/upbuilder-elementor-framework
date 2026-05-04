# Button

## Purpose

`Button` represents Elementor's core `button` widget. Use it for call-to-action links, icon buttons, form-like navigation actions, or any standalone link that should export as Elementor Button.

## Import

```tsx
import { Button } from '@upbuilder/elementor-framework';
import type { ButtonProps } from '@upbuilder/elementor-framework';
```

Export name: `Button`

Framework widget key: `button`

Elementor widget type: `button`

## TypeScript Props

`ButtonProps` extends the shared widget base props:

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

Button-specific fields:

| Prop | Type | Elementor setting |
| --- | --- | --- |
| `text` | `string` | `text` |
| `link` | `LinkLike` | `link` |
| `size` | `xs`, `sm`, `md`, `lg`, or `xl` | `size` |
| `align` | responsive `left`, `center`, `right`, or `stretch` | `align*` |
| `icon` | `IconLike` | `selected_icon` |
| `iconPosition` | `left` or `right` | `icon_align` as `row` or `row-reverse` |
| `iconSpacing` | `SliderValue` | `icon_indent` |
| `textColor` | `string` | `button_text_color` |
| `backgroundColor` | `string` | `background_background`, `background_color` |
| `hoverTextColor` | `string` | `hover_color` |
| `hoverBackgroundColor` | `string` | `button_background_hover_color` |
| `borderType` | `none`, `solid`, `double`, `dotted`, or `dashed` | `border_border` |
| `borderWidth` | `ResponsiveValue<SliderValue>` | `border_width*` as four-side spacing |
| `borderColor` | `string` | `border_color` |
| `borderRadius` | `ResponsiveValue<DimensionsValue>` | `border_radius*` |
| `padding` | `ResponsiveValue<DimensionsValue>` | `text_padding*` |
| `fontSize` | `ResponsiveValue<SliderValue>` | `typography_font_size*` |
| `fontWeight` | `string` or `number` | `typography_font_weight` |
| `lineHeight` | `ResponsiveValue<SliderValue>` | `typography_line_height*` |
| `letterSpacing` | `ResponsiveValue<SliderValue>` | `typography_letter_spacing*` |
| `contentAlign` | responsive `start`, `center`, `end`, or `space-between` | `content_align*` in direct framework mapping |

`IconLike` accepts an icon class string or `{ value, library }`. String icons infer `eicons`, `fa-brands`, `fa-regular`, or `fa-solid`.

## Responsive Support

Responsive object syntax is supported for `align`, `borderWidth`, `borderRadius`, `padding`, `fontSize`, `lineHeight`, `letterSpacing`, `contentAlign`, `zIndex`, and advanced position/sticky offsets in the framework mapper. Backend JSX export does not currently capture `contentAlign`.

Preview CSS uses tablet and mobile media rules for wrapper alignment, button typography, padding, radius, border width, and content alignment.

## Defaults and Required Props

No TypeScript prop is required. Preview mode returns `null` when neither `text` nor `icon` is provided.

Registry defaults list `size: 'sm'`, but the direct framework mapper emits `size` only when provided. Preview class output also only includes `elementor-size-*` when `settings.size` exists. Set `size` explicitly for stable output.

## Elementor JSON Mapping

Direct framework JSON mode creates:

```json
{
  "elType": "widget",
  "widgetType": "button",
  "settings": {
    "text": "Get started",
    "link": { "url": "/signup" },
    "size": "md",
    "align": "center",
    "button_text_color": "#ffffff",
    "background_background": "classic",
    "background_color": "#175cd3"
  }
}
```

`padding` maps to `text_padding*`, not the advanced widget padding control. `borderWidth` is normalized from a scalar size to a four-side spacing object. Typography props set `typography_typography: 'custom'`.

Raw `settings` merge last and can provide extra Elementor controls such as `button_type`, `button_css_id`, `hover_animation`, `icon_size`, `icon_color`, `button_box_shadow_*`, and hover border or shadow settings.

## Preview and Render Behavior

Preview mode renders:

```html
<div class="elementor-element elementor-widget elementor-widget-button" data-widget_type="button.default">
  <a class="elementor-button elementor-button-link" href="/signup">
    <span class="elementor-button-content-wrapper">
      <span class="elementor-button-icon"><i class="..."></i></span>
      <span class="elementor-button-text">Get started</span>
    </span>
  </a>
</div>
```

The wrapper gets Elementor alignment classes for desktop, tablet, and mobile. The anchor uses `href` from `link.url` or `#`, `target="_blank"` for external links, and `rel="nofollow"` when requested. Preview CSS covers text/background colors, hover colors/backgrounds, typography, internal padding, radius, border, box shadow from raw settings, text shadow from raw settings, icon direction, icon gap, icon color, and advanced positioning.

## Parser and Export Notes

Backend React parsing aliases `text` to structure `text` and `link` to `href`/`linkTarget`. The Elementor builder emits `text`, `link`, optional `align`, `size`, `selected_icon`, `icon_align`, and `icon_indent`.

The backend settings builder has special button naming rules: generic `title_color` becomes `button_text_color`, generic `padding` becomes `text_padding`, and `title_hover_color` becomes `hover_color`. Button border and background settings intentionally stay unprefixed.

The reverse Elementor parser maps widget type `button` to UpBuilder comp type `Button` and extracts `settings.text` and `settings.link.url`.

## Caveats and Inconsistencies

- Registry default `size: 'sm'` is not applied by the direct mapper; pass `size` explicitly.
- `hoverBackgroundColor` maps directly to `button_background_hover_color`; the preview CSS also checks alternate raw hover keys from backend paths.
- `rel` in preview is only `nofollow` when requested and does not add `noopener noreferrer` for external links unless supplied through a different path.
- `contentAlign` affects the internal content wrapper, not the outer Elementor alignment.
- `contentAlign` is a framework/runtime setting today. The backend React parser and button builder currently emit outer `align`, icon, size, text, and link settings, but not `content_align*`.

## Example

```tsx
import { Button } from '@upbuilder/elementor-framework';

export function SignupButton() {
  return (
    <Button
      text="Get started"
      link="/signup"
      size="md"
      align={{ desktop: 'left', mobile: 'stretch' }}
      icon="fas fa-arrow-right"
      iconPosition="right"
      iconSpacing={8}
      textColor="#ffffff"
      backgroundColor="#175cd3"
      hoverBackgroundColor="#1849a9"
      borderRadius={8}
      padding={{ top: 14, right: 22, bottom: 14, left: 22 }}
      fontWeight={700}
    />
  );
}
```
