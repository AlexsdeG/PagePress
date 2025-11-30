// PagePress v0.0.5 - 2025-11-30
// Builder module exports

// Components
export { Container } from './components/Container';
export { Text } from './components/Text';
export { Heading } from './components/Heading';
export { BuilderImage } from './components/Image';
export { BuilderButton } from './components/Button';
export { HTMLBlock } from './components/HTMLBlock';

// Settings
export { ContainerSettings } from './components/Container.settings';
export { TextSettings } from './components/Text.settings';
export { HeadingSettings } from './components/Heading.settings';
export { ImageSettings } from './components/Image.settings';
export { ButtonSettings } from './components/Button.settings';
export { HTMLBlockSettings } from './components/HTMLBlock.settings';

// Inspector inputs
export { ColorInput } from './inspector/inputs/ColorInput';
export { SpacingInput } from './inspector/inputs/SpacingInput';

// Resolver
export { componentResolver } from './resolver';
export type { ComponentResolver, ComponentName } from './resolver';

// Types
export * from './types';
