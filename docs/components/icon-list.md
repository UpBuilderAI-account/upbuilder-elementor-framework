# IconList

## Purpose

`IconList` maps to Elementor's `icon-list` widget. It renders a traditional or inline list where each item can include text, an icon, and an optional link.

## Import

```tsx
import { IconList } from '@upbuilder/elementor-framework';
import type { IconListProps, IconListItem } from '@upbuilder/elementor-framework';
```

Framework source export: `IconList` from `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`.

## Props and fields

Item type:

```ts
type IconListItem = {
  text: string;
  icon?: IconLike;
  selected_icon?: IconLike;
  link?: LinkLike;
  _id?: string;
};
```

Widget props:

```ts
{
  items?: IconListItem[];
  view?: 'traditional' | 'inline';
  linkClick?: 'full_width' | 'inline';
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right'>;
  spaceBetween?: ResponsiveValue<SliderValue>;
  divider?: boolean;
  dividerStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  dividerWeight?: SliderValue;
  dividerWidth?: SliderValue;
  dividerHeight?: SliderValue;
  dividerColor?: string;
  iconColor?: string;
  iconHoverColor?: string;
  iconHoverTransition?: SliderValue;
  iconSize?: ResponsiveValue<SliderValue>;
  iconGap?: SliderValue;
  iconSelfAlign?: ResponsiveValue<'left' | 'center' | 'right'>;
  iconVerticalAlign?: ResponsiveValue<'flex-start' | 'center' | 'flex-end'>;
  iconVerticalOffset?: ResponsiveValue<SliderValue>;
  textColor?: string;
  textHoverColor?: string;
  textHoverTransition?: SliderValue;
  fontSize?: ResponsiveValue<SliderValue>;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  lineHeight?: ResponsiveValue<SliderValue>;
  letterSpacing?: ResponsiveValue<SliderValue>;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: TextShadowValue;
}
```

Base widget props include `id`, `className`, `settings`, ARIA/data attributes, and shared positioning/sticky/z-index props.

## Responsive support

Responsive mappings:

- `align` -> `icon_align`, `icon_align_tablet`, `icon_align_mobile`
- `spaceBetween` -> `space_between*`
- `iconSize` -> `icon_size*`
- `iconSelfAlign` -> `icon_self_align*`
- `iconVerticalAlign` -> `icon_self_vertical_align*`
- `iconVerticalOffset` -> `icon_vertical_offset*`
- `fontSize` -> `icon_typography_font_size*`
- `lineHeight` -> `icon_typography_line_height*`
- `letterSpacing` -> `icon_typography_letter_spacing*`
- shared widget layout props such as `zIndex`, `positioning`, and `sticky`

Non-responsive in the framework type: `iconGap`, divider weight/width/height/color/style, icon/text colors, hover transitions, font family/weight/style/decoration/transform, and text shadow.

Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Defaults and required props

No widget prop is TypeScript-required, but preview mode returns `null` when `items` is omitted or empty.

Defaults:

- `view`: `traditional`.
- `linkClick`: `full_width`.
- Each item `_id`: `item_${index}` in framework JSON mode.
- Item `selected_icon`: empty icon object when no `icon`/`selected_icon` is supplied.

Backend builder validates each item and requires `text` to be a string. Invalid items are filtered by `safeParseJsonArray` when building from generic `StructureElement` style props.

## Elementor JSON/settings mapping

| TSX prop | Elementor setting |
| --- | --- |
| `items` | `icon_list` |
| `items[].text` | `icon_list[].text` |
| `items[].icon` / `selected_icon` | `icon_list[].selected_icon` |
| `items[].link` | `icon_list[].link` |
| `view` | `view` |
| `linkClick` | `link_click` |
| `align` | `icon_align*` |
| `spaceBetween` | `space_between*` |
| `divider` | `divider` as `yes` or empty string |
| `dividerStyle` | `divider_style` |
| `dividerWeight` | `divider_weight` |
| `dividerWidth` | `divider_width` |
| `dividerHeight` | `divider_height` |
| `dividerColor` | `divider_color` |
| `iconColor` | `icon_color` |
| `iconHoverColor` | `icon_color_hover` |
| `iconHoverTransition` | `icon_color_hover_transition` |
| `iconSize` | `icon_size*` |
| `iconGap` | `text_indent` |
| `iconSelfAlign` | `icon_self_align*` |
| `iconVerticalAlign` | `icon_self_vertical_align*` |
| `iconVerticalOffset` | `icon_vertical_offset*` |
| `textColor` | `text_color` |
| `textHoverColor` | `text_color_hover` |
| `textHoverTransition` | `text_color_hover_transition` |
| typography props | `icon_typography_*` |
| `textShadow` | `text_shadow_*` |

`align` aliases are normalized:

- `left` -> `start`
- `right` -> `end`
- `start`, `center`, `end` pass through

`settings` is merged last, so raw Elementor settings can override normalized props.

Generated widget element:

```json
{
  "elType": "widget",
  "widgetType": "icon-list",
  "settings": {}
}
```

## Preview/render behavior

Preview mode:

- Renders nothing when `icon_list` is empty.
- Outer classes include `elementor-widget-icon-list`, `elementor-icon-list--layout-*`, `elementor-list-item-link-*`, and responsive alignment classes.
- Renders a `ul.elementor-icon-list-items`.
- Inline lists add `elementor-inline-items` and item-level `elementor-inline-item`.
- Linked items wrap icon/text in an anchor.
- Icons render through `renderPreviewIcon` when `selected_icon.value` is present.
- CSS handles list spacing, inline spacing, divider borders, icon size/color/offset/alignment, text typography, and hover colors.

## Parser/export notes

- `src/index.ts` re-exports `IconList`, `IconListProps`, and `IconListItem`.
- React parser maps `IconList` to itself; generic `List` also maps to Elementor widget type `icon-list` in Elementor types.
- Backend `element-builder.ts` has a dedicated `case 'IconList'`.
- Backend validator allows the `ICON_LIST_SETTINGS` set for `icon-list`.
- `cleanupWidgetLayoutSettings` removes unrelated `title_color` and `button_text_color` from icon-list settings.
- `props-to-settings.ts` contains older generic icon-list mappings for props such as `iconAlign`, `spaceBetween`, divider settings, `iconGap`, and hover colors.

## Caveats and inconsistencies

- The TS type requires `IconListItem.text`, but the widget prop `items` itself is optional.
- Framework preview does not render anything for an empty list.
- `iconGap` is not typed as responsive in the framework, although related icon alignment props are.
- Backend builder accepts `iconAlign` as an alias for `align`; the framework abstraction uses `align`.
- Divider width/height are scalar in the framework abstraction.

## Example

```tsx
import { IconList } from '@upbuilder/elementor-framework';

export function BenefitsList() {
  return (
    <IconList
      view="traditional"
      linkClick="inline"
      align={{ desktop: 'start', mobile: 'center' }}
      spaceBetween={{ desktop: 14, mobile: 10 }}
      iconSize={{ desktop: 18, mobile: 16 }}
      iconGap={10}
      iconColor="#0f766e"
      textColor="#111827"
      fontSize={{ desktop: 16, mobile: 15 }}
      items={[
        { text: 'SOC 2-ready workflows', icon: 'fas fa-check' },
        { text: 'Automated reminders', icon: 'fas fa-bell' },
        { text: 'Audit trail', icon: 'fas fa-clipboard-list', link: '/security' },
      ]}
    />
  );
}
```
