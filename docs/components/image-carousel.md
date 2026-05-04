# ImageCarousel

## Purpose

`ImageCarousel` maps to Elementor's `image-carousel` widget. It renders a Swiper-compatible image carousel with optional arrows, dots, captions, lazy loading, links, and image/caption styling.

## Import

```tsx
import { ImageCarousel } from '@upbuilder/elementor-framework';
import type { ImageCarouselProps, CarouselImage } from '@upbuilder/elementor-framework';
```

Framework source export: `ImageCarousel` from `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`.

## Props and fields

Image type:

```ts
type CarouselImage = string | {
  id?: number | string;
  url: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
};
```

Widget props:

```ts
{
  images?: CarouselImage[];
  carousel?: CarouselImage[];
  carouselName?: string;
  thumbnailSize?: 'thumbnail' | 'medium' | 'large' | 'full' | 'custom';
  thumbnailCustomDimension?: { width?: number | string; height?: number | string };
  slidesToShow?: ResponsiveValue<number | ''>;
  slidesToScroll?: ResponsiveValue<number | ''>;
  imageStretch?: boolean;
  navigation?: 'both' | 'arrows' | 'dots' | 'none';
  previousIcon?: IconLike;
  nextIcon?: IconLike;
  linkTo?: 'none' | 'file' | 'custom';
  link?: LinkLike;
  openLightbox?: 'default' | 'yes' | 'no';
  captionType?: '' | 'title' | 'caption' | 'description';
  lazyload?: boolean;
  autoplay?: boolean;
  pauseOnHover?: boolean;
  pauseOnInteraction?: boolean;
  autoplaySpeed?: number;
  infinite?: boolean;
  speed?: number;
  direction?: 'ltr' | 'rtl';
  effect?: 'slide' | 'fade';
  arrowsPosition?: 'inside' | 'outside';
  arrowsSize?: ResponsiveValue<SliderValue>;
  arrowsColor?: string;
  dotsPosition?: 'inside' | 'outside';
  dotsGap?: ResponsiveValue<SliderValue>;
  dotsSize?: ResponsiveValue<SliderValue>;
  dotsInactiveColor?: string;
  dotsColor?: string;
  galleryVerticalAlign?: ResponsiveValue<'flex-start' | 'center' | 'flex-end'>;
  imageSpacing?: ResponsiveValue<SliderValue>;
  imageBorderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
  imageBorderWidth?: ResponsiveValue<DimensionsValue>;
  imageBorderColor?: string;
  imageBorderRadius?: ResponsiveValue<DimensionsValue>;
  captionAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify' | 'start' | 'end'>;
  captionColor?: string;
  captionSpace?: ResponsiveValue<SliderValue>;
  captionFontSize?: ResponsiveValue<SliderValue>;
  captionFontWeight?: string | number;
  captionFontFamily?: string;
  captionLineHeight?: ResponsiveValue<SliderValue>;
  captionLetterSpacing?: ResponsiveValue<SliderValue>;
  captionTextShadow?: TextShadowValue;
}
```

Base widget props include `id`, `className`, `settings`, ARIA/data attributes, and shared positioning/sticky/z-index props.

## Responsive support

Responsive mappings:

- `slidesToShow` -> `slides_to_show*`
- `slidesToScroll` -> `slides_to_scroll*`
- `arrowsSize` -> `arrows_size*`
- `dotsGap` -> `dots_gap*`
- `dotsSize` -> `dots_size*`
- `galleryVerticalAlign` -> `gallery_vertical_align*`
- `imageSpacing` -> `image_spacing_custom*` and sets `image_spacing="custom"`
- `imageBorderWidth` -> `image_border_width*`
- `imageBorderRadius` -> `image_border_radius*`
- `captionAlign` -> `caption_align*`
- `captionSpace` -> `caption_space*`
- `captionFontSize` -> `caption_typography_font_size*`
- `captionLineHeight` -> `caption_typography_line_height*`
- `captionLetterSpacing` -> `caption_typography_letter_spacing*`
- shared widget layout props such as `zIndex`, `positioning`, and `sticky`

Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Defaults and required props

No prop is TypeScript-required, but preview mode returns `null` when neither `images` nor `carousel` contains items.

Framework abstraction defaults:

- `thumbnailSize`: `medium`.
- `navigation`: `both`.
- `previousIcon`: `eicon-chevron-left`.
- `nextIcon`: `eicon-chevron-right`.

Widget registry defaults:

- `slides_to_show`: `3`.
- `slides_to_scroll`: `1`.
- `navigation`: `both`.
- `autoplay`: `yes`.
- `infinite`: `yes`.

Backend builder defaults:

- `slides_to_show`: `3`.
- `slides_to_scroll`: `1`.
- `autoplay`: `yes` unless `autoplay={false}`.
- `autoplay_speed`: `3000`.
- `infinite`: `yes` unless `infinite={false}` or `loop={false}`.

## Elementor JSON/settings mapping

| TSX prop | Elementor setting |
| --- | --- |
| `images` / `carousel` | `carousel` |
| `carouselName` | `carousel_name` |
| `thumbnailSize` | `thumbnail_size` |
| `thumbnailCustomDimension` | `thumbnail_custom_dimension` |
| `slidesToShow` | `slides_to_show*` |
| `slidesToScroll` | `slides_to_scroll*` |
| `imageStretch` | `image_stretch` as `yes` or empty string |
| `navigation` | `navigation` |
| `previousIcon` | `navigation_previous_icon` |
| `nextIcon` | `navigation_next_icon` |
| `linkTo` | `link_to` |
| `link` | `link` |
| `openLightbox` | `open_lightbox` |
| `captionType` | `caption_type` |
| `lazyload` | `lazyload` as `yes` or empty string |
| `autoplay` | `autoplay` as `yes` or empty string |
| `pauseOnHover` | `pause_on_hover` |
| `pauseOnInteraction` | `pause_on_interaction` |
| `autoplaySpeed` | `autoplay_speed` |
| `infinite` | `infinite` |
| `speed` | `speed` |
| `direction` | `direction` |
| `effect` | `effect` |
| `arrowsPosition` | `arrows_position` |
| `arrowsSize` | `arrows_size*` |
| `arrowsColor` | `arrows_color` |
| `dotsPosition` | `dots_position` |
| `dotsGap` | `dots_gap*` |
| `dotsSize` | `dots_size*` |
| `dotsInactiveColor` | `dots_inactive_color` |
| `dotsColor` | `dots_color` |
| `galleryVerticalAlign` | `gallery_vertical_align*` |
| `imageSpacing` | `image_spacing="custom"`, `image_spacing_custom*` |
| `imageBorderType` | `image_border_border` |
| `imageBorderWidth` | `image_border_width*` |
| `imageBorderColor` | `image_border_color` |
| `imageBorderRadius` | `image_border_radius*` |
| `captionAlign` | `caption_align*` |
| `captionColor` | `caption_text_color` |
| `captionSpace` | `caption_space*` |
| caption typography props | `caption_typography_*` |
| `captionTextShadow` | `caption_shadow_*` |

`settings` is merged last, so raw Elementor settings can override normalized props.

Generated widget element:

```json
{
  "elType": "widget",
  "widgetType": "image-carousel",
  "settings": {}
}
```

## Preview/render behavior

Preview mode:

- Renders nothing when the carousel array is empty.
- Renders `.elementor-widget-image-carousel`.
- The carousel region uses `.elementor-image-carousel-wrapper.swiper`.
- Images render inside `.elementor-image-carousel.swiper-wrapper`.
- Each image renders as a `.swiper-slide` containing `figure.swiper-slide-inner`.
- Captions come from `title`, `caption`, or `description` according to `captionType`.
- `linkTo="custom"` wraps every image in the same custom `link`.
- `linkTo="file"` wraps each image in its own file URL and adds Elementor lightbox attributes.
- `lazyload` moves the image URL to `data-src` and renders a `.swiper-lazy-preloader`.
- Arrows render only when there is more than one image and `navigation` includes arrows.
- Dots render only when there is more than one image and `navigation` includes dots.
- `data-settings` includes carousel runtime settings for Elementor/Swiper.
- CSS handles wrapper overflow, image stretch, spacing, arrows, dots, borders, captions, and responsive values.

## Parser/export notes

- `src/index.ts` re-exports `ImageCarousel`, `ImageCarouselProps`, and `CarouselImage`.
- React parser maps `ImageCarousel` to itself for Elementor export.
- Elementor type mapping maps `ImageCarousel` to widget type `image-carousel`.
- Backend `element-builder.ts` handles both `ImageCarousel` and `SwiperSlider`; it accepts `slidesPerView` as an alias for `slidesToShow` and `slidesPerGroup` as an alias for `slidesToScroll`.
- Backend validator allows the `IMAGE_CAROUSEL_SETTINGS` set for `image-carousel`.
- `props-to-settings.ts` contains older generic carousel mappings for `slidesToShow`, `slidesToScroll`, `carouselAutoplaySpeed`, `carouselSpeed`, and related responsive props.

## Caveats and inconsistencies

- Framework abstraction does not write `slides_to_show`, `slides_to_scroll`, `autoplay`, or `infinite` unless those props are provided, even though registry/backend builder have defaults.
- Preview renders Swiper-compatible markup and data attributes but does not initialize Swiper by itself unless the surrounding runtime does.
- `navigation` is a direct framework/runtime prop. Backend builders can read `navigation` when present in style props, but the current React parser whitelist does not capture it from JSX, so backend export may rely on defaults unless raw settings provide it.
- `linkTo="custom"` applies one global link to every image.
- The framework type includes `images` and `carousel`; `images` takes precedence.
- `effect="fade"` is written to settings, but preview CSS still lays out slides with flex.

## Example

```tsx
import { ImageCarousel } from '@upbuilder/elementor-framework';

export function LogoCarousel() {
  return (
    <ImageCarousel
      carouselName="Partner logos"
      images={[
        { url: '/assets/logo-1.png', alt: 'Logo 1', title: 'Partner 1' },
        { url: '/assets/logo-2.png', alt: 'Logo 2', title: 'Partner 2' },
        { url: '/assets/logo-3.png', alt: 'Logo 3', title: 'Partner 3' },
      ]}
      slidesToShow={{ desktop: 3, tablet: 2, mobile: 1 }}
      slidesToScroll={1}
      navigation="both"
      autoplay
      autoplaySpeed={3500}
      infinite
      imageStretch
      imageSpacing={{ desktop: 24, mobile: 12 }}
      captionType="title"
      captionAlign="center"
      dotsColor="#0f766e"
      dotsInactiveColor="#d1d5db"
    />
  );
}
```
