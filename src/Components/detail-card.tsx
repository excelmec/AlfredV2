import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

interface DetailItem {
  label: string;
  value: ReactNode;
}

interface DetailCardProps {
  title?: string;
  description?: string;
  items: DetailItem[];
  columns?: 1 | 2 | 3;
  className?: string;
  actions?: ReactNode;
}

const colClass = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' } as const;

/** A card that lays out label/value pairs, used by every "view" page */
export function DetailCard({
  title,
  description,
  items,
  columns = 2,
  className,
  actions,
}: DetailCardProps) {
  return (
    <Card className={className}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions}
        </CardHeader>
      )}
      <CardContent>
        <dl className={cn('grid gap-x-6 gap-y-4', colClass[columns])}>
          {items.map((item) => (
            <div key={item.label} className="min-w-0 space-y-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {item.label}
              </dt>
              <dd className="text-sm font-medium break-words">
                {item.value === null || item.value === undefined || item.value === '' ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
