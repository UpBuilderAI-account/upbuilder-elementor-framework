# TextEditor

## Purpose

`TextEditor` represents Elementor's core `text-editor` widget. Use it for rich HTML content, paragraphs, inline links, multi-column text, and body copy that should export as Elementor's Text Editor widget.

## Import

```tsx
import { TextEditor } from '@upbuilder/elementor-framework';
import type { TextEditorProps } from '@upbuilder/elementor-framework';
```

Export name: `TextEditor`

Framework widget key: `text-editor`

Elementor widget type: `text-editor`

## TypeScript Props

`TextEditorProps` extends the shared widget base props:

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

TextEditor-specific fields:

| Prop | Type | Elementor setting |
| --- | --- | --- |
| `content` | `string` | `editor` |
| `align` | responsive `left`, `center`, `right`, or `justify` | `align`, `align_tablet`, `align_mobile` |
| `color` | `string` | `text_color` |
| `fontSize` | `ResponsiveValue<SliderValue>` | `typography_font_size*` |
| `fontFamily` | `string` | `typography_font_family` |
| `lineHeight` | `ResponsiveValue<SliderValue>` | `typography_line_height*` |
| `letterSpacing` | `ResponsiveValue<SliderValue>` | `typography_letter_spacing*` |
| `paragraphSpacing` | `ResponsiveValue<SliderValue>` | `paragraph_spacing*` |
| `columns` | `ResponsiveValue<number>` | `text_columns*` in direct framework mapping; backend widget builder currently emits scalar `text_columns` |
| `columnGap` | `ResponsiveValue<SliderValue>` | `column_gap*` in direct framework mapping; backend JSX export does not currently preserve this as a text-editor column gap |

`settings` can supply additional Elementor text-editor controls such as `drop_cap`, `drop_cap_view`, link colors, or raw caption/text settings not exposed as first-class props.

## Responsive Support

Responsive object syntax is supported in the framework mapper for `align`, `fontSize`, `lineHeight`, `letterSpacing`, `paragraphSpacing`, `columns`, `columnGap`, `zIndex`, and advanced position/sticky offsets. Backend JSX export is narrower for `columns` and `columnGap`; use direct framework JSON behavior as the source of truth for those two controls.

Responsive settings use Elementor's `_tablet` and `_mobile` suffixes. Preview CSS uses tablet and mobile media rules for alignment and typography.

## Defaults and Required Props

No TypeScript prop is required. In preview mode the component returns `null` when `content` is missing or empty.

There are no registry defaults for `text-editor`. The mapper emits only provided props plus raw `settings`.

## Elementor JSON Mapping

Direct framework JSON mode creates:

```json
{
  "elType": "widget",
  "widgetType": "text-editor",
  "settings": {
    "editor": "<p>Body copy</p>",
    "align": "left",
    "text_color": "#475467",
    "typography_typography": "custom",
    "typography_font_size": { "size": 18, "unit": "px" }
  }
}
```

Typography props set `typography_typography: 'custom'`. `paragraphSpacing` writes `paragraph_spacing*`, `columns` writes `text_columns*`, and `columnGap` writes `column_gap*`. Raw `settings` merge last.

Shared base fields map advanced widget settings: `positioning.mode` to `_position`, offsets to `_offset_*`, `zIndex` to `_z_index`, and `sticky` to Elementor sticky settings.

## Preview and Render Behavior

Preview mode renders the editor HTML directly into the widget wrapper:

```html
<div class="elementor-element elementor-widget elementor-widget-text-editor" data-widget_type="text-editor.default">
  ...
</div>
```

The wrapper receives `dangerouslySetInnerHTML={{ __html: settings.editor }}`. Preview CSS applies text alignment, `text_color`, columns, column gap, typography, link colors from raw settings, paragraph spacing, drop-cap styles from raw settings, and advanced positioning.

When raw `settings.drop_cap` is `'yes'` or `'no'`, preview also emits the Elementor drop-cap class and `data-settings`.

## Parser and Export Notes

Backend React parsing maps `TextEditor.content` to structure `text`. The backend Elementor builder handles `TextEditor`, `Paragraph`, `Span`, `RichText`, `Strong`, `Emphasized`, `Blockquote`, and `Figcaption` through the same text-editor path, writing `settings.editor`.

The builder also extracts inline styles from `content` HTML for font size, font weight, line height, letter spacing, alignment, and color, then applies explicit style props afterward. The reverse Elementor parser maps widget type `text-editor` to UpBuilder comp type `TextEditor` and extracts `settings.editor` as text.

## Caveats and Inconsistencies

- The backend React generator maps imported Elementor `TextEditor` comp type to `RichText` in one path, while the reverse type mapping still maps Elementor `text-editor` to `TextEditor`.
- Preview renders raw HTML, so caller-provided `content` must already be trusted or sanitized.
- The direct framework prop type does not expose font weight, font style, text transform, text decoration, link colors, or drop-cap controls, but raw `settings` can still pass them.
- Backend widget cleanup rewrites generic `title_color` to `text_color` for `text-editor`.
- Backend JSX export currently writes `columns` as scalar `text_columns` and drops generic column gap during text-editor cleanup. Treat responsive text columns and `columnGap` as framework-preview/direct-JSON support unless backend mapping is updated.

## Example

```tsx
import { TextEditor } from '@upbuilder/elementor-framework';

export function IntroCopy() {
  return (
    <TextEditor
      content="<p>Build production-ready Elementor layouts from typed React.</p>"
      align={{ desktop: 'left', mobile: 'center' }}
      color="#475467"
      fontSize={{ desktop: 18, mobile: 16 }}
      lineHeight={1.6}
      paragraphSpacing={14}
      columns={{ desktop: 2, mobile: 1 }}
      columnGap={32}
    />
  );
}
```
