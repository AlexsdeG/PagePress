import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Monitor,
    Tablet,
    Smartphone,
    Check,
    Pencil,
    X,
    RotateCcw,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useBuilderStore } from '@/stores/builder';
import { PSEUDO_CLASS_OPTIONS } from './types';
import type { PseudoClass } from '../styles/types';

interface InspectorHeaderProps {
    elementName: string;
    componentType: string;
    customName?: string;
    onRename: (name: string) => void;
    pseudoState: PseudoClass;
    onPseudoStateChange: (state: PseudoClass) => void;
    onDeselect: () => void;
    className?: string;
}

export function InspectorHeader({
    elementName,
    componentType,
    customName,
    onRename,
    pseudoState,
    onPseudoStateChange,
    onDeselect,
    className,
}: InspectorHeaderProps) {
    const { activeBreakpoint, setActiveBreakpoint } = useBuilderStore();

    const [isEditingName, setIsEditingName] = useState(false);
    const [editingNameValue, setEditingNameValue] = useState('');
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    const handleStartEditName = useCallback(() => {
        setEditingNameValue(customName || '');
        setIsEditingName(true);
    }, [customName]);

    const handleSaveName = useCallback(() => {
        onRename(editingNameValue);
        setIsEditingName(false);
    }, [onRename, editingNameValue]);

    const handleCancelEditName = useCallback(() => {
        setIsEditingName(false);
        setEditingNameValue('');
    }, []);

    const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            handleCancelEditName();
        }
    }, [handleSaveName, handleCancelEditName]);



    const currentPseudoLabel = PSEUDO_CLASS_OPTIONS.find(p => p.value === pseudoState)?.label || 'Default';

    return (
        <div className={cn("flex flex-col border-b bg-muted/10", className)}>
            {/* Top Row: Element Name & Actions */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 shrink-0 font-mono">
                        {componentType}
                    </Badge>

                    {isEditingName ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                            <Input
                                ref={nameInputRef}
                                value={editingNameValue}
                                onChange={(e) => setEditingNameValue(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={handleNameKeyDown}
                                placeholder={elementName}
                                className="h-6 text-sm flex-1 min-w-0"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={handleSaveName}
                            >
                                <Check className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={handleStartEditName}
                            className="flex items-center gap-1 min-w-0 group hover:text-primary transition-colors text-sm font-medium truncate"
                            title="Click to rename element"
                        >
                            <span className="truncate">{customName || elementName}</span>
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 shrink-0" />
                        </button>
                    )}
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground ml-2"
                                onClick={onDeselect}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Deselect</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Bottom Row: Breakpoints & Pseudo-states */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-background/50">
                {/* Active Breakpoint Display & Control */}
                <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 p-0 hover:bg-muted-foreground/20",
                                        activeBreakpoint === 'desktop' && "bg-background shadow-sm hover:bg-background"
                                    )}
                                    onClick={() => setActiveBreakpoint('desktop')}
                                >
                                    <Monitor className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Desktop Styles</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 p-0 hover:bg-muted-foreground/20",
                                        activeBreakpoint === 'tablet' && "bg-background shadow-sm hover:bg-background"
                                    )}
                                    onClick={() => setActiveBreakpoint('tablet')}
                                >
                                    <Tablet className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Tablet Styles</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 w-7 p-0 hover:bg-muted-foreground/20",
                                        activeBreakpoint === 'mobile' && "bg-background shadow-sm hover:bg-background"
                                    )}
                                    onClick={() => setActiveBreakpoint('mobile')}
                                >
                                    <Smartphone className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Mobile Styles</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Pseudo-states */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 px-2 text-xs font-medium gap-1.5 border border-transparent hover:border-border/50",
                                pseudoState !== 'default' && "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20"
                            )}
                        >
                            {pseudoState !== 'default' && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                            {currentPseudoLabel}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">State</DropdownMenuLabel>
                        {PSEUDO_CLASS_OPTIONS.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onPseudoStateChange(option.value)}
                                className={cn(
                                    "flex items-center justify-between text-xs",
                                    pseudoState === option.value && "bg-accent text-accent-foreground"
                                )}
                            >
                                {option.label}
                                {pseudoState === option.value && <Check className="h-3 w-3" />}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onPseudoStateChange('default')}
                            disabled={pseudoState === 'default'}
                            className="text-xs"
                        >
                            <RotateCcw className="h-3 w-3 mr-2" />
                            Reset to Default
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
