// PagePress v0.0.9 - 2025-12-04
// useAdvancedStyling - Hook for applying advanced styling to builder components

import { useMemo, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { generateStyles, type GeneratedStyles } from '../utils/styleGenerator';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata, PseudoClass } from '../inspector/sidebar/types';

interface UseAdvancedStylingOptions {
  /** Default styles to merge with */
  defaultStyle?: React.CSSProperties;
  /** Additional CSS classes */
  additionalClasses?: string;
}

interface UseAdvancedStylingResult {
  /** Combined CSS styles to apply */
  style: React.CSSProperties;
  /** Combined CSS classes */
  className: string;
  /** Custom HTML attributes */
  attributes: Record<string, string>;
  /** Element ID for CSS targeting */
  elementId: string;
  /** Whether element has advanced styling applied */
  hasAdvancedStyling: boolean;
}

/**
 * Hook for applying advanced styling to builder components
 * 
 * Usage:
 * ```tsx
 * const { style, className, attributes, elementId } = useAdvancedStyling({
 *   defaultStyle: { padding: '16px' },
 *   additionalClasses: 'my-component'
 * });
 * 
 * return (
 *   <div 
 *     id={elementId} 
 *     style={style} 
 *     className={className}
 *     {...attributes}
 *   >
 *     {children}
 *   </div>
 * );
 * ```
 */
export function useAdvancedStyling(
  options: UseAdvancedStylingOptions = {}
): UseAdvancedStylingResult {
  const { defaultStyle = {}, additionalClasses = '' } = options;

  const {
    advancedStyling,
    pseudoStateStyling,
    metadata,
    nodeId,
  } = useNode((node) => ({
    advancedStyling: node.data.props.advancedStyling as AdvancedStyling | undefined,
    pseudoStateStyling: node.data.props.pseudoStateStyling as Partial<Record<PseudoClass, Partial<AdvancedStyling>>> | undefined,
    metadata: node.data.props.metadata as ElementMetadata | undefined,
    nodeId: node.id,
  }));

  // Use metadata elementId or node id
  const elementId = metadata?.elementId || `pp-${nodeId}`;

  // Generate styles from advanced styling
  const generatedStyles = useMemo<GeneratedStyles>(() => {
    return generateStyles(
      advancedStyling,
      pseudoStateStyling, // Now properly passing pseudo state styling
      elementId,
      metadata?.customCSS,
      metadata?.customAttributes
    );
  }, [advancedStyling, pseudoStateStyling, elementId, metadata?.customCSS, metadata?.customAttributes]);

  // Inject pseudo CSS if present
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  
  useEffect(() => {
    if (generatedStyles.pseudoCSS) {
      // Create or update style tag
      if (!styleTagRef.current) {
        styleTagRef.current = document.createElement('style');
        styleTagRef.current.setAttribute('data-pp-element', elementId);
        document.head.appendChild(styleTagRef.current);
      }
      styleTagRef.current.textContent = generatedStyles.pseudoCSS;
    } else if (styleTagRef.current) {
      // Remove style tag if no pseudo CSS
      styleTagRef.current.remove();
      styleTagRef.current = null;
    }

    return () => {
      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
    };
  }, [generatedStyles.pseudoCSS, elementId]);

  // Combine default style with generated styles
  const combinedStyle = useMemo<React.CSSProperties>(() => {
    return {
      ...defaultStyle,
      ...generatedStyles.style,
    };
  }, [defaultStyle, generatedStyles.style]);

  // Combine classes
  const combinedClassName = useMemo(() => {
    const classes = [additionalClasses, generatedStyles.className].filter(Boolean);
    return classes.join(' ');
  }, [additionalClasses, generatedStyles.className]);

  // Prepare attributes
  const attributes = useMemo(() => {
    return generatedStyles.attributes || {};
  }, [generatedStyles.attributes]);

  return {
    style: combinedStyle,
    className: combinedClassName,
    attributes,
    elementId,
    hasAdvancedStyling: Boolean(advancedStyling),
  };
}

/**
 * Simple helper to check if advanced styling has meaningful values
 */
export function hasAdvancedStylingValues(styling?: AdvancedStyling): boolean {
  if (!styling) return false;

  // Check each category for non-default values
  if (styling.layout) {
    const { display, position, dimensions, margin, padding } = styling.layout;
    if (display && display !== 'block') return true;
    if (position?.position && position.position !== 'static') return true;
    if (dimensions?.width && dimensions.width !== 'auto') return true;
    if (dimensions?.height && dimensions.height !== 'auto') return true;
    if (margin && (margin.top !== '0' || margin.right !== '0' || margin.bottom !== '0' || margin.left !== '0')) return true;
    if (padding && (padding.top !== '0' || padding.right !== '0' || padding.bottom !== '0' || padding.left !== '0')) return true;
  }

  if (styling.background?.type && styling.background.type !== 'none') return true;
  if (styling.border?.top?.width && styling.border.top.width > 0) return true;
  if (styling.typography?.color) return true;
  if (styling.transform) {
    if (styling.transform.translateX !== '0' || styling.transform.translateY !== '0') return true;
    if (styling.transform.rotateZ !== 0) return true;
    if (styling.transform.scaleX !== 1 || styling.transform.scaleY !== 1) return true;
  }
  if (styling.boxShadow && styling.boxShadow.length > 0) return true;
  if (styling.filter?.blur && styling.filter.blur > 0) return true;

  return false;
}

export default useAdvancedStyling;
