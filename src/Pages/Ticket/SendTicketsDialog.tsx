import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import type { IDistributionResponse } from 'Hooks/Ticket/useSendTickets';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Spinner } from '@/Components/ui/spinner';

interface SendTicketsDialogProps {
  /** Name of the proshow / marathon event, or null when closed */
  title: string | null;
  /** Tickets that will be emailed (not yet sent, plus previously failed) */
  pending: number;
  sending: boolean;
  error: string;
  result: IDistributionResponse | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function SendTicketsDialog({
  title,
  pending,
  sending,
  error,
  result,
  onConfirm,
  onClose,
}: SendTicketsDialogProps) {
  const done = !!result;

  return (
    <Dialog open={title !== null} onOpenChange={(open) => !open && !sending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send tickets</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        {!done && !error && (
          <p className="text-sm">
            This will email a ticket with its QR code to <strong>{pending}</strong> attendee
            {pending === 1 ? '' : 's'} who {pending === 1 ? "hasn't" : "haven't"} received one yet
            (including any whose earlier email failed). Tickets already emailed are not sent again.
          </p>
        )}

        {error && (
          <Alert variant="destructive">
            <WarningCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircleIcon />
            <AlertTitle>{result.message}</AlertTitle>
            <AlertDescription>
              Emails are sent in the background; refresh in a few minutes to see updated counts.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            {done ? 'Close' : 'Cancel'}
          </Button>
          {!done && (
            <Button onClick={onConfirm} disabled={sending || pending === 0}>
              {sending && <Spinner />}
              Send {pending} ticket{pending === 1 ? '' : 's'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
