import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloppyDiskIcon, XIcon } from '@phosphor-icons/react';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Spinner } from '@/Components/ui/spinner';

interface SaveToolbarProps {
  onSave: () => void | Promise<void>;
  hasUnsavedChanges: boolean;
  saving: boolean;
}

/**
 * Sticky save/cancel bar shared by every create and edit page.
 * Warns before leaving the page (cancel button or tab close) while there are unsaved changes.
 */
export default function SaveToolbar({ onSave, hasUnsavedChanges, saving }: SaveToolbarProps) {
  const navigate = useNavigate();
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  return (
    <div className="sticky top-0 z-10 -mx-1 flex items-center gap-2 rounded-xl border bg-card/90 px-4 py-2.5 shadow-sm backdrop-blur">
      {hasUnsavedChanges ? (
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
          Unsaved changes
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">No changes yet</span>
      )}
      <div className="flex-1" />
      <Button
        variant="outline"
        disabled={saving}
        onClick={() => (hasUnsavedChanges ? setConfirmExitOpen(true) : navigate(-1))}
      >
        <XIcon /> Cancel
      </Button>
      <Button onClick={onSave} disabled={saving}>
        {saving ? <Spinner /> : <FloppyDiskIcon />}
        {saving ? 'Saving...' : 'Save'}
      </Button>

      <ConfirmDialog
        open={confirmExitOpen}
        title="Discard changes?"
        description="You have unsaved changes. Do you want to exit?"
        confirmLabel="Exit"
        destructive
        onCancel={() => setConfirmExitOpen(false)}
        onConfirm={() => {
          setConfirmExitOpen(false);
          navigate(-1);
        }}
      />
    </div>
  );
}
