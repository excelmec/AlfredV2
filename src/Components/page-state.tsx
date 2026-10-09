import type { ReactNode } from 'react';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Spinner } from '@/Components/ui/spinner';

export function PageLoading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-2 py-16 text-muted-foreground">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PageError({
  title = 'Something went wrong',
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <Alert variant="destructive" className="max-w-xl">
      <WarningCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  );
}
