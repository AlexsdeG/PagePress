// PagePress v0.0.5 - 2025-11-30
// Container component for the page builder

import { useNode } from '@craftjs/core';
import { cn } from '@/lib/utils';
import type { FC } from 'react';
import type { ContainerProps } from '../types';
import { ContainerSettings } from './Container.settings';

/**
 * Container component - A flexible wrapper component
 */
export const Container: FC<ContainerProps> & { craft?: Record<string, unknown> } = ({
  display = 'flex',
  flexDirection = 'column',
  justifyContent = 'start',
  alignItems = 'stretch',
  gap = 8,
  padding = 16,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin = 0,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  backgroundColor = 'transparent',
  borderRadius = 0,
  borderWidth = 0,
  borderColor = '#e5e7eb',
  minHeight = 60,
  width = 'full',
  className = '',
  children,
}) => {
  const {
    connectors: { connect, drag },
    isCanvas,
  } = useNode((node) => ({
    isCanvas: node.data.isCanvas,
  }));

  const flexClasses: Record<string, Record<string, string>> = {
    justifyContent: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    alignItems: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    flexDirection: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  };

  const widthClass = width === 'full' ? 'w-full' : width === 'fit' ? 'w-fit' : 'w-auto';

  // Calculate padding
  const paddingStyle = {
    paddingTop: paddingTop ?? padding,
    paddingRight: paddingRight ?? padding,
    paddingBottom: paddingBottom ?? padding,
    paddingLeft: paddingLeft ?? padding,
  };

  // Calculate margin
  const marginStyle = {
    marginTop: marginTop ?? margin,
    marginRight: marginRight ?? margin,
    marginBottom: marginBottom ?? margin,
    marginLeft: marginLeft ?? margin,
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          // Canvas containers only need connect (for dropping)
          // Non-canvas containers need both connect and drag
          if (isCanvas) {
            connect(ref);
          } else {
            connect(drag(ref));
          }
        }
      }}
      className={cn(
        display === 'flex' && 'flex',
        display === 'grid' && 'grid',
        display === 'flex' && flexClasses.flexDirection[flexDirection],
        display === 'flex' && flexClasses.justifyContent[justifyContent],
        display === 'flex' && flexClasses.alignItems[alignItems],
        widthClass,
        className
      )}
      style={{
        gap: `${gap}px`,
        ...paddingStyle,
        ...marginStyle,
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderStyle: borderWidth > 0 ? 'solid' : 'none',
        minHeight: `${minHeight}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Craft.js configuration
 */
Container.craft = {
  displayName: 'Container',
  props: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'stretch',
    gap: 8,
    padding: 16,
    margin: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#e5e7eb',
    minHeight: 60,
    width: 'full',
    className: '',
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
