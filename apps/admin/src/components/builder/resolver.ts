// PagePress v0.0.5 - 2025-11-30
// Component resolver for Craft.js

import { Container } from './components/Container';
import { Text } from './components/Text';
import { Heading } from './components/Heading';
import { BuilderImage } from './components/Image';
import { BuilderButton } from './components/Button';
import { HTMLBlock } from './components/HTMLBlock';

/**
 * Component resolver map for Craft.js Editor
 * Maps component names to their implementations
 */
export const componentResolver = {
  Container,
  Text,
  Heading,
  Image: BuilderImage,
  Button: BuilderButton,
  HTMLBlock,
};

/**
 * Type for component resolver
 */
export type ComponentResolver = typeof componentResolver;

/**
 * Component names
 */
export type ComponentName = keyof ComponentResolver;
