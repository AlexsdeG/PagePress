// PagePress v0.0.12 - 2025-12-05
// useAdvancedStyling - Hook for applying advanced styling to builder components

import { useMemo, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { generateStyles, type GeneratedStyles } from '../utils/styleGenerator';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata, PseudoClass } from '../inspector/sidebar/types';
import { useGlobalSettingsStore } from '../global/globalSettingsStore';

interface UseAdvancedStylingOptions {
  /** Default styles to merge with */
  defaultStyle?: React.CSSProperties;
  /** Additional CSS classes */
  additionalClasses?: string;
  /** Component type for global settings inheritance */
  componentType?: 'container' | 'button' | 'link' | 'form' | 'heading' | 'text';
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
  /** Whether custom transition is enabled (don't apply default transition class) */
  hasCustomTransition: boolean;
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
  const { defaultStyle = {}, additionalClasses = '', componentType } = options;
  const themeSettings = useGlobalSettingsStore((state) => state.themeSettings);

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
    let globalDefaults: React.CSSProperties = {};

    if (componentType && themeSettings?.elements?.[componentType]) {
      // Map global settings to CSS properties
      // We need to be careful about property names matching CSS properties
      const defaults = themeSettings.elements[componentType];

      // Basic mapping - this might need refinement based on GlobalElementDefaults structure
      // For container: { maxWidth, padding }
      // For button: { padding, borderRadius, fontSize }
      // For link: { color, textDecoration } (hoverColor handled via pseudo)

      if (componentType === 'container') {
        const containerDefaults = defaults as { maxWidth: string; padding: string };
        if (containerDefaults.padding) globalDefaults.padding = containerDefaults.padding;
        // maxWidth usually applies to width or max-width depending on layout
        // But here we just set maxWidth
        if (containerDefaults.maxWidth) globalDefaults.maxWidth = containerDefaults.maxWidth;
      } else if (componentType === 'button') {
        const btnDefaults = defaults as { padding: string; borderRadius: string; fontSize: string };
        if (btnDefaults.padding) globalDefaults.padding = btnDefaults.padding;
        if (btnDefaults.borderRadius) globalDefaults.borderRadius = btnDefaults.borderRadius;
        if (btnDefaults.fontSize) globalDefaults.fontSize = btnDefaults.fontSize;
      } else if (componentType === 'link') {
        const linkDefaults = defaults as { color: string; textDecoration: string };
        if (linkDefaults.color) globalDefaults.color = linkDefaults.color;
        if (linkDefaults.textDecoration) globalDefaults.textDecoration = linkDefaults.textDecoration;
      } else if (componentType === 'heading') {
        // Apply global heading styles
        if (themeSettings.typography) {
          const typo = themeSettings.typography;
          if (typo.fontFamily?.heading) globalDefaults.fontFamily = typo.fontFamily.heading;
          if (typo.headingLineHeight) globalDefaults.lineHeight = typo.headingLineHeight;
          // Note: fontSize depends on level, which we don't know here easily without passing it in options
          // But Heading component handles its own default font size logic via getActualFontSize
          // However, if we want advanced styling to reflect it, we might need to pass it.
          // For now, we let Heading component handle the specific level size via its own logic
          // unless advancedStyling overrides it.
        }
      } else if (componentType === 'text') {
        // Apply global body styles
        if (themeSettings.typography) {
          const typo = themeSettings.typography;
          if (typo.fontFamily?.body) globalDefaults.fontFamily = typo.fontFamily.body;
          if (typo.bodyLineHeight) globalDefaults.lineHeight = typo.bodyLineHeight;
          if (typo.baseFontSize) globalDefaults.fontSize = `${typo.baseFontSize}px`;
        }
      }
    }

    return {
      ...defaultStyle,
      ...globalDefaults,
      ...generatedStyles.style,
    };
  }, [defaultStyle, generatedStyles.style, themeSettings, componentType]);

  // Combine classes
  const combinedClassName = useMemo(() => {
    const classes = [additionalClasses, generatedStyles.className].filter(Boolean);
    return classes.join(' ');
  }, [additionalClasses, generatedStyles.className]);

  // Prepare attributes
  const attributes = useMemo(() => {
    return generatedStyles.attributes || {};
  }, [generatedStyles.attributes]);

  // Check if custom transition is enabled
  const hasCustomTransition = Boolean(advancedStyling?.transition?.enabled);

  // If custom transition is enabled, we need to ensure it's applied to the style
  // The generator already handles this, but we need to make sure the component knows about it
  // so it doesn't apply default Tailwind transitions that might conflict

  return {
    style: combinedStyle,
    className: combinedClassName,
    attributes,
    elementId,
    hasAdvancedStyling: Boolean(advancedStyling),
    hasCustomTransition,
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
