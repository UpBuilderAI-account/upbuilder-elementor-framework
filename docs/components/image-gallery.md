# ImageGallery

## Purpose

`ImageGallery` maps to Elementor's `image-gallery` widget. It renders a static WordPress-style image gallery from an array of image URLs or image objects.

## Import

```tsx
import { ImageGallery } from '@upbuilder/elementor-framework';
import type { ImageGalleryProps, GalleryImage } from '@upbuilder/elementor-framework';
```

Framework source export: `ImageGallery` from `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`.

## Props and fields

Image type:

```ts
type GalleryImage = string | {
  id?: number | string;
  url: string;
  alt?: string;
  caption?: string;
};
```

Widget props:

```ts
{
  images?: GalleryImage[];
  thumbnailSize?: 'thumbnail' | 'medium' | 'large' | 'full';
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  caption?: 'attachment' | 'none';
  link?: 'file' | 'attachment' | 'none';
  openLightbox?: 'default' | 'yes' | 'no';
  randomOrder?: boolean;
  imageSpacing?: '' | 'custom';
  imageSpacingCustom?: SliderValue;
  imageBorderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
  imageBorderWidth?: ResponsiveValue<DimensionsValue>;
  imageBorderColor?: string;
  imageBorderRadius?: ResponsiveValue<DimensionsValue>;
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right' | 'justify'>;
  textColor?: string;
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

- `imageBorderWidth` -> `image_border_width*`
- `imageBorderRadius` -> `image_border_radius*`
- `align` -> `align*`
- `captionSpace` -> `caption_space*`
- `captionFontSize` -> `typography_font_size*`
- `captionLineHeight` -> `typography_line_height*`
- `captionLetterSpacing` -> `typography_letter_spacing*`
- shared widget layout props such as `zIndex`, `positioning`, and `sticky`

Non-responsive in the framework type: `columns`, `thumbnailSize`, `caption`, `link`, `openLightbox`, `randomOrder`, `imageSpacingCustom`, border type/color, text color, caption family/weight/shadow.

Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Defaults and required props

No prop is TypeScript-required, but preview mode returns `null` when `images` is omitted or empty.

Defaults:

- `thumbnailSize`: `thumbnail`.
- `columns`: `4`.
- `caption`: any value other than `none` maps to Elementor's default attachment caption behavior.
- `link`: `file`.
- `openLightbox`: `default`.
- `imageSpacing`: empty string, meaning Elementor default spacing.
- Image object `id`: `index + 1` when omitted.

## Elementor JSON/settings mapping

| TSX prop | Elementor setting |
| --- | --- |
| `images` | `wp_gallery` |
| `images[].id` | `wp_gallery[].id` |
| `images[].url` | `wp_gallery[].url` |
| `images[].alt` | `wp_gallery[].alt` |
| `images[].caption` | `wp_gallery[].caption` |
| `thumbnailSize` | `thumbnail_size` |
| `columns` | `gallery_columns` |
| `caption` | `gallery_display_caption`; `none` -> `none`, otherwise empty string |
| `link` | `gallery_link` |
| `openLightbox` | `open_lightbox` |
| `randomOrder` | `gallery_rand`; true -> `rand`, false -> empty string |
| `imageSpacing` | `image_spacing` |
| `imageSpacingCustom` | `image_spacing_custom` |
| `imageBorderType` | `image_border_border` |
| `imageBorderWidth` | `image_border_width*` |
| `imageBorderColor` | `image_border_color` |
| `imageBorderRadius` | `image_border_radius*` |
| `align` | `align*` |
| `textColor` | `text_color` |
| `captionSpace` | `caption_space*` |
| caption typography props | `typography_*` |
| `captionTextShadow` | `caption_shadow_*` |

`settings` is merged last, so raw Elementor settings can override normalized props.

Generated widget element:

```json
{
  "elType": "widget",
  "widgetType": "image-gallery",
  "settings": {}
}
```

## Preview/render behavior

Preview mode:

- Renders nothing when `wp_gallery` is empty.
- Renders `.elementor-widget-image-gallery`.
- Builds a WordPress-like structure: `.elementor-image-gallery > .gallery.galleryid-{id}.gallery-columns-{n}.gallery-size-{size}`.
- Each image renders as `figure.gallery-item > .gallery-icon`.
- `gallery_link="none"` renders a bare image.
- `gallery_link="attachment"` links to `#`.
- `gallery_link="file"` links to the image URL and adds Elementor lightbox attributes.
- Captions display when `gallery_display_caption !== 'none'` and use `caption || alt`.
- CSS handles columns, image spacing, borders/radius, gallery alignment, caption color/spacing/typography, and layout positioning.

## Parser/export notes

- `src/index.ts` re-exports `ImageGallery`, `ImageGalleryProps`, and `GalleryImage`.
- React parser maps `ImageGallery` to itself for Elementor export.
- Elementor type mapping maps `ImageGallery` to widget type `image-gallery`.
- Backend `element-builder.ts` has a dedicated `case 'ImageGallery'` and also accepts `styleProps.wp_gallery` as an image source alias.
- Backend validator allows the `IMAGE_GALLERY_SETTINGS` set for `image-gallery`.

## Caveats and inconsistencies

- `randomOrder` writes `gallery_rand`, but framework preview does not shuffle the image array.
- `caption="attachment"` does not fetch WordPress attachment metadata in preview; preview uses `caption || alt` from the provided data.
- `gallery_link="attachment"` uses `href="#"` in preview.
- `columns` is not responsive.
- `imageSpacingCustom` is scalar in the framework abstraction.

## Example

```tsx
import { ImageGallery } from '@upbuilder/elementor-framework';

export function ProductGallery() {
  return (
    <ImageGallery
      images={[
        { url: '/assets/product-1.jpg', alt: 'Dashboard overview', caption: 'Overview' },
        { url: '/assets/product-2.jpg', alt: 'Pipeline board', caption: 'Pipeline' },
        { url: '/assets/product-3.jpg', alt: 'Report export', caption: 'Reports' },
      ]}
      columns={3}
      thumbnailSize="large"
      link="file"
      openLightbox="default"
      imageSpacing="custom"
      imageSpacingCustom={16}
      imageBorderRadius={8}
      textColor="#374151"
      captionFontSize={14}
    />
  );
}
```
