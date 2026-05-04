# Accordion

## Purpose

`Accordion` maps to Elementor's core `accordion` widget. It renders a list of collapsible title/content panels where only one panel is open at a time in the framework preview.

## Import

```tsx
import { Accordion } from '@upbuilder/elementor-framework';
import type { AccordionProps, AccordionItem } from '@upbuilder/elementor-framework';
```

Export name: `Accordion`

Internal widget key: `accordion`

Elementor widget type: `accordion`

## TypeScript Props

```ts
type AccordionItem = {
  title: string;
  content: string;
  _id?: string;
};

type AccordionProps = BaseProps & {
  items?: AccordionItem[];
  defaultActiveIndex?: number | null;
  icon?: IconLike;
  activeIcon?: IconLike;
  titleHtmlTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  faqSchema?: boolean;
  iconAlign?: 'left' | 'right';
  borderWidth?: SliderValue;
  borderColor?: string;
  titleBackground?: string;
  titleColor?: string;
  titleActiveColor?: string;
  titlePadding?: ResponsiveValue<DimensionsValue>;
  titleFontSize?: ResponsiveValue<SliderValue>;
  titleFontWeight?: string | number;
  titleFontFamily?: string;
  titleLineHeight?: ResponsiveValue<SliderValue>;
  titleLetterSpacing?: ResponsiveValue<SliderValue>;
  titleTextShadow?: TextShadowValue;
  titleTextStroke?: TextStrokeValue;
  iconColor?: string;
  iconActiveColor?: string;
  iconSpace?: ResponsiveValue<SliderValue>;
  contentBackgroundColor?: string;
  contentColor?: string;
  contentPadding?: ResponsiveValue<DimensionsValue>;
  contentFontSize?: ResponsiveValue<SliderValue>;
  contentFontWeight?: string | number;
  contentFontFamily?: string;
  contentLineHeight?: ResponsiveValue<SliderValue>;
  contentLetterSpacing?: ResponsiveValue<SliderValue>;
  contentTextShadow?: TextShadowValue;
};
```

`BaseProps` also allows `id`, `className`, raw `settings`, `role`, `title`, `data-*`, `aria-*`, `positioning`, `zIndex`, and `sticky`.

## Responsive Support

Responsive object syntax is supported for `titlePadding`, `titleFontSize`, `titleLineHeight`, `titleLetterSpacing`, `iconSpace`, `contentPadding`, `contentFontSize`, `contentLineHeight`, and `contentLetterSpacing`.

Desktop maps to the base Elementor setting. Tablet and mobile map to `_tablet` and `_mobile` suffixes. The framework abstraction does not emit a laptop suffix for this widget.

## Defaults and Required Props

`items` is optional, but preview renders `null` when it is empty or omitted. Each item should provide `title` and `content`.

Defaults:

- `defaultActiveIndex`: `0` in preview when items exist; `null` keeps all items closed.
- `icon`: `fas fa-plus`
- `activeIcon`: `fas fa-minus`
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

Preview mode renders Elementor-compatible markup with `.elementor-widget-accordion`, `.elementor-accordion`, `.elementor-accordion-item`, `.elementor-tab-title`, and `.elementor-tab-content`.

The preview stores one `activeIndex`; clicking an open title closes it, clicking another title opens that item. Enter and Space activate titles. Content is injected with `dangerouslySetInnerHTML` from `tab_content`.

When `window.__UP_USE_ELEMENTOR_NATIVE_JS === true`, click/key handlers are omitted and active state is derived from `defaultActiveIndex` so Elementor's native runtime can manage behavior.

JSON mode registers an `ElementorElement` with `elType: 'widget'`, `widgetType: 'accordion'`, and mapped settings.

## Parser and Export Notes

The React parser maps JSX `<Accordion>` to compType `Accordion` and stores item arrays and styling props in `styleProps`. The Elementor builder maps compType `Accordion` to widget type `accordion`, accepts `items` or `tabs`, escapes item titles, and passes item content through as HTML.

Backend `props-to-settings.ts` also recognizes accordion-related style props for generic export flows, mainly nested accordion settings. The direct framework path in `src/builder/abstraction/index.tsx` is the authoritative mapping for this component.

## Caveats and Inconsistencies

- `defaultActiveIndex` is preview-only; it is not exported to Elementor JSON for the core accordion widget.
- `children` is part of `BaseProps` but is not rendered by this widget; use `items`.
- `content` is treated as HTML, so sanitize upstream content when needed.
- The registry lists `icon_align: 'right'`, but direct `mapWidgetProps` only emits `icon_align` when `iconAlign` is passed.
- Backend builder accepts `selected_icon` and `selected_active_icon` aliases in addition to framework `icon` and `activeIcon`; the framework API exposes `icon` and `activeIcon`.
- Backend JSX parsing captures `activeIcon`, but does not currently capture first-class `selected_active_icon` or `iconActiveColor` aliases from JSX. Use `activeIcon` and raw native settings only when necessary.

## Example

```tsx
import { Accordion } from '@upbuilder/elementor-framework';

export function FAQ() {
  return (
    <Accordion
      items={[
        { title: 'What is included?', content: '<p>Design, build, and export.</p>' },
        { title: 'Can I edit it later?', content: '<p>Yes, the output is native Elementor JSON.</p>' },
      ]}
      faqSchema
      iconAlign="right"
      titleColor="#1f2937"
      titleActiveColor="#0f766e"
      titlePadding={{ desktop: 18, mobile: 14 }}
      contentPadding={{ top: 0, right: 18, bottom: 18, left: 18 }}
      contentColor="#4b5563"
    />
  );
}
```
