# Toggle

## Purpose

`Toggle` maps to Elementor's core `toggle` widget. It renders a list of collapsible items where multiple panels can be open at once in the framework preview.

## Import

```tsx
import { Toggle } from '@upbuilder/elementor-framework';
import type { ToggleProps, AccordionItem } from '@upbuilder/elementor-framework';
```

Export name: `Toggle`

Internal widget key: `toggle`

Elementor widget type: `toggle`

## TypeScript Props

`ToggleProps` extends `AccordionProps` and adds toggle-specific spacing and shadow controls.

```ts
type ToggleProps = AccordionProps & {
  spaceBetween?: ResponsiveValue<SliderValue>;
  boxShadow?: BoxShadowValue;
};
```

Inherited item type:

```ts
type AccordionItem = {
  title: string;
  content: string;
  _id?: string;
};
```

Inherited props include `items`, `defaultActiveIndex`, `icon`, `activeIcon`, `titleHtmlTag`, `faqSchema`, `iconAlign`, border settings, title/content colors, title/content typography, title/content padding, icon colors, and `iconSpace`.

Inherited typography/style fields from `AccordionProps` include:

```ts
{
  titleBackground?: string;
  titleColor?: string;
  titleActiveColor?: string;
  titleFontSize?: ResponsiveValue<SliderValue>;
  titleFontWeight?: string | number;
  titleFontFamily?: string;
  titleLineHeight?: ResponsiveValue<SliderValue>;
  titleLetterSpacing?: ResponsiveValue<SliderValue>;
  titleTextShadow?: TextShadowValue;
  titleTextStroke?: TextStrokeValue;
  titlePadding?: ResponsiveValue<DimensionsValue>;
  iconColor?: string;
  iconActiveColor?: string;
  iconSpace?: ResponsiveValue<SliderValue>;
  contentBackgroundColor?: string;
  contentColor?: string;
  contentFontSize?: ResponsiveValue<SliderValue>;
  contentFontWeight?: string | number;
  contentFontFamily?: string;
  contentLineHeight?: ResponsiveValue<SliderValue>;
  contentLetterSpacing?: ResponsiveValue<SliderValue>;
  contentTextShadow?: TextShadowValue;
  contentPadding?: ResponsiveValue<DimensionsValue>;
}
```

`BaseProps` also allows `id`, `className`, raw `settings`, `role`, `title`, `data-*`, `aria-*`, `positioning`, `zIndex`, and `sticky`.

## Responsive Support

Responsive object syntax is supported for inherited responsive accordion props plus `spaceBetween`.

Desktop maps to the base Elementor setting. Tablet and mobile map to `_tablet` and `_mobile` suffixes. The framework abstraction does not emit a laptop suffix for this widget.

## Defaults and Required Props

`items` is optional, but preview renders `null` when it is empty or omitted. Each item should provide `title` and `content`.

Defaults:

- `defaultActiveIndex`: `0` in preview when items exist; `null` keeps all items closed.
- `icon`: `fas fa-caret-right`
- `activeIcon`: `fas fa-caret-up`
- `titleHtmlTag`: `div`
- `iconAlign`: not set by `mapWidgetProps`; registry default is `right`.

Invalid `defaultActiveIndex` values fall back to `0` when items exist.

## Elementor Settings Mapping

| Prop | Elementor setting |
| --- | --- |
| `items` | `tabs[]` with `_id`, `tab_title`, `tab_content` |
| `icon` | `selected_icon` |
| `activeIcon` | `selected_active_icon` |
| `titleHtmlTag` | `title_html_tag` |
| `faqSchema` | `faq_schema` as `yes` or empty string |
| `iconAlign` | `icon_align` |
| `borderWidth` | `border_width` |
| `borderColor` | `border_color` |
| `spaceBetween` | `space_between` plus responsive suffixes |
| `boxShadow` | `box_shadow_box_shadow_type: yes`, `box_shadow_box_shadow` |
| `titleBackground` | `title_background` |
| `titleColor` | `title_color` |
| `titleActiveColor` | `tab_active_color` |
| `titlePadding` | `title_padding` plus responsive suffixes |
| `iconColor` | `icon_color` |
| `iconActiveColor` | `icon_active_color` |
| `iconSpace` | `icon_space` plus responsive suffixes |
| `contentBackgroundColor` | `content_background_color` |
| `contentColor` | `content_color` |
| `contentPadding` | `content_padding` plus responsive suffixes |
| title typography props | `title_typography_*`, `title_shadow_*`, `text_stroke_*` |
| content typography props | `content_typography_*`, `content_shadow_*` |
| `settings` | merged last and overrides generated settings |

## Preview and Render Behavior

Preview mode renders Elementor-compatible markup with `.elementor-widget-toggle`, `.elementor-toggle`, `.elementor-toggle-item`, `.elementor-tab-title`, and `.elementor-tab-content`.

The preview stores a `Set<number>` of open items. Clicking or pressing Enter/Space toggles an individual item without closing the others. Content is injected with `dangerouslySetInnerHTML` from `tab_content`.

When `window.__UP_USE_ELEMENTOR_NATIVE_JS === true`, click/key handlers are omitted and active state is derived from `defaultActiveIndex` so Elementor's native runtime can manage behavior.

JSON mode registers an `ElementorElement` with `elType: 'widget'`, `widgetType: 'toggle'`, and mapped settings.

## Parser and Export Notes

The React parser maps JSX `<Toggle>` to compType `Toggle` and stores item arrays and styling props in `styleProps`. The Elementor builder maps compType `Toggle` to widget type `toggle`, accepts `items` or `tabs`, escapes item titles, and passes item content through as HTML.

Backend validation includes `tabs`, icon settings, title/content styling, responsive `space_between`, and `box_shadow_*` for this widget.

## Caveats and Inconsistencies

- `defaultActiveIndex` is preview-only; it is not exported to Elementor JSON for the core toggle widget.
- `children` is part of `BaseProps` but is not rendered by this widget; use `items`.
- `content` is treated as HTML, so sanitize upstream content when needed.
- `faqSchema` is inherited from `AccordionProps` and mapped, although Elementor's core toggle support for FAQ schema may differ by Elementor version.
- The registry lists `icon_align: 'right'`, but direct `mapWidgetProps` only emits `icon_align` when `iconAlign` is passed.
- Backend JSX parsing captures `activeIcon`, but does not currently capture first-class `selected_active_icon` or `iconActiveColor` aliases from JSX. Use `activeIcon` and raw native settings only when necessary.

## Example

```tsx
import { Toggle } from '@upbuilder/elementor-framework';

export function SpecsToggle() {
  return (
    <Toggle
      items={[
        { title: 'Materials', content: '<p>Aluminum frame with matte finish.</p>' },
        { title: 'Warranty', content: '<p>Two years on parts and labor.</p>' },
      ]}
      defaultActiveIndex={null}
      spaceBetween={{ desktop: 12, mobile: 8 }}
      titleBackground="#f8fafc"
      titleColor="#111827"
      contentColor="#475569"
      borderWidth={1}
      borderColor="#e5e7eb"
    />
  );
}
```
