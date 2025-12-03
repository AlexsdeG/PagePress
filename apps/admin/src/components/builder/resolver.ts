// PagePress v0.0.6 - 2025-12-03
// Component resolver for Craft.js

import { Container } from './components/Container';
import { Text } from './components/Text';
import { Heading } from './components/Heading';
import { BuilderImage } from './components/Image';
import { BuilderButton } from './components/Button';
import { HTMLBlock } from './components/HTMLBlock';
// Layout Components
import { Section } from './components/Section';
import { Row } from './components/Row';
import { Column } from './components/Column';
import { Div } from './components/Div';
// Basic Components
import { Divider } from './components/Divider';
import { Spacer } from './components/Spacer';
import { Icon } from './components/Icon';
import { IconBox } from './components/IconBox';
import { Link } from './components/Link';
import { List } from './components/List';
// Media Components
import { Video } from './components/Video';

/**
 * Component resolver map for Craft.js Editor
 * Maps component names to their implementations
 */
export const componentResolver = {
  // Core Components
  Container,
  Text,
  Heading,
  Image: BuilderImage,
  Button: BuilderButton,
  HTMLBlock,
  // Layout Components
  Section,
  Row,
  Column,
  Div,
  // Basic Components
  Divider,
  Spacer,
  Icon,
  IconBox,
  Link,
  List,
  // Media Components
  Video,
};

/**
 * Type for component resolver
 */
export type ComponentResolver = typeof componentResolver;

/**
 * Component names
 */
export type ComponentName = keyof ComponentResolver;
