import type { ReactNode } from 'react';
import { Button } from '@/Components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RowActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'primary' | 'destructive';
  disabled?: boolean;
}

/** Icon button with a tooltip, used inside the actions column of a DataTable */
export function RowAction({ icon, label, onClick, tone = 'default', disabled }: RowActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn(
            tone === 'primary' && 'text-primary hover:bg-primary/10 hover:text-primary',
            tone === 'destructive' &&
              'text-destructive hover:bg-destructive/10 hover:text-destructive',
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
