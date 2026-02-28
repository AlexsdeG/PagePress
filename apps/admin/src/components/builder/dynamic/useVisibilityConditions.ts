// PagePress v0.0.16 - 2026-02-28
// useVisibilityConditions — Evaluates visibility rules for builder components

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useBuilderStore } from '@/stores/builder';
import type {
  VisibilityRules,
  VisibilityCondition,
  ConditionGroup,
} from './types';

interface ConditionContext {
  isLoggedIn: boolean;
  userRole: string;
  device: string;
  isHomepage: boolean;
  pageSlug: string;
}

/**
 * Evaluate a single condition against the current context
 */
function evaluateCondition(
  condition: VisibilityCondition,
  ctx: ConditionContext
): boolean {
  const { subject, operator, value } = condition;

  // Get the subject value from context
  let subjectValue: string;

  switch (subject) {
    case 'user.logged_in':
      // Boolean condition — true if user is logged in
      return ctx.isLoggedIn;
    case 'user.logged_out':
      return !ctx.isLoggedIn;
    case 'user.role':
      subjectValue = ctx.userRole;
      break;
    case 'device.type':
      subjectValue = ctx.device;
      break;
    case 'page.is_homepage':
      return ctx.isHomepage;
    case 'page.slug':
      subjectValue = ctx.pageSlug;
      break;
    case 'page.is_not_homepage':
      return !ctx.isHomepage;
    default:
      return true; // Unknown condition — default to visible
  }

  // Apply operator
  switch (operator) {
    case 'equals':
      return subjectValue === value;
    case 'not_equals':
      return subjectValue !== value;
    case 'contains':
      return subjectValue.includes(value);
    case 'not_contains':
      return !subjectValue.includes(value);
    case 'is_empty':
      return !subjectValue || subjectValue.length === 0;
    case 'is_not_empty':
      return !!subjectValue && subjectValue.length > 0;
    default:
      return true;
  }
}

/**
 * Evaluate a condition group (all conditions joined by AND or OR)
 */
function evaluateGroup(group: ConditionGroup, ctx: ConditionContext): boolean {
  if (group.conditions.length === 0) return true;

  if (group.logic === 'and') {
    return group.conditions.every((c) => evaluateCondition(c, ctx));
  }
  return group.conditions.some((c) => evaluateCondition(c, ctx));
}

/**
 * Hook that evaluates visibility rules and returns whether element should be visible.
 *
 * In the builder editor, always returns `true` so elements remain editable.
 * The conditions are only enforced in preview/published mode.
 *
 * @param rules - The VisibilityRules from component props
 * @param isPreview - Whether we're in preview mode (conditions enforced)
 * @returns `true` if element should be visible
 */
export function useVisibilityConditions(
  rules: VisibilityRules | undefined,
  isPreview: boolean = false
): boolean {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeBreakpoint = useBuilderStore((s) => s.activeBreakpoint);

  return useMemo(() => {
    // No rules or not enabled — always visible
    if (!rules || !rules.enabled || rules.groups.length === 0) return true;

    // In editor mode (not preview) — always visible so user can edit
    if (!isPreview) return true;

    const ctx: ConditionContext = {
      isLoggedIn: isAuthenticated,
      userRole: user?.role ?? 'visitor',
      device: activeBreakpoint,
      isHomepage: false, // Will be determined by page context
      pageSlug: '',
    };

    // Evaluate groups based on groupLogic
    if (rules.groupLogic === 'and') {
      return rules.groups.every((g) => evaluateGroup(g, ctx));
    }
    return rules.groups.some((g) => evaluateGroup(g, ctx));
  }, [rules, isPreview, isAuthenticated, user?.role, activeBreakpoint]);
}
