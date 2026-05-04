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
  backgroundOverlay?: string | GradientValue
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

export type ElementorFormField = {
  _id?: string
  custom_id?: string
  type?: 'text' | 'email' | 'textarea' | 'url' | 'tel' | 'radio' | 'select' | 'checkbox' | 'acceptance' | 'number' | 'date' | 'time' | 'upload' | 'password' | 'html' | 'hidden'
  field_type?: string
  label?: string
  field_label?: string
  placeholder?: string
  required?: boolean
  options?: string | string[]
  field_options?: string
  defaultValue?: string
  field_value?: string
  width?: string
  rows?: number
  css_classes?: string
  field_html?: string
  allow_multiple?: boolean
  inline_list?: boolean
  select_size?: number
  min?: number
  max?: number
}

export type ElementorFormProps = BaseProps & {
  formName?: string
  fields?: ElementorFormField[]
  formFields?: ElementorFormField[]
  inputSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showLabels?: boolean
  markRequired?: boolean
  labelPosition?: 'above' | 'inline'
  buttonText?: string
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  buttonWidth?: ResponsiveValue<SliderValue>
  buttonAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>
  buttonIcon?: IconLike
  buttonIconAlign?: 'left' | 'right'
  buttonIconIndent?: SliderValue
  submitActions?: string[]
  formId?: string
  columnGap?: ResponsiveValue<SliderValue>
  rowGap?: ResponsiveValue<SliderValue>
  labelColor?: string
  fieldTextColor?: string
  fieldBackgroundColor?: string
  fieldBorderColor?: string
  fieldBorderRadius?: ResponsiveValue<DimensionsValue>
  buttonTextColor?: string
  buttonBackgroundColor?: string
  buttonBorderColor?: string
  buttonHoverTextColor?: string
  buttonHoverBackgroundColor?: string
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
