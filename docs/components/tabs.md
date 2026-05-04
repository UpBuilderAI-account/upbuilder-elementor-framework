# Tabs

## Purpose

`Tabs` maps to Elementor's core `tabs` widget. It renders a set of tab titles and associated HTML content panels in either horizontal or vertical layout.

## Import

```tsx
import { Tabs } from '@upbuilder/elementor-framework';
import type { TabsProps, TabsItem } from '@upbuilder/elementor-framework';
```

Export name: `Tabs`

Internal widget key: `tabs`

Elementor widget type: `tabs`

## TypeScript Props

```ts
type TabsItem = {
  title: string;
  content: string;
  _id?: string;
};

type TabsProps = BaseProps & {
  items?: TabsItem[];
  defaultActiveIndex?: number | null;
  type?: 'horizontal' | 'vertical';
  align?: '' | 'center' | 'end' | 'stretch';
  navigationWidth?: SliderValue;
  borderWidth?: SliderValue;
  borderColor?: string;
  backgroundColor?: string;
  tabColor?: string;
  tabActiveColor?: string;
  titleAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
  tabFontSize?: ResponsiveValue<SliderValue>;
  tabFontWeight?: string | number;
  tabFontFamily?: string;
  tabLineHeight?: ResponsiveValue<SliderValue>;
  tabLetterSpacing?: ResponsiveValue<SliderValue>;
  tabTextShadow?: TextShadowValue;
  tabTextStroke?: TextStrokeValue;
  contentColor?: string;
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

Responsive object syntax is supported for `tabFontSize`, `tabLineHeight`, `tabLetterSpacing`, `contentFontSize`, `contentLineHeight`, and `contentLetterSpacing`.

Desktop maps to the base Elementor setting. Tablet and mobile map to `_tablet` and `_mobile` suffixes. The framework abstraction does not emit a laptop suffix for this widget.

## Defaults and Required Props

`items` is optional, but preview renders `null` when it is empty or omitted. Each item should provide `title` and `content`.

Defaults:

- `defaultActiveIndex`: `0` in preview when items exist.
- `type`: `horizontal`
- `align`: omitted unless passed.
- Item `_id`: generated as `tab_${index}` when omitted.

Invalid `defaultActiveIndex` values fall back to `0` when items exist.

## Elementor Settings Mapping

| Prop | Elementor setting |
| --- | --- |
| `items` | `tabs[]` with `_id`, `tab_title`, `tab_content` |
| `type` | `type` |
| `align` | `tabs_align_horizontal` or `tabs_align_vertical` based on `type` |
| `navigationWidth` | `navigation_width` |
| `borderWidth` | `border_width` |
| `borderColor` | `border_color` |
| `backgroundColor` | `background_color` |
| `tabColor` | `tab_color` |
| `tabActiveColor` | `tab_active_color` |
| `titleAlign` | `title_align` |
| tab typography props | `tab_typography_*`, `title_shadow_*`, `text_stroke_*` |
| `contentColor` | `content_color` |
| content typography props | `content_typography_*`, `content_shadow_*` |
| `settings` | merged last and overrides generated settings |

## Preview and Render Behavior

Preview mode renders Elementor-compatible markup with `.elementor-widget-tabs`, `.elementor-tabs`, `.elementor-tabs-wrapper`, desktop tab titles, mobile tab titles, and `.elementor-tab-content`.

The preview stores one `activeIndex`. Clicking a title or pressing Enter/Space activates that tab. Content is injected with `dangerouslySetInnerHTML` from `tab_content`.

Horizontal tabs use `tabs_align_horizontal`; vertical tabs use `tabs_align_vertical` and can use `navigation_width`. The preview includes the Elementor view/alignment classes.

When `window.__UP_USE_ELEMENTOR_NATIVE_JS === true`, click/key handlers are omitted and active state is derived from `defaultActiveIndex` so Elementor's native runtime can manage behavior.

JSON mode registers an `ElementorElement` with `elType: 'widget'`, `widgetType: 'tabs'`, and mapped settings.

## Parser and Export Notes

The React parser maps JSX `<Tabs>` to compType `Tabs` and stores item arrays and styling props in `styleProps`. The Elementor builder maps compType `Tabs` to widget type `tabs`, accepts `items` or `tabs`, escapes item titles, and passes item content through as HTML.

Backend type mappings also distinguish `TabsWrapper` and `NestedTabs`, which export to Elementor's `nested-tabs` widget. This file documents the core `Tabs` component only.

## Caveats and Inconsistencies

- `defaultActiveIndex` is preview-only; it is not exported to Elementor JSON for the core tabs widget.
- `children` is part of `BaseProps` but is not rendered by this widget; use `items`.
- `content` is treated as HTML, so sanitize upstream content when needed.
- The framework `align` type does not include `left` or `right`; the backend builder normalizes those values if they arrive from generic parser flows.
- `backgroundColor` maps only to `background_color`; it does not set `background_background`.

## Example

```tsx
import { Tabs } from '@upbuilder/elementor-framework';

export function ProductTabs() {
  return (
    <Tabs
      type="horizontal"
      align="center"
      items={[
        { title: 'Overview', content: '<p>Fast setup with native Elementor output.</p>' },
        { title: 'Details', content: '<ul><li>Responsive controls</li><li>Editable JSON</li></ul>' },
      ]}
      tabColor="#334155"
      tabActiveColor="#0f766e"
      tabFontSize={{ desktop: 16, mobile: 14 }}
      contentColor="#475569"
    />
  );
}
```
