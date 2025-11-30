// PagePress v0.0.5 - 2025-11-30
// Heading component for the page builder

import { useNode } from '@craftjs/core';
import { cn } from '@/lib/utils';
import type { FC } from 'react';
import type { HeadingProps } from '../types';
import { HeadingSettings } from './Heading.settings';

/**
 * Default font sizes for each heading level
 */
const defaultFontSizes: Record<number, number> = {
  1: 36,
  2: 30,
  3: 24,
  4: 20,
  5: 18,
  6: 16,
};

/**
 * Heading component - H1-H6 heading block
 */
export const Heading: FC<HeadingProps> & { craft?: Record<string, unknown> } = ({
  text = 'Heading',
  level = 2,
  fontSize,
  fontWeight = 'bold',
  textAlign = 'left',
  color = '#000000',
  className = '',
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const fontWeightClass: Record<string, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const textAlignClass: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  const actualFontSize = fontSize ?? defaultFontSizes[level];

  return (
    <HeadingTag
      ref={(ref) => ref && connect(drag(ref))}
      className={cn(
        fontWeightClass[fontWeight],
        textAlignClass[textAlign],
        selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
        className
      )}
      style={{
        fontSize: `${actualFontSize}px`,
        color,
      }}
    >
      {text}
    </HeadingTag>
  );
};

/**
 * Craft.js configuration
 */
Heading.craft = {
  displayName: 'Heading',
  props: {
    text: 'Heading',
    level: 2,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#000000',
    className: '',
  },
  related: {
    settings: HeadingSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
