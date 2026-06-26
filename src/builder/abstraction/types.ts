/**
 * Type definitions for the Elementor JSX Abstraction Layer
 */

import type { ReactNode } from 'react';

// =============================================================================
// BASE TYPES
// =============================================================================

export type ResponsiveValue<T> = T | { desktop?: T; tablet?: T; mobile?: T }

export type SliderValue = number | string | { size?: number | string; unit?: string }

export type GridTrackValue = number | string

export type DimensionsValue = number | {
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
  unit?: string
}

export type GapsValue = { row?: number | string; column?: number | string; unit?: string }

export type LinkLike = string | { url: string; is_external?: boolean; nofollow?: boolean }

export type IconLike = string | { value?: string; library?: string }

export type ImageLike = string | { url?: string; id?: number | string; alt?: string }

export type IconListItem = {
  text: string
  icon?: IconLike
  selected_icon?: IconLike
  link?: LinkLike
  _id?: string
}

export type PositionAxisValue = {
  side?: 'start' | 'end'
  offset?: ResponsiveValue<SliderValue>
}

export type LayoutPositionValue = {
  mode: 'absolute' | 'fixed'
  horizontal?: PositionAxisValue
  vertical?: PositionAxisValue
  zIndex?: ResponsiveValue<number>
}

export type StickyPositionValue = {
  side?: 'top' | 'bottom'
  devices?: Array<'desktop' | 'tablet' | 'mobile'>
  offset?: ResponsiveValue<SliderValue>
  effectsOffset?: ResponsiveValue<SliderValue>
  anchorLinkOffset?: ResponsiveValue<SliderValue>
  parent?: boolean
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type ElementorSettingsInput = Record<string, JsonValue>

// =============================================================================
// BASE PROPS
// =============================================================================

/**
 * Universal "Advanced" tab controls that Elementor exposes on every widget
 * and container — backgrounds, padding/margin, border, border-radius, shadow,
 * flex-self, hide-on-breakpoint, etc. Mapping to Elementor's universal `_*`
 * setting keys (defined in `Widget_Common_Base::register_controls`).
 *
 * Use this on a widget when you would otherwise wrap it in a Flexbox just to
 * give it a background/padding/border (e.g. eyebrow/chip/pill, callout
 * heading, badged text). The result: one element, one DOM node, same
 * Elementor JSON output as a properly-configured Advanced tab.
 *
 * Example — eyebrow chip on a Heading without a wrapper Flexbox:
 *   <TextEditor
 *     content="<p>Live ecommerce intelligence</p>"
 *     color="#126bff"
 *     fontSize={14}
 *     advanced={{
 *       backgroundColor: "#e7f0ff",
 *       padding: { top: 8, right: 14, bottom: 8, left: 14 },
 *       borderRadius: 999,
 *       alignSelf: "flex-start",
 *     }}
 *   />
 */
export type AdvancedProps = {
  // Background
  backgroundColor?: string
  backgroundImage?: BackgroundImageValue
  backgroundGradient?: GradientValue
  // Spacing (responsive)
  padding?: ResponsiveValue<DimensionsValue>
  margin?: ResponsiveValue<DimensionsValue>
  // Border + radius (responsive radius)
  borderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed'
  borderWidth?: ResponsiveValue<DimensionsValue>
  borderColor?: string
  borderRadius?: ResponsiveValue<DimensionsValue>
  // Shadow
  boxShadow?: BoxShadowValue
  // Flex-item alignment in parent (responsive)
  alignSelf?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline' | 'normal'>
  flexGrow?: ResponsiveValue<number>
  flexShrink?: ResponsiveValue<number>
  flexOrder?: ResponsiveValue<number>
  // Stacking
  zIndex?: ResponsiveValue<number>
  // Visibility per breakpoint
  hideOnDesktop?: boolean
  hideOnTablet?: boolean
  hideOnMobile?: boolean
}

export type BaseProps = {
  id?: string
  className?: string
  settings?: ElementorSettingsInput
  children?: ReactNode
  role?: string
  title?: string
  positioning?: LayoutPositionValue
  zIndex?: ResponsiveValue<number>
  sticky?: StickyPositionValue
  /**
   * Universal Elementor Advanced tab controls — see {@link AdvancedProps}.
   * Lets a widget render with bg/padding/border/etc. without a wrapper
   * Flexbox. Maps to `_background_*`, `_padding`, `_margin`, `_border_*`,
   * `_border_radius`, `_box_shadow_*`, `_flex_align_self`, `_z_index`,
   * `hide_*` setting keys.
   */
  advanced?: AdvancedProps
  [key: `data-${string}`]: string | number | boolean | undefined
  [key: `aria-${string}`]: string | number | boolean | undefined
}

// =============================================================================
// VALUE TYPES
// =============================================================================

export type GradientValue = {
  type?: 'linear' | 'radial'
  angle?: number
  colorA?: string
  colorB?: string
  locationA?: number
  locationB?: number
  position?: 'center center' | 'center left' | 'center right' | 'top center' | 'top left' | 'top right' | 'bottom center' | 'bottom left' | 'bottom right'
}

export type BoxShadowValue = {
  color?: string
  horizontal?: number
  vertical?: number
  blur?: number
  spread?: number
  position?: 'outline' | 'inset'
}

export type TextShadowValue = {
  color?: string
  horizontal?: number
  vertical?: number
  blur?: number
}

export type TextStrokeValue = {
  width?: SliderValue
  color?: string
}

export type CSSFilterValue = {
  blur?: SliderValue
  brightness?: number
  contrast?: number
  saturate?: number
  hue?: number
  grayscale?: number
}

export type BackgroundImageValue = {
  url: string
  position?: 'center center' | 'center left' | 'center right' | 'top center' | 'top left' | 'top right' | 'bottom center' | 'bottom left' | 'bottom right'
  size?: 'auto' | 'cover' | 'contain'
  repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
}

// =============================================================================
// COMPONENT PROPS - CONTAINERS
// =============================================================================

export type PageProps = {
  title?: string
  children?: ReactNode
}

export type GridProps = BaseProps & {
  columns: ResponsiveValue<GridTrackValue>
  rows: ResponsiveValue<GridTrackValue>
  gap?: ResponsiveValue<SliderValue>
  rowGap?: ResponsiveValue<SliderValue>
  columnGap?: ResponsiveValue<SliderValue>
  alignItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>
  alignContent?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'>
  justifyItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>
  justifyContent?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>
  padding?: ResponsiveValue<DimensionsValue>
  margin?: ResponsiveValue<DimensionsValue>
  backgroundColor?: string
  borderRadius?: DimensionsValue
  minHeight?: ResponsiveValue<SliderValue>
  width?: ResponsiveValue<SliderValue>
  contentWidth?: 'full' | 'boxed'
  boxedWidth?: ResponsiveValue<SliderValue>
  autoFlow?: ResponsiveValue<'row' | 'column'>
}

export type FlexboxProps = BaseProps & {
  direction?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>
  justify?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>
  alignItems?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch'>
  alignContent?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'>
  gap?: ResponsiveValue<SliderValue>
  wrap?: ResponsiveValue<'nowrap' | 'wrap'>
  padding?: ResponsiveValue<DimensionsValue>
  margin?: ResponsiveValue<DimensionsValue>
  backgroundColor?: string
  backgroundGradient?: GradientValue
  backgroundImage?: BackgroundImageValue
  /**
   * Color or gradient applied as a `::before` overlay on top of
   * `backgroundImage` / `backgroundColor`. Always pair with
   * `backgroundOverlayOpacity` — Elementor's PHP renderer multiplies the
   * overlay color by `--overlay-opacity` (default 0.5), so a string color
   * like `"rgba(0,21,56,0.60)"` alone produces different results in React
   * preview vs PHP unless opacity is explicit.
   */
  backgroundOverlay?: string | GradientValue
  /**
   * REQUIRED when `backgroundOverlay` is set. Number between 0 and 1
   * (1 = full overlay color visible, 0 = invisible). Maps to Elementor's
   * `background_overlay_opacity` setting which the PHP renderer applies as
   * `--overlay-opacity`. Pick the effective intensity you want — this is
   * multiplied with the alpha of the overlay color, so
   * `rgba(...,0.60)` + `backgroundOverlayOpacity={0.5}` = 30% effective.
   * Set to 1 to use the rgba alpha as the literal effective opacity.
   */
  backgroundOverlayOpacity?: number
  borderRadius?: DimensionsValue
  borderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed'
  borderWidth?: DimensionsValue
  borderColor?: string
  boxShadow?: BoxShadowValue
  minHeight?: ResponsiveValue<SliderValue>
  width?: ResponsiveValue<SliderValue>
  contentWidth?: 'full' | 'boxed'
  boxedWidth?: ResponsiveValue<SliderValue>
  flexGrow?: ResponsiveValue<number>
  flexShrink?: ResponsiveValue<number>
  /**
   * Aligns THIS container along the cross-axis of its flex parent — overrides
   * the parent's `alignItems` for this child only. Use `flex-start` to make a
   * tag/eyebrow/badge wrapper shrink to its content inside a column-direction
   * parent (otherwise the parent's default `align-items: stretch` makes the
   * child fill the full cross-axis width).
   * Maps to Elementor's container `_flex_align_self` setting.
   */
  alignSelf?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline' | 'normal'>
  overflow?: 'visible' | 'hidden'
}

export type SectionProps = FlexboxProps & {
  name?: string
}

// =============================================================================
// COMPONENT PROPS - WIDGETS
// =============================================================================

export type HeadingProps = BaseProps & {
  title?: string
  as?: boolean
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'default' | 'small' | 'medium' | 'large' | 'xl' | 'xxl'
  align?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>
  color?: string
  fontSize?: ResponsiveValue<SliderValue>
  fontWeight?: string | number
  fontFamily?: string
  fontStyle?: 'normal' | 'italic' | 'oblique'
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through'
  lineHeight?: ResponsiveValue<SliderValue>
  letterSpacing?: ResponsiveValue<SliderValue>
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textShadow?: TextShadowValue
  link?: LinkLike
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'difference' | 'exclusion'
}

export type TextEditorProps = BaseProps & {
  content?: string
  align?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>
  color?: string
  fontSize?: ResponsiveValue<SliderValue>
  fontFamily?: string
  lineHeight?: ResponsiveValue<SliderValue>
  letterSpacing?: ResponsiveValue<SliderValue>
  paragraphSpacing?: ResponsiveValue<SliderValue>
  columns?: ResponsiveValue<number>
  columnGap?: ResponsiveValue<SliderValue>
}

export type ButtonProps = BaseProps & {
  text?: string
  link?: LinkLike
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: ResponsiveValue<'left' | 'center' | 'right' | 'stretch'>
  icon?: IconLike
  iconPosition?: 'left' | 'right'
  iconSpacing?: SliderValue
  textColor?: string
  backgroundColor?: string
  hoverTextColor?: string
  hoverBackgroundColor?: string
  borderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed'
  borderWidth?: ResponsiveValue<SliderValue>
  borderColor?: string
  borderRadius?: ResponsiveValue<DimensionsValue>
  padding?: ResponsiveValue<DimensionsValue>
  fontSize?: ResponsiveValue<SliderValue>
  fontWeight?: string | number
  lineHeight?: ResponsiveValue<SliderValue>
  letterSpacing?: ResponsiveValue<SliderValue>
  contentAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between'>
}

export type IconProps = BaseProps & {
  icon?: IconLike
  view?: 'default' | 'stacked' | 'framed'
  shape?: 'circle' | 'square' | 'rounded'
  align?: ResponsiveValue<'left' | 'center' | 'right'>
  color?: string
  backgroundColor?: string
  hoverColor?: string
  hoverBackgroundColor?: string
  size?: ResponsiveValue<SliderValue>
  padding?: SliderValue
  borderWidth?: SliderValue
  borderRadius?: ResponsiveValue<DimensionsValue>
  borderColor?: string
  link?: LinkLike
  rotate?: ResponsiveValue<number>
}

export type BoxContentStyleProps = {
  titleColor?: string
  titleHoverColor?: string
  titleHoverTransition?: SliderValue
  titleFontSize?: ResponsiveValue<SliderValue>
  titleFontWeight?: string | number
  titleFontFamily?: string
  titleFontStyle?: 'normal' | 'italic' | 'oblique'
  titleTextDecoration?: 'none' | 'underline' | 'overline' | 'line-through'
  titleLineHeight?: ResponsiveValue<SliderValue>
  titleLetterSpacing?: ResponsiveValue<SliderValue>
  titleTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  titleTextShadow?: TextShadowValue
  titleTextStroke?: TextStrokeValue
  descriptionColor?: string
  descriptionFontSize?: ResponsiveValue<SliderValue>
  descriptionFontWeight?: string | number
  descriptionFontFamily?: string
  descriptionFontStyle?: 'normal' | 'italic' | 'oblique'
  descriptionTextDecoration?: 'none' | 'underline' | 'overline' | 'line-through'
  descriptionLineHeight?: ResponsiveValue<SliderValue>
  descriptionLetterSpacing?: ResponsiveValue<SliderValue>
  descriptionTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  descriptionTextShadow?: TextShadowValue
}

export type IconBoxProps = BaseProps & BoxContentStyleProps & {
  icon?: IconLike
  selected_icon?: IconLike
  title?: string
  description?: string
  link?: LinkLike
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  view?: 'default' | 'stacked' | 'framed'
  shape?: 'circle' | 'square' | 'rounded'
  position?: ResponsiveValue<'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'block-start' | 'block-end' | 'inline-start' | 'inline-end'>
  verticalAlign?: ResponsiveValue<'top' | 'middle' | 'bottom'>
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right' | 'justify'>
  iconSpace?: ResponsiveValue<SliderValue>
  titleBottomSpace?: ResponsiveValue<SliderValue>
  primaryColor?: string
  secondaryColor?: string
  hoverPrimaryColor?: string
  hoverSecondaryColor?: string
  hoverIconTransition?: SliderValue
  hoverAnimation?: string
  iconSize?: ResponsiveValue<SliderValue>
  iconPadding?: ResponsiveValue<SliderValue>
  rotate?: ResponsiveValue<number>
  borderWidth?: ResponsiveValue<DimensionsValue>
  borderRadius?: ResponsiveValue<DimensionsValue>
}

export type IconListProps = BaseProps & {
  items?: IconListItem[]
  view?: 'traditional' | 'inline'
  linkClick?: 'full_width' | 'inline'
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right'>
  spaceBetween?: ResponsiveValue<SliderValue>
  divider?: boolean
  dividerStyle?: 'solid' | 'double' | 'dotted' | 'dashed'
  dividerWeight?: SliderValue
  dividerWidth?: SliderValue
  dividerHeight?: SliderValue
  dividerColor?: string
  iconColor?: string
  iconHoverColor?: string
  iconHoverTransition?: SliderValue
  iconSize?: ResponsiveValue<SliderValue>
  iconGap?: SliderValue
  iconSelfAlign?: ResponsiveValue<'left' | 'center' | 'right'>
  iconVerticalAlign?: ResponsiveValue<'flex-start' | 'center' | 'flex-end'>
  iconVerticalOffset?: ResponsiveValue<SliderValue>
  textColor?: string
  textHoverColor?: string
  textHoverTransition?: SliderValue
  fontSize?: ResponsiveValue<SliderValue>
  fontWeight?: string | number
  fontFamily?: string
  fontStyle?: 'normal' | 'italic' | 'oblique'
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through'
  lineHeight?: ResponsiveValue<SliderValue>
  letterSpacing?: ResponsiveValue<SliderValue>
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textShadow?: TextShadowValue
}

export type ImageProps = BaseProps & {
  src?: boolean
  image?: ImageLike
  image_size?: 'full' | 'large' | 'medium' | 'thumbnail'
  alt?: string
  caption?: string
  link?: LinkLike
  align?: ResponsiveValue<'left' | 'center' | 'right'>
  width?: ResponsiveValue<SliderValue>
  maxWidth?: ResponsiveValue<SliderValue>
  height?: ResponsiveValue<SliderValue>
  objectFit?: ResponsiveValue<'fill' | 'cover' | 'contain' | 'scale-down'>
  objectPosition?: ResponsiveValue<string>
  borderRadius?: ResponsiveValue<DimensionsValue>
  opacity?: number
}

export type ImageBoxProps = BaseProps & BoxContentStyleProps & {
  image?: ImageLike
  alt?: string
  title?: string
  description?: string
  link?: LinkLike
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  thumbnailSize?: 'full' | 'large' | 'medium' | 'thumbnail' | 'custom'
  thumbnailCustomDimension?: { width?: number | string; height?: number | string }
  position?: ResponsiveValue<'top' | 'left' | 'right' | 'start' | 'end'>
  verticalAlign?: ResponsiveValue<'top' | 'middle' | 'bottom'>
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right' | 'justify'>
  imageSpace?: ResponsiveValue<SliderValue>
  titleBottomSpace?: ResponsiveValue<SliderValue>
  imageWidth?: ResponsiveValue<SliderValue>
  imageHeight?: ResponsiveValue<SliderValue>
  imageObjectFit?: ResponsiveValue<'' | 'fill' | 'cover' | 'contain' | 'scale-down'>
  imageObjectPosition?: ResponsiveValue<string>
  imageBorderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed'
  imageBorderWidth?: ResponsiveValue<DimensionsValue>
  imageBorderColor?: string
  imageBorderRadius?: ResponsiveValue<SliderValue>
  imageBoxShadow?: BoxShadowValue
  cssFilters?: CSSFilterValue
  cssFiltersHover?: CSSFilterValue
  imageOpacity?: SliderValue
  imageOpacityHover?: SliderValue
  backgroundHoverTransition?: SliderValue
  hoverAnimation?: string
}

export type AccordionItem = {
  title: string
  content: string
  _id?: string
}

export type AccordionProps = BaseProps & {
  items?: AccordionItem[]
  defaultActiveIndex?: number | null
  icon?: IconLike
  activeIcon?: IconLike
  titleHtmlTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  faqSchema?: boolean
  iconAlign?: 'left' | 'right'
  borderWidth?: SliderValue
  borderColor?: string
  titleBackground?: string
  titleColor?: string
  titleActiveColor?: string
  titlePadding?: ResponsiveValue<DimensionsValue>
  titleFontSize?: ResponsiveValue<SliderValue>
  titleFontWeight?: string | number
  titleFontFamily?: string
  titleLineHeight?: ResponsiveValue<SliderValue>
  titleLetterSpacing?: ResponsiveValue<SliderValue>
  titleTextShadow?: TextShadowValue
  titleTextStroke?: TextStrokeValue
  iconColor?: string
  iconActiveColor?: string
  iconSpace?: ResponsiveValue<SliderValue>
  contentBackgroundColor?: string
  contentColor?: string
  contentPadding?: ResponsiveValue<DimensionsValue>
  contentFontSize?: ResponsiveValue<SliderValue>
  contentFontWeight?: string | number
  contentFontFamily?: string
  contentLineHeight?: ResponsiveValue<SliderValue>
  contentLetterSpacing?: ResponsiveValue<SliderValue>
  contentTextShadow?: TextShadowValue
}

export type ToggleProps = AccordionProps & {
  spaceBetween?: ResponsiveValue<SliderValue>
  boxShadow?: BoxShadowValue
}

export type TabsItem = {
  title: string
  content: string
  _id?: string
}

export type TabsProps = BaseProps & {
  items?: TabsItem[]
  defaultActiveIndex?: number | null
  type?: 'horizontal' | 'vertical'
  align?: '' | 'center' | 'end' | 'stretch'
  navigationWidth?: SliderValue
  borderWidth?: SliderValue
  borderColor?: string
  backgroundColor?: string
  tabColor?: string
  tabActiveColor?: string
  titleAlign?: 'start' | 'center' | 'end' | 'left' | 'right'
  tabFontSize?: ResponsiveValue<SliderValue>
  tabFontWeight?: string | number
  tabFontFamily?: string
  tabLineHeight?: ResponsiveValue<SliderValue>
  tabLetterSpacing?: ResponsiveValue<SliderValue>
  tabTextShadow?: TextShadowValue
  tabTextStroke?: TextStrokeValue
  contentColor?: string
  contentFontSize?: ResponsiveValue<SliderValue>
  contentFontWeight?: string | number
  contentFontFamily?: string
  contentLineHeight?: ResponsiveValue<SliderValue>
  contentLetterSpacing?: ResponsiveValue<SliderValue>
  contentTextShadow?: TextShadowValue
}

export type GalleryImage = string | {
  id?: number | string
  url: string
  alt?: string
  caption?: string
}

export type ImageGalleryProps = BaseProps & {
  images?: GalleryImage[]
  thumbnailSize?: 'thumbnail' | 'medium' | 'large' | 'full'
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  caption?: 'attachment' | 'none'
  link?: 'file' | 'attachment' | 'none'
  openLightbox?: 'default' | 'yes' | 'no'
  randomOrder?: boolean
  imageSpacing?: '' | 'custom'
  imageSpacingCustom?: SliderValue
  imageBorderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed'
  imageBorderWidth?: ResponsiveValue<DimensionsValue>
  imageBorderColor?: string
  imageBorderRadius?: ResponsiveValue<DimensionsValue>
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right' | 'justify'>
  textColor?: string
  captionSpace?: ResponsiveValue<SliderValue>
  captionFontSize?: ResponsiveValue<SliderValue>
  captionFontWeight?: string | number
  captionFontFamily?: string
  captionLineHeight?: ResponsiveValue<SliderValue>
  captionLetterSpacing?: ResponsiveValue<SliderValue>
  captionTextShadow?: TextShadowValue
}

export type CounterProps = BaseProps & {
  startingNumber?: number
  endingNumber?: number
  start?: number
  end?: number
  duration?: number
  prefix?: string
  suffix?: string
  thousandSeparator?: boolean
  thousandSeparatorChar?: string
  title?: string
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  titlePosition?: ResponsiveValue<'before' | 'after' | 'start' | 'end'>
  titleHorizontalAlignment?: ResponsiveValue<'start' | 'center' | 'end'>
  titleVerticalAlignment?: ResponsiveValue<'start' | 'center' | 'end'>
  titleGap?: ResponsiveValue<SliderValue>
  numberPosition?: ResponsiveValue<'start' | 'center' | 'end'>
  numberAlignment?: ResponsiveValue<'start' | 'center' | 'end'>
  numberGap?: ResponsiveValue<SliderValue>
  numberColor?: string
  titleColor?: string
  numberFontSize?: ResponsiveValue<SliderValue>
  numberFontWeight?: string | number
  numberFontFamily?: string
  numberLineHeight?: ResponsiveValue<SliderValue>
  numberLetterSpacing?: ResponsiveValue<SliderValue>
  numberTextShadow?: TextShadowValue
  numberTextStroke?: TextStrokeValue
  titleFontSize?: ResponsiveValue<SliderValue>
  titleFontWeight?: string | number
  titleFontFamily?: string
  titleLineHeight?: ResponsiveValue<SliderValue>
  titleLetterSpacing?: ResponsiveValue<SliderValue>
  titleTextShadow?: TextShadowValue
  titleTextStroke?: TextStrokeValue
}

export type ProgressProps = BaseProps & {
  title?: string
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  titleDisplay?: boolean
  percent?: number | { size?: number | string; unit?: '%' }
  progressType?: '' | 'default' | 'info' | 'success' | 'warning' | 'danger'
  displayPercentage?: boolean
  innerText?: string
  titleColor?: string
  titleFontSize?: ResponsiveValue<SliderValue>
  titleFontWeight?: string | number
  titleFontFamily?: string
  titleLineHeight?: ResponsiveValue<SliderValue>
  titleLetterSpacing?: ResponsiveValue<SliderValue>
  titleTextShadow?: TextShadowValue
  barColor?: string
  barBgColor?: string
  barHeight?: ResponsiveValue<SliderValue>
  barBorderRadius?: ResponsiveValue<DimensionsValue>
  barInlineColor?: string
  innerTextFontSize?: ResponsiveValue<SliderValue>
  innerTextFontWeight?: string | number
  innerTextFontFamily?: string
  innerTextLineHeight?: ResponsiveValue<SliderValue>
  innerTextLetterSpacing?: ResponsiveValue<SliderValue>
  innerTextShadow?: TextShadowValue
}

export type CarouselImage = string | {
  id?: number | string
  url: string
  alt?: string
  title?: string
  caption?: string
  description?: string
}

export type ImageCarouselProps = BaseProps & {
  images?: CarouselImage[]
  carousel?: CarouselImage[]
  carouselName?: string
  thumbnailSize?: 'thumbnail' | 'medium' | 'large' | 'full' | 'custom'
  thumbnailCustomDimension?: { width?: number | string; height?: number | string }
  slidesToShow?: ResponsiveValue<number | ''>
  slidesToScroll?: ResponsiveValue<number | ''>
  imageStretch?: boolean
  navigation?: 'both' | 'arrows' | 'dots' | 'none'
  previousIcon?: IconLike
  nextIcon?: IconLike
  linkTo?: 'none' | 'file' | 'custom'
  link?: LinkLike
  openLightbox?: 'default' | 'yes' | 'no'
  captionType?: '' | 'title' | 'caption' | 'description'
  lazyload?: boolean
  autoplay?: boolean
  pauseOnHover?: boolean
  pauseOnInteraction?: boolean
  autoplaySpeed?: number
  infinite?: boolean
  speed?: number
  direction?: 'ltr' | 'rtl'
  effect?: 'slide' | 'fade'
  arrowsPosition?: 'inside' | 'outside'
  arrowsSize?: ResponsiveValue<SliderValue>
  arrowsColor?: string
  dotsPosition?: 'inside' | 'outside'
  dotsGap?: ResponsiveValue<SliderValue>
  dotsSize?: ResponsiveValue<SliderValue>
  dotsInactiveColor?: string
  dotsColor?: string
  galleryVerticalAlign?: ResponsiveValue<'flex-start' | 'center' | 'flex-end'>
  imageSpacing?: ResponsiveValue<SliderValue>
  imageBorderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed'
  imageBorderWidth?: ResponsiveValue<DimensionsValue>
  imageBorderColor?: string
  imageBorderRadius?: ResponsiveValue<DimensionsValue>
  captionAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify' | 'start' | 'end'>
  captionColor?: string
  captionSpace?: ResponsiveValue<SliderValue>
  captionFontSize?: ResponsiveValue<SliderValue>
  captionFontWeight?: string | number
  captionFontFamily?: string
  captionLineHeight?: ResponsiveValue<SliderValue>
  captionLetterSpacing?: ResponsiveValue<SliderValue>
  captionTextShadow?: TextShadowValue
}

export type NavMenuItem = {
  text: string
  url?: string
  link?: LinkLike
  children?: NavMenuItem[]
  _id?: string
}

export type NavMenuProps = BaseProps & {
  menu?: string
  menuName?: string
  items?: NavMenuItem[]
  layout?: 'horizontal' | 'vertical' | 'dropdown'
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'justify'>
  pointer?: 'none' | 'underline' | 'overline' | 'double-line' | 'framed' | 'background' | 'text'
  pointerAnimation?: string
  submenuIcon?: IconLike
  dropdown?: 'mobile' | 'tablet' | 'none'
  fullWidth?: boolean
  textAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right'>
  toggle?: 'burger' | 'none'
  toggleIcon?: IconLike
  toggleActiveIcon?: IconLike
  toggleAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'left' | 'right'>
  textColor?: string
  textColorHover?: string
  textColorActive?: string
  pointerColor?: string
  pointerColorActive?: string
  menuItemPaddingH?: ResponsiveValue<SliderValue>
  menuItemPaddingV?: ResponsiveValue<SliderValue>
  menuSpaceBetween?: ResponsiveValue<SliderValue>
  dropdownBackgroundColor?: string
  dropdownTextColor?: string
  dropdownTextHoverColor?: string
  dropdownTopDistance?: ResponsiveValue<SliderValue>
  toggleColor?: string
  toggleBackgroundColor?: string
  toggleSize?: ResponsiveValue<SliderValue>
  fontSize?: ResponsiveValue<SliderValue>
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: ResponsiveValue<SliderValue>
  letterSpacing?: ResponsiveValue<SliderValue>
}

// =============================================================================
// COMPOSITE NAVBAR
// =============================================================================
// <Navbar> is a higher-level helper that compiles to Section + Flexbox + Logo
// + NavMenu (Pro) or fallback Buttons + CTA at export time. The expansion
// happens server-side in `lowerNavbarElements()`. This React component only
// powers the live preview.

export type NavbarLogoLike = {
  src: string
  alt?: string
  href?: string
  width?: SliderValue
  height?: SliderValue
}

export type NavbarFallbackLink = {
  text: string
  href: string
  children?: Array<{ text: string; href: string }>
}

export type NavbarCtaLike = {
  text: string
  href: string
  variant?: 'primary' | 'secondary' | 'outline'
  background?: string
  color?: string
  hoverBackground?: string
  hoverColor?: string
  borderRadius?: SliderValue
  borderWidth?: number
  borderColor?: string
}

export type NavbarProps = BaseProps & {
  /** Brand logo. Renders as a linked image at the start of the bar. */
  logo?: NavbarLogoLike
  /** WP menu slug for the native nav-menu render (Pro export). */
  menu?: string
  /** Display name for the WP menu (for AI / docs). */
  menuName?: string
  /**
   * Preview-only fallback link list. Also used by the no-Pro export path,
   * which compiles them into individual Button widgets.
   */
  fallbackLinks?: NavbarFallbackLink[]
  /** Trailing CTA button. */
  cta?: NavbarCtaLike

  /** Layout variant. Default 'logo-left'. */
  layout?: 'logo-left' | 'logo-center' | 'split'
  /** Container sticky behavior. Default 'top'. */
  sticky?: 'top' | 'none'
  /** Below this breakpoint, the menu collapses into a hamburger. */
  mobileBreakpoint?: 'mobile' | 'tablet' | 'none'
  /** Gap between logo / menu / cta. */
  innerGap?: SliderValue

  // Menu styling (apply to NavMenu's text/state colors)
  menuColor?: string
  menuHoverColor?: string
  menuActiveColor?: string
  menuFontSize?: ResponsiveValue<SliderValue>
  menuFontWeight?: string | number
  menuGap?: ResponsiveValue<SliderValue>
  menuItemPaddingH?: ResponsiveValue<SliderValue>
  menuItemPaddingV?: ResponsiveValue<SliderValue>

  // Pointer (active-link indicator)
  pointer?: 'none' | 'underline' | 'overline' | 'double-line' | 'framed' | 'background' | 'text'
  pointerColor?: string

  // Dropdown (open-submenu / mobile-menu) styling
  dropdownBackground?: string
  dropdownColor?: string
  dropdownTextHoverColor?: string
  submenuIcon?: IconLike

  // Hamburger
  hamburgerColor?: string
  hamburgerSize?: ResponsiveValue<SliderValue>

  // Pass-through to outer Section
  backgroundColor?: string
  padding?: ResponsiveValue<DimensionsValue>
  borderBottomWidth?: number
  borderBottomColor?: string
  zIndex?: number
}

// =============================================================================
// HTML EMBED — escape hatch for raw HTML / inline SVG / iframes
// =============================================================================
// Compiles to Elementor's `html` widget (Widget_Html), whose render() is
// `print_unescaped_setting('html')` — the markup is dumped to the page exactly
// as-is. Use for designs that have no Elementor primitive: SVG `<textPath>`
// (text wrapping a curve), custom `<svg>` shapes, third-party `<iframe>`
// embeds, raw script blocks, or any visual that the existing widgets can't
// reproduce.
//
// Preview renders via React's `dangerouslySetInnerHTML`. The `html` string is
// already trusted code authored by the AI — there is no XSS path because
// nothing user-supplied flows in here.

export type HtmlEmbedProps = BaseProps & {
  /** Raw HTML / SVG / iframe markup. Rendered exactly as written. */
  html: string
}

export type ElementorFormField = {
  _id?: string
  custom_id?: string
  type?: 'text' | 'email' | 'textarea' | 'url' | 'tel' | 'radio' | 'select' | 'checkbox' | 'acceptance' | 'number' | 'date' | 'time' | 'upload' | 'password' | 'html' | 'hidden' | 'step'
  field_type?: string
  label?: string
  field_label?: string
  placeholder?: string
  required?: boolean
  options?: string | string[]
  field_options?: string
  defaultValue?: string
  field_value?: string
  width?: ResponsiveValue<string>
  rows?: number
  css_classes?: string
  field_html?: string
  allow_multiple?: boolean
  inline_list?: boolean
  select_size?: number
  min?: number
  max?: number
  previous_button?: string
  next_button?: string
  selected_icon?: IconLike
}

export type ElementorFormProps = BaseProps & {
  formName?: string
  fields?: ElementorFormField[]
  formFields?: ElementorFormField[]
  inputSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabels?: boolean
  markRequired?: boolean
  labelPosition?: 'above' | 'inline'
  formValidation?: 'browser' | 'custom'
  buttonText?: string
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  buttonWidth?: ResponsiveValue<SliderValue>
  buttonAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>
  buttonContentAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between' | 'space-around'>
  buttonIcon?: IconLike
  buttonIconAlign?: 'left' | 'right'
  buttonIconIndent?: SliderValue
  submitActions?: string[]
  formId?: string
  buttonCssId?: string

  stepType?: 'none' | 'text' | 'icon' | 'number' | 'progress_bar' | 'number_text' | 'icon_text'
  stepIconShape?: 'circle' | 'square' | 'rounded' | 'none'
  stepNextLabel?: string
  stepPreviousLabel?: string

  columnGap?: ResponsiveValue<SliderValue>
  rowGap?: ResponsiveValue<SliderValue>
  labelColor?: string
  labelSpacing?: ResponsiveValue<SliderValue>
  markRequiredColor?: string
  fieldTextColor?: string
  fieldBackgroundColor?: string
  fieldBorderColor?: string
  fieldFocusColor?: string
  fieldBorderWidth?: DimensionsValue
  fieldBorderRadius?: ResponsiveValue<DimensionsValue>
  buttonTextColor?: string
  buttonBackgroundColor?: string
  buttonBorderColor?: string
  buttonBorderWidth?: DimensionsValue
  buttonBorderRadius?: DimensionsValue
  buttonTextPadding?: DimensionsValue
  buttonHoverTextColor?: string
  buttonHoverBackgroundColor?: string
  buttonHoverBorderColor?: string
  buttonHoverAnimation?: string
  buttonHoverTransitionDuration?: SliderValue

  previousButtonTextColor?: string
  previousButtonBackgroundColor?: string
  previousButtonBorderColor?: string
  previousButtonHoverTextColor?: string
  previousButtonHoverBackgroundColor?: string
  previousButtonHoverBorderColor?: string

  stepsTypography?: {
    fontSize?: ResponsiveValue<SliderValue>
    fontWeight?: string | number
    fontFamily?: string
  }
  stepsGap?: ResponsiveValue<SliderValue>
  stepsPadding?: ResponsiveValue<SliderValue>
  stepsIconSize?: ResponsiveValue<SliderValue>
  stepInactivePrimaryColor?: string
  stepInactiveSecondaryColor?: string
  stepActivePrimaryColor?: string
  stepActiveSecondaryColor?: string
  stepCompletedPrimaryColor?: string
  stepCompletedSecondaryColor?: string
  stepDividerWidth?: ResponsiveValue<SliderValue>
  stepDividerGap?: ResponsiveValue<SliderValue>

  stepProgressBarColor?: string
  stepProgressBarBackgroundColor?: string
  stepProgressBarHeight?: ResponsiveValue<SliderValue>
  stepProgressBarBorderRadius?: SliderValue

  successMessageColor?: string
  errorMessageColor?: string
  inlineMessageColor?: string

  labelFontSize?: ResponsiveValue<SliderValue>
  labelFontWeight?: string | number
  labelFontFamily?: string
  fieldFontSize?: ResponsiveValue<SliderValue>
  fieldFontWeight?: string | number
  fieldFontFamily?: string
  buttonFontSize?: ResponsiveValue<SliderValue>
  buttonFontWeight?: string | number
  buttonFontFamily?: string
}

export type SlideItem = {
  _id?: string
  title?: string
  heading?: string
  description?: string
  buttonText?: string
  button_text?: string
  link?: LinkLike
  linkClick?: 'slide' | 'button'
  backgroundColor?: string
  backgroundImage?: ImageLike
  backgroundSize?: 'cover' | 'contain' | 'auto'
  backgroundKenBurns?: boolean
  zoomDirection?: 'in' | 'out'
  backgroundOverlay?: boolean
  backgroundOverlayColor?: string
  horizontalPosition?: 'left' | 'center' | 'right'
  verticalPosition?: 'top' | 'middle' | 'bottom'
  textAlign?: 'left' | 'center' | 'right'
  contentColor?: string
}

export type SlidesProps = BaseProps & {
  slides?: SlideItem[]
  slidesName?: string
  height?: ResponsiveValue<SliderValue>
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p'
  descriptionTag?: 'div' | 'span' | 'p'
  navigation?: 'both' | 'arrows' | 'dots' | 'none'
  autoplay?: boolean
  pauseOnHover?: boolean
  pauseOnInteraction?: boolean
  autoplaySpeed?: number
  infinite?: boolean
  transition?: 'slide' | 'fade'
  transitionSpeed?: number
  contentAnimation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'zoomIn' | ''
  contentMaxWidth?: ResponsiveValue<SliderValue>
  padding?: ResponsiveValue<DimensionsValue>
  horizontalPosition?: ResponsiveValue<'left' | 'center' | 'right'>
  verticalPosition?: ResponsiveValue<'top' | 'middle' | 'bottom'>
  textAlign?: ResponsiveValue<'left' | 'center' | 'right'>
  headingColor?: string
  descriptionColor?: string
  headingSpacing?: ResponsiveValue<SliderValue>
  descriptionSpacing?: ResponsiveValue<SliderValue>
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  buttonTextColor?: string
  buttonBorderColor?: string
  buttonBorderWidth?: ResponsiveValue<SliderValue>
  buttonBorderRadius?: ResponsiveValue<SliderValue>
  buttonHoverTextColor?: string
  buttonHoverBorderColor?: string
  headingFontSize?: ResponsiveValue<SliderValue>
  headingFontWeight?: string | number
  headingFontFamily?: string
  descriptionFontSize?: ResponsiveValue<SliderValue>
  descriptionFontWeight?: string | number
  descriptionFontFamily?: string
}

export type TestimonialItem = {
  _id?: string
  name?: string
  title?: string  // job title / role
  content?: string  // quote
  image?: ImageLike  // avatar
}

export type TestimonialCarouselProps = BaseProps & {
  items?: TestimonialItem[]
  slidesName?: string  // aria-label for the carousel region

  // Skin & layout
  skin?: 'default' | 'bubble'
  layout?: 'image_inline' | 'image_stacked' | 'image_above' | 'image_left' | 'image_right'
  alignment?: ResponsiveValue<'left' | 'center' | 'right'>

  // Carousel behavior
  slidesPerView?: ResponsiveValue<number | ''>
  slidesToScroll?: ResponsiveValue<number | ''>
  navigation?: 'arrows' | 'dots' | 'both' | 'none'
  pagination?: 'bullets' | 'fraction' | 'progressbar' | 'none'
  showArrows?: boolean
  autoplay?: boolean
  autoplaySpeed?: number
  transitionSpeed?: number
  infinite?: boolean
  pauseOnHover?: boolean
  pauseOnInteraction?: boolean
  spaceBetween?: ResponsiveValue<SliderValue>
  width?: ResponsiveValue<SliderValue>
  lazyload?: boolean

  // Per-slide wrapper styling (.swiper-slide)
  slideBackgroundColor?: string
  slideBorderSize?: DimensionsValue
  slideBorderRadius?: SliderValue
  slideBorderColor?: string
  slidePadding?: DimensionsValue

  // Image (avatar) styling
  imageSize?: ResponsiveValue<SliderValue>
  imageGap?: ResponsiveValue<SliderValue>
  imageBorder?: boolean
  imageBorderColor?: string
  imageBorderWidth?: ResponsiveValue<SliderValue>
  imageBorderRadius?: SliderValue  // PHP: not responsive

  // Content (quote text) styling
  contentColor?: string
  contentFontSize?: ResponsiveValue<SliderValue>
  contentFontWeight?: string | number
  contentFontFamily?: string
  contentGap?: ResponsiveValue<SliderValue>

  // Name styling
  nameColor?: string
  nameFontSize?: ResponsiveValue<SliderValue>
  nameFontWeight?: string | number
  nameFontFamily?: string

  // Title (role) styling
  titleColor?: string
  titleFontSize?: ResponsiveValue<SliderValue>
  titleFontWeight?: string | number
  titleFontFamily?: string

  // Bubble skin styling (only when skin='bubble')
  backgroundColor?: string
  textPadding?: ResponsiveValue<DimensionsValue>
  borderRadius?: ResponsiveValue<DimensionsValue>
  border?: boolean
  borderColor?: string
  borderWidth?: ResponsiveValue<SliderValue>

  // Navigation styling
  arrowsSize?: ResponsiveValue<SliderValue>
  arrowsColor?: string
  paginationSize?: ResponsiveValue<SliderValue>
  paginationGap?: ResponsiveValue<SliderValue>
  paginationColor?: string
  paginationColorInactive?: string
}

// =============================================================================
// INTERNAL TYPES
// =============================================================================

export type InternalFlexboxProps = FlexboxProps & {
  __upComponentName?: string
}

export type AbstractionKind = 'page' | 'container' | 'widget'

export type AbstractionComponentMeta = {
  kind: AbstractionKind
  name: string
  widgetKey?: string
  containerType?: 'grid' | 'flex'
}

export type PreviewSettings = Record<string, any>
export type ResponsiveSuffix = '' | '_tablet' | '_mobile'
