// PagePress v0.0.16 - 2026-02-28
// ConditionsPanel — UI for managing element visibility conditions

import { useCallback } from 'react';
import { useNode } from '@craftjs/core';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CONDITION_SUBJECTS,
  CONDITION_OPERATORS,
  generateConditionId,
  generateGroupId,
  createDefaultVisibilityRules,
  type VisibilityRules,
  type VisibilityCondition,
  type ConditionGroup,
  type ConditionOperator,
} from './types';

/**
 * ConditionsPanel — Shown as a settings tab for managing conditional visibility
 */
export function ConditionsPanel() {
  const {
    actions: { setProp },
    visibilityRules,
  } = useNode((node) => ({
    visibilityRules: (node.data.props.visibilityRules ||
      createDefaultVisibilityRules()) as VisibilityRules,
  }));

  const updateRules = useCallback(
    (updater: (rules: VisibilityRules) => VisibilityRules) => {
      setProp((props: Record<string, unknown>) => {
        const current = (props.visibilityRules ||
          createDefaultVisibilityRules()) as VisibilityRules;
        props.visibilityRules = updater(current);
      });
    },
    [setProp]
  );

  // Toggle conditions enabled
  const toggleEnabled = useCallback(() => {
    updateRules((rules) => ({
      ...rules,
      enabled: !rules.enabled,
    }));
  }, [updateRules]);

  // Toggle group logic (and/or)
  const toggleGroupLogic = useCallback(() => {
    updateRules((rules) => ({
      ...rules,
      groupLogic: rules.groupLogic === 'and' ? 'or' : 'and',
    }));
  }, [updateRules]);

  // Add a new condition group
  const addGroup = useCallback(() => {
    updateRules((rules) => ({
      ...rules,
      groups: [
        ...rules.groups,
        {
          id: generateGroupId(),
          logic: 'and',
          conditions: [
            {
              id: generateConditionId(),
              subject: 'user.logged_in',
              operator: 'equals',
              value: '',
            },
          ],
        },
      ],
    }));
  }, [updateRules]);

  // Remove a group
  const removeGroup = useCallback(
    (groupId: string) => {
      updateRules((rules) => ({
        ...rules,
        groups: rules.groups.filter((g) => g.id !== groupId),
      }));
    },
    [updateRules]
  );

  // Toggle group's internal logic
  const toggleGroupInternalLogic = useCallback(
    (groupId: string) => {
      updateRules((rules) => ({
        ...rules,
        groups: rules.groups.map((g) =>
          g.id === groupId ? { ...g, logic: g.logic === 'and' ? 'or' : 'and' } : g
        ),
      }));
    },
    [updateRules]
  );

  // Add condition to a group
  const addCondition = useCallback(
    (groupId: string) => {
      updateRules((rules) => ({
        ...rules,
        groups: rules.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: [
                  ...g.conditions,
                  {
                    id: generateConditionId(),
                    subject: 'user.logged_in',
                    operator: 'equals' as ConditionOperator,
                    value: '',
                  },
                ],
              }
            : g
        ),
      }));
    },
    [updateRules]
  );

  // Remove condition from a group
  const removeCondition = useCallback(
    (groupId: string, conditionId: string) => {
      updateRules((rules) => ({
        ...rules,
        groups: rules.groups.map((g) =>
          g.id === groupId
            ? { ...g, conditions: g.conditions.filter((c) => c.id !== conditionId) }
            : g
        ),
      }));
    },
    [updateRules]
  );

  // Update a condition
  const updateCondition = useCallback(
    (
      groupId: string,
      conditionId: string,
      update: Partial<VisibilityCondition>
    ) => {
      updateRules((rules) => ({
        ...rules,
        groups: rules.groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: g.conditions.map((c) =>
                  c.id === conditionId ? { ...c, ...update } : c
                ),
              }
            : g
        ),
      }));
    },
    [updateRules]
  );

  const hasGroups = visibilityRules.groups.length > 0;

  return (
    <div className="space-y-4">
      {/* Header with enable toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {visibilityRules.enabled ? (
            <Eye className="h-4 w-4 text-green-500" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <Label className="text-sm font-medium">Conditional Visibility</Label>
        </div>
        <Switch
          checked={visibilityRules.enabled}
          onCheckedChange={toggleEnabled}
        />
      </div>

      {visibilityRules.enabled && (
        <>
          <p className="text-xs text-muted-foreground">
            Show this element only when the following conditions are met.
          </p>

          {/* Group logic selector */}
          {visibilityRules.groups.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Between groups:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={toggleGroupLogic}
              >
                {visibilityRules.groupLogic === 'and' ? 'AND' : 'OR'}
              </Button>
              <span className="text-[10px] text-muted-foreground">
                {visibilityRules.groupLogic === 'and'
                  ? '(all groups must pass)'
                  : '(any group can pass)'}
              </span>
            </div>
          )}

          {/* Condition groups */}
          <div className="space-y-3">
            {visibilityRules.groups.map((group, groupIndex) => (
              <ConditionGroupCard
                key={group.id}
                group={group}
                groupIndex={groupIndex}
                onToggleLogic={() => toggleGroupInternalLogic(group.id)}
                onRemoveGroup={() => removeGroup(group.id)}
                onAddCondition={() => addCondition(group.id)}
                onRemoveCondition={(condId) =>
                  removeCondition(group.id, condId)
                }
                onUpdateCondition={(condId, update) =>
                  updateCondition(group.id, condId, update)
                }
              />
            ))}
          </div>

          {/* Add group button */}
          <Button
            variant="outline"
            size="sm"
            onClick={addGroup}
            className="w-full"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {hasGroups ? 'Add Condition Group' : 'Add Conditions'}
          </Button>
        </>
      )}
    </div>
  );
}

// ─── ConditionGroupCard ────────────────────────────────────────────────

interface ConditionGroupCardProps {
  group: ConditionGroup;
  groupIndex: number;
  onToggleLogic: () => void;
  onRemoveGroup: () => void;
  onAddCondition: () => void;
  onRemoveCondition: (conditionId: string) => void;
  onUpdateCondition: (
    conditionId: string,
    update: Partial<VisibilityCondition>
  ) => void;
}

function ConditionGroupCard({
  group,
  groupIndex,
  onToggleLogic,
  onRemoveGroup,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
}: ConditionGroupCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      {/* Group header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          Group {groupIndex + 1}
        </Badge>
        <div className="flex items-center gap-1">
          {group.conditions.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[10px]"
              onClick={onToggleLogic}
            >
              {group.logic === 'and' ? 'AND' : 'OR'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-destructive"
            onClick={onRemoveGroup}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {group.conditions.map((condition, condIndex) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            showLogicLabel={condIndex > 0}
            logic={group.logic}
            onUpdate={(update) => onUpdateCondition(condition.id, update)}
            onRemove={() => onRemoveCondition(condition.id)}
          />
        ))}
      </div>

      {/* Add condition */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddCondition}
        className="w-full h-7 text-xs text-muted-foreground"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Condition
      </Button>
    </div>
  );
}

// ─── ConditionRow ──────────────────────────────────────────────────────

interface ConditionRowProps {
  condition: VisibilityCondition;
  showLogicLabel: boolean;
  logic: 'and' | 'or';
  onUpdate: (update: Partial<VisibilityCondition>) => void;
  onRemove: () => void;
}

function ConditionRow({
  condition,
  showLogicLabel,
  logic,
  onUpdate,
  onRemove,
}: ConditionRowProps) {
  const subjectDef = CONDITION_SUBJECTS.find(
    (s) => s.subject === condition.subject
  );
  const isBoolean = subjectDef?.isBoolean ?? false;

  return (
    <div className="space-y-1.5">
      {showLogicLabel && (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-2',
              logic === 'and'
                ? 'text-blue-600 border-blue-500/30'
                : 'text-orange-600 border-orange-500/30'
            )}
          >
            {logic.toUpperCase()}
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-1.5">
        <div className="flex-1 space-y-1.5">
          {/* Subject selector */}
          <Select
            value={condition.subject}
            onValueChange={(value) => onUpdate({ subject: value })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select condition..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(
                CONDITION_SUBJECTS.reduce<Record<string, typeof CONDITION_SUBJECTS>>(
                  (acc, s) => {
                    if (!acc[s.category]) acc[s.category] = [];
                    acc[s.category].push(s);
                    return acc;
                  },
                  {}
                )
              ).map(([category, subjects]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    {category}
                  </div>
                  {subjects.map((s) => (
                    <SelectItem key={s.subject} value={s.subject}>
                      {s.label}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>

          {/* Operator + Value (only for non-boolean conditions) */}
          {!isBoolean && (
            <div className="flex gap-1.5">
              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  onUpdate({ operator: value as ConditionOperator })
                }
              >
                <SelectTrigger className="h-7 text-xs w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value input — hidden for is_empty / is_not_empty */}
              {condition.operator !== 'is_empty' &&
                condition.operator !== 'is_not_empty' && (
                  <Input
                    value={condition.value}
                    onChange={(e) => onUpdate({ value: e.target.value })}
                    placeholder="Value..."
                    className="h-7 text-xs flex-1"
                  />
                )}
            </div>
          )}
        </div>

        {/* Delete condition */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
