// PagePress v0.0.9 - 2025-12-04
// Video component for the page builder with advanced styling support

import { useNode, useEditor } from '@craftjs/core';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { useAdvancedStyling } from '../hooks/useAdvancedStyling';
import type { FC } from 'react';
import { VideoSettings } from './Video.settings';
import type { AdvancedStyling } from '../inspector/styles/types';
import type { ElementMetadata } from '../inspector/sidebar/types';

/**
 * Video component props
 */
export interface VideoProps {
  source?: 'youtube' | 'vimeo' | 'mp4' | 'upload';
  url?: string;
  posterImage?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  width?: string;
  className?: string;
  // Advanced styling
  advancedStyling?: Partial<AdvancedStyling>;
  metadata?: ElementMetadata;
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(?:.*\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Get aspect ratio padding percentage
 */
function getAspectRatioPadding(ratio: string): string {
  const ratios: Record<string, string> = {
    '16:9': '56.25%',
    '4:3': '75%',
    '1:1': '100%',
    '21:9': '42.86%',
  };
  return ratios[ratio] || '56.25%';
}

/**
 * Video component - YouTube, Vimeo, MP4 with poster image
 */
export const Video: FC<VideoProps> & { craft?: Record<string, unknown> } = ({
  source = 'youtube',
  url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  posterImage = '',
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  aspectRatio = '16:9',
  width = '100%',
  className = '',
}) => {
  const { isPreviewMode } = useBuilderStore();
  
  const {
    connectors: { connect, drag },
    id,
  } = useNode((node) => ({
    id: node.id,
  }));

  const { isSelected, isHovered } = useEditor((state) => ({
    isSelected: state.events.selected.has(id),
    isHovered: state.events.hovered.has(id),
  }));

  // Get advanced styling
  const { 
    style: advancedStyle, 
    className: advancedClassName,
    attributes,
    elementId,
    hasAdvancedStyling,
  } = useAdvancedStyling();

  // Parse value helper
  const parseValue = (value: string) => {
    if (!value) return '100%';
    return value.includes('px') || value.includes('%') ? value : `${value}px`;
  };

  // Get outline styles based on selection/hover state
  const getOutlineStyles = () => {
    if (isPreviewMode) return {};
    
    if (isSelected) {
      return {
        outline: '2px solid #2563eb',
        outlineOffset: '-2px',
      };
    }
    
    if (isHovered) {
      return {
        outline: '2px dashed #60a5fa',
        outlineOffset: '-2px',
      };
    }
    
    return {};
  };

  // Base styles (legacy - overridden by advanced styling)
  const baseStyle: React.CSSProperties = hasAdvancedStyling ? {} : {
    width: parseValue(width),
  };

  // Render video based on source
  const renderVideo = () => {
    if (source === 'youtube') {
      const videoId = getYouTubeId(url);
      if (!videoId) {
        return (
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
            Invalid YouTube URL
          </div>
        );
      }
      
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (muted) params.set('mute', '1');
      if (loop) params.set('loop', '1');
      if (!controls) params.set('controls', '0');
      
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      );
    }

    if (source === 'vimeo') {
      const videoId = getVimeoId(url);
      if (!videoId) {
        return (
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">
            Invalid Vimeo URL
          </div>
        );
      }
      
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (muted) params.set('muted', '1');
      if (loop) params.set('loop', '1');
      
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?${params.toString()}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      );
    }

    // MP4
    return (
      <video
        src={url}
        poster={posterImage}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      id={elementId}
      className={cn(
        'relative',
        !isPreviewMode && 'transition-all duration-150',
        advancedClassName,
        className
      )}
      style={{
        ...baseStyle,
        ...advancedStyle,
        ...getOutlineStyles(),
      }}
      {...attributes}
    >
      {/* Selection label */}
      {isSelected && !isPreviewMode && (
        <span className="absolute -top-5 left-0 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded-t-lg font-medium z-10">
          Video
        </span>
      )}
      {/* Aspect ratio container */}
      <div
        className="relative w-full bg-muted overflow-hidden"
        style={{
          paddingBottom: getAspectRatioPadding(aspectRatio),
        }}
      >
        {renderVideo()}
        
        {/* Edit mode overlay - intercepts clicks for element selection */}
        {!isPreviewMode && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            style={{
              background: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
            }}
            title="Click to select, right-click for options"
          />
        )}
      </div>
    </div>
  );
};

/**
 * Craft.js configuration
 */
Video.craft = {
  displayName: 'Video',
  props: {
    source: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    posterImage: '',
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
    aspectRatio: '16:9',
    width: '100%',
    className: '',
    // Advanced styling props
    advancedStyling: {},
    pseudoStateStyling: {},
    metadata: undefined,
  },
  related: {
    settings: VideoSettings,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false, // Leaf node - no children
  },
};
