# Image

## Purpose

`Image` represents Elementor's core `image` widget. Use it for standalone media, linked images, captions, responsive image sizing, and image styling that should export as Elementor Image.

## Import

```tsx
import { Image } from '@upbuilder/elementor-framework';
import type { ImageProps } from '@upbuilder/elementor-framework';
```

Export name: `Image`

Framework widget key: `image`

Elementor widget type: `image`

## TypeScript Props

`ImageProps` extends the shared widget base props:

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

Image-specific fields:

| Prop | Type | Elementor setting |
| --- | --- | --- |
| `image` | `ImageLike` | `image` |
| `image_size` | `full`, `large`, `medium`, or `thumbnail` | `image_size` |
| `alt` | `string` | `image.alt` override |
| `caption` | `string` | `caption`, `caption_source: 'custom'` |
| `link` | `LinkLike` | `link`, `link_to: 'custom'` |
| `align` | responsive `left`, `center`, or `right` | `align*` normalized to `start`, `center`, `end` |
| `width` | `ResponsiveValue<SliderValue>` | `width*` |
| `maxWidth` | `ResponsiveValue<SliderValue>` | `space*` |
| `height` | `ResponsiveValue<SliderValue>` | `height*` |
| `objectFit` | responsive `fill`, `cover`, `contain`, or `scale-down` | `object-fit*` |
| `objectPosition` | `ResponsiveValue<string>` | `object-position*` in direct framework mapping; backend export currently emits scalar `object-position` |
| `borderRadius` | `ResponsiveValue<DimensionsValue>` | `image_border_radius*` |
| `opacity` | `number` | `opacity` as size value, normalized to 0..1 when above 1 |

`ImageLike` accepts a URL string or `{ url, id, alt }`.

## Responsive Support

Responsive object syntax is supported for `align`, `width`, `maxWidth`, `height`, `objectFit`, `objectPosition`, `borderRadius`, `zIndex`, and advanced position/sticky offsets.

Preview CSS uses tablet and mobile media rules for alignment, image width, max width, height, object fit, and radius.

## Defaults and Required Props

No TypeScript prop is required. Preview mode returns `null` when `image.url` is missing.

Registry defaults list `image_size: 'full'`, but the direct framework mapper only emits `image_size` when provided. Omitted `align` maps through `left`, normalized to Elementor `start`. Backend export adds `image_size: 'full'` for image widgets when no image size is set. Set `image_size="full"` explicitly for consistent direct JSON.

## Elementor JSON Mapping

Direct framework JSON mode creates:

```json
{
  "elType": "widget",
  "widgetType": "image",
  "settings": {
    "image": { "url": "asset://hero.webp", "alt": "Hero" },
    "image_size": "full",
    "caption": "Product preview",
    "caption_source": "custom",
    "link_to": "custom",
    "link": { "url": "/product" },
    "align": "center"
  }
}
```

`alt` overrides `image.alt`. `maxWidth` maps to Elementor's `space` setting. `borderRadius` maps to `image_border_radius*`, not generic `border_radius`. Raw `settings` merge last and can supply `link_to: 'file'`, lightbox settings, caption typography, image borders, image shadows, CSS filters, hover opacity, hover animation, and other native Image controls.

Shared base fields map advanced widget settings: `positioning.mode` to `_position`, offsets to `_offset_*`, `zIndex` to `_z_index`, and `sticky` to Elementor sticky settings.

## Preview and Render Behavior

Preview mode renders an `img` inside the Elementor image widget wrapper. If `link_to` is `custom`, preview links to `settings.link.url`. If raw settings set `link_to` to `file`, preview links to the image URL and emits Elementor lightbox data attributes unless `open_lightbox` is `'no'`.

Captions render as:

```html
<figure class="wp-caption">
  <img ...>
  <figcaption class="widget-image-caption wp-caption-text">Caption</figcaption>
</figure>
```

Preview resolves `asset://...` URLs using `window.__UP_IMAGES_BASE_URL` when available. Preview CSS covers alignment, width, max width, height, object fit/position, opacity, image radius, image border/shadow/filter from raw settings, hover filter/opacity from raw settings, caption styling, and advanced positioning.

## Parser and Export Notes

Backend React parsing aliases `image` to structure `src` and `alt`, while `link` becomes `href`/`linkTarget`. Backend export for `Image`, `LightboxWrapper`, and `LightboxLink` writes `image`, native `width`, `height`, `image_size`, `caption`, `caption_source`, normalized `align`, `space`, `object-fit`, `image_border_radius`, `object-position`, and optional custom link settings.

The backend widget cleanup preserves native `width` and `height` for Image, converts generic `_border_radius*` to `image_border_radius*`, and normalizes `object_position` to `object-position`. The reverse Elementor parser maps widget type `image` to UpBuilder comp type `Image` and extracts `settings.image.url`, `settings.image.alt`, and `settings.link.url`.

## Caveats and Inconsistencies

- Direct framework JSON does not add `image_size: 'full'` unless `image_size` is supplied; backend export does.
- Direct framework preview returns `null` for missing image URL, while backend export may still emit Elementor's placeholder image through helper paths.
- `objectPosition` uses the hyphenated Elementor key `object-position`; backend cleanup also handles underscore variants.
- Backend JSX export currently emits scalar `object-position`; responsive `objectPosition` should be treated as direct framework mapper support unless backend mapping is updated.
- `opacity` is not responsive in the direct prop type.

## Example

```tsx
import { Image } from '@upbuilder/elementor-framework';

export function ProductImage() {
  return (
    <Image
      image={{ url: 'asset://product.webp', alt: 'Product dashboard' }}
      image_size="full"
      align={{ desktop: 'right', mobile: 'center' }}
      width={{ desktop: '720px', mobile: '100%' }}
      maxWidth="100%"
      height={{ desktop: 460, mobile: 280 }}
      objectFit="cover"
      objectPosition="center center"
      borderRadius={16}
      caption="Dashboard preview"
      link={{ url: '/product', is_external: false }}
    />
  );
}
```
