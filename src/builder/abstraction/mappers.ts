/**
 * Props mapping functions for the Elementor JSX Abstraction Layer
 * Maps React props to Elementor settings format
 */

/**
 * Resolve `asset://` prefixed URLs against `window.__UP_IMAGES_BASE_URL` so
 * the React preview iframe can load images from S3. On the server (build/
 * export pipeline) `window` is undefined and we leave the `asset://` prefix
 * intact for downstream code (`resolveAssetUrlsInSettings` in the backend
 * builder) to substitute the project-specific S3 path.
 *
 * Without this, `<Container backgroundImage={{ url: "asset://hero.webp" }} />`
 * rendered in the iframe ends up with `background-image: url(asset://...)`
 * which the browser cannot resolve → no image visible in the preview, even
 * though the Elementor PHP render works correctly.
 */
function resolveAssetUrlForPreview(url: string): string {
  if (url.startsWith('asset://') && typeof window !== 'undefined') {
    const baseUrl = (window as { __UP_IMAGES_BASE_URL?: string }).__UP_IMAGES_BASE_URL
    if (baseUrl) return url.replace('asset://', baseUrl + '/')
  }
  return url
}

import type {
  GridProps,
  FlexboxProps,
  HeadingProps,
  TextEditorProps,
  ButtonProps,
  IconProps,
  IconBoxProps,
  IconListProps,
  ImageProps,
  ImageBoxProps,
  AccordionProps,
  ToggleProps,
  TabsProps,
  ImageGalleryProps,
  CounterProps,
  ProgressProps,
  ImageCarouselProps,
  NavMenuProps,
  ElementorFormProps,
  SlidesProps,
  TestimonialCarouselProps,
  ElementorSettingsInput,
  JsonValue,
  BaseProps,
} from './types';

import {
  isResponsiveObject,
  normalizeSliderValue,
  normalizeFlexGapValue,
  normalizeLineHeight,
  normalizeLink,
  normalizeIcon,
  normalizeImage,
  normalizeDimensions,
  normalizePercentValue,
  normalizeButtonIconAlign,
  normalizeIconListAlign,
  normalizeTextAlign,
  normalizeIconBoxPosition,
  normalizeImageBoxPosition,
  normalizeBoxVerticalAlign,
  normalizeTimeValue,
  normalizeGridGaps,
  normalizeGridTrackValue,
  normalizeGalleryImage,
  normalizeCarouselImage,
  normalizeElementorFormField,
  normalizeSlideItem,
  normalizeTestimonialItem,
  setResponsiveSetting,
  setResponsiveNumberSetting,
  setTextStrokeSettings,
  setBoxTextStyleSettings,
  setCssFilterSettings,
  setSimpleTypographySettings,
  mapSharedLayoutProps,
} from './utils';

// =============================================================================
// CONTAINER PROPS MAPPERS
// =============================================================================

export function mapGridProps(props: Record<string, unknown>): ElementorSettingsInput {
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

  // The unified Container API exposes backgroundImage / backgroundGradient on
  // grid layouts too. The legacy GridProps type didn't include them, but
  // ContainerProps does — accept them via a relaxed cast and drop into the
  // same shape mapFlexboxProps uses.
  const bgP = p as GridProps & { backgroundImage?: { url: string; position?: string; size?: string; repeat?: string }; backgroundGradient?: { type?: 'linear' | 'radial'; angle?: number; position?: string; colorA?: string; colorB?: string; locationA?: number; locationB?: number } }
  if (bgP.backgroundGradient) {
    const g = bgP.backgroundGradient
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
  } else if (bgP.backgroundImage) {
    settings.background_background = 'classic'
    settings.background_image = { url: resolveAssetUrlForPreview(bgP.backgroundImage.url) }
    if (bgP.backgroundImage.position) settings.background_position = bgP.backgroundImage.position
    if (bgP.backgroundImage.size) settings.background_size = bgP.backgroundImage.size
    if (bgP.backgroundImage.repeat) settings.background_repeat = bgP.backgroundImage.repeat
    if (p.backgroundColor) settings.background_color = p.backgroundColor
  } else if (p.backgroundColor) {
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

export function mapFlexboxProps(props: Record<string, unknown>): ElementorSettingsInput {
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
    settings.background_image = { url: resolveAssetUrlForPreview(p.backgroundImage.url) }
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
    // Pass through the required `backgroundOverlayOpacity`. The validator
    // enforces that it is set whenever `backgroundOverlay` is set; this
    // mapping is the single place the value reaches Elementor's overlay
    // opacity setting (which the PHP renderer applies as --overlay-opacity).
    if (p.backgroundOverlayOpacity !== undefined) {
      settings.background_overlay_opacity = { size: p.backgroundOverlayOpacity, unit: 'px' }
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
  if (p.alignSelf !== undefined) setResponsiveSetting(settings, '_flex_align_self', p.alignSelf)

  if (p.settings) Object.assign(settings, p.settings)
  return settings
}

// =============================================================================
// WIDGET PROPS MAPPER
// =============================================================================

export function mapWidgetProps(widgetKey: string, props: Record<string, unknown>): ElementorSettingsInput {
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
      setResponsiveSetting(settings, 'align', p.align, (v) => v === 'stretch' ? 'justify' : v as JsonValue)
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
      settings.title = p.title ?? ''
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

    case 'testimonial-carousel': {
      const p = props as TestimonialCarouselProps
      // Repeater (Elementor key is `slides`, not `items` — base carousel widget convention)
      settings.slides = (p.items || []).map(normalizeTestimonialItem) as JsonValue
      if (p.slidesName) settings.slides_name = p.slidesName

      // Skin & layout
      if (p.skin) settings.skin = p.skin
      if (p.layout) settings.layout = p.layout
      setResponsiveSetting(settings, 'alignment', p.alignment)

      // Carousel behavior
      setResponsiveSetting(settings, 'slides_per_view', p.slidesPerView)
      setResponsiveSetting(settings, 'slides_to_scroll', p.slidesToScroll)
      setResponsiveSetting(settings, 'width', p.width, normalizeSliderValue)
      setResponsiveSetting(settings, 'space_between', p.spaceBetween, normalizeSliderValue)
      if (p.lazyload !== undefined) settings.lazyload = p.lazyload ? 'yes' : ''

      // Per-slide wrapper styling
      if (p.slideBackgroundColor) settings.slide_background_color = p.slideBackgroundColor
      if (p.slideBorderSize !== undefined) settings.slide_border_size = normalizeDimensions(p.slideBorderSize) as JsonValue
      if (p.slideBorderRadius !== undefined) settings.slide_border_radius = normalizeSliderValue(p.slideBorderRadius) as JsonValue
      if (p.slideBorderColor) settings.slide_border_color = p.slideBorderColor
      if (p.slidePadding !== undefined) settings.slide_padding = normalizeDimensions(p.slidePadding) as JsonValue

      // Navigation (derive show_arrows + pagination from `navigation` shortcut, but allow overrides)
      if (p.navigation) {
        const showArrows = p.navigation === 'arrows' || p.navigation === 'both' ? 'yes' : ''
        const pagination = p.navigation === 'dots' || p.navigation === 'both' ? 'bullets' : ''
        settings.show_arrows = showArrows
        settings.pagination = pagination
      }
      if (p.showArrows !== undefined) settings.show_arrows = p.showArrows ? 'yes' : ''
      if (p.pagination !== undefined) settings.pagination = p.pagination === 'none' ? '' : p.pagination

      if (p.autoplay !== undefined) settings.autoplay = p.autoplay ? 'yes' : ''
      if (p.autoplaySpeed !== undefined) settings.autoplay_speed = p.autoplaySpeed
      if (p.transitionSpeed !== undefined) settings.speed = p.transitionSpeed
      if (p.infinite !== undefined) settings.loop = p.infinite ? 'yes' : ''
      if (p.pauseOnHover !== undefined) settings.pause_on_hover = p.pauseOnHover ? 'yes' : ''
      if (p.pauseOnInteraction !== undefined) settings.pause_on_interaction = p.pauseOnInteraction ? 'yes' : ''

      // Image (avatar) styling
      setResponsiveSetting(settings, 'image_size', p.imageSize, normalizeSliderValue)
      setResponsiveSetting(settings, 'image_gap', p.imageGap, normalizeSliderValue)
      if (p.imageBorder !== undefined) settings.image_border = p.imageBorder ? 'yes' : ''
      if (p.imageBorderColor) settings.image_border_color = p.imageBorderColor
      setResponsiveSetting(settings, 'image_border_width', p.imageBorderWidth, normalizeSliderValue)
      if (p.imageBorderRadius !== undefined) settings.image_border_radius = normalizeSliderValue(p.imageBorderRadius) as JsonValue

      // Content (quote) styling
      if (p.contentColor) settings.content_color = p.contentColor
      setResponsiveSetting(settings, 'content_gap', p.contentGap, normalizeSliderValue)
      setSimpleTypographySettings(settings, 'content_typography', p as Record<string, unknown>, 'content')

      // Name styling
      if (p.nameColor) settings.name_color = p.nameColor
      setSimpleTypographySettings(settings, 'name_typography', p as Record<string, unknown>, 'name')

      // Title (role) styling
      if (p.titleColor) settings.title_color = p.titleColor
      setSimpleTypographySettings(settings, 'title_typography', p as Record<string, unknown>, 'title')

      // Bubble skin
      if (p.backgroundColor) settings.background_color = p.backgroundColor
      setResponsiveSetting(settings, 'text_padding', p.textPadding, normalizeDimensions)
      setResponsiveSetting(settings, 'border_radius', p.borderRadius, normalizeDimensions)
      if (p.border !== undefined) settings.border = p.border ? 'yes' : ''
      if (p.borderColor) settings.border_color = p.borderColor
      setResponsiveSetting(settings, 'border_width', p.borderWidth, normalizeSliderValue)

      // Navigation styling
      setResponsiveSetting(settings, 'arrows_size', p.arrowsSize, normalizeSliderValue)
      if (p.arrowsColor) settings.arrows_color = p.arrowsColor
      setResponsiveSetting(settings, 'pagination_size', p.paginationSize, normalizeSliderValue)
      setResponsiveSetting(settings, 'pagination_gap', p.paginationGap, normalizeSliderValue)
      if (p.paginationColor) settings.pagination_color = p.paginationColor
      if (p.paginationColorInactive) settings.pagination_color_inactive = p.paginationColorInactive

      break
    }
  }

  Object.assign(settings, userSettings)
  return settings
}
