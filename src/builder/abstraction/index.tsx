/**
 * JSX Abstraction Layer for Elementor
 *
 * Clean JSX components that compile to Elementor JSON.
 * Core widgets: Grid, Flexbox, Heading, TextEditor, Button, Icon, Image
 *
 * Supports dual-mode rendering:
 * - JSON mode: compiles to Elementor JSON for export
 * - Preview mode: renders HTML with Elementor-compatible CSS for live preview
 */

import React, { Children, Fragment, isValidElement, createContext, useContext, useMemo, useCallback, type ReactNode, type JSXElementConstructor } from 'react';
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

function normalizeImage(value: ImageLike | undefined): Record<string, JsonValue> | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { url: value }
  return value as Record<string, JsonValue>
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
