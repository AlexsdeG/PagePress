// PagePress v0.0.16 - 2026-02-28
// Dynamic data types — shared types for dynamic bindings and conditions

import type { DynamicDataSourceItem } from '@/lib/api';

/**
 * A dynamic data binding attached to a component prop
 */
export interface DynamicBinding {
  field: string;
  fallback: string;
}

/**
 * Map of prop names to their dynamic bindings
 */
export type DynamicBindings = Record<string, DynamicBinding>;

/**
 * Condition operators
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty';

/**
 * A single visibility condition
 */
export interface VisibilityCondition {
  id: string;
  subject: string;
  operator: ConditionOperator;
  value: string;
}

/**
 * A group of conditions joined by AND or OR
 */
export interface ConditionGroup {
  id: string;
  logic: 'and' | 'or';
  conditions: VisibilityCondition[];
}

/**
 * Complete visibility rules for an element
 */
export interface VisibilityRules {
  enabled: boolean;
  groupLogic: 'and' | 'or';
  groups: ConditionGroup[];
}

/**
 * Condition subject definitions for the picker UI
 */
export interface ConditionSubjectDef {
  subject: string;
  label: string;
  category: string;
  /** True if this subject doesn't need an operator/value (it's boolean) */
  isBoolean: boolean;
}

/**
 * All available condition subjects
 */
export const CONDITION_SUBJECTS: ConditionSubjectDef[] = [
  { subject: 'user.logged_in', label: 'User Logged In', category: 'User', isBoolean: true },
  { subject: 'user.logged_out', label: 'User Logged Out', category: 'User', isBoolean: true },
  { subject: 'user.role', label: 'User Role', category: 'User', isBoolean: false },
  { subject: 'page.is_homepage', label: 'Page Is Homepage', category: 'Page', isBoolean: true },
  { subject: 'device.mobile', label: 'Device Is Mobile', category: 'Device', isBoolean: true },
  { subject: 'device.tablet', label: 'Device Is Tablet', category: 'Device', isBoolean: true },
  { subject: 'device.desktop', label: 'Device Is Desktop', category: 'Device', isBoolean: true },
];

/**
 * Available operators for non-boolean conditions
 */
export const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does Not Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
];

/**
 * Dynamic data sources — grouped by category
 */
export const DYNAMIC_DATA_SOURCES: DynamicDataSourceItem[] = [
  // Site
  { field: 'site.title', label: 'Site Title', category: 'site', description: 'The name of the website', valueType: 'text' },
  { field: 'site.description', label: 'Site Description', category: 'site', description: 'The site meta description', valueType: 'text' },
  { field: 'site.url', label: 'Site URL', category: 'site', description: 'The site base URL', valueType: 'url' },
  // Page
  { field: 'page.title', label: 'Page Title', category: 'page', description: 'Current page title', valueType: 'text' },
  { field: 'page.slug', label: 'Page Slug', category: 'page', description: 'Current page slug', valueType: 'text' },
  { field: 'page.date', label: 'Page Date', category: 'page', description: 'Page creation date', valueType: 'date' },
  { field: 'page.author', label: 'Page Author', category: 'page', description: 'Page author username', valueType: 'text' },
  // User
  { field: 'user.name', label: 'User Name', category: 'user', description: 'Current logged-in user name', valueType: 'text' },
  { field: 'user.email', label: 'User Email', category: 'user', description: 'Current logged-in user email', valueType: 'text' },
  { field: 'user.role', label: 'User Role', category: 'user', description: 'Current user role (admin/editor)', valueType: 'text' },
];

/**
 * Default visibility rules (no conditions)
 */
export function createDefaultVisibilityRules(): VisibilityRules {
  return {
    enabled: false,
    groupLogic: 'and',
    groups: [],
  };
}

/**
 * Generate a unique condition ID
 */
export function generateConditionId(): string {
  return `cond-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Generate a unique condition group ID
 */
export function generateGroupId(): string {
  return `grp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}
