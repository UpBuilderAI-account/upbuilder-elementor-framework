/**
 * Utility and normalizer functions for the Elementor JSX Abstraction Layer
 */

import type {
  ResponsiveValue,
  DimensionsValue,
  LinkLike,
  IconLike,
  ImageLike,
  GalleryImage,
  CarouselImage,
  ElementorFormField,
  SlideItem,
  JsonValue,
  ElementorSettingsInput,
  TextShadowValue,
  TextStrokeValue,
  CSSFilterValue,
  BoxContentStyleProps,
  BaseProps,
} from './types';

// =============================================================================
// BASIC TYPE CHECKS
// =============================================================================

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isResponsiveObject<T>(value: ResponsiveValue<T> | undefined): value is { desktop?: T; tablet?: T; mobile?: T } {
  return isPlainObject(value) && ('desktop' in value || 'tablet' in value || 'mobile' in value)
}

// =============================================================================
// VALUE NORMALIZERS
// =============================================================================

export function normalizeSliderValue(value: unknown): JsonValue | undefined {
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

export function normalizeTimeValue(value: unknown): JsonValue | undefined {
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

export function normalizeFlexGapValue(value: unknown): JsonValue | undefined {
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

export function normalizeLineHeight(value: unknown): JsonValue | undefined {
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

export function normalizeLink(value: LinkLike | undefined): JsonValue | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { url: value }
  return value as JsonValue
}

export function normalizeIcon(value: IconLike | undefined): JsonValue | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    const library = value.startsWith('eicon-') ? 'eicons' :
                    value.startsWith('fab ') ? 'fa-brands' :
                    value.startsWith('far ') ? 'fa-regular' : 'fa-solid'
    return { value, library }
  }
  return value as JsonValue
}

export function normalizeImage(value: ImageLike | undefined): Record<string, JsonValue> | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { url: value }
  return value as Record<string, JsonValue>
}

export function normalizeTextShadow(value: TextShadowValue | undefined): JsonValue | undefined {
  if (!value) return undefined
  return {
    horizontal: value.horizontal ?? 0,
    vertical: value.vertical ?? 2,
    blur: value.blur ?? 4,
    color: value.color ?? 'rgba(0,0,0,0.3)',
  }
}

export function normalizeDimensions(value: unknown): JsonValue | undefined {
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

export function normalizePercentValue(value: unknown): JsonValue | undefined {
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

// =============================================================================
// ALIGNMENT NORMALIZERS
// =============================================================================

export function normalizeButtonIconAlign(value: unknown): JsonValue | undefined {
  if (value === 'left') return 'row'
  if (value === 'right') return 'row-reverse'
  if (value === 'row' || value === 'row-reverse') return value
  return undefined
}

export function normalizeIconListAlign(value: unknown): JsonValue | undefined {
  if (value === 'left') return 'start'
  if (value === 'right') return 'end'
  if (value === 'start' || value === 'center' || value === 'end') return value
  return undefined
}

export function normalizeTextAlign(value: unknown): JsonValue | undefined {
  if (value === 'left') return 'start'
  if (value === 'right') return 'end'
  if (value === 'start' || value === 'center' || value === 'end' || value === 'justify') return value
  return undefined
}

export function normalizeIconBoxPosition(value: unknown): JsonValue | undefined {
  if (value === 'top') return 'block-start'
  if (value === 'bottom') return 'block-end'
  if (value === 'left' || value === 'start') return 'inline-start'
  if (value === 'right' || value === 'end') return 'inline-end'
  if (value === 'block-start' || value === 'block-end' || value === 'inline-start' || value === 'inline-end') return value
  return undefined
}

export function normalizeImageBoxPosition(value: unknown): JsonValue | undefined {
  if (value === 'start') return 'left'
  if (value === 'end') return 'right'
  if (value === 'left' || value === 'top' || value === 'right') return value
  return undefined
}

export function normalizeBoxVerticalAlign(value: unknown): JsonValue | undefined {
  if (value === 'top' || value === 'middle' || value === 'bottom') return value
  return undefined
}

// =============================================================================
// BOOLEAN CONVERTERS
// =============================================================================

export function booleanToElementorYes(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined
  return value ? 'yes' : ''
}

export function booleanToElementorShow(value: unknown): JsonValue | undefined {
  if (value === undefined) return undefined
  return value ? 'show' : ''
}

// =============================================================================
// DOM ATTRIBUTES
// =============================================================================

export function getDomAttributes(props: Record<string, unknown>): Record<string, string | number | boolean> {
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

// =============================================================================
// RESPONSIVE SETTINGS
// =============================================================================

export function setResponsiveSetting(
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

export function setResponsiveNumberSetting(
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
// TEXT STYLE SETTINGS
// =============================================================================

export function setTextStrokeSettings(
  target: ElementorSettingsInput,
  prefix: string,
  value: TextStrokeValue | undefined
) {
  if (!value) return
  target[`${prefix}_text_stroke_type`] = 'yes'
  if (value.width !== undefined) target[`${prefix}_text_stroke_width`] = normalizeSliderValue(value.width)!
  if (value.color) target[`${prefix}_text_stroke_color`] = value.color
  if (value.width !== undefined) target[`${prefix}_text_stroke`] = normalizeSliderValue(value.width)!
  if (value.color) target[`${prefix}_stroke_color`] = value.color
}

export function setBoxTextStyleSettings(
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

export function setCssFilterSettings(target: ElementorSettingsInput, prefix: 'css_filters' | 'css_filters_hover', value: CSSFilterValue | undefined) {
  if (!value) return
  target[`${prefix}_css_filter`] = 'custom'
  if (value.blur !== undefined) target[`${prefix}_blur`] = normalizeSliderValue(value.blur)!
  if (value.brightness !== undefined) target[`${prefix}_brightness`] = { size: value.brightness, unit: 'px' }
  if (value.contrast !== undefined) target[`${prefix}_contrast`] = { size: value.contrast, unit: 'px' }
  if (value.saturate !== undefined) target[`${prefix}_saturate`] = { size: value.saturate, unit: 'px' }
  if (value.hue !== undefined) target[`${prefix}_hue`] = { size: value.hue, unit: 'px' }
  if (value.grayscale !== undefined) target[`${prefix}_grayscale`] = { size: value.grayscale, unit: 'px' }
}

export function setSimpleTypographySettings(
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

// =============================================================================
// DATA NORMALIZERS
// =============================================================================

export function normalizeGalleryImage(value: GalleryImage, index: number): Record<string, JsonValue> {
  if (typeof value === 'string') return { id: index + 1, url: value }
  const image: Record<string, JsonValue> = {
    id: value.id ?? index + 1,
    url: value.url,
  }
  if (value.alt) image.alt = value.alt
  if (value.caption) image.caption = value.caption
  return image
}

export function normalizeCarouselImage(value: CarouselImage, index: number): Record<string, JsonValue> {
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

export function stableRepeaterId(prefix: string, index: number, provided?: string): string {
  return provided || `${prefix}_${index + 1}`
}

export function slugifyFieldId(value: string, index: number): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
  return slug || `field_${index + 1}`
}

export function normalizeFormOptions(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join('\n')
  return value || ''
}

export function normalizeElementorFormField(field: ElementorFormField, index: number): Record<string, JsonValue> {
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

export function normalizeSlideItem(slide: SlideItem, index: number): Record<string, JsonValue> {
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

// =============================================================================
// GRID HELPERS
// =============================================================================

export function normalizeGridGaps(value: unknown): JsonValue | undefined {
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
    const obj = value as { row?: number | string; column?: number | string; unit?: string; size?: number | string }
    if ('row' in obj || 'column' in obj) {
      return { row: obj.row ?? 0, column: obj.column ?? 0, unit: obj.unit ?? 'px' } as JsonValue
    }
    if ('size' in obj) {
      const size = typeof obj.size === 'number' ? obj.size : parseFloat(String(obj.size ?? 0))
      return { row: size, column: size, unit: obj.unit ?? 'px' }
    }
  }
  return undefined
}

export function normalizeGridTrackValue(value: unknown): JsonValue | undefined {
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

export function formatGridTrack(value: unknown): string | undefined {
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

// =============================================================================
// SHARED LAYOUT PROPS
// =============================================================================

export function mapSharedLayoutProps(
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
