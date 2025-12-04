// PagePress v0.0.9 - 2025-12-04
// Style Generator - Converts AdvancedStyling to CSS styles and Tailwind classes

import type {
  AdvancedStyling,
  LayoutSettings,
  BackgroundSettings,
  BorderSettings,
  TypographySettings,
  TransformSettings,
  TransitionSettings,
  FilterSettings,
  BackdropFilterSettings,
  BoxShadow,
  GradientSettings,
} from '../inspector/styles/types';

import type { PseudoClass, CustomAttribute } from '../inspector/sidebar/types';

/**
 * Generated styles result
 */
export interface GeneratedStyles {
  /** Inline CSS styles */
  style: React.CSSProperties;
  /** Tailwind CSS classes */
  className: string;
  /** CSS for pseudo-states (to be injected as <style>) */
  pseudoCSS?: string;
  /** Custom HTML attributes */
  attributes?: Record<string, string>;
}

/**
 * Convert AdvancedStyling to CSS styles and classes
 */
export function generateStyles(
  styling?: Partial<AdvancedStyling>,
  pseudoStyles?: Partial<Record<PseudoClass, Partial<AdvancedStyling>>>,
  elementId?: string,
  customCSS?: string,
  customAttributes?: CustomAttribute[]
): GeneratedStyles {
  if (!styling) {
    return { style: {}, className: '' };
  }

  const style: React.CSSProperties = {};
  const classes: string[] = [];

  // Generate layout styles
  if (styling.layout) {
    Object.assign(style, generateLayoutStyles(styling.layout));
  }

  // Generate background styles
  if (styling.background) {
    Object.assign(style, generateBackgroundStyles(styling.background));
  }

  // Generate border styles
  if (styling.border) {
    Object.assign(style, generateBorderStyles(styling.border));
  }

  // Generate typography styles
  if (styling.typography) {
    Object.assign(style, generateTypographyStyles(styling.typography));
  }

  // Generate transform styles
  if (styling.transform) {
    const transformStyle = generateTransformStyles(styling.transform);
    if (transformStyle) {
      style.transform = transformStyle;
      
      // Transform origin
      const originX = styling.transform.originX === 'custom' 
        ? styling.transform.originXCustom || 'center' 
        : styling.transform.originX || 'center';
      const originY = styling.transform.originY === 'custom' 
        ? styling.transform.originYCustom || 'center' 
        : styling.transform.originY || 'center';
      style.transformOrigin = `${originX} ${originY}`;
    }
  }

  // Generate transition styles
  if (styling.transition?.enabled) {
    style.transition = generateTransitionStyles(styling.transition);
  }

  // Generate filter styles
  if (styling.filter) {
    const filterStyle = generateFilterStyles(styling.filter);
    if (filterStyle) {
      style.filter = filterStyle;
    }
  }

  // Generate backdrop filter styles
  if (styling.backdropFilter?.enabled) {
    const backdropStyle = generateBackdropFilterStyles(styling.backdropFilter);
    if (backdropStyle) {
      style.backdropFilter = backdropStyle;
      style.WebkitBackdropFilter = backdropStyle;
    }
  }

  // Generate box shadow styles
  if (styling.boxShadow && styling.boxShadow.length > 0) {
    style.boxShadow = generateBoxShadowStyles(styling.boxShadow);
  }

  // Generate pseudo-state CSS
  let pseudoCSS = '';
  if (elementId && pseudoStyles) {
    pseudoCSS = generatePseudoStateCSS(elementId, pseudoStyles);
  }

  // Add custom CSS
  if (elementId && customCSS) {
    const scopedCSS = customCSS.replace(/%root%/g, `#${elementId}`);
    pseudoCSS += '\n' + scopedCSS;
  }

  // Generate custom attributes
  const attributes: Record<string, string> = {};
  if (customAttributes) {
    for (const attr of customAttributes) {
      if (attr.name) {
        attributes[attr.name] = attr.value;
      }
    }
  }

  return {
    style,
    className: classes.join(' '),
    pseudoCSS: pseudoCSS.trim() || undefined,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  };
}

/**
 * Generate layout styles
 */
function generateLayoutStyles(layout: Partial<LayoutSettings>): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Display
  if (layout.display) {
    style.display = layout.display;
  }

  // Position
  if (layout.position) {
    const pos = layout.position;
    if (pos.position && pos.position !== 'static') {
      style.position = pos.position;
    }
    if (pos.top) style.top = pos.top;
    if (pos.right) style.right = pos.right;
    if (pos.bottom) style.bottom = pos.bottom;
    if (pos.left) style.left = pos.left;
    if (pos.zIndex !== undefined) style.zIndex = pos.zIndex;
  }

  // Dimensions
  if (layout.dimensions) {
    const dim = layout.dimensions;
    if (dim.width && dim.width !== 'auto') style.width = dim.width;
    if (dim.height && dim.height !== 'auto') style.height = dim.height;
    if (dim.minWidth) style.minWidth = dim.minWidth;
    if (dim.maxWidth) style.maxWidth = dim.maxWidth;
    if (dim.minHeight) style.minHeight = dim.minHeight;
    if (dim.maxHeight) style.maxHeight = dim.maxHeight;
  }

  // Margin
  if (layout.margin) {
    const m = layout.margin;
    if (m.top && m.top !== '0') style.marginTop = m.top;
    if (m.right && m.right !== '0') style.marginRight = m.right;
    if (m.bottom && m.bottom !== '0') style.marginBottom = m.bottom;
    if (m.left && m.left !== '0') style.marginLeft = m.left;
  }

  // Padding
  if (layout.padding) {
    const p = layout.padding;
    if (p.top && p.top !== '0') style.paddingTop = p.top;
    if (p.right && p.right !== '0') style.paddingRight = p.right;
    if (p.bottom && p.bottom !== '0') style.paddingBottom = p.bottom;
    if (p.left && p.left !== '0') style.paddingLeft = p.left;
  }

  // Overflow
  if (layout.overflow && layout.overflow !== 'visible') {
    style.overflow = layout.overflow;
  }
  if (layout.overflowX) style.overflowX = layout.overflowX;
  if (layout.overflowY) style.overflowY = layout.overflowY;

  // Flex container
  if (layout.display === 'flex' && layout.flex) {
    const f = layout.flex;
    if (f.direction) style.flexDirection = f.direction;
    if (f.wrap) style.flexWrap = f.wrap;
    if (f.justifyContent) style.justifyContent = f.justifyContent;
    if (f.alignItems) style.alignItems = f.alignItems;
    if (f.alignContent) style.alignContent = f.alignContent;
    if (f.gap) style.gap = f.gap;
    if (f.rowGap) style.rowGap = f.rowGap;
    if (f.columnGap) style.columnGap = f.columnGap;
  }

  // Flex item
  if (layout.flexItem) {
    const fi = layout.flexItem;
    if (fi.order !== undefined && fi.order !== 0) style.order = fi.order;
    if (fi.flexGrow !== undefined && fi.flexGrow !== 0) style.flexGrow = fi.flexGrow;
    if (fi.flexShrink !== undefined && fi.flexShrink !== 1) style.flexShrink = fi.flexShrink;
    if (fi.flexBasis && fi.flexBasis !== 'auto') style.flexBasis = fi.flexBasis;
    if (fi.alignSelf && fi.alignSelf !== 'auto') style.alignSelf = fi.alignSelf;
  }

  return style;
}

/**
 * Generate background styles
 */
function generateBackgroundStyles(background: Partial<BackgroundSettings>): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (background.type === 'color' && background.color) {
    style.backgroundColor = background.color;
  }

  if (background.type === 'gradient' && background.gradient) {
    style.background = generateGradientCSS(background.gradient);
  }

  if (background.type === 'image' && background.image) {
    const img = background.image;
    style.backgroundImage = `url(${img.url})`;
    
    // Size
    if (img.size === 'custom') {
      style.backgroundSize = `${img.customWidth || 'auto'} ${img.customHeight || 'auto'}`;
    } else {
      style.backgroundSize = img.size;
    }
    
    // Position
    if (img.position === 'custom') {
      style.backgroundPosition = `${img.customX || '50%'} ${img.customY || '50%'}`;
    } else {
      style.backgroundPosition = img.position.replace('-', ' ');
    }
    
    style.backgroundRepeat = img.repeat;
    style.backgroundAttachment = img.attachment;
  }

  // Overlay would need to be handled differently (pseudo-element)
  
  return style;
}

/**
 * Generate gradient CSS
 */
function generateGradientCSS(gradient: GradientSettings): string {
  const stops = gradient.stops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');

  if (gradient.type === 'linear') {
    return `linear-gradient(${gradient.angle || 180}deg, ${stops})`;
  }

  return `radial-gradient(${gradient.shape || 'circle'}, ${stops})`;
}

/**
 * Generate border styles
 */
function generateBorderStyles(border: Partial<BorderSettings>): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Border sides
  if (border.top && border.top.width > 0 && border.top.style !== 'none') {
    style.borderTop = `${border.top.width}px ${border.top.style} ${border.top.color}`;
  }
  if (border.right && border.right.width > 0 && border.right.style !== 'none') {
    style.borderRight = `${border.right.width}px ${border.right.style} ${border.right.color}`;
  }
  if (border.bottom && border.bottom.width > 0 && border.bottom.style !== 'none') {
    style.borderBottom = `${border.bottom.width}px ${border.bottom.style} ${border.bottom.color}`;
  }
  if (border.left && border.left.width > 0 && border.left.style !== 'none') {
    style.borderLeft = `${border.left.width}px ${border.left.style} ${border.left.color}`;
  }

  // Border radius
  if (border.radius) {
    const r = border.radius;
    const tl = r.topLeft || '0';
    const tr = r.topRight || '0';
    const br = r.bottomRight || '0';
    const bl = r.bottomLeft || '0';
    
    if (tl !== '0' || tr !== '0' || br !== '0' || bl !== '0') {
      style.borderRadius = `${tl} ${tr} ${br} ${bl}`;
    }
  }

  return style;
}

/**
 * Generate typography styles
 */
function generateTypographyStyles(typography: Partial<TypographySettings>): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (typography.fontFamily) style.fontFamily = typography.fontFamily;
  if (typography.fontSize) style.fontSize = typography.fontSize;
  if (typography.fontWeight) style.fontWeight = typography.fontWeight;
  if (typography.fontStyle && typography.fontStyle !== 'normal') {
    style.fontStyle = typography.fontStyle;
  }
  if (typography.lineHeight) style.lineHeight = typography.lineHeight;
  if (typography.letterSpacing && typography.letterSpacing !== '0') {
    style.letterSpacing = typography.letterSpacing;
  }
  if (typography.wordSpacing && typography.wordSpacing !== '0') {
    style.wordSpacing = typography.wordSpacing;
  }
  if (typography.textAlign) style.textAlign = typography.textAlign;
  if (typography.textTransform && typography.textTransform !== 'none') {
    style.textTransform = typography.textTransform;
  }
  if (typography.textDecoration && typography.textDecoration !== 'none') {
    let decoration = typography.textDecoration;
    if (typography.textDecorationStyle) {
      decoration += ` ${typography.textDecorationStyle}`;
    }
    if (typography.textDecorationColor) {
      decoration += ` ${typography.textDecorationColor}`;
    }
    style.textDecoration = decoration;
  }
  if (typography.color) style.color = typography.color;

  // Text shadow
  if (typography.textShadow && typography.textShadow.length > 0) {
    style.textShadow = typography.textShadow
      .map((s) => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`)
      .join(', ');
  }

  return style;
}

/**
 * Generate transform CSS string
 */
function generateTransformStyles(transform: Partial<TransformSettings>): string | null {
  const transforms: string[] = [];

  // Translate
  if (transform.translateX && transform.translateX !== '0') {
    transforms.push(`translateX(${transform.translateX})`);
  }
  if (transform.translateY && transform.translateY !== '0') {
    transforms.push(`translateY(${transform.translateY})`);
  }
  if (transform.translateZ && transform.translateZ !== '0') {
    transforms.push(`translateZ(${transform.translateZ})`);
  }

  // Rotate
  if (transform.rotateX && transform.rotateX !== 0) {
    transforms.push(`rotateX(${transform.rotateX}deg)`);
  }
  if (transform.rotateY && transform.rotateY !== 0) {
    transforms.push(`rotateY(${transform.rotateY}deg)`);
  }
  if (transform.rotateZ && transform.rotateZ !== 0) {
    transforms.push(`rotateZ(${transform.rotateZ}deg)`);
  }

  // Scale
  if (transform.scaleX !== undefined && transform.scaleX !== 1) {
    transforms.push(`scaleX(${transform.scaleX})`);
  }
  if (transform.scaleY !== undefined && transform.scaleY !== 1) {
    transforms.push(`scaleY(${transform.scaleY})`);
  }

  // Skew
  if (transform.skewX && transform.skewX !== 0) {
    transforms.push(`skewX(${transform.skewX}deg)`);
  }
  if (transform.skewY && transform.skewY !== 0) {
    transforms.push(`skewY(${transform.skewY}deg)`);
  }

  // Perspective
  if (transform.perspective && transform.perspective !== 'none') {
    transforms.push(`perspective(${transform.perspective})`);
  }

  return transforms.length > 0 ? transforms.join(' ') : null;
}

/**
 * Generate transition CSS string
 */
function generateTransitionStyles(transition: Partial<TransitionSettings>): string {
  if (!transition.enabled) return '';

  const property = transition.property === 'custom' 
    ? (transition.customProperty || 'all') 
    : (transition.property || 'all');
  
  const duration = transition.duration || 300;
  const delay = transition.delay || 0;
  
  let timing: string = transition.timingFunction || 'ease';
  if (transition.timingFunction === 'cubic-bezier' && transition.cubicBezier) {
    timing = `cubic-bezier(${transition.cubicBezier.join(', ')})`;
  }

  return `${property} ${duration}ms ${timing} ${delay}ms`;
}

/**
 * Generate filter CSS string
 */
function generateFilterStyles(filter: Partial<FilterSettings>): string | null {
  const filters: string[] = [];

  if (filter.blur && filter.blur > 0) {
    filters.push(`blur(${filter.blur}px)`);
  }
  if (filter.brightness !== undefined && filter.brightness !== 100) {
    filters.push(`brightness(${filter.brightness}%)`);
  }
  if (filter.contrast !== undefined && filter.contrast !== 100) {
    filters.push(`contrast(${filter.contrast}%)`);
  }
  if (filter.grayscale && filter.grayscale > 0) {
    filters.push(`grayscale(${filter.grayscale}%)`);
  }
  if (filter.saturate !== undefined && filter.saturate !== 100) {
    filters.push(`saturate(${filter.saturate}%)`);
  }
  if (filter.hueRotate && filter.hueRotate !== 0) {
    filters.push(`hue-rotate(${filter.hueRotate}deg)`);
  }
  if (filter.invert && filter.invert > 0) {
    filters.push(`invert(${filter.invert}%)`);
  }
  if (filter.sepia && filter.sepia > 0) {
    filters.push(`sepia(${filter.sepia}%)`);
  }
  if (filter.opacity !== undefined && filter.opacity !== 100) {
    filters.push(`opacity(${filter.opacity}%)`);
  }

  return filters.length > 0 ? filters.join(' ') : null;
}

/**
 * Generate backdrop filter CSS string
 */
function generateBackdropFilterStyles(filter: Partial<BackdropFilterSettings>): string | null {
  if (!filter.enabled) return null;

  const filters: string[] = [];

  if (filter.blur && filter.blur > 0) {
    filters.push(`blur(${filter.blur}px)`);
  }
  if (filter.brightness !== undefined && filter.brightness !== 100) {
    filters.push(`brightness(${filter.brightness}%)`);
  }
  if (filter.contrast !== undefined && filter.contrast !== 100) {
    filters.push(`contrast(${filter.contrast}%)`);
  }
  if (filter.grayscale && filter.grayscale > 0) {
    filters.push(`grayscale(${filter.grayscale}%)`);
  }
  if (filter.saturate !== undefined && filter.saturate !== 100) {
    filters.push(`saturate(${filter.saturate}%)`);
  }

  return filters.length > 0 ? filters.join(' ') : null;
}

/**
 * Generate box shadow CSS string
 */
function generateBoxShadowStyles(shadows: BoxShadow[]): string {
  return shadows
    .map((s) => {
      const inset = s.inset ? 'inset ' : '';
      return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
    })
    .join(', ');
}

/**
 * Generate pseudo-state CSS
 */
function generatePseudoStateCSS(
  elementId: string,
  pseudoStyles: Partial<Record<PseudoClass, Partial<AdvancedStyling>>>
): string {
  const cssRules: string[] = [];

  const pseudoMap: Record<PseudoClass, string> = {
    'default': '',
    'hover': ':hover',
    'active': ':active',
    'focus': ':focus',
    'focus-within': ':focus-within',
    'focus-visible': ':focus-visible',
    'visited': ':visited',
    'disabled': ':disabled',
    'first-child': ':first-child',
    'last-child': ':last-child',
    'before': '::before',
    'after': '::after',
  };

  for (const [state, styling] of Object.entries(pseudoStyles)) {
    if (state === 'default' || !styling) continue;

    const pseudoSelector = pseudoMap[state as PseudoClass];
    if (!pseudoSelector) continue;

    const styles = generateStyles(styling);
    const cssProperties = Object.entries(styles.style)
      .map(([prop, value]) => {
        // Convert camelCase to kebab-case
        const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${kebabProp}: ${value};`;
      })
      .join('\n');

    if (cssProperties) {
      cssRules.push(`#${elementId}${pseudoSelector} {\n${cssProperties}\n}`);
    }
  }

  return cssRules.join('\n\n');
}

/**
 * Merge styling with defaults
 */
export function mergeWithDefaults(
  styling?: Partial<AdvancedStyling>
): AdvancedStyling {
  return {
    layout: styling?.layout,
    background: styling?.background,
    border: styling?.border,
    typography: styling?.typography,
    transform: styling?.transform,
    transition: styling?.transition,
    filter: styling?.filter,
    backdropFilter: styling?.backdropFilter,
    boxShadow: styling?.boxShadow,
  };
}

export default generateStyles;
