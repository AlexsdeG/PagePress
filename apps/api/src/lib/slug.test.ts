import { describe, it, expect } from 'vitest';
import { generateSlug } from './slug.js';

describe('generateSlug', () => {
  it('converts text to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('my page title')).toBe('my-page-title');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello! @World #2024')).toBe('hello-world-2024');
  });

  it('replaces underscores with hyphens', () => {
    expect(generateSlug('hello_world_test')).toBe('hello-world-test');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('  --hello world--  ')).toBe('hello-world');
  });

  it('collapses multiple separators', () => {
    expect(generateSlug('hello   ---   world')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});
