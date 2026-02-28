// PagePress v0.0.17 - 2026-02-28
// Server-side Style Generator — converts AdvancedStyling JSON to CSS strings
// Mirrors the frontend styleGenerator.ts logic for server-side rendering

/**
 * Check if a value represents zero
 */
function isZeroValue(value: string): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '0') return true;
  return /^0(px|%|em|rem|vh|vw|pt|cm|mm|in)?$/i.test(trimmed);
}

/**
 * Ensure a numeric value has a unit (defaults to px)
 */
function ensureUnit(value: string): string {
  if (!value) return value;
  const trimmed = value.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  return trimmed;
}

// ─── Type Definitions (mirroring frontend types) ───────────────────────

interface GradientStop {
  color: string;
  position: number;
}

interface GradientSettings {
  type: 'linear' | 'radial';
  angle?: number;
  shape?: 'circle' | 'ellipse';
  stops: GradientStop[];
}

interface BackgroundImageSettings {
  url: string;
  size: 'cover' | 'contain' | 'auto' | 'custom';
  customWidth?: string;
  customHeight?: string;
  position: string;
  customX?: string;
  customY?: string;
  repeat: string;
  attachment: string;
}

interface BackgroundSettings {
  type: 'none' | 'color' | 'gradient' | 'image' | 'video';
  color?: string;
  gradient?: GradientSettings;
  image?: BackgroundImageSettings;
}

interface BorderSide {
  width: number;
  style: string;
  color: string;
}

interface BorderRadius {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
  linked: boolean;
}

interface BorderSettings {
  top: BorderSide;
  right: BorderSide;
  bottom: BorderSide;
  left: BorderSide;
  linked: boolean;
  radius: BorderRadius;
}

interface TextShadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  color: string;
}

interface TypographySettings {
  fontFamily: string;
  fontSize: string;
  fontWeight: number | string;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  textAlign: string;
  textTransform: string;
  textDecoration: string;
  textDecorationStyle?: string;
  textDecorationColor?: string;
  textShadow?: TextShadow[];
  color: string;
}

interface PositionSettings {
  position: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
}

interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
  linked: boolean;
}

interface DimensionsSettings {
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
}

interface FlexSettings {
  direction: string;
  wrap: string;
  justifyContent: string;
  alignItems: string;
  alignContent: string;
  gap: string;
  rowGap: string;
  columnGap: string;
}

interface FlexItemSettings {
  order: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: string;
}

interface LayoutSettings {
  display: string;
  position: PositionSettings;
  dimensions: DimensionsSettings;
  margin: SpacingValue;
  padding: SpacingValue;
  overflow: string;
  overflowX?: string;
  overflowY?: string;
  flex?: FlexSettings;
  flexItem?: FlexItemSettings;
}

interface TransformSettings {
  translateX: string;
  translateY: string;
  translateZ: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  perspective: string;
  originX: string;
  originXCustom?: string;
  originY: string;
  originYCustom?: string;
}

interface TransitionSettings {
  enabled: boolean;
  property: string;
  customProperty?: string;
  duration: number;
  timingFunction: string;
  cubicBezier?: [number, number, number, number];
  delay: number;
}

interface FilterSettings {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  saturate: number;
  hueRotate: number;
  invert: number;
  sepia: number;
  opacity: number;
}

interface BackdropFilterSettings {
  enabled: boolean;
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  saturate: number;
}

interface BoxShadow {
  id: string;
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export interface AdvancedStyling {
  layout?: Partial<LayoutSettings>;
  background?: Partial<BackgroundSettings>;
  border?: Partial<BorderSettings>;
  typography?: Partial<TypographySettings>;
  transform?: Partial<TransformSettings>;
  transition?: Partial<TransitionSettings>;
  filter?: Partial<FilterSettings>;
  backdropFilter?: Partial<BackdropFilterSettings>;
  boxShadow?: BoxShadow[];
}

type PseudoClass =
  | 'default' | 'hover' | 'active' | 'focus' | 'focus-within'
  | 'focus-visible' | 'visited' | 'disabled'
  | 'first-child' | 'last-child' | 'before' | 'after';

type PseudoStateStyling = Partial<Record<PseudoClass, Partial<AdvancedStyling>>>;

interface BreakpointEntry extends Partial<AdvancedStyling> {
  pseudoStates?: PseudoStateStyling;
}

type BreakpointStyling = {
  desktop?: BreakpointEntry;
  tablet?: BreakpointEntry;
  mobile?: BreakpointEntry;
  mobilePortrait?: BreakpointEntry;
};

// ─── Style Generation Functions ────────────────────────────────────────

function generateLayoutCSS(layout: Partial<LayoutSettings>): Record<string, string> {
  const css: Record<string, string> = {};

  if (layout.display) css['display'] = layout.display;

  if (layout.position) {
    const pos = layout.position;
    if (pos.position && pos.position !== 'static') css['position'] = pos.position;
    if (pos.top) css['top'] = pos.top;
    if (pos.right) css['right'] = pos.right;
    if (pos.bottom) css['bottom'] = pos.bottom;
    if (pos.left) css['left'] = pos.left;
    if (pos.zIndex !== undefined) css['z-index'] = String(pos.zIndex);
  }

  if (layout.dimensions) {
    const dim = layout.dimensions;
    if (dim.width && dim.width !== 'auto') css['width'] = ensureUnit(dim.width);
    if (dim.height && dim.height !== 'auto') css['height'] = ensureUnit(dim.height);
    if (dim.minWidth) css['min-width'] = ensureUnit(dim.minWidth);
    if (dim.maxWidth) css['max-width'] = ensureUnit(dim.maxWidth);
    if (dim.minHeight) css['min-height'] = ensureUnit(dim.minHeight);
    if (dim.maxHeight) css['max-height'] = ensureUnit(dim.maxHeight);
  }

  if (layout.margin) {
    const m = layout.margin;
    if (m.top && !isZeroValue(m.top)) css['margin-top'] = ensureUnit(m.top);
    if (m.right && !isZeroValue(m.right)) css['margin-right'] = ensureUnit(m.right);
    if (m.bottom && !isZeroValue(m.bottom)) css['margin-bottom'] = ensureUnit(m.bottom);
    if (m.left && !isZeroValue(m.left)) css['margin-left'] = ensureUnit(m.left);
  }

  if (layout.padding) {
    const p = layout.padding;
    if (p.top && !isZeroValue(p.top)) css['padding-top'] = ensureUnit(p.top);
    if (p.right && !isZeroValue(p.right)) css['padding-right'] = ensureUnit(p.right);
    if (p.bottom && !isZeroValue(p.bottom)) css['padding-bottom'] = ensureUnit(p.bottom);
    if (p.left && !isZeroValue(p.left)) css['padding-left'] = ensureUnit(p.left);
  }

  if (layout.overflow && layout.overflow !== 'visible') css['overflow'] = layout.overflow;
  if (layout.overflowX) css['overflow-x'] = layout.overflowX;
  if (layout.overflowY) css['overflow-y'] = layout.overflowY;

  if (layout.display === 'flex' && layout.flex) {
    const f = layout.flex;
    if (f.direction) css['flex-direction'] = f.direction;
    if (f.wrap) css['flex-wrap'] = f.wrap;
    if (f.justifyContent) css['justify-content'] = f.justifyContent;
    if (f.alignItems) css['align-items'] = f.alignItems;
    if (f.alignContent) css['align-content'] = f.alignContent;
    if (f.gap) css['gap'] = f.gap;
    if (f.rowGap) css['row-gap'] = f.rowGap;
    if (f.columnGap) css['column-gap'] = f.columnGap;
  }

  if (layout.flexItem) {
    const fi = layout.flexItem;
    if (fi.order !== undefined && fi.order !== 0) css['order'] = String(fi.order);
    if (fi.flexGrow !== undefined && fi.flexGrow !== 0) css['flex-grow'] = String(fi.flexGrow);
    if (fi.flexShrink !== undefined && fi.flexShrink !== 1) css['flex-shrink'] = String(fi.flexShrink);
    if (fi.flexBasis && fi.flexBasis !== 'auto') css['flex-basis'] = fi.flexBasis;
    if (fi.alignSelf && fi.alignSelf !== 'auto') css['align-self'] = fi.alignSelf;
  }

  return css;
}

function generateGradientCSS(gradient: GradientSettings): string {
  const stops = gradient.stops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');
  if (gradient.type === 'linear') {
    return `linear-gradient(${gradient.angle || 180}deg, ${stops})`;
  }
  return `radial-gradient(${gradient.shape || 'circle'}, ${stops})`;
}

function generateBackgroundCSS(background: Partial<BackgroundSettings>): Record<string, string> {
  const css: Record<string, string> = {};

  if (background.type === 'color' && background.color) {
    css['background-color'] = background.color;
  }

  if (background.type === 'gradient' && background.gradient) {
    css['background'] = generateGradientCSS(background.gradient);
  }

  if (background.type === 'image' && background.image) {
    const img = background.image;
    css['background-image'] = `url(${img.url})`;
    if (img.size === 'custom') {
      css['background-size'] = `${img.customWidth || 'auto'} ${img.customHeight || 'auto'}`;
    } else {
      css['background-size'] = img.size;
    }
    if (img.position === 'custom') {
      css['background-position'] = `${img.customX || '50%'} ${img.customY || '50%'}`;
    } else {
      css['background-position'] = img.position.replace('-', ' ');
    }
    css['background-repeat'] = img.repeat;
    css['background-attachment'] = img.attachment;
  }

  return css;
}

function generateBorderCSS(border: Partial<BorderSettings>): Record<string, string> {
  const css: Record<string, string> = {};

  if (border.top && border.top.width > 0 && border.top.style !== 'none') {
    css['border-top'] = `${border.top.width}px ${border.top.style} ${border.top.color}`;
  }
  if (border.right && border.right.width > 0 && border.right.style !== 'none') {
    css['border-right'] = `${border.right.width}px ${border.right.style} ${border.right.color}`;
  }
  if (border.bottom && border.bottom.width > 0 && border.bottom.style !== 'none') {
    css['border-bottom'] = `${border.bottom.width}px ${border.bottom.style} ${border.bottom.color}`;
  }
  if (border.left && border.left.width > 0 && border.left.style !== 'none') {
    css['border-left'] = `${border.left.width}px ${border.left.style} ${border.left.color}`;
  }

  if (border.radius) {
    const r = border.radius;
    const tl = r.topLeft || '0';
    const tr = r.topRight || '0';
    const br = r.bottomRight || '0';
    const bl = r.bottomLeft || '0';
    if (tl !== '0' || tr !== '0' || br !== '0' || bl !== '0') {
      css['border-radius'] = `${tl} ${tr} ${br} ${bl}`;
    }
  }

  return css;
}

function generateTypographyCSS(typography: Partial<TypographySettings>): Record<string, string> {
  const css: Record<string, string> = {};

  if (typography.fontFamily) css['font-family'] = typography.fontFamily;
  if (typography.fontSize) css['font-size'] = typography.fontSize;
  if (typography.fontWeight) css['font-weight'] = String(typography.fontWeight);
  if (typography.fontStyle && typography.fontStyle !== 'normal') css['font-style'] = typography.fontStyle;
  if (typography.lineHeight) css['line-height'] = typography.lineHeight;
  if (typography.letterSpacing && typography.letterSpacing !== '0') css['letter-spacing'] = typography.letterSpacing;
  if (typography.wordSpacing && typography.wordSpacing !== '0') css['word-spacing'] = typography.wordSpacing;
  if (typography.textAlign) css['text-align'] = typography.textAlign;
  if (typography.textTransform && typography.textTransform !== 'none') css['text-transform'] = typography.textTransform;
  if (typography.textDecoration && typography.textDecoration !== 'none') {
    let decoration = typography.textDecoration;
    if (typography.textDecorationStyle) decoration += ` ${typography.textDecorationStyle}`;
    if (typography.textDecorationColor) decoration += ` ${typography.textDecorationColor}`;
    css['text-decoration'] = decoration;
  }
  if (typography.color) css['color'] = typography.color;

  if (typography.textShadow && typography.textShadow.length > 0) {
    css['text-shadow'] = typography.textShadow
      .map((s) => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`)
      .join(', ');
  }

  return css;
}

function generateTransformCSS(transform: Partial<TransformSettings>): string | null {
  const transforms: string[] = [];

  if (transform.translateX && transform.translateX !== '0') transforms.push(`translateX(${transform.translateX})`);
  if (transform.translateY && transform.translateY !== '0') transforms.push(`translateY(${transform.translateY})`);
  if (transform.translateZ && transform.translateZ !== '0') transforms.push(`translateZ(${transform.translateZ})`);

  if (transform.rotateX && transform.rotateX !== 0) transforms.push(`rotateX(${transform.rotateX}deg)`);
  if (transform.rotateY && transform.rotateY !== 0) transforms.push(`rotateY(${transform.rotateY}deg)`);
  if (transform.rotateZ && transform.rotateZ !== 0) transforms.push(`rotateZ(${transform.rotateZ}deg)`);

  if (transform.scaleX !== undefined && transform.scaleX !== 1) transforms.push(`scaleX(${transform.scaleX})`);
  if (transform.scaleY !== undefined && transform.scaleY !== 1) transforms.push(`scaleY(${transform.scaleY})`);

  if (transform.skewX && transform.skewX !== 0) transforms.push(`skewX(${transform.skewX}deg)`);
  if (transform.skewY && transform.skewY !== 0) transforms.push(`skewY(${transform.skewY}deg)`);

  if (transform.perspective && transform.perspective !== 'none') transforms.push(`perspective(${transform.perspective})`);

  return transforms.length > 0 ? transforms.join(' ') : null;
}

function generateTransitionCSS(transition: Partial<TransitionSettings>): string {
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

function generateFilterCSS(filter: Partial<FilterSettings>): string | null {
  const parts: string[] = [];
  if (filter.blur && filter.blur > 0) parts.push(`blur(${filter.blur}px)`);
  if (filter.brightness !== undefined && filter.brightness !== 100) parts.push(`brightness(${filter.brightness}%)`);
  if (filter.contrast !== undefined && filter.contrast !== 100) parts.push(`contrast(${filter.contrast}%)`);
  if (filter.grayscale && filter.grayscale > 0) parts.push(`grayscale(${filter.grayscale}%)`);
  if (filter.saturate !== undefined && filter.saturate !== 100) parts.push(`saturate(${filter.saturate}%)`);
  if (filter.hueRotate && filter.hueRotate !== 0) parts.push(`hue-rotate(${filter.hueRotate}deg)`);
  if (filter.invert && filter.invert > 0) parts.push(`invert(${filter.invert}%)`);
  if (filter.sepia && filter.sepia > 0) parts.push(`sepia(${filter.sepia}%)`);
  if (filter.opacity !== undefined && filter.opacity < 100) parts.push(`opacity(${filter.opacity}%)`);
  return parts.length > 0 ? parts.join(' ') : null;
}

function generateBackdropFilterCSS(backdrop: Partial<BackdropFilterSettings>): string | null {
  if (!backdrop.enabled) return null;
  const parts: string[] = [];
  if (backdrop.blur && backdrop.blur > 0) parts.push(`blur(${backdrop.blur}px)`);
  if (backdrop.brightness !== undefined && backdrop.brightness !== 100) parts.push(`brightness(${backdrop.brightness}%)`);
  if (backdrop.contrast !== undefined && backdrop.contrast !== 100) parts.push(`contrast(${backdrop.contrast}%)`);
  if (backdrop.grayscale && backdrop.grayscale > 0) parts.push(`grayscale(${backdrop.grayscale}%)`);
  if (backdrop.saturate !== undefined && backdrop.saturate !== 100) parts.push(`saturate(${backdrop.saturate}%)`);
  return parts.length > 0 ? parts.join(' ') : null;
}

function generateBoxShadowCSS(shadows: BoxShadow[]): string | null {
  if (!shadows || shadows.length === 0) return null;
  return shadows
    .map((s) => `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
    .join(', ');
}

/**
 * Generate CSS properties from AdvancedStyling object
 */
export function stylingToCSS(styling?: Partial<AdvancedStyling>): Record<string, string> {
  if (!styling) return {};
  const css: Record<string, string> = {};

  if (styling.layout) Object.assign(css, generateLayoutCSS(styling.layout));
  if (styling.background) Object.assign(css, generateBackgroundCSS(styling.background));
  if (styling.border) Object.assign(css, generateBorderCSS(styling.border));
  if (styling.typography) Object.assign(css, generateTypographyCSS(styling.typography));

  if (styling.transform) {
    const t = generateTransformCSS(styling.transform);
    if (t) {
      css['transform'] = t;
      const originX = styling.transform.originX === 'custom'
        ? styling.transform.originXCustom || 'center'
        : styling.transform.originX || 'center';
      const originY = styling.transform.originY === 'custom'
        ? styling.transform.originYCustom || 'center'
        : styling.transform.originY || 'center';
      css['transform-origin'] = `${originX} ${originY}`;
    }
  }

  if (styling.transition?.enabled) {
    const t = generateTransitionCSS(styling.transition);
    if (t) css['transition'] = t;
  }

  if (styling.filter) {
    const f = generateFilterCSS(styling.filter);
    if (f) css['filter'] = f;
  }

  if (styling.backdropFilter) {
    const bf = generateBackdropFilterCSS(styling.backdropFilter);
    if (bf) {
      css['backdrop-filter'] = bf;
      css['-webkit-backdrop-filter'] = bf;
    }
  }

  if (styling.boxShadow) {
    const bs = generateBoxShadowCSS(styling.boxShadow);
    if (bs) css['box-shadow'] = bs;
  }

  return css;
}

/**
 * Convert CSS properties record to a CSS declaration block string
 */
export function cssPropsToString(css: Record<string, string>): string {
  return Object.entries(css)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');
}

// Pseudo-class mapping
const PSEUDO_MAP: Record<PseudoClass, string> = {
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

/**
 * Generate full CSS for an element including base, pseudo-states, and responsive
 */
export function generateElementCSS(
  elementId: string,
  advancedStyling?: Partial<AdvancedStyling>,
  pseudoStates?: PseudoStateStyling,
  breakpointStyling?: BreakpointStyling,
  customCSS?: string,
): string {
  const rules: string[] = [];

  // Base styles
  if (advancedStyling) {
    const baseCss = stylingToCSS(advancedStyling);
    const baseStr = cssPropsToString(baseCss);
    if (baseStr) {
      rules.push(`#${elementId} {\n${baseStr}\n}`);
    }
  }

  // Pseudo-state styles
  if (pseudoStates) {
    for (const [state, styling] of Object.entries(pseudoStates)) {
      if (state === 'default' || !styling) continue;
      const pseudoSelector = PSEUDO_MAP[state as PseudoClass];
      if (!pseudoSelector) continue;
      const css = stylingToCSS(styling as Partial<AdvancedStyling>);
      const str = cssPropsToString(css);
      if (str) {
        rules.push(`#${elementId}${pseudoSelector} {\n${str}\n}`);
      }
    }
  }

  // Responsive breakpoints
  if (breakpointStyling) {
    // Tablet (< 992px)
    if (breakpointStyling.tablet) {
      const tabletCss = stylingToCSS(breakpointStyling.tablet);
      const tabletStr = cssPropsToString(tabletCss);
      if (tabletStr) {
        rules.push(`@media (max-width: 992px) {\n  #${elementId} {\n${tabletStr}\n  }\n}`);
      }
      if (breakpointStyling.tablet.pseudoStates) {
        for (const [state, styling] of Object.entries(breakpointStyling.tablet.pseudoStates)) {
          if (state === 'default' || !styling) continue;
          const ps = PSEUDO_MAP[state as PseudoClass];
          if (!ps) continue;
          const css = stylingToCSS(styling as Partial<AdvancedStyling>);
          const str = cssPropsToString(css);
          if (str) {
            rules.push(`@media (max-width: 992px) {\n  #${elementId}${ps} {\n${str}\n  }\n}`);
          }
        }
      }
    }

    // Mobile (< 768px)
    if (breakpointStyling.mobile) {
      const mobileCss = stylingToCSS(breakpointStyling.mobile);
      const mobileStr = cssPropsToString(mobileCss);
      if (mobileStr) {
        rules.push(`@media (max-width: 768px) {\n  #${elementId} {\n${mobileStr}\n  }\n}`);
      }
      if (breakpointStyling.mobile.pseudoStates) {
        for (const [state, styling] of Object.entries(breakpointStyling.mobile.pseudoStates)) {
          if (state === 'default' || !styling) continue;
          const ps = PSEUDO_MAP[state as PseudoClass];
          if (!ps) continue;
          const css = stylingToCSS(styling as Partial<AdvancedStyling>);
          const str = cssPropsToString(css);
          if (str) {
            rules.push(`@media (max-width: 768px) {\n  #${elementId}${ps} {\n${str}\n  }\n}`);
          }
        }
      }
    }

    // Mobile Portrait (< 479px)
    if (breakpointStyling.mobilePortrait) {
      const portraitCss = stylingToCSS(breakpointStyling.mobilePortrait);
      const portraitStr = cssPropsToString(portraitCss);
      if (portraitStr) {
        rules.push(`@media (max-width: 479px) {\n  #${elementId} {\n${portraitStr}\n  }\n}`);
      }
      if (breakpointStyling.mobilePortrait.pseudoStates) {
        for (const [state, styling] of Object.entries(breakpointStyling.mobilePortrait.pseudoStates)) {
          if (state === 'default' || !styling) continue;
          const ps = PSEUDO_MAP[state as PseudoClass];
          if (!ps) continue;
          const css = stylingToCSS(styling as Partial<AdvancedStyling>);
          const str = cssPropsToString(css);
          if (str) {
            rules.push(`@media (max-width: 479px) {\n  #${elementId}${ps} {\n${str}\n  }\n}`);
          }
        }
      }
    }
  }

  // Custom CSS
  if (customCSS) {
    rules.push(customCSS.replace(/%root%/g, `#${elementId}`));
  }

  return rules.join('\n\n');
}

/**
 * Generate inline style attribute string from legacy component props
 */
export function legacyPropsToInlineStyle(props: Record<string, unknown>, componentType: string): string {
  const css: Record<string, string> = {};

  // Common padding/margin
  const padding = props.padding as number | undefined;
  const paddingTop = props.paddingTop as number | undefined;
  const paddingRight = props.paddingRight as number | undefined;
  const paddingBottom = props.paddingBottom as number | undefined;
  const paddingLeft = props.paddingLeft as number | undefined;
  if (paddingTop ?? padding) css['padding-top'] = `${paddingTop ?? padding}px`;
  if (paddingRight ?? padding) css['padding-right'] = `${paddingRight ?? padding}px`;
  if (paddingBottom ?? padding) css['padding-bottom'] = `${paddingBottom ?? padding}px`;
  if (paddingLeft ?? padding) css['padding-left'] = `${paddingLeft ?? padding}px`;

  const margin = props.margin as number | undefined;
  const marginTop = props.marginTop as number | undefined;
  const marginRight = props.marginRight as number | undefined;
  const marginBottom = props.marginBottom as number | undefined;
  const marginLeft = props.marginLeft as number | undefined;
  if (marginTop ?? margin) css['margin-top'] = `${marginTop ?? margin}px`;
  if (marginRight ?? margin) css['margin-right'] = `${marginRight ?? margin}px`;
  if (marginBottom ?? margin) css['margin-bottom'] = `${marginBottom ?? margin}px`;
  if (marginLeft ?? margin) css['margin-left'] = `${marginLeft ?? margin}px`;

  if (props.backgroundColor && props.backgroundColor !== 'transparent') {
    css['background-color'] = String(props.backgroundColor);
  }
  if (props.borderRadius) css['border-radius'] = `${props.borderRadius}px`;
  if (props.borderWidth && Number(props.borderWidth) > 0) {
    css['border'] = `${props.borderWidth}px solid ${props.borderColor || '#e5e7eb'}`;
  }
  if (props.minHeight) css['min-height'] = `${props.minHeight}px`;

  // Container specifics
  if (componentType === 'Container' || componentType === 'Div' || componentType === 'Section') {
    if (props.gap) css['gap'] = `${props.gap}px`;
    const display = (props.display as string) || 'flex';
    css['display'] = display;
    if (display === 'flex') {
      const dirMap: Record<string, string> = { row: 'row', column: 'column', 'row-reverse': 'row-reverse', 'column-reverse': 'column-reverse' };
      const jcMap: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' };
      const aiMap: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' };
      if (props.flexDirection) css['flex-direction'] = dirMap[String(props.flexDirection)] || 'column';
      if (props.justifyContent) css['justify-content'] = jcMap[String(props.justifyContent)] || 'flex-start';
      if (props.alignItems) css['align-items'] = aiMap[String(props.alignItems)] || 'stretch';
    }
    const width = props.width as string;
    if (width === 'full') css['width'] = '100%';
    else if (width === 'fit') css['width'] = 'fit-content';
  }

  // Section specifics
  if (componentType === 'Section') {
    const contentWidth = props.contentWidth as string;
    if (contentWidth === 'full') css['width'] = '100%';
    else if (contentWidth === 'boxed') css['max-width'] = String(props.maxWidth || '1280') + 'px';
  }

  // Row specifics
  if (componentType === 'Row') {
    css['display'] = 'flex';
    if (props.gap) css['gap'] = `${props.gap}px`;
    const jcMap: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around' };
    if (props.justifyContent) css['justify-content'] = jcMap[String(props.justifyContent)] || 'flex-start';
    if (props.alignItems) css['align-items'] = String(props.alignItems) || 'stretch';
    if (props.wrap !== false) css['flex-wrap'] = 'wrap';
  }

  // Column specifics
  if (componentType === 'Column') {
    css['display'] = 'flex';
    css['flex-direction'] = 'column';
    if (props.width) css['width'] = String(props.width);
    if (props.flexGrow) css['flex-grow'] = String(props.flexGrow);
    if (props.flexBasis) css['flex-basis'] = String(props.flexBasis);
  }

  // Text/Heading specifics
  if (componentType === 'Text' || componentType === 'Heading') {
    if (props.fontSize) css['font-size'] = `${props.fontSize}px`;
    if (props.color) css['color'] = String(props.color);
    if (props.lineHeight) css['line-height'] = String(props.lineHeight);
    if (props.letterSpacing) css['letter-spacing'] = `${props.letterSpacing}px`;
    const fwMap: Record<string, string> = { normal: '400', medium: '500', semibold: '600', bold: '700' };
    if (props.fontWeight) css['font-weight'] = fwMap[String(props.fontWeight)] || '400';
    if (props.textAlign) css['text-align'] = String(props.textAlign);
  }

  // Image specifics
  if (componentType === 'Image') {
    if (props.objectFit) css['object-fit'] = String(props.objectFit);
    if (props.width === 'full') css['width'] = '100%';
    else if (typeof props.width === 'number') css['width'] = `${props.width}px`;
    if (typeof props.height === 'number') css['height'] = `${props.height}px`;
  }

  // Button specifics
  if (componentType === 'Button') {
    css['display'] = 'inline-flex';
    css['align-items'] = 'center';
    css['justify-content'] = 'center';
    css['cursor'] = 'pointer';
    css['text-decoration'] = 'none';
    if (props.fullWidth) css['width'] = '100%';
    if (props.textColor) css['color'] = String(props.textColor);
    if (props.backgroundColor) css['background-color'] = String(props.backgroundColor);
    const sizeMap: Record<string, string> = { sm: '8px 16px', md: '10px 20px', lg: '14px 28px' };
    css['padding'] = sizeMap[String(props.size || 'md')] || '10px 20px';
  }

  // Divider specifics
  if (componentType === 'Divider') {
    css['border'] = 'none';
    const style = (props.style as string) || 'solid';
    const color = (props.color as string) || '#e5e7eb';
    const width = props.width || 100;
    css['width'] = `${width}%`;
    css[`border-top`] = `${props.thickness || 1}px ${style} ${color}`;
  }

  // Spacer specifics
  if (componentType === 'Spacer') {
    css['height'] = `${props.height || 40}px`;
  }

  return Object.entries(css)
    .map(([p, v]) => `${p}: ${v}`)
    .join('; ');
}
