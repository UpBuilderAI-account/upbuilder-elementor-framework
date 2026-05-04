# Slides

## Purpose

`Slides` maps to Elementor Pro's `slides` widget. It renders a hero/content slider with background images or colors, optional overlays, headings, descriptions, buttons, navigation, autoplay settings, and content styling.

## Import

```tsx
import { Slides } from '@upbuilder/elementor-framework';
import type { SlidesProps, SlideItem } from '@upbuilder/elementor-framework';
```

Framework source export: `Slides` from `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`.

## Props and fields

Slide item type:

```ts
type SlideItem = {
  _id?: string;
  title?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  button_text?: string;
  link?: LinkLike;
  linkClick?: 'slide' | 'button';
  backgroundColor?: string;
  backgroundImage?: ImageLike;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundKenBurns?: boolean;
  zoomDirection?: 'in' | 'out';
  backgroundOverlay?: boolean;
  backgroundOverlayColor?: string;
  horizontalPosition?: 'left' | 'center' | 'right';
  verticalPosition?: 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  contentColor?: string;
};
```

Widget props:

```ts
{
  slides?: SlideItem[];
  slidesName?: string;
  height?: ResponsiveValue<SliderValue>;
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  descriptionTag?: 'div' | 'span' | 'p';
  navigation?: 'both' | 'arrows' | 'dots' | 'none';
  autoplay?: boolean;
  pauseOnHover?: boolean;
  pauseOnInteraction?: boolean;
  autoplaySpeed?: number;
  infinite?: boolean;
  transition?: 'slide' | 'fade';
  transitionSpeed?: number;
  contentAnimation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'zoomIn' | '';
  contentMaxWidth?: ResponsiveValue<SliderValue>;
  padding?: ResponsiveValue<DimensionsValue>;
  horizontalPosition?: ResponsiveValue<'left' | 'center' | 'right'>;
  verticalPosition?: ResponsiveValue<'top' | 'middle' | 'bottom'>;
  textAlign?: ResponsiveValue<'left' | 'center' | 'right'>;
  headingColor?: string;
  descriptionColor?: string;
  headingSpacing?: ResponsiveValue<SliderValue>;
  descriptionSpacing?: ResponsiveValue<SliderValue>;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: ResponsiveValue<SliderValue>;
  buttonBorderRadius?: ResponsiveValue<SliderValue>;
  buttonHoverTextColor?: string;
  buttonHoverBorderColor?: string;
  headingFontSize?: ResponsiveValue<SliderValue>;
  headingFontWeight?: string | number;
  headingFontFamily?: string;
  descriptionFontSize?: ResponsiveValue<SliderValue>;
  descriptionFontWeight?: string | number;
  descriptionFontFamily?: string;
}
```

Base widget props include `id`, `className`, `settings`, ARIA/data attributes, and shared positioning/sticky/z-index props.

## Responsive support

Responsive mappings:

- `height` -> `slides_height*`
- `contentMaxWidth` -> `content_max_width*`
- `padding` -> `slides_padding*`
- `horizontalPosition` -> `slides_horizontal_position*`
- `verticalPosition` -> `slides_vertical_position*`
- `textAlign` -> `slides_text_align*`
- `headingSpacing` -> `heading_spacing*`
- `descriptionSpacing` -> `description_spacing*`
- `buttonBorderWidth` -> `button_border_width*`
- `buttonBorderRadius` -> `button_border_radius*`
- `headingFontSize` -> `heading_typography_font_size*`
- `headingFontSize`/`descriptionFontSize`, line height, and letter spacing are supported by the generic typography helpers when props exist in style data; this public type currently exposes font size, weight, and family for heading/description.
- shared widget layout props such as `zIndex`, `positioning`, and `sticky`

Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Defaults and required props

No prop is TypeScript-required, but preview mode returns `null` when `slides` is omitted or empty.

Framework abstraction defaults:

- `titleTag`: `div`.
- `descriptionTag`: `div`.
- `navigation`: `both`.
- Preview height fallback: `400px` when `height` is not set.

Backend builder defaults:

- `slides_title_tag`: `div`.
- `slides_description_tag`: `div`.
- `navigation`: `both`.
- `autoplay`: `yes` unless `autoplay={false}`.
- `infinite`: `yes` unless `infinite={false}`.

The widget registry marks `slides` as `elementor-pro`.

## Elementor JSON/settings mapping

Slide item mapping:

| SlideItem field | Elementor setting |
| --- | --- |
| `_id` | `slides[]._id` |
| `heading` / `title` | `slides[].heading` |
| `description` | `slides[].description` |
| `buttonText` / `button_text` | `slides[].button_text` |
| `link` | `slides[].link` |
| `linkClick` | `slides[].link_click` |
| `backgroundColor` | `slides[].background_color` |
| `backgroundImage` | `slides[].background_image` |
| `backgroundSize` | `slides[].background_size` |
| `backgroundKenBurns` | `slides[].background_ken_burns` |
| `zoomDirection` | `slides[].zoom_direction` |
| `backgroundOverlay` | `slides[].background_overlay` |
| `backgroundOverlayColor` | `slides[].background_overlay_color` |
| `horizontalPosition` | `slides[].horizontal_position` |
| `verticalPosition` | `slides[].vertical_position` |
| `textAlign` | `slides[].text_align` |
| `contentColor` | `slides[].content_color` |

Widget mapping:

| TSX prop | Elementor setting |
| --- | --- |
| `slides` | `slides` |
| `slidesName` | `slides_name` |
| `height` | `slides_height*` |
| `titleTag` | `slides_title_tag` |
| `descriptionTag` | `slides_description_tag` |
| `navigation` | `navigation` |
| `autoplay` | `autoplay` |
| `pauseOnHover` | `pause_on_hover` |
| `pauseOnInteraction` | `pause_on_interaction` |
| `autoplaySpeed` | `autoplay_speed` |
| `infinite` | `infinite` |
| `transition` | `transition` |
| `transitionSpeed` | `transition_speed` |
| `contentAnimation` | `content_animation` |
| `contentMaxWidth` | `content_max_width*` |
| `padding` | `slides_padding*` |
| `horizontalPosition` | `slides_horizontal_position*` |
| `verticalPosition` | `slides_vertical_position*` |
| `textAlign` | `slides_text_align*` |
| `headingColor` | `heading_color` |
| `descriptionColor` | `description_color` |
| `headingSpacing` | `heading_spacing*` |
| `descriptionSpacing` | `description_spacing*` |
| `buttonSize` | `button_size` |
| `buttonTextColor` | `button_text_color` |
| `buttonBorderColor` | `button_border_color` |
| `buttonBorderWidth` | `button_border_width*` |
| `buttonBorderRadius` | `button_border_radius*` |
| `buttonHoverTextColor` | `button_hover_text_color` |
| `buttonHoverBorderColor` | `button_hover_border_color` |
| heading typography props | `heading_typography_*` |
| description typography props | `description_typography_*` |

`settings` is merged last, so raw Elementor settings can override normalized props.

Generated widget element:

```json
{
  "elType": "widget",
  "widgetType": "slides",
  "settings": {}
}
```

## Preview/render behavior

Preview mode:

- Renders nothing when the slide array is empty.
- Renders `.elementor-widget-slides`.
- The carousel region uses `.elementor-slides-wrapper.elementor-main-swiper.swiper`.
- `data-settings` includes runtime fields such as navigation, autoplay, pause, speed, infinite, transition, and content animation.
- Each slide renders as `.swiper-slide.elementor-repeater-item-{_id}` with a `.swiper-slide-bg`.
- Background image, background color, and background size are applied inline from each slide.
- Overlay renders when `background_overlay === 'yes'`.
- Heading and description use the configured `slides_title_tag` and `slides_description_tag`.
- Button renders when `button_text` exists.
- When `link_click="slide"`, the slide content is wrapped in an anchor pointing to `slide.link.url`.
- Arrows render only when there is more than one slide and navigation includes arrows.
- Dots render only when there is more than one slide and navigation includes dots.
- CSS handles height, overlay, content positioning, padding, max width, text alignment, heading/description styles, button border styles, and responsive overrides.

## Parser/export notes

- `src/index.ts` re-exports `Slides`, `SlidesProps`, and `SlideItem`.
- React parser maps `Slides` to itself and captures `slides`, `slidesName`, `height`, `titleTag`, `descriptionTag`, `transition`, `transitionSpeed`, and `contentAnimation` as widget data.
- Elementor type mapping maps `Slides` to widget type `slides`.
- Backend `element-builder.ts` has a dedicated `case 'Slides'`.
- Backend validator allows the `SLIDES_SETTINGS` set for `slides`.
- Template builders treat `slides` as an Elementor Pro widget.

## Caveats and inconsistencies

- Framework abstraction writes `autoplay` and `infinite` only when props are provided; backend generic builder defaults both to `yes`.
- Preview defaults height to `400px` in CSS but does not write `slides_height` unless `height` is provided.
- Per-slide `horizontalPosition`, `verticalPosition`, `textAlign`, and `contentColor` are exported into slide repeater settings, but framework preview primarily uses the widget-level positioning/color props.
- Preview renders Swiper-compatible markup and data attributes but does not initialize Swiper by itself unless the surrounding runtime does.
- `navigation` is a direct framework/runtime prop. Backend builders can read `navigation` when present in style props, but the current React parser whitelist does not capture it from JSX, so backend export may rely on defaults unless raw settings provide it.
- `Slides` requires Elementor Pro in the exported Elementor environment.

## Example

```tsx
import { Slides } from '@upbuilder/elementor-framework';

export function HeroSlides() {
  return (
    <Slides
      slidesName="Homepage hero"
      height={{ desktop: 560, mobile: 420 }}
      navigation="both"
      autoplay
      autoplaySpeed={5000}
      infinite
      transition="slide"
      titleTag="h1"
      descriptionTag="p"
      contentMaxWidth={{ desktop: 720, mobile: 320 }}
      padding={{ top: 64, right: 32, bottom: 64, left: 32 }}
      horizontalPosition="center"
      verticalPosition="middle"
      textAlign="center"
      headingColor="#ffffff"
      descriptionColor="#e5e7eb"
      headingFontSize={{ desktop: 56, mobile: 34 }}
      headingFontWeight={800}
      descriptionFontSize={{ desktop: 20, mobile: 16 }}
      buttonSize="lg"
      buttonTextColor="#ffffff"
      buttonBorderColor="#ffffff"
      slides={[
        {
          heading: 'Launch cleaner operations',
          description: 'Centralize intake, approvals, and reporting in one workflow.',
          buttonText: 'See platform',
          link: '/platform',
          backgroundImage: { url: '/assets/hero-operations.jpg', alt: 'Operations dashboard' },
          backgroundOverlay: true,
          backgroundOverlayColor: 'rgba(17,24,39,0.55)',
        },
        {
          heading: 'Report status faster',
          description: 'Give every stakeholder a current view without manual updates.',
          buttonText: 'View reports',
          link: '/reports',
          backgroundColor: '#0f766e',
        },
      ]}
    />
  );
}
```
