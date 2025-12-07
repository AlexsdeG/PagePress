// PagePress v0.0.7 - 2025-12-04
// Advanced Styling System Type Definitions

/**
 * CSS unit types
 */
export type CSSUnit = 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw' | 'auto' | 'none';

/**
 * Value with unit
 */
export interface UnitValue {
  value: number | string;
  unit: CSSUnit;
}

/**
 * RGBA color representation
 */
export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Gradient color stop
 */
export interface GradientStop {
  color: string;
  position: number; // 0-100
}

/**
 * Gradient settings
 */
export interface GradientSettings {
  type: 'linear' | 'radial';
  angle?: number; // for linear
  shape?: 'circle' | 'ellipse'; // for radial
  stops: GradientStop[];
}

/**
 * Background image settings
 */
export interface BackgroundImageSettings {
  url: string;
  size: 'cover' | 'contain' | 'auto' | 'custom';
  customWidth?: string;
  customHeight?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  customX?: string;
  customY?: string;
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  attachment: 'scroll' | 'fixed' | 'local';
}

/**
 * Background video settings
 */
export interface BackgroundVideoSettings {
  url: string;
  posterImage?: string;
  loop?: boolean;
  muted?: boolean;
}

/**
 * Background overlay settings
 */
export interface BackgroundOverlaySettings {
  enabled: boolean;
  type: 'color' | 'gradient';
  color?: string;
  opacity?: number;
  gradient?: GradientSettings;
}

/**
 * Complete background settings
 */
export interface BackgroundSettings {
  type: 'none' | 'color' | 'gradient' | 'image' | 'video';
  color?: string;
  gradient?: GradientSettings;
  image?: BackgroundImageSettings;
  video?: BackgroundVideoSettings;
  overlay?: BackgroundOverlaySettings;
}

/**
 * Box shadow definition
 */
export interface BoxShadow {
  id: string;
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

/**
 * Text shadow definition
 */
export interface TextShadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  color: string;
}

/**
 * Single border side settings
 */
export interface BorderSide {
  width: number;
  style: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  color: string;
}

/**
 * Border radius per corner
 */
export interface BorderRadius {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
  linked: boolean; // sync all corners
}

/**
 * Complete border settings
 */
export interface BorderSettings {
  top: BorderSide;
  right: BorderSide;
  bottom: BorderSide;
  left: BorderSide;
  linked: boolean; // sync all sides
  radius: BorderRadius;
}

/**
 * Transform settings
 */
export interface TransformSettings {
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
  originX: 'left' | 'center' | 'right' | 'custom';
  originY: 'top' | 'center' | 'bottom' | 'custom';
  originXCustom?: string;
  originYCustom?: string;
}

/**
 * Transition settings
 */
export interface TransitionSettings {
  enabled: boolean;
  property: 'all' | 'transform' | 'opacity' | 'background' | 'color' | 'border' | 'box-shadow' | 'custom';
  customProperty?: string;
  duration: number; // ms
  timingFunction: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'cubic-bezier';
  cubicBezier?: [number, number, number, number];
  delay: number; // ms
}

/**
 * CSS filter settings
 */
export interface FilterSettings {
  blur: number; // px
  brightness: number; // 0-200 (100 = normal)
  contrast: number; // 0-200 (100 = normal)
  grayscale: number; // 0-100
  saturate: number; // 0-200 (100 = normal)
  hueRotate: number; // 0-360 degrees
  invert: number; // 0-100
  sepia: number; // 0-100
  opacity: number; // 0-100
}

/**
 * Backdrop filter settings
 */
export interface BackdropFilterSettings {
  enabled: boolean;
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  saturate: number;
}

/**
 * Typography settings
 */
export interface TypographySettings {
  fontFamily: string;
  fontSize: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold';
  fontStyle: 'normal' | 'italic' | 'oblique';
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration: 'none' | 'underline' | 'overline' | 'line-through';
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
  textDecorationColor?: string;
  textShadow?: TextShadow[];
  color: string;
}

/**
 * Position settings
 */
export interface PositionSettings {
  position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
}

/**
 * Spacing settings (margin/padding)
 */
export interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
  linked: boolean;
}

/**
 * Dimensions settings
 */
export interface DimensionsSettings {
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
}

/**
 * Flex settings
 */
export interface FlexSettings {
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  gap: string;
  rowGap: string;
  columnGap: string;
}

/**
 * Flex item settings (for children)
 */
export interface FlexItemSettings {
  order: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
}

/**
 * Layout settings
 */
export interface LayoutSettings {
  display: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'inline-flex' | 'inline-grid' | 'none';
  position: PositionSettings;
  dimensions: DimensionsSettings;
  margin: SpacingValue;
  padding: SpacingValue;
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  flex?: FlexSettings;
  flexItem?: FlexItemSettings;
}

/**
 * Complete advanced styling settings
 */
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

/**
 * Default values for advanced styling
 */
export const defaultAdvancedStyling: AdvancedStyling = {
  layout: {
    display: 'block',
    position: {
      position: 'static',
    },
    dimensions: {
      width: 'auto',
      height: 'auto',
      minWidth: '',
      maxWidth: '',
      minHeight: '',
      maxHeight: '',
    },
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      linked: true,
    },
    padding: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
      linked: true,
    },
    overflow: 'visible',
  },
  background: {
    type: 'none',
  },
  border: {
    top: { width: 0, style: 'none', color: '#000000' },
    right: { width: 0, style: 'none', color: '#000000' },
    bottom: { width: 0, style: 'none', color: '#000000' },
    left: { width: 0, style: 'none', color: '#000000' },
    linked: true,
    radius: {
      topLeft: '0',
      topRight: '0',
      bottomRight: '0',
      bottomLeft: '0',
      linked: true,
    },
  },
  transform: {
    translateX: '0',
    translateY: '0',
    translateZ: '0',
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    perspective: 'none',
    originX: 'center',
    originY: 'center',
  },
  transition: {
    enabled: false,
    property: 'all',
    duration: 300,
    timingFunction: 'ease',
    delay: 0,
  },
  filter: {
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    saturate: 100,
    hueRotate: 0,
    invert: 0,
    sepia: 0,
    opacity: 100,
  },
  backdropFilter: {
    enabled: false,
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    saturate: 100,
  },
  boxShadow: [],
};

/**
 * Breakpoint types
 */
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

/**
 * Pseudo-class/state options
 * Expanded to match full Bricks-like experience
 */
export type PseudoClass =
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'focus-within'
  | 'focus-visible'
  | 'visited'
  | 'disabled'
  | 'first-child'
  | 'last-child'
  | 'before'
  | 'after';

/**
 * Styling with pseudo states
 */
export type PseudoStateStyling = Partial<Record<PseudoClass, Partial<AdvancedStyling>>>;

/**
 * Responsive styling with breakpoints and pseudo-states
 */
export type BreakpointStyling = {
  [key in Breakpoint]?: Partial<AdvancedStyling> & {
    pseudoStates?: PseudoStateStyling;
  };
};

