/**
 * CSS generation functions for the Elementor JSX Abstraction Layer
 */

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
import { formatGridTrack, getDomAttributes } from './utils';
import type { ElementorSettingsInput } from './types';

// =============================================================================
// PREVIEW HELPERS
// =============================================================================

type PreviewSettings = Record<string, any>
type ResponsiveSuffix = '' | '_tablet' | '_mobile'

export function asPreviewSettings(settings: ElementorSettingsInput): PreviewSettings {
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

/**
 * Pushes `display: none` rules for `hide_desktop`/`hide_tablet`/`hide_mobile`
 * settings. Used by both widget Advanced CSS and container CSS so the
 * `advanced.hideOnDesktop/Tablet/Mobile` props work on every element.
 */
function pushHideOnBreakpointRules(cssRules: CSSRule[], settings: PreviewSettings) {
  if (settings.hide_desktop) {
    cssRules.push({
      selector: '@media (min-width: 1025px)',
      properties: { display: 'none' },
    })
  }
  if (settings.hide_tablet) {
    cssRules.push({
      selector: '@media (max-width: 1024px) and (min-width: 768px)',
      properties: { display: 'none' },
    })
  }
  if (settings.hide_mobile) {
    cssRules.push({
      selector: '@media (max-width: 767px)',
      properties: { display: 'none' },
    })
  }
}

// =============================================================================
// ADVANCED CSS (universal `_*` widget settings)
// =============================================================================

/**
 * Emits CSS for the universal Advanced controls (`advanced` prop on every
 * widget). Targets the widget's outer `.elementor-element-${id}`. Real
 * Elementor frontends apply these to `{{WRAPPER}} > .elementor-widget-container`,
 * but our preview renders most widgets without that inner wrapper, so we
 * apply them to the outer element directly. The exported JSON keeps the
 * standard `_*` keys, so production rendering still uses Elementor's native
 * cascade unchanged.
 */
export function getAdvancedCSS(id: string, settings: PreviewSettings): string {
  const cssRules: CSSRule[] = []

  // Helper: parse responsive spacing for a key prefix
  const padding = parseSpacing(settings._padding)
  const margin = parseSpacing(settings._margin)
  const borderRadius = parseBorderRadius(settings._border_radius)
  const borderWidth = parseSpacing(settings._border_width) || parseDimension(settings._border_width)
  const borderStyle = settings._border_border
  const borderColor = settings._border_color
  const boxShadow = parseBoxShadow(settings._box_shadow_box_shadow, settings, '_box_shadow')
  const bg = parseBackground(settings, '_background')
  const zIndex = settings._z_index !== undefined ? String(settings._z_index) : undefined
  const alignSelf = settings._flex_align_self
  const flexGrow = settings._flex_grow !== undefined ? String(settings._flex_grow) : undefined
  const flexShrink = settings._flex_shrink !== undefined ? String(settings._flex_shrink) : undefined
  const flexOrder = settings._flex_order !== undefined ? String(settings._flex_order) : undefined

  const baseProps: Record<string, string | undefined> = {
    padding,
    margin,
    borderRadius,
    borderWidth,
    borderStyle,
    borderColor,
    boxShadow,
    zIndex,
    alignSelf,
    flexGrow,
    flexShrink,
    order: flexOrder,
    ...bg,
  }

  // Drop undefined to avoid emitting empty declarations
  const hasAny = Object.values(baseProps).some(v => v !== undefined && v !== '')
  if (!hasAny && !settings._padding_tablet && !settings._padding_mobile
    && !settings._margin_tablet && !settings._margin_mobile
    && !settings._border_radius_tablet && !settings._border_radius_mobile
    && !settings._border_width_tablet && !settings._border_width_mobile
    && !settings._flex_align_self_tablet && !settings._flex_align_self_mobile
    && !settings._flex_grow_tablet && !settings._flex_grow_mobile
    && !settings._flex_shrink_tablet && !settings._flex_shrink_mobile
    && !settings._z_index_tablet && !settings._z_index_mobile
    && !settings.hide_desktop && !settings.hide_tablet && !settings.hide_mobile
  ) {
    return ''
  }

  cssRules.push({ selector: '', properties: baseProps })

  // Hide-on-breakpoint
  pushHideOnBreakpointRules(cssRules, settings)

  // Tablet responsive overrides
  const tabletProps: Record<string, string | undefined> = {
    padding: parseSpacing(settings._padding_tablet),
    margin: parseSpacing(settings._margin_tablet),
    borderRadius: parseBorderRadius(settings._border_radius_tablet),
    borderWidth: parseSpacing(settings._border_width_tablet) || parseDimension(settings._border_width_tablet),
    alignSelf: settings._flex_align_self_tablet,
    zIndex: settings._z_index_tablet !== undefined ? String(settings._z_index_tablet) : undefined,
    flexGrow: settings._flex_grow_tablet !== undefined ? String(settings._flex_grow_tablet) : undefined,
    flexShrink: settings._flex_shrink_tablet !== undefined ? String(settings._flex_shrink_tablet) : undefined,
    order: settings._flex_order_tablet !== undefined ? String(settings._flex_order_tablet) : undefined,
  }
  if (Object.values(tabletProps).some(v => v !== undefined && v !== '')) {
    cssRules.push({ selector: '@media (max-width: 1024px)', properties: tabletProps })
  }

  // Mobile responsive overrides
  const mobileProps: Record<string, string | undefined> = {
    padding: parseSpacing(settings._padding_mobile),
    margin: parseSpacing(settings._margin_mobile),
    borderRadius: parseBorderRadius(settings._border_radius_mobile),
    borderWidth: parseSpacing(settings._border_width_mobile) || parseDimension(settings._border_width_mobile),
    alignSelf: settings._flex_align_self_mobile,
    zIndex: settings._z_index_mobile !== undefined ? String(settings._z_index_mobile) : undefined,
    flexGrow: settings._flex_grow_mobile !== undefined ? String(settings._flex_grow_mobile) : undefined,
    flexShrink: settings._flex_shrink_mobile !== undefined ? String(settings._flex_shrink_mobile) : undefined,
    order: settings._flex_order_mobile !== undefined ? String(settings._flex_order_mobile) : undefined,
  }
  if (Object.values(mobileProps).some(v => v !== undefined && v !== '')) {
    cssRules.push({ selector: '@media (max-width: 767px)', properties: mobileProps })
  }

  return generateCSS(id, cssRules)
}

/**
 * Container outer-element padding handling.
 *
 * No-op: this function intentionally returns no `padding` declarations and
 * defers entirely to the var-driven Elementor stock CSS. Elementor's own
 * `container.php:1396` only sets `--padding-top/right/bottom/left` on the
 * wrapper — it never sets the `padding` shorthand. The frontend stylesheet
 * (`backendv2/public/cdn/css/elementor/frontend.min.css`) then routes the
 * vars to the right element:
 *
 *   .e-con {
 *     --padding-inline-start: var(--padding-left);     // LTR mapping
 *     --padding-inline-end:   var(--padding-right);
 *     padding-inline-start:   var(--padding-inline-start);
 *     padding-inline-end:     var(--padding-inline-end);
 *   }
 *   .e-con-full, .e-con > .e-con-inner {
 *     padding-block-start: var(--padding-block-start);
 *     padding-block-end:   var(--padding-block-end);
 *   }
 *   .e-con > .e-con-inner { padding-inline-start: 0; padding-inline-end: 0; }
 *
 *   Result:
 *     full-width outer → all 4 sides
 *     boxed outer      → inline only (left/right)
 *     boxed inner      → block only (top/bottom)
 *
 * Setting the `padding` shorthand on the outer (the previous behavior) caused
 * the boxed case to apply vertical padding TWICE — once on the outer via
 * shorthand, again on the inner via the stock rule. The fix is to skip the
 * shorthand entirely and let the vars + stock CSS do the distribution, which
 * is exactly what native Elementor does.
 *
 * The `--padding-*` vars are emitted separately via `spacingVariables(...)`
 * — that's the single source of truth for both outer and inner padding.
 *
 * If you ever need a fallback that works without the stock CSS loaded, this
 * is the place to add it; for now stock CSS is always present in preview
 * (bundler.ts injects the Elementor CDN frontend.min.css unconditionally).
 */
function containerOuterPaddingProperties(
  _value: unknown,
  _isBoxed: boolean
): Record<string, string | undefined> {
  return {}
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

export function layoutPositionClass(settings: PreviewSettings, target: 'container' | 'widget'): string | undefined {
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

// =============================================================================
// CONTAINER CSS
// =============================================================================

export function getContainerPreviewCSS(id: string, settings: PreviewSettings, containerType: 'grid' | 'flex'): string {
  const isGrid = containerType === 'grid'
  const isBoxed = settings.content_width === 'boxed'
  const background = parseBackground(settings, 'background')
  const backgroundHover = parseBackground(settings, 'background_hover')
  const border = parseBorder(settings, 'border')
  const borderHover = parseBorder(settings, 'border_hover')
  const margin = parseSpacing(settings.margin)
  const needsPosition = settings.background_overlay_background || settings.shape_divider_top || settings.shape_divider_bottom

  const properties: Record<string, string | undefined> = {
    display: isBoxed ? 'block' : (isGrid ? 'grid' : 'flex'),
    '--display': isGrid ? 'grid' : 'flex',
    width: parseDimension(settings.width),
    height: parseDimension(settings.height),
    minHeight: parseDimension(settings.min_height),
    // align-self positions THIS container within its flex parent — must live
    // on the outer .elementor-element, never on .e-con-inner.
    alignSelf: settings._flex_align_self,
    ...containerOuterPaddingProperties(settings.padding, isBoxed),
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
    if (settings.padding_tablet || settings.margin_tablet || settings.width_tablet || settings.min_height_tablet || settings._flex_align_self_tablet) {
      cssRules.push({
        selector: '@media (max-width: 1024px)',
        properties: {
          width: parseDimension(settings.width_tablet),
          minHeight: parseDimension(settings.min_height_tablet),
          alignSelf: settings._flex_align_self_tablet,
          ...containerOuterPaddingProperties(settings.padding_tablet, isBoxed),
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
    if (settings.padding_mobile || settings.margin_mobile || settings.width_mobile || settings.min_height_mobile || settings._flex_align_self_mobile) {
      cssRules.push({
        selector: '@media (max-width: 767px)',
        properties: {
          width: parseDimension(settings.width_mobile),
          minHeight: parseDimension(settings.min_height_mobile),
          alignSelf: settings._flex_align_self_mobile,
          ...containerOuterPaddingProperties(settings.padding_mobile, isBoxed),
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
    if (settings.padding_tablet || settings.margin_tablet || settings.width_tablet || settings.min_height_tablet || settings._flex_align_self_tablet) {
      cssRules.push({
        selector: '@media (max-width: 1024px)',
        properties: {
          width: parseDimension(settings.width_tablet),
          minHeight: parseDimension(settings.min_height_tablet),
          alignSelf: settings._flex_align_self_tablet,
          ...containerOuterPaddingProperties(settings.padding_tablet, isBoxed),
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
    if (settings.padding_mobile || settings.margin_mobile || settings.width_mobile || settings.min_height_mobile || settings._flex_align_self_mobile) {
      cssRules.push({
        selector: '@media (max-width: 767px)',
        properties: {
          width: parseDimension(settings.width_mobile),
          minHeight: parseDimension(settings.min_height_mobile),
          alignSelf: settings._flex_align_self_mobile,
          ...containerOuterPaddingProperties(settings.padding_mobile, isBoxed),
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
    // Render a `::before` pseudo that covers the parent and paints the
    // overlay (color OR gradient). For gradients we emit `background-image:
    // linear-gradient(...)` so the original colorA→colorB transition is
    // preserved.
    //
    // Opacity comes from the explicit `backgroundOverlayOpacity` prop
    // (validator enforces it is set whenever `backgroundOverlay` is set).
    // We do NOT default to 0.5 here — that would silently change the
    // effective overlay intensity vs what the AI wrote. If the value is
    // missing, fall back to 1 (use the color's own alpha verbatim) so the
    // visible result still matches the literal `backgroundOverlay` color.
    const explicitOverlayOpacity = settings.background_overlay_opacity?.size
    const overlayOpacity = explicitOverlayOpacity !== undefined ? String(explicitOverlayOpacity) : '1'
    const overlayProps: Record<string, string | undefined> = {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      opacity: overlayOpacity,
      mixBlendMode: settings.overlay_blend_mode,
      zIndex: '0',
    }
    if (settings.background_overlay_background === 'gradient') {
      const colorA = settings.background_overlay_color
      const colorB = settings.background_overlay_color_b
      const stopA = settings.background_overlay_color_stop?.size
      const stopB = settings.background_overlay_color_b_stop?.size
      const stopAStr = stopA !== undefined ? `${stopA}%` : '0%'
      const stopBStr = stopB !== undefined ? `${stopB}%` : '100%'
      if (settings.background_overlay_gradient_type === 'radial') {
        const pos = settings.background_overlay_gradient_position || 'center center'
        overlayProps.backgroundImage = `radial-gradient(at ${pos}, ${colorA} ${stopAStr}, ${colorB} ${stopBStr})`
      } else {
        const angle = settings.background_overlay_gradient_angle?.size ?? 180
        overlayProps.backgroundImage = `linear-gradient(${angle}deg, ${colorA} ${stopAStr}, ${colorB} ${stopBStr})`
      }
    } else {
      overlayProps.backgroundColor = settings.background_overlay_color as string | undefined
    }
    cssRules.push({ selector: '::before', properties: overlayProps })
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

  // hide-on-breakpoint (works for containers via the same `advanced.hideOn*` props)
  pushHideOnBreakpointRules(cssRules, settings)

  return generateCSS(id, cssRules)
}

// =============================================================================
// WIDGET CSS FUNCTIONS
// =============================================================================

export function getHeadingCSS(id: string, settings: PreviewSettings): string {
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

export function getTextEditorCSS(id: string, settings: PreviewSettings): string {
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

export function getButtonCSS(id: string, settings: PreviewSettings): string {
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

export function getIconCSS(id: string, settings: PreviewSettings): string {
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

export function getIconBoxCSS(id: string, settings: PreviewSettings): string {
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

export function getIconListCSS(id: string, settings: PreviewSettings): string {
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

export function getImageBoxCSS(id: string, settings: PreviewSettings): string {
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

export function getAccordionCSS(id: string, settings: PreviewSettings): string {
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
        justifyContent: 'space-between',
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

export function getToggleCSS(id: string, settings: PreviewSettings): string {
  const titleTypography = parseTypography(settings, 'title_typography')
  const contentTypography = parseTypography(settings, 'content_typography')
  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-toggle-item',
      properties: {
        marginBlockEnd: parseDimension(settings.space_between),
        boxShadow: parseBoxShadow(settings.box_shadow_box_shadow, settings, 'box_shadow'),
      },
    },
    {
      selector: '.elementor-tab-title',
      properties: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        backgroundColor: settings.title_background,
        padding: parseSpacing(settings.title_padding),
        // Border on title to match Elementor PHP widget behavior
        borderStyle: settings.border_width ? 'solid' : undefined,
        borderWidth: parseDimension(settings.border_width),
        borderColor: settings.border_color,
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
        // Border on content to match Elementor PHP widget behavior
        borderStyle: settings.border_width ? 'solid' : undefined,
        borderWidth: parseDimension(settings.border_width),
        borderColor: settings.border_color,
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

export function getTabsCSS(id: string, settings: PreviewSettings): string {
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

export function getImageGalleryCSS(id: string, settings: PreviewSettings): string {
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

export function getCounterCSS(id: string, settings: PreviewSettings): string {
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

export function progressPercent(settings: PreviewSettings): number {
  const raw = settings.percent
  const value = raw?.size !== undefined ? Number(raw.size) : Number(raw)
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
}

export function getProgressCSS(id: string, settings: PreviewSettings): string {
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

export function getImageCarouselCSS(id: string, settings: PreviewSettings): string {
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
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: '1',
        display: 'flex',
        alignItems: settings.gallery_vertical_align,
        gap: parseDimension(settings.image_spacing_custom),
      },
    },
    {
      selector: '.swiper-wrapper',
      properties: {
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: '1',
      },
    },
    {
      selector: '.swiper-slide',
      properties: {
        position: 'relative',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        flex: '0 0 auto',
      },
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
        cursor: 'pointer',
        display: 'inline-flex',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '1',
        color: settings.arrows_color,
        fontSize: parseDimension(settings.arrows_size),
      },
    },
    {
      selector: '.elementor-swiper-button-prev',
      properties: {
        left: '10px',
      },
    },
    {
      selector: '.elementor-swiper-button-next',
      properties: {
        right: '10px',
      },
    },
    {
      selector: '.swiper-pagination',
      properties: {
        position: 'absolute',
        textAlign: 'center',
        zIndex: '10',
        bottom: '5px',
        left: '0',
        width: '100%',
      },
    },
    {
      selector: '.swiper-pagination-bullet',
      properties: {
        display: 'inline-block',
        borderRadius: '50%',
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

export function getNavMenuCSS(id: string, settings: PreviewSettings): string {
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

export function getElementorFormCSS(id: string, settings: PreviewSettings): string {
  const labelTypography = parseTypography(settings, 'label_typography')
  const fieldTypography = parseTypography(settings, 'field_typography')
  const buttonTypography = parseTypography(settings, 'button_typography')
  const columnGap = parseDimension(settings.column_gap) || '0px'
  const rowGap = parseDimension(settings.row_gap) || '0px'
  const cssRules: CSSRule[] = [
    {
      // Form widget fills its parent container width by default. Without
      // this rule the form's natural width is computed from the children
      // (input + button) and depends on browser font metrics, producing a
      // different width in the React preview than in the Elementor PHP
      // render — the inline "email + Subscribe" newsletter form ended up
      // ~130px narrower in PHP, making the col-70 input + col-30 button
      // visibly cramped while React rendered them spaced correctly.
      // Mirror the export side via the `_element_width: 'inherit'` setting
      // emitted by the form mapper so both sides agree on full-parent width.
      selector: '',
      properties: { width: '100%' },
    },
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

export function getSlidesCSS(id: string, settings: PreviewSettings): string {
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

export function getTestimonialCarouselCSS(id: string, settings: PreviewSettings): string {
  const contentTypography = parseTypography(settings, 'content_typography')
  const nameTypography = parseTypography(settings, 'name_typography')
  const titleTypography = parseTypography(settings, 'title_typography')
  const layout = settings.layout || 'image_inline'
  const isBubble = settings.skin === 'bubble'
  const alignment = settings.alignment || 'center'

  // Flex direction for the card content based on Elementor layout option.
  // image_above: image on top, then text below (column)
  // image_stacked: same as above but text wrapped differently — column
  // image_inline: image and cite (name+title) inline horizontally; content above them
  // image_left / image_right: image beside the rest (row / row-reverse)
  const isHorizontalLayout = layout === 'image_left' || layout === 'image_right'

  const cssRules: CSSRule[] = [
    {
      selector: '.elementor-main-swiper',
      properties: { overflow: 'hidden', width: parseDimension(settings.width) || '100%' },
    },
    {
      selector: '.swiper-wrapper',
      properties: { display: 'flex', gap: parseDimension(settings.space_between) || '10px' },
    },
    {
      selector: '.swiper-slide',
      properties: { display: 'flex', flexDirection: 'column', flexShrink: '0' },
    },
    {
      selector: '.elementor-testimonial',
      properties: {
        display: 'flex',
        flexDirection: isHorizontalLayout ? (layout === 'image_right' ? 'row-reverse' : 'row') : 'column',
        gap: parseDimension(settings.image_gap) || '12px',
        textAlign: alignment as React.CSSProperties['textAlign'],
        alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
      },
    },
    {
      selector: '.elementor-testimonial__content',
      properties: {
        position: isBubble ? 'relative' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: parseDimension(settings.content_gap) || '12px',
        backgroundColor: isBubble ? settings.background_color : undefined,
        padding: isBubble ? parseSpacing(settings.text_padding) : undefined,
        borderRadius: isBubble ? parseSpacing(settings.border_radius) : undefined,
        border: isBubble && settings.border === 'yes' ? `${parseDimension(settings.border_width) || '1px'} solid ${settings.border_color || '#000'}` : undefined,
        flex: isHorizontalLayout ? '1 1 0' : undefined,
      },
    },
    {
      selector: '.elementor-testimonial__text',
      properties: {
        color: settings.content_color || '#0e100f',
        fontFamily: contentTypography.fontFamily,
        fontSize: contentTypography.fontSize || '16px',
        fontWeight: contentTypography.fontWeight,
        lineHeight: contentTypography.lineHeight || '1.5',
        margin: '0',
      },
    },
    {
      selector: '.elementor-testimonial__footer',
      properties: {
        display: 'flex',
        alignItems: 'center',
        gap: parseDimension(settings.image_gap) || '12px',
        flexDirection: layout === 'image_stacked' ? 'column' : 'row',
      },
    },
    {
      selector: '.elementor-testimonial__image',
      properties: { display: 'inline-flex', flexShrink: '0' },
    },
    {
      selector: '.elementor-testimonial__image img',
      properties: {
        width: parseDimension(settings.image_size) || '54px',
        height: parseDimension(settings.image_size) || '54px',
        objectFit: 'cover',
        display: 'block',
        borderRadius: parseDimension(settings.image_border_radius),
        border: settings.image_border === 'yes'
          ? `${parseDimension(settings.image_border_width) || '1px'} solid ${settings.image_border_color || '#000'}`
          : undefined,
      },
    },
    {
      selector: '.elementor-testimonial__cite',
      properties: { display: 'flex', flexDirection: 'column', gap: '4px', fontStyle: 'normal' },
    },
    {
      selector: '.elementor-testimonial__name',
      properties: {
        color: settings.name_color || '#0e100f',
        fontFamily: nameTypography.fontFamily,
        fontSize: nameTypography.fontSize || '20px',
        fontWeight: nameTypography.fontWeight || '500',
        lineHeight: nameTypography.lineHeight,
      },
    },
    {
      selector: '.elementor-testimonial__title',
      properties: {
        color: settings.title_color || '#71716f',
        fontFamily: titleTypography.fontFamily,
        fontSize: titleTypography.fontSize || '14px',
        fontWeight: titleTypography.fontWeight,
        lineHeight: titleTypography.lineHeight,
      },
    },
  ]

  if (isBubble) {
    // Bubble skin: render a chat-tail triangle on .__content::after pointing toward
    // the cite block (matches Elementor Pro's widget-testimonial-carousel.css).
    // For image_inline/image_stacked the cite sits below the bubble → tail points down.
    // For image_above the cite is above content → tail points up.
    // For image_left/image_right the cite sits beside content → tail points toward it.
    const bg = String(settings.background_color || '#fff')
    const tailDirection: 'down' | 'up' | 'left' | 'right' =
      layout === 'image_above' ? 'up'
      : layout === 'image_left' ? 'right'
      : layout === 'image_right' ? 'left'
      : 'down'
    const tailSize = 8
    const tailPosition = alignment === 'left' ? '20px'
      : alignment === 'right' ? 'calc(100% - 28px)'
      : '50%'

    const tailProps: Record<string, string | undefined> = {
      content: '""',
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
    }
    if (tailDirection === 'down') {
      tailProps.top = '100%'
      tailProps.left = tailPosition
      tailProps.transform = 'translateX(-50%)'
      tailProps.borderWidth = `${tailSize}px ${tailSize}px 0 ${tailSize}px`
      tailProps.borderColor = `${bg} transparent transparent transparent`
    } else if (tailDirection === 'up') {
      tailProps.bottom = '100%'
      tailProps.left = tailPosition
      tailProps.transform = 'translateX(-50%)'
      tailProps.borderWidth = `0 ${tailSize}px ${tailSize}px ${tailSize}px`
      tailProps.borderColor = `transparent transparent ${bg} transparent`
    } else if (tailDirection === 'right') {
      tailProps.left = '100%'
      tailProps.top = '50%'
      tailProps.transform = 'translateY(-50%)'
      tailProps.borderWidth = `${tailSize}px 0 ${tailSize}px ${tailSize}px`
      tailProps.borderColor = `transparent transparent transparent ${bg}`
    } else {
      tailProps.right = '100%'
      tailProps.top = '50%'
      tailProps.transform = 'translateY(-50%)'
      tailProps.borderWidth = `${tailSize}px ${tailSize}px ${tailSize}px 0`
      tailProps.borderColor = `transparent ${bg} transparent transparent`
    }

    cssRules.push({
      selector: '.elementor-testimonial__content:after',
      properties: tailProps,
    })

    // Gap between bubble and cite block (the tail extends 8px past the bubble).
    if (tailDirection === 'down') {
      cssRules.push({
        selector: '.elementor-testimonial__footer',
        properties: { marginTop: `${tailSize}px` },
      })
    } else if (tailDirection === 'right' || tailDirection === 'left') {
      cssRules.push({
        selector: '.elementor-testimonial__footer',
        properties: { [tailDirection === 'right' ? 'marginLeft' : 'marginRight']: `${tailSize}px` },
      })
    }
  }

  for (const { suffix, query } of RESPONSIVE_MEDIA) {
    addResponsiveRule(cssRules, query, { width: parseDimension(settings[`width${suffix}`]) }, ' .elementor-main-swiper')
    addResponsiveRule(cssRules, query, { gap: parseDimension(settings[`space_between${suffix}`]) }, ' .swiper-wrapper')
    addResponsiveRule(cssRules, query, {
      gap: parseDimension(settings[`image_gap${suffix}`]),
      textAlign: settings[`alignment${suffix}`],
      alignItems: settings[`alignment${suffix}`] === 'center' ? 'center' : settings[`alignment${suffix}`] === 'right' ? 'flex-end' : settings[`alignment${suffix}`] === 'left' ? 'flex-start' : undefined,
    }, ' .elementor-testimonial')
    addResponsiveRule(cssRules, query, {
      gap: parseDimension(settings[`content_gap${suffix}`]),
      padding: isBubble ? parseSpacing(settings[`text_padding${suffix}`]) : undefined,
      borderRadius: isBubble ? parseSpacing(settings[`border_radius${suffix}`]) : undefined,
    }, ' .elementor-testimonial__content')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'content_typography', suffix), ' .elementor-testimonial__text')
    addResponsiveRule(cssRules, query, {
      width: parseDimension(settings[`image_size${suffix}`]),
      height: parseDimension(settings[`image_size${suffix}`]),
      borderRadius: parseDimension(settings[`image_border_radius${suffix}`]),
    }, ' .elementor-testimonial__image img')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'name_typography', suffix), ' .elementor-testimonial__name')
    addResponsiveRule(cssRules, query, responsiveTypographyForPrefix(settings, 'title_typography', suffix), ' .elementor-testimonial__title')
  }

  addLayoutPositionRules(cssRules, settings, 'widget')
  return generateCSS(id, cssRules)
}

export function getImageCSS(id: string, settings: PreviewSettings): string {
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

export function widgetDataSettings(settings: PreviewSettings, keys: string[]): string | undefined {
  const data: Record<string, unknown> = {}
  for (const key of keys) {
    if (settings[key] !== undefined) data[key] = settings[key]
  }
  return Object.keys(data).length > 0 ? JSON.stringify(data) : undefined
}

export { getDomAttributes }
