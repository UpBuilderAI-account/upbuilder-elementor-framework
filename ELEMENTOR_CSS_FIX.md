# Elementor CSS Alignment Fix

## Problem Summary

The React framework generates **BOTH** direct CSS properties AND CSS custom properties:

```css
/* Current React output */
.elementor-element-abc123 {
  display: flex;              /* Direct - REMOVE THIS */
  flex-direction: column;     /* Direct - REMOVE THIS */
  padding: 20px;              /* Direct - REMOVE THIS */
  --display: flex;            /* Variable - KEEP */
  --flex-direction: column;   /* Variable - KEEP */
  --padding-top: 20px;        /* Variable - KEEP */
}
```

But PHP Elementor **ONLY** sets CSS custom properties:

```css
/* PHP Elementor output */
.elementor-139413 .elementor-element.elementor-element-abc123 {
  --display: flex;
  --flex-direction: column;
  --container-widget-width: 100%;
  --container-widget-height: initial;
  --container-widget-flex-grow: 0;
  --container-widget-align-self: initial;
  --flex-wrap-mobile: wrap;
  --gap: 20px 20px;
  --row-gap: 20px;
  --column-gap: 20px;
  --flex-wrap: nowrap;
  --padding-top: 20px;
  --padding-bottom: 20px;
  --padding-left: 20px;
  --padding-right: 20px;
}
```

Then `frontend.min.css` consumes these variables:

```css
.e-con, .e-con > .e-con-inner {
  display: var(--display);
}

.e-con-full.e-flex, .e-con.e-flex > .e-con-inner {
  flex-direction: var(--flex-direction);
}

.e-con > .e-con-inner {
  gap: var(--row-gap) var(--column-gap);
}
```

---

## Required Changes

### 1. Container CSS Generation (`getContainerPreviewCSS`)

**File:** `src/builder/abstraction/index.tsx`
**Function:** `getContainerPreviewCSS` (line ~2455)

#### Change: Remove direct CSS properties for flex/grid layout

```typescript
// BEFORE (current)
const properties: Record<string, string | undefined> = {
  display: isBoxed ? 'block' : (isGrid ? 'grid' : 'flex'),  // REMOVE
  '--display': isGrid ? 'grid' : 'flex',
  // ...
  padding,  // REMOVE
  margin,   // REMOVE
  // ...
}

// AFTER (fixed)
const properties: Record<string, string | undefined> = {
  '--display': isGrid ? 'grid' : 'flex',
  // NO direct display, padding, margin
  // ...
  ...spacingVariables(settings.padding, 'padding'),
  ...spacingVariables(settings.margin, 'margin'),
  // ...
}
```

#### Add missing container widget variables:

```typescript
// Add to flex container properties
if (!isGrid) {
  const direction = settings.flex_direction || 'column';
  const isRow = direction === 'row' || direction === 'row-reverse';
  
  properties['--container-widget-width'] = isRow ? 'initial' : '100%';
  properties['--container-widget-height'] = isRow ? '100%' : 'initial';
  properties['--container-widget-flex-grow'] = isRow ? '1' : '0';
  properties['--container-widget-align-self'] = isRow ? 'stretch' : 'initial';
  properties['--flex-wrap-mobile'] = direction.includes('reverse') ? 'wrap-reverse' : 'wrap';
}
```

### 2. Flexbox-specific CSS changes

**Current code (line ~2640):**
```typescript
// REMOVE these direct properties
flexProps = {
  flexDirection: settings.flex_direction,    // REMOVE
  flexWrap: settings.flex_wrap,              // REMOVE
  alignItems: mapFlexAlign(settings.align_items),  // REMOVE
  // ...
}
```

**Fixed code:**
```typescript
// ONLY set CSS custom properties
properties['--flex-direction'] = settings.flex_direction;
properties['--flex-wrap'] = settings.flex_wrap;
properties['--align-items'] = mapFlexAlign(settings.align_items);
properties['--align-content'] = mapFlexAlign(settings.flex_align_content);
properties['--justify-content'] = mapFlexAlign(settings.justify_content);
properties['--gap'] = gapValue;
properties['--row-gap'] = rowGap || gap;
properties['--column-gap'] = colGap || gap;

// DON'T set:
// flexDirection, flexWrap, alignItems, gap, etc.
```

### 3. Grid-specific CSS changes

Similar pattern - only set `--e-con-grid-template-columns`, `--e-con-grid-template-rows`, etc.
Don't set direct `gridTemplateColumns`, `gridTemplateRows`.

### 4. Background/Border/Effects (KEEP direct CSS)

These properties don't have CSS variable equivalents in `frontend.min.css`, so keep them:
- `background-color`, `background-image`
- `border-width`, `border-color`, `border-radius`
- `box-shadow`
- `overflow`, `z-index`

---

## Implementation Steps

### Step 1: Create helper for flex direction variables

```typescript
function getFlexDirectionVariables(direction: string | undefined): Record<string, string> {
  const dir = direction || 'column';
  const isRow = dir === 'row' || dir === 'row-reverse';
  const isReverse = dir.includes('reverse');
  
  return {
    '--flex-direction': dir,
    '--container-widget-width': isRow ? 'initial' : '100%',
    '--container-widget-height': isRow ? '100%' : 'initial',
    '--container-widget-flex-grow': isRow ? '1' : '0',
    '--container-widget-align-self': isRow ? 'stretch' : 'initial',
    '--flex-wrap-mobile': isReverse ? 'wrap-reverse' : 'wrap',
  };
}
```

### Step 2: Update getContainerPreviewCSS for flexbox

```typescript
function getContainerPreviewCSS(id: string, settings: PreviewSettings, containerType: 'grid' | 'flex'): string {
  const isGrid = containerType === 'grid';
  const isBoxed = settings.content_width === 'boxed';
  
  // Background and border (these stay as direct CSS)
  const background = parseBackground(settings, 'background');
  const border = parseBorder(settings, 'border');
  
  const properties: Record<string, string | undefined> = {
    // Display as variable ONLY
    '--display': isGrid ? 'grid' : 'flex',
    
    // Sizing (keep direct for now, but could be variables too)
    width: parseDimension(settings.width),
    height: parseDimension(settings.height),
    minHeight: parseDimension(settings.min_height),
    
    // Spacing as VARIABLES ONLY (no direct padding/margin)
    ...spacingVariables(settings.padding, 'padding'),
    ...spacingVariables(settings.margin, 'margin'),
    
    // Background and effects (keep direct CSS)
    ...background,
    ...border,
    borderRadius: parseBorderRadius(settings.border_radius),
    boxShadow: parseBoxShadow(settings.box_shadow_box_shadow, settings, 'box_shadow'),
    zIndex: settings.z_index !== undefined ? String(settings.z_index) : undefined,
    overflow: settings.overflow,
  };
  
  if (!isGrid) {
    // Flexbox: ONLY set variables
    const gap = parseGap(settings.flex_gap ?? settings.gap);
    const rowGap = parseGap(settings.flex_gap ?? settings.gap);
    const colGap = parseGap(settings.flex_gap ?? settings.gap);
    
    Object.assign(properties, {
      ...getFlexDirectionVariables(settings.flex_direction),
      '--flex-wrap': settings.flex_wrap || 'nowrap',
      '--align-items': mapFlexAlign(settings.align_items),
      '--align-content': mapFlexAlign(settings.flex_align_content),
      '--justify-content': mapFlexAlign(settings.justify_content),
      '--gap': gap ? `${gap} ${gap}` : undefined,
      '--row-gap': rowGap,
      '--column-gap': colGap,
    });
  }
  
  // ...rest of function
}
```

### Step 3: Update responsive breakpoints

The same pattern applies to tablet/mobile responsive rules - only set variables, not direct CSS.

---

## Testing Checklist

After making these changes, verify:

1. [ ] Containers display correctly in preview
2. [ ] Flex direction works (row, column, reverse)
3. [ ] Gap between items works
4. [ ] Padding/margin works
5. [ ] Nested containers work
6. [ ] Boxed containers work
7. [ ] Responsive breakpoints work
8. [ ] Compare computed styles with PHP output

---

## Computed Style Comparison

Properties that MUST match between React and PHP (when rendered):

| Property | Description |
|----------|-------------|
| `display` | flex, grid, block |
| `flex-direction` | row, column, etc. |
| `flex-wrap` | wrap, nowrap |
| `gap` | spacing between items |
| `padding-top/right/bottom/left` | container padding |
| `margin-top/right/bottom/left` | container margin |
| `align-items` | item alignment |
| `justify-content` | content justification |

Properties that can differ (visual styling):
- `background-color`, `background-image` - should match but mechanism differs
- `border-*` - should match
- `box-shadow` - should match
