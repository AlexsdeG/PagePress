// PagePress v0.0.13 - 2025-12-05
// Global styling hooks for connecting elements to theme settings

import { useCallback, useMemo } from 'react';
import { useGlobalSettingsStore } from '../global/globalSettingsStore';

/**
 * Hook to get global colors with utilities
 */
export function useGlobalColors() {
  const { themeSettings, updateColor, addColor, removeColor, getColorById, getColorByName } = 
    useGlobalSettingsStore();

  const colors = useMemo(() => themeSettings?.colors || [], [themeSettings]);

  const getColorValue = useCallback((idOrName: string): string | undefined => {
    const byId = getColorById(idOrName);
    if (byId) return byId.value;
    const byName = getColorByName(idOrName);
    return byName?.value;
  }, [getColorById, getColorByName]);

  const getPrimaryColor = useCallback(() => getColorValue('primary'), [getColorValue]);
  const getSecondaryColor = useCallback(() => getColorValue('secondary'), [getColorValue]);
  const getAccentColor = useCallback(() => getColorValue('accent'), [getColorValue]);

  return {
    colors,
    getColorValue,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    updateColor,
    addColor,
    removeColor,
    getColorById,
    getColorByName,
  };
}

/**
 * Hook to get global typography settings with utilities
 */
export function useGlobalTypography() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();
  
  const typography = useMemo<GlobalTypography | null>(
    () => themeSettings?.typography || null,
    [themeSettings]
  );

  const getHeadingFontFamily = useCallback(() => {
    return typography?.fontFamily?.heading || 'system-ui, sans-serif';
  }, [typography]);

  const getBodyFontFamily = useCallback(() => {
    return typography?.fontFamily?.body || 'system-ui, sans-serif';
  }, [typography]);

  const getBaseFontSize = useCallback(() => {
    return typography?.baseFontSize || 16;
  }, [typography]);

  const getHeadingSize = useCallback((level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', breakpoint: string = 'desktop') => {
    const sizes = typography?.headingSizes?.[level];
    if (!sizes) return undefined;
    return (sizes as Record<string, string>)[breakpoint];
  }, [typography]);

  const getBodyLineHeight = useCallback(() => {
    return typography?.bodyLineHeight || 1.6;
  }, [typography]);

  const getHeadingLineHeight = useCallback(() => {
    return typography?.headingLineHeight || 1.2;
  }, [typography]);

  const updateTypography = useCallback(async (updates: Partial<GlobalTypography>) => {
    if (!themeSettings) return;
    await updateThemeSettings({
      typography: {
        ...themeSettings.typography,
        ...updates,
      },
    });
  }, [themeSettings, updateThemeSettings]);

  return {
    typography,
    getHeadingFontFamily,
    getBodyFontFamily,
    getBaseFontSize,
    getHeadingSize,
    getBodyLineHeight,
    getHeadingLineHeight,
    updateTypography,
  };
}

/**
 * Hook to get global element defaults
 */
export function useGlobalElementDefaults() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();

  const elements = useMemo(() => themeSettings?.elements || null, [themeSettings]);

  const getButtonDefaults = useCallback(() => elements?.button, [elements]);
  const getLinkDefaults = useCallback(() => elements?.link, [elements]);
  const getContainerDefaults = useCallback(() => elements?.container, [elements]);
  const getFormDefaults = useCallback(() => elements?.form, [elements]);

  const updateElementDefaults = useCallback(async (
    elementType: 'button' | 'link' | 'container' | 'form',
    updates: Record<string, string>
  ) => {
    if (!themeSettings) return;
    await updateThemeSettings({
      elements: {
        ...themeSettings.elements,
        [elementType]: {
          ...themeSettings.elements[elementType],
          ...updates,
        },
      },
    });
  }, [themeSettings, updateThemeSettings]);

  return {
    elements,
    getButtonDefaults,
    getLinkDefaults,
    getContainerDefaults,
    getFormDefaults,
    updateElementDefaults,
  };
}

/**
 * Hook to get global spacing settings
 */
export function useGlobalSpacing() {
  const { themeSettings, updateThemeSettings } = useGlobalSettingsStore();

  const spacing = useMemo(() => themeSettings?.spacing || null, [themeSettings]);

  const getSpacingValue = useCallback((multiplier: number): string => {
    const base = spacing?.base || 4;
    return `${base * multiplier}px`;
  }, [spacing]);

  const getSpacingScale = useCallback(() => {
    return spacing?.scale || [0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16];
  }, [spacing]);

  return {
    spacing,
    getSpacingValue,
    getSpacingScale,
    updateSpacing: async (base: number, scale?: number[]) => {
      if (!themeSettings) return;
      await updateThemeSettings({
        spacing: {
          base,
          scale: scale || themeSettings.spacing.scale,
        },
      });
    },
  };
}

/**
 * Combined hook for all global settings
 */
export function useGlobalSettings() {
  const colors = useGlobalColors();
  const typography = useGlobalTypography();
  const elements = useGlobalElementDefaults();
  const spacing = useGlobalSpacing();
  const { themeSettings, isLoading, error, loadThemeSettings } = useGlobalSettingsStore();

  return {
    isLoading,
    error,
    isLoaded: !!themeSettings,
    loadThemeSettings,
    colors,
    typography,
    elements,
    spacing,
    themeSettings,
  };
}

/**
 * Hook to apply global typography to an element
 * Returns CSS properties based on global settings
 */
export function useApplyGlobalTypography(options?: {
  useHeadingFont?: boolean;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  inheritFromGlobal?: boolean;
}) {
  const { typography, getHeadingFontFamily, getBodyFontFamily, getHeadingSize, getBodyLineHeight, getHeadingLineHeight } = 
    useGlobalTypography();

  const style = useMemo<React.CSSProperties>(() => {
    if (!typography || options?.inheritFromGlobal === false) return {};

    const result: React.CSSProperties = {};

    // Font family
    if (options?.useHeadingFont) {
      result.fontFamily = getHeadingFontFamily();
    } else {
      result.fontFamily = getBodyFontFamily();
    }

    // Line height
    if (options?.useHeadingFont) {
      result.lineHeight = getHeadingLineHeight();
    } else {
      result.lineHeight = getBodyLineHeight();
    }

    // Heading size
    if (options?.headingLevel) {
      const size = getHeadingSize(options.headingLevel);
      if (size) {
        result.fontSize = size;
      }
    }

    return result;
  }, [typography, options, getHeadingFontFamily, getBodyFontFamily, getHeadingSize, getBodyLineHeight, getHeadingLineHeight]);

  return { style, typography };
}

export default useGlobalSettings;
