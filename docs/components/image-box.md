# ImageBox

## Purpose

`ImageBox` maps to Elementor's `image-box` widget. It renders an image with a title, description, optional link, and image/title/description styling.

## Import

```tsx
import { ImageBox } from '@upbuilder/elementor-framework';
import type { ImageBoxProps } from '@upbuilder/elementor-framework';
```

Framework source export: `ImageBox` from `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`.

## Props and fields

`ImageBoxProps = BaseProps & BoxContentStyleProps & { ... }`.

Widget props:

```ts
{
  image?: ImageLike;
  alt?: string;
  title?: string;
  description?: string;
  link?: LinkLike;
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  thumbnailSize?: 'full' | 'large' | 'medium' | 'thumbnail' | 'custom';
  thumbnailCustomDimension?: { width?: number | string; height?: number | string };
  position?: ResponsiveValue<'top' | 'left' | 'right' | 'start' | 'end'>;
  verticalAlign?: ResponsiveValue<'top' | 'middle' | 'bottom'>;
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right' | 'justify'>;
  imageSpace?: ResponsiveValue<SliderValue>;
  titleBottomSpace?: ResponsiveValue<SliderValue>;
  imageWidth?: ResponsiveValue<SliderValue>;
  imageHeight?: ResponsiveValue<SliderValue>;
  imageObjectFit?: ResponsiveValue<'' | 'fill' | 'cover' | 'contain' | 'scale-down'>;
  imageObjectPosition?: ResponsiveValue<string>;
  imageBorderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
  imageBorderWidth?: ResponsiveValue<DimensionsValue>;
  imageBorderColor?: string;
  imageBorderRadius?: ResponsiveValue<SliderValue>;
  imageBoxShadow?: BoxShadowValue;
  cssFilters?: CSSFilterValue;
  cssFiltersHover?: CSSFilterValue;
  imageOpacity?: SliderValue;
  imageOpacityHover?: SliderValue;
  backgroundHoverTransition?: SliderValue;
  hoverAnimation?: string;
}
```

`ImageLike` accepts a URL string or `{ url?: string; id?: number | string; alt?: string }`. `LinkLike` accepts a URL string or Elementor link object.

`BoxContentStyleProps` supplies shared title/description styling:

```ts
{
  titleColor?: string;
  titleHoverColor?: string;
  titleFontSize?: ResponsiveValue<SliderValue>;
  titleFontWeight?: string | number;
  titleFontFamily?: string;
  titleFontStyle?: string;
  titleTextDecoration?: string;
  titleLineHeight?: ResponsiveValue<SliderValue>;
  titleLetterSpacing?: ResponsiveValue<SliderValue>;
  titleTextTransform?: string;
  titleTextShadow?: TextShadowValue;
  titleTextStroke?: TextStrokeValue;
  descriptionColor?: string;
  descriptionFontSize?: ResponsiveValue<SliderValue>;
  descriptionFontWeight?: string | number;
  descriptionFontFamily?: string;
  descriptionFontStyle?: string;
  descriptionTextDecoration?: string;
  descriptionLineHeight?: ResponsiveValue<SliderValue>;
  descriptionLetterSpacing?: ResponsiveValue<SliderValue>;
  descriptionTextTransform?: string;
  descriptionTextShadow?: TextShadowValue;
}
```

Base widget props include `id`, `className`, `settings`, `children`, `role`, `title`, ARIA/data attributes, and shared positioning/sticky/z-index props.

## Responsive support

Responsive mappings:

- `position` -> `position`, `position_tablet`, `position_mobile`
- `verticalAlign` -> `content_vertical_alignment*`
- `align` -> `text_align*`
- `imageSpace` -> `image_space*`
- `titleBottomSpace` -> `title_bottom_space*`
- `imageWidth` -> `image_size*`
- `imageHeight` -> `image_height*`
- `imageObjectFit` -> `image_object_fit*`
- `imageObjectPosition` -> `image_object_position*`
- `imageBorderWidth` -> `image_border_width*`
- `imageBorderRadius` -> `image_border_radius*`
- title and description font size, line height, and letter spacing
- shared widget layout props such as `zIndex`, `positioning`, and `sticky`

Preview CSS uses `@media (max-width: 1024px)` for tablet and `@media (max-width: 767px)` for mobile.

## Defaults and required props

No prop is TypeScript-required, but preview mode returns `null` unless `image` resolves to a URL.

Framework defaults:

- `titleSize`: `h3`.
- `position`: `top`.

Backend builder defaults:

- `title_text`: `styleProps.title`, `element.text`, or empty string.
- `description_text`: empty string when omitted.
- `position`: `top`.

## Elementor JSON/settings mapping

| TSX prop | Elementor setting |
| --- | --- |
| `image` | `image` |
| `alt` | `image.alt` override |
| `thumbnailSize` | `thumbnail_size` |
| `thumbnailCustomDimension` | `thumbnail_custom_dimension` |
| `title` | `title_text` |
| `description` | `description_text` |
| `link` | `link` |
| `titleSize` | `title_size` |
| `position` | `position*` |
| `verticalAlign` | `content_vertical_alignment*` |
| `align` | `text_align*` |
| `imageSpace` | `image_space*` |
| `titleBottomSpace` | `title_bottom_space*` |
| `imageWidth` | `image_size*` |
| `imageHeight` | `image_height*` |
| `imageObjectFit` | `image_object_fit*` |
| `imageObjectPosition` | `image_object_position*` |
| `imageBorderType` | `image_border_border` |
| `imageBorderWidth` | `image_border_width*` |
| `imageBorderColor` | `image_border_color` |
| `imageBorderRadius` | `image_border_radius*` |
| `imageBoxShadow` | `image_box_shadow_box_shadow_type`, `image_box_shadow_box_shadow` |
| `cssFilters` | `css_filters_*` |
| `cssFiltersHover` | `css_filters_hover_*` |
| `imageOpacity` | `image_opacity` |
| `imageOpacityHover` | `image_opacity_hover` |
| `backgroundHoverTransition` | `background_hover_transition` |
| `hoverAnimation` | `hover_animation` |
| `titleColor` | `title_color` |
| `titleHoverColor` | `hover_title_color` |
| `titleHoverTransition` | `hover_title_color_transition_duration` |
| `descriptionColor` | `description_color` |
| title typography props | `title_typography_*` |
| `titleTextShadow` | `title_shadow_*` |
| `titleTextStroke` | `title_stroke_*` |
| description typography props | `description_typography_*` |
| `descriptionTextShadow` | `description_shadow_*` |

Position aliases are normalized:

- `start` -> `left`
- `end` -> `right`
- `left`, `top`, and `right` are passed through

`settings` is merged last, so raw Elementor settings can override normalized props.

Generated widget element:

```json
{
  "elType": "widget",
  "widgetType": "image-box",
  "settings": {}
}
```

## Preview/render behavior

Preview mode:

- Resolves `asset://` image URLs through `window.__UP_IMAGES_BASE_URL` when present.
- Renders nothing if the image URL is missing.
- Renders `.elementor-widget-image-box` with `.elementor-image-box-wrapper`.
- Renders the image in `figure.elementor-image-box-img`.
- Renders linked image and linked title when `link` is present.
- Renders title using `title_size` and description as `.elementor-image-box-description`.
- Applies image size, spacing, border, radius, shadow, CSS filters, hover filters, opacity, hover animation, and text typography through generated CSS.

## Parser/export notes

- `src/index.ts` re-exports `ImageBox` and `ImageBoxProps`.
- React parser maps `ImageBox` to itself for Elementor export.
- Elementor type mapping maps `ImageBox` to widget type `image-box`.
- Backend `element-builder.ts` has a dedicated `case 'ImageBox'`; it also accepts aliases such as `imagePosition`, `contentVerticalAlign`, `textAlign`, `imageWidgetSize`, and `image_size`.
- Backend validator allows the `IMAGE_BOX_SETTINGS` set for `image-box`.
- `settings-to-css.ts` extracts `src`, `alt`, and `href` for `image-box` during Elementor parse/export.

## Caveats and inconsistencies

- `imageBorderRadius` is typed as `ResponsiveValue<SliderValue>`, not `DimensionsValue`, so it maps to a scalar size.
- `imageBorderType: 'none'` does not write `image_border_border`; it suppresses the border setting.
- Preview requires an image URL even though the TypeScript prop is optional.
- Backend builder can resolve image URLs with `assetUrlPrefix`; framework preview only rewrites `asset://` when a browser global is available.
- Widget registry and abstraction both default `position` to `top`.

## Example

```tsx
import { ImageBox } from '@upbuilder/elementor-framework';

export function ServiceImageBox() {
  return (
    <ImageBox
      image={{ url: '/assets/onboarding.jpg', alt: 'Customer onboarding dashboard' }}
      title="Guided onboarding"
      description="Launch a structured setup flow for every new account."
      link="/features/onboarding"
      thumbnailSize="large"
      position={{ desktop: 'left', mobile: 'top' }}
      align={{ desktop: 'start', mobile: 'center' }}
      imageWidth={{ desktop: '38%', mobile: '100%' }}
      imageSpace={24}
      imageBorderRadius={8}
      imageObjectFit="cover"
      titleFontSize={{ desktop: 24, mobile: 20 }}
      titleFontWeight={700}
      titleColor="#111827"
      descriptionColor="#4b5563"
    />
  );
}
```
