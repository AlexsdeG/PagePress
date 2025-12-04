// PagePress v0.0.8 - 2025-12-04
// Pseudo State Selector Component

import { cn } from '@/lib/utils';
import type { PseudoState } from '../styles/types';

interface PseudoStateSelectorProps {
  value: PseudoState;
  onChange: (state: PseudoState) => void;
  className?: string;
}

/**
 * Pseudo state buttons for selecting hover, active, focus states
 */
export function PseudoStateSelector({
  value,
  onChange,
  className,
}: PseudoStateSelectorProps) {
  const states: { value: PseudoState; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'hover', label: ':hover' },
    { value: 'active', label: ':active' },
    { value: 'focus', label: ':focus' },
  ];

  return (
    <div className={cn('flex gap-1', className)}>
      {states.map((state) => (
        <button
          key={state.value}
          onClick={() => onChange(state.value)}
          className={cn(
            'px-2 py-1 text-xs rounded border transition-colors flex-1',
            value === state.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground'
          )}
        >
          {state.label}
        </button>
      ))}
    </div>
  );
}
