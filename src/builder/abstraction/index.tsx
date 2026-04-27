/**
 * JSX Abstraction Layer for Elementor
 *
 * Clean JSX components that compile to Elementor JSON.
 * Core widgets: Grid, Flexbox, Heading, TextEditor, Button, Icon, IconList, Image
 *
 * Supports dual-mode rendering:
 * - JSON mode: compiles to Elementor JSON for export
 * - Preview mode: renders HTML with Elementor-compatible CSS for live preview
 */

import React, { Children, Fragment, isValidElement, createContext, useContext, useMemo, useCallback, useState, type ReactNode, type JSXElementConstructor } from 'react';
import { ElementorElement, ElementorDocument } from '../../types';
import { generateElementId, generateSequentialId, resetIdCounter } from '../../lib/id-generator';
import { useIsPreviewMode } from '../../lib/render-mode';
import { CSSProvider, StyleTag } from '../../lib/css-context';
import {
  generateCSS,
  type CSSRule,
  parseDimension,
  parseSpacing,
  parseBorderRadius,
  parseBoxShadow,
  parseBorder,
  parseBackground,
  parseGap,
  parseTypography,
  parseTextShadow,
  parseTextStroke,
  parseTextAlign,
} from '../../lib/widget-styles';

// =============================================================================
// TYPES (matching demo-app API)
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

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type ElementorSettingsInput = Record<string, JsonValue>

type BaseProps = {
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
// COMPONENT PROPS - CORE WIDGETS
// =============================================================================

export type PageProps = {
  title?: string
  children?: ReactNode
}

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
  /** Section name for layers panel display (e.g., "HeroSection") */
  name?: string
}

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
  /** WordPress menu slug used by native Elementor PHP render. */
  menu?: string
  menuName?: string
  /** Preview-only fallback items. Native Elementor PHP ignores these. */
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
// HELPER FUNCTIONS
// =============================================================================

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isResponsiveObject<T>(value: ResponsiveValue<T> | undefined): value is { desktop?: T; tablet?: T; mobile?: T } {
  return isPlainObject(value) && ('desktop' in value || 'tablet' in value || 'mobile' in value)
}

function normalizeSliderValue(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return { size: value, unit: 'px' }
  if (typeof value === 'string') {
    const match = value.match(/^(-?\d+(?:\.\d+)?)\s*(px|%|em|rem|vw|vh)?$/)
    if (match) return { size: parseFloat(match[1]!), unit: match[2] ?? 'px' }
    return { size: value, unit: 'custom' }
  }
  if (typeof value === 'object' && 'size' in value) {
    return value as JsonValue
  }
  return undefined
}

function normalizeTimeValue(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return { size: value, unit: 's' }
  if (typeof value === 'string') {
    const match = value.match(/^(-?\d+(?:\.\d+)?)\s*(s|ms)?$/)
    if (match) return { size: parseFloat(match[1]!), unit: match[2] ?? 's' }
  }
  if (typeof value === 'object' && 'size' in value) {
    return value as JsonValue
  }
  return undefined
}

function normalizeFlexGapValue(value: unknown): JsonValue | undefined {
  const slider = normalizeSliderValue(value) as { size?: unknown; unit?: string } | undefined
  if (!slider || slider.size === undefined) return undefined
  return {
    row: slider.size as JsonValue,
    column: slider.size as JsonValue,
    unit: slider.unit ?? 'px',
    size: slider.size as JsonValue,
    isLinked: true,
  }
}

function normalizeLineHeight(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return { size: value, unit: 'em' }
  if (typeof value === 'string') {
    const match = value.match(/^(-?\d+(?:\.\d+)?)\s*(px|%|em|rem|vw|vh)?$/)
    if (match) return { size: parseFloat(match[1]!), unit: match[2] ?? 'em' }
    return { size: value, unit: 'em' }
  }
  if (typeof value === 'object' && 'size' in value) {
    return value as JsonValue
  }
  return undefined
}

function normalizeLink(value: LinkLike | undefined): JsonValue | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { url: value }
  return value as JsonValue
}

function normalizeIcon(value: IconLike | undefined): JsonValue | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    const library = value.startsWith('eicon-') ? 'eicons' :
                    value.startsWith('fab ') ? 'fa-brands' :
                    value.startsWith('far ') ? 'fa-regular' : 'fa-solid'
    return { value, library }
  }
  return value as JsonValue
}

function normalizeButtonIconAlign(value: unknown): JsonValue | undefined {
  if (value === 'left') return 'row'
  if (value === 'right') return 'row-reverse'
  if (value === 'row' || value === 'row-reverse') return value
  return undefined
}

function normalizeIconListAlign(value: unknown): JsonValue | undefined {
  if (value === 'left') return 'start'
  if (value === 'right') return 'end'
  if (value === 'start' || value === 'center' || value === 'end') return value
  return undefined
}

function normalizeTextAlign(value: unknown): JsonValue | undefined {
  if (value === 'left') return 'start'
  if (value === 'right') return 'end'
  if (value === 'start' || value === 'center' || value === 'end' || value === 'justify') return value
  return undefined
}

function normalizeIconBoxPosition(value: unknown): JsonValue | undefined {
  if (value === 'top') return 'block-start'
  if (value === 'bottom') return 'block-end'
  if (value === 'left' || value === 'start') return 'inline-start'
  if (value === 'right' || value === 'end') return 'inline-end'
  if (value === 'block-start' || value === 'block-end' || value === 'inline-start' || value === 'inline-end') return value
  return undefined
}

function normalizeImageBoxPosition(value: unknown): JsonValue | undefined {
  if (value === 'start') return 'left'
  if (value === 'end') return 'right'
  if (value === 'left' || value === 'top' || value === 'right') return value
  return undefined
}

function normalizeBoxVerticalAlign(value: unknown): JsonValue | undefined {
  if (value === 'top' || value === 'middle' || value === 'bottom') return value
  return undefined
}

function normalizeImage(value: ImageLike | undefined): Record<string, JsonValue> | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { url: value }
  return value as Record<string, JsonValue>
}

function normalizeTextShadow(value: TextShadowValue | undefined): JsonValue | undefined {
  if (!value) return undefined
  return {
    horizontal: value.horizontal ?? 0,
    vertical: value.vertical ?? 2,
    blur: value.blur ?? 4,
    color: value.color ?? 'rgba(0,0,0,0.3)',
  }
}

function setTextStrokeSettings(
  target: ElementorSettingsInput,
  prefix: string,
  value: TextStrokeValue | undefined
) {
  if (!value) return
  target[`${prefix}_text_stroke_type`] = 'yes'
  if (value.width !== undefined) target[`${prefix}_text_stroke_width`] = normalizeSliderValue(value.width)!
  if (value.color) target[`${prefix}_text_stroke_color`] = value.color
  // Native Elementor names vary by group version; keep both for import tolerance.
  if (value.width !== undefined) target[`${prefix}_text_stroke`] = normalizeSliderValue(value.width)!
  if (value.color) target[`${prefix}_stroke_color`] = value.color
}

function setBoxTextStyleSettings(
  target: ElementorSettingsInput,
  settingsPrefix: 'title_typography' | 'description_typography',
  shadowPrefix: 'title_shadow' | 'description_shadow',
  props: BoxContentStyleProps,
  propPrefix: 'title' | 'description'
) {
  const get = (suffix: string) => (props as Record<string, unknown>)[`${propPrefix}${suffix}`]
  const fontSize = get('FontSize')
  const fontWeight = get('FontWeight')
  const fontFamily = get('FontFamily')
  const fontStyle = get('FontStyle')
  const textDecoration = get('TextDecoration')
  const lineHeight = get('LineHeight')
  const letterSpacing = get('LetterSpacing')
  const textTransform = get('TextTransform')
  const textShadow = get('TextShadow') as TextShadowValue | undefined

  if (fontSize || fontWeight || fontFamily || fontStyle || textDecoration || lineHeight || letterSpacing || textTransform) {
    target[`${settingsPrefix}_typography`] = 'custom'
  }

  setResponsiveSetting(target, `${settingsPrefix}_font_size`, fontSize, normalizeSliderValue)
  if (fontWeight) target[`${settingsPrefix}_font_weight`] = String(fontWeight)
  if (fontFamily) target[`${settingsPrefix}_font_family`] = fontFamily as JsonValue
  if (fontStyle) target[`${settingsPrefix}_font_style`] = fontStyle as JsonValue
  if (textDecoration) target[`${settingsPrefix}_text_decoration`] = textDecoration as JsonValue
  setResponsiveSetting(target, `${settingsPrefix}_line_height`, lineHeight, normalizeLineHeight)
  setResponsiveSetting(target, `${settingsPrefix}_letter_spacing`, letterSpacing, normalizeSliderValue)
  if (textTransform) target[`${settingsPrefix}_text_transform`] = textTransform as JsonValue

  const shadow = normalizeTextShadow(textShadow)
  if (shadow) {
    target[`${shadowPrefix}_text_shadow_type`] = 'yes'
    target[`${shadowPrefix}_text_shadow`] = shadow
  }
}

function setCssFilterSettings(target: ElementorSettingsInput, prefix: 'css_filters' | 'css_filters_hover', value: CSSFilterValue | undefined) {
  if (!value) return
  target[`${prefix}_css_filter`] = 'custom'
  if (value.blur !== undefined) target[`${prefix}_blur`] = normalizeSliderValue(value.blur)!
  if (value.brightness !== undefined) target[`${prefix}_brightness`] = { size: value.brightness, unit: 'px' }
  if (value.contrast !== undefined) target[`${prefix}_contrast`] = { size: value.contrast, unit: 'px' }
  if (value.saturate !== undefined) target[`${prefix}_saturate`] = { size: value.saturate, unit: 'px' }
  if (value.hue !== undefined) target[`${prefix}_hue`] = { size: value.hue, unit: 'px' }
  if (value.grayscale !== undefined) target[`${prefix}_grayscale`] = { size: value.grayscale, unit: 'px' }
}

function setSimpleTypographySettings(
  target: ElementorSettingsInput,
  prefix: string,
  props: Record<string, unknown>,
  propPrefix: string
) {
  const fontSize = props[`${propPrefix}FontSize`]
  const fontWeight = props[`${propPrefix}FontWeight`]
  const fontFamily = props[`${propPrefix}FontFamily`]
  const lineHeight = props[`${propPrefix}LineHeight`]
  const letterSpacing = props[`${propPrefix}LetterSpacing`]
  const textShadow = props[`${propPrefix}TextShadow`] as TextShadowValue | undefined
  if (fontSize || fontWeight || fontFamily || lineHeight || letterSpacing) {
    target[`${prefix}_typography`] = 'custom'
  }
  setResponsiveSetting(target, `${prefix}_font_size`, fontSize, normalizeSliderValue)
  if (fontWeight) target[`${prefix}_font_weight`] = String(fontWeight)
  if (fontFamily) target[`${prefix}_font_family`] = fontFamily as JsonValue
  setResponsiveSetting(target, `${prefix}_line_height`, lineHeight, normalizeLineHeight)
  setResponsiveSetting(target, `${prefix}_letter_spacing`, letterSpacing, normalizeSliderValue)
  const shadow = normalizeTextShadow(textShadow)
  if (shadow) {
    const shadowPrefix = propPrefix === 'content'
      ? 'content_shadow'
      : propPrefix === 'caption'
        ? 'caption_shadow'
        : propPrefix === 'number'
          ? 'number_shadow'
          : propPrefix === 'innerText'
            ? 'bar_inner_shadow'
            : 'title_shadow'
    target[`${shadowPrefix}_text_shadow_type`] = 'yes'
    target[`${shadowPrefix}_text_shadow`] = shadow
  }
}

function normalizeGalleryImage(value: GalleryImage, index: number): Record<string, JsonValue> {
  if (typeof value === 'string') return { id: index + 1, url: value }
  const image: Record<string, JsonValue> = {
    id: value.id ?? index + 1,
    url: value.url,
  }
  if (value.alt) image.alt = value.alt
  if (value.caption) image.caption = value.caption
  return image
}

function normalizeCarouselImage(value: CarouselImage, index: number): Record<string, JsonValue> {
  if (typeof value === 'string') return { id: index + 1, url: value }
  const image: Record<string, JsonValue> = {
    id: value.id ?? index + 1,
    url: value.url,
  }
  if (value.alt) image.alt = value.alt
  if (value.title) image.title = value.title
  if (value.caption) image.caption = value.caption
  if (value.description) image.description = value.description
  return image
}

function stableRepeaterId(prefix: string, index: number, provided?: string): string {
  return provided || `${prefix}_${index + 1}`
}

function slugifyFieldId(value: string, index: number): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
  return slug || `field_${index + 1}`
}

function normalizeFormOptions(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join('\n')
  return value || ''
}

function normalizeElementorFormField(field: ElementorFormField, index: number): Record<string, JsonValue> {
  const fieldType = field.field_type || field.type || 'text'
  const label = field.field_label ?? field.label ?? ''
  const customId = field.custom_id || field._id || slugifyFieldId(label || fieldType, index)
  const normalized: Record<string, JsonValue> = {
    _id: stableRepeaterId('field', index, field._id),
    custom_id: customId,
    field_type: fieldType,
    field_label: label,
    placeholder: field.placeholder || '',
    required: field.required ? 'true' : '',
    width: field.width || '100',
  }
  const value = field.field_value ?? field.defaultValue
  if (value !== undefined) normalized.field_value = value
  let options = normalizeFormOptions(field.field_options ?? field.options)
  if (!options && (fieldType === 'checkbox' || fieldType === 'radio')) {
    options = label || fieldType
  }
  if (options) normalized.field_options = options
  if (field.rows !== undefined) normalized.rows = field.rows
  if (field.css_classes) normalized.css_classes = field.css_classes
  if (field.field_html) normalized.field_html = field.field_html
  if (field.allow_multiple !== undefined) normalized.allow_multiple = field.allow_multiple ? 'true' : ''
  if (field.inline_list !== undefined) normalized.inline_list = field.inline_list ? 'yes' : ''
  if (field.select_size !== undefined) normalized.select_size = field.select_size
  if (field.min !== undefined) normalized.field_min = field.min
  if (field.max !== undefined) normalized.field_max = field.max
  return normalized
}

function normalizeSlideItem(slide: SlideItem, index: number): Record<string, JsonValue> {
  const backgroundImage = normalizeImage(slide.backgroundImage)
  const normalized: Record<string, JsonValue> = {
    _id: stableRepeaterId('slide', index, slide._id),
  }
  if (slide.backgroundColor) normalized.background_color = slide.backgroundColor
  if (backgroundImage) normalized.background_image = backgroundImage as JsonValue
  if (slide.backgroundSize) normalized.background_size = slide.backgroundSize
  if (slide.backgroundKenBurns !== undefined) normalized.background_ken_burns = slide.backgroundKenBurns ? 'yes' : ''
  if (slide.zoomDirection) normalized.zoom_direction = slide.zoomDirection
  if (slide.backgroundOverlay !== undefined) normalized.background_overlay = slide.backgroundOverlay ? 'yes' : ''
  if (slide.backgroundOverlayColor) normalized.background_overlay_color = slide.backgroundOverlayColor
  normalized.heading = slide.heading ?? slide.title ?? ''
  if (slide.description !== undefined) normalized.description = slide.description
  if (slide.button_text !== undefined || slide.buttonText !== undefined) normalized.button_text = slide.button_text ?? slide.buttonText ?? ''
  if (slide.link) normalized.link = normalizeLink(slide.link)!
  if (slide.linkClick) normalized.link_click = slide.linkClick
  if (slide.horizontalPosition) normalized.horizontal_position = slide.horizontalPosition
  if (slide.verticalPosition) normalized.vertical_position = slide.verticalPosition
  if (slide.textAlign) normalized.text_align = slide.textAlign
  if (slide.contentColor) normalized.content_color = slide.contentColor
  return normalized
}

function normalizePercentValue(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return { unit: '%', size: Math.max(0, Math.min(100, value)) }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (Number.isFinite(parsed)) return { unit: '%', size: Math.max(0, Math.min(100, parsed)) }
  }
  if (typeof value === 'object' && 'size' in value) {
    const raw = (value as { size?: unknown }).size
    const size = typeof raw === 'number' ? raw : parseFloat(String(raw ?? 0))
    return { unit: '%', size: Number.isFinite(size) ? Math.max(0, Math.min(100, size)) : 0 }
  }
  return undefined
}

function booleanToElementorYes(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined
  return value ? 'yes' : ''
}

function booleanToElementorShow(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined
  return value ? 'show' : ''
}

function getDomAttributes(props: Record<string, unknown>): Record<string, string | number | boolean> {
  const attrs: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue
    if (
      key.startsWith('data-') ||
      key.startsWith('aria-') ||
      key === 'role' ||
      key === 'title'
    ) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        attrs[key] = value
      }
    }
  }
  return attrs
}

function normalizeDimensions(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') {
    return {
      top: String(value),
      right: String(value),
      bottom: String(value),
      left: String(value),
      unit: 'px',
      isLinked: true,
    } as JsonValue
  }
  if (typeof value !== 'object') return undefined
  const d = value as Exclude<DimensionsValue, number>
  const unit = d.unit || 'px'
  return {
    top: String(d.top ?? 0),
    right: String(d.right ?? 0),
    bottom: String(d.bottom ?? 0),
    left: String(d.left ?? 0),
    unit,
    isLinked: false,
  } as JsonValue
}

function setResponsiveSetting(
  target: ElementorSettingsInput,
  key: string,
  value: unknown,
  transform?: (v: unknown) => JsonValue | undefined
) {
  if (value === undefined) return

  const transformer = transform || ((v) => v as JsonValue)

  if (isResponsiveObject(value as ResponsiveValue<unknown>)) {
    const responsive = value as { desktop?: unknown; tablet?: unknown; mobile?: unknown }
    if (responsive.desktop !== undefined) {
      const transformed = transformer(responsive.desktop)
      if (transformed !== undefined) target[key] = transformed
    }
    if (responsive.tablet !== undefined) {
      const transformed = transformer(responsive.tablet)
      if (transformed !== undefined) target[`${key}_tablet`] = transformed
    }
    if (responsive.mobile !== undefined) {
      const transformed = transformer(responsive.mobile)
      if (transformed !== undefined) target[`${key}_mobile`] = transformed
    }
    return
  }

  const transformed = transformer(value)
  if (transformed !== undefined) target[key] = transformed
}

function setResponsiveNumberSetting(
  target: ElementorSettingsInput,
  key: string,
  value: unknown
) {
  setResponsiveSetting(target, key, value, (v) => {
    const parsed = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(parsed) ? parsed : undefined
  })
}

// =============================================================================
// PROPS MAPPING
// =============================================================================

function normalizeGridGaps(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return { row: value, column: value, unit: 'px' }
  if (typeof value === 'string') {
    const match = value.match(/^(-?\d+(?:\.\d+)?)\s*(px|%|em|rem|vw|vh)?$/)
    if (match) {
      const size = parseFloat(match[1]!)
      return { row: size, column: size, unit: match[2] ?? 'px' }
    }
  }
  if (typeof value === 'object') {
    const obj = value as GapsValue
    if ('row' in obj || 'column' in obj) {
      return { row: obj.row ?? 0, column: obj.column ?? 0, unit: obj.unit ?? 'px' } as JsonValue
    }
    if ('size' in obj) {
      const s = obj as { size?: number | string; unit?: string }
      const size = typeof s.size === 'number' ? s.size : parseFloat(String(s.size ?? 0))
      return { row: size, column: size, unit: s.unit ?? 'px' }
    }
  }
  return undefined
}

function normalizeGridTrackValue(value: unknown): JsonValue | undefined {
  if (value === undefined || value === null) return undefined

  if (typeof value === 'number') {
    return { size: value, unit: 'fr', sizes: [] }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      return { size: Number(trimmed), unit: 'fr', sizes: [] }
    }
    return { size: trimmed, unit: 'custom', sizes: [] }
  }

  if (typeof value === 'object' && 'size' in value) {
    const track = value as { size?: unknown; unit?: unknown; sizes?: unknown }
    if (track.size === undefined || track.size === null || track.size === '') return undefined
    const unit = typeof track.unit === 'string' ? track.unit : undefined
    if (unit === 'custom' || typeof track.size === 'string' && !/^\d+(?:\.\d+)?$/.test(track.size.trim())) {
      return { size: String(track.size), unit: 'custom', sizes: [] }
    }
    const numeric = typeof track.size === 'number' ? track.size : Number(track.size)
    return Number.isFinite(numeric) ? { size: numeric, unit: unit || 'fr', sizes: [] } : undefined
  }

  return undefined
}

function mapSharedLayoutProps(
  settings: ElementorSettingsInput,
  props: BaseProps,
  target: 'container' | 'widget'
) {
  const positioning = props.positioning
  const positionKey = target === 'widget' ? '_position' : 'position'
  const zIndexKey = target === 'widget' ? '_z_index' : 'z_index'

  if (positioning?.mode) {
    settings[positionKey] = positioning.mode
  }

  const zIndex = positioning?.zIndex ?? props.zIndex
  if (zIndex !== undefined) {
    setResponsiveNumberSetting(settings, zIndexKey, zIndex)
  }

  if (positioning?.horizontal?.offset !== undefined) {
    const side = positioning.horizontal.side ?? 'start'
    settings._offset_orientation_h = side
    setResponsiveSetting(
      settings,
      side === 'end' ? '_offset_x_end' : '_offset_x',
      positioning.horizontal.offset,
      normalizeSliderValue
    )
  }

  if (positioning?.vertical?.offset !== undefined) {
    const side = positioning.vertical.side ?? 'start'
    settings._offset_orientation_v = side
    setResponsiveSetting(
      settings,
      side === 'end' ? '_offset_y_end' : '_offset_y',
      positioning.vertical.offset,
      normalizeSliderValue
    )
  }

  if (props.sticky) {
    const sticky = props.sticky
    settings.sticky = sticky.side ?? 'top'
    if (sticky.devices?.length) settings.sticky_on = sticky.devices as unknown as JsonValue
    if (sticky.offset !== undefined) setResponsiveSetting(settings, 'sticky_offset', sticky.offset, normalizeSliderValue)
    if (sticky.effectsOffset !== undefined) setResponsiveSetting(settings, 'sticky_effects_offset', sticky.effectsOffset, normalizeSliderValue)
    if (sticky.anchorLinkOffset !== undefined) setResponsiveSetting(settings, 'sticky_anchor_link_offset', sticky.anchorLinkOffset, normalizeSliderValue)
    if (sticky.parent !== undefined) settings.sticky_parent = sticky.parent ? 'yes' : ''
  }
}

function formatGridTrack(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined

  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    return /^\d+(?:\.\d+)?$/.test(trimmed) ? `repeat(${trimmed}, 1fr)` : trimmed
  }

  if (typeof value === 'object') {
    const track = value as { size?: unknown; unit?: unknown; sizes?: Record<string, unknown> }
    const size = track.sizes?.desktop ?? track.size
    if (size === undefined || size === null || size === '') return undefined
    if (track.unit === 'custom') return String(size)
    const numeric = typeof size === 'number' ? size : Number(size)
    return Number.isFinite(numeric) ? `repeat(${numeric}, 1fr)` : String(size)
  }

  return undefined
}

function mapGridProps(props: Record<string, unknown>): ElementorSettingsInput {
  const settings: ElementorSettingsInput = {}
  const p = props as GridProps

  if (p.columns === undefined) {
    throw new Error(`[Grid] Missing required 'columns' prop.`)
  }
  if (p.rows === undefined) {
    throw new Error(`[Grid] Missing required 'rows' prop. Use rows={1} for a single-row grid.`)
  }

  settings.container_type = 'grid'
  mapSharedLayoutProps(settings, p, 'container')

  setResponsiveSetting(settings, 'grid_columns_grid', p.columns, normalizeGridTrackValue)
  setResponsiveSetting(settings, 'grid_rows_grid', p.rows, normalizeGridTrackValue)

  if (p.gap !== undefined) {
    setResponsiveSetting(settings, 'grid_gaps', p.gap, normalizeGridGaps)
  } else if (p.rowGap !== undefined && p.columnGap !== undefined) {
    const setGapPair = (suffix: '' | '_tablet' | '_mobile', rowValue: unknown, columnValue: unknown) => {
      const row = normalizeSliderValue(rowValue) as { size?: number | string; unit?: string } | undefined
      const column = normalizeSliderValue(columnValue) as { size?: number | string; unit?: string } | undefined
      const parsedRowSize = row?.size !== undefined ? Number(row.size) : undefined
      const parsedColSize = column?.size !== undefined ? Number(column.size) : undefined
      const rowSize = parsedRowSize !== undefined && Number.isFinite(parsedRowSize) ? parsedRowSize : undefined
      const colSize = parsedColSize !== undefined && Number.isFinite(parsedColSize) ? parsedColSize : undefined
      if (rowSize !== undefined || colSize !== undefined) {
        settings[`grid_gaps${suffix}`] = {
          row: rowSize ?? colSize ?? 0,
          column: colSize ?? rowSize ?? 0,
          unit: row?.unit || column?.unit || 'px',
        }
      }
    }

    if (isResponsiveObject(p.rowGap) || isResponsiveObject(p.columnGap)) {
      const row = isResponsiveObject(p.rowGap) ? p.rowGap : { desktop: p.rowGap }
      const column = isResponsiveObject(p.columnGap) ? p.columnGap : { desktop: p.columnGap }
      setGapPair('', row.desktop, column.desktop)
      setGapPair('_tablet', row.tablet, column.tablet)
      setGapPair('_mobile', row.mobile, column.mobile)
    } else {
      setGapPair('', p.rowGap, p.columnGap)
    }
  } else if (p.rowGap !== undefined) {
    setResponsiveSetting(settings, 'grid_row_gap', p.rowGap, normalizeSliderValue)
  } else if (p.columnGap !== undefined) {
    setResponsiveSetting(settings, 'grid_column_gap', p.columnGap, normalizeSliderValue)
  }

  setResponsiveSetting(settings, 'grid_align_items', p.alignItems)
  setResponsiveSetting(settings, 'grid_align_content', p.alignContent)
  setResponsiveSetting(settings, 'grid_justify_items', p.justifyItems)
  setResponsiveSetting(settings, 'grid_justify_content', p.justifyContent)

  if (p.padding !== undefined) setResponsiveSetting(settings, 'padding', p.padding, normalizeDimensions)
  if (p.margin !== undefined) setResponsiveSetting(settings, 'margin', p.margin, normalizeDimensions)

  if (p.backgroundColor) {
    settings.background_background = 'classic'
    settings.background_color = p.backgroundColor
  }

  if (p.borderRadius) settings.border_radius = normalizeDimensions(p.borderRadius)!
  if (p.minHeight) setResponsiveSetting(settings, 'min_height', p.minHeight, normalizeSliderValue)
  if (p.width) setResponsiveSetting(settings, 'width', p.width, normalizeSliderValue)

  if (p.contentWidth) settings.content_width = p.contentWidth
  if (p.boxedWidth) setResponsiveSetting(settings, 'boxed_width', p.boxedWidth, normalizeSliderValue)
  setResponsiveSetting(settings, 'grid_auto_flow', p.autoFlow)

  if (p.settings) Object.assign(settings, p.settings)
  return settings
}

function mapFlexboxProps(props: Record<string, unknown>): ElementorSettingsInput {
  const settings: ElementorSettingsInput = {}
  const p = props as FlexboxProps

  settings.container_type = 'flex'
  mapSharedLayoutProps(settings, p, 'container')

  setResponsiveSetting(settings, 'flex_direction', p.direction ?? 'row')

  const toShortAlign = (v: unknown) => {
    const val = v as string
    return val === 'flex-start' ? 'start' : val === 'flex-end' ? 'end' : val
  }
  setResponsiveSetting(settings, 'justify_content', p.justify, toShortAlign)
  setResponsiveSetting(settings, 'align_items', p.alignItems, toShortAlign)
  setResponsiveSetting(settings, 'flex_justify_content', p.justify)
  setResponsiveSetting(settings, 'flex_align_items', p.alignItems)
  setResponsiveSetting(settings, 'flex_align_content', p.alignContent)

  if (p.gap !== undefined) {
    setResponsiveSetting(settings, 'flex_gap', p.gap, normalizeFlexGapValue)
  }

  setResponsiveSetting(settings, 'flex_wrap', p.wrap)

  if (p.padding !== undefined) setResponsiveSetting(settings, 'padding', p.padding, normalizeDimensions)
  if (p.margin !== undefined) setResponsiveSetting(settings, 'margin', p.margin, normalizeDimensions)

  if (p.backgroundGradient) {
    const g = p.backgroundGradient
    settings.background_background = 'gradient'
    settings.background_color = g.colorA || '#6EC1E4'
    settings.background_color_b = g.colorB || '#54595F'
    if (g.type === 'radial') {
      settings.background_gradient_type = 'radial'
      if (g.position) settings.background_gradient_position = g.position
    } else {
      settings.background_gradient_type = 'linear'
      if (g.angle !== undefined) settings.background_gradient_angle = { size: g.angle, unit: 'deg' }
    }
    if (g.locationA !== undefined) settings.background_color_stop = { size: g.locationA, unit: '%' }
    if (g.locationB !== undefined) settings.background_color_b_stop = { size: g.locationB, unit: '%' }
  } else if (p.backgroundImage) {
    settings.background_background = 'classic'
    settings.background_image = { url: p.backgroundImage.url }
    if (p.backgroundImage.position) settings.background_position = p.backgroundImage.position
    if (p.backgroundImage.size) settings.background_size = p.backgroundImage.size
    if (p.backgroundImage.repeat) settings.background_repeat = p.backgroundImage.repeat
    if (p.backgroundColor) settings.background_color = p.backgroundColor
  } else if (p.backgroundColor) {
    settings.background_background = 'classic'
    settings.background_color = p.backgroundColor
  }

  if (p.backgroundOverlay) {
    if (typeof p.backgroundOverlay === 'string') {
      settings.background_overlay_background = 'classic'
      settings.background_overlay_color = p.backgroundOverlay
    } else {
      const g = p.backgroundOverlay
      settings.background_overlay_background = 'gradient'
      settings.background_overlay_color = g.colorA || '#000000'
      settings.background_overlay_color_b = g.colorB || '#000000'
      if (g.type === 'radial') {
        settings.background_overlay_gradient_type = 'radial'
      } else {
        settings.background_overlay_gradient_type = 'linear'
        if (g.angle !== undefined) settings.background_overlay_gradient_angle = { size: g.angle, unit: 'deg' }
      }
    }
  }

  if (p.borderType) settings.border_border = p.borderType
  if (p.borderWidth) settings.border_width = normalizeDimensions(p.borderWidth)!
  if (p.borderColor) settings.border_color = p.borderColor
  if (p.borderRadius) settings.border_radius = normalizeDimensions(p.borderRadius)!

  if (p.boxShadow) {
    settings.box_shadow_box_shadow_type = 'yes'
    settings.box_shadow_box_shadow = {
      horizontal: p.boxShadow.horizontal ?? 0,
      vertical: p.boxShadow.vertical ?? 4,
      blur: p.boxShadow.blur ?? 10,
      spread: p.boxShadow.spread ?? 0,
      color: p.boxShadow.color ?? 'rgba(0,0,0,0.2)',
      position: p.boxShadow.position ?? 'outline'
    }
  }

  if (p.overflow) settings.overflow = p.overflow

  if (p.minHeight) setResponsiveSetting(settings, 'min_height', p.minHeight, normalizeSliderValue)
  if (p.width) setResponsiveSetting(settings, 'width', p.width, normalizeSliderValue)

  if (p.contentWidth) settings.content_width = p.contentWidth
  if (p.boxedWidth) setResponsiveSetting(settings, 'boxed_width', p.boxedWidth, normalizeSliderValue)

  if (p.flexGrow !== undefined || p.flexShrink !== undefined) settings._flex_size = 'custom'
  if (p.flexGrow !== undefined) setResponsiveSetting(settings, '_flex_grow', p.flexGrow)
  if (p.flexShrink !== undefined) setResponsiveSetting(settings, '_flex_shrink', p.flexShrink)

  if (p.settings) Object.assign(settings, p.settings)
  return settings
}

function mapWidgetProps(widgetKey: string, props: Record<string, unknown>): ElementorSettingsInput {
  const settings: ElementorSettingsInput = {}
  const userSettings = (props.settings ?? {}) as ElementorSettingsInput
  mapSharedLayoutProps(settings, props as BaseProps, 'widget')

  switch (widgetKey) {
    case 'heading': {
      const p = props as HeadingProps
      if (p.title) settings.title = p.title
      if (p.tag) settings.header_size = p.tag
      if (p.size) settings.size = p.size
      setResponsiveSetting(settings, 'align', p.align, (v) => v === 'stretch' ? 'justify' : v as JsonValue)
      if (p.color) settings.title_color = p.color

      const hasTypography = p.fontSize || p.fontWeight || p.fontFamily || p.fontStyle || p.textDecoration || p.lineHeight || p.letterSpacing || p.textTransform
      if (hasTypography) settings.typography_typography = 'custom'

      setResponsiveSetting(settings, 'typography_font_size', p.fontSize, normalizeSliderValue)
      if (p.fontWeight) settings.typography_font_weight = String(p.fontWeight)
      if (p.fontFamily) settings.typography_font_family = p.fontFamily
      if (p.fontStyle) settings.typography_font_style = p.fontStyle
      if (p.textDecoration) settings.typography_text_decoration = p.textDecoration
      setResponsiveSetting(settings, 'typography_line_height', p.lineHeight, normalizeLineHeight)
      setResponsiveSetting(settings, 'typography_letter_spacing', p.letterSpacing, normalizeSliderValue)
      if (p.textTransform) settings.typography_text_transform = p.textTransform

      if (p.textShadow) {
        settings.text_shadow_text_shadow_type = 'yes'
        settings.text_shadow_text_shadow = {
          horizontal: p.textShadow.horizontal ?? 0,
          vertical: p.textShadow.vertical ?? 2,
          blur: p.textShadow.blur ?? 4,
          color: p.textShadow.color ?? 'rgba(0,0,0,0.3)'
        }
      }

      if (p.blendMode) settings.blend_mode = p.blendMode
      if (p.link) settings.link = normalizeLink(p.link)!
      break
    }

    case 'text-editor': {
      const p = props as TextEditorProps
      if (p.content) settings.editor = p.content
      setResponsiveSetting(settings, 'align', p.align, (v) => v === 'stretch' ? 'justify' : v as JsonValue)
      if (p.color) settings.text_color = p.color

      const hasTypography = p.fontSize || p.fontFamily || p.lineHeight || p.letterSpacing
      if (hasTypography) settings.typography_typography = 'custom'

      setResponsiveSetting(settings, 'typography_font_size', p.fontSize, normalizeSliderValue)
      if (p.fontFamily) settings.typography_font_family = p.fontFamily
      setResponsiveSetting(settings, 'typography_line_height', p.lineHeight, normalizeLineHeight)
      setResponsiveSetting(settings, 'typography_letter_spacing', p.letterSpacing, normalizeSliderValue)
      setResponsiveSetting(settings, 'paragraph_spacing', p.paragraphSpacing, normalizeSliderValue)
      setResponsiveSetting(settings, 'text_columns', p.columns)
      setResponsiveSetting(settings, 'column_gap', p.columnGap, normalizeSliderValue)
      break
    }

    case 'button': {
      const p = props as ButtonProps
      if (p.text) settings.text = p.text
      if (p.link) settings.link = normalizeLink(p.link)!
      if (p.size) settings.size = p.size
      setResponsiveSetting(settings, 'align', p.align)
      if (p.icon) settings.selected_icon = normalizeIcon(p.icon)!
      if (p.iconPosition) {
        const iconAlign = normalizeButtonIconAlign(p.iconPosition)
        if (iconAlign !== undefined) settings.icon_align = iconAlign
      }
      if (p.iconSpacing) settings.icon_indent = normalizeSliderValue(p.iconSpacing)!
      if (p.textColor) settings.button_text_color = p.textColor
      if (p.backgroundColor) {
        settings.background_background = 'classic'
        settings.background_color = p.backgroundColor
      }
      if (p.hoverTextColor) settings.hover_color = p.hoverTextColor
      if (p.hoverBackgroundColor) settings.button_background_hover_color = p.hoverBackgroundColor
      if (p.borderType) settings.border_border = p.borderType
      const normalizeBorderWidth = (value: unknown): JsonValue | undefined => {
        const slider = normalizeSliderValue(value) as { size?: number | string; unit?: string } | undefined
        if (slider?.size !== undefined) {
          const size = typeof slider.size === 'number' ? slider.size : parseFloat(String(slider.size))
          return { top: size, right: size, bottom: size, left: size, unit: slider.unit || 'px' }
        }
        return undefined
      }
      setResponsiveSetting(settings, 'border_width', p.borderWidth, normalizeBorderWidth)
      if (p.borderColor) settings.border_color = p.borderColor
      setResponsiveSetting(settings, 'border_radius', p.borderRadius, normalizeDimensions)
      setResponsiveSetting(settings, 'text_padding', p.padding, normalizeDimensions)

      const hasTypography = p.fontSize || p.fontWeight || p.lineHeight || p.letterSpacing
      if (hasTypography) settings.typography_typography = 'custom'

      setResponsiveSetting(settings, 'typography_font_size', p.fontSize, normalizeSliderValue)
      if (p.fontWeight) settings.typography_font_weight = String(p.fontWeight)
      setResponsiveSetting(settings, 'typography_line_height', p.lineHeight, normalizeLineHeight)
      setResponsiveSetting(settings, 'typography_letter_spacing', p.letterSpacing, normalizeSliderValue)
      setResponsiveSetting(settings, 'content_align', p.contentAlign)
      break
    }

    case 'icon': {
      const p = props as IconProps
      if (p.icon) settings.selected_icon = normalizeIcon(p.icon)!
      if (p.view) settings.view = p.view
      if (p.shape) settings.shape = p.shape
      setResponsiveSetting(settings, 'align', p.align ?? 'left')

      if (p.view === 'stacked') {
        if (p.backgroundColor) settings.primary_color = p.backgroundColor
        if (p.color) settings.secondary_color = p.color
        if (p.hoverBackgroundColor) settings.hover_primary_color = p.hoverBackgroundColor
        if (p.hoverColor) settings.hover_secondary_color = p.hoverColor
      } else {
        if (p.color) settings.primary_color = p.color
        if (p.backgroundColor) settings.secondary_color = p.backgroundColor
        if (p.hoverColor) settings.hover_primary_color = p.hoverColor
        if (p.hoverBackgroundColor) settings.hover_secondary_color = p.hoverBackgroundColor
      }

      setResponsiveSetting(settings, 'size', p.size, normalizeSliderValue)
      if (p.padding !== undefined) settings.icon_padding = normalizeSliderValue(p.padding)!
      if (p.borderWidth) settings.border_width = normalizeSliderValue(p.borderWidth)!
      setResponsiveSetting(settings, 'border_radius', p.borderRadius, normalizeDimensions)
      if (p.borderColor) settings.border_color = p.borderColor
      if (p.link) settings.link = normalizeLink(p.link)!
      setResponsiveSetting(settings, 'rotate', p.rotate, (v) => ({ size: v as JsonValue, unit: 'deg' }))
      break
    }

    case 'icon-box': {
      const p = props as IconBoxProps
      const icon = normalizeIcon(p.selected_icon ?? p.icon)
      settings.selected_icon = icon || { value: 'fas fa-star', library: 'fa-solid' }
      if (p.title) settings.title_text = p.title
      if (p.description) settings.description_text = p.description
      if (p.link) settings.link = normalizeLink(p.link)!
      settings.title_size = p.titleSize || 'h3'
      settings.view = p.view || 'default'
      if (p.shape) settings.shape = p.shape
      setResponsiveSetting(settings, 'position', p.position ?? 'block-start', normalizeIconBoxPosition)
      if (p.position !== undefined && !isResponsiveObject(p.position)) {
        settings.position_tablet = settings.position
        settings.position_mobile = settings.position
      }
      setResponsiveSetting(settings, 'content_vertical_alignment', p.verticalAlign, normalizeBoxVerticalAlign)
      setResponsiveSetting(settings, 'text_align', p.align, normalizeTextAlign)
      setResponsiveSetting(settings, 'icon_space', p.iconSpace, normalizeSliderValue)
      setResponsiveSetting(settings, 'title_bottom_space', p.titleBottomSpace, normalizeSliderValue)
      if (p.primaryColor) settings.primary_color = p.primaryColor
      if (p.secondaryColor) settings.secondary_color = p.secondaryColor
      if (p.hoverPrimaryColor) settings.hover_primary_color = p.hoverPrimaryColor
      if (p.hoverSecondaryColor) settings.hover_secondary_color = p.hoverSecondaryColor
      if (p.hoverIconTransition !== undefined) settings.hover_icon_colors_transition_duration = normalizeTimeValue(p.hoverIconTransition)!
      if (p.hoverAnimation) settings.hover_animation = p.hoverAnimation
      setResponsiveSetting(settings, 'icon_size', p.iconSize, normalizeSliderValue)
      setResponsiveSetting(settings, 'icon_padding', p.iconPadding, normalizeSliderValue)
      setResponsiveSetting(settings, 'rotate', p.rotate, (v) => ({ size: v as JsonValue, unit: 'deg' }))
      setResponsiveSetting(settings, 'border_width', p.borderWidth, normalizeDimensions)
      setResponsiveSetting(settings, 'border_radius', p.borderRadius, normalizeDimensions)
      if (p.titleColor) settings.title_color = p.titleColor
      if (p.titleHoverColor) settings.hover_title_color = p.titleHoverColor
      if (p.titleHoverTransition !== undefined) settings.hover_title_color_transition_duration = normalizeTimeValue(p.titleHoverTransition)!
      if (p.descriptionColor) settings.description_color = p.descriptionColor
      setBoxTextStyleSettings(settings, 'title_typography', 'title_shadow', p, 'title')
      setTextStrokeSettings(settings, 'text_stroke', p.titleTextStroke)
      setBoxTextStyleSettings(settings, 'description_typography', 'description_shadow', p, 'description')
      break
    }

    case 'icon-list': {
      const p = props as IconListProps
      if (p.items) {
        settings.icon_list = p.items.map((item, index) => {
          const icon = normalizeIcon(item.selected_icon ?? item.icon) as JsonValue | undefined
          const link = normalizeLink(item.link) as JsonValue | undefined
          const listItem: Record<string, JsonValue> = {
            _id: item._id || `item_${index}`,
            text: item.text,
            selected_icon: icon || { value: '', library: '' },
          }
          if (link) listItem.link = link
          return listItem
        })
      }

      settings.view = p.view || 'traditional'
      settings.link_click = p.linkClick || 'full_width'
      setResponsiveSetting(settings, 'icon_align', p.align, normalizeIconListAlign)
      setResponsiveSetting(settings, 'space_between', p.spaceBetween, normalizeSliderValue)

      if (p.divider !== undefined) settings.divider = p.divider ? 'yes' : ''
      if (p.dividerStyle) settings.divider_style = p.dividerStyle
      if (p.dividerWeight !== undefined) settings.divider_weight = normalizeSliderValue(p.dividerWeight)!
      if (p.dividerWidth !== undefined) settings.divider_width = normalizeSliderValue(p.dividerWidth)!
      if (p.dividerHeight !== undefined) settings.divider_height = normalizeSliderValue(p.dividerHeight)!
      if (p.dividerColor) settings.divider_color = p.dividerColor

      if (p.iconColor) settings.icon_color = p.iconColor
      if (p.iconHoverColor) settings.icon_color_hover = p.iconHoverColor
      if (p.iconHoverTransition !== undefined) settings.icon_color_hover_transition = normalizeSliderValue(p.iconHoverTransition)!
      setResponsiveSetting(settings, 'icon_size', p.iconSize, normalizeSliderValue)
      if (p.iconGap !== undefined) settings.text_indent = normalizeSliderValue(p.iconGap)!
      setResponsiveSetting(settings, 'icon_self_align', p.iconSelfAlign)
      setResponsiveSetting(settings, 'icon_self_vertical_align', p.iconVerticalAlign)
      setResponsiveSetting(settings, 'icon_vertical_offset', p.iconVerticalOffset, normalizeSliderValue)

      if (p.textColor) settings.text_color = p.textColor
      if (p.textHoverColor) settings.text_color_hover = p.textHoverColor
      if (p.textHoverTransition !== undefined) settings.text_color_hover_transition = normalizeSliderValue(p.textHoverTransition)!

      const hasTypography = p.fontSize || p.fontWeight || p.fontFamily || p.fontStyle || p.textDecoration || p.lineHeight || p.letterSpacing || p.textTransform
      if (hasTypography) settings.icon_typography_typography = 'custom'
      setResponsiveSetting(settings, 'icon_typography_font_size', p.fontSize, normalizeSliderValue)
      if (p.fontWeight) settings.icon_typography_font_weight = String(p.fontWeight)
      if (p.fontFamily) settings.icon_typography_font_family = p.fontFamily
      if (p.fontStyle) settings.icon_typography_font_style = p.fontStyle
      if (p.textDecoration) settings.icon_typography_text_decoration = p.textDecoration
      setResponsiveSetting(settings, 'icon_typography_line_height', p.lineHeight, normalizeLineHeight)
      setResponsiveSetting(settings, 'icon_typography_letter_spacing', p.letterSpacing, normalizeSliderValue)
      if (p.textTransform) settings.icon_typography_text_transform = p.textTransform

      if (p.textShadow) {
        settings.text_shadow_text_shadow_type = 'yes'
        settings.text_shadow_text_shadow = {
          horizontal: p.textShadow.horizontal ?? 0,
          vertical: p.textShadow.vertical ?? 2,
          blur: p.textShadow.blur ?? 4,
          color: p.textShadow.color ?? 'rgba(0,0,0,0.3)'
        }
      }
      break
    }

    case 'image': {
      const p = props as ImageProps
      if (p.image) {
        const img = normalizeImage(p.image)!
        if (p.alt) img.alt = p.alt
        settings.image = img as JsonValue
      }
      if (p.image_size) settings.image_size = p.image_size
      if (p.caption) {
        settings.caption = p.caption
        settings.caption_source = 'custom'
      }
      if (p.link) {
        settings.link = normalizeLink(p.link)!
        settings.link_to = 'custom'
      }
      setResponsiveSetting(settings, 'align', p.align ?? 'left', (v) => {
        const val = v as string
        return val === 'left' ? 'start' : val === 'right' ? 'end' : val
      })
      setResponsiveSetting(settings, 'width', p.width, normalizeSliderValue)
      setResponsiveSetting(settings, 'space', p.maxWidth, normalizeSliderValue)
      setResponsiveSetting(settings, 'height', p.height, normalizeSliderValue)
      setResponsiveSetting(settings, 'object-fit', p.objectFit)
      setResponsiveSetting(settings, 'object-position', p.objectPosition)
      setResponsiveSetting(settings, 'image_border_radius', p.borderRadius, normalizeDimensions)
      if (p.opacity !== undefined) settings.opacity = { unit: 'px', size: p.opacity > 1 ? p.opacity / 100 : p.opacity, sizes: [] }
      break
    }

    case 'image-box': {
      const p = props as ImageBoxProps
      if (p.image) {
        const img = normalizeImage(p.image)!
        if (p.alt) img.alt = p.alt
        settings.image = img as JsonValue
      }
      if (p.thumbnailSize) settings.thumbnail_size = p.thumbnailSize
      if (p.thumbnailCustomDimension) settings.thumbnail_custom_dimension = p.thumbnailCustomDimension as JsonValue
      if (p.title) settings.title_text = p.title
      if (p.description) settings.description_text = p.description
      if (p.link) settings.link = normalizeLink(p.link)!
      settings.title_size = p.titleSize || 'h3'
      setResponsiveSetting(settings, 'position', p.position ?? 'top', normalizeImageBoxPosition)
      setResponsiveSetting(settings, 'content_vertical_alignment', p.verticalAlign, normalizeBoxVerticalAlign)
      setResponsiveSetting(settings, 'text_align', p.align, normalizeTextAlign)
      setResponsiveSetting(settings, 'image_space', p.imageSpace, normalizeSliderValue)
      setResponsiveSetting(settings, 'title_bottom_space', p.titleBottomSpace, normalizeSliderValue)
      setResponsiveSetting(settings, 'image_size', p.imageWidth, normalizeSliderValue)
      setResponsiveSetting(settings, 'image_height', p.imageHeight, normalizeSliderValue)
      setResponsiveSetting(settings, 'image_object_fit', p.imageObjectFit)
      setResponsiveSetting(settings, 'image_object_position', p.imageObjectPosition)
      if (p.imageBorderType && p.imageBorderType !== 'none') settings.image_border_border = p.imageBorderType
      setResponsiveSetting(settings, 'image_border_width', p.imageBorderWidth, normalizeDimensions)
      if (p.imageBorderColor) settings.image_border_color = p.imageBorderColor
      setResponsiveSetting(settings, 'image_border_radius', p.imageBorderRadius, normalizeSliderValue)
      if (p.imageBoxShadow) {
        settings.image_box_shadow_box_shadow_type = 'yes'
        settings.image_box_shadow_box_shadow = p.imageBoxShadow as JsonValue
      }
      setCssFilterSettings(settings, 'css_filters', p.cssFilters)
      setCssFilterSettings(settings, 'css_filters_hover', p.cssFiltersHover)
      if (p.imageOpacity !== undefined) settings.image_opacity = normalizeSliderValue(p.imageOpacity)!
      if (p.imageOpacityHover !== undefined) settings.image_opacity_hover = normalizeSliderValue(p.imageOpacityHover)!
      if (p.backgroundHoverTransition !== undefined) settings.background_hover_transition = normalizeTimeValue(p.backgroundHoverTransition)!
      if (p.hoverAnimation) settings.hover_animation = p.hoverAnimation
      if (p.titleColor) settings.title_color = p.titleColor
      if (p.titleHoverColor) settings.hover_title_color = p.titleHoverColor
      if (p.titleHoverTransition !== undefined) settings.hover_title_color_transition_duration = normalizeTimeValue(p.titleHoverTransition)!
      if (p.descriptionColor) settings.description_color = p.descriptionColor
      setBoxTextStyleSettings(settings, 'title_typography', 'title_shadow', p, 'title')
      setTextStrokeSettings(settings, 'title_stroke', p.titleTextStroke)
      setBoxTextStyleSettings(settings, 'description_typography', 'description_shadow', p, 'description')
      break
    }

    case 'accordion': {
      const p = props as AccordionProps
      settings.tabs = (p.items || []).map((item, index) => ({
        _id: item._id || `accordion_${index}`,
        tab_title: item.title,
        tab_content: item.content,
      })) as JsonValue
      settings.selected_icon = normalizeIcon(p.icon || 'fas fa-plus')!
      settings.selected_active_icon = normalizeIcon(p.activeIcon || 'fas fa-minus')!
      settings.title_html_tag = p.titleHtmlTag || 'div'
      if (p.faqSchema !== undefined) settings.faq_schema = p.faqSchema ? 'yes' : ''
      if (p.iconAlign) settings.icon_align = p.iconAlign
      if (p.borderWidth !== undefined) settings.border_width = normalizeSliderValue(p.borderWidth)!
      if (p.borderColor) settings.border_color = p.borderColor
      if (p.titleBackground) settings.title_background = p.titleBackground
      if (p.titleColor) settings.title_color = p.titleColor
      if (p.titleActiveColor) settings.tab_active_color = p.titleActiveColor
      setResponsiveSetting(settings, 'title_padding', p.titlePadding, normalizeDimensions)
      if (p.iconColor) settings.icon_color = p.iconColor
      if (p.iconActiveColor) settings.icon_active_color = p.iconActiveColor
      setResponsiveSetting(settings, 'icon_space', p.iconSpace, normalizeSliderValue)
      if (p.contentBackgroundColor) settings.content_background_color = p.contentBackgroundColor
      if (p.contentColor) settings.content_color = p.contentColor
      setResponsiveSetting(settings, 'content_padding', p.contentPadding, normalizeDimensions)
      setSimpleTypographySettings(settings, 'title_typography', p as Record<string, unknown>, 'title')
      setTextStrokeSettings(settings, 'text_stroke', p.titleTextStroke)
      setSimpleTypographySettings(settings, 'content_typography', p as Record<string, unknown>, 'content')
      break
    }

    case 'toggle': {
      const p = props as ToggleProps
      settings.tabs = (p.items || []).map((item, index) => ({
        _id: item._id || `toggle_${index}`,
        tab_title: item.title,
        tab_content: item.content,
      })) as JsonValue
      settings.selected_icon = normalizeIcon(p.icon || 'fas fa-caret-right')!
      settings.selected_active_icon = normalizeIcon(p.activeIcon || 'fas fa-caret-up')!
      settings.title_html_tag = p.titleHtmlTag || 'div'
      if (p.faqSchema !== undefined) settings.faq_schema = p.faqSchema ? 'yes' : ''
      if (p.iconAlign) settings.icon_align = p.iconAlign
      if (p.borderWidth !== undefined) settings.border_width = normalizeSliderValue(p.borderWidth)!
      if (p.borderColor) settings.border_color = p.borderColor
      setResponsiveSetting(settings, 'space_between', p.spaceBetween, normalizeSliderValue)
      if (p.boxShadow) {
        settings.box_shadow_box_shadow_type = 'yes'
        settings.box_shadow_box_shadow = p.boxShadow as JsonValue
      }
      if (p.titleBackground) settings.title_background = p.titleBackground
      if (p.titleColor) settings.title_color = p.titleColor
      if (p.titleActiveColor) settings.tab_active_color = p.titleActiveColor
      setResponsiveSetting(settings, 'title_padding', p.titlePadding, normalizeDimensions)
      if (p.iconColor) settings.icon_color = p.iconColor
      if (p.iconActiveColor) settings.icon_active_color = p.iconActiveColor
      setResponsiveSetting(settings, 'icon_space', p.iconSpace, normalizeSliderValue)
      if (p.contentBackgroundColor) settings.content_background_color = p.contentBackgroundColor
      if (p.contentColor) settings.content_color = p.contentColor
      setResponsiveSetting(settings, 'content_padding', p.contentPadding, normalizeDimensions)
      setSimpleTypographySettings(settings, 'title_typography', p as Record<string, unknown>, 'title')
      setTextStrokeSettings(settings, 'text_stroke', p.titleTextStroke)
      setSimpleTypographySettings(settings, 'content_typography', p as Record<string, unknown>, 'content')
      break
    }

    case 'tabs': {
      const p = props as TabsProps
      settings.tabs = (p.items || []).map((item, index) => ({
        _id: item._id || `tab_${index}`,
        tab_title: item.title,
        tab_content: item.content,
      })) as JsonValue
      settings.type = p.type || 'horizontal'
      if (p.align !== undefined) {
        if (settings.type === 'vertical') settings.tabs_align_vertical = p.align
        else settings.tabs_align_horizontal = p.align
      }
      if (p.navigationWidth !== undefined) settings.navigation_width = normalizeSliderValue(p.navigationWidth)!
      if (p.borderWidth !== undefined) settings.border_width = normalizeSliderValue(p.borderWidth)!
      if (p.borderColor) settings.border_color = p.borderColor
      if (p.backgroundColor) settings.background_color = p.backgroundColor
      if (p.tabColor) settings.tab_color = p.tabColor
      if (p.tabActiveColor) settings.tab_active_color = p.tabActiveColor
      if (p.titleAlign) settings.title_align = normalizeTextAlign(p.titleAlign)!
      if (p.contentColor) settings.content_color = p.contentColor
      setSimpleTypographySettings(settings, 'tab_typography', p as Record<string, unknown>, 'tab')
      setTextStrokeSettings(settings, 'text_stroke', p.tabTextStroke)
      setSimpleTypographySettings(settings, 'content_typography', p as Record<string, unknown>, 'content')
      break
    }

    case 'image-gallery': {
      const p = props as ImageGalleryProps
      settings.wp_gallery = (p.images || []).map(normalizeGalleryImage) as JsonValue
      settings.thumbnail_size = p.thumbnailSize || 'thumbnail'
      settings.gallery_columns = p.columns || 4
      settings.gallery_display_caption = p.caption === 'none' ? 'none' : ''
      settings.gallery_link = p.link || 'file'
      settings.open_lightbox = p.openLightbox || 'default'
      if (p.randomOrder !== undefined) settings.gallery_rand = p.randomOrder ? 'rand' : ''
      settings.image_spacing = p.imageSpacing || ''
      if (p.imageSpacingCustom !== undefined) settings.image_spacing_custom = normalizeSliderValue(p.imageSpacingCustom)!
      if (p.imageBorderType && p.imageBorderType !== 'none') settings.image_border_border = p.imageBorderType
      setResponsiveSetting(settings, 'image_border_width', p.imageBorderWidth, normalizeDimensions)
      if (p.imageBorderColor) settings.image_border_color = p.imageBorderColor
      setResponsiveSetting(settings, 'image_border_radius', p.imageBorderRadius, normalizeDimensions)
      setResponsiveSetting(settings, 'align', p.align, normalizeTextAlign)
      if (p.textColor) settings.text_color = p.textColor
      setResponsiveSetting(settings, 'caption_space', p.captionSpace, normalizeSliderValue)
      setSimpleTypographySettings(settings, 'typography', p as Record<string, unknown>, 'caption')
      break
    }

    case 'counter': {
      const p = props as CounterProps
      settings.starting_number = p.startingNumber ?? p.start ?? 0
      settings.ending_number = p.endingNumber ?? p.end ?? 100
      settings.duration = p.duration ?? 2000
      if (p.prefix !== undefined) settings.prefix = p.prefix
      if (p.suffix !== undefined) settings.suffix = p.suffix
      if (p.thousandSeparator !== undefined) settings.thousand_separator = p.thousandSeparator ? 'yes' : ''
      if (p.thousandSeparatorChar !== undefined) settings.thousand_separator_char = p.thousandSeparatorChar
      if (p.title !== undefined) settings.title = p.title
      settings.title_tag = p.titleTag || 'div'
      setResponsiveSetting(settings, 'title_position', p.titlePosition)
      setResponsiveSetting(settings, 'title_horizontal_alignment', p.titleHorizontalAlignment)
      setResponsiveSetting(settings, 'title_vertical_alignment', p.titleVerticalAlignment)
      setResponsiveSetting(settings, 'title_gap', p.titleGap, normalizeSliderValue)
      setResponsiveSetting(settings, 'number_position', p.numberPosition)
      setResponsiveSetting(settings, 'number_alignment', p.numberAlignment)
      setResponsiveSetting(settings, 'number_gap', p.numberGap, normalizeSliderValue)
      if (p.numberColor) settings.number_color = p.numberColor
      if (p.titleColor) settings.title_color = p.titleColor
      setSimpleTypographySettings(settings, 'typography_number', p as Record<string, unknown>, 'number')
      setTextStrokeSettings(settings, 'number_stroke', p.numberTextStroke)
      setSimpleTypographySettings(settings, 'typography_title', p as Record<string, unknown>, 'title')
      setTextStrokeSettings(settings, 'title_stroke', p.titleTextStroke)
      break
    }

    case 'progress': {
      const p = props as ProgressProps
      if (p.title !== undefined) settings.title = p.title
      settings.title_tag = p.titleTag || 'span'
      if (p.titleDisplay !== undefined) settings.title_display = p.titleDisplay ? 'yes' : ''
      settings.percent = normalizePercentValue(p.percent ?? 50)!
      if (p.progressType !== undefined) settings.progress_type = p.progressType === 'default' ? '' : p.progressType
      if (p.displayPercentage !== undefined) settings.display_percentage = p.displayPercentage ? 'show' : ''
      else settings.display_percentage = 'show'
      if (p.innerText !== undefined) settings.inner_text = p.innerText
      if (p.titleColor) settings.title_color = p.titleColor
      setSimpleTypographySettings(settings, 'typography', p as Record<string, unknown>, 'title')
      if (p.barColor) settings.bar_color = p.barColor
      if (p.barBgColor) settings.bar_bg_color = p.barBgColor
      setResponsiveSetting(settings, 'bar_height', p.barHeight, normalizeSliderValue)
      setResponsiveSetting(settings, 'bar_border_radius', p.barBorderRadius, normalizeDimensions)
      if (p.barInlineColor) settings.bar_inline_color = p.barInlineColor
      setSimpleTypographySettings(settings, 'bar_inner_typography', p as Record<string, unknown>, 'innerText')
      break
    }

    case 'image-carousel': {
      const p = props as ImageCarouselProps
      settings.carousel = (p.images || p.carousel || []).map(normalizeCarouselImage) as JsonValue
      if (p.carouselName) settings.carousel_name = p.carouselName
      settings.thumbnail_size = p.thumbnailSize || 'medium'
      if (p.thumbnailCustomDimension) settings.thumbnail_custom_dimension = p.thumbnailCustomDimension as JsonValue
      setResponsiveNumberSetting(settings, 'slides_to_show', p.slidesToShow)
      setResponsiveNumberSetting(settings, 'slides_to_scroll', p.slidesToScroll)
      if (p.imageStretch !== undefined) settings.image_stretch = p.imageStretch ? 'yes' : ''
      settings.navigation = p.navigation || 'both'
      settings.navigation_previous_icon = normalizeIcon(p.previousIcon || 'eicon-chevron-left')!
      settings.navigation_next_icon = normalizeIcon(p.nextIcon || 'eicon-chevron-right')!
      if (p.linkTo) settings.link_to = p.linkTo
      if (p.link) settings.link = normalizeLink(p.link)!
      if (p.openLightbox) settings.open_lightbox = p.openLightbox
      if (p.captionType !== undefined) settings.caption_type = p.captionType
      if (p.lazyload !== undefined) settings.lazyload = p.lazyload ? 'yes' : ''
      if (p.autoplay !== undefined) settings.autoplay = p.autoplay ? 'yes' : ''
      if (p.pauseOnHover !== undefined) settings.pause_on_hover = p.pauseOnHover ? 'yes' : ''
      if (p.pauseOnInteraction !== undefined) settings.pause_on_interaction = p.pauseOnInteraction ? 'yes' : ''
      if (p.autoplaySpeed !== undefined) settings.autoplay_speed = p.autoplaySpeed
      if (p.infinite !== undefined) settings.infinite = p.infinite ? 'yes' : ''
      if (p.speed !== undefined) settings.speed = p.speed
      if (p.direction) settings.direction = p.direction
      if (p.effect) settings.effect = p.effect
      if (p.arrowsPosition) settings.arrows_position = p.arrowsPosition
      setResponsiveSetting(settings, 'arrows_size', p.arrowsSize, normalizeSliderValue)
      if (p.arrowsColor) settings.arrows_color = p.arrowsColor
      if (p.dotsPosition) settings.dots_position = p.dotsPosition
      setResponsiveSetting(settings, 'dots_gap', p.dotsGap, normalizeSliderValue)
      setResponsiveSetting(settings, 'dots_size', p.dotsSize, normalizeSliderValue)
      if (p.dotsInactiveColor) settings.dots_inactive_color = p.dotsInactiveColor
      if (p.dotsColor) settings.dots_color = p.dotsColor
      setResponsiveSetting(settings, 'gallery_vertical_align', p.galleryVerticalAlign)
      if (p.imageSpacing !== undefined) settings.image_spacing = 'custom'
      setResponsiveSetting(settings, 'image_spacing_custom', p.imageSpacing, normalizeSliderValue)
      if (p.imageBorderType && p.imageBorderType !== 'none') settings.image_border_border = p.imageBorderType
      setResponsiveSetting(settings, 'image_border_width', p.imageBorderWidth, normalizeDimensions)
      if (p.imageBorderColor) settings.image_border_color = p.imageBorderColor
      setResponsiveSetting(settings, 'image_border_radius', p.imageBorderRadius, normalizeDimensions)
      setResponsiveSetting(settings, 'caption_align', p.captionAlign, normalizeTextAlign)
      if (p.captionColor) settings.caption_text_color = p.captionColor
      setResponsiveSetting(settings, 'caption_space', p.captionSpace, normalizeSliderValue)
      setSimpleTypographySettings(settings, 'caption_typography', p as Record<string, unknown>, 'caption')
      break
    }

    case 'nav-menu': {
      const p = props as NavMenuProps
      settings.menu = p.menu || 'primary-menu'
      settings.menu_name = p.menuName || p.menu || 'Primary Menu'
      settings.layout = p.layout || 'horizontal'
      setResponsiveSetting(settings, 'align_items', p.align)
      settings.pointer = p.pointer || 'underline'
      if (p.pointerAnimation) {
        const pointer = p.pointer || 'underline'
        const animationKey = pointer === 'framed'
          ? 'animation_framed'
          : pointer === 'background'
            ? 'animation_background'
            : pointer === 'text'
              ? 'animation_text'
              : 'animation_line'
        settings[animationKey] = p.pointerAnimation
      }
      if (p.submenuIcon) settings.submenu_icon = normalizeIcon(p.submenuIcon)!
      if (p.dropdown) settings.dropdown = p.dropdown
      if (p.fullWidth !== undefined) settings.full_width = p.fullWidth ? 'stretch' : ''
      setResponsiveSetting(settings, 'text_align', p.textAlign, normalizeTextAlign)
      if (p.toggle) settings.toggle = p.toggle
      if (p.toggleIcon) settings.toggle_icon_normal = normalizeIcon(p.toggleIcon)!
      if (p.toggleActiveIcon) settings.toggle_icon_active = normalizeIcon(p.toggleActiveIcon)!
      setResponsiveSetting(settings, 'toggle_align', p.toggleAlign, normalizeTextAlign)
      if (p.textColor) settings.color_menu_item = p.textColor
      if (p.textColorHover) settings.color_menu_item_hover = p.textColorHover
      if (p.textColorActive) settings.color_menu_item_active = p.textColorActive
      if (p.pointerColor) settings.pointer_color_menu_item_hover = p.pointerColor
      if (p.pointerColorActive) settings.pointer_color_menu_item_active = p.pointerColorActive
      setResponsiveSetting(settings, 'padding_horizontal_menu_item', p.menuItemPaddingH, normalizeSliderValue)
      setResponsiveSetting(settings, 'padding_vertical_menu_item', p.menuItemPaddingV, normalizeSliderValue)
      setResponsiveSetting(settings, 'menu_space_between', p.menuSpaceBetween, normalizeSliderValue)
      if (p.dropdownBackgroundColor) settings.background_color_dropdown_item = p.dropdownBackgroundColor
      if (p.dropdownTextColor) settings.color_dropdown_item = p.dropdownTextColor
      if (p.dropdownTextHoverColor) settings.color_dropdown_item_hover = p.dropdownTextHoverColor
      setResponsiveSetting(settings, 'dropdown_top_distance', p.dropdownTopDistance, normalizeSliderValue)
      if (p.toggleColor) settings.toggle_color = p.toggleColor
      if (p.toggleBackgroundColor) settings.toggle_background_color = p.toggleBackgroundColor
      setResponsiveSetting(settings, 'toggle_size', p.toggleSize, normalizeSliderValue)
      const hasTypography = p.fontSize || p.fontWeight || p.fontFamily || p.lineHeight || p.letterSpacing
      if (hasTypography) settings.menu_typography_typography = 'custom'
      setResponsiveSetting(settings, 'menu_typography_font_size', p.fontSize, normalizeSliderValue)
      if (p.fontWeight) settings.menu_typography_font_weight = String(p.fontWeight)
      if (p.fontFamily) settings.menu_typography_font_family = p.fontFamily
      setResponsiveSetting(settings, 'menu_typography_line_height', p.lineHeight, normalizeLineHeight)
      setResponsiveSetting(settings, 'menu_typography_letter_spacing', p.letterSpacing, normalizeSliderValue)
      break
    }

    case 'form': {
      const p = props as ElementorFormProps
      const fields = p.fields || p.formFields || []
      settings.form_name = p.formName || 'Contact Form'
      settings.form_fields = fields.map(normalizeElementorFormField) as JsonValue
      if (p.inputSize) settings.input_size = p.inputSize
      if (p.showLabels !== undefined) settings.show_labels = p.showLabels ? 'yes' : ''
      if (p.markRequired !== undefined) settings.mark_required = p.markRequired ? 'yes' : ''
      if (p.labelPosition) settings.label_position = p.labelPosition
      settings.button_text = p.buttonText || 'Send'
      if (p.buttonSize) settings.button_size = p.buttonSize
      setResponsiveSetting(settings, 'button_width', p.buttonWidth, normalizeSliderValue)
      setResponsiveSetting(settings, 'button_align', p.buttonAlign)
      if (p.buttonIcon) settings.selected_button_icon = normalizeIcon(p.buttonIcon)!
      if (p.buttonIconAlign) settings.button_icon_align = normalizeButtonIconAlign(p.buttonIconAlign)!
      if (p.buttonIconIndent !== undefined) settings.button_icon_indent = normalizeSliderValue(p.buttonIconIndent)!
      if (p.submitActions) settings.submit_actions = p.submitActions as JsonValue
      if (p.formId) settings.form_id = p.formId
      setResponsiveSetting(settings, 'column_gap', p.columnGap, normalizeSliderValue)
      setResponsiveSetting(settings, 'row_gap', p.rowGap, normalizeSliderValue)
      if (p.labelColor) settings.label_color = p.labelColor
      if (p.fieldTextColor) settings.field_text_color = p.fieldTextColor
      if (p.fieldBackgroundColor) settings.field_background_color = p.fieldBackgroundColor
      if (p.fieldBorderColor) settings.field_border_color = p.fieldBorderColor
      setResponsiveSetting(settings, 'field_border_radius', p.fieldBorderRadius, normalizeDimensions)
      if (p.buttonTextColor) settings.button_text_color = p.buttonTextColor
      if (p.buttonBackgroundColor) settings.button_background_color = p.buttonBackgroundColor
      if (p.buttonBorderColor) settings.button_border_color = p.buttonBorderColor
      if (p.buttonHoverTextColor) settings.button_hover_text_color = p.buttonHoverTextColor
      if (p.buttonHoverBackgroundColor) settings.button_hover_background_color = p.buttonHoverBackgroundColor
      setSimpleTypographySettings(settings, 'label_typography', p as Record<string, unknown>, 'label')
      setSimpleTypographySettings(settings, 'field_typography', p as Record<string, unknown>, 'field')
      setSimpleTypographySettings(settings, 'button_typography', p as Record<string, unknown>, 'button')
      break
    }

    case 'slides': {
      const p = props as SlidesProps
      settings.slides = (p.slides || []).map(normalizeSlideItem) as JsonValue
      if (p.slidesName) settings.slides_name = p.slidesName
      setResponsiveSetting(settings, 'slides_height', p.height, normalizeSliderValue)
      settings.slides_title_tag = p.titleTag || 'div'
      settings.slides_description_tag = p.descriptionTag || 'div'
      settings.navigation = p.navigation || 'both'
      if (p.autoplay !== undefined) settings.autoplay = p.autoplay ? 'yes' : ''
      if (p.pauseOnHover !== undefined) settings.pause_on_hover = p.pauseOnHover ? 'yes' : ''
      if (p.pauseOnInteraction !== undefined) settings.pause_on_interaction = p.pauseOnInteraction ? 'yes' : ''
      if (p.autoplaySpeed !== undefined) settings.autoplay_speed = p.autoplaySpeed
      if (p.infinite !== undefined) settings.infinite = p.infinite ? 'yes' : ''
      if (p.transition) settings.transition = p.transition
      if (p.transitionSpeed !== undefined) settings.transition_speed = p.transitionSpeed
      if (p.contentAnimation !== undefined) settings.content_animation = p.contentAnimation
      setResponsiveSetting(settings, 'content_max_width', p.contentMaxWidth, normalizeSliderValue)
      setResponsiveSetting(settings, 'slides_padding', p.padding, normalizeDimensions)
      setResponsiveSetting(settings, 'slides_horizontal_position', p.horizontalPosition)
      setResponsiveSetting(settings, 'slides_vertical_position', p.verticalPosition)
      setResponsiveSetting(settings, 'slides_text_align', p.textAlign)
      if (p.headingColor) settings.heading_color = p.headingColor
      if (p.descriptionColor) settings.description_color = p.descriptionColor
      setResponsiveSetting(settings, 'heading_spacing', p.headingSpacing, normalizeSliderValue)
      setResponsiveSetting(settings, 'description_spacing', p.descriptionSpacing, normalizeSliderValue)
      if (p.buttonSize) settings.button_size = p.buttonSize
      if (p.buttonTextColor) settings.button_text_color = p.buttonTextColor
      if (p.buttonBorderColor) settings.button_border_color = p.buttonBorderColor
      setResponsiveSetting(settings, 'button_border_width', p.buttonBorderWidth, normalizeSliderValue)
      setResponsiveSetting(settings, 'button_border_radius', p.buttonBorderRadius, normalizeSliderValue)
      if (p.buttonHoverTextColor) settings.button_hover_text_color = p.buttonHoverTextColor
      if (p.buttonHoverBorderColor) settings.button_hover_border_color = p.buttonHoverBorderColor
      setSimpleTypographySettings(settings, 'heading_typography', p as Record<string, unknown>, 'heading')
      setSimpleTypographySettings(settings, 'description_typography', p as Record<string, unknown>, 'description')
      break
    }
  }

  Object.assign(settings, userSettings)
  return settings
}

// =============================================================================
// DOCUMENT CONTEXT
// =============================================================================

interface DocumentContextValue {
  documentId: string;
  addElement: (element: ElementorElement, parentId?: string) => void;
  getElements: () => ElementorElement[];
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function useDocument(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentBuilder');
  }
  return context;
}

interface ElementContextValue {
  parentId: string;
}

const ElementContext = createContext<ElementContextValue | null>(null);

function useElementContext(): ElementContextValue | null {
  return useContext(ElementContext);
}

// =============================================================================
// PREVIEW HELPERS
// =============================================================================

type PreviewSettings = Record<string, any>
type ResponsiveSuffix = '' | '_tablet' | '_mobile'

function asPreviewSettings(settings: ElementorSettingsInput): PreviewSettings {
  return settings as PreviewSettings
}

const RESPONSIVE_MEDIA: Array<{ suffix: Exclude<ResponsiveSuffix, ''>; query: string }> = [
  { suffix: '_tablet', query: '@media (max-width: 1024px)' },
  { suffix: '_mobile', query: '@media (max-width: 767px)' },
]

function spacingVariables(value: unknown, prefix: 'padding' | 'margin'): Record<string, string | undefined> {
  if (!value || typeof value !== 'object') return {}
  const spacing = value as { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number; unit?: string }
  const unit = spacing.unit || 'px'
  const cssValue = (side: string | number | undefined) => side === undefined || side === '' ? undefined : `${side}${unit}`
  const top = cssValue(spacing.top)
  const right = cssValue(spacing.right)
  const bottom = cssValue(spacing.bottom)
  const left = cssValue(spacing.left)

  if (prefix === 'margin') {
    return {
      '--margin-top': top,
      '--margin-right': right,
      '--margin-bottom': bottom,
      '--margin-left': left,
    }
  }

  return {
    '--padding-top': top,
    '--padding-right': right,
    '--padding-bottom': bottom,
    '--padding-left': left,
    '--padding-block-start': top,
    '--padding-block-end': bottom,
    '--padding-inline-start': left,
    '--padding-inline-end': right,
  }
}

function mapFlexAlign(value: string | undefined): string | undefined {
  if (value === 'start') return 'flex-start'
  if (value === 'end') return 'flex-end'
  return value
}

function hasAnyProperty(properties: Record<string, string | undefined>): boolean {
  return Object.values(properties).some(value => value !== undefined && value !== '')
}

function addResponsiveRule(
  cssRules: CSSRule[],
  query: string,
  properties: Record<string, string | undefined>,
  nestedSelector?: string
) {
  if (!hasAnyProperty(properties)) return
  cssRules.push({
    selector: query,
    nestedSelector,
    properties,
  })
}

function layoutPositionProperties(
  settings: PreviewSettings,
  target: 'container' | 'widget',
  suffix: ResponsiveSuffix = ''
): Record<string, string | undefined> {
  const positionKey = target === 'widget' ? '_position' : 'position'
  const zIndexKey = target === 'widget' ? '_z_index' : 'z_index'
  const hOrientation = settings._offset_orientation_h as string | undefined
  const vOrientation = settings._offset_orientation_v as string | undefined
  const hEnd = hOrientation === 'end'
  const vEnd = vOrientation === 'end'
  const sticky = !suffix ? settings.sticky as string | undefined : undefined
  const stickyOffset = parseDimension(settings[`sticky_offset${suffix}`]) || parseDimension(settings.sticky_offset)

  return {
    position: !suffix
      ? sticky ? 'sticky' : settings[positionKey]
      : undefined,
    zIndex: settings[`${zIndexKey}${suffix}`] !== undefined ? String(settings[`${zIndexKey}${suffix}`]) : undefined,
    left: !hEnd ? parseDimension(settings[`_offset_x${suffix}`]) : undefined,
    right: hEnd ? parseDimension(settings[`_offset_x_end${suffix}`]) : undefined,
    top: sticky === 'top'
      ? stickyOffset || '0px'
      : !vEnd ? parseDimension(settings[`_offset_y${suffix}`]) : undefined,
    bottom: sticky === 'bottom'
      ? stickyOffset || '0px'
      : vEnd ? parseDimension(settings[`_offset_y_end${suffix}`]) : undefined,
  }
}

function addLayoutPositionRules(
  cssRules: CSSRule[],
  settings: PreviewSettings,
  target: 'container' | 'widget'
) {
  const base = layoutPositionProperties(settings, target)
  if (hasAnyProperty(base)) {
    cssRules.push({ selector: '', properties: base })
  }

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, layoutPositionProperties(settings, target, suffix))
  }
}

function layoutPositionClass(settings: PreviewSettings, target: 'container' | 'widget'): string | undefined {
  const position = settings[target === 'widget' ? '_position' : 'position']
  return position === 'absolute' || position === 'fixed' ? `elementor-${position}` : undefined
}

function responsiveTypography(settings: PreviewSettings, suffix: ResponsiveSuffix): Record<string, string | undefined> {
  if (!suffix) return parseTypography(settings)

  return {
    fontSize: parseDimension(settings[`typography_font_size${suffix}`]),
    lineHeight: parseDimension(settings[`typography_line_height${suffix}`]),
    letterSpacing: parseDimension(settings[`typography_letter_spacing${suffix}`]),
    wordSpacing: parseDimension(settings[`typography_word_spacing${suffix}`]),
  }
}

function responsiveTypographyForPrefix(settings: PreviewSettings, prefix: string, suffix: ResponsiveSuffix): Record<string, string | undefined> {
  if (!suffix) return parseTypography(settings, prefix)

  return {
    fontSize: parseDimension(settings[`${prefix}_font_size${suffix}`]),
    lineHeight: parseDimension(settings[`${prefix}_line_height${suffix}`]),
    letterSpacing: parseDimension(settings[`${prefix}_letter_spacing${suffix}`]),
    wordSpacing: parseDimension(settings[`${prefix}_word_spacing${suffix}`]),
  }
}

function responsiveButtonAlign(value: string | undefined): Record<string, string | undefined> {
  if (!value) return {}
  if (value === 'justify' || value === 'stretch') {
    return { '--button-width': '100%' }
  }
  return {
    textAlign: parseTextAlign(value),
    '--button-width': 'auto',
  }
}

function responsiveBorderWidth(value: unknown): string | undefined {
  return parseSpacing(value) || parseDimension(value)
}

function gapParts(settings: PreviewSettings, primary: string, fallback?: string): { gap?: string; rowGap?: string; colGap?: string } {
  const gaps = settings[primary]
  if (gaps && typeof gaps === 'object' && ('row' in gaps || 'column' in gaps)) {
    const unit = gaps.unit || 'px'
    const rowGap = gaps.row !== undefined ? `${gaps.row}${unit}` : undefined
    const colGap = gaps.column !== undefined ? `${gaps.column}${unit}` : undefined
    return {
      gap: rowGap && colGap && rowGap === colGap ? rowGap : undefined,
      rowGap,
      colGap,
    }
  }
  const gap = parseGap(gaps) || (fallback ? parseGap(settings[fallback]) : undefined)
  return { gap, rowGap: gap, colGap: gap }
}

function getContainerPreviewCSS(id: string, settings: PreviewSettings, containerType: 'grid' | 'flex'): string {
  const isGrid = containerType === 'grid'
  const isBoxed = settings.content_width === 'boxed'
  const background = parseBackground(settings, 'background')
  const backgroundHover = parseBackground(settings, 'background_hover')
  const border = parseBorder(settings, 'border')
  const borderHover = parseBorder(settings, 'border_hover')
  const padding = parseSpacing(settings.padding)
  const margin = parseSpacing(settings.margin)
  const needsPosition = settings.background_overlay_background || settings.shape_divider_top || settings.shape_divider_bottom

  const properties: Record<string, string | undefined> = {
    display: isBoxed ? 'block' : (isGrid ? 'grid' : 'flex'),
    '--display': isGrid ? 'grid' : 'flex',
    width: parseDimension(settings.width),
    height: parseDimension(settings.height),
    minHeight: parseDimension(settings.min_height),
    padding,
    margin,
    ...spacingVariables(settings.padding, 'padding'),
    ...spacingVariables(settings.margin, 'margin'),
    ...background,
    ...border,
    borderRadius: parseBorderRadius(settings.border_radius),
    boxShadow: parseBoxShadow(settings.box_shadow_box_shadow, settings, 'box_shadow'),
    zIndex: settings.z_index !== undefined ? String(settings.z_index) : undefined,
    overflow: settings.overflow,
    position: needsPosition ? 'relative' : undefined,
  }

  const cssRules: CSSRule[] = [
    { selector: '', properties },
    {
      selector: ':hover',
      properties: {
        ...backgroundHover,
        ...borderHover,
        borderRadius: parseBorderRadius(settings.border_radius_hover),
        boxShadow: parseBoxShadow(settings.box_shadow_hover_box_shadow, settings, 'box_shadow_hover'),
      },
    },
  ]

  if (isGrid) {
    const gridCols = formatGridTrack(settings.grid_columns_grid) || formatGridTrack(settings.grid_columns)
    const gridRows = formatGridTrack(settings.grid_rows_grid) || formatGridTrack(settings.grid_rows)
    const baseGap = gapParts(settings, 'grid_gaps', 'grid_gap')
    const gap = baseGap.gap
    const rowGap = baseGap.rowGap || parseDimension(settings.grid_row_gap)
    const colGap = baseGap.colGap || parseDimension(settings.grid_column_gap)
    const gapValue = gap || (rowGap && colGap ? `${rowGap} ${colGap}` : rowGap || colGap)
    const gridTarget = isBoxed ? undefined : properties

    properties.gridTemplateColumns = isBoxed ? '1fr' : gridCols
    properties.gridTemplateRows = isBoxed ? '1fr' : gridRows
    properties['--e-con-grid-template-columns'] = gridCols
    properties['--e-con-grid-template-rows'] = gridRows
    properties['--gap'] = gap
    properties['--row-gap'] = rowGap || gap
    properties['--column-gap'] = colGap || gap

    if (gridTarget) {
      gridTarget.gridAutoFlow = settings.grid_auto_flow
      gridTarget.gap = gapValue
      gridTarget.alignItems = settings.grid_align_items || settings.align_items
      gridTarget.justifyItems = settings.grid_justify_items || settings.justify_items
      gridTarget.justifyContent = settings.grid_justify_content || settings.justify_content
      gridTarget.alignContent = settings.grid_align_content || settings.align_content
    }

    if (isBoxed) {
      cssRules.push({
        selector: ' > .e-con-inner',
        properties: {
          display: 'grid',
          gridTemplateColumns: gridCols,
          gridTemplateRows: gridRows,
          gridAutoFlow: settings.grid_auto_flow,
          gap: gapValue,
          alignItems: settings.grid_align_items || settings.align_items,
          justifyItems: settings.grid_justify_items || settings.justify_items,
          justifyContent: settings.grid_justify_content || settings.justify_content,
          alignContent: settings.grid_align_content || settings.align_content,
          maxWidth: parseDimension(settings.boxed_width) || 'min(100%, var(--container-max-width, 1140px))',
          margin: '0 auto',
          width: '100%',
        },
      })
    }

    const tabletCols = formatGridTrack(settings.grid_columns_grid_tablet) || formatGridTrack(settings.grid_columns_tablet)
    const tabletRows = formatGridTrack(settings.grid_rows_grid_tablet) || formatGridTrack(settings.grid_rows_tablet)
    const mobileCols = formatGridTrack(settings.grid_columns_grid_mobile) || formatGridTrack(settings.grid_columns_mobile)
    const mobileRows = formatGridTrack(settings.grid_rows_grid_mobile) || formatGridTrack(settings.grid_rows_mobile)
    const tabletGap = gapParts(settings, 'grid_gaps_tablet', 'grid_gap_tablet')
    const mobileGap = gapParts(settings, 'grid_gaps_mobile', 'grid_gap_mobile')
    const tabletRowGap = tabletGap.rowGap || parseDimension(settings.grid_row_gap_tablet)
    const tabletColGap = tabletGap.colGap || parseDimension(settings.grid_column_gap_tablet)
    const mobileRowGap = mobileGap.rowGap || parseDimension(settings.grid_row_gap_mobile)
    const mobileColGap = mobileGap.colGap || parseDimension(settings.grid_column_gap_mobile)
    const tabletGapValue = tabletGap.gap || (tabletRowGap && tabletColGap ? `${tabletRowGap} ${tabletColGap}` : tabletRowGap || tabletColGap)
    const mobileGapValue = mobileGap.gap || (mobileRowGap && mobileColGap ? `${mobileRowGap} ${mobileColGap}` : mobileRowGap || mobileColGap)

    if (tabletCols || tabletRows || tabletGapValue || settings.grid_auto_flow_tablet || settings.grid_align_items_tablet || settings.grid_justify_items_tablet || settings.grid_justify_content_tablet || settings.grid_align_content_tablet) {
      cssRules.push({
        selector: '@media (max-width: 1024px)',
        nestedSelector: isBoxed ? ' > .e-con-inner' : undefined,
        properties: {
          gridTemplateColumns: tabletCols,
          gridTemplateRows: tabletRows,
          '--e-con-grid-template-columns': tabletCols,
          '--e-con-grid-template-rows': tabletRows,
          gridAutoFlow: settings.grid_auto_flow_tablet,
          gap: tabletGapValue,
          '--gap': tabletGap.gap,
          '--row-gap': tabletRowGap || tabletGap.gap,
          '--column-gap': tabletColGap || tabletGap.gap,
          alignItems: settings.grid_align_items_tablet,
          justifyItems: settings.grid_justify_items_tablet,
          justifyContent: settings.grid_justify_content_tablet,
          alignContent: settings.grid_align_content_tablet,
        },
      })
    }
    if (settings.padding_tablet || settings.margin_tablet || settings.width_tablet || settings.min_height_tablet) {
      cssRules.push({
        selector: '@media (max-width: 1024px)',
        properties: {
          width: parseDimension(settings.width_tablet),
          minHeight: parseDimension(settings.min_height_tablet),
          padding: parseSpacing(settings.padding_tablet),
          margin: parseSpacing(settings.margin_tablet),
          ...spacingVariables(settings.padding_tablet, 'padding'),
          ...spacingVariables(settings.margin_tablet, 'margin'),
        },
      })
    }
    if (isBoxed && settings.boxed_width_tablet) {
      addResponsiveRule(cssRules, '@media (max-width: 1024px)', {
        maxWidth: parseDimension(settings.boxed_width_tablet),
      }, ' > .e-con-inner')
    }
    if (mobileCols || mobileRows || mobileGapValue || settings.grid_auto_flow_mobile || settings.grid_align_items_mobile || settings.grid_justify_items_mobile || settings.grid_justify_content_mobile || settings.grid_align_content_mobile) {
      cssRules.push({
        selector: '@media (max-width: 767px)',
        nestedSelector: isBoxed ? ' > .e-con-inner' : undefined,
        properties: {
          gridTemplateColumns: mobileCols,
          gridTemplateRows: mobileRows,
          '--e-con-grid-template-columns': mobileCols,
          '--e-con-grid-template-rows': mobileRows,
          gridAutoFlow: settings.grid_auto_flow_mobile,
          gap: mobileGapValue,
          '--gap': mobileGap.gap,
          '--row-gap': mobileRowGap || mobileGap.gap,
          '--column-gap': mobileColGap || mobileGap.gap,
          alignItems: settings.grid_align_items_mobile,
          justifyItems: settings.grid_justify_items_mobile,
          justifyContent: settings.grid_justify_content_mobile,
          alignContent: settings.grid_align_content_mobile,
        },
      })
    }
    if (settings.padding_mobile || settings.margin_mobile || settings.width_mobile || settings.min_height_mobile) {
      cssRules.push({
        selector: '@media (max-width: 767px)',
        properties: {
          width: parseDimension(settings.width_mobile),
          minHeight: parseDimension(settings.min_height_mobile),
          padding: parseSpacing(settings.padding_mobile),
          margin: parseSpacing(settings.margin_mobile),
          ...spacingVariables(settings.padding_mobile, 'padding'),
          ...spacingVariables(settings.margin_mobile, 'margin'),
        },
      })
    }
    if (isBoxed && settings.boxed_width_mobile) {
      addResponsiveRule(cssRules, '@media (max-width: 767px)', {
        maxWidth: parseDimension(settings.boxed_width_mobile),
      }, ' > .e-con-inner')
    }
  } else {
    const { gap, rowGap, colGap } = gapParts(settings, 'flex_gap', 'gap')
    const gapValue = gap || (rowGap && colGap ? `${rowGap} ${colGap}` : rowGap || colGap)
    const flexProps: Record<string, string | undefined> = {
      flexDirection: settings.flex_direction,
      flexWrap: settings.flex_wrap,
      alignItems: mapFlexAlign(settings.align_items),
      alignContent: mapFlexAlign(settings.flex_align_content),
      justifyContent: mapFlexAlign(settings.justify_content),
      gap: gapValue,
      flexGrow: settings._flex_grow !== undefined ? String(settings._flex_grow) : undefined,
      flexShrink: settings._flex_shrink !== undefined ? String(settings._flex_shrink) : undefined,
    }

    properties['--flex-direction'] = flexProps.flexDirection
    properties['--flex-wrap'] = flexProps.flexWrap
    properties['--align-items'] = flexProps.alignItems
    properties['--align-content'] = flexProps.alignContent
    properties['--justify-content'] = flexProps.justifyContent
    properties['--gap'] = gapValue
    properties['--row-gap'] = rowGap || gap
    properties['--column-gap'] = colGap || gap

    if (!isBoxed) {
      Object.assign(properties, flexProps)
    } else {
      cssRules.push({
        selector: ' > .e-con-inner',
        properties: {
          display: 'flex',
          ...flexProps,
          maxWidth: parseDimension(settings.boxed_width) || 'min(100%, var(--container-max-width, 1140px))',
          margin: '0 auto',
          width: '100%',
        },
      })
    }

    cssRules.push({
      selector: '@media (max-width: 1024px)',
      nestedSelector: isBoxed ? ' > .e-con-inner' : undefined,
      properties: {
        flexDirection: settings.flex_direction_tablet,
        '--flex-direction': settings.flex_direction_tablet,
        flexWrap: settings.flex_wrap_tablet,
        '--flex-wrap': settings.flex_wrap_tablet,
        alignItems: mapFlexAlign(settings.align_items_tablet),
        '--align-items': mapFlexAlign(settings.align_items_tablet),
        alignContent: mapFlexAlign(settings.flex_align_content_tablet),
        '--align-content': mapFlexAlign(settings.flex_align_content_tablet),
        justifyContent: mapFlexAlign(settings.justify_content_tablet),
        '--justify-content': mapFlexAlign(settings.justify_content_tablet),
        gap: parseGap(settings.flex_gap_tablet ?? settings.gap_tablet),
        '--gap': parseGap(settings.flex_gap_tablet ?? settings.gap_tablet),
        '--row-gap': parseGap(settings.flex_gap_tablet ?? settings.gap_tablet),
        '--column-gap': parseGap(settings.flex_gap_tablet ?? settings.gap_tablet),
        flexGrow: settings._flex_grow_tablet !== undefined ? String(settings._flex_grow_tablet) : undefined,
        flexShrink: settings._flex_shrink_tablet !== undefined ? String(settings._flex_shrink_tablet) : undefined,
      },
    })
    if (settings.padding_tablet || settings.margin_tablet || settings.width_tablet || settings.min_height_tablet) {
      cssRules.push({
        selector: '@media (max-width: 1024px)',
        properties: {
          width: parseDimension(settings.width_tablet),
          minHeight: parseDimension(settings.min_height_tablet),
          padding: parseSpacing(settings.padding_tablet),
          margin: parseSpacing(settings.margin_tablet),
          ...spacingVariables(settings.padding_tablet, 'padding'),
          ...spacingVariables(settings.margin_tablet, 'margin'),
        },
      })
    }
    if (isBoxed && settings.boxed_width_tablet) {
      addResponsiveRule(cssRules, '@media (max-width: 1024px)', {
        maxWidth: parseDimension(settings.boxed_width_tablet),
      }, ' > .e-con-inner')
    }
    cssRules.push({
      selector: '@media (max-width: 767px)',
      nestedSelector: isBoxed ? ' > .e-con-inner' : undefined,
      properties: {
        flexDirection: settings.flex_direction_mobile,
        '--flex-direction': settings.flex_direction_mobile,
        flexWrap: settings.flex_wrap_mobile,
        '--flex-wrap': settings.flex_wrap_mobile,
        alignItems: mapFlexAlign(settings.align_items_mobile),
        '--align-items': mapFlexAlign(settings.align_items_mobile),
        alignContent: mapFlexAlign(settings.flex_align_content_mobile),
        '--align-content': mapFlexAlign(settings.flex_align_content_mobile),
        justifyContent: mapFlexAlign(settings.justify_content_mobile),
        '--justify-content': mapFlexAlign(settings.justify_content_mobile),
        gap: parseGap(settings.flex_gap_mobile ?? settings.gap_mobile),
        '--gap': parseGap(settings.flex_gap_mobile ?? settings.gap_mobile),
        '--row-gap': parseGap(settings.flex_gap_mobile ?? settings.gap_mobile),
        '--column-gap': parseGap(settings.flex_gap_mobile ?? settings.gap_mobile),
        flexGrow: settings._flex_grow_mobile !== undefined ? String(settings._flex_grow_mobile) : undefined,
        flexShrink: settings._flex_shrink_mobile !== undefined ? String(settings._flex_shrink_mobile) : undefined,
      },
    })
    if (settings.padding_mobile || settings.margin_mobile || settings.width_mobile || settings.min_height_mobile) {
      cssRules.push({
        selector: '@media (max-width: 767px)',
        properties: {
          width: parseDimension(settings.width_mobile),
          minHeight: parseDimension(settings.min_height_mobile),
          padding: parseSpacing(settings.padding_mobile),
          margin: parseSpacing(settings.margin_mobile),
          ...spacingVariables(settings.padding_mobile, 'padding'),
          ...spacingVariables(settings.margin_mobile, 'margin'),
        },
      })
    }
    if (isBoxed && settings.boxed_width_mobile) {
      addResponsiveRule(cssRules, '@media (max-width: 767px)', {
        maxWidth: parseDimension(settings.boxed_width_mobile),
      }, ' > .e-con-inner')
    }
  }

  if (settings.background_overlay_background) {
    cssRules.push({
      selector: '::before',
      properties: {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        pointerEvents: 'none',
        opacity: settings.background_overlay_opacity?.size !== undefined ? String(settings.background_overlay_opacity.size) : undefined,
        backgroundColor: settings.background_overlay_color,
        mixBlendMode: settings.overlay_blend_mode,
        zIndex: '0',
      },
    })
  }

  if (settings.shape_divider_top) {
    cssRules.push({
      selector: ' > .elementor-shape-top',
      properties: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: parseDimension(settings.shape_divider_top_height),
        fill: settings.shape_divider_top_color,
        transform: settings.shape_divider_top_flip === 'yes' ? 'scaleX(-1)' : undefined,
        zIndex: '1',
      },
    })
  }
  if (settings.shape_divider_bottom) {
    cssRules.push({
      selector: ' > .elementor-shape-bottom',
      properties: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: parseDimension(settings.shape_divider_bottom_height),
        fill: settings.shape_divider_bottom_color,
        transform: settings.shape_divider_bottom_flip === 'yes' ? 'scaleX(-1) rotate(180deg)' : 'rotate(180deg)',
        zIndex: '1',
      },
    })
  }

  addLayoutPositionRules(cssRules, settings, 'container')

  return generateCSS(id, cssRules)
}

function getHeadingCSS(id: string, settings: PreviewSettings): string {
  const typographyEnabled = settings.typography_typography === 'custom'
  const typography = typographyEnabled ? parseTypography(settings) : {}
  const cssRules: CSSRule[] = [
    {
      selector: '',
      properties: {
        textAlign: parseTextAlign(settings.align),
      },
    },
    {
      selector: '.elementor-heading-title',
      properties: {
        fontFamily: typography.fontFamily,
        fontWeight: typography.fontWeight,
        color: settings.title_color,
        fontSize: typography.fontSize,
        fontStyle: typography.fontStyle,
        textTransform: typography.textTransform,
        textDecoration: typography.textDecoration,
        lineHeight: typography.lineHeight,
        letterSpacing: typography.letterSpacing,
        wordSpacing: typography.wordSpacing,
        textShadow: parseTextShadow(settings.text_shadow_text_shadow, settings, 'text_shadow'),
        ...parseTextStroke(settings, 'stroke'),
        mixBlendMode: settings.blend_mode && settings.blend_mode !== 'normal' ? settings.blend_mode : undefined,
        transitionDuration: settings.hover_transition_duration ? parseDimension(settings.hover_transition_duration, 'ms') : undefined,
        transitionProperty: settings.title_hover_color || settings.hover_title_color ? 'color' : undefined,
      },
    },
    {
      selector: '.elementor-heading-title:hover',
      properties: {
        color: settings.title_hover_color || settings.hover_title_color,
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      textAlign: parseTextAlign(settings[`align${suffix}`]),
    })
    addResponsiveRule(cssRules, query, responsiveTypography(settings, suffix), ' .elementor-heading-title')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getTextEditorCSS(id: string, settings: PreviewSettings): string {
  const typography = settings.typography_typography === 'custom' ? parseTypography(settings) : {}
  const cssRules: CSSRule[] = [
    {
      selector: '',
      properties: {
        textAlign: parseTextAlign(settings.align),
        color: settings.text_color,
        columns: settings.text_columns,
        columnGap: parseDimension(settings.column_gap),
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        fontStyle: typography.fontStyle,
        textTransform: typography.textTransform,
        textDecoration: typography.textDecoration,
        lineHeight: typography.lineHeight,
        letterSpacing: typography.letterSpacing,
        wordSpacing: typography.wordSpacing,
        textShadow: parseTextShadow(settings.text_shadow_text_shadow),
      },
    },
    {
      selector: 'a',
      properties: { color: settings.link_color },
    },
    {
      selector: 'a:hover, a:focus',
      properties: { color: settings.link_hover_color },
    },
    {
      selector: 'p',
      properties: settings.paragraph_spacing !== undefined
        ? {
            marginBlockStart: '0',
            marginBlockEnd: parseDimension(settings.paragraph_spacing),
          }
        : {},
    },
  ]

  if (settings.drop_cap === 'yes') {
    if (settings.drop_cap_view === 'stacked') {
      cssRules.push(
        {
          selector: '.elementor-drop-cap',
          properties: {
            backgroundColor: settings.drop_cap_primary_color,
            padding: parseDimension(settings.drop_cap_size),
            marginInlineEnd: parseDimension(settings.drop_cap_space),
            borderRadius: parseDimension(settings.drop_cap_border_radius),
          },
        },
        {
          selector: '.elementor-drop-cap-letter',
          properties: {
            color: settings.drop_cap_secondary_color,
          },
        },
      )
    } else if (settings.drop_cap_view === 'framed') {
      cssRules.push({
        selector: '.elementor-drop-cap',
        properties: {
          color: settings.drop_cap_primary_color,
          borderColor: settings.drop_cap_primary_color,
          backgroundColor: settings.drop_cap_secondary_color,
          padding: parseDimension(settings.drop_cap_size),
          marginInlineEnd: parseDimension(settings.drop_cap_space),
          borderRadius: parseDimension(settings.drop_cap_border_radius),
        },
      })
    } else {
      cssRules.push({
        selector: '.elementor-drop-cap',
        properties: {
          color: settings.drop_cap_primary_color,
          marginInlineEnd: parseDimension(settings.drop_cap_space),
        },
      })
    }
  }

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      textAlign: parseTextAlign(settings[`align${suffix}`]),
      ...responsiveTypography(settings, suffix),
    })
  }

  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getButtonCSS(id: string, settings: PreviewSettings): string {
  const background = parseBackground(settings, 'background')
  const hoverBackground = parseBackground(settings, 'button_background_hover')
  const buttonBackgroundColor = background.backgroundColor || settings.background_color
  const hoverBackgroundColor =
    hoverBackground.backgroundColor ||
    settings.button_background_hover_color ||
    settings.hover_background_color
  const cssRules: CSSRule[] = [
    {
      selector: '',
      properties: responsiveButtonAlign(settings.align),
    },
    {
      selector: '.elementor-button',
      properties: {
        width: 'var(--button-width, auto)',
        '--button-text-color': settings.button_text_color,
        '--button-background-color': buttonBackgroundColor,
        color: settings.button_text_color,
        fill: settings.button_text_color,
        ...background,
        ...(settings.background_color && !background.backgroundColor ? { backgroundColor: settings.background_color } : {}),
        ...parseTypography(settings),
        padding: parseSpacing(settings.text_padding),
        borderRadius: parseBorderRadius(settings.border_radius),
        ...parseBorder(settings, 'border'),
        boxShadow: parseBoxShadow(settings.button_box_shadow_box_shadow, settings, 'button_box_shadow'),
        textShadow: parseTextShadow(settings.text_shadow_text_shadow, settings, 'text_shadow'),
        transitionDuration: parseDimension(settings.button_hover_transition_duration, 's'),
      },
    },
    {
      selector: '.elementor-button:hover, .elementor-button:focus',
      properties: {
        '--hover-color': settings.hover_color,
        '--hover-background-color': hoverBackgroundColor,
        color: settings.hover_color,
        ...hoverBackground,
        ...(settings.button_background_hover_color && !hoverBackground.backgroundColor
          ? { backgroundColor: settings.button_background_hover_color }
          : {}),
        ...(settings.hover_background_color && !hoverBackground.backgroundColor && !settings.button_background_hover_color
          ? { backgroundColor: settings.hover_background_color }
          : {}),
        borderColor: settings.button_hover_border_color,
        boxShadow: parseBoxShadow(settings.button_hover_box_shadow_box_shadow, settings, 'button_hover_box_shadow'),
      },
    },
    {
      selector: '.elementor-button:hover svg, .elementor-button:focus svg',
      properties: { fill: settings.hover_color },
    },
    {
      selector: '.elementor-button-content-wrapper',
      properties: (() => {
        if (!settings.selected_icon?.value || !settings.text || !settings.icon_align) return {}
        return { flexDirection: settings.icon_align === 'row-reverse' || settings.icon_align === 'right' ? 'row-reverse' : 'row' }
      })(),
    },
    {
      selector: '.elementor-button .elementor-button-content-wrapper',
      properties: { gap: parseDimension(settings.icon_indent) },
    },
    {
      selector: '.elementor-button-icon',
      properties: { fontSize: parseDimension(settings.icon_size) },
    },
    {
      selector: '.elementor-button-icon i',
      properties: { color: settings.icon_color },
    },
    {
      selector: '.elementor-button-icon svg',
      properties: {
        fill: settings.icon_color,
        width: parseDimension(settings.icon_size),
        height: parseDimension(settings.icon_size),
      },
    },
    {
      selector: '.elementor-button:hover .elementor-button-icon i, .elementor-button:focus .elementor-button-icon i',
      properties: { color: settings.icon_hover_color },
    },
    {
      selector: '.elementor-button:hover .elementor-button-icon svg, .elementor-button:focus .elementor-button-icon svg',
      properties: { fill: settings.icon_hover_color },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    const alignProps = responsiveButtonAlign(settings[`align${suffix}`])
    addResponsiveRule(cssRules, query, alignProps)
    addResponsiveRule(cssRules, query, {
      width: alignProps['--button-width'],
      ...responsiveTypography(settings, suffix),
      padding: parseSpacing(settings[`text_padding${suffix}`]),
      borderRadius: parseBorderRadius(settings[`border_radius${suffix}`]),
      borderWidth: responsiveBorderWidth(settings[`border_width${suffix}`]),
    }, ' .elementor-button')
    addResponsiveRule(cssRules, query, {
      justifyContent: settings[`content_align${suffix}`],
    }, ' .elementor-button .elementor-button-content-wrapper')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getIconCSS(id: string, settings: PreviewSettings): string {
  const view = settings.view as string | undefined
  const shape = settings.shape as string | undefined
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-icon-wrapper',
      properties: { textAlign: settings.align },
    },
    {
      selector: '.elementor-icon',
      properties: {
        fontSize: parseDimension(settings.size),
        padding: view && view !== 'default' ? parseDimension(settings.icon_padding) : undefined,
        borderRadius: view && view !== 'default'
          ? parseSpacing(settings.border_radius) || (shape === 'circle' ? '50%' : shape === 'square' ? '0' : undefined)
          : undefined,
      },
    },
    {
      selector: '.elementor-icon i, .elementor-icon svg',
      properties: {
        transform: settings.rotate?.size ? `rotate(${settings.rotate.size}${settings.rotate.unit || 'deg'})` : undefined,
      },
    },
  ]

  if (settings.size) {
    cssRules.push({
      selector: '.elementor-icon svg',
      properties: {
        height: parseDimension(settings.size),
        width: parseDimension(settings.size),
      },
    })
  }

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    const rotate = settings[`rotate${suffix}`]
    addResponsiveRule(cssRules, query, {
      textAlign: settings[`align${suffix}`],
    }, ' .elementor-icon-wrapper')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`size${suffix}`]),
    }, ' .elementor-icon')
    const iconMediaProps = {
      width: parseDimension(settings[`size${suffix}`]),
      height: parseDimension(settings[`size${suffix}`]),
      transform: rotate?.size !== undefined ? `rotate(${rotate.size}${rotate.unit || 'deg'})` : undefined,
    }
    addResponsiveRule(cssRules, query, iconMediaProps, ' .elementor-icon i')
    addResponsiveRule(cssRules, query, iconMediaProps, ' .elementor-icon svg')
  }

  if (settings.fit_to_size === 'yes') {
    cssRules.push(
      {
        selector: '.elementor-icon i',
        properties: {
          width: '100%',
          height: '100%',
        },
      },
      {
        selector: '.elementor-icon svg',
        properties: {
          width: '100%',
          height: '100%',
        },
      },
    )
  }

  if (view === 'stacked') {
    cssRules.push(
      {
        selector: '.elementor-icon',
        properties: {
          backgroundColor: settings.primary_color,
          color: settings.secondary_color,
          fill: settings.secondary_color,
        },
      },
      {
        selector: '.elementor-icon svg',
        properties: {
          fill: settings.secondary_color,
        },
      },
      {
        selector: '.elementor-icon:hover',
        properties: {
          backgroundColor: settings.hover_primary_color,
          color: settings.hover_secondary_color,
          fill: settings.hover_secondary_color,
        },
      },
      {
        selector: '.elementor-icon:hover svg',
        properties: {
          fill: settings.hover_secondary_color,
        },
      },
    )
  } else if (view === 'framed') {
    cssRules.push(
      {
        selector: '.elementor-icon',
        properties: {
          color: settings.primary_color,
          fill: settings.primary_color,
          borderColor: settings.primary_color,
          borderStyle: settings.border_width ? 'solid' : undefined,
          borderWidth: parseSpacing(settings.border_width),
          backgroundColor: settings.secondary_color,
        },
      },
      {
        selector: '.elementor-icon svg',
        properties: {
          fill: settings.primary_color,
        },
      },
      {
        selector: '.elementor-icon:hover',
        properties: {
          color: settings.hover_primary_color,
          fill: settings.hover_primary_color,
          borderColor: settings.hover_primary_color,
          backgroundColor: settings.hover_secondary_color,
        },
      },
      {
        selector: '.elementor-icon:hover svg',
        properties: {
          fill: settings.hover_primary_color,
        },
      },
    )
  } else {
    cssRules.push(
      {
        selector: '.elementor-icon',
        properties: {
          color: settings.primary_color,
          fill: settings.primary_color,
        },
      },
      {
        selector: '.elementor-icon svg',
        properties: {
          fill: settings.primary_color,
        },
      },
      {
        selector: '.elementor-icon:hover',
        properties: {
          color: settings.hover_primary_color,
          fill: settings.hover_primary_color,
        },
      },
      {
        selector: '.elementor-icon:hover svg',
        properties: {
          fill: settings.hover_primary_color,
        },
      },
    )
  }

  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function iconBoxFlexDirection(position: unknown): string | undefined {
  if (position === 'inline-start') return 'row'
  if (position === 'inline-end') return 'row-reverse'
  if (position === 'block-end') return 'column-reverse'
  return 'column'
}

function boxVerticalAlign(value: unknown): string | undefined {
  if (value === 'top') return 'flex-start'
  if (value === 'middle') return 'center'
  if (value === 'bottom') return 'flex-end'
  return undefined
}

function getIconBoxCSS(id: string, settings: PreviewSettings): string {
  const view = settings.view as string | undefined
  const shape = settings.shape as string | undefined
  const titleTypography = parseTypography(settings, 'title_typography')
  const descriptionTypography = parseTypography(settings, 'description_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-icon-box-wrapper',
      properties: {
        display: 'flex',
        flexDirection: iconBoxFlexDirection(settings.position),
        alignItems: boxVerticalAlign(settings.content_vertical_alignment),
        gap: parseDimension(settings.icon_space),
        textAlign: parseTextAlign(settings.text_align),
      },
    },
    {
      selector: '.elementor-icon',
      properties: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: parseDimension(settings.icon_size),
        padding: view && view !== 'default' ? parseDimension(settings.icon_padding) : undefined,
        borderStyle: view === 'framed' ? 'solid' : undefined,
        borderWidth: view === 'framed' ? parseSpacing(settings.border_width) : undefined,
        borderRadius: view && view !== 'default'
          ? parseBorderRadius(settings.border_radius) || (shape === 'circle' ? '50%' : shape === 'square' ? '0' : undefined)
          : undefined,
      },
    },
    {
      selector: '.elementor-icon i, .elementor-icon svg',
      properties: {
        transform: settings.rotate?.size ? `rotate(${settings.rotate.size}${settings.rotate.unit || 'deg'})` : undefined,
      },
    },
    {
      selector: '.elementor-icon svg',
      properties: {
        width: parseDimension(settings.icon_size),
        height: parseDimension(settings.icon_size),
      },
    },
    {
      selector: '.elementor-icon-box-title',
      properties: {
        marginBlockEnd: parseDimension(settings.title_bottom_space),
        color: settings.title_color,
        transitionDuration: settings.hover_title_color_transition_duration?.size !== undefined
          ? `${settings.hover_title_color_transition_duration.size}${settings.hover_title_color_transition_duration.unit || 's'}`
          : undefined,
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize,
        fontWeight: titleTypography.fontWeight,
        fontStyle: titleTypography.fontStyle,
        textTransform: titleTypography.textTransform,
        textDecoration: titleTypography.textDecoration,
        lineHeight: titleTypography.lineHeight,
        letterSpacing: titleTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
        ...parseTextStroke(settings, 'text_stroke'),
      },
    },
    {
      selector: ':hover .elementor-icon-box-title, :focus-within .elementor-icon-box-title',
      properties: { color: settings.hover_title_color },
    },
    {
      selector: '.elementor-icon-box-description',
      properties: {
        color: settings.description_color,
        margin: '0',
        fontFamily: descriptionTypography.fontFamily,
        fontSize: descriptionTypography.fontSize,
        fontWeight: descriptionTypography.fontWeight,
        fontStyle: descriptionTypography.fontStyle,
        textTransform: descriptionTypography.textTransform,
        textDecoration: descriptionTypography.textDecoration,
        lineHeight: descriptionTypography.lineHeight,
        letterSpacing: descriptionTypography.letterSpacing,
        textShadow: parseTextShadow(settings.description_shadow_text_shadow, settings, 'description_shadow'),
      },
    },
  ]

  const primaryColorRules = view === 'stacked'
    ? { backgroundColor: settings.primary_color, color: settings.secondary_color, fill: settings.secondary_color }
    : { color: settings.primary_color, fill: settings.primary_color, borderColor: settings.primary_color, backgroundColor: view === 'framed' ? settings.secondary_color : undefined }
  const primaryHoverRules = view === 'stacked'
    ? { backgroundColor: settings.hover_primary_color, color: settings.hover_secondary_color, fill: settings.hover_secondary_color }
    : { color: settings.hover_primary_color, fill: settings.hover_primary_color, borderColor: settings.hover_primary_color, backgroundColor: view === 'framed' ? settings.hover_secondary_color : undefined }
  cssRules.push(
    { selector: '.elementor-icon', properties: primaryColorRules },
    {
      selector: ':hover .elementor-icon, :focus-within .elementor-icon',
      properties: {
        ...primaryHoverRules,
        transitionDuration: settings.hover_icon_colors_transition_duration?.size !== undefined
          ? `${settings.hover_icon_colors_transition_duration.size}${settings.hover_icon_colors_transition_duration.unit || 's'}`
          : undefined,
      },
    }
  )

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      flexDirection: iconBoxFlexDirection(settings[`position${suffix}`]),
      alignItems: boxVerticalAlign(settings[`content_vertical_alignment${suffix}`]),
      gap: parseDimension(settings[`icon_space${suffix}`]),
      textAlign: parseTextAlign(settings[`text_align${suffix}`]),
    }, ' .elementor-icon-box-wrapper')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`icon_size${suffix}`]),
      padding: parseDimension(settings[`icon_padding${suffix}`]),
      borderWidth: parseSpacing(settings[`border_width${suffix}`]),
      borderRadius: parseBorderRadius(settings[`border_radius${suffix}`]),
    }, ' .elementor-icon')
    addResponsiveRule(cssRules, query, {
      width: parseDimension(settings[`icon_size${suffix}`]),
      height: parseDimension(settings[`icon_size${suffix}`]),
    }, ' .elementor-icon svg')
    const rotate = settings[`rotate${suffix}`]
    addResponsiveRule(cssRules, query, {
      transform: rotate?.size ? `rotate(${rotate.size}${rotate.unit || 'deg'})` : undefined,
    }, ' .elementor-icon i, .elementor-icon svg')
    addResponsiveRule(cssRules, query, {
      marginBlockEnd: parseDimension(settings[`title_bottom_space${suffix}`]),
      ...responsiveTypographyForPrefix(settings, 'title_typography', suffix),
    }, ' .elementor-icon-box-title')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'description_typography', suffix), ' .elementor-icon-box-description')
  }

  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getIconListCSS(id: string, settings: PreviewSettings): string {
  const typography = parseTypography(settings, 'icon_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '',
      properties: {
        '--e-icon-list-icon-size': parseDimension(settings.icon_size),
        '--e-icon-list-icon-margin': parseDimension(settings.text_indent),
        '--e-icon-list-icon-align': settings.icon_self_align,
        '--e-icon-list-icon-vertical-align': settings.icon_self_vertical_align,
        '--icon-vertical-align': settings.icon_self_vertical_align,
        '--icon-vertical-offset': parseDimension(settings.icon_vertical_offset),
      },
    },
    {
      selector: '.elementor-icon-list-items',
      properties: {
        margin: '0',
        padding: '0',
        listStyleType: 'none',
      },
    },
    {
      selector: '.elementor-icon-list-item',
      properties: {
        display: 'flex',
        alignItems: 'var(--icon-vertical-align, center)',
        position: 'relative',
      },
    },
    {
      selector: '.elementor-icon-list-item > a',
      properties: {
        display: 'flex',
        alignItems: 'var(--icon-vertical-align, center)',
        width: settings.link_click === 'inline' ? 'fit-content' : '100%',
      },
    },
    {
      selector: '.elementor-icon-list-icon',
      properties: {
        display: 'inline-flex',
        position: settings.icon_vertical_offset ? 'relative' : undefined,
        top: parseDimension(settings.icon_vertical_offset),
        paddingInlineEnd: parseDimension(settings.text_indent),
        textAlign: settings.icon_self_align,
        alignSelf: settings.icon_self_vertical_align,
        color: settings.icon_color,
      },
    },
    {
      selector: '.elementor-icon-list-icon i',
      properties: {
        color: settings.icon_color,
        fontSize: parseDimension(settings.icon_size) || 'var(--e-icon-list-icon-size, 14px)',
        transition: settings.icon_color_hover_transition ? `color ${parseDimension(settings.icon_color_hover_transition, 's')}` : undefined,
      },
    },
    {
      selector: '.elementor-icon-list-icon svg',
      properties: {
        fill: settings.icon_color,
        width: parseDimension(settings.icon_size) || 'var(--e-icon-list-icon-size, 14px)',
        height: parseDimension(settings.icon_size) || 'var(--e-icon-list-icon-size, 14px)',
        transition: settings.icon_color_hover_transition ? `fill ${parseDimension(settings.icon_color_hover_transition, 's')}` : undefined,
      },
    },
    {
      selector: '.elementor-icon-list-text',
      properties: {
        color: settings.text_color,
        ...typography,
        textShadow: parseTextShadow(settings.text_shadow_text_shadow, settings, 'text_shadow'),
        transition: settings.text_color_hover_transition ? `color ${parseDimension(settings.text_color_hover_transition, 's')}` : undefined,
      },
    },
    {
      selector: '.elementor-icon-list-item:hover .elementor-icon-list-icon i',
      properties: { color: settings.icon_color_hover },
    },
    {
      selector: '.elementor-icon-list-item:hover .elementor-icon-list-icon svg',
      properties: { fill: settings.icon_color_hover },
    },
    {
      selector: '.elementor-icon-list-item:hover .elementor-icon-list-text',
      properties: { color: settings.text_color_hover },
    },
  ]

  const spaceBetween = parseDimension(settings.space_between)
  if (spaceBetween) {
    cssRules.push(
      {
        selector: '.elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child)',
        properties: { paddingBlockEnd: `calc(${spaceBetween}/2)` },
      },
      {
        selector: '.elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:first-child)',
        properties: { marginBlockStart: `calc(${spaceBetween}/2)` },
      },
      {
        selector: '.elementor-icon-list-items.elementor-inline-items',
        properties: { marginInline: `calc(-${spaceBetween}/2)` },
      },
      {
        selector: '.elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item',
        properties: { marginInline: `calc(${spaceBetween}/2)` },
      },
    )
  }

  if (settings.divider === 'yes') {
    const dividerWeight = parseDimension(settings.divider_weight) || '1px'
    cssRules.push(
      {
        selector: '.elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child)',
        properties: {
          borderBlockEndStyle: settings.divider_style || 'solid',
          borderBlockEndWidth: dividerWeight,
          borderBlockEndColor: settings.divider_color || '#ddd',
        },
      },
      {
        selector: '.elementor-icon-list-items:not(.elementor-inline-items) .elementor-icon-list-item:not(:last-child)',
        properties: {
          width: parseDimension(settings.divider_width),
        },
      },
      {
        selector: '.elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:not(:last-child)',
        properties: {
          borderInlineEndStyle: settings.divider_style || 'solid',
          borderInlineEndWidth: dividerWeight,
          borderInlineEndColor: settings.divider_color || '#ddd',
          minHeight: parseDimension(settings.divider_height),
        },
      },
    )
  }

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      '--e-icon-list-icon-size': parseDimension(settings[`icon_size${suffix}`]),
      '--e-icon-list-icon-align': settings[`icon_self_align${suffix}`],
      '--e-icon-list-icon-vertical-align': settings[`icon_self_vertical_align${suffix}`],
      '--icon-vertical-align': settings[`icon_self_vertical_align${suffix}`],
      '--icon-vertical-offset': parseDimension(settings[`icon_vertical_offset${suffix}`]),
    })
    addResponsiveRule(cssRules, query, {
      justifyContent: settings[`icon_align${suffix}`],
    }, ' .elementor-icon-list-items')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`icon_size${suffix}`]),
      top: parseDimension(settings[`icon_vertical_offset${suffix}`]),
      textAlign: settings[`icon_self_align${suffix}`],
      alignSelf: settings[`icon_self_vertical_align${suffix}`],
    }, ' .elementor-icon-list-icon')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`icon_size${suffix}`]),
    }, ' .elementor-icon-list-icon i')
    addResponsiveRule(cssRules, query, {
      width: parseDimension(settings[`icon_size${suffix}`]),
      height: parseDimension(settings[`icon_size${suffix}`]),
    }, ' .elementor-icon-list-icon svg')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'icon_typography', suffix), ' .elementor-icon-list-text')
  }

  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function previewSizeValue(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'size' in value) {
    const size = Number((value as { size?: unknown }).size)
    return Number.isFinite(size) ? size : undefined
  }
  const size = Number(value)
  return Number.isFinite(size) ? size : undefined
}

function buildImageFilter(settings: PreviewSettings, prefix: string): string | undefined {
  const filters: string[] = []
  const brightness = previewSizeValue(settings[`${prefix}_brightness`])
  const contrast = previewSizeValue(settings[`${prefix}_contrast`])
  const saturate = previewSizeValue(settings[`${prefix}_saturate`])
  const blur = previewSizeValue(settings[`${prefix}_blur`])
  const hue = previewSizeValue(settings[`${prefix}_hue`])

  if (brightness !== undefined) filters.push(`brightness( ${brightness}% )`)
  if (contrast !== undefined) filters.push(`contrast( ${contrast}% )`)
  if (saturate !== undefined) filters.push(`saturate( ${saturate}% )`)
  if (blur !== undefined) filters.push(`blur( ${blur}px )`)
  if (hue !== undefined) filters.push(`hue-rotate( ${hue}deg )`)

  return filters.length > 0 ? filters.join(' ') : undefined
}

function imageBoxFlexDirection(position: unknown): string | undefined {
  if (position === 'left') return 'row'
  if (position === 'right') return 'row-reverse'
  return 'column'
}

function getImageBoxCSS(id: string, settings: PreviewSettings): string {
  const titleTypography = parseTypography(settings, 'title_typography')
  const descriptionTypography = parseTypography(settings, 'description_typography')
  const border = parseBorder(settings, 'image_border')
  const cssFilter = settings.css_filters_css_filter === 'custom'
    ? buildImageFilter(settings, 'css_filters')
    : undefined
  const cssFilterHover = settings.css_filters_hover_css_filter === 'custom'
    ? buildImageFilter(settings, 'css_filters_hover')
    : undefined
  const transitionDuration = previewSizeValue(settings.background_hover_transition)
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-image-box-wrapper',
      properties: {
        display: 'flex',
        flexDirection: imageBoxFlexDirection(settings.position),
        alignItems: boxVerticalAlign(settings.content_vertical_alignment),
        textAlign: parseTextAlign(settings.text_align),
      },
    },
    {
      selector: '.elementor-image-box-img',
      properties: {
        width: parseDimension(settings.image_size),
        marginBottom: settings.position === 'top' || !settings.position ? parseDimension(settings.image_space) : undefined,
        marginRight: settings.position === 'left' ? parseDimension(settings.image_space) : undefined,
        marginLeft: settings.position === 'right' ? parseDimension(settings.image_space) : undefined,
      },
    },
    {
      selector: '.elementor-image-box-img img',
      properties: {
        display: 'block',
        width: '100%',
        height: parseDimension(settings.image_height),
        objectFit: settings.image_object_fit,
        objectPosition: settings.image_object_position,
        borderRadius: parseDimension(settings.image_border_radius),
        borderStyle: border.borderStyle,
        borderWidth: border.borderWidth,
        borderColor: border.borderColor,
        boxShadow: parseBoxShadow(settings.image_box_shadow_box_shadow, settings, 'image_box_shadow'),
        filter: cssFilter,
        opacity: settings.image_opacity?.size !== undefined ? String(settings.image_opacity.size) : undefined,
        transitionDuration: transitionDuration !== undefined ? `${transitionDuration}s` : undefined,
      },
    },
    {
      selector: ':hover .elementor-image-box-img img, :focus-within .elementor-image-box-img img',
      properties: {
        filter: cssFilterHover,
        opacity: settings.image_opacity_hover?.size !== undefined ? String(settings.image_opacity_hover.size) : undefined,
      },
    },
    {
      selector: '.elementor-image-box-title',
      properties: {
        marginBottom: parseDimension(settings.title_bottom_space),
        color: settings.title_color,
        transitionDuration: settings.hover_title_color_transition_duration?.size !== undefined
          ? `${settings.hover_title_color_transition_duration.size}${settings.hover_title_color_transition_duration.unit || 's'}`
          : undefined,
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize,
        fontWeight: titleTypography.fontWeight,
        fontStyle: titleTypography.fontStyle,
        textTransform: titleTypography.textTransform,
        textDecoration: titleTypography.textDecoration,
        lineHeight: titleTypography.lineHeight,
        letterSpacing: titleTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
        ...parseTextStroke(settings, 'title_stroke'),
      },
    },
    {
      selector: ':hover .elementor-image-box-title, :focus-within .elementor-image-box-title',
      properties: { color: settings.hover_title_color },
    },
    {
      selector: '.elementor-image-box-description',
      properties: {
        color: settings.description_color,
        margin: '0',
        fontFamily: descriptionTypography.fontFamily,
        fontSize: descriptionTypography.fontSize,
        fontWeight: descriptionTypography.fontWeight,
        fontStyle: descriptionTypography.fontStyle,
        textTransform: descriptionTypography.textTransform,
        textDecoration: descriptionTypography.textDecoration,
        lineHeight: descriptionTypography.lineHeight,
        letterSpacing: descriptionTypography.letterSpacing,
        textShadow: parseTextShadow(settings.description_shadow_text_shadow, settings, 'description_shadow'),
      },
    },
  ]

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      flexDirection: imageBoxFlexDirection(settings[`position${suffix}`]),
      alignItems: boxVerticalAlign(settings[`content_vertical_alignment${suffix}`]),
      textAlign: parseTextAlign(settings[`text_align${suffix}`]),
    }, ' .elementor-image-box-wrapper')
    const responsivePosition = settings[`position${suffix}`]
    addResponsiveRule(cssRules, query, {
      width: parseDimension(settings[`image_size${suffix}`]),
      marginBottom: responsivePosition === 'top' ? parseDimension(settings[`image_space${suffix}`]) : undefined,
      marginRight: responsivePosition === 'left' ? parseDimension(settings[`image_space${suffix}`]) : undefined,
      marginLeft: responsivePosition === 'right' ? parseDimension(settings[`image_space${suffix}`]) : undefined,
    }, ' .elementor-image-box-img')
    addResponsiveRule(cssRules, query, {
      height: parseDimension(settings[`image_height${suffix}`]),
      objectFit: settings[`image_object_fit${suffix}`],
      objectPosition: settings[`image_object_position${suffix}`],
      borderWidth: parseSpacing(settings[`image_border_width${suffix}`]),
      borderRadius: parseDimension(settings[`image_border_radius${suffix}`]),
    }, ' .elementor-image-box-img img')
    addResponsiveRule(cssRules, query, {
      marginBottom: parseDimension(settings[`title_bottom_space${suffix}`]),
      ...responsiveTypographyForPrefix(settings, 'title_typography', suffix),
    }, ' .elementor-image-box-title')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'description_typography', suffix), ' .elementor-image-box-description')
  }

  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getAccordionCSS(id: string, settings: PreviewSettings): string {
  const titleTypography = parseTypography(settings, 'title_typography')
  const contentTypography = parseTypography(settings, 'content_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-accordion-item',
      properties: {
        borderStyle: settings.border_width ? 'solid' : undefined,
        borderWidth: parseDimension(settings.border_width),
        borderColor: settings.border_color,
      },
    },
    {
      selector: '.elementor-tab-title',
      properties: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: settings.title_background,
        padding: parseSpacing(settings.title_padding),
      },
    },
    {
      selector: '.elementor-accordion-title, .elementor-accordion-icon',
      properties: {
        color: settings.title_color,
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize,
        fontWeight: titleTypography.fontWeight,
        lineHeight: titleTypography.lineHeight,
        letterSpacing: titleTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
        ...parseTextStroke(settings, 'text_stroke'),
      },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-accordion-title, .elementor-tab-title.elementor-active .elementor-accordion-icon',
      properties: { color: settings.tab_active_color },
    },
    {
      selector: '.elementor-accordion-icon',
      properties: {
        display: 'inline-block',
        width: '1.5em',
        color: settings.icon_color,
      },
    },
    {
      selector: '.elementor-accordion-icon svg',
      properties: {
        height: '1em',
        width: '1em',
      },
    },
    {
      selector: '.elementor-accordion-icon-left',
      properties: {
        marginInlineEnd: parseDimension(settings.icon_space),
        textAlign: 'left',
      },
    },
    {
      selector: '.elementor-accordion-icon-right',
      properties: {
        marginInlineStart: parseDimension(settings.icon_space),
        order: '2',
        textAlign: 'right',
      },
    },
    {
      selector: '.elementor-accordion-icon-opened',
      properties: {
        display: 'none',
      },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-accordion-icon-closed',
      properties: {
        display: 'none',
      },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-accordion-icon-opened',
      properties: {
        display: 'block',
      },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-accordion-icon',
      properties: { color: settings.icon_active_color },
    },
    {
      selector: '.elementor-tab-content',
      properties: {
        backgroundColor: settings.content_background_color,
        color: settings.content_color,
        padding: parseSpacing(settings.content_padding),
        fontFamily: contentTypography.fontFamily,
        fontSize: contentTypography.fontSize,
        fontWeight: contentTypography.fontWeight,
        lineHeight: contentTypography.lineHeight,
        letterSpacing: contentTypography.letterSpacing,
        textShadow: parseTextShadow(settings.content_shadow_text_shadow, settings, 'content_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, { padding: parseSpacing(settings[`title_padding${suffix}`]) }, ' .elementor-tab-title')
    addResponsiveRule(cssRules, query, { marginInlineEnd: parseDimension(settings[`icon_space${suffix}`]) }, ' .elementor-accordion-icon-left')
    addResponsiveRule(cssRules, query, { marginInlineStart: parseDimension(settings[`icon_space${suffix}`]) }, ' .elementor-accordion-icon-right')
    addResponsiveRule(cssRules, query, { padding: parseSpacing(settings[`content_padding${suffix}`]) }, ' .elementor-tab-content')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'title_typography', suffix), ' .elementor-accordion-title, .elementor-accordion-icon')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'content_typography', suffix), ' .elementor-tab-content')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getToggleCSS(id: string, settings: PreviewSettings): string {
  const titleTypography = parseTypography(settings, 'title_typography')
  const contentTypography = parseTypography(settings, 'content_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-toggle-item',
      properties: {
        borderStyle: settings.border_width ? 'solid' : undefined,
        borderWidth: parseDimension(settings.border_width),
        borderColor: settings.border_color,
        marginBlockEnd: parseDimension(settings.space_between),
        boxShadow: parseBoxShadow(settings.box_shadow_box_shadow, settings, 'box_shadow'),
      },
    },
    {
      selector: '.elementor-tab-title',
      properties: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: settings.title_background,
        padding: parseSpacing(settings.title_padding),
      },
    },
    {
      selector: '.elementor-toggle-title, .elementor-toggle-icon',
      properties: {
        color: settings.title_color,
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize,
        fontWeight: titleTypography.fontWeight,
        lineHeight: titleTypography.lineHeight,
        letterSpacing: titleTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
        ...parseTextStroke(settings, 'text_stroke'),
      },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-toggle-title, .elementor-tab-title.elementor-active .elementor-toggle-icon',
      properties: { color: settings.tab_active_color },
    },
    {
      selector: '.elementor-toggle-icon',
      properties: {
        display: 'inline-block',
        width: '1.5em',
        color: settings.icon_color,
      },
    },
    {
      selector: '.elementor-toggle-icon svg',
      properties: { height: '1em', width: '1em' },
    },
    {
      selector: '.elementor-toggle-icon-left',
      properties: { marginInlineEnd: parseDimension(settings.icon_space), textAlign: 'left' },
    },
    {
      selector: '.elementor-toggle-icon-right',
      properties: { marginInlineStart: parseDimension(settings.icon_space), order: '2', textAlign: 'right' },
    },
    {
      selector: '.elementor-toggle-icon-opened',
      properties: { display: 'none' },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-toggle-icon-closed',
      properties: { display: 'none' },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-toggle-icon-opened',
      properties: { display: 'block' },
    },
    {
      selector: '.elementor-tab-title.elementor-active .elementor-toggle-icon',
      properties: { color: settings.icon_active_color },
    },
    {
      selector: '.elementor-tab-content',
      properties: {
        backgroundColor: settings.content_background_color,
        color: settings.content_color,
        padding: parseSpacing(settings.content_padding),
        fontFamily: contentTypography.fontFamily,
        fontSize: contentTypography.fontSize,
        fontWeight: contentTypography.fontWeight,
        lineHeight: contentTypography.lineHeight,
        letterSpacing: contentTypography.letterSpacing,
        textShadow: parseTextShadow(settings.content_shadow_text_shadow, settings, 'content_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, { marginBlockEnd: parseDimension(settings[`space_between${suffix}`]) }, ' .elementor-toggle-item')
    addResponsiveRule(cssRules, query, { padding: parseSpacing(settings[`title_padding${suffix}`]) }, ' .elementor-tab-title')
    addResponsiveRule(cssRules, query, { marginInlineEnd: parseDimension(settings[`icon_space${suffix}`]) }, ' .elementor-toggle-icon-left')
    addResponsiveRule(cssRules, query, { marginInlineStart: parseDimension(settings[`icon_space${suffix}`]) }, ' .elementor-toggle-icon-right')
    addResponsiveRule(cssRules, query, { padding: parseSpacing(settings[`content_padding${suffix}`]) }, ' .elementor-tab-content')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'title_typography', suffix), ' .elementor-toggle-title, .elementor-toggle-icon')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'content_typography', suffix), ' .elementor-tab-content')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getTabsCSS(id: string, settings: PreviewSettings): string {
  const tabTypography = parseTypography(settings, 'tab_typography')
  const contentTypography = parseTypography(settings, 'content_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-tabs',
      properties: {
        display: settings.type === 'vertical' ? 'flex' : 'block',
        backgroundColor: settings.background_color,
      },
    },
    {
      selector: '.elementor-tabs-wrapper',
      properties: {
        display: 'flex',
        flexDirection: settings.type === 'vertical' ? 'column' : 'row',
        width: settings.type === 'vertical' ? parseDimension(settings.navigation_width) : undefined,
        justifyContent: settings.type === 'horizontal'
          ? (settings.tabs_align_horizontal === 'center' ? 'center' : settings.tabs_align_horizontal === 'end' ? 'flex-end' : settings.tabs_align_horizontal === 'stretch' ? 'stretch' : 'flex-start')
          : undefined,
      },
    },
    {
      selector: '.elementor-tab-title',
      properties: {
        cursor: 'pointer',
        color: settings.tab_color,
        textAlign: parseTextAlign(settings.title_align),
        borderStyle: settings.border_width ? 'solid' : undefined,
        borderWidth: parseDimension(settings.border_width),
        borderColor: settings.border_color,
        fontFamily: tabTypography.fontFamily,
        fontSize: tabTypography.fontSize,
        fontWeight: tabTypography.fontWeight,
        lineHeight: tabTypography.lineHeight,
        letterSpacing: tabTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
        ...parseTextStroke(settings, 'text_stroke'),
      },
    },
    {
      selector: '.elementor-tab-title.elementor-active',
      properties: { color: settings.tab_active_color, backgroundColor: settings.background_color },
    },
    {
      selector: '.elementor-tab-content',
      properties: {
        color: settings.content_color,
        borderStyle: settings.border_width ? 'solid' : undefined,
        borderWidth: parseDimension(settings.border_width),
        borderColor: settings.border_color,
        fontFamily: contentTypography.fontFamily,
        fontSize: contentTypography.fontSize,
        fontWeight: contentTypography.fontWeight,
        lineHeight: contentTypography.lineHeight,
        letterSpacing: contentTypography.letterSpacing,
        textShadow: parseTextShadow(settings.content_shadow_text_shadow, settings, 'content_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'tab_typography', suffix), ' .elementor-tab-title')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'content_typography', suffix), ' .elementor-tab-content')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getImageGalleryCSS(id: string, settings: PreviewSettings): string {
  const captionTypography = parseTypography(settings, 'typography')
  const border = parseBorder(settings, 'image_border')
  const cssRules: CSSRule[] = [
    {
      selector: '.gallery',
      properties: {
        display: 'grid',
        gridTemplateColumns: `repeat(${settings.gallery_columns || 4}, minmax(0, 1fr))`,
        gap: settings.image_spacing === 'custom' ? parseDimension(settings.image_spacing_custom) : undefined,
      },
    },
    {
      selector: '.gallery-item',
      properties: { margin: '0' },
    },
    {
      selector: '.gallery-item img',
      properties: {
        width: '100%',
        display: 'block',
        borderStyle: border.borderStyle,
        borderWidth: border.borderWidth,
        borderColor: border.borderColor,
        borderRadius: parseBorderRadius(settings.image_border_radius),
      },
    },
    {
      selector: '.gallery-caption',
      properties: {
        display: settings.gallery_display_caption === 'none' ? 'none' : undefined,
        textAlign: parseTextAlign(settings.align),
        color: settings.text_color,
        marginBlockStart: parseDimension(settings.caption_space),
        fontFamily: captionTypography.fontFamily,
        fontSize: captionTypography.fontSize,
        fontWeight: captionTypography.fontWeight,
        lineHeight: captionTypography.lineHeight,
        letterSpacing: captionTypography.letterSpacing,
        textShadow: parseTextShadow(settings.caption_shadow_text_shadow, settings, 'caption_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      borderRadius: parseBorderRadius(settings[`image_border_radius${suffix}`]),
      borderWidth: parseSpacing(settings[`image_border_width${suffix}`]),
    }, ' .gallery-item img')
    addResponsiveRule(cssRules, query, {
      textAlign: parseTextAlign(settings[`align${suffix}`]),
      marginBlockStart: parseDimension(settings[`caption_space${suffix}`]),
      ...responsiveTypographyForPrefix(settings, 'typography', suffix),
    }, ' .gallery-caption')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getCounterCSS(id: string, settings: PreviewSettings): string {
  const numberTypography = parseTypography(settings, 'typography_number')
  const titleTypography = parseTypography(settings, 'typography_title')
  const titlePosition = settings.title_position || 'after'
  const flexDirection = titlePosition === 'before' ? 'column' : titlePosition === 'start' ? 'row' : titlePosition === 'end' ? 'row-reverse' : 'column-reverse'
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-counter',
      properties: {
        display: 'flex',
        flexDirection,
        alignItems: settings.title_horizontal_alignment,
        justifyContent: settings.title_vertical_alignment,
        gap: parseDimension(settings.title_gap),
      },
    },
    {
      selector: '.elementor-counter-number-wrapper',
      properties: {
        display: 'flex',
        justifyContent: settings.number_alignment,
        alignItems: settings.number_position,
        gap: parseDimension(settings.number_gap),
        color: settings.number_color,
        fontFamily: numberTypography.fontFamily,
        fontSize: numberTypography.fontSize,
        fontWeight: numberTypography.fontWeight,
        lineHeight: numberTypography.lineHeight,
        letterSpacing: numberTypography.letterSpacing,
        textShadow: parseTextShadow(settings.number_shadow_text_shadow, settings, 'number_shadow'),
        ...parseTextStroke(settings, 'number_stroke'),
      },
    },
    {
      selector: '.elementor-counter-number-prefix, .elementor-counter-number-suffix',
      properties: { whiteSpace: 'pre-wrap' },
    },
    {
      selector: '.elementor-counter-title',
      properties: {
        color: settings.title_color,
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize,
        fontWeight: titleTypography.fontWeight,
        lineHeight: titleTypography.lineHeight,
        letterSpacing: titleTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
        ...parseTextStroke(settings, 'title_stroke'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    const responsiveTitlePosition = settings[`title_position${suffix}`]
    addResponsiveRule(cssRules, query, {
      flexDirection: responsiveTitlePosition === 'before' ? 'column' : responsiveTitlePosition === 'start' ? 'row' : responsiveTitlePosition === 'end' ? 'row-reverse' : responsiveTitlePosition === 'after' ? 'column-reverse' : undefined,
      alignItems: settings[`title_horizontal_alignment${suffix}`],
      justifyContent: settings[`title_vertical_alignment${suffix}`],
      gap: parseDimension(settings[`title_gap${suffix}`]),
    }, ' .elementor-counter')
    addResponsiveRule(cssRules, query, {
      justifyContent: settings[`number_alignment${suffix}`],
      alignItems: settings[`number_position${suffix}`],
      gap: parseDimension(settings[`number_gap${suffix}`]),
      ...responsiveTypographyForPrefix(settings, 'typography_number', suffix),
    }, ' .elementor-counter-number-wrapper')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'typography_title', suffix), ' .elementor-counter-title')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function progressPercent(settings: PreviewSettings): number {
  const raw = settings.percent
  const value = raw?.size !== undefined ? Number(raw.size) : Number(raw)
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
}

function getProgressCSS(id: string, settings: PreviewSettings): string {
  const titleTypography = parseTypography(settings, 'typography')
  const innerTypography = parseTypography(settings, 'bar_inner_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-title',
      properties: {
        color: settings.title_color,
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize,
        fontWeight: titleTypography.fontWeight,
        lineHeight: titleTypography.lineHeight,
        letterSpacing: titleTypography.letterSpacing,
        textShadow: parseTextShadow(settings.title_shadow_text_shadow, settings, 'title_shadow'),
      },
    },
    {
      selector: '.elementor-progress-wrapper',
      properties: {
        backgroundColor: settings.bar_bg_color,
        height: parseDimension(settings.bar_height),
        borderRadius: parseBorderRadius(settings.bar_border_radius),
      },
    },
    {
      selector: '.elementor-progress-bar',
      properties: {
        backgroundColor: settings.bar_color,
        color: settings.bar_inline_color,
        borderRadius: parseBorderRadius(settings.bar_border_radius),
        transition: 'width 1s ease',
      },
    },
    {
      selector: '.elementor-progress-text, .elementor-progress-percentage',
      properties: {
        fontFamily: innerTypography.fontFamily,
        fontSize: innerTypography.fontSize,
        fontWeight: innerTypography.fontWeight,
        lineHeight: innerTypography.lineHeight,
        letterSpacing: innerTypography.letterSpacing,
        textShadow: parseTextShadow(settings.bar_inner_shadow_text_shadow, settings, 'bar_inner_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'typography', suffix), ' .elementor-title')
    addResponsiveRule(cssRules, query, {
      height: parseDimension(settings[`bar_height${suffix}`]),
      borderRadius: parseBorderRadius(settings[`bar_border_radius${suffix}`]),
    }, ' .elementor-progress-wrapper')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'bar_inner_typography', suffix), ' .elementor-progress-text, .elementor-progress-percentage')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getImageCarouselCSS(id: string, settings: PreviewSettings): string {
  const captionTypography = parseTypography(settings, 'caption_typography')
  const imageBorder = parseBorder(settings, 'image_border')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-image-carousel-wrapper',
      properties: { overflow: 'hidden' },
    },
    {
      selector: '.elementor-image-carousel',
      properties: {
        display: 'flex',
        alignItems: settings.gallery_vertical_align,
        gap: parseDimension(settings.image_spacing_custom),
      },
    },
    {
      selector: '.swiper-slide',
      properties: { flex: '0 0 auto' },
    },
    {
      selector: '.swiper-slide-image',
      properties: {
        width: settings.image_stretch === 'yes' ? '100%' : undefined,
        display: 'block',
        borderStyle: imageBorder.borderStyle,
        borderWidth: imageBorder.borderWidth,
        borderColor: imageBorder.borderColor,
        borderRadius: parseBorderRadius(settings.image_border_radius),
      },
    },
    {
      selector: '.elementor-swiper-button',
      properties: {
        color: settings.arrows_color,
        fontSize: parseDimension(settings.arrows_size),
      },
    },
    {
      selector: '.swiper-pagination-bullet',
      properties: {
        width: parseDimension(settings.dots_size),
        height: parseDimension(settings.dots_size),
        backgroundColor: settings.dots_inactive_color,
        marginInline: parseDimension(settings.dots_gap),
      },
    },
    {
      selector: '.swiper-pagination-bullet-active',
      properties: { backgroundColor: settings.dots_color },
    },
    {
      selector: '.elementor-image-carousel-caption',
      properties: {
        textAlign: parseTextAlign(settings.caption_align),
        color: settings.caption_text_color,
        marginBlockStart: parseDimension(settings.caption_space),
        fontFamily: captionTypography.fontFamily,
        fontSize: captionTypography.fontSize,
        fontWeight: captionTypography.fontWeight,
        lineHeight: captionTypography.lineHeight,
        letterSpacing: captionTypography.letterSpacing,
        textShadow: parseTextShadow(settings.caption_shadow_text_shadow, settings, 'caption_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      alignItems: settings[`gallery_vertical_align${suffix}`],
      gap: parseDimension(settings[`image_spacing_custom${suffix}`]),
    }, ' .elementor-image-carousel')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`arrows_size${suffix}`]),
    }, ' .elementor-swiper-button')
    addResponsiveRule(cssRules, query, {
      width: parseDimension(settings[`dots_size${suffix}`]),
      height: parseDimension(settings[`dots_size${suffix}`]),
      marginInline: parseDimension(settings[`dots_gap${suffix}`]),
    }, ' .swiper-pagination-bullet')
    addResponsiveRule(cssRules, query, {
      borderWidth: parseSpacing(settings[`image_border_width${suffix}`]),
      borderRadius: parseBorderRadius(settings[`image_border_radius${suffix}`]),
    }, ' .swiper-slide-image')
    addResponsiveRule(cssRules, query, {
      textAlign: parseTextAlign(settings[`caption_align${suffix}`]),
      marginBlockStart: parseDimension(settings[`caption_space${suffix}`]),
      ...responsiveTypographyForPrefix(settings, 'caption_typography', suffix),
    }, ' .elementor-image-carousel-caption')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getNavMenuCSS(id: string, settings: PreviewSettings): string {
  const typography = parseTypography(settings, 'menu_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-nav-menu--layout-horizontal .elementor-nav-menu',
      properties: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: settings.align_items === 'center'
          ? 'center'
          : settings.align_items === 'end'
            ? 'flex-end'
            : settings.align_items === 'justify'
              ? 'space-between'
              : 'flex-start',
        gap: parseDimension(settings.menu_space_between),
      },
    },
    {
      selector: '.elementor-nav-menu--layout-vertical .elementor-nav-menu, .elementor-nav-menu--dropdown .elementor-nav-menu',
      properties: { display: 'block' },
    },
    {
      selector: '.elementor-nav-menu--dropdown[aria-hidden="true"]',
      properties: { display: 'none' },
    },
    {
      selector: '.elementor-nav-menu',
      properties: { listStyle: 'none', margin: '0', padding: '0' },
    },
    {
      selector: '.elementor-nav-menu li',
      properties: { position: 'relative', margin: '0' },
    },
    {
      selector: '.elementor-nav-menu a',
      properties: {
        color: settings.color_menu_item,
        display: 'flex',
        alignItems: 'center',
        gap: '0.35em',
        paddingInline: parseDimension(settings.padding_horizontal_menu_item),
        paddingBlock: parseDimension(settings.padding_vertical_menu_item),
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        lineHeight: typography.lineHeight,
        letterSpacing: typography.letterSpacing,
        textDecoration: 'none',
      },
    },
    {
      selector: '.elementor-nav-menu a:hover, .elementor-nav-menu a.highlighted',
      properties: { color: settings.color_menu_item_hover },
    },
    {
      selector: '.elementor-nav-menu .sub-menu',
      properties: {
        display: 'none',
        position: 'absolute',
        insetInlineStart: '0',
        top: '100%',
        minWidth: '12em',
        backgroundColor: settings.background_color_dropdown_item || '#ffffff',
        padding: '0',
        margin: '0',
        listStyle: 'none',
        zIndex: '10',
      },
    },
    {
      selector: '.elementor-nav-menu li:hover > .sub-menu',
      properties: { display: 'block' },
    },
    {
      selector: '.elementor-nav-menu .sub-menu a',
      properties: { color: settings.color_dropdown_item },
    },
    {
      selector: '.elementor-nav-menu .sub-menu a:hover',
      properties: { color: settings.color_dropdown_item_hover || settings.color_menu_item_hover },
    },
    {
      selector: '.elementor-menu-toggle',
      properties: {
        color: settings.toggle_color,
        backgroundColor: settings.toggle_background_color,
        fontSize: parseDimension(settings.toggle_size),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      justifyContent: settings[`align_items${suffix}`] === 'center'
        ? 'center'
        : settings[`align_items${suffix}`] === 'end'
          ? 'flex-end'
          : settings[`align_items${suffix}`] === 'justify'
            ? 'space-between'
            : undefined,
      gap: parseDimension(settings[`menu_space_between${suffix}`]),
    }, ' .elementor-nav-menu--layout-horizontal .elementor-nav-menu')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`menu_typography_font_size${suffix}`]),
      lineHeight: parseDimension(settings[`menu_typography_line_height${suffix}`]),
      letterSpacing: parseDimension(settings[`menu_typography_letter_spacing${suffix}`]),
      paddingInline: parseDimension(settings[`padding_horizontal_menu_item${suffix}`]),
      paddingBlock: parseDimension(settings[`padding_vertical_menu_item${suffix}`]),
    }, ' .elementor-nav-menu a')
    addResponsiveRule(cssRules, query, {
      fontSize: parseDimension(settings[`toggle_size${suffix}`]),
    }, ' .elementor-menu-toggle')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getElementorFormCSS(id: string, settings: PreviewSettings): string {
  const labelTypography = parseTypography(settings, 'label_typography')
  const fieldTypography = parseTypography(settings, 'field_typography')
  const buttonTypography = parseTypography(settings, 'button_typography')
  const columnGap = parseDimension(settings.column_gap) || '0px'
  const rowGap = parseDimension(settings.row_gap) || '0px'
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-form-fields-wrapper',
      properties: {
        display: 'flex',
        flexWrap: 'wrap',
        marginLeft: `calc(-${columnGap} / 2)`,
        marginRight: `calc(-${columnGap} / 2)`,
        marginBottom: `calc(-${rowGap})`,
      },
    },
    {
      selector: '.elementor-field-group',
      properties: {
        paddingLeft: `calc(${columnGap} / 2)`,
        paddingRight: `calc(${columnGap} / 2)`,
        marginBottom: rowGap,
      },
    },
    {
      selector: '.elementor-field-group > label, .elementor-field-subgroup label',
      properties: {
        color: settings.label_color,
        fontFamily: labelTypography.fontFamily,
        fontSize: labelTypography.fontSize,
        fontWeight: labelTypography.fontWeight,
      },
    },
    {
      selector: '.elementor-field-group .elementor-field:not(.elementor-select-wrapper), .elementor-field-group .elementor-select-wrapper select',
      properties: {
        color: settings.field_text_color,
        backgroundColor: settings.field_background_color,
        borderColor: settings.field_border_color,
        borderStyle: settings.field_border_color ? 'solid' : undefined,
        borderWidth: settings.field_border_color ? '1px' : undefined,
        borderRadius: parseBorderRadius(settings.field_border_radius),
        padding: '0.75em 1em',
        fontFamily: fieldTypography.fontFamily,
        fontSize: fieldTypography.fontSize,
        fontWeight: fieldTypography.fontWeight,
      },
    },
    {
      selector: '.elementor-button[type="submit"]',
      properties: {
        color: settings.button_text_color ? `${settings.button_text_color} !important` : undefined,
        backgroundColor: settings.button_background_color ? `${settings.button_background_color} !important` : undefined,
        borderColor: settings.button_border_color,
        borderStyle: settings.button_border_color ? 'solid' : undefined,
        borderWidth: settings.button_border_color ? '1px' : undefined,
        padding: '0.85em 1.4em',
        fontFamily: buttonTypography.fontFamily,
        fontSize: buttonTypography.fontSize,
        fontWeight: buttonTypography.fontWeight,
      },
    },
    {
      selector: '.elementor-button[type="submit"]:hover',
      properties: {
        color: settings.button_hover_text_color ? `${settings.button_hover_text_color} !important` : undefined,
        backgroundColor: settings.button_hover_background_color ? `${settings.button_hover_background_color} !important` : undefined,
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    const responsiveColumnGap = parseDimension(settings[`column_gap${suffix}`])
    const responsiveRowGap = parseDimension(settings[`row_gap${suffix}`])
    addResponsiveRule(cssRules, query, {
      marginLeft: responsiveColumnGap ? `calc(-${responsiveColumnGap} / 2)` : undefined,
      marginRight: responsiveColumnGap ? `calc(-${responsiveColumnGap} / 2)` : undefined,
      marginBottom: responsiveRowGap ? `calc(-${responsiveRowGap})` : undefined,
    }, ' .elementor-form-fields-wrapper')
    addResponsiveRule(cssRules, query, {
      paddingLeft: responsiveColumnGap ? `calc(${responsiveColumnGap} / 2)` : undefined,
      paddingRight: responsiveColumnGap ? `calc(${responsiveColumnGap} / 2)` : undefined,
      marginBottom: responsiveRowGap,
    }, ' .elementor-field-group')
    addResponsiveRule(cssRules, query, {
      borderRadius: parseBorderRadius(settings[`field_border_radius${suffix}`]),
    }, ' .elementor-field-group .elementor-field:not(.elementor-select-wrapper), .elementor-field-group .elementor-select-wrapper select')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getSlidesCSS(id: string, settings: PreviewSettings): string {
  const headingTypography = parseTypography(settings, 'heading_typography')
  const descriptionTypography = parseTypography(settings, 'description_typography')
  const height = parseDimension(settings.slides_height) || '400px'
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-slides-wrapper',
      properties: { overflow: 'hidden', height },
    },
    {
      selector: '.swiper-slide',
      properties: { position: 'relative', minHeight: height, display: 'flex' },
    },
    {
      selector: '.swiper-slide-bg',
      properties: {
        position: 'absolute',
        inset: '0',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
      },
    },
    {
      selector: '.elementor-background-overlay',
      properties: { position: 'absolute', inset: '0' },
    },
    {
      selector: '.swiper-slide-inner',
      properties: {
        position: 'relative',
        zIndex: '1',
        width: '100%',
        display: 'flex',
        alignItems: settings.slides_vertical_position === 'top' ? 'flex-start' : settings.slides_vertical_position === 'bottom' ? 'flex-end' : 'center',
        justifyContent: settings.slides_horizontal_position === 'left' ? 'flex-start' : settings.slides_horizontal_position === 'right' ? 'flex-end' : 'center',
        padding: parseSpacing(settings.slides_padding),
        textAlign: settings.slides_text_align || 'center',
      },
    },
    {
      selector: '.swiper-slide-contents',
      properties: { maxWidth: parseDimension(settings.content_max_width) },
    },
    {
      selector: '.elementor-slide-heading',
      properties: {
        color: settings.heading_color,
        marginBlockEnd: parseDimension(settings.heading_spacing),
        fontFamily: headingTypography.fontFamily,
        fontSize: headingTypography.fontSize,
        fontWeight: headingTypography.fontWeight,
        lineHeight: headingTypography.lineHeight,
      },
    },
    {
      selector: '.elementor-slide-description',
      properties: {
        color: settings.description_color,
        marginBlockEnd: parseDimension(settings.description_spacing),
        fontFamily: descriptionTypography.fontFamily,
        fontSize: descriptionTypography.fontSize,
        fontWeight: descriptionTypography.fontWeight,
        lineHeight: descriptionTypography.lineHeight,
      },
    },
    {
      selector: '.elementor-slide-button',
      properties: {
        color: settings.button_text_color,
        borderColor: settings.button_border_color,
        borderWidth: parseDimension(settings.button_border_width),
        borderRadius: parseDimension(settings.button_border_radius),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, { height: parseDimension(settings[`slides_height${suffix}`]) }, ' .elementor-slides-wrapper')
    addResponsiveRule(cssRules, query, {
      minHeight: parseDimension(settings[`slides_height${suffix}`]),
    }, ' .swiper-slide')
    addResponsiveRule(cssRules, query, {
      padding: parseSpacing(settings[`slides_padding${suffix}`]),
      alignItems: settings[`slides_vertical_position${suffix}`] === 'top' ? 'flex-start' : settings[`slides_vertical_position${suffix}`] === 'bottom' ? 'flex-end' : undefined,
      justifyContent: settings[`slides_horizontal_position${suffix}`] === 'left' ? 'flex-start' : settings[`slides_horizontal_position${suffix}`] === 'right' ? 'flex-end' : undefined,
      textAlign: settings[`slides_text_align${suffix}`],
    }, ' .swiper-slide-inner')
    addResponsiveRule(cssRules, query, { maxWidth: parseDimension(settings[`content_max_width${suffix}`]) }, ' .swiper-slide-contents')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'heading_typography', suffix), ' .elementor-slide-heading')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'description_typography', suffix), ' .elementor-slide-description')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function getImageCSS(id: string, settings: PreviewSettings): string {
  const imageBorderStyle = settings.image_border_border
  const imageBorderEnabled = imageBorderStyle && imageBorderStyle !== 'none'
  const captionTypography = parseTypography(settings, 'caption_typography')
  const transitionDuration = previewSizeValue(settings.background_hover_transition)
  const cssFilter = settings.css_filters_css_filter === 'custom'
    ? buildImageFilter(settings, 'css_filters')
    : undefined
  const cssFilterHover = settings.css_filters_hover_css_filter === 'custom'
    ? buildImageFilter(settings, 'css_filters_hover')
    : undefined
  const cssRules: CSSRule[] = [
    {
      selector: '',
      properties: { textAlign: settings.align },
    },
    {
      selector: 'img',
      properties: {
        width: parseDimension(settings.width),
        maxWidth: parseDimension(settings.space),
        height: parseDimension(settings.height),
        objectFit: settings['object-fit'] || settings.object_fit,
        objectPosition: settings['object-position'] || settings.object_position,
        opacity: settings.opacity?.size !== undefined ? String(settings.opacity.size) : settings.opacity !== undefined ? String(settings.opacity) : undefined,
        borderRadius: parseBorderRadius(settings.image_border_radius),
        borderStyle: imageBorderEnabled ? imageBorderStyle : undefined,
        borderWidth: imageBorderEnabled ? parseSpacing(settings.image_border_width) : undefined,
        borderColor: imageBorderEnabled ? settings.image_border_color : undefined,
        boxShadow: parseBoxShadow(settings.image_box_shadow_box_shadow, settings, 'image_box_shadow'),
        filter: cssFilter,
        transitionProperty: transitionDuration ? 'opacity, filter' : undefined,
        transitionDuration: transitionDuration ? `${transitionDuration}s` : undefined,
      },
    },
    {
      selector: ':hover img',
      properties: {
        opacity: settings.opacity_hover?.size !== undefined ? String(settings.opacity_hover.size) : undefined,
        filter: cssFilterHover,
        boxShadow: parseBoxShadow(settings.image_box_shadow_hover_box_shadow, settings, 'image_box_shadow_hover'),
      },
    },
    {
      selector: '.widget-image-caption',
      properties: {
        textAlign: settings.caption_align,
        color: settings.text_color,
        backgroundColor: settings.caption_background_color,
        marginBlockStart: parseDimension(settings.caption_space),
        padding: parseSpacing(settings.caption_padding),
        fontFamily: captionTypography.fontFamily,
        fontSize: captionTypography.fontSize,
        fontWeight: captionTypography.fontWeight,
        fontStyle: captionTypography.fontStyle,
        textTransform: captionTypography.textTransform,
        textDecoration: captionTypography.textDecoration,
        lineHeight: captionTypography.lineHeight,
        letterSpacing: captionTypography.letterSpacing,
        textShadow: parseTextShadow(settings.caption_text_shadow_text_shadow, settings, 'caption_text_shadow'),
      },
    },
  ]
  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, {
      textAlign: settings[`align${suffix}`],
    })
    addResponsiveRule(cssRules, query, {
      width: parseDimension(settings[`width${suffix}`]),
      maxWidth: parseDimension(settings[`space${suffix}`]),
      height: parseDimension(settings[`height${suffix}`]),
      objectFit: settings[`object-fit${suffix}`] || settings[`object_fit${suffix}`],
      borderRadius: parseBorderRadius(settings[`image_border_radius${suffix}`]),
    }, ' img')
  }
  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

function renderShapeDivider(settings: PreviewSettings, position: 'top' | 'bottom'): ReactNode {
  if (!settings[`shape_divider_${position}`]) return null
  return (
    <div className={`elementor-shape elementor-shape-${position}`} data-negative="false">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0,0 L1000,0 L1000,100 L0,100 Z" />
      </svg>
    </div>
  )
}

function renderPreviewIcon(icon: PreviewSettings['selected_icon']): ReactNode {
  if (!icon?.value) return null
  if (icon.library === 'svg' && typeof icon.value === 'string' && icon.value.trim().startsWith('<svg')) {
    return <span dangerouslySetInnerHTML={{ __html: icon.value }} />
  }
  return <i className={icon.value} aria-hidden="true" />
}

function widgetDataSettings(settings: PreviewSettings, keys: string[]): string | undefined {
  const data: Record<string, unknown> = {}
  for (const key of keys) {
    if (settings[key] !== undefined) data[key] = settings[key]
  }
  return Object.keys(data).length > 0 ? JSON.stringify(data) : undefined
}

// =============================================================================
// COMPONENTS
// =============================================================================

type AbstractionKind = 'page' | 'container' | 'widget'

type AbstractionComponentMeta = {
  kind: AbstractionKind
  name: string
  widgetKey?: string
  containerType?: 'grid' | 'flex'
}

type InternalFlexboxProps = FlexboxProps & {
  /** Component name for layers panel display (e.g., "HeroSection", "Container") */
  __upComponentName?: string
}

export const Page: React.FC<PageProps> & { __elementorAbstraction?: AbstractionComponentMeta } = ({ children }) => {
  return <>{children}</>;
};
Page.__elementorAbstraction = { kind: 'page', name: 'Page' };

export const Grid: React.FC<GridProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);
  const parent = useElementContext();

  if (isPreview) {
    const settings = asPreviewSettings(mapGridProps(props as Record<string, unknown>));
    const css = getContainerPreviewCSS(id, settings, 'grid');
    const isNested = parent !== null;
    const isBoxed = settings.content_width === 'boxed';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'e-con',
      isNested ? 'e-child' : 'e-parent',
      'e-grid',
      isBoxed ? 'e-con-boxed' : 'e-con-full',
      settings.css_classes,
      props.className,
    ].filter(Boolean).join(' ');
    const TagName = (settings.html_tag || 'div') as keyof JSX.IntrinsicElements;
    const linkProps = settings.html_tag === 'a' && settings.link?.url ? {
      href: settings.link.url,
      target: settings.link.is_external ? '_blank' : undefined,
      rel: settings.link.nofollow ? 'nofollow' : undefined,
    } : {};
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <ElementContext.Provider value={{ parentId: id }}>
        <StyleTag elementId={id} css={css} />
        <TagName
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="container"
          data-e-type="container"
          data-up-component="Grid"
          {...linkProps}
        >
          {renderShapeDivider(settings, 'top')}
          {isBoxed ? <div className="e-con-inner">{props.children}</div> : props.children}
          {renderShapeDivider(settings, 'bottom')}
        </TagName>
      </ElementContext.Provider>
    );
  }

  // JSON mode
  const doc = useDocument();
  const settings = mapGridProps(props as Record<string, unknown>);

  const element: ElementorElement = {
    id,
    elType: 'container',
    settings: { ...settings, container_type: 'grid' },
    elements: [],
    isInner: !!parent,
  };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return (
    <ElementContext.Provider value={{ parentId: id }}>
      {props.children}
    </ElementContext.Provider>
  );
};
(Grid as any).__elementorAbstraction = { kind: 'container', name: 'Grid', widgetKey: 'container', containerType: 'grid' };

export const Flexbox: React.FC<FlexboxProps> = (rawProps) => {
  const { __upComponentName, ...props } = rawProps as InternalFlexboxProps;
  const componentName = __upComponentName || 'Flexbox';
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);
  const parent = useElementContext();

  if (isPreview) {
    const settings = asPreviewSettings(mapFlexboxProps(props as Record<string, unknown>));
    const css = getContainerPreviewCSS(id, settings, 'flex');
    const isNested = parent !== null;
    const isBoxed = settings.content_width === 'boxed';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'e-con',
      isNested ? 'e-child' : 'e-parent',
      'e-flex',
      isBoxed ? 'e-con-boxed' : 'e-con-full',
      settings.css_classes,
      props.className,
    ].filter(Boolean).join(' ');
    const TagName = (settings.html_tag || 'div') as keyof JSX.IntrinsicElements;
    const linkProps = settings.html_tag === 'a' && settings.link?.url ? {
      href: settings.link.url,
      target: settings.link.is_external ? '_blank' : undefined,
      rel: settings.link.nofollow ? 'nofollow' : undefined,
    } : {};
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <ElementContext.Provider value={{ parentId: id }}>
        <StyleTag elementId={id} css={css} />
        <TagName
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="container"
          data-e-type="container"
          data-up-component={componentName}
          {...linkProps}
        >
          {renderShapeDivider(settings, 'top')}
          {isBoxed ? <div className="e-con-inner">{props.children}</div> : props.children}
          {renderShapeDivider(settings, 'bottom')}
        </TagName>
      </ElementContext.Provider>
    );
  }

  // JSON mode
  const doc = useDocument();
  const settings = mapFlexboxProps(props as Record<string, unknown>);

  const element: ElementorElement = {
    id,
    elType: 'container',
    settings,
    elements: [],
    isInner: !!parent,
  };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return (
    <ElementContext.Provider value={{ parentId: id }}>
      {props.children}
    </ElementContext.Provider>
  );
};
(Flexbox as any).__elementorAbstraction = { kind: 'container', name: 'Flexbox', widgetKey: 'container', containerType: 'flex' };

export const Section: React.FC<SectionProps> = ({ name, ...props }) => (
  React.createElement(Flexbox as React.FC<InternalFlexboxProps>, {
    ...(props as FlexboxProps),
    __upComponentName: name || 'Section',
  })
);
(Section as any).__elementorAbstraction = { kind: 'container', name: 'Section', widgetKey: 'container', containerType: 'flex' };

export const Heading: React.FC<HeadingProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('heading', props as Record<string, unknown>));
    const Tag = (settings.header_size || 'div') as keyof JSX.IntrinsicElements;
    const css = getHeadingCSS(id, settings);

    if (!settings.title) return null;

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-heading',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');

    const headingClasses = [
      'elementor-heading-title',
      `elementor-size-${settings.size || 'default'}`,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    const title = String(settings.title || '');
    const titleHasInlineHtml = /<\/?(span|strong|em|b|i|u|br)\b/i.test(title);
    const content = settings.link?.url && titleHasInlineHtml ? (
      <a
        href={settings.link.url}
        target={settings.link.is_external ? '_blank' : undefined}
        rel={settings.link.nofollow ? 'nofollow' : undefined}
        dangerouslySetInnerHTML={{ __html: title }}
      />
    ) : settings.link?.url ? (
      <a
        href={settings.link.url}
        target={settings.link.is_external ? '_blank' : undefined}
        rel={settings.link.nofollow ? 'nofollow' : undefined}
      >
        {title}
      </a>
    ) : titleHasInlineHtml ? (
      <span dangerouslySetInnerHTML={{ __html: title }} />
    ) : title;

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Heading"
          data-widget_type="heading.default"
        >
          <Tag className={headingClasses}>{content}</Tag>
        </div>
      </>
    );
  }

  // JSON mode
  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('heading', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'heading', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Heading as any).__elementorAbstraction = { kind: 'widget', name: 'Heading', widgetKey: 'heading' };

export const TextEditor: React.FC<TextEditorProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('text-editor', props as Record<string, unknown>));
    const css = getTextEditorCSS(id, settings);

    if (!settings.editor) return null;

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-text-editor',
      settings.drop_cap === 'yes' ? 'elementor-drop-cap-yes' : settings.drop_cap === 'no' ? 'elementor-drop-cap-no' : '',
      settings.drop_cap === 'yes' && settings.drop_cap_view ? `elementor-drop-cap-view-${settings.drop_cap_view}` : '',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const dataSettings = settings.drop_cap === 'yes' || settings.drop_cap === 'no'
      ? JSON.stringify({ drop_cap: settings.drop_cap })
      : undefined;
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="TextEditor"
          data-widget_type="text-editor.default"
          {...(dataSettings && { 'data-settings': dataSettings })}
          dangerouslySetInnerHTML={{ __html: settings.editor }}
        />
      </>
    );
  }

  // JSON mode
  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('text-editor', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'text-editor', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(TextEditor as any).__elementorAbstraction = { kind: 'widget', name: 'TextEditor', widgetKey: 'text-editor' };

export const Button: React.FC<ButtonProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('button', props as Record<string, unknown>));
    const css = getButtonCSS(id, settings);

    if (!settings.text && !settings.selected_icon?.value) return null;

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.button_type ? `elementor-button-${settings.button_type}` : '',
      settings.align ? `elementor-align-${settings.align}` : '',
      settings.align_tablet ? `elementor-tablet-align-${settings.align_tablet}` : '',
      settings.align_mobile ? `elementor-mobile-align-${settings.align_mobile}` : '',
      'elementor-widget',
      'elementor-widget-button',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');

    const buttonClasses = [
      'elementor-button',
      'elementor-button-link',
      settings.size ? `elementor-size-${settings.size}` : '',
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    const renderIcon = () => {
      if (!settings.selected_icon?.value) return null;
      return (
        <span className="elementor-button-icon">
          {renderPreviewIcon(settings.selected_icon)}
        </span>
      );
    };

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Button"
          data-widget_type="button.default"
        >
          <a
            className={buttonClasses}
            href={settings.link?.url || '#'}
            id={settings.button_css_id}
            target={settings.link?.is_external ? '_blank' : undefined}
            rel={settings.link?.nofollow ? 'nofollow' : undefined}
          >
            <span className="elementor-button-content-wrapper">
              {renderIcon()}
              {settings.text && <span className="elementor-button-text">{settings.text}</span>}
            </span>
          </a>
        </div>
      </>
    );
  }

  // JSON mode
  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('button', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'button', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Button as any).__elementorAbstraction = { kind: 'widget', name: 'Button', widgetKey: 'button' };

export const Icon: React.FC<IconProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('icon', props as Record<string, unknown>));
    const css = getIconCSS(id, settings);

    if (!settings.selected_icon?.value) return null;

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.view ? `elementor-view-${settings.view}` : '',
      settings.view && settings.view !== 'default' && settings.shape ? `elementor-shape-${settings.shape}` : '',
      'elementor-widget',
      'elementor-widget-icon',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');

    const iconClasses = [
      'elementor-icon',
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    const IconElement = settings.link?.url ? 'a' : 'div';
    const iconProps = {
      className: iconClasses,
      ...(settings.link?.url && {
        href: settings.link.url,
        target: settings.link.is_external ? '_blank' : undefined,
        rel: settings.link.nofollow ? 'nofollow' : settings.link.is_external ? 'noopener noreferrer' : undefined,
      }),
    };

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Icon"
          data-widget_type="icon.default"
        >
          <div className="elementor-icon-wrapper">
            <IconElement {...iconProps}>
              {renderPreviewIcon(settings.selected_icon)}
            </IconElement>
          </div>
        </div>
      </>
    );
  }

  // JSON mode
  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('icon', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'icon', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Icon as any).__elementorAbstraction = { kind: 'widget', name: 'Icon', widgetKey: 'icon' };

export const IconBox: React.FC<IconBoxProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('icon-box', props as Record<string, unknown>));
    const css = getIconBoxCSS(id, settings);
    const title = String(settings.title_text || '');
    const description = String(settings.description_text || '');
    const titleTag = settings.title_size || 'h3';
    const link = settings.link?.url ? settings.link : undefined;

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.view ? `elementor-view-${settings.view}` : '',
      settings.view && settings.view !== 'default' && settings.shape ? `elementor-shape-${settings.shape}` : '',
      settings.position ? `elementor-position-${settings.position}` : '',
      settings.position_tablet ? `elementor-tablet-position-${settings.position_tablet}` : '',
      settings.position_mobile ? `elementor-mobile-position-${settings.position_mobile}` : '',
      'elementor-widget',
      'elementor-widget-icon-box',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const iconClasses = [
      'elementor-icon',
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);
    const iconContent = renderPreviewIcon(settings.selected_icon);

    const iconNode = link ? (
      <a
        className={iconClasses}
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
        tabIndex={-1}
        aria-label={title || undefined}
      >
        {iconContent}
      </a>
    ) : (
      <span className={iconClasses}>{iconContent}</span>
    );
    const titleInner = link ? (
      <a
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
      >
        {title}
      </a>
    ) : <span>{title}</span>;

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="IconBox"
          data-widget_type="icon-box.default"
        >
          <div className="elementor-icon-box-wrapper">
            {settings.selected_icon?.value ? (
              <div className="elementor-icon-box-icon">{iconNode}</div>
            ) : null}
            <div className="elementor-icon-box-content">
              {title ? React.createElement(titleTag, { className: 'elementor-icon-box-title' }, titleInner) : null}
              {description ? <p className="elementor-icon-box-description">{description}</p> : null}
            </div>
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('icon-box', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'icon-box', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(IconBox as any).__elementorAbstraction = { kind: 'widget', name: 'IconBox', widgetKey: 'icon-box' };

export const IconList: React.FC<IconListProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('icon-list', props as Record<string, unknown>));
    const css = getIconListCSS(id, settings);
    const items = Array.isArray(settings.icon_list) ? settings.icon_list : [];

    if (items.length === 0) return null;

    const view = settings.view || 'traditional';
    const linkClick = settings.link_click || 'full_width';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      `elementor-icon-list--layout-${view}`,
      `elementor-list-item-link-${linkClick}`,
      settings.icon_align ? `elementor-align-${settings.icon_align}` : '',
      settings.icon_align_tablet ? `elementor-tablet-align-${settings.icon_align_tablet}` : '',
      settings.icon_align_mobile ? `elementor-mobile-align-${settings.icon_align_mobile}` : '',
      'elementor-widget',
      'elementor-widget-icon-list',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const ulClasses = [
      'elementor-icon-list-items',
      view === 'inline' ? 'elementor-inline-items' : '',
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="IconList"
          data-widget_type="icon-list.default"
        >
          <ul className={ulClasses}>
            {items.map((rawItem: Record<string, any>, index: number) => {
              const item = rawItem || {};
              const itemClasses = [
                'elementor-icon-list-item',
                view === 'inline' ? 'elementor-inline-item' : '',
              ].filter(Boolean).join(' ');
              const content = (
                <>
                  {item.selected_icon?.value ? (
                    <span className="elementor-icon-list-icon">
                      {renderPreviewIcon(item.selected_icon)}
                    </span>
                  ) : null}
                  <span className="elementor-icon-list-text">{String(item.text || '')}</span>
                </>
              );

              return (
                <li key={item._id || `item_${index}`} className={itemClasses}>
                  {item.link?.url ? (
                    <a
                      href={item.link.url}
                      target={item.link.is_external ? '_blank' : undefined}
                      rel={item.link.nofollow ? 'nofollow' : item.link.is_external ? 'noopener noreferrer' : undefined}
                    >
                      {content}
                    </a>
                  ) : content}
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
  }

  // JSON mode
  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('icon-list', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'icon-list', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(IconList as any).__elementorAbstraction = { kind: 'widget', name: 'IconList', widgetKey: 'icon-list' };

export const ImageBox: React.FC<ImageBoxProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image-box', props as Record<string, unknown>));
    const css = getImageBoxCSS(id, settings);
    const image = settings.image || {};
    let src = image.url || '';
    const alt = image.alt || props.alt || '';
    const title = String(settings.title_text || '');
    const description = String(settings.description_text || '');
    const titleTag = settings.title_size || 'h3';
    const link = settings.link?.url ? settings.link : undefined;

    if (!src) return null;

    if (src && src.startsWith('asset://') && typeof window !== 'undefined') {
      const baseUrl = (window as any).__UP_IMAGES_BASE_URL;
      if (baseUrl) src = src.replace('asset://', baseUrl + '/');
    }

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.position ? `elementor-position-${settings.position}` : '',
      settings.position_tablet ? `elementor-tablet-position-${settings.position_tablet}` : '',
      settings.position_mobile ? `elementor-mobile-position-${settings.position_mobile}` : '',
      settings.content_vertical_alignment ? `elementor-vertical-align-${settings.content_vertical_alignment}` : '',
      'elementor-widget',
      'elementor-widget-image-box',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const imageClasses = [
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    const imageNode = (
      <img src={src} className={imageClasses || undefined} title={image.title || ''} alt={alt} loading="lazy" />
    );
    const linkedImage = link ? (
      <a
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
        tabIndex={-1}
      >
        {imageNode}
      </a>
    ) : imageNode;
    const titleInner = link ? (
      <a
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
      >
        {title}
      </a>
    ) : title;

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ImageBox"
          data-widget_type="image-box.default"
        >
          <div className="elementor-image-box-wrapper">
            <figure className="elementor-image-box-img">{linkedImage}</figure>
            <div className="elementor-image-box-content">
              {title ? React.createElement(titleTag, { className: 'elementor-image-box-title' }, titleInner) : null}
              {description ? <p className="elementor-image-box-description">{description}</p> : null}
            </div>
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('image-box', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image-box', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(ImageBox as any).__elementorAbstraction = { kind: 'widget', name: 'ImageBox', widgetKey: 'image-box' };

function isElementorNativePreviewRuntime(): boolean {
  return typeof window !== 'undefined' && (window as any).__UP_USE_ELEMENTOR_NATIVE_JS === true;
}

function normalizeDefaultActiveIndex(value: unknown, length: number): number | null {
  if (value === null) return null
  const index = value === undefined ? 0 : Number(value)
  if (!Number.isFinite(index) || index < 0 || index >= length) return length > 0 ? 0 : null
  return Math.floor(index)
}

export const Accordion: React.FC<AccordionProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime();
    const settings = asPreviewSettings(mapWidgetProps('accordion', props as Record<string, unknown>));
    const css = getAccordionCSS(id, settings);
    const items = Array.isArray(settings.tabs) ? settings.tabs : [];
    const defaultActiveIndex = normalizeDefaultActiveIndex(props.defaultActiveIndex, items.length);
    const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex);

    if (items.length === 0) return null;

    const titleTag = settings.title_html_tag || 'div';
    const iconAlign = settings.icon_align || 'right';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-accordion',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Accordion"
          data-widget_type="accordion.default"
        >
          <div className="elementor-accordion">
            {items.map((rawItem: Record<string, any>, index: number) => {
              const item = rawItem || {};
              const active = useNativeRuntime ? index === defaultActiveIndex : index === activeIndex;
              const tabId = `${id}${index + 1}`;
              const toggleItem = () => setActiveIndex((current) => current === index ? null : index);
              const handleKeyDown = (event: React.KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleItem();
                }
              };
              const titleContent = (
                <>
                  <span className={`elementor-accordion-icon elementor-accordion-icon-${iconAlign}`} aria-hidden="true">
                    <span className="elementor-accordion-icon-closed">{renderPreviewIcon(settings.selected_icon)}</span>
                    <span className="elementor-accordion-icon-opened">{renderPreviewIcon(settings.selected_active_icon)}</span>
                  </span>
                  <a className="elementor-accordion-title" tabIndex={0}>
                    {String(item.tab_title || '')}
                  </a>
                </>
              );

              return (
                <div className="elementor-accordion-item" key={item._id || `accordion_${index}`}>
                  {React.createElement(
                    titleTag,
                    {
                      id: `elementor-tab-title-${tabId}`,
                      className: `elementor-tab-title ${active ? 'elementor-active' : ''} elementor-tab-title-${iconAlign}`,
                      role: 'button',
                      'aria-controls': `elementor-tab-content-${tabId}`,
                      'aria-expanded': active,
                      tabIndex: 0,
                      'data-tab': index + 1,
                      onClick: useNativeRuntime ? undefined : toggleItem,
                      onKeyDown: useNativeRuntime ? undefined : handleKeyDown,
                    },
                    titleContent
                  )}
                  <div
                    id={`elementor-tab-content-${tabId}`}
                    className={`elementor-tab-content elementor-clearfix ${active ? 'elementor-active' : ''}`}
                    data-tab={index + 1}
                    role="region"
                    aria-labelledby={`elementor-tab-title-${tabId}`}
                    hidden={!active}
                    style={{ display: active ? 'block' : 'none' }}
                    dangerouslySetInnerHTML={{ __html: String(item.tab_content || '') }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('accordion', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'accordion', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Accordion as any).__elementorAbstraction = { kind: 'widget', name: 'Accordion', widgetKey: 'accordion' };

export const Toggle: React.FC<ToggleProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime();
    const settings = asPreviewSettings(mapWidgetProps('toggle', props as Record<string, unknown>));
    const css = getToggleCSS(id, settings);
    const items = Array.isArray(settings.tabs) ? settings.tabs : [];
    const defaultActiveIndex = normalizeDefaultActiveIndex(props.defaultActiveIndex, items.length);
    const [openItems, setOpenItems] = useState<Set<number>>(() => defaultActiveIndex === null ? new Set() : new Set([defaultActiveIndex]));

    if (items.length === 0) return null;

    const titleTag = settings.title_html_tag || 'div';
    const iconAlign = settings.icon_align || 'right';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-toggle',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Toggle"
          data-widget_type="toggle.default"
        >
          <div className="elementor-toggle">
            {items.map((rawItem: Record<string, any>, index: number) => {
              const item = rawItem || {};
              const active = useNativeRuntime ? index === defaultActiveIndex : openItems.has(index);
              const tabId = `${id}${index + 1}`;
              const toggleItem = () => setOpenItems((current) => {
                const next = new Set(current);
                if (next.has(index)) next.delete(index);
                else next.add(index);
                return next;
              });
              const handleKeyDown = (event: React.KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleItem();
                }
              };
              const titleContent = (
                <>
                  <span className={`elementor-toggle-icon elementor-toggle-icon-${iconAlign}`} aria-hidden="true">
                    <span className="elementor-toggle-icon-closed">{renderPreviewIcon(settings.selected_icon)}</span>
                    <span className="elementor-toggle-icon-opened">{renderPreviewIcon(settings.selected_active_icon)}</span>
                  </span>
                  <a className="elementor-toggle-title" tabIndex={0}>
                    {String(item.tab_title || '')}
                  </a>
                </>
              );

              return (
                <div className="elementor-toggle-item" key={item._id || `toggle_${index}`}>
                  {React.createElement(
                    titleTag,
                    {
                      id: `elementor-tab-title-${tabId}`,
                      className: `elementor-tab-title ${active ? 'elementor-active' : ''} elementor-tab-title-${iconAlign}`,
                      role: 'button',
                      'aria-controls': `elementor-tab-content-${tabId}`,
                      'aria-expanded': active,
                      tabIndex: 0,
                      'data-tab': index + 1,
                      onClick: useNativeRuntime ? undefined : toggleItem,
                      onKeyDown: useNativeRuntime ? undefined : handleKeyDown,
                    },
                    titleContent
                  )}
                  <div
                    id={`elementor-tab-content-${tabId}`}
                    className={`elementor-tab-content elementor-clearfix ${active ? 'elementor-active' : ''}`}
                    data-tab={index + 1}
                    role="region"
                    aria-labelledby={`elementor-tab-title-${tabId}`}
                    hidden={!active}
                    style={{ display: active ? 'block' : 'none' }}
                    dangerouslySetInnerHTML={{ __html: String(item.tab_content || '') }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('toggle', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'toggle', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Toggle as any).__elementorAbstraction = { kind: 'widget', name: 'Toggle', widgetKey: 'toggle' };

export const Tabs: React.FC<TabsProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime();
    const settings = asPreviewSettings(mapWidgetProps('tabs', props as Record<string, unknown>));
    const css = getTabsCSS(id, settings);
    const items = Array.isArray(settings.tabs) ? settings.tabs : [];
    const defaultActiveIndex = normalizeDefaultActiveIndex(props.defaultActiveIndex, items.length);
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex ?? 0);

    if (items.length === 0) return null;

    const type = settings.type || 'horizontal';
    const align = type === 'vertical' ? settings.tabs_align_vertical : settings.tabs_align_horizontal;
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-tabs',
      `elementor-tabs-view-${type}`,
      align ? `elementor-tabs-alignment-${align}` : '',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Tabs"
          data-widget_type="tabs.default"
        >
          <div className={`elementor-tabs elementor-tabs-view-${type}`}>
            <div className="elementor-tabs-wrapper" role="tablist">
              {items.map((rawItem: Record<string, any>, index: number) => {
                const item = rawItem || {};
                const active = useNativeRuntime ? index === defaultActiveIndex : index === activeIndex;
                const tabId = `${id}${index + 1}`;
                const activateTab = () => setActiveIndex(index);
                const handleKeyDown = (event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateTab();
                  }
                };
                return (
                  <div
                    key={item._id || `tab_title_${index}`}
                    id={`elementor-tab-title-${tabId}`}
                    className={`elementor-tab-title elementor-tab-desktop-title ${active ? 'elementor-active' : ''}`}
                    aria-selected={active}
                    data-tab={index + 1}
                    role="tab"
                    tabIndex={active ? 0 : -1}
                    aria-controls={`elementor-tab-content-${tabId}`}
                    onClick={useNativeRuntime ? undefined : activateTab}
                    onKeyDown={useNativeRuntime ? undefined : handleKeyDown}
                  >
                    {String(item.tab_title || '')}
                  </div>
                );
              })}
            </div>
            <div className="elementor-tabs-content-wrapper" role="tablist" aria-orientation={type}>
              {items.map((rawItem: Record<string, any>, index: number) => {
                const item = rawItem || {};
                const active = useNativeRuntime ? index === defaultActiveIndex : index === activeIndex;
                const tabId = `${id}${index + 1}`;
                const activateTab = () => setActiveIndex(index);
                const handleKeyDown = (event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateTab();
                  }
                };
                return (
                  <React.Fragment key={item._id || `tab_content_${index}`}>
                    <div
                      className={`elementor-tab-title elementor-tab-mobile-title ${active ? 'elementor-active' : ''}`}
                      aria-selected={active}
                      data-tab={index + 1}
                      role="tab"
                      tabIndex={active ? 0 : -1}
                      aria-controls={`elementor-tab-content-${tabId}`}
                      onClick={useNativeRuntime ? undefined : activateTab}
                      onKeyDown={useNativeRuntime ? undefined : handleKeyDown}
                    >
                      {String(item.tab_title || '')}
                    </div>
                    <div
                      id={`elementor-tab-content-${tabId}`}
                      className={`elementor-tab-content elementor-clearfix ${active ? 'elementor-active' : ''}`}
                      data-tab={index + 1}
                      role="tabpanel"
                      aria-labelledby={`elementor-tab-title-${tabId}`}
                      hidden={!active}
                      style={{ display: active ? 'block' : 'none' }}
                      dangerouslySetInnerHTML={{ __html: String(item.tab_content || '') }}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('tabs', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'tabs', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Tabs as any).__elementorAbstraction = { kind: 'widget', name: 'Tabs', widgetKey: 'tabs' };

function resolvePreviewImageUrl(url: string): string {
  if (url.startsWith('asset://') && typeof window !== 'undefined') {
    const baseUrl = (window as any).__UP_IMAGES_BASE_URL;
    if (baseUrl) return url.replace('asset://', baseUrl + '/');
  }
  return url;
}

export const ImageGallery: React.FC<ImageGalleryProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image-gallery', props as Record<string, unknown>));
    const css = getImageGalleryCSS(id, settings);
    const images = Array.isArray(settings.wp_gallery) ? settings.wp_gallery : [];

    if (images.length === 0) return null;

    const columns = settings.gallery_columns || 4;
    const size = settings.thumbnail_size || 'thumbnail';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-image-gallery',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ImageGallery"
          data-widget_type="image-gallery.default"
        >
          <div className="elementor-image-gallery">
            <div className={`gallery galleryid-${id} gallery-columns-${columns} gallery-size-${size}`}>
              {images.map((rawImage: Record<string, any>, index: number) => {
                const image = rawImage || {};
                const src = resolvePreviewImageUrl(String(image.url || ''));
                if (!src) return null;
                const caption = String(image.caption || image.alt || '');
                const img = <img src={src} alt={String(image.alt || '')} loading="lazy" />;
                const content = settings.gallery_link === 'none' ? img : (
                  <a
                    href={settings.gallery_link === 'attachment' ? '#' : src}
                    data-elementor-open-lightbox={settings.gallery_link === 'file' ? settings.open_lightbox || 'default' : undefined}
                    data-elementor-lightbox-slideshow={settings.gallery_link === 'file' ? id : undefined}
                  >
                    {img}
                  </a>
                );

                return (
                  <figure className="gallery-item" key={image.id || `gallery_${index}`}>
                    <div className="gallery-icon">{content}</div>
                    {settings.gallery_display_caption !== 'none' && caption ? (
                      <figcaption className="gallery-caption">{caption}</figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('image-gallery', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image-gallery', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(ImageGallery as any).__elementorAbstraction = { kind: 'widget', name: 'ImageGallery', widgetKey: 'image-gallery' };

export const Counter: React.FC<CounterProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime();
    const settings = asPreviewSettings(mapWidgetProps('counter', props as Record<string, unknown>));
    const css = getCounterCSS(id, settings);
    const fromValue = Number(settings.starting_number ?? 0);
    const toValue = Number(settings.ending_number ?? 100);
    const delimiter = settings.thousand_separator === 'yes' ? String(settings.thousand_separator_char || ',') : '';
    const displayValue = useNativeRuntime ? fromValue : toValue;
    const TitleTag = (settings.title_tag || 'div') as keyof JSX.IntrinsicElements;
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-counter',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Counter"
          data-widget_type="counter.default"
        >
          <div className="elementor-counter">
            {settings.title ? <TitleTag className="elementor-counter-title">{String(settings.title)}</TitleTag> : null}
            <div className="elementor-counter-number-wrapper">
              <span className="elementor-counter-number-prefix">{String(settings.prefix || '')}</span>
              <span
                className="elementor-counter-number"
                data-duration={settings.duration ?? 2000}
                data-to-value={toValue}
                data-from-value={fromValue}
                data-delimiter={delimiter || undefined}
              >
                {displayValue}
              </span>
              <span className="elementor-counter-number-suffix">{String(settings.suffix || '')}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('counter', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'counter', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Counter as any).__elementorAbstraction = { kind: 'widget', name: 'Counter', widgetKey: 'counter' };

export const Progress: React.FC<ProgressProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime();
    const settings = asPreviewSettings(mapWidgetProps('progress', props as Record<string, unknown>));
    const css = getProgressCSS(id, settings);
    const percent = progressPercent(settings);
    const title = String(settings.title || '');
    const innerText = String(settings.inner_text || '');
    const showTitle = settings.title_display !== '' && title;
    const showPercentage = settings.display_percentage === 'show';
    const TitleTag = (settings.title_tag || 'span') as keyof JSX.IntrinsicElements;
    const progressClass = settings.progress_type ? `progress-${settings.progress_type}` : '';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-progress',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Progress"
          data-widget_type="progress.default"
        >
          <div className="elementor-progress">
            {showTitle ? <TitleTag className="elementor-title" id={`elementor-progress-bar-${id}`}>{title}</TitleTag> : null}
            <div
              className={`elementor-progress-wrapper ${progressClass}`.trim()}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-labelledby={showTitle ? `elementor-progress-bar-${id}` : undefined}
              aria-label={!showTitle ? title || innerText || `${percent}%` : undefined}
            >
              <div
                className="elementor-progress-bar"
                data-max={percent}
                style={{ width: useNativeRuntime ? undefined : `${percent}%` }}
              >
                {innerText ? <span className="elementor-progress-text">{innerText}</span> : null}
                {showPercentage ? <span className="elementor-progress-percentage">{percent}%</span> : null}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('progress', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'progress', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Progress as any).__elementorAbstraction = { kind: 'widget', name: 'Progress', widgetKey: 'progress' };
export const ProgressBar = Progress;
(ProgressBar as any).__elementorAbstraction = { kind: 'widget', name: 'ProgressBar', widgetKey: 'progress' };

function carouselCaptionForImage(image: Record<string, any>, captionType: string): string {
  if (captionType === 'title') return String(image.title || '')
  if (captionType === 'description') return String(image.description || '')
  if (captionType === 'caption') return String(image.caption || '')
  return ''
}

export const ImageCarousel: React.FC<ImageCarouselProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image-carousel', props as Record<string, unknown>));
    const css = getImageCarouselCSS(id, settings);
    const images = Array.isArray(settings.carousel) ? settings.carousel : [];

    if (images.length === 0) return null;

    const navigation = settings.navigation || 'both';
    const showArrows = images.length > 1 && (navigation === 'both' || navigation === 'arrows');
    const showDots = images.length > 1 && (navigation === 'both' || navigation === 'dots');
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-image-carousel',
      showArrows && settings.arrows_position ? `elementor-arrows-position-${settings.arrows_position}` : '',
      showDots && settings.dots_position ? `elementor-pagination-position-${settings.dots_position}` : '',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const dataSettings = widgetDataSettings(settings, [
      'slides_to_show', 'slides_to_show_tablet', 'slides_to_show_mobile',
      'slides_to_scroll', 'slides_to_scroll_tablet', 'slides_to_scroll_mobile',
      'navigation', 'lazyload', 'autoplay', 'pause_on_hover', 'pause_on_interaction',
      'autoplay_speed', 'infinite', 'effect', 'speed', 'image_spacing_custom',
      'image_spacing_custom_tablet', 'image_spacing_custom_mobile',
    ]);
    const domProps = getDomAttributes(props as Record<string, unknown>);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ImageCarousel"
          data-widget_type="image-carousel.default"
          data-settings={dataSettings}
        >
          <div
            className="elementor-image-carousel-wrapper swiper"
            role="region"
            aria-roledescription="carousel"
            aria-label={String(settings.carousel_name || 'Image Carousel')}
            dir={settings.direction || 'ltr'}
          >
            <div
              className={`elementor-image-carousel swiper-wrapper ${settings.image_stretch === 'yes' ? 'swiper-image-stretch' : ''}`.trim()}
              aria-live={settings.autoplay === 'yes' ? 'off' : 'polite'}
            >
              {images.map((rawImage: Record<string, any>, index: number) => {
                const image = rawImage || {};
                const src = resolvePreviewImageUrl(String(image.url || ''));
                if (!src) return null;
                const caption = carouselCaptionForImage(image, String(settings.caption_type || ''));
                const lazy = settings.lazyload === 'yes';
                const imageNode = (
                  <>
                    <img
                      className={`swiper-slide-image ${lazy ? 'swiper-lazy' : ''}`.trim()}
                      src={lazy ? undefined : src}
                      data-src={lazy ? src : undefined}
                      alt={String(image.alt || '')}
                    />
                    {lazy ? <div className="swiper-lazy-preloader" /> : null}
                  </>
                );
                const figure = (
                  <figure className="swiper-slide-inner">
                    {imageNode}
                    {caption ? <figcaption className="elementor-image-carousel-caption">{caption}</figcaption> : null}
                  </figure>
                );
                const content = settings.link_to === 'custom' && settings.link?.url ? (
                  <a href={settings.link.url} target={settings.link.is_external ? '_blank' : undefined} rel={settings.link.nofollow ? 'nofollow' : undefined}>{figure}</a>
                ) : settings.link_to === 'file' ? (
                  <a href={src} data-elementor-open-lightbox={settings.open_lightbox || 'default'} data-elementor-lightbox-slideshow={id}>{figure}</a>
                ) : figure;

                return (
                  <div
                    className="swiper-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${images.length}`}
                    key={image.id || `carousel_${index}`}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
            {showArrows ? (
              <>
                <div className="elementor-swiper-button elementor-swiper-button-prev" role="button" tabIndex={0}>
                  {renderPreviewIcon(settings.navigation_previous_icon)}
                </div>
                <div className="elementor-swiper-button elementor-swiper-button-next" role="button" tabIndex={0}>
                  {renderPreviewIcon(settings.navigation_next_icon)}
                </div>
              </>
            ) : null}
            {showDots ? <div className="swiper-pagination" /> : null}
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('image-carousel', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image-carousel', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(ImageCarousel as any).__elementorAbstraction = { kind: 'widget', name: 'ImageCarousel', widgetKey: 'image-carousel' };

export const NavMenu: React.FC<NavMenuProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('nav-menu', props as Record<string, unknown>));
    const css = getNavMenuCSS(id, settings);
    const items = props.items && props.items.length > 0
      ? props.items
      : [
          { text: 'Home', url: '#' },
          { text: 'About', url: '#' },
          { text: 'Contact', url: '#' },
        ];
    const layout = settings.layout || 'horizontal';
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-nav-menu',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const pointerClasses = [
      settings.pointer && settings.pointer !== 'none' ? `e--pointer-${settings.pointer}` : '',
      settings.animation_line || settings.animation_framed || settings.animation_background || settings.animation_text
        ? `e--animation-${settings.animation_line || settings.animation_framed || settings.animation_background || settings.animation_text}`
        : '',
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    const renderItems = (navItems: NavMenuItem[], depth = 0): ReactNode => (
      <ul className={depth === 0 ? 'elementor-nav-menu' : 'sub-menu elementor-nav-menu--dropdown'}>
        {navItems.map((item, index) => {
          const link = normalizeLink(item.link || item.url || '#') as Record<string, any>;
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          return (
            <li className={`menu-item ${hasChildren ? 'menu-item-has-children' : ''}`.trim()} key={item._id || `${depth}_${index}`}>
              <a href={String(link.url || '#')} className="elementor-item">
                <span>{item.text}</span>
                {hasChildren ? <span className="sub-arrow">{renderPreviewIcon(settings.submenu_icon || { value: 'fas fa-caret-down', library: 'fa-solid' })}</span> : null}
              </a>
              {hasChildren ? renderItems(item.children!, depth + 1) : null}
            </li>
          );
        })}
      </ul>
    );

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="NavMenu"
          data-widget_type="nav-menu.default"
          data-settings={widgetDataSettings(settings, ['layout', 'dropdown', 'toggle', 'full_width'])}
        >
          {settings.toggle !== 'none' ? (
            <div className="elementor-menu-toggle" role="button" tabIndex={0} aria-label="Menu Toggle" aria-expanded="false">
              {renderPreviewIcon(settings.toggle_icon_normal || { value: 'fas fa-bars', library: 'fa-solid' })}
            </div>
          ) : null}
          {layout !== 'dropdown' ? (
            <nav className={`elementor-nav-menu--main elementor-nav-menu__container elementor-nav-menu--layout-${layout} ${pointerClasses}`.trim()} aria-label={String(settings.menu_name || 'Menu')}>
              {renderItems(items)}
            </nav>
          ) : null}
          <nav className="elementor-nav-menu--dropdown elementor-nav-menu__container" aria-hidden={layout !== 'dropdown'} aria-label={`${String(settings.menu_name || 'Menu')} Dropdown`}>
            {renderItems(items)}
          </nav>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('nav-menu', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'nav-menu', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(NavMenu as any).__elementorAbstraction = { kind: 'widget', name: 'NavMenu', widgetKey: 'nav-menu' };

export const ElementorForm: React.FC<ElementorFormProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('form', props as Record<string, unknown>));
    const css = getElementorFormCSS(id, settings);
    const fields = Array.isArray(settings.form_fields) ? settings.form_fields as Record<string, any>[] : [];
    const validButtonAlign = (value: unknown) => {
      const align = String(value || '');
      return align === 'start' || align === 'center' || align === 'end' || align === 'stretch' ? align : undefined;
    };
    const buttonAlign = validButtonAlign(settings.button_align) || 'stretch';
    const buttonAlignTablet = validButtonAlign(settings.button_align_tablet);
    const buttonAlignMobile = validButtonAlign(settings.button_align_mobile);
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      `elementor-button-align-${buttonAlign}`,
      buttonAlignTablet ? `elementor-tablet-button-align-${buttonAlignTablet}` : null,
      buttonAlignMobile ? `elementor-mobile-button-align-${buttonAlignMobile}` : null,
      'elementor-widget',
      'elementor-widget-form',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);
    const renderField = (field: Record<string, any>) => {
      const type = String(field.field_type || 'text');
      const customId = String(field.custom_id || field._id || type);
      const fieldId = `form-field-${customId}`;
      const options = String(field.field_options || '').split(/\r?\n/).map(option => option.trim()).filter(Boolean);
      const common = {
        id: fieldId,
        name: `form_fields[${customId}]`,
        className: `elementor-field elementor-size-${settings.input_size || 'sm'} elementor-field-textual`,
        placeholder: String(field.placeholder || ''),
        defaultValue: String(field.field_value || ''),
        required: field.required === 'true',
      };
      if (type === 'textarea') return <textarea {...common} rows={Number(field.rows) || 4} />;
      if (type === 'select') {
        return (
          <div className="elementor-field elementor-select-wrapper remove-before">
            <div className="select-caret-down-wrapper" aria-hidden="true">
              <i className="eicon-caret-down" />
            </div>
            <select
              id={fieldId}
              name={`form_fields[${customId}]`}
              className={`elementor-field-textual elementor-size-${settings.input_size || 'sm'}`}
              required={field.required === 'true'}
              defaultValue={String(field.field_value || '')}
            >
              {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        );
      }
      if (type === 'radio' || type === 'checkbox') {
        return (
          <div className={`elementor-field-subgroup ${field.inline_list === 'yes' ? 'elementor-subgroup-inline' : ''}`.trim()}>
            {options.map((option, index) => (
              <span className="elementor-field-option" key={option}>
                <input id={`${fieldId}-${index}`} type={type} name={`form_fields[${customId}]${type === 'checkbox' ? '[]' : ''}`} value={option} defaultChecked={String(field.field_value || '') === option} />
                <label htmlFor={`${fieldId}-${index}`}>{option}</label>
              </span>
            ))}
          </div>
        );
      }
      if (type === 'acceptance') {
        return (
          <span className="elementor-field-option">
            <input id={fieldId} type="checkbox" name={`form_fields[${customId}]`} required={field.required === 'true'} />
            <label htmlFor={fieldId}>{String(field.field_label || 'I agree')}</label>
          </span>
        );
      }
      if (type === 'html') return <div className="elementor-field elementor-field-html" dangerouslySetInnerHTML={{ __html: String(field.field_html || field.field_value || '') }} />;
      if (type === 'hidden') return <input type="hidden" name={`form_fields[${customId}]`} value={String(field.field_value || '')} />;
      return <input {...common} type={type === 'upload' ? 'file' : type} min={field.field_min} max={field.field_max} />;
    };

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ElementorForm"
          data-widget_type="form.default"
        >
          <form className="elementor-form" method="post" name={String(settings.form_name || 'Contact Form')} aria-label={String(settings.form_name || 'Contact Form')} onSubmit={(event) => event.preventDefault()}>
            <input type="hidden" name="form_id" value={id} />
            <div className={`elementor-form-fields-wrapper elementor-labels-${settings.label_position === 'inline' ? 'inline' : 'above'}`}>
              {fields.map((field, index) => {
                const customId = String(field.custom_id || field._id || `field_${index + 1}`);
                const width = Math.max(1, Math.min(100, Number(field.width) || 100));
                const type = String(field.field_type || 'text');
                const isRequired = field.required === 'true';
                const groupClasses = [
                  `elementor-field-type-${type}`,
                  'elementor-field-group',
                  'elementor-column',
                  `elementor-field-group-${customId}`,
                  `elementor-col-${width}`,
                  isRequired ? 'elementor-field-required' : null,
                  isRequired && settings.mark_required === 'yes' ? 'elementor-mark-required' : null,
                ].filter(Boolean).join(' ');
                return (
                  <div className={groupClasses} key={field._id || customId}>
                    {settings.show_labels !== '' && type !== 'hidden' && type !== 'html' && type !== 'acceptance' ? (
                      <label className="elementor-field-label" htmlFor={`form-field-${customId}`}>{String(field.field_label || customId)}</label>
                    ) : null}
                    {renderField(field)}
                  </div>
                );
              })}
              <div className="elementor-field-group elementor-column elementor-field-type-submit elementor-col-100 e-form__buttons">
                <button className={`elementor-button elementor-size-${settings.button_size || 'sm'}`} type="submit">
                  <span className="elementor-button-content-wrapper">
                    {settings.selected_button_icon ? <span className="elementor-button-icon">{renderPreviewIcon(settings.selected_button_icon)}</span> : null}
                    <span className="elementor-button-text">{String(settings.button_text || 'Send')}</span>
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('form', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'form', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(ElementorForm as any).__elementorAbstraction = { kind: 'widget', name: 'ElementorForm', widgetKey: 'form' };

export const Slides: React.FC<SlidesProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('slides', props as Record<string, unknown>));
    const css = getSlidesCSS(id, settings);
    const slides = Array.isArray(settings.slides) ? settings.slides as Record<string, any>[] : [];
    if (slides.length === 0) return null;
    const navigation = settings.navigation || 'both';
    const showArrows = slides.length > 1 && (navigation === 'both' || navigation === 'arrows');
    const showDots = slides.length > 1 && (navigation === 'both' || navigation === 'dots');
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-slides',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);
    const dataSettings = widgetDataSettings(settings, [
      'navigation', 'autoplay', 'pause_on_hover', 'pause_on_interaction',
      'autoplay_speed', 'infinite', 'transition', 'transition_speed', 'content_animation',
    ]);

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Slides"
          data-widget_type="slides.default"
          data-settings={dataSettings}
        >
          <div className="elementor-slides-wrapper elementor-main-swiper swiper" role="region" aria-roledescription="carousel" aria-label={String(settings.slides_name || 'Slides')} data-animation={settings.content_animation || ''}>
            <div className="swiper-wrapper">
              {slides.map((slide, index) => {
                const imageUrl = resolvePreviewImageUrl(String(slide.background_image?.url || ''));
                const bgStyle: React.CSSProperties = {
                  backgroundColor: slide.background_color,
                  backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
                  backgroundSize: slide.background_size || 'cover',
                };
                const content = (
                  <div className="swiper-slide-inner">
                    <div className="swiper-slide-contents">
                      {slide.heading ? React.createElement(settings.slides_title_tag || 'div', { className: 'elementor-slide-heading' }, String(slide.heading)) : null}
                      {slide.description ? React.createElement(settings.slides_description_tag || 'div', { className: 'elementor-slide-description' }, String(slide.description)) : null}
                      {slide.button_text ? <a className={`elementor-button elementor-slide-button elementor-size-${settings.button_size || 'sm'}`} href={slide.link?.url || '#'}>{String(slide.button_text)}</a> : null}
                    </div>
                  </div>
                );
                return (
                  <div className={`swiper-slide elementor-repeater-item-${slide._id}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} key={slide._id || index}>
                    <div className="swiper-slide-bg" style={bgStyle} />
                    {slide.background_overlay === 'yes' ? <div className="elementor-background-overlay" style={{ backgroundColor: slide.background_overlay_color || 'rgba(0,0,0,0.35)' }} /> : null}
                    {slide.link?.url && slide.link_click === 'slide' ? <a className="swiper-slide-inner" href={slide.link.url}>{content}</a> : content}
                  </div>
                );
              })}
            </div>
            {showArrows ? (
              <>
                <div className="elementor-swiper-button elementor-swiper-button-prev" role="button" tabIndex={0}>{renderPreviewIcon({ value: 'eicon-chevron-left', library: 'eicons' })}</div>
                <div className="elementor-swiper-button elementor-swiper-button-next" role="button" tabIndex={0}>{renderPreviewIcon({ value: 'eicon-chevron-right', library: 'eicons' })}</div>
              </>
            ) : null}
            {showDots ? <div className="swiper-pagination" /> : null}
          </div>
        </div>
      </>
    );
  }

  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('slides', props as Record<string, unknown>);
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'slides', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Slides as any).__elementorAbstraction = { kind: 'widget', name: 'Slides', widgetKey: 'slides' };

export const Image: React.FC<ImageProps> = (props) => {
  const isPreview = useIsPreviewMode();
  const id = useMemo(() => props.id || generateElementId(), [props.id]);

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image', props as Record<string, unknown>));
    const css = getImageCSS(id, settings);
    const image = settings.image || {};
    let src = image.url || '';
    const alt = image.alt || props.alt || '';

    if (!src) return null;

    if (src && src.startsWith('asset://') && typeof window !== 'undefined') {
      const baseUrl = (window as any).__UP_IMAGES_BASE_URL;
      if (baseUrl) src = src.replace('asset://', baseUrl + '/');
    }

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-image',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ');
    const domProps = getDomAttributes(props as Record<string, unknown>);

    const imageClasses = [
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ');

    const renderImage = () => (
      <img
        src={src}
        className={imageClasses || undefined}
        title={image.title || ''}
        alt={alt}
        loading="lazy"
      />
    );

    const linkUrl = settings.link_to === 'custom'
      ? settings.link?.url
      : settings.link_to === 'file'
        ? src
        : undefined;

    const renderLinkedImage = () => {
      if (!linkUrl) return renderImage();
      const dataAttrs = settings.link_to === 'file' && settings.open_lightbox !== 'no' ? {
        'data-elementor-open-lightbox': settings.open_lightbox || 'default',
        'data-elementor-lightbox-slideshow': id,
      } : {};
      return (
        <a
          href={linkUrl}
          target={settings.link?.is_external ? '_blank' : undefined}
          rel={settings.link?.nofollow ? 'nofollow' : settings.link?.is_external ? 'noopener noreferrer' : undefined}
          {...dataAttrs}
        >
          {renderImage()}
        </a>
      );
    };

    const caption = settings.caption_source === 'custom' ? settings.caption :
                    settings.caption_source === 'attachment' ? image.title : undefined;
    const content = caption ? (
      <figure className="wp-caption">
        {renderLinkedImage()}
        <figcaption className="widget-image-caption wp-caption-text">
          {caption}
        </figcaption>
      </figure>
    ) : renderLinkedImage();

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Image"
          data-widget_type="image.default"
        >
          {content}
        </div>
      </>
    );
  }

  // JSON mode
  const doc = useDocument();
  const parent = useElementContext();
  const settings = mapWidgetProps('image', props as Record<string, unknown>);

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image', settings };

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId);
  }, []);

  return null;
};
(Image as any).__elementorAbstraction = { kind: 'widget', name: 'Image', widgetKey: 'image' };

// =============================================================================
// DOCUMENT BUILDER
// =============================================================================

interface DocumentBuilderProps {
  title?: string;
  children: React.ReactNode;
  onBuild?: (doc: ElementorDocument) => void;
}

export const DocumentBuilder: React.FC<DocumentBuilderProps> = ({ title = 'Untitled', children, onBuild }) => {
  const isPreview = useIsPreviewMode();
  const documentId = useMemo(() => generateElementId(), []);
  const elementsRef = React.useRef<Map<string, ElementorElement>>(new Map());
  const rootElementsRef = React.useRef<string[]>([]);

  const addElement = useCallback((element: ElementorElement, parentId?: string) => {
    elementsRef.current.set(element.id, element);
    if (parentId) {
      const parent = elementsRef.current.get(parentId);
      if (parent) {
        parent.elements = parent.elements || [];
        parent.elements.push(element);
      }
    } else {
      rootElementsRef.current.push(element.id);
    }
  }, []);

  const getElements = useCallback((): ElementorElement[] => {
    return rootElementsRef.current.map(id => elementsRef.current.get(id)!).filter(Boolean);
  }, []);

  const contextValue = useMemo(() => ({ documentId, addElement, getElements }), [documentId, addElement, getElements]);

  React.useEffect(() => {
    if (onBuild) {
      const doc: ElementorDocument = {
        title,
        status: 'publish',
        type: 'page',
        version: '0.4',
        settings: {},
        page_settings: {},
        elements: getElements(),
      };
      onBuild(doc);
    }
  }, [onBuild, title, getElements]);

  const content = <DocumentContext.Provider value={contextValue}>{children}</DocumentContext.Provider>;
  return isPreview ? (
    <CSSProvider documentId={documentId}>
      <div className={`elementor elementor-${documentId}`}>
        {content}
      </div>
    </CSSProvider>
  ) : content;
};

// =============================================================================
// COMPILER (from demo-app)
// =============================================================================

type NormalizedNode = {
  meta: AbstractionComponentMeta
  props: Record<string, unknown>
  children: NormalizedNode[]
}

type AbstractionComponent<P> = JSXElementConstructor<P> & {
  __elementorAbstraction?: AbstractionComponentMeta
}

function getMetaFromType(type: unknown): AbstractionComponentMeta | undefined {
  return (type as AbstractionComponent<unknown> | undefined)?.__elementorAbstraction
}

function normalizeChildren(value: ReactNode): NormalizedNode[] {
  const normalized: NormalizedNode[] = []
  for (const child of Children.toArray(value)) {
    const next = normalizeNode(child)
    if (next) normalized.push(next)
  }
  return normalized
}

function normalizeNode(node: ReactNode): NormalizedNode | null {
  if (!isValidElement(node)) return null

  const nodeProps = (node.props ?? {}) as { children?: ReactNode }

  if (node.type === Fragment) {
    const children = normalizeChildren(nodeProps.children)
    if (children.length === 0) return null
    return { meta: { kind: 'page', name: 'Fragment' }, props: {}, children }
  }

  const meta = getMetaFromType(node.type)
  if (!meta) return null

  const { children, ...props } = nodeProps as Record<string, unknown>
  return { meta, props, children: normalizeChildren(children as ReactNode) }
}

function compileElement(node: NormalizedNode, isInner = false): ElementorElement {
  if (node.meta.kind === 'page') {
    throw new Error('Page nodes cannot be compiled as elements.')
  }

  const element: ElementorElement = {
    id: typeof node.props.id === 'string' ? node.props.id : generateSequentialId(),
    elType: node.meta.kind === 'container' ? 'container' : 'widget',
    settings: {},
    elements: [],
  }

  if (node.meta.kind === 'container') {
    element.isInner = isInner
    if (node.meta.containerType === 'grid') {
      element.settings = mapGridProps(node.props)
    } else {
      element.settings = mapFlexboxProps(node.props)
    }
  } else {
    element.widgetType = node.meta.widgetKey!
    element.settings = mapWidgetProps(node.meta.widgetKey!, node.props)
  }

  element.elements = node.children
    .filter((child) => child.meta.kind !== 'page')
    .map((child) => compileElement(child, true))

  return element
}

export function compileReactPage(input: ReactNode, title = 'Generated Page'): ElementorDocument {
  resetIdCounter()
  const normalized = normalizeChildren(input)

  let rootChildren: NormalizedNode[]
  let pageTitle = title

  if (normalized.length === 1 && normalized[0]?.meta.kind === 'page' && normalized[0].meta.name === 'Page') {
    const pageNode = normalized[0]
    rootChildren = pageNode.children
    if (typeof pageNode.props.title === 'string') pageTitle = pageNode.props.title
  } else {
    rootChildren = normalized.filter((child) => child.meta.name !== 'Fragment')
    if (normalized.length === 1 && normalized[0]?.meta.name === 'Fragment') {
      rootChildren = normalized[0].children
    }
  }

  return {
    title: pageTitle,
    type: 'wp-page',
    status: 'publish',
    version: '0.4',
    settings: {},
    page_settings: {},
    elements: rootChildren.map((child) => compileElement(child, false)),
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function createElement(
  type: 'container' | 'widget',
  widgetType: string | undefined,
  settings: Record<string, any>,
  children?: ElementorElement[]
): ElementorElement {
  return {
    id: generateElementId(),
    elType: type,
    widgetType,
    settings,
    elements: children,
  };
}

export function createDocument(
  elements: ElementorElement[],
  options?: {
    title?: string;
    pageSettings?: Record<string, any>;
  }
): ElementorDocument {
  return {
    title: options?.title || 'Untitled',
    status: 'publish',
    type: 'page',
    version: '0.4',
    settings: {},
    page_settings: options?.pageSettings || {},
    elements,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { generateElementId };
