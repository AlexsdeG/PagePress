// PagePress v0.0.7 - 2025-12-04
// Utility functions to convert advanced styling settings to CSS

import type { CSSProperties } from 'react';
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
  SpacingValue,
} from './types';

/**
 * Convert gradient settings to CSS gradient string
 */
export function gradientToCSS(gradient: GradientSettings): string {
  const stops = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');

  if (gradient.type === 'linear') {
    return `linear-gradient(${gradient.angle ?? 180}deg, ${stops})`;
  }

  const shape = gradient.shape ?? 'circle';
  return `radial-gradient(${shape}, ${stops})`;
}

/**
 * Convert background settings to CSS properties
 */
export function backgroundToCSS(background: Partial<BackgroundSettings>): CSSProperties {
  const styles: CSSProperties = {};

  switch (background.type) {
    case 'color':
      styles.backgroundColor = background.color;
      break;
    case 'gradient':
      if (background.gradient) {
        styles.backgroundImage = gradientToCSS(background.gradient);
      }
      break;
    case 'image':
      if (background.image) {
        const img = background.image;
        styles.backgroundImage = `url(${img.url})`;
        
        // Size
        if (img.size === 'custom') {
          styles.backgroundSize = `${img.customWidth || 'auto'} ${img.customHeight || 'auto'}`;
        } else {
          styles.backgroundSize = img.size;
        }
        
        // Position
        if (img.position === 'custom') {
          styles.backgroundPosition = `${img.customX || '50%'} ${img.customY || '50%'}`;
        } else {
          styles.backgroundPosition = img.position.replace('-', ' ');
        }
        
        styles.backgroundRepeat = img.repeat;
        styles.backgroundAttachment = img.attachment;
      }
      break;
    case 'none':
    default:
      break;
  }

  return styles;
}

/**
 * Convert spacing value to CSS string
 */
export function spacingToCSS(spacing: SpacingValue): string {
  return `${spacing.top} ${spacing.right} ${spacing.bottom} ${spacing.left}`;
}

/**
 * Convert layout settings to CSS properties
 */
export function layoutToCSS(layout: Partial<LayoutSettings>): CSSProperties {
  const styles: CSSProperties = {};

  if (layout.display) {
    styles.display = layout.display;
  }

  if (layout.position) {
    const pos = layout.position;
    styles.position = pos.position;
    if (pos.top) styles.top = pos.top;
    if (pos.right) styles.right = pos.right;
    if (pos.bottom) styles.bottom = pos.bottom;
    if (pos.left) styles.left = pos.left;
    if (pos.zIndex !== undefined) styles.zIndex = pos.zIndex;
  }

  if (layout.dimensions) {
    const dim = layout.dimensions;
    if (dim.width && dim.width !== 'auto') styles.width = dim.width;
    if (dim.height && dim.height !== 'auto') styles.height = dim.height;
    if (dim.minWidth) styles.minWidth = dim.minWidth;
    if (dim.maxWidth) styles.maxWidth = dim.maxWidth;
    if (dim.minHeight) styles.minHeight = dim.minHeight;
    if (dim.maxHeight) styles.maxHeight = dim.maxHeight;
  }

  if (layout.margin) {
    styles.margin = spacingToCSS(layout.margin);
  }

  if (layout.padding) {
    styles.padding = spacingToCSS(layout.padding);
  }

  if (layout.overflow) {
    styles.overflow = layout.overflow;
  }

  if (layout.overflowX) {
    styles.overflowX = layout.overflowX;
  }

  if (layout.overflowY) {
    styles.overflowY = layout.overflowY;
  }

  // Flex container
  if (layout.display === 'flex' || layout.display === 'inline-flex') {
    if (layout.flex) {
      const flex = layout.flex;
      styles.flexDirection = flex.direction;
      styles.flexWrap = flex.wrap;
      styles.justifyContent = flex.justifyContent;
      styles.alignItems = flex.alignItems;
      styles.alignContent = flex.alignContent;
      if (flex.gap) styles.gap = flex.gap;
      if (flex.rowGap) styles.rowGap = flex.rowGap;
      if (flex.columnGap) styles.columnGap = flex.columnGap;
    }
  }

  // Flex item
  if (layout.flexItem) {
    const item = layout.flexItem;
    if (item.order !== 0) styles.order = item.order;
    if (item.flexGrow !== 0) styles.flexGrow = item.flexGrow;
    if (item.flexShrink !== 1) styles.flexShrink = item.flexShrink;
    if (item.flexBasis && item.flexBasis !== 'auto') styles.flexBasis = item.flexBasis;
    if (item.alignSelf !== 'auto') styles.alignSelf = item.alignSelf;
  }

  return styles;
}

/**
 * Convert border settings to CSS properties
 */
export function borderToCSS(border: Partial<BorderSettings>): CSSProperties {
  const styles: CSSProperties = {};

  // Individual borders
  if (border.top && border.top.style !== 'none') {
    styles.borderTop = `${border.top.width}px ${border.top.style} ${border.top.color}`;
  }
  if (border.right && border.right.style !== 'none') {
    styles.borderRight = `${border.right.width}px ${border.right.style} ${border.right.color}`;
  }
  if (border.bottom && border.bottom.style !== 'none') {
    styles.borderBottom = `${border.bottom.width}px ${border.bottom.style} ${border.bottom.color}`;
  }
  if (border.left && border.left.style !== 'none') {
    styles.borderLeft = `${border.left.width}px ${border.left.style} ${border.left.color}`;
  }

  // Border radius
  if (border.radius) {
    const r = border.radius;
    if (r.linked) {
      styles.borderRadius = r.topLeft;
    } else {
      styles.borderRadius = `${r.topLeft} ${r.topRight} ${r.bottomRight} ${r.bottomLeft}`;
    }
  }

  return styles;
}

/**
 * Convert typography settings to CSS properties
 */
export function typographyToCSS(typography: Partial<TypographySettings>): CSSProperties {
  const styles: CSSProperties = {};

  if (typography.fontFamily) styles.fontFamily = typography.fontFamily;
  if (typography.fontSize) styles.fontSize = typography.fontSize;
  if (typography.fontWeight) styles.fontWeight = typography.fontWeight;
  if (typography.fontStyle) styles.fontStyle = typography.fontStyle;
  if (typography.lineHeight) styles.lineHeight = typography.lineHeight;
  if (typography.letterSpacing) styles.letterSpacing = typography.letterSpacing;
  if (typography.wordSpacing) styles.wordSpacing = typography.wordSpacing;
  if (typography.textAlign) styles.textAlign = typography.textAlign;
  if (typography.textTransform) styles.textTransform = typography.textTransform;
  if (typography.color) styles.color = typography.color;

  // Text decoration
  if (typography.textDecoration && typography.textDecoration !== 'none') {
    let decoration = typography.textDecoration;
    if (typography.textDecorationStyle) {
      decoration += ` ${typography.textDecorationStyle}`;
    }
    if (typography.textDecorationColor) {
      decoration += ` ${typography.textDecorationColor}`;
    }
    styles.textDecoration = decoration;
  }

  // Text shadow
  if (typography.textShadow && typography.textShadow.length > 0) {
    styles.textShadow = typography.textShadow
      .map((shadow) => `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`)
      .join(', ');
  }

  return styles;
}

/**
 * Convert transform settings to CSS properties
 */
export function transformToCSS(transform: Partial<TransformSettings>): CSSProperties {
  const styles: CSSProperties = {};
  const transforms: string[] = [];

  // Translations
  if (transform.translateX && transform.translateX !== '0') {
    transforms.push(`translateX(${transform.translateX})`);
  }
  if (transform.translateY && transform.translateY !== '0') {
    transforms.push(`translateY(${transform.translateY})`);
  }
  if (transform.translateZ && transform.translateZ !== '0') {
    transforms.push(`translateZ(${transform.translateZ})`);
  }

  // Rotations
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

  if (transforms.length > 0) {
    styles.transform = transforms.join(' ');
  }

  // Perspective
  if (transform.perspective && transform.perspective !== 'none') {
    styles.perspective = transform.perspective;
  }

  // Transform origin
  const originX = transform.originX === 'custom' && transform.originXCustom
    ? transform.originXCustom
    : transform.originX || 'center';
  const originY = transform.originY === 'custom' && transform.originYCustom
    ? transform.originYCustom
    : transform.originY || 'center';
  
  if (originX !== 'center' || originY !== 'center') {
    styles.transformOrigin = `${originX} ${originY}`;
  }

  return styles;
}

/**
 * Convert transition settings to CSS properties
 */
export function transitionToCSS(transition: Partial<TransitionSettings>): CSSProperties {
  const styles: CSSProperties = {};

  if (!transition.enabled) {
    return styles;
  }

  const property = transition.property === 'custom' && transition.customProperty
    ? transition.customProperty
    : transition.property || 'all';
  
  const duration = `${transition.duration || 300}ms`;
  
  let timing = transition.timingFunction || 'ease';
  if (timing === 'cubic-bezier' && transition.cubicBezier) {
    timing = `cubic-bezier(${transition.cubicBezier.join(', ')})`;
  }
  
  const delay = transition.delay ? `${transition.delay}ms` : '0ms';

  styles.transition = `${property} ${duration} ${timing} ${delay}`;

  return styles;
}

/**
 * Convert filter settings to CSS properties
 */
export function filterToCSS(filter: Partial<FilterSettings>): CSSProperties {
  const styles: CSSProperties = {};
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

  if (filters.length > 0) {
    styles.filter = filters.join(' ');
  }

  return styles;
}

/**
 * Convert backdrop filter settings to CSS properties
 */
export function backdropFilterToCSS(backdropFilter: Partial<BackdropFilterSettings>): CSSProperties {
  const styles: CSSProperties = {};

  if (!backdropFilter.enabled) {
    return styles;
  }

  const filters: string[] = [];

  if (backdropFilter.blur && backdropFilter.blur > 0) {
    filters.push(`blur(${backdropFilter.blur}px)`);
  }
  if (backdropFilter.brightness !== undefined && backdropFilter.brightness !== 100) {
    filters.push(`brightness(${backdropFilter.brightness}%)`);
  }
  if (backdropFilter.contrast !== undefined && backdropFilter.contrast !== 100) {
    filters.push(`contrast(${backdropFilter.contrast}%)`);
  }
  if (backdropFilter.grayscale && backdropFilter.grayscale > 0) {
    filters.push(`grayscale(${backdropFilter.grayscale}%)`);
  }
  if (backdropFilter.saturate !== undefined && backdropFilter.saturate !== 100) {
    filters.push(`saturate(${backdropFilter.saturate}%)`);
  }

  if (filters.length > 0) {
    styles.backdropFilter = filters.join(' ');
    // Also add webkit prefix for Safari
    (styles as Record<string, unknown>).WebkitBackdropFilter = filters.join(' ');
  }

  return styles;
}

/**
 * Convert box shadow array to CSS properties
 */
export function boxShadowToCSS(shadows: BoxShadow[]): CSSProperties {
  if (!shadows || shadows.length === 0) {
    return {};
  }

  const shadowString = shadows
    .map((shadow) => {
      const inset = shadow.inset ? 'inset ' : '';
      return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
    })
    .join(', ');

  return { boxShadow: shadowString };
}

/**
 * Convert complete advanced styling to CSS properties
 */
export function advancedStylingToCSS(styling: AdvancedStyling): CSSProperties {
  return {
    ...(styling.layout && layoutToCSS(styling.layout)),
    ...(styling.background && backgroundToCSS(styling.background)),
    ...(styling.border && borderToCSS(styling.border)),
    ...(styling.typography && typographyToCSS(styling.typography)),
    ...(styling.transform && transformToCSS(styling.transform)),
    ...(styling.transition && transitionToCSS(styling.transition)),
    ...(styling.filter && filterToCSS(styling.filter)),
    ...(styling.backdropFilter && backdropFilterToCSS(styling.backdropFilter)),
    ...(styling.boxShadow && boxShadowToCSS(styling.boxShadow)),
  };
}

/**
 * Merge two styling objects (for pseudo states)
 */
export function mergeStyling(base: AdvancedStyling, override: Partial<AdvancedStyling>): AdvancedStyling {
  return {
    layout: { ...base.layout, ...override.layout },
    background: { ...base.background, ...override.background },
    border: { ...base.border, ...override.border },
    typography: { ...base.typography, ...override.typography },
    transform: { ...base.transform, ...override.transform },
    transition: { ...base.transition, ...override.transition },
    filter: { ...base.filter, ...override.filter },
    backdropFilter: { ...base.backdropFilter, ...override.backdropFilter },
    boxShadow: override.boxShadow || base.boxShadow,
  };
}
