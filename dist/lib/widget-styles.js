/**
 * Widget Styles Utility
 *
 * Generates scoped CSS rules like Elementor does, using selectors
 * instead of inline styles. Each widget renders a <style> tag with
 * rules targeting its unique element ID.
 *
 * Elementor pattern:
 *   .elementor-element-{id} { text-align: center; }
 *   .elementor-element-{id} .elementor-heading-title { color: #f00; }
 */
/**
 * Generate CSS string from rules
 */
export function generateCSS(elementId, rules, options) {
    // Use high specificity selector to override global Elementor CSS
    const documentId = typeof options === 'string' ? options : options?.documentId;
    const docSelector = documentId ? `.elementor-${documentId}` : '.elementor';
    const baseSelector = `${docSelector} .elementor-element.elementor-element-${elementId}`;
    return rules
        .map(rule => {
        const properties = Object.entries(rule.properties)
            .filter(([_, value]) => value !== undefined && value !== '')
            .map(([prop, value]) => `${camelToKebab(prop)}:${value}`)
            .join(';');
        if (!properties)
            return '';
        // Handle media queries specially - wrap selector inside media query
        if (rule.selector.startsWith('@media')) {
            const targetSelector = rule.nestedSelector ? `${baseSelector}${rule.nestedSelector}` : baseSelector;
            return `${rule.selector}{${targetSelector}{${properties};}}`;
        }
        let fullSelector;
        if (rule.selector === '') {
            fullSelector = baseSelector;
        }
        else if (rule.selector.includes(',')) {
            // Handle comma-separated selectors
            fullSelector = rule.selector
                .split(',')
                .map(part => `${baseSelector} ${part.trim()}`)
                .join(', ');
        }
        else if (rule.selector.startsWith(':')) {
            // Pseudo-classes/elements attach directly without space
            fullSelector = `${baseSelector}${rule.selector}`;
        }
        else {
            // Child/descendant selectors need space
            fullSelector = `${baseSelector} ${rule.selector}`;
        }
        return `${fullSelector}{${properties};}`;
    })
        .filter(Boolean)
        .join('\n\n');
}
/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
/**
 * Parse dimension value (handles Elementor's { size, unit } format)
 */
export function parseDimension(value, defaultUnit = 'px') {
    if (value === undefined || value === null || value === '')
        return undefined;
    if (typeof value === 'object' && value !== null) {
        const size = value.size;
        if (size === undefined || size === null || size === '')
            return undefined;
        if (typeof size === 'string' && (value.unit === 'custom' || isNaN(Number(size)))) {
            return size;
        }
        const numSize = Number(size);
        if (isNaN(numSize))
            return undefined;
        return `${numSize}${value.unit || defaultUnit}`;
    }
    if (typeof value === 'number') {
        if (isNaN(value))
            return undefined;
        return `${value}${defaultUnit}`;
    }
    const strValue = String(value);
    if (strValue.trim() === '')
        return undefined;
    return strValue;
}
/**
 * Parse color value
 */
export function parseColor(value) {
    if (!value)
        return undefined;
    return String(value);
}
/**
 * Parse text alignment value to match Elementor's start/end format
 */
export function parseTextAlign(value) {
    if (!value)
        return undefined;
    switch (value) {
        case 'left':
            return 'start';
        case 'right':
            return 'end';
        case 'center':
        case 'justify':
            return value;
        default:
            return value;
    }
}
/**
 * Format font family with quotes and fallback to match Elementor
 */
function formatFontFamily(fontFamily) {
    if (!fontFamily)
        return fontFamily;
    if (fontFamily.startsWith('"') && fontFamily.endsWith('"')) {
        return `${fontFamily}, Sans-serif`;
    }
    return `"${fontFamily}", Sans-serif`;
}
/**
 * Parse typography settings into CSS properties
 */
export function parseTypography(settings, prefix = 'typography') {
    const typographyType = settings[`${prefix}_typography`];
    if (typographyType !== 'custom') {
        return {};
    }
    const fontFamily = settings[`${prefix}_font_family`];
    const fontSize = parseDimension(settings[`${prefix}_font_size`]);
    const fontWeight = settings[`${prefix}_font_weight`];
    const fontStyle = settings[`${prefix}_font_style`];
    const textTransform = settings[`${prefix}_text_transform`];
    const textDecoration = settings[`${prefix}_text_decoration`];
    const lineHeight = parseDimension(settings[`${prefix}_line_height`], 'em');
    const letterSpacing = parseDimension(settings[`${prefix}_letter_spacing`]);
    const wordSpacing = parseDimension(settings[`${prefix}_word_spacing`]);
    return {
        fontFamily: fontFamily ? formatFontFamily(fontFamily) : undefined,
        fontSize: fontSize || undefined,
        fontWeight: fontWeight || undefined,
        fontStyle: fontStyle || undefined,
        textTransform: textTransform || undefined,
        textDecoration: textDecoration || undefined,
        lineHeight: lineHeight || undefined,
        letterSpacing: letterSpacing || undefined,
        wordSpacing: wordSpacing || undefined,
    };
}
/**
 * Parse box shadow settings
 */
export function parseBoxShadow(shadow, settings, prefix = 'button_box_shadow') {
    if (!shadow || typeof shadow !== 'object')
        return undefined;
    if (settings) {
        const shadowType = settings[`${prefix}_box_shadow_type`];
        if (!shadowType || shadowType === '' || shadowType === 'none') {
            return undefined;
        }
    }
    const horizontal = Number(shadow.horizontal) || 0;
    const vertical = Number(shadow.vertical) || 0;
    const blur = Math.max(0, Number(shadow.blur) || 0);
    const spread = Number(shadow.spread) || 0;
    const color = shadow.color || 'rgba(0,0,0,0.5)';
    if (typeof color !== 'string')
        return undefined;
    // Elementor does not output the inset keyword even when position is "inset".
    return `${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
}
/**
 * Parse text shadow settings
 */
export function parseTextShadow(shadow, settings, prefix = 'text_shadow') {
    if (!shadow || typeof shadow !== 'object')
        return undefined;
    if (settings) {
        const shadowType = settings[`${prefix}_text_shadow_type`];
        if (!shadowType || shadowType === '' || shadowType === 'none') {
            return undefined;
        }
    }
    const horizontal = Number(shadow.horizontal) || 0;
    const vertical = Number(shadow.vertical) || 0;
    const blur = Math.max(0, Number(shadow.blur) || 0);
    const color = shadow.color || 'rgba(0,0,0,0.3)';
    if (typeof color !== 'string')
        return undefined;
    return `${horizontal}px ${vertical}px ${blur}px ${color}`;
}
/**
 * Parse text stroke settings
 */
export function parseTextStroke(settings, prefix = 'stroke') {
    const strokeType = settings[`${prefix}_text_stroke_type`];
    if (!strokeType || strokeType === 'none' || strokeType === '') {
        return {};
    }
    const strokeWidth = parseDimension(settings[`${prefix}_text_stroke_width`]) || '1px';
    const strokeColor = settings[`${prefix}_text_stroke_color`] || 'var(--e-global-color-text)';
    const strokeValue = `${strokeWidth} ${strokeColor}`;
    return {
        WebkitTextStroke: strokeValue,
        paintOrder: 'stroke fill',
    };
}
/**
 * Parse border width
 */
function parseBorderWidth(value) {
    if (!value || typeof value !== 'object')
        return undefined;
    if ('top' in value || 'right' in value || 'bottom' in value || 'left' in value) {
        const unit = value.unit || 'px';
        const top = Number(value.top) || 0;
        const right = Number(value.right) || 0;
        const bottom = Number(value.bottom) || 0;
        const left = Number(value.left) || 0;
        if (top === 0 && right === 0 && bottom === 0 && left === 0) {
            return undefined;
        }
        return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
    }
    return parseDimension(value);
}
/**
 * Parse border settings
 */
export function parseBorder(settings, prefix = 'border') {
    const style = settings[`${prefix}_border`] || settings[`${prefix}_style`];
    const widthValue = settings[`${prefix}_width`];
    const width = parseBorderWidth(widthValue);
    const color = settings[`${prefix}_color`];
    return {
        borderStyle: style,
        borderWidth: width,
        borderColor: color,
    };
}
/**
 * Parse background settings
 */
export function parseBackground(settings, prefix = 'background') {
    const backgroundType = settings[`${prefix}_background`];
    if (!backgroundType) {
        const simpleColor = settings[`${prefix}_color`];
        if (simpleColor) {
            return { backgroundColor: simpleColor };
        }
        return {};
    }
    if (backgroundType === 'classic') {
        const color = settings[`${prefix}_color`];
        const image = settings[`${prefix}_image`];
        const result = {};
        if (color) {
            result.backgroundColor = color;
        }
        if (image?.url) {
            result.backgroundImage = `url(${image.url})`;
            result.backgroundPosition = settings[`${prefix}_position`] || 'center center';
            result.backgroundRepeat = settings[`${prefix}_repeat`] || 'no-repeat';
            result.backgroundSize = settings[`${prefix}_size`] || 'cover';
        }
        return result;
    }
    if (backgroundType === 'gradient') {
        const gradientType = settings[`${prefix}_gradient_type`] || 'linear';
        const color = settings[`${prefix}_color`] || '#000';
        const colorB = settings[`${prefix}_color_b`] || '#fff';
        const colorStopRaw = settings[`${prefix}_color_stop`]?.size;
        const colorBStopRaw = settings[`${prefix}_color_b_stop`]?.size;
        const colorStop = Math.max(0, Math.min(100, Number(colorStopRaw) || 0));
        const colorBStop = Math.max(0, Math.min(100, Number(colorBStopRaw) || 100));
        if (typeof color !== 'string' || typeof colorB !== 'string') {
            return {};
        }
        if (gradientType === 'linear') {
            const angleRaw = settings[`${prefix}_gradient_angle`]?.size;
            const angle = Number(angleRaw) || 180;
            if (!isFinite(angle))
                return {};
            return {
                backgroundColor: 'transparent',
                backgroundImage: `linear-gradient(${angle}deg, ${color} ${colorStop}%, ${colorB} ${colorBStop}%)`
            };
        }
        else if (gradientType === 'radial') {
            const position = settings[`${prefix}_gradient_position`] || 'center center';
            return {
                backgroundColor: 'transparent',
                backgroundImage: `radial-gradient(at ${position}, ${color} ${colorStop}%, ${colorB} ${colorBStop}%)`
            };
        }
    }
    return {};
}
/**
 * Parse border radius
 */
export function parseBorderRadius(value) {
    if (!value)
        return undefined;
    if (typeof value === 'object' && ('top' in value || 'right' in value || 'bottom' in value || 'left' in value)) {
        const unit = value.unit || 'px';
        const hasTop = value.top !== '' && value.top !== undefined && value.top !== null;
        const hasRight = value.right !== '' && value.right !== undefined && value.right !== null;
        const hasBottom = value.bottom !== '' && value.bottom !== undefined && value.bottom !== null;
        const hasLeft = value.left !== '' && value.left !== undefined && value.left !== null;
        if (!hasTop && !hasRight && !hasBottom && !hasLeft) {
            return undefined;
        }
        const top = Number(value.top) || 0;
        const right = Number(value.right) || 0;
        const bottom = Number(value.bottom) || 0;
        const left = Number(value.left) || 0;
        return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
    }
    return parseDimension(value);
}
/**
 * Parse padding/margin
 */
export function parseSpacing(value) {
    if (!value)
        return undefined;
    if (typeof value === 'object' && ('top' in value || 'right' in value || 'bottom' in value || 'left' in value)) {
        const unit = value.unit || 'px';
        const hasTop = value.top !== '' && value.top !== undefined && value.top !== null;
        const hasRight = value.right !== '' && value.right !== undefined && value.right !== null;
        const hasBottom = value.bottom !== '' && value.bottom !== undefined && value.bottom !== null;
        const hasLeft = value.left !== '' && value.left !== undefined && value.left !== null;
        if (!hasTop && !hasRight && !hasBottom && !hasLeft) {
            return undefined;
        }
        const top = Number(value.top) || 0;
        const right = Number(value.right) || 0;
        const bottom = Number(value.bottom) || 0;
        const left = Number(value.left) || 0;
        return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
    }
    return parseDimension(value);
}
/**
 * Parse gap value (handles both { size, unit } and { row, column, unit } formats)
 */
export function parseGap(value) {
    if (!value)
        return undefined;
    if (typeof value === 'object') {
        const unit = value.unit || 'px';
        // Format: { row, column, unit }
        if ('row' in value || 'column' in value) {
            const row = value.row ?? value.column ?? 0;
            const col = value.column ?? value.row ?? 0;
            return row === col ? `${row}${unit}` : `${row}${unit} ${col}${unit}`;
        }
        // Format: { size, unit }
        if ('size' in value) {
            return `${value.size}${unit}`;
        }
    }
    if (typeof value === 'number') {
        return `${value}px`;
    }
    return undefined;
}
/**
 * Normalize element settings
 */
export function normalizeSettings(settings) {
    const normalized = { ...settings };
    if (normalized.background_color && !normalized.background_background) {
        normalized.background_background = 'classic';
    }
    if (normalized.background_hover_color && !normalized.background_hover_background) {
        normalized.background_hover_background = 'classic';
    }
    if (normalized.background_overlay_color && !normalized.background_overlay_background) {
        normalized.background_overlay_background = 'classic';
    }
    return normalized;
}
/**
 * Recursively normalize all elements
 */
export function normalizeElements(elements) {
    return elements.map(el => ({
        ...el,
        settings: el.settings ? normalizeSettings(el.settings) : el.settings,
        elements: el.elements ? normalizeElements(el.elements) : el.elements,
    }));
}
// Size maps for widgets
export const HEADING_SIZE_MAP = {
    small: '15px',
    medium: '19px',
    large: '29px',
    xl: '39px',
    xxl: '59px',
};
export const BUTTON_SIZE_MAP = {
    xs: { fontSize: '12px', padding: '8px 16px' },
    sm: { fontSize: '13px', padding: '10px 20px' },
    md: { fontSize: '15px', padding: '12px 24px' },
    lg: { fontSize: '17px', padding: '14px 28px' },
    xl: { fontSize: '19px', padding: '16px 32px' },
};
//# sourceMappingURL=widget-styles.js.map