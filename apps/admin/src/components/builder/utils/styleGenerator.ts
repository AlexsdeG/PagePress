// PagePress v0.0.10 - 2025-12-04
// Style Generator - Converts AdvancedStyling to CSS styles and Tailwind classes

import type {
  AdvancedStyling,
  LayoutSettings,
  BackgroundSettings,
  BorderSettings,
  TypographySettings,
  TransformSettings,
  TransitionSettings,
  GradientSettings,
} from '../inspector/styles/types';

import type { PseudoClass, CustomAttribute } from '../inspector/sidebar/types';

/**
 * Check if a value represents zero (handles '0', '0px', '0%', etc.)
 */
function isZeroValue(value: string): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '0') return true;
  // Match 0 followed by any unit
  return /^0(px|%|em|rem|vh|vw|pt|cm|mm|in)?$/i.test(trimmed);
}

/**
 * Ensure a numeric value has a unit (defaults to px)
 */
function ensureUnit(value: string): string {
  if (!value) return value;
  const trimmed = value.trim();
  // If it's just a number, add px
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  // If it already has a unit or is a CSS value like 'auto', return as is
  return trimmed;
}

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
import type { BreakpointStyling } from '../inspector/styles/types';

/**
 * Convert AdvancedStyling to CSS styles and classes
 */
export function generateStyles(
  styling?: Partial<AdvancedStyling>,
  pseudoStyles?: Partial<Record<PseudoClass, Partial<AdvancedStyling>>>,
  breakpointStyling?: BreakpointStyling,
  elementId?: string,
  customCSS?: string,
  customAttributes?: CustomAttribute[]
): GeneratedStyles {
  if (!styling && !breakpointStyling) {
    return { style: {}, className: '' };
  }

  const style: React.CSSProperties = {};
  const classes: string[] = [];

  // Generate layout styles
  if (styling?.layout) {
    Object.assign(style, generateLayoutStyles(styling.layout));
  }

  // Generate background styles
  if (styling?.background) {
    Object.assign(style, generateBackgroundStyles(styling.background));
  }

  // Generate border styles
  if (styling?.border) {
    Object.assign(style, generateBorderStyles(styling.border));
  }

  // Generate typography styles
  if (styling?.typography) {
    Object.assign(style, generateTypographyStyles(styling.typography));
  }

  // Generate transform styles
  if (styling?.transform) {
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
  if (styling?.transition?.enabled) {
    style.transition = generateTransitionStyles(styling.transition);
  }

  // Generate box shadow styles
  if (styling?.boxShadow && styling.boxShadow.length > 0) {
    // style.boxShadow = generateBoxShadowStyles(styling.boxShadow);
  }

  // Generate pseudo-state CSS
  let pseudoCSS = '';

  // CRITICAL FIX: Move base styles to CSS to allow responsive overrides
  // Inline styles have higher specificity than classes, so they block responsive styles
  if (elementId && Object.keys(style).length > 0) {
    const baseCSS = cssPropsToString(style);
    if (baseCSS) {
      pseudoCSS += `#${elementId} {\n${baseCSS}\n}`;
      // Clear inline styles so they don't conflict
      // We keep the object reference but empty it, or just reassign
      for (const key in style) delete style[key as keyof React.CSSProperties];
    }
  }

  if (elementId && pseudoStyles) {
    const pCss = generatePseudoStateCSS(`#${elementId}`, pseudoStyles);
    if (pCss) pseudoCSS += (pseudoCSS ? '\n\n' : '') + pCss;
  }

  // Generate responsive CSS (Media Queries)
  if (elementId && breakpointStyling) {
    const mediaCSS = generateResponsiveCSS(elementId, breakpointStyling);
    if (mediaCSS) {
      pseudoCSS += (pseudoCSS ? '\n\n' : '') + mediaCSS;
    }
  }

  // Add custom CSS
  if (elementId && customCSS) {
    const scopedCSS = customCSS.replace(/%root%/g, `#${elementId}`);
    pseudoCSS += (pseudoCSS ? '\n' : '') + scopedCSS;
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
    style, // This will be empty if elementId was provided
    className: classes.join(' '),
    pseudoCSS: pseudoCSS.trim() || undefined,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  };
}

/**
 * Generate responsive CSS for breakpoints
 */
function generateResponsiveCSS(
  elementId: string,
  breakpointStyling: BreakpointStyling
): string {
  const cssRules: string[] = [];

  // Tablet (< 992px)
  if (breakpointStyling.tablet) {
    const tabletStyles = generateStyles(breakpointStyling.tablet);
    const tabletCSS = cssPropsToString(tabletStyles.style);

    // Also handle pseudo-states inside tablet
    if (breakpointStyling.tablet.pseudoStates) {
      // Standard media query
      const tabletPseudoCSS = generatePseudoStateCSS(`#${elementId}`, breakpointStyling.tablet.pseudoStates);
      if (tabletPseudoCSS) {
        cssRules.push(`@media (max-width: 992px) {\n${tabletPseudoCSS}\n}`);
      }

      // Simulation class
      const tabletSimPseudoCSS = generatePseudoStateCSS(`.bp-tablet #${elementId}`, breakpointStyling.tablet.pseudoStates);
      if (tabletSimPseudoCSS) {
        cssRules.push(tabletSimPseudoCSS);
      }
    }

    if (tabletCSS) {
      // Standard media query
      cssRules.push(`@media (max-width: 992px) {\n  #${elementId} {\n${tabletCSS}\n  }\n}`);

      // Simulation class
      cssRules.push(`.bp-tablet #${elementId} {\n${tabletCSS}\n}`);
    }
  }

  // Mobile (< 768px)
  if (breakpointStyling.mobile) {
    const mobileStyles = generateStyles(breakpointStyling.mobile);
    const mobileCSS = cssPropsToString(mobileStyles.style);

    // Also handle pseudo-states inside mobile
    if (breakpointStyling.mobile.pseudoStates) {
      // Standard media query
      const mobilePseudoCSS = generatePseudoStateCSS(`#${elementId}`, breakpointStyling.mobile.pseudoStates);
      if (mobilePseudoCSS) {
        cssRules.push(`@media (max-width: 768px) {\n${mobilePseudoCSS}\n}`);
      }

      // Simulation class
      const mobileSimPseudoCSS = generatePseudoStateCSS(`.bp-mobile #${elementId}`, breakpointStyling.mobile.pseudoStates);
      if (mobileSimPseudoCSS) {
        cssRules.push(mobileSimPseudoCSS);
      }
    }

    if (mobileCSS) {
      // Standard media query
      cssRules.push(`@media (max-width: 768px) {\n  #${elementId} {\n${mobileCSS}\n  }\n}`);

      // Simulation class
      cssRules.push(`.bp-mobile #${elementId} {\n${mobileCSS}\n}`);
    }
  }

  return cssRules.join('\n\n');
}

/**
 * Helper to convert React.CSSProperties to CSS string
 */
function cssPropsToString(style: React.CSSProperties): string {
  return Object.entries(style)
    .map(([prop, value]) => {
      const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `    ${kebabProp}: ${value};`;
    })
    .join('\n');
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
    if (dim.width && dim.width !== 'auto') style.width = ensureUnit(dim.width);
    if (dim.height && dim.height !== 'auto') style.height = ensureUnit(dim.height);
    if (dim.minWidth) style.minWidth = ensureUnit(dim.minWidth);
    if (dim.maxWidth) style.maxWidth = ensureUnit(dim.maxWidth);
    if (dim.minHeight) style.minHeight = ensureUnit(dim.minHeight);
    if (dim.maxHeight) style.maxHeight = ensureUnit(dim.maxHeight);
  }

  // Margin
  if (layout.margin) {
    const m = layout.margin;
    if (m.top && !isZeroValue(m.top)) style.marginTop = ensureUnit(m.top);
    if (m.right && !isZeroValue(m.right)) style.marginRight = ensureUnit(m.right);
    if (m.bottom && !isZeroValue(m.bottom)) style.marginBottom = ensureUnit(m.bottom);
    if (m.left && !isZeroValue(m.left)) style.marginLeft = ensureUnit(m.left);
  }

  // Padding
  if (layout.padding) {
    const p = layout.padding;
    if (p.top && !isZeroValue(p.top)) style.paddingTop = ensureUnit(p.top);
    if (p.right && !isZeroValue(p.right)) style.paddingRight = ensureUnit(p.right);
    if (p.bottom && !isZeroValue(p.bottom)) style.paddingBottom = ensureUnit(p.bottom);
    if (p.left && !isZeroValue(p.left)) style.paddingLeft = ensureUnit(p.left);
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

  // Ensure units are present
  return `${property} ${duration}ms ${timing} ${delay}ms`;
}

/**
 * Generate pseudo-state CSS
 */
function generatePseudoStateCSS(
  selector: string,
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

        // Handle numeric values that might need units if they were raw numbers in React style
        // But generateStyles already ensures units for most things
        return `  ${kebabProp}: ${value};`;
      })
      .join('\n');

    if (cssProperties) {
      cssRules.push(`${selector}${pseudoSelector} {\n${cssProperties}\n}`);
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
