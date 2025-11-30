// PagePress v0.0.5 - 2025-11-30
// Text component for the page builder

import { useNode } from '@craftjs/core';
import { cn } from '@/lib/utils';
import type { FC } from 'react';
import type { TextProps } from '../types';
import { TextSettings } from './Text.settings';

/**
 * Text component - Paragraph text block
 */
export const Text: FC<TextProps> & { craft?: Record<string, unknown> } = ({
  text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  fontSize = 16,
  fontWeight = 'normal',
  textAlign = 'left',
  color = '#000000',
  lineHeight = 1.5,
  letterSpacing = 0,
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
    justify: 'text-justify',
  };

  return (
    <p
      ref={(ref) => ref && connect(drag(ref))}
      className={cn(
        fontWeightClass[fontWeight],
        textAlignClass[textAlign],
        selected && 'outline-dashed outline-2 outline-blue-500 outline-offset-2',
        className
      )}
      style={{
        fontSize: `${fontSize}px`,
        color,
        lineHeight,
        letterSpacing: `${letterSpacing}px`,
      }}
    >
      {text}
    </p>
  );
};

/**
 * Craft.js configuration
 */
Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#000000',
    lineHeight: 1.5,
    letterSpacing: 0,
    className: '',
  },
  related: {
    settings: TextSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
